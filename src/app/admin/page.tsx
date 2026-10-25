import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { readStore } from '@/lib/store';
import { checkAdminAuth } from '@/lib/admin-auth';
import { AdminPortalClient } from '@/components/AdminPortalClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editorial CMS | HouseCareWiki',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  // Second gate after the middleware: never render store data (subscriber emails, click logs) without auth.
  if (checkAdminAuth(headers().get('authorization')) !== 'ok') notFound();
  const store = readStore();
  return <AdminPortalClient initialStore={store} />;
}
