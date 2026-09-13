import { NextRequest, NextResponse } from 'next/server';
import { parseExcelBuffer } from '@/utils/excelParser';
import { DataStore } from '@/lib/dataStore';
import { ApiResponse, Report } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      const response: ApiResponse = {
        success: false,
        error: 'Tidak ada file yang diunggah. Silakan pilih file Excel (.xlsx atau .xls).',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const fileName = file.name;
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    if (!isExcel) {
      const response: ApiResponse = {
        success: false,
        error: 'Format file tidak didukung. Harap unggah file dengan format .xlsx atau .xls.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel with dynamic week column detector
    const parseResult = parseExcelBuffer(buffer, fileName);

    if (parseResult.errors.length > 0 && parseResult.validRows === 0) {
      const response: ApiResponse = {
        success: false,
        error: parseResult.errors.join(' | '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create Report metadata with UUID
    const reportId = crypto.randomUUID();
    const report: Report = {
      id: reportId,
      file_name: fileName,
      uploaded_at: new Date().toISOString(),
      report_period: parseResult.reportPeriod,
      total_rows: parseResult.totalRows,
      processed_rows: parseResult.validRows,
    };

    // Assign report_id to items
    const itemsWithReport = parseResult.items.map((item) => ({
      ...item,
      report_id: reportId,
    }));

    // Save into DataStore (Supabase or in-memory)
    const saveResult = await DataStore.saveReport(report, itemsWithReport);

    const response: ApiResponse = {
      success: true,
      data: {
        reportId: saveResult.reportId,
        fileName: report.file_name,
        reportPeriod: report.report_period,
        totalRows: parseResult.totalRows,
        processedRows: parseResult.validRows,
        detectedWeeks: parseResult.detectedWeeks,
        warnings: parseResult.errors,
      },
      message: `Berhasil memproses ${parseResult.validRows} data microwave link untuk periode ${parseResult.reportPeriod}.`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error handling report upload:', error);
    const response: ApiResponse = {
      success: false,
      error: `Terjadi kesalahan saat memproses laporan: ${error.message || String(error)}`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
