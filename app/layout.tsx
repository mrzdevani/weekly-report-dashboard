import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MW Link Weekly Report Dashboard',
  description: 'Internal Microwave Link Weekly Report & Utilization Analytics Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
