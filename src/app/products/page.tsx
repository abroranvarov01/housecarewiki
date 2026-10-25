import React from 'react';
import type { Metadata } from 'next';
import { readStore } from '@/lib/store';
import { ProductCatalogClient } from '@/components/ProductCatalogClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tested Home Cleaning Tools & Equipment Catalog (2026)',
  description:
    'Explore our database of hands-on tested portable carpet cleaners, electric spin scrubbers, steam cleaners, grout brushes, and home organizers.',
};

export default function ProductsCatalogPage() {
  const store = readStore();
  return <ProductCatalogClient products={store.products} />;
}
