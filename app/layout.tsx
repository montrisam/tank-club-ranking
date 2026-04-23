import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TANK CLUB',
  description: 'TANK CLUB ranking and events website prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
