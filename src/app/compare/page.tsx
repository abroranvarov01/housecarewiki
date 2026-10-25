import React from 'react';
import type { Metadata } from 'next';
import { readStore } from '@/lib/store';
import { CompareBuilderClient } from '@/components/CompareBuilderClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Interactive Product Comparison Builder | HouseCareWiki',
  description:
    'Compare portable carpet cleaners, electric spin scrubbers, and steam cleaners side by side on tank capacity, weight, suction, and lab test scores.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function ComparePage() {
  const store = readStore();
  return (
    <CompareBuilderClient
      products={store.products}
      editorialComparisons={store.comparisons}
    />
  );
}
