'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { UploadDropzone } from '@/components/UploadDropzone';
import { Report } from '@/types';
import { DataStore } from '@/lib/dataStore';
import { FileSpreadsheet, Calendar, Layers, Clock } from 'lucide-react';

export default function UploadPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      const json = await res.json();
      // If we want recent report list
    } catch (e) {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Upload Report Mingguan"
        subtitle="Unggah data Excel tracker microwave link untuk memperbarui database dan analisis dashboard"
        period="Upload Baru"
      />

      <main className="flex-1 p-8 space-y-6 max-w-5xl">
        <UploadDropzone />
      </main>
    </div>
  );
}
