import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_SUBSCRIBERS = 20000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const store = readStore();
    const exists = store.subscribers.some((s) => s.email === email);
    if (!exists && store.subscribers.length < MAX_SUBSCRIBERS) {
      store.subscribers.unshift({
        email,
        subscribedAt: new Date().toISOString(),
        // No confirmation email is sent yet, so the address is stored as unconfirmed.
        status: 'UNCONFIRMED',
      });
      writeStore(store);
    }

    return NextResponse.json({
      ok: true,
      message: "Thanks, you're on the list.",
    });
  } catch {
    return NextResponse.json(
      { error: 'Could not process subscription.' },
      { status: 500 }
    );
  }
}
