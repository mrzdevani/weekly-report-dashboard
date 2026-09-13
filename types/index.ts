export interface Report {
  id: string;
  file_name: string;
  uploaded_at: string;
  report_period?: string;
  total_rows?: number;
  processed_rows?: number;
}

export interface WeeklyUtilization {
  id?: string;
  utilization_data_id?: string;
  week: string; // e.g., "W31", "W34"
  utilization_value: number | null; // numeric float if parsed successfully
  utilization_level: string | null; // categorical string if not numeric (e.g., "Medium", "High")
  created_at?: string;
}

export interface UtilizationData {
  id: string;
  report_id?: string;
  link_id: string;
  ref_link_id?: string;
  region: string;
  province: string;
  micro_cluster?: string;
  site_name?: string;
  transport_type?: string;
  util_avg: number | null; // Current week's numeric util avg
  status: 'High' | 'Warning' | 'Normal' | 'Unknown';
  created_at?: string;
  weekly_history?: WeeklyUtilization[];
}

export interface DashboardSummary {
  totalLinks: number;
  highUtilizationCount: number; // >= 80% (numeric only)
  normalUtilizationCount: number; // < 80% (numeric only)
  warningUtilizationCount?: number; // 70-79%
  averageUtilization: number; // mean of numeric values
  numericDataCount: number;
  categoricalOnlyCount: number;
  latestWeek: string;
  detectedWeeks: string[];
}

export interface TrendDataPoint {
  week: string;
  averageUtilization: number;
  highUtilCount: number;
  totalLinks: number;
  baliAvg?: number;
  ntbAvg?: number;
  nttAvg?: number;
  jawaTimurAvg?: number;
}

export interface DistributionDataPoint {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RegionHighUtilData {
  region: string;
  regionSlug: string;
  highCount: number;
  totalLinks: number;
  avgUtil: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ExcelDetectedColumn {
  originalHeader: string;
  normalizedKey: string;
  weekToken?: string;
  isNumericWeek: boolean;
  isCategoricalWeek: boolean;
}

export interface ExcelParseResult {
  fileName: string;
  reportPeriod: string;
  detectedWeeks: string[];
  numericWeekCol?: string;
  totalRows: number;
  validRows: number;
  errors: string[];
  items: UtilizationData[];
}
