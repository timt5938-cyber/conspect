import React from 'react';
import { Database, Cpu, Sparkles, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#050811] text-slate-400 py-12 px-4 sm:px-6 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-extrabold text-lg tracking-wider text-white">КОНСПЕКТ</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
              Web Edition 2026
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Платформа синтеза реалистичных рукописных студенческих и школьных конспектов на базе нейросетей и компьютерного зрения.
          </p>
        </div>

        {/* System Health Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Supabase eu-central-1</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>Gemini 2.0 Flash</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>OpenCV 4.x</span>
          </div>
        </div>

        {/* Legal & copyright */}
        <div className="text-xs text-slate-400 text-center md:text-right font-mono">
          <div>© 2026 КОНСПЕКТ. Все права защищены.</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Zero Telegram Bot • Zero Vercel Serverless • Standalone Architecture
          </div>
        </div>

      </div>
    </footer>
  );
};
