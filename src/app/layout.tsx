import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://housecarewiki.com'),
  title: {
    default: 'HouseCareWiki — Real Solutions for Everyday Messy Moments',
    template: '%s | HouseCareWiki',
  },
  description:
    'Practical home care guides, honest product reviews, surface safety protocols, and interactive tools to keep your home fresh, organized, and comfortable.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://housecarewiki.com',
    siteName: 'HouseCareWiki',
    title: 'HouseCareWiki — Practical Home Care Guides & Independent Reviews',
    description:
      'Solve the problem first. Recommend the product second. Tested cleaning guides, stain solutions, and appliance comparisons.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HouseCareWiki',
    url: 'https://housecarewiki.com',
    description:
      'Independent home care encyclopedia, stain removal guides, and hands-on appliance reviews.',
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HouseCareWiki',
    url: 'https://housecarewiki.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://housecarewiki.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en-US">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-ink antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
