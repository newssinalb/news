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
    default: 'Next Shqip — Lajmet e Fundit nga Shqipëria',
    template: '%s | Next Shqip',
  },
  description: 'Lexoni lajmet më të fundit nga Shqipëria dhe bota — politikë, ekonomi, sport, showbiz dhe shumë më tepër.',
  keywords: ['lajme', 'shqipëri', 'albania', 'politikë', 'sport', 'ekonomi', 'aktualitet'],
  authors: [{ name: 'NextShqip', url: SITE_URL }],
  creator: 'NextShqip',
  publisher: 'NextShqip',
  openGraph: {
    type: 'website',
    siteName: 'NextShqip',
    locale: 'sq_AL',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nextshqip',
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
      suppressHydrationWarning
    >
      <head>
        {/* Google Tag Manager — must be first in <head> for best coverage */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NXNM5T5L');` }} />
        {/* RSS feed auto-discovery */}
        <link rel="alternate" type="application/rss+xml" title="NextShqip RSS" href="/feed.xml" />
        {/* Prevent dark mode flash on page load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark') document.documentElement.classList.add('dark');
            } catch(e){}
          })()
        ` }} />
      </head>
      <body className="min-h-full flex flex-col bg-white overflow-x-hidden relative" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) — must be first inside <body> */}
        <noscript dangerouslySetInnerHTML={{ __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NXNM5T5L" height="0" width="0" style="display:none;visibility:hidden"></iframe>` }} />
        <Header />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
