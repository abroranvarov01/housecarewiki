'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  FileText,
  Package,
  Globe,
  Bot,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Play,
  Plus,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  MousePointerClick,
} from 'lucide-react';
import type { DatabaseState } from '@/lib/store';
import type { EditorialStatus } from '@/lib/types';

const WORKFLOW_STAGES: EditorialStatus[] = [
  'Idea',
  'Research',
  'Draft',
  'Fact Check',
  'Editorial Review',
  'SEO Review',
  'Approved',
  'Scheduled',
  'Published',
  'Update Required',
  'Archived',
];

export function AdminPortalClient({
  initialStore,
}: {
  initialStore: DatabaseState;
}) {
  const [store, setStore] = useState<DatabaseState>(initialStore);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'cms' | 'products' | 'seo' | 'ai' | 'jobs'
  >('dashboard');
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);

  // New Article Draft Form State
  const [newTitle, setNewTitle] = useState('');
  const [newRoom, setNewRoom] = useState('bathroom-cleaning');
  const [newQuickAnswer, setNewQuickAnswer] = useState('');
  const [newSafetyWarning, setNewSafetyWarning] = useState('');

  // Redirect Form State
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');

  // AI Assistant State
  const [aiTopic, setAiTopic] = useState(
    'How to remove hard water stains from glass shower doors'
  );
  const [aiDraftText, setAiDraftText] = useState(
    'Spray a 50/50 solution of warm distilled white vinegar and water onto tempered glass shower doors, let dwell for 5 minutes to dissolve calcium scale, scrub with a non-scratch melamine pad, and squeegee dry.'
  );
  const [aiSafetyReport, setAiSafetyReport] = useState<{
    passed: boolean;
    warnings: string[];
    outline: string[];
  } | null>(null);

  // Site Config State
  const [partnerTag, setPartnerTag] = useState(store.config.amazonPartnerTag);
  const [heroTitle, setHeroTitle] = useState(store.config.heroTitle);

  const showNotice = (msg: string, tone: 'ok' | 'error' = 'ok') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 6000);
  };

  // All CMS writes go through one POST endpoint. Error responses may be JSON ({ error }) or plain text
  // (401/503 from the auth gate), so parse defensively and always surface a readable message.
  const postAction = async (
    action: string,
    payload: Record<string, unknown>
  ): Promise<{ ok: true; store: DatabaseState } | { ok: false; error: string }> => {
    try {
      const res = await fetch('/api/admin/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const text = await res.text();
      let data: { store?: DatabaseState; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text.slice(0, 200) };
      }
      if (res.ok && data.store) return { ok: true, store: data.store };
      if (res.status === 401) return { ok: false, error: 'Your admin session has expired. Reload the page and sign in again.' };
      return { ok: false, error: data.error || `Request failed (HTTP ${res.status}).` };
    } catch {
      return { ok: false, error: 'Network error: the change was not saved.' };
    }
  };

  const handleStatusChange = async (articleId: string, nextStatus: EditorialStatus) => {
    const result = await postAction('UPDATE_ARTICLE_STATUS', { articleId, nextStatus });
    if (result.ok) {
      setStore(result.store);
      showNotice(`Status changed to "${nextStatus}". The change is recorded in the audit log.`);
    } else {
      showNotice(result.error, 'error');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuickAnswer.trim()) return;
    const result = await postAction('CREATE_ARTICLE', {
      title: newTitle.trim(),
      roomSlug: newRoom,
      quickAnswer: newQuickAnswer.trim(),
      safetyWarning: newSafetyWarning.trim(),
    });
    if (result.ok) {
      setStore(result.store);
      setNewTitle('');
      setNewQuickAnswer('');
      setNewSafetyWarning('');
      showNotice('Draft created. Find it in the workflow list below.');
    } else {
      showNotice(result.error, 'error');
    }
  };

  const handleAddRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath.trim() || !toPath.trim()) return;
    const result = await postAction('ADD_REDIRECT', { fromPath, toPath });
    if (result.ok) {
      setStore(result.store);
      setFromPath('');
      setToPath('');
      showNotice('Added a permanent (301) redirect.');
    } else {
      showNotice(result.error, 'error');
    }
  };

  const handleTriggerJob = async (jobId: string) => {
    const result = await postAction('RUN_AUTOMATION_JOB', { jobId });
    if (result.ok) {
      setStore(result.store);
      showNotice('Not run: no background job runner is connected. The request was recorded in the audit log.', 'error');
    } else {
      showNotice(result.error, 'error');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await postAction('UPDATE_SITE_CONFIG', { amazonPartnerTag: partnerTag, heroTitle });
    if (result.ok) {
      setStore(result.store);
      showNotice('Saved homepage and affiliate settings.');
    } else {
      showNotice(result.error, 'error');
    }
  };

  const runAiResearchAndSafetyCheck = () => {
    const lower = aiDraftText.toLowerCase();
    const warnings: string[] = [];

    if (lower.includes('bleach') && (lower.includes('vinegar') || lower.includes('ammonia'))) {
      warnings.push(
        'Chemical hazard: the text mentions bleach together with vinegar or ammonia. Mixing them releases toxic chlorine or chloramine gas.'
      );
    }
    const claimPhrases = ['we tested', 'lab-tested', 'lab tested', 'hands-on', 'verified buyer', 'guaranteed cure', 'real homes'];
    const foundClaims = claimPhrases.filter((phrase) => lower.includes(phrase));
    if (foundClaims.length > 0) {
      warnings.push(
        `Unsupported claim: "${foundClaims.join('", "')}". Our reviews are research-based; remove testing claims and guarantees.`
      );
    }

    setAiSafetyReport({
      passed: warnings.length === 0,
      warnings:
        warnings.length > 0
          ? warnings
          : [
              'No bleach + acid/ammonia combinations found.',
              'No testing claims or guarantees found from the flagged-phrase list.',
              'This is a simple keyword check. An editor still needs to fact-check the method against sources.',
            ],
      outline: [
        `H1: ${aiTopic}`,
        'Short answer (2–3 sentences)',
        'Surface safety: what this method can damage',
        'Supplies',
        'Step-by-step method',
        'If it didn’t work',
        'FAQ and sources',
      ],
    });
  };

  const totalClicks = store.affiliateClicks.length;
  const publishedCount = store.articles.filter((a) => a.status === 'Published').length;
  const draftCount = store.articles.length - publishedCount;
  const activeSubscribers = store.subscribers.filter((s) => s.status !== 'unsubscribed').length;

  const card = 'rounded-sm border border-rule bg-paper-card p-5 sm:p-6';
  const input = 'w-full min-h-[44px] rounded-sm border border-rule-strong/70 bg-paper px-3.5 py-2 text-sm text-ink focus:border-ink focus:outline-none';
  const labelCls = 'block text-xs font-semibold text-ink-secondary mb-1';
  const primaryBtn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-deep';
  const h2 = 'font-serif text-xl font-semibold text-ink';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin header + tabs */}
      <div className="bg-ink text-paper-light rounded-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="kicker flex items-center gap-2 text-honey">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Editorial CMS, SEO and site settings</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold mt-1">HouseCareWiki admin</h1>
          <p className="text-xs text-paper-light/80 mt-0.5">
            Role: <strong>Owner / Managing Editor</strong> · Amazon partner tag:{' '}
            <code className="bg-paper-light/10 px-1.5 py-0.5 rounded-sm">{store.config.amazonPartnerTag}</code>
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Admin sections">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'cms', label: 'Editorial CMS', icon: FileText },
            { id: 'products', label: 'Catalog & Amazon', icon: Package },
            { id: 'seo', label: 'SEO & Redirects', icon: Globe },
            { id: 'ai', label: 'Draft checker', icon: Bot },
            { id: 'jobs', label: 'Jobs & Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex min-h-[44px] items-center gap-1.5 px-3.5 rounded-sm text-xs font-semibold transition-colors ${
                  active ? 'bg-honey text-ink' : 'bg-paper-light/10 text-paper-light hover:bg-paper-light/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {toast && (
        <div
          role={toast.tone === 'error' ? 'alert' : 'status'}
          className={`px-4 py-3 rounded-sm text-sm font-semibold flex items-center justify-between gap-4 border ${
            toast.tone === 'error' ? 'bg-terracotta-soft border-terracotta/40 text-terracotta-deep' : 'bg-leaf-soft border-leaf-deep/40 text-leaf-deep'
          }`}
        >
          <span>{toast.msg}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss message" className="min-h-[44px] min-w-[44px]">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW — only numbers the site actually records. */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-rule bg-rule">
            <div className="bg-paper-card p-5">
              <div className="kicker flex items-center justify-between text-ink-muted">
                <span>Affiliate clicks recorded</span>
                <MousePointerClick className="w-4 h-4 text-terracotta-deep" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-semibold text-ink mt-2">{totalClicks}</p>
              <p className="text-xs text-ink-muted mt-1">Outbound clicks to Amazon. A click is not a sale.</p>
            </div>
            <div className="bg-paper-card p-5">
              <div className="kicker flex items-center justify-between text-ink-muted">
                <span>Newsletter subscribers</span>
                <TrendingUp className="w-4 h-4 text-terracotta-deep" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-semibold text-ink mt-2">{activeSubscribers}</p>
              <p className="text-xs text-ink-muted mt-1">
                {activeSubscribers === 0 ? 'No sign-ups yet.' : 'Stored sign-ups from the site form.'}
              </p>
            </div>
            <div className="bg-paper-card p-5">
              <div className="kicker flex items-center justify-between text-ink-muted">
                <span>Published pages</span>
                <FileText className="w-4 h-4 text-terracotta-deep" aria-hidden="true" />
              </div>
              <p className="font-serif text-3xl font-semibold text-ink mt-2">{publishedCount}</p>
              <p className="text-xs text-ink-muted mt-1">
                {draftCount} in other workflow stages · {store.products.length} products
              </p>
            </div>
            <div className="bg-paper-card p-5">
              <div className="kicker flex items-center justify-between text-ink-muted">
                <span>Search Console</span>
                <Globe className="w-4 h-4 text-ink-muted" aria-hidden="true" />
              </div>
              <p className="mt-3">
                <NotConnectedBadge />
              </p>
              <p className="text-xs text-ink-muted mt-2">
                Impressions, clicks and rankings appear here once a Search Console import is set up.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={card}>
              <h2 className={`${h2} mb-1`}>Amazon click log</h2>
              <p className="text-xs text-ink-muted mb-4">
                Anonymous clicks by page and placement. Clicks are recorded separately from Amazon sales, which we don&apos;t see here.
              </p>
              {totalClicks === 0 ? (
                <p className="border border-dashed border-rule-strong/60 p-4 text-sm text-ink-muted">
                  No clicks recorded yet. They appear here when a reader follows a &ldquo;Check price on Amazon&rdquo; link.
                </p>
              ) : (
                <div className="divide-y divide-rule border-y border-rule max-h-72 overflow-y-auto">
                  {store.affiliateClicks.map((clk) => (
                    <div key={clk.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-ink">{clk.productName}</p>
                        <p className="text-ink-muted">
                          Page: <code>{clk.contentSlug}</code> · Placement: <code>{clk.placement}</code> ({clk.device})
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-ink-secondary shrink-0">ASIN {clk.asin}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={card}>
              <h2 className={`${h2} mb-1`}>Audit log</h2>
              <p className="text-xs text-ink-muted mb-4">Status changes, new drafts, redirects and settings changes.</p>
              {store.auditLogs.length === 0 ? (
                <p className="border border-dashed border-rule-strong/60 p-4 text-sm text-ink-muted">No changes logged yet.</p>
              ) : (
                <div className="divide-y divide-rule border-y border-rule max-h-72 overflow-y-auto">
                  {store.auditLogs.map((log) => (
                    <div key={log.id} className="py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-terracotta-deep">
                          {log.action} · {log.actor} ({log.role})
                        </span>
                        <span className="text-[11px] text-ink-muted shrink-0">
                          {log.timestamp.slice(0, 19).replace('T', ' ')}
                        </span>
                      </div>
                      <p className="text-ink-secondary">{log.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDITORIAL CMS and workflow */}
      {activeTab === 'cms' && (
        <div className="space-y-8">
          <form onSubmit={handleCreateArticle} className={`${card} space-y-4`}>
            <h2 className={`${h2} flex items-center gap-2`}>
              <Plus className="w-5 h-5 text-terracotta-deep" aria-hidden="true" />
              <span>New guide draft</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="new-title" className={labelCls}>
                  Headline (H1)
                </label>
                <input
                  id="new-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., How to Clean Burnt Grease Off Stainless Steel Pans"
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="new-room" className={labelCls}>
                  Room
                </label>
                <select id="new-room" value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className={`${input} font-semibold`}>
                  {store.rooms.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="new-answer" className={labelCls}>
                  Short answer (required to publish)
                </label>
                <textarea
                  id="new-answer"
                  rows={2}
                  required
                  value={newQuickAnswer}
                  onChange={(e) => setNewQuickAnswer(e.target.value)}
                  placeholder="The fix in two or three sentences..."
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="new-safety" className={labelCls}>
                  Surface or chemical safety warning (required)
                </label>
                <textarea
                  id="new-safety"
                  rows={2}
                  required
                  value={newSafetyWarning}
                  onChange={(e) => setNewSafetyWarning(e.target.value)}
                  placeholder="e.g., Never use steel wool or chlorine bleach on brushed stainless steel..."
                  className={input}
                />
              </div>
            </div>

            <button type="submit" className={primaryBtn}>
              Create draft
            </button>
          </form>

          <div className={`${card} space-y-4`}>
            <div>
              <h2 className={h2}>Editorial workflow</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Idea → Research → Draft → Fact Check → Editorial Review → SEO Review → Approved → Scheduled → Published → Update
                Required → Archived. Publishing needs an SEO title, a short answer and at least one safety warning.
              </p>
            </div>

            <div className="divide-y divide-rule">
              {store.articles.map((art) => {
                const publicUrl = art.routeType === 'best' ? `/best/${art.slug}` : `/guides/${art.slug}`;
                return (
                  <div key={art.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="kicker bg-paper-warm text-ink-secondary px-2 py-0.5 rounded-sm">{art.categoryLabel}</span>
                        <span className="text-xs font-semibold text-ink-muted">{art.evidenceStatus}</span>
                      </div>
                      <Link
                        href={publicUrl}
                        className="font-serif font-semibold text-lg text-ink hover:text-terracotta-deep inline-flex items-center gap-1.5"
                      >
                        <span>{art.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                      </Link>
                      <p className="text-xs text-ink-muted">
                        Canonical: <code>{art.seo.canonical}</code> · Safety warnings: {art.safetyWarnings.length}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label htmlFor={`status-${art.id}`} className="text-xs font-semibold text-ink-muted">
                        Status
                      </label>
                      <select
                        id={`status-${art.id}`}
                        value={art.status}
                        onChange={(e) => handleStatusChange(art.id, e.target.value as EditorialStatus)}
                        className="min-h-[44px] rounded-sm border border-rule-strong/70 bg-paper px-3 text-xs font-semibold text-terracotta-deep"
                      >
                        {WORKFLOW_STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT CATALOG and Amazon links */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="border border-rule bg-paper-card rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="kicker text-ink-muted">Amazon Creators API</span>
              <h2 className={h2}>
                {store.config.creatorsApiConnected ? 'Connected' : 'Static catalog (API not connected)'}
              </h2>
              <p className="text-xs text-ink-secondary">
                Product data is maintained by hand. Prices and availability are never shown on the site; readers check them on
                Amazon. The API can be connected after the account qualifies (10 qualifying sales in 30 days).
              </p>
            </div>
            {store.config.creatorsApiConnected ? (
              <span className="kicker bg-leaf-soft text-leaf-deep px-3 py-1.5 rounded-full shrink-0">Connected</span>
            ) : (
              <NotConnectedBadge />
            )}
          </div>

          <div className="border border-rule bg-paper-card rounded-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <caption className="sr-only">Products in the catalog</caption>
              <thead>
                <tr className="border-b-2 border-ink text-ink-secondary">
                  <th scope="col" className="kicker p-4">Product</th>
                  <th scope="col" className="kicker p-4">ASIN</th>
                  <th scope="col" className="kicker p-4">Evidence status</th>
                  <th scope="col" className="kicker p-4">Our rating</th>
                  <th scope="col" className="kicker p-4">Partner tag in link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {store.products.map((prod) => {
                  const tagOk = prod.amazonUrl.includes(`tag=${store.config.amazonPartnerTag}`);
                  return (
                    <tr key={prod.id}>
                      <th scope="row" className="p-4 font-semibold text-ink">
                        <Link href={`/products/${prod.slug}`} className="hover:text-terracotta-deep">
                          {prod.name}
                        </Link>
                      </th>
                      <td className="p-4 font-mono text-xs">{prod.asin}</td>
                      <td className="p-4">
                        <span className="bg-paper border border-rule px-2.5 py-0.5 rounded-sm text-xs font-semibold">
                          {prod.evidenceStatus}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs tabular-nums">{prod.scores.overall.toFixed(1)} / 10</td>
                      <td className="p-4">
                        {tagOk ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-leaf-deep">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            Matches {store.config.amazonPartnerTag}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-deep">
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            Missing or different tag
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-muted">
            The tag column compares each stored Amazon URL with the current partner tag. It does not check that the link resolves.
          </p>
        </div>
      )}

      {/* TAB 4: SEO checklist and 301 redirects */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
              <h2 className={h2}>Technical SEO checklist</h2>
              <NotConnectedBadge label="Automated audit not connected" />
            </div>
            <p className="text-xs text-ink-muted mb-4">
              No automated crawler runs in this deployment, so these are checks to review by hand, not results.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-rule bg-rule text-xs">
              {[
                'No empty or duplicate titles',
                'Exactly one H1 per page',
                'Canonical URL on every page',
                'No accidental noindex on public pages',
                'No orphan pages (every page linked from somewhere)',
                'No broken internal links',
                'No two pages targeting the same search intent',
                'Sitemap (/sitemap.xml) lists every published page',
                'JSON-LD passes the Rich Results Test',
                'robots.txt and noindex rules agree',
                'Main content is in the server-rendered HTML',
                'Affiliate links use rel="sponsored"',
              ].map((check) => (
                <li key={check} className="bg-paper p-3 flex items-center gap-2 text-ink-secondary">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-sm border border-rule-strong" aria-hidden="true" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${card} space-y-4`}>
            <h2 className={h2}>301 redirects</h2>
            <form onSubmit={handleAddRedirect} className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1">
                <span className="sr-only">Old path</span>
                <input
                  type="text"
                  required
                  value={fromPath}
                  onChange={(e) => setFromPath(e.target.value)}
                  placeholder="Old path (e.g., /old-grout-guide)"
                  className={input}
                />
              </label>
              <label className="flex-1">
                <span className="sr-only">New path</span>
                <input
                  type="text"
                  required
                  value={toPath}
                  onChange={(e) => setToPath(e.target.value)}
                  placeholder="New path (e.g., /guides/how-to-clean-grout-in-bathroom-tiles)"
                  className={input}
                />
              </label>
              <button type="submit" className={primaryBtn}>
                Add redirect
              </button>
            </form>

            {store.redirects.length === 0 ? (
              <p className="text-sm text-ink-muted">No redirects yet.</p>
            ) : (
              <div className="divide-y divide-rule text-xs">
                {store.redirects.map((r) => (
                  <div key={r.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <code className="font-semibold text-ink">{r.fromPath}</code> →{' '}
                      <code className="text-terracotta-deep font-semibold">{r.toPath}</code>
                    </div>
                    <span className="text-ink-muted">
                      HTTP {r.statusCode} · added {r.createdAt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DRAFT CHECKER (local keyword rules, no AI service connected) */}
      {activeTab === 'ai' && (
        <div className={`${card} space-y-6`}>
          <div>
            <span className="kicker text-terracotta-deep">Before an editor reviews it</span>
            <h2 className="font-serif text-2xl font-semibold text-ink mt-1">Draft safety and claims check</h2>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              Flags dangerous chemical combinations and testing claims we can&apos;t support, and gives a starter outline. It runs
              simple keyword rules in your browser; no AI service is connected, and it doesn&apos;t replace fact-checking.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="ai-topic" className={labelCls}>
                Topic or search intent
              </label>
              <input id="ai-topic" type="text" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className={`${input} font-semibold`} />
            </div>

            <div>
              <label htmlFor="ai-draft" className={labelCls}>
                Draft paragraph to check (try &quot;bleach and vinegar&quot; to see a warning)
              </label>
              <textarea id="ai-draft" rows={3} value={aiDraftText} onChange={(e) => setAiDraftText(e.target.value)} className={input} />
            </div>

            <button type="button" onClick={runAiResearchAndSafetyCheck} className={primaryBtn}>
              Check draft and build outline
            </button>
          </div>

          {aiSafetyReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-rule">
              <div
                className={`rounded-sm p-5 border ${
                  aiSafetyReport.passed ? 'bg-leaf-soft border-leaf-deep/30' : 'bg-terracotta-soft border-terracotta/40'
                }`}
              >
                <h3 className="font-semibold text-sm text-ink flex items-center gap-2 mb-3">
                  {aiSafetyReport.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-leaf-deep" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-terracotta-deep" aria-hidden="true" />
                  )}
                  <span>{aiSafetyReport.passed ? 'Nothing flagged' : 'Needs changes'}</span>
                </h3>
                <ul className="space-y-2 text-xs text-ink-secondary">
                  {aiSafetyReport.warnings.map((w) => (
                    <li key={w}>• {w}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-paper rounded-sm p-5 border border-rule">
                <h3 className="font-semibold text-sm text-ink mb-3">Starter outline (standard guide structure)</h3>
                <ol className="space-y-1.5 text-xs text-ink-secondary list-decimal list-inside">
                  {aiSafetyReport.outline.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SCHEDULED JOBS and site settings */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className={`${card} space-y-4`}>
            <div>
              <h2 className={h2}>Scheduled jobs</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                These jobs are planned but no background job runner is connected yet, so none of them run.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-rule bg-rule">
              {store.automations.map((job) => (
                <div key={job.id} className="p-4 bg-paper flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-sm text-ink">{job.name}</span>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="text-xs text-ink-secondary mt-1">{job.description}</p>
                    <p className="text-[11px] text-ink-muted mt-2">
                      Planned schedule: <code>{job.schedule}</code> · Last run: {job.lastRun || 'Never'}
                    </p>
                    {job.lastSummary && <p className="text-[11px] text-ink-muted mt-1">{job.lastSummary}</p>}
                  </div>

                  <div className="pt-2 border-t border-rule flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleTriggerJob(job.id)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 border border-rule-strong text-ink text-xs font-semibold px-3 rounded-sm hover:border-ink"
                    >
                      <Play className="w-3 h-3" aria-hidden="true" />
                      <span>Request a run</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className={`${card} space-y-4`}>
            <h2 className={h2}>Homepage and affiliate settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cfg-hero" className={labelCls}>
                  Homepage hero headline
                </label>
                <input id="cfg-hero" type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className={input} />
              </div>
              <div>
                <label htmlFor="cfg-tag" className={labelCls}>
                  Amazon US partner tag
                </label>
                <input
                  id="cfg-tag"
                  type="text"
                  value={partnerTag}
                  onChange={(e) => setPartnerTag(e.target.value)}
                  className={`${input} font-mono`}
                />
              </div>
            </div>
            <button type="submit" className={primaryBtn}>
              Save settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function NotConnectedBadge({ label = 'Not connected' }: { label?: string }) {
  return (
    <span className="kicker inline-flex items-center gap-1.5 rounded-full border border-rule-strong/60 bg-paper-warm px-2.5 py-1 text-ink-muted shrink-0">
      <span className="h-1.5 w-1.5 rounded-full bg-rule-strong" aria-hidden="true" />
      {label}
    </span>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  if (status === 'NOT_CONFIGURED') return <NotConnectedBadge />;
  const tone =
    status === 'SUCCESS'
      ? 'border-leaf-deep/40 bg-leaf-soft text-leaf-deep'
      : status === 'WARNING'
      ? 'border-terracotta/40 bg-terracotta-soft text-terracotta-deep'
      : 'border-terracotta/40 bg-leaf-soft text-terracotta-deep';
  const label = status === 'SUCCESS' ? 'Last run OK' : status === 'WARNING' ? 'Warning' : 'Running';
  return <span className={`kicker inline-flex rounded-full border px-2.5 py-1 shrink-0 ${tone}`}>{label}</span>;
}
