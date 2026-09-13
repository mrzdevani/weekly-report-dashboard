# Weekly Report Dashboard

Web dashboard untuk membantu melihat dan menyajikan data laporan mingguan tanpa perlu mengambil data secara manual dari Excel ke PowerPoint.

Data dari Excel dapat diupload ke dashboard, kemudian sistem akan menampilkan ringkasan, grafik, dan data per wilayah secara otomatis.

## Features

- Upload laporan mingguan dari file Excel
- Menampilkan total data dan rata-rata utilization
- Monitoring high utilization dengan threshold ≥80%
- Grafik high utilization per wilayah
- Weekly utilization trend
- Utilization distribution
- Halaman data per wilayah:
  - Bali
  - NTB
  - NTT
  - Jawa Timur
- Search, filter, dan sorting data
- Penyimpanan data menggunakan Supabase

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- SheetJS
- Supabase

## Getting Started

Install dependencies:

```bash
npm install