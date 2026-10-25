'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles } from 'lucide-react';

export function NewsletterBox() {
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
        setMessage(data.message || 'You are subscribed! Check your inbox for our weekly field notes.');
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div className="rounded-2xl bg-forest text-white p-8 md:p-10 shadow-elevated relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Weekly Home Care Field Notes
          </span>
          <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white">
            Seasonal maintenance checklists & tested stain fixes, once a week.
          </h2>
          <p className="text-sm text-paper-light/85 mt-2">
            No spam or raw promotional blasts—just practical 5-minute routines and verified lab findings. Unsubscribe anytime with one click (CAN-SPAM compliant).
          </p>

          {status === 'success' ? (
            <div className="mt-5 inline-flex items-center gap-2 bg-emerald-900/70 border border-emerald-400/40 text-emerald-100 px-4 py-3 rounded-xl text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5 max-w-lg">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-ink text-sm bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-coral hover:bg-coral-hover text-white font-semibold text-sm px-6 py-3 rounded-xl transition shrink-0"
              >
                {status === 'loading' ? 'Subscribing...' : 'Get Free Checklists'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-xs text-amber-300 mt-2">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
