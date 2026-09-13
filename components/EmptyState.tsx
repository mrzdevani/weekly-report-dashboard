import React from 'react';
import { Database, UploadCloud } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showUploadButton?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak ada data untuk region ini.',
  description = 'Silakan upload file laporan Excel mingguan untuk melihat analisis data.',
  showUploadButton = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
      <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
        <Database className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-6">{description}</p>
      {showUploadButton && (
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Report Excel</span>
        </Link>
      )}
    </div>
  );
};
