'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { uploadExcelReport } from '@/services/api';
import Link from 'next/link';

interface UploadResult {
  reportId: string;
  fileName: string;
  reportPeriod: string;
  totalRows: number;
  processedRows: number;
  detectedWeeks: string[];
  warnings?: string[];
}

export const UploadDropzone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setResult(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const isExcel =
      selectedFile.name.endsWith('.xlsx') ||
      selectedFile.name.endsWith('.xls') ||
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      selectedFile.type === 'application/vnd.ms-excel';

    if (!isExcel) {
      setError('Format file tidak didukung. Harap pilih file dengan format .xlsx atau .xls.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await uploadExcelReport(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah file laporan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Unggah Laporan Mingguan Baru</h3>
        <p className="text-xs text-slate-500 mb-5">
          Pilih atau seret file tracker Excel (.xlsx / .xls) untuk memproses utilisasi MW link secara otomatis.
        </p>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : file
              ? 'border-emerald-300 bg-emerald-50/30'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />

          <div className="flex flex-col items-center">
            {file ? (
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-700 mb-3">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
            ) : (
              <div className="p-3 bg-blue-100 rounded-full text-blue-700 mb-3">
                <UploadCloud className="w-8 h-8" />
              </div>
            )}

            {file ? (
              <div>
                <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Klik untuk ganti file
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Tarik & lepas file Excel di sini, atau{' '}
                  <span className="text-blue-600 underline underline-offset-2">pilih file</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Mendukung format .xlsx dan .xls</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex items-center justify-end gap-3">
          {file && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Batalkan
            </button>
          )}

          <button
            type="button"
            disabled={!file || isLoading}
            onClick={handleUpload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Excel...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Mulai Proses & Simpan Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Proses Unggah Gagal</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Success Result Box */}
      {result && (
        <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Laporan Berhasil Diproses!</h4>
              <p className="text-xs text-slate-500">
                Data telah tersimpan dan dashboard telah diperbarui dengan data terkini.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Periode Terdeteksi</p>
              <p className="text-sm font-bold text-blue-700">{result.reportPeriod}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Total Baris</p>
              <p className="text-sm font-bold text-slate-800">{result.totalRows} baris</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Data Berhasil Diproses</p>
              <p className="text-sm font-bold text-emerald-600">{result.processedRows} link</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Kolom Minggu</p>
              <p className="text-xs font-mono font-bold text-slate-700">
                {result.detectedWeeks.join(', ')}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span>Buka Dashboard Overview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Info Card on Structure Requirements */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Panduan Struktur Format Excel</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
          <li>
            Pastikan file Excel memiliki kolom <strong>Site ID / Link ID</strong> dan <strong>Province / Region</strong>.
          </li>
          <li>
            Sistem secara otomatis mendeteksi kolom mingguan dinamis yang mengandung pola <code className="bg-slate-200 px-1 rounded font-mono">W{'{n}'}</code> (contoh: <code className="bg-slate-200 px-1 rounded font-mono">Util AVG W34</code>, <code className="bg-slate-200 px-1 rounded font-mono">AVG Utilization W31</code>).
          </li>
          <li>
            Kolom numerik (<code className="bg-slate-200 px-1 rounded font-mono">Util AVG W34</code>) dihitung otomatis untuk threshold High Utilization (&ge;80%).
          </li>
          <li>
            Kolom status kategorikal (<code className="bg-slate-200 px-1 rounded font-mono">Low, Medium, High, #N/A</code>) disimpan sebagai riwayat level historis.
          </li>
        </ul>
      </div>
    </div>
  );
};
