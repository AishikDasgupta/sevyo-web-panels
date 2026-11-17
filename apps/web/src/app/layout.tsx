import { Providers } from '@/components/providers';
import { Figtree, Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sevyo — Professional Care at Home',
    template: '%s · Sevyo',
  },
  description:
    'Book trusted nurses, attendants, and home healthcare professionals — within minutes, no waiting rooms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${figtree.variable}`}>
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}