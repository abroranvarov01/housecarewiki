import React from 'react';
import type { Metadata } from 'next';
import { readStore } from '@/lib/store';
import { AdminPortalClient } from '@/components/AdminPortalClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editorial CMS & Operations Portal | HouseCareWiki',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  const store = readStore();
  return <AdminPortalClient initialStore={store} />;
}
