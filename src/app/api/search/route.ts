import { NextResponse } from 'next/server';
import { searchEverything } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';

  const results = searchEverything(q, category);
  return NextResponse.json(results);
}
