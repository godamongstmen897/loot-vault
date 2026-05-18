import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Loot Vault — Gamified DeFi',
  description: 'A gamified DeFi ecosystem on Stellar Soroban',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a12] text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
