import React from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { readStore } from '@/lib/store';
import { CompareBuilderClient } from '@/components/CompareBuilderClient';

// ISR: refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Product Comparison Builder',
  description: 'Compare portable carpet cleaners, electric spin scrubbers, and steam cleaners side by side on tank capacity, weight, suction, and our test scores.',
  path: '/compare',
  noindex: true,
});

export default function ComparePage() {
  const store = readStore();
  return (
    <CompareBuilderClient
      products={store.products}
      editorialComparisons={store.comparisons}
    />
  );
}
