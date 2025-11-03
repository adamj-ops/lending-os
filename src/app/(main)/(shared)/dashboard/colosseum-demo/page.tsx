'use client';

import { useState } from 'react';
import { FilterPill } from '@/components/colosseum/FilterPill';
import { OrangeBadge } from '@/components/colosseum/OrangeBadge';

export default function ColosseumDemoPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'defi', label: 'DeFi' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'depin', label: 'DePIN' },
    { id: 'dao', label: 'Community DAOs' },
    { id: 'consumer', label: 'Consumer / Other' },
    { id: 'dev-infra', label: 'Developer Infrastructure' },
    { id: 'payments', label: 'Payments' },
    { id: 'security', label: 'Security Tools' },
    { id: 'social', label: 'Social' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#0a0a0a] px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-slate-100">
            Colosseum Dark Theme Demo
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Forum-style UI with teal accents and dark background
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="border-b border-slate-800 bg-[#0a0a0a] px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <FilterPill
                key={cat.id}
                active={activeFilter === cat.id}
                onClick={() => setActiveFilter(cat.id)}
              >
                {cat.label}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>

      {/* Post Cards */}
      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* Sample Post 1 */}
        <article className="group border-t border-slate-800 py-6 transition-colors hover:bg-brand-primary-950/10">
          <div className="mb-3">
            <OrangeBadge>Looking for Team</OrangeBadge>
          </div>
          
          <h2 className="mb-2 text-lg font-bold text-slate-100 transition-colors group-hover:text-brand-primary-500">
            Building a DeFi lending protocol on Solana
          </h2>
          
          <div className="mb-3 flex items-center gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <span>username.sol</span>
            </div>
            <span>•</span>
            <span>2 hours ago</span>
          </div>
          
          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            We're building a next-generation lending protocol focused on capital efficiency and 
            composability. Looking for experienced Rust devs familiar with Anchor framework.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-brand-primary-800 bg-brand-primary-950/20 px-2 py-1 text-xs text-brand-primary-400">
              DeFi
            </span>
            <span className="rounded-md border border-brand-primary-800 bg-brand-primary-950/20 px-2 py-1 text-xs text-brand-primary-400">
              Rust
            </span>
          </div>
        </article>

        {/* Sample Post 2 */}
        <article className="group border-t border-slate-800 py-6 transition-colors hover:bg-brand-primary-950/10">
          <h2 className="mb-2 text-lg font-bold text-slate-100 transition-colors group-hover:text-brand-primary-500">
            Gaming infrastructure layer for on-chain state
          </h2>
          
          <div className="mb-3 flex items-center gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
              <span>builder.sol</span>
            </div>
            <span>•</span>
            <span>5 hours ago</span>
          </div>
          
          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            Designing a state compression solution specifically optimized for gaming use cases. 
            Would love feedback from other gaming teams.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-brand-primary-800 bg-brand-primary-950/20 px-2 py-1 text-xs text-brand-primary-400">
              Gaming
            </span>
            <span className="rounded-md border border-brand-primary-800 bg-brand-primary-950/20 px-2 py-1 text-xs text-brand-primary-400">
              Infrastructure
            </span>
          </div>
        </article>

        {/* Sample Post 3 with Orange Badge */}
        <article className="group border-t border-slate-800 py-6 transition-colors hover:bg-brand-primary-950/10">
          <div className="mb-3">
            <OrangeBadge>Looking for Team</OrangeBadge>
          </div>
          
          <h2 className="mb-2 text-lg font-bold text-slate-100 transition-colors group-hover:text-brand-primary-500">
            Mobile wallet with biometric authentication
          </h2>
          
          <div className="mb-3 flex items-center gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500" />
              <span>mobile.sol</span>
            </div>
            <span>•</span>
            <span>1 day ago</span>
          </div>
          
          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            Building a mobile-first wallet with advanced security features. Need React Native 
            developers and security experts to join the team.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-brand-primary-800 bg-brand-primary-950/20 px-2 py-1 text-xs text-brand-primary-400">
              Consumer
            </span>
            <span className="rounded-md border border-brand-primary-800 bg-brand-primary-950/20 px-2 py-1 text-xs text-brand-primary-400">
              Security
            </span>
          </div>
        </article>
      </div>

      {/* Footer info */}
      <div className="fixed bottom-4 right-4 rounded-md border border-slate-700 bg-slate-900/90 p-4 shadow-xl backdrop-blur">
        <p className="text-sm font-medium text-slate-100">
          🎨 Colosseum Dark Theme Demo
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Teal accents • Dark background • System fonts
        </p>
      </div>
    </div>
  );
}

