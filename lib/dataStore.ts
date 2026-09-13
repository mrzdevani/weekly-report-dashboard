import { supabase, isSupabaseConfigured } from './supabase';
import { DUMMY_REPORT, DUMMY_UTILIZATION_DATA } from './dummyData';
import {
  Report,
  UtilizationData,
  WeeklyUtilization,
  DashboardSummary,
  TrendDataPoint,
  DistributionDataPoint,
  RegionHighUtilData,
} from '@/types';
import { HIGH_UTILIZATION_THRESHOLD, WARNING_UTILIZATION_THRESHOLD } from './config';
import { matchRegionSlug } from '@/utils/regionMatcher';

// In-memory runtime store initialized with dummy data
let inMemoryReports: Report[] = [{ ...DUMMY_REPORT }];
let inMemoryData: UtilizationData[] = [...DUMMY_UTILIZATION_DATA];

export class DataStore {
  // Get all reports
  static async getReports(): Promise<Report[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (error) {
          console.error('[DataStore] Supabase getReports error:', error);
          throw error;
        }
        return (data as Report[]) || [];
      } catch (err) {
        console.warn('[DataStore] Failed to query Supabase reports, using in-memory store:', err);
        return inMemoryReports;
      }
    }
    return inMemoryReports;
  }

  // Get raw utilization data filtered by region/province
  static async getUtilizationData(options?: {
    provinceSlug?: string;
    search?: string;
    highUtilOnly?: boolean;
    week?: string;
  }): Promise<UtilizationData[]> {
    let dataset: UtilizationData[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('utilization_data')
          .select(`
            *,
            weekly_history:weekly_utilization(*)
          `)
          .order('util_avg', { ascending: false, nullsFirst: false });

        if (error) {
          console.error('[DataStore] Supabase getUtilizationData error:', error);
          throw error;
        }

        dataset = (data as UtilizationData[]) || [];
      } catch (err) {
        console.warn('[DataStore] Failed to query Supabase data, using in-memory store:', err);
        dataset = inMemoryData;
      }
    } else {
      dataset = inMemoryData;
    }

    // Apply Region / Province Filter
    if (options?.provinceSlug && options.provinceSlug !== 'overview' && options.provinceSlug !== 'all') {
      const targetSlug = options.provinceSlug.toLowerCase();
      dataset = dataset.filter((item) => {
        const matched = matchRegionSlug(item.province, item.region);
        return matched === targetSlug;
      });
    }

    // Apply High Util Filter
    if (options?.highUtilOnly) {
      dataset = dataset.filter(
        (item) => typeof item.util_avg === 'number' && item.util_avg >= HIGH_UTILIZATION_THRESHOLD
      );
    }

    // Apply Search Filter
    if (options?.search && options.search.trim() !== '') {
      const q = options.search.toLowerCase().trim();
      dataset = dataset.filter(
        (item) =>
          item.link_id.toLowerCase().includes(q) ||
          (item.ref_link_id && item.ref_link_id.toLowerCase().includes(q)) ||
          (item.site_name && item.site_name.toLowerCase().includes(q)) ||
          (item.micro_cluster && item.micro_cluster.toLowerCase().includes(q)) ||
          (item.province && item.province.toLowerCase().includes(q))
      );
    }

    // Sort: High Utilization (util_avg >= 80) prioritized at the top, then descending util_avg
    return [...dataset].sort((a, b) => {
      const valA = typeof a.util_avg === 'number' ? a.util_avg : -1;
      const valB = typeof b.util_avg === 'number' ? b.util_avg : -1;
      return valB - valA;
    });
  }

  // Get Summary Metrics
  static async getSummary(provinceSlug?: string): Promise<DashboardSummary> {
    const data = await this.getUtilizationData({ provinceSlug });

    let highCount = 0;
    let normalCount = 0;
    let warningCount = 0;
    let numericCount = 0;
    let categoricalOnlyCount = 0;
    let sumNumericUtil = 0;

    const weekSet = new Set<string>();

    data.forEach((item) => {
      if (item.weekly_history) {
        item.weekly_history.forEach((w) => {
          if (w.week) weekSet.add(w.week);
        });
      }

      if (typeof item.util_avg === 'number' && !isNaN(item.util_avg)) {
        numericCount += 1;
        sumNumericUtil += item.util_avg;
        if (item.util_avg >= HIGH_UTILIZATION_THRESHOLD) {
          highCount += 1;
        } else if (item.util_avg >= WARNING_UTILIZATION_THRESHOLD) {
          warningCount += 1;
          normalCount += 1;
        } else {
          normalCount += 1;
        }
      } else {
        categoricalOnlyCount += 1;
      }
    });

    const detectedWeeks = Array.from(weekSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    const latestWeek = detectedWeeks.length > 0 ? detectedWeeks[detectedWeeks.length - 1] : 'W34';
    const averageUtilization = numericCount > 0 ? Number((sumNumericUtil / numericCount).toFixed(2)) : 0;

    return {
      totalLinks: data.length,
      highUtilizationCount: highCount,
      normalUtilizationCount: normalCount,
      warningUtilizationCount: warningCount,
      averageUtilization,
      numericDataCount: numericCount,
      categoricalOnlyCount,
      latestWeek,
      detectedWeeks: detectedWeeks.length > 0 ? detectedWeeks : ['W31', 'W32', 'W33', 'W34'],
    };
  }

  // Get Weekly Trend Data (accumulated across weeks)
  static async getWeeklyTrend(provinceSlug?: string): Promise<TrendDataPoint[]> {
    const data = await this.getUtilizationData({ provinceSlug });

    // Collect all historical points
    const weekMap = new Map<
      string,
      {
        totalLinks: number;
        numericCount: number;
        sumNumeric: number;
        highCount: number;
        baliSum: number;
        baliCount: number;
        ntbSum: number;
        ntbCount: number;
        nttSum: number;
        nttCount: number;
        jatimSum: number;
        jatimCount: number;
      }
    >();

    // Initialize with standard weeks if available
    ['W31', 'W32', 'W33', 'W34'].forEach((w) => {
      weekMap.set(w, {
        totalLinks: 0,
        numericCount: 0,
        sumNumeric: 0,
        highCount: 0,
        baliSum: 0,
        baliCount: 0,
        ntbSum: 0,
        ntbCount: 0,
        nttSum: 0,
        nttCount: 0,
        jatimSum: 0,
        jatimCount: 0,
      });
    });

    data.forEach((item) => {
      const regionSlug = matchRegionSlug(item.province, item.region);

      if (item.weekly_history && item.weekly_history.length > 0) {
        item.weekly_history.forEach((wh) => {
          if (!weekMap.has(wh.week)) {
            weekMap.set(wh.week, {
              totalLinks: 0,
              numericCount: 0,
              sumNumeric: 0,
              highCount: 0,
              baliSum: 0,
              baliCount: 0,
              ntbSum: 0,
              ntbCount: 0,
              nttSum: 0,
              nttCount: 0,
              jatimSum: 0,
              jatimCount: 0,
            });
          }

          const entry = weekMap.get(wh.week)!;
          entry.totalLinks += 1;

          // Estimate or actual value
          let val = wh.utilization_value;
          if (val === null && wh.utilization_level) {
            const lvl = wh.utilization_level.toLowerCase();
            if (lvl.includes('critical') || lvl.includes('high')) val = 85;
            else if (lvl.includes('medium')) val = 65;
            else if (lvl.includes('low')) val = 45;
          }

          if (typeof val === 'number') {
            entry.numericCount += 1;
            entry.sumNumeric += val;
            if (val >= HIGH_UTILIZATION_THRESHOLD) {
              entry.highCount += 1;
            }

            if (regionSlug === 'bali') {
              entry.baliSum += val;
              entry.baliCount += 1;
            } else if (regionSlug === 'ntb') {
              entry.ntbSum += val;
              entry.ntbCount += 1;
            } else if (regionSlug === 'ntt') {
              entry.nttSum += val;
              entry.nttCount += 1;
            } else if (regionSlug === 'jawa-timur') {
              entry.jatimSum += val;
              entry.jatimCount += 1;
            }
          }
        });
      } else if (typeof item.util_avg === 'number') {
        const latest = 'W34';
        const entry = weekMap.get(latest)!;
        entry.totalLinks += 1;
        entry.numericCount += 1;
        entry.sumNumeric += item.util_avg;
        if (item.util_avg >= HIGH_UTILIZATION_THRESHOLD) entry.highCount += 1;
      }
    });

    const result: TrendDataPoint[] = [];

    const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    sortedWeeks.forEach((wk) => {
      const e = weekMap.get(wk)!;
      if (e.totalLinks > 0 || e.numericCount > 0) {
        result.push({
          week: wk,
          averageUtilization: e.numericCount > 0 ? Number((e.sumNumeric / e.numericCount).toFixed(2)) : 0,
          highUtilCount: e.highCount,
          totalLinks: e.totalLinks,
          baliAvg: e.baliCount > 0 ? Number((e.baliSum / e.baliCount).toFixed(2)) : undefined,
          ntbAvg: e.ntbCount > 0 ? Number((e.ntbSum / e.ntbCount).toFixed(2)) : undefined,
          nttAvg: e.nttCount > 0 ? Number((e.nttSum / e.nttCount).toFixed(2)) : undefined,
          jawaTimurAvg: e.jatimCount > 0 ? Number((e.jatimSum / e.jatimCount).toFixed(2)) : undefined,
        });
      }
    });

    return result;
  }

  // Get Utilization Distribution (<50%, 50-69%, 70-79%, >=80%)
  static async getDistribution(provinceSlug?: string): Promise<DistributionDataPoint[]> {
    const data = await this.getUtilizationData({ provinceSlug });

    let under50 = 0;
    let range50to69 = 0;
    let range70to79 = 0;
    let over80 = 0;
    let totalCount = 0;

    data.forEach((item) => {
      if (typeof item.util_avg === 'number' && !isNaN(item.util_avg)) {
        totalCount += 1;
        if (item.util_avg < 50) under50 += 1;
        else if (item.util_avg < 70) range50to69 += 1;
        else if (item.util_avg < 80) range70to79 += 1;
        else over80 += 1;
      }
    });

    if (totalCount === 0) totalCount = 1; // Prevent division by 0

    return [
      {
        range: '< 50% (Low)',
        count: under50,
        percentage: Number(((under50 / totalCount) * 100).toFixed(1)),
        color: '#10b981', // green
      },
      {
        range: '50% - 69% (Normal)',
        count: range50to69,
        percentage: Number(((range50to69 / totalCount) * 100).toFixed(1)),
        color: '#3b82f6', // blue
      },
      {
        range: '70% - 79% (Warning)',
        count: range70to79,
        percentage: Number(((range70to79 / totalCount) * 100).toFixed(1)),
        color: '#f59e0b', // amber
      },
      {
        range: '>= 80% (High)',
        count: over80,
        percentage: Number(((over80 / totalCount) * 100).toFixed(1)),
        color: '#ef4444', // red
      },
    ];
  }

  // Get High Utilization counts by Region
  static async getRegionComparison(): Promise<RegionHighUtilData[]> {
    const allData = await this.getUtilizationData();

    const regions: { name: string; slug: string }[] = [
      { name: 'Bali', slug: 'bali' },
      { name: 'NTB', slug: 'ntb' },
      { name: 'NTT', slug: 'ntt' },
      { name: 'Jawa Timur', slug: 'jawa-timur' },
    ];

    return regions.map((r) => {
      const regionItems = allData.filter((item) => matchRegionSlug(item.province, item.region) === r.slug);
      let highCount = 0;
      let sumNumeric = 0;
      let numericCount = 0;

      regionItems.forEach((item) => {
        if (typeof item.util_avg === 'number' && !isNaN(item.util_avg)) {
          numericCount += 1;
          sumNumeric += item.util_avg;
          if (item.util_avg >= HIGH_UTILIZATION_THRESHOLD) {
            highCount += 1;
          }
        }
      });

      return {
        region: r.name,
        regionSlug: r.slug,
        highCount,
        totalLinks: regionItems.length,
        avgUtil: numericCount > 0 ? Number((sumNumeric / numericCount).toFixed(2)) : 0,
      };
    });
  }

  // Save new report and parsed rows
  static async saveReport(
    report: Report,
    items: UtilizationData[]
  ): Promise<{ success: boolean; reportId: string; count: number; error?: string }> {
    // 1. If Supabase is connected, write to Supabase with error propagation
    if (isSupabaseConfigured() && supabase) {
      console.log(`[DataStore] Inserting report ${report.id} (${report.file_name}) into Supabase...`);

      // Step 1: Insert report
      const { error: repError } = await supabase
        .from('reports')
        .insert({
          id: report.id,
          file_name: report.file_name,
          report_period: report.report_period,
          total_rows: report.total_rows,
          processed_rows: report.processed_rows,
        });

      if (repError) {
        console.error('[DataStore] Supabase insert report error:', repError);
        throw new Error(`Gagal menyimpan laporan ke tabel 'reports': ${repError.message} (${repError.details || repError.hint || ''})`);
      }

      // Step 2: Insert utilization_data in batches of 250
      const dbItems = items.map((item) => ({
        id: item.id,
        report_id: report.id,
        link_id: item.link_id,
        ref_link_id: item.ref_link_id || null,
        region: item.region || null,
        province: item.province || null,
        micro_cluster: item.micro_cluster || null,
        site_name: item.site_name || null,
        transport_type: item.transport_type || null,
        util_avg: item.util_avg !== null && !isNaN(Number(item.util_avg)) ? Number(item.util_avg) : null,
        status: item.status || 'Normal',
      }));

      const BATCH_SIZE = 250;
      for (let i = 0; i < dbItems.length; i += BATCH_SIZE) {
        const batch = dbItems.slice(i, i + BATCH_SIZE);
        const { error: dataError } = await supabase.from('utilization_data').insert(batch);
        if (dataError) {
          console.error('[DataStore] Supabase insert utilization_data error:', dataError);
          throw new Error(`Gagal menyimpan data link ke tabel 'utilization_data' (batch ${i}): ${dataError.message} (${dataError.details || dataError.hint || ''})`);
        }
      }

      // Step 3: Insert weekly_utilization in batches of 250
      const weeklyRecords: any[] = [];
      items.forEach((item) => {
        if (item.weekly_history && item.weekly_history.length > 0) {
          item.weekly_history.forEach((wh) => {
            weeklyRecords.push({
              id: crypto.randomUUID(),
              utilization_data_id: item.id,
              week: wh.week,
              utilization_value: wh.utilization_value !== null && !isNaN(Number(wh.utilization_value)) ? Number(wh.utilization_value) : null,
              utilization_level: wh.utilization_level || null,
            });
          });
        }
      });

      if (weeklyRecords.length > 0) {
        for (let i = 0; i < weeklyRecords.length; i += BATCH_SIZE) {
          const batch = weeklyRecords.slice(i, i + BATCH_SIZE);
          const { error: weekError } = await supabase.from('weekly_utilization').insert(batch);
          if (weekError) {
            console.error('[DataStore] Supabase insert weekly_utilization error:', weekError);
            throw new Error(`Gagal menyimpan data mingguan ke tabel 'weekly_utilization' (batch ${i}): ${weekError.message} (${weekError.details || weekError.hint || ''})`);
          }
        }
      }

      console.log(`[DataStore] Successfully saved ${dbItems.length} links and ${weeklyRecords.length} weekly records to Supabase.`);
    }

    // 2. Also keep in-memory data store synchronized
    inMemoryReports.unshift(report);
    const existingIds = new Set(items.map((i) => i.link_id));
    const retainedExisting = inMemoryData.filter((i) => !existingIds.has(i.link_id));
    inMemoryData = [...items, ...retainedExisting];

    return {
      success: true,
      reportId: report.id,
      count: items.length,
    };
  }
}
