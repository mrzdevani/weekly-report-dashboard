import { ApiResponse, DashboardSummary, DistributionDataPoint, RegionHighUtilData, TrendDataPoint, UtilizationData } from '@/types';

export interface DashboardResponseData {
  summary: DashboardSummary;
  items: UtilizationData[];
  regionComparison: RegionHighUtilData[];
  distribution: DistributionDataPoint[];
  trend: TrendDataPoint[];
}

export async function getDashboardData(params?: {
  province?: string;
  search?: string;
  week?: string;
}): Promise<DashboardResponseData> {
  const query = new URLSearchParams();
  if (params?.province) query.set('province', params.province);
  if (params?.search) query.set('search', params.search);
  if (params?.week) query.set('week', params.week);

  const res = await fetch(`/api/dashboard?${query.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard data: ${res.statusText}`);
  }

  const json: ApiResponse<DashboardResponseData> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Unknown error occurred');
  }

  return json.data;
}

export async function getTrendData(province?: string): Promise<TrendDataPoint[]> {
  const query = new URLSearchParams();
  if (province) query.set('province', province);

  const res = await fetch(`/api/dashboard/trend?${query.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch trend data: ${res.statusText}`);
  }

  const json: ApiResponse<TrendDataPoint[]> = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Unknown error occurred');
  }

  return json.data;
}

export async function uploadExcelReport(file: File): Promise<{
  reportId: string;
  fileName: string;
  reportPeriod: string;
  totalRows: number;
  processedRows: number;
  detectedWeeks: string[];
  warnings?: string[];
}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/reports/upload', {
    method: 'POST',
    body: formData,
  });

  const json: ApiResponse = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Gagal mengunggah laporan Excel');
  }

  return json.data;
}
