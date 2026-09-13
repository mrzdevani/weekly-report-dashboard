import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || undefined;

    const items = await DataStore.getUtilizationData({
      provinceSlug: province,
      highUtilOnly: true,
    });

    const response: ApiResponse = {
      success: true,
      data: items,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching high utilization links:', error);
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Internal Server Error',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
