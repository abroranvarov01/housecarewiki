import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const store = readStore();
    const exists = store.subscribers.some((s) => s.email === email);
    if (!exists) {
      store.subscribers.unshift({
        email,
        subscribedAt: new Date().toISOString(),
        status: 'CONFIRMED',
      });
      writeStore(store);
    }

    return NextResponse.json({
      ok: true,
      message: 'Subscribed to HouseCareWiki Weekly Field Notes!',
    });
  } catch {
    return NextResponse.json(
      { error: 'Could not process subscription.' },
      { status: 500 }
    );
  }
}
