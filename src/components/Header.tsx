'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Menu, Search, X } from 'lucide-react';
import { BrandMark, Wordmark } from '@/components/BrandMark';
import type { NavLink, NavModel } from '@/lib/navigation';

type PanelKey = 'fix' | 'choose' | 'rooms' | 'tools';

const PANELS: { key: PanelKey; label: string }[] = [
  { key: 'fix', label: 'Fix a problem' },
  { key: 'choose', label: 'Choose a product' },
  { key: 'rooms', label: 'Rooms & surfaces' },
  { key: 'tools', label: 'Tools' },
];

function PanelList({ title, links, columns = 1, onNavigate }: { title: string; links: NavLink[]; columns?: 1 | 2; onNavigate: () => void }) {
  if (!links.length) return null;
  return (
    <div>
      <p className="kicker mb-3 text-ink-muted">{title}</p>
      <ul className={`grid gap-x-8 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={onNavigate}
              className="group flex items-baseline justify-between gap-3 border-b border-rule py-2.5 text-[15px] text-ink hover:text-terracotta-deep"
            >
              <span>
                <span className="hover-title">{l.label}</span>
                {l.note && <span className="mt-0.5 block text-[13px] text-ink-muted">{l.note}</span>}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-rule-strong transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PanelBody({ panel, nav, onNavigate }: { panel: PanelKey; nav: NavModel; onNavigate: () => void }) {
  if (panel === 'fix') {
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <PanelList title="Step-by-step guides" links={nav.fix} columns={2} onNavigate={onNavigate} />
        <div className="bg-honey-soft p-5">
          <p className="font-serif text-xl font-semibold leading-snug text-ink">Not sure what will work on your surface?</p>
          <p className="mt-2 text-sm text-ink-secondary">Pick the stain, the material and how old it is. You get the steps and the warnings for that case.</p>
          <Link href="/tools/stain-finder" onClick={onNavigate} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-deep underline underline-offset-4">
            Open the Stain Solution Finder <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }
  if (panel === 'choose') {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <PanelList title="Buying guides" links={nav.choose} onNavigate={onNavigate} />
        <PanelList title="Head-to-head" links={nav.compare} onNavigate={onNavigate} />
        <div className="space-y-4">
          <PanelList
            title="More"
            links={[
              { label: 'All product reviews', href: '/products' },
              { label: 'Build your own comparison', href: '/compare' },
            ]}
            onNavigate={onNavigate}
          />
          <p className="text-[13px] leading-relaxed text-ink-muted">
            Our reviews are research-based: specs, manuals and published standards, not hands-on tests.{' '}
            <Link href="/methodology" onClick={onNavigate} className="underline underline-offset-2 hover:text-terracotta-deep">
              How we evaluate
            </Link>
          </p>
        </div>
      </div>
    );
  }
  if (panel === 'rooms') {
    return (
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <PanelList title="By room" links={nav.rooms} columns={2} onNavigate={onNavigate} />
        <PanelList title="Surface care guides" links={nav.surfaces} onNavigate={onNavigate} />
      </div>
    );
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <PanelList title="Free tools" links={nav.tools} columns={2} onNavigate={onNavigate} />
      <p className="self-end text-[13px] leading-relaxed text-ink-muted">
        The tools run on rules written from manufacturer instructions and care standards. They show their reasoning, and you can
        change any answer.
      </p>
    </div>
  );
}

export function Header({ nav }: { nav: NavModel }) {
  const pathname = usePathname();
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelId = useId();

  // Close menus on navigation.
  useEffect(() => {
    setPanel(null);
    setMobileOpen(false);
  }, [pathname]);

  // Escape and outside click close the desktop panel.
  useEffect(() => {
    if (!panel && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanel(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [panel, mobileOpen]);

  // Lock page scroll behind the mobile menu.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const close = () => {
    setPanel(null);
    setMobileOpen(false);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto flex h-16 max-w-page items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-1.5" aria-label="HouseCareWiki home">
          <BrandMark className="h-9 w-9 sm:h-10 sm:w-10" />
          <Wordmark />
        </Link>

        <nav className="ml-6 hidden h-full items-stretch lg:flex" aria-label="Main">
          {PANELS.map((p) => {
            const open = panel === p.key;
            return (
              <button
                key={p.key}
                type="button"
                aria-expanded={open}
                aria-controls={`${panelId}-${p.key}`}
                onClick={() => setPanel(open ? null : p.key)}
                className={`relative inline-flex items-center gap-1 px-3.5 text-[14px] font-medium transition-colors ${
                  open ? 'text-ink' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {p.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                <span className={`absolute inset-x-3.5 bottom-0 h-[3px] bg-honey transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form action="/search" method="GET" role="search" className="hidden xl:block">
            <label className="relative block">
              <span className="sr-only">Search HouseCareWiki</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder="Search stains, rooms, tools"
                className="h-10 w-64 rounded-full border border-rule-field bg-paper-card pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
              />
            </label>
          </form>
          <Link
            href="/search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-paper-warm xl:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls={`${panelId}-mobile`}
            className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink hover:bg-paper-warm lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            <span>{mobileOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      {/* Desktop mega panels */}
      {PANELS.map((p) =>
        panel === p.key ? (
          <div
            key={p.key}
            id={`${panelId}-${p.key}`}
            className="absolute inset-x-0 top-full hidden border-b border-rule bg-paper shadow-elevated lg:block"
          >
            <div className="mx-auto max-w-page px-8 py-8">
              <PanelBody panel={p.key} nav={nav} onNavigate={close} />
            </div>
          </div>
        ) : null,
      )}

      {/* Mobile menu */}
      <div
        id={`${panelId}-mobile`}
        hidden={!mobileOpen}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain border-t border-rule bg-paper lg:hidden"
      >
        {mobileOpen && (
          <div className="px-4 pb-10 pt-4">
            <form action="/search" method="GET" role="search" className="mb-5">
              <label className="relative block">
                <span className="sr-only">Search HouseCareWiki</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                <input
                  type="search"
                  name="q"
                  placeholder="What needs cleaning?"
                  className="h-12 w-full rounded-full border border-rule-field bg-paper-card pl-10 pr-3 text-base text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
                />
              </label>
            </form>
            {PANELS.map((p, i) => (
              <details key={p.key} className="group border-b border-rule" open={i === 0}>
                <summary className="flex items-center justify-between py-4 font-serif text-xl font-semibold text-ink">
                  {p.label}
                  <ChevronDown className="h-5 w-5 text-ink-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="pb-6">
                  <PanelBody panel={p.key} nav={nav} onNavigate={close} />
                </div>
              </details>
            ))}
            <ul className="mt-6 space-y-3 text-[15px]">
              <li>
                <Link href="/about" onClick={close} className="text-ink-secondary underline underline-offset-4">
                  About HouseCareWiki
                </Link>
              </li>
              <li>
                <Link href="/methodology" onClick={close} className="text-ink-secondary underline underline-offset-4">
                  How we evaluate products
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
