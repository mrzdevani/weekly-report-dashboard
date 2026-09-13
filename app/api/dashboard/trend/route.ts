import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || undefined;

    const trend = await DataStore.getWeeklyTrend(province);

    const response: ApiResponse = {
      success: true,
      data: trend,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching trend data:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Internal Server Error',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
