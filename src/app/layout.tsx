import type { Metadata, Viewport } from 'next';
import { Caveat, IBM_Plex_Mono, Newsreader, Schibsted_Grotesk } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import { INDEX_ROBOTS } from '@/lib/seo';
import { graph, organizationSchema, websiteSchema } from '@/lib/schema';
import { readStore } from '@/lib/store';
import { buildNav } from '@/lib/navigation';

// Self-hosted at build time: no request to Google Fonts, swap display, latin subset only.
// Newsreader (editorial serif) for headlines, Schibsted Grotesk for reading and UI, IBM Plex Mono for labels and data.
// Newsreader and Schibsted Grotesk load as variable fonts: one file per style instead of one per weight.
const fontSerif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});
const fontSans = Schibsted_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
// Caveat: one handwritten note on the homepage hero. Latin subset, single weight.
const fontHand = Caveat({
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
  variable: '--font-hand',
});
const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  robots: INDEX_ROBOTS,
  alternates: {
    types: { 'application/rss+xml': [{ url: '/feed.xml', title: `${SITE.name} — latest guides` }] },
  },
  formatDetection: { telephone: false, email: false, address: false },
  category: 'home & garden',
  openGraph: {
    type: 'website',
    locale: SITE.ogLocale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/icon.png', type: 'image/png', sizes: '512x512' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nav = buildNav(readStore());
  return (
    <html lang={SITE.lang} className={`${fontSerif.variable} ${fontSans.variable} ${fontMono.variable} ${fontHand.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper-light"
        >
          Skip to content
        </a>
        <JsonLd data={graph(organizationSchema(), websiteSchema())} />
        <Header nav={nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer nav={nav} />
      </body>
    </html>
  );
}
