import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TANK CLUB Ranking",
  description: "Poker tournament ranking dashboard for TANK CLUB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
