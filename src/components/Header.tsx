'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Clean by Room', href: '/rooms/bathroom-cleaning' },
  { label: 'Stain Solutions', href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa' },
  { label: 'Product Guides', href: '/best/best-portable-carpet-cleaners-home-use-2026' },
  { label: 'Tools & Equipment', href: '/tools' },
  { label: 'Tips & Inspiration', href: '/products' },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E6DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo: Two-Leaf Plant Icon + Serif HomeCare matching the photo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <svg
            width="26"
            height="26"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#1F4D3A] shrink-0"
          >
            <path
              d="M14 23V12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M14 15C14 10.5 18.5 6.5 23.5 6.5C23.5 11.5 19.5 15 14 15Z"
              fill="#2E6B4E"
              stroke="#1F4D3A"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M14 18C14 13.5 9.5 9.5 4.5 9.5C4.5 14.5 8.5 18 14 18Z"
              fill="#4E8C6F"
              stroke="#1F4D3A"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-editorial text-[22px] font-bold tracking-tight text-[#1F2421]">
            HomeCare
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#1F4D3A] font-semibold'
                    : 'text-[#3F4641] hover:text-[#1F4D3A]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Search Icon & Dark Green Search Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 rounded-full text-[#3F4641] hover:text-[#1F4D3A] transition"
            aria-label="Open search bar"
          >
            <Search className="w-4 h-4 stroke-[2.2]" />
          </button>

          <Link
            href="/search"
            className="hidden sm:inline-flex items-center justify-center bg-[#1F4D3A] hover:bg-[#173B2C] text-white text-[13px] font-semibold px-4 py-1.5 rounded-lg transition shadow-sm"
          >
            Search
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#1F2421] hover:bg-[#F3EDE2]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {searchOpen && (
        <div className="border-t border-[#E6DFD3] bg-[#FBF9F5] py-3 px-4 shadow-soft">
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to clean or organize?"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-[#D8CFC0] bg-white text-sm focus:outline-none focus:border-[#1F4D3A]"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="bg-[#E07A4B] hover:bg-[#C96538] text-white text-sm font-semibold px-5 py-2 rounded-full transition"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E6DFD3] bg-[#FBF9F5] px-4 pt-3 pb-6 space-y-2 shadow-elevated">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#1F2421] hover:bg-[#EFE9DC]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
