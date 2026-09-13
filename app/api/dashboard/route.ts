import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || undefined;
    const search = searchParams.get('search') || undefined;
    const week = searchParams.get('week') || undefined;

    const [summary, items, regionComparison, distribution, trend] = await Promise.all([
      DataStore.getSummary(province),
      DataStore.getUtilizationData({ provinceSlug: province, search, week }),
      DataStore.getRegionComparison(),
      DataStore.getDistribution(province),
      DataStore.getWeeklyTrend(province),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        summary,
        items,
        regionComparison,
        distribution,
        trend,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Internal Server Error',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
