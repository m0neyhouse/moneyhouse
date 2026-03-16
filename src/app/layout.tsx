import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sign & Pay — Contratos Digitais',
  description: 'Assine contratos e realize pagamentos de forma simples e segura.',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
