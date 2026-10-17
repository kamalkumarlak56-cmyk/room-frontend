// client/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Radar,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Building2,
  Lock,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0b0d] border-t border-neutral-800 transition-colors duration-200 text-neutral-400 text-xs mt-auto">
      {/* Top Highlights Strip */}
      <div className="border-b border-neutral-800/70 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-neutral-200 text-xs">Admin Verified</p>
              <p className="text-[10px] text-neutral-400">100% inspected listings</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f5efe6]/15 border border-[#f5efe6]/30 flex items-center justify-center text-[#d8cdbf]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-neutral-200 text-xs">0% Brokerage</p>
              <p className="text-[10px] text-neutral-400">Save thousands on rent</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-neutral-200 text-xs">Direct Landlords</p>
              <p className="text-[10px] text-neutral-400">No middlemen or agents</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-neutral-200 text-xs">Secure Reserves</p>
              <p className="text-[10px] text-neutral-400">Protected booking deposit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Brand & Mission */}
          <div className="space-y-1 max-w-lg">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#f5efe6] to-[#d8cdbf] text-neutral-950 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
                <Radar className="w-4 h-4 text-neutral-950 animate-pulse" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#d8cdbf] transition-colors">
                Room<span className="text-emerald-600 dark:text-[#d8cdbf]">Radar</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Find and lease verified rooms, apartments, and PG spaces directly from genuine landlords with zero brokerage fees.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold">
              0% Brokerage
            </span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Subtle Notice */}
        <div className="mt-8 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400">
          <p>© {currentYear} Room Radar. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Genuine Landlords
            </span>
            <span>•</span>
            <span>Instant Razorpay Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
