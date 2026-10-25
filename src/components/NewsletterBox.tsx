'use client';

import React, { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { Container, buttonClasses } from '@/components/field';

export function NewsletterBox() {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || "Thanks, you're on the list.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Could not subscribe right now.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <section aria-labelledby={`${inputId}-heading`}>
      <Container>
      <div className="grid gap-6 rounded-3xl bg-honey-soft px-5 py-8 text-ink sm:px-10 sm:py-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <p className="kicker text-terracotta-deep">New guides by email</p>
          <h2 id={`${inputId}-heading`} className="mt-2 font-serif text-3xl font-semibold leading-tight">
            Get new guides when we publish them.
          </h2>
          <p className="mt-2 max-w-md text-base leading-relaxed text-ink-secondary">
            Occasional emails when we publish new guides. Unsubscribe anytime.
          </p>
        </div>

        <div className="lg:col-span-6">
          {status === 'success' ? (
            <p role="status" className="inline-flex items-center gap-2 rounded-lg border-l-4 border-leaf bg-paper-card px-4 py-3 text-[15px]">
              <Check className="h-4 w-4 shrink-0 text-leaf-deep" aria-hidden="true" />
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label htmlFor={inputId} className="block text-[15px] font-semibold text-ink sm:col-span-2">
                Email address
              </label>
              <input
                id={inputId}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-full border border-rule-field bg-paper-card px-4 text-base text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
              />
              <button type="submit" disabled={status === 'loading'} className={`${buttonClasses('primary')} h-12`}>
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p role="alert" className="mt-2 text-sm font-semibold text-terracotta-deep">
              {message}
            </p>
          )}
        </div>
      </div>
      </Container>
    </section>
  );
}
