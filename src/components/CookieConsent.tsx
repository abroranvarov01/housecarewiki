'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { buttonClasses } from '@/components/field';
import { SITE } from '@/lib/site';

// Google Tag Manager (and through it GA4 and Microsoft Clarity) loads only after the visitor accepts analytics
// cookies. Until then (and after a decline) no tracking script runs and no cookie is set. The choice lives in local storage and can be changed from the
// footer or the privacy page via the "Cookie settings" button.
type Consent = 'granted' | 'denied';

const STORAGE_KEY = 'hcw-cookie-consent';
const OPEN_EVENT = 'hcw:open-cookie-settings';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function saveConsent(v: Consent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // Private mode or blocked storage: the choice applies to this page view only.
  }
}

// GA4 sets _ga / _ga_<id> and Clarity sets _clck / _clsk on the top-level domain; remove them when consent is withdrawn.
function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ['', host, `.${host.split('.').slice(-2).join('.')}`];
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (!/^_(ga|clck|clsk)/.test(name)) continue;
    for (const d of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}

/** Pushes an event to the GTM data layer when analytics is active (consent given); a no-op otherwise. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && window.dataLayer) window.dataLayer.push({ event: name, ...params });
}

export function CookieSettingsButton({ className = 'link' }: { className?: string }) {
  if (!SITE.gtmId) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cookie settings
    </button>
  );
}

export function CookieConsent() {
  const id = SITE.gtmId;
  const [consent, setConsent] = useState<Consent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setOpen(stored === null);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  if (!id) return null;

  const choose = (v: Consent) => {
    saveConsent(v);
    setOpen(false);
    if (v === 'denied' && consent === 'granted') {
      clearAnalyticsCookies();
      // Reload so the already-running GTM, GA4 and Clarity scripts are gone from this page.
      window.location.reload();
      return;
    }
    setConsent(v);
  };

  return (
    <>
      {consent === 'granted' && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`}
        </Script>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-rule-strong/60 bg-paper-card p-5 text-ink shadow-lg sm:flex sm:items-center sm:gap-6">
            <div className="flex-1">
              <p id="cookie-consent-title" className="font-semibold">
                Analytics cookies
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-secondary">
                With your OK, we use Google Analytics and Microsoft Clarity (heatmaps and anonymised session replays) to see
                which guides help, so we know what to improve. No advertising cookies.{' '}
                <Link href="/privacy#analytics" className="link">
                  Privacy policy
                </Link>
              </p>
            </div>
            <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
              <button type="button" className={buttonClasses('secondary', 'sm')} onClick={() => choose('denied')}>
                Decline
              </button>
              <button type="button" className={buttonClasses('primary', 'sm')} onClick={() => choose('granted')}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
