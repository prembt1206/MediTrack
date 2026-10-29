import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const messinaSans = Inter({
  variable: '--font-messina-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
});

const untitledSerif = Source_Serif_4({
  variable: '--font-untitled-serif',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  title: 'MediTrack - Real-Time Medicine Availability & AI Prescription Marketplace',
  description:
    'Dual-sided healthcare marketplace connecting patients with local pharmacies in real-time. Features Gemini Vision prescription OCR and multilingual AI assistance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${messinaSans.variable} ${untitledSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f7f7f7] text-[#393737] selection:bg-[#393737] selection:text-white font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
