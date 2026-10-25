import React from 'react';
import Link from 'next/link';
import { Leaf, ShieldCheck, CheckCircle2, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-forest-dark text-paper-light border-t border-forest-light/30 mt-20">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Leaf className="w-5 h-5" />
              </span>
              <span className="font-editorial text-2xl font-bold text-white">
                HouseCareWiki
              </span>
            </Link>
            <p className="text-sm text-paper-light/80 max-w-md leading-relaxed">
              <strong>Solve the problem first. Recommend the product second.</strong> Practical
              home care guides, surface safety protocols, interactive tools, and independent
              product evaluations tested in real homes across the United States.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-200/90">
              <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                IICRC & EPA Cited Methods
              </span>
              <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-coral" />
                Zero Sponsored Rankings
              </span>
            </div>
          </div>

          {/* Col 2: Clean by Room & Surface */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
              Clean by Room & Surface
            </h3>
            <ul className="space-y-2.5 text-sm text-paper-light/80">
              <li>
                <Link href="/rooms/bathroom-cleaning" className="hover:text-white transition">
                  Bathroom Cleaning
                </Link>
              </li>
              <li>
                <Link href="/rooms/kitchen-cleaning" className="hover:text-white transition">
                  Kitchen Cleaning
                </Link>
              </li>
              <li>
                <Link href="/rooms/floor-carpet-care" className="hover:text-white transition">
                  Floor & Carpet Care
                </Link>
              </li>
              <li>
                <Link href="/rooms/pet-hair-removal" className="hover:text-white transition">
                  Pet Hair & Stain Removal
                </Link>
              </li>
              <li>
                <Link href="/rooms/home-organization" className="hover:text-white transition">
                  Home Organization
                </Link>
              </li>
              <li>
                <Link href="/surfaces/upholstery" className="hover:text-white transition">
                  Surface Safety Encyclopedia
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Smart Interactive Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
              Interactive Smart Tools
            </h3>
            <ul className="space-y-2.5 text-sm text-paper-light/80">
              <li>
                <Link href="/tools/stain-finder" className="hover:text-white transition">
                  Stain Solution Finder
                </Link>
              </li>
              <li>
                <Link href="/tools/equipment-finder" className="hover:text-white transition">
                  Cleaning Equipment Finder
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition">
                  Product Comparison Builder
                </Link>
              </li>
              <li>
                <Link href="/tools/routine-planner" className="hover:text-white transition">
                  Cleaning Routine Planner
                </Link>
              </li>
              <li>
                <Link href="/tools/cost-calculator" className="hover:text-white transition">
                  Cleaning Cost Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/surface-checker" className="hover:text-white transition">
                  Surface Compatibility Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Editorial Standards & Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
              About & Trust
            </h3>
            <ul className="space-y-2.5 text-sm text-paper-light/80">
              <li>
                <Link href="/methodology" className="hover:text-white transition">
                  Our Testing Methodology
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="hover:text-white transition">
                  Editorial & Safety Policy
                </Link>
              </li>
              <li>
                <Link href="/authors/emily-carter" className="hover:text-white transition">
                  Our Authors & Reviewers
                </Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure" className="hover:text-white transition">
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy & Data Export
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-emerald-300 hover:text-white font-medium pt-1"
                >
                  Admin CMS Portal <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Amazon Associates Disclosure Banner (Spec Section 9.5) */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-paper-light/70">
          <div className="space-y-1 max-w-3xl">
            <p className="font-semibold text-paper-light/95">
              Amazon Associates Program Disclosure: As an Amazon Associate I earn from qualifying purchases.
            </p>
            <p>
              HouseCareWiki.com is an independent editorial publisher and participant in the Amazon Services LLC Associates Program. Product prices and availability are accurate as of the date/time indicated and are subject to change.
            </p>
          </div>
          <p className="shrink-0 text-paper-light/60">
            © {new Date().getFullYear()} HouseCareWiki.com · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
