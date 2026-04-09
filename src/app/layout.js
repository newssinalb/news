import { Geist } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rilindjenews.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Rilindje News — Lajmet e Fundit nga Shqipëria',
    template: '%s | Rilindje News',
  },
  description: 'Lexoni lajmet më të fundit nga Shqipëria dhe bota — politikë, ekonomi, sport, showbiz dhe shumë më tepër.',
  keywords: ['lajme', 'shqipëri', 'albania', 'politikë', 'sport', 'ekonomi', 'aktualitet'],
  authors: [{ name: 'Rilindje News', url: SITE_URL }],
  creator: 'Rilindje News',
  publisher: 'Rilindje News',
  openGraph: {
    type: 'website',
    siteName: 'Rilindje News',
    locale: 'sq_AL',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rilindjenews',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="sq"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white overflow-x-hidden relative">
        <Header />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
