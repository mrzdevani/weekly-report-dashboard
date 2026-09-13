import * as XLSX from 'xlsx';
import { ExcelParseResult, UtilizationData, WeeklyUtilization } from '@/types';
import { getUtilizationStatus } from '@/lib/config';

interface RawRow {
  [key: string]: any;
}

// Regex to capture week tokens like W31, W32, W34, W1, etc.
const WEEK_REGEX = /\bW(\d+)\b/i;

export function parseExcelBuffer(
  buffer: ArrayBuffer | Buffer,
  fileName: string
): ExcelParseResult {
  const result: ExcelParseResult = {
    fileName,
    reportPeriod: '',
    detectedWeeks: [],
    totalRows: 0,
    validRows: 0,
    errors: [],
    items: [],
  };

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      result.errors.push('File Excel tidak memiliki sheet yang valid.');
      return result;
    }

    // Find best sheet: preference for Sheet2 if available, or first sheet with Site ID / Link ID
    let targetSheetName = workbook.SheetNames[0];
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { header: 1 });
      if (rows.length > 0) {
        const headerRow = (rows[0] as string[]) || [];
        const hasSiteId = headerRow.some((h) =>
          typeof h === 'string' && /site\s*id|link\s*id/i.test(h)
        );
        const hasWeek = headerRow.some((h) =>
          typeof h === 'string' && WEEK_REGEX.test(h)
        );
        if (hasSiteId && hasWeek) {
          targetSheetName = name;
          break;
        }
      }
    }

    const worksheet = workbook.Sheets[targetSheetName];
    const rawData = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: null });

    if (!rawData || rawData.length === 0) {
      result.errors.push('Sheet Excel terpilih kosong.');
      return result;
    }

    result.totalRows = rawData.length;

    // Detect column headers from first row keys
    const firstRow = rawData[0];
    const headers = Object.keys(firstRow);

    // Identify standard fields
    const siteIdKey = headers.find((h) => /^site\s*id|^link\s*id/i.test(h.trim()));
    const refLinkIdKey = headers.find((h) => /ref\s*link\s*id/i.test(h.trim()));
    const provinceKey = headers.find((h) => /^province/i.test(h.trim()));
    const regionKey = headers.find((h) => /^region/i.test(h.trim()));
    const microClusterKey = headers.find((h) => /micro\s*cluster/i.test(h.trim()));
    const siteNameKey = headers.find((h) => /site\s*name/i.test(h.trim()));
    const transportTypeKey = headers.find((h) => /transport\s*type/i.test(h.trim()));

    // Validation: check for required columns
    if (!siteIdKey) {
      result.errors.push('Terdapat kolom yang diperlukan tetapi tidak ditemukan: Site ID / Link ID.');
      return result;
    }
    if (!provinceKey && !regionKey) {
      result.errors.push('Terdapat kolom yang diperlukan tetapi tidak ditemukan: Province / Region.');
      return result;
    }

    // Dynamic detection of Week columns
    const detectedWeekCols: {
      headerKey: string;
      weekToken: string;
      isExplicitNumericHeader: boolean;
      weekNumber: number;
    }[] = [];

    const weekSet = new Set<string>();

    for (const h of headers) {
      const match = h.match(WEEK_REGEX);
      if (match) {
        const weekToken = `W${match[1]}`;
        weekSet.add(weekToken);
        const isNumericHeader = /util\s*avg|utilization\s*avg|util\s*\(%/i.test(h) && !/avg\s*utilization/i.test(h);
        detectedWeekCols.push({
          headerKey: h,
          weekToken,
          isExplicitNumericHeader: isNumericHeader,
          weekNumber: parseInt(match[1], 10),
        });
      }
    }

    if (detectedWeekCols.length === 0) {
      result.errors.push('Format Excel tidak sesuai: Tidak ditemukan kolom mingguan (W{n}).');
      return result;
    }

    // Sort detected weeks chronologically
    const sortedWeeks = Array.from(weekSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    result.detectedWeeks = sortedWeeks;
    const latestWeek = sortedWeeks[sortedWeeks.length - 1] || 'W0';
    result.reportPeriod = latestWeek;

    // Process each row
    const items: UtilizationData[] = [];

    rawData.forEach((row, index) => {
      const siteId = row[siteIdKey]?.toString().trim();
      if (!siteId) return; // Skip empty rows

      const refLinkId = refLinkIdKey ? row[refLinkIdKey]?.toString().trim() : undefined;
      const province = provinceKey ? (row[provinceKey]?.toString().trim() || '') : '';
      const region = regionKey ? (row[regionKey]?.toString().trim() || '') : '';
      const microCluster = microClusterKey ? row[microClusterKey]?.toString().trim() : '';
      const siteName = siteNameKey ? row[siteNameKey]?.toString().trim() : '';
      const transportType = transportTypeKey ? row[transportTypeKey]?.toString().trim() : '';

      const weeklyHistory: WeeklyUtilization[] = [];
      let latestNumericUtil: number | null = null;
      let latestCategoricalLevel: string | null = null;

      for (const col of detectedWeekCols) {
        const rawVal = row[col.headerKey];
        if (rawVal === undefined || rawVal === null) continue;

        const strVal = String(rawVal).trim();
        if (strVal === '' || strVal === '#N/A' || strVal === 'N/A' || strVal === '-' || strVal === '#VALUE!') {
          continue;
        }

        // Try parseFloat
        const numVal = typeof rawVal === 'number' ? rawVal : parseFloat(strVal);
        const isValidNumber = !isNaN(numVal) && !isNaN(Number(strVal));

        if (isValidNumber) {
          weeklyHistory.push({
            week: col.weekToken,
            utilization_value: Number(numVal.toFixed(2)),
            utilization_level: null,
          });
          // Update current week's numeric utilization if it matches latest week or is numeric column
          if (col.weekToken === latestWeek || latestNumericUtil === null) {
            latestNumericUtil = Number(numVal.toFixed(2));
          }
        } else {
          // Categorical value (e.g. "Low", "Medium", "High", "Critical-2")
          weeklyHistory.push({
            week: col.weekToken,
            utilization_value: null,
            utilization_level: strVal,
          });
          if (col.weekToken === latestWeek || latestCategoricalLevel === null) {
            latestCategoricalLevel = strVal;
          }
        }
      }

      const status = getUtilizationStatus(latestNumericUtil, latestCategoricalLevel);

      const item: UtilizationData = {
        id: crypto.randomUUID(),
        link_id: siteId,
        ref_link_id: refLinkId || siteId,
        region: region || 'BALI NUSRA',
        province: province || region,
        micro_cluster: microCluster || '-',
        site_name: siteName || siteId,
        transport_type: transportType || '-',
        util_avg: latestNumericUtil,
        status: status,
        weekly_history: weeklyHistory,
        created_at: new Date().toISOString(),
      };

      items.push(item);
    });

    result.items = items;
    result.validRows = items.length;

    if (items.length === 0) {
      result.errors.push('Tidak ada baris data microwave link yang berhasil diproses.');
    }
  } catch (err: any) {
    result.errors.push(`Gagal memproses file Excel: ${err.message || String(err)}`);
  }

  return result;
}
