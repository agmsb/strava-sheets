import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strava Sheets - Google Sheets Sync & Activity Dashboard',
  description: 'Sync, format, and export your Strava ride data and segment efforts directly for Google Sheets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
