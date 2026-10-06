import React from 'react';
import { Sparkles, User, LogOut, FileText, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface NavbarProps {
  currentView: 'landing' | 'studio';
  onNavigate: (view: 'landing' | 'studio') => void;
  user: SupabaseUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenCalibration: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onSignOut,
  onOpenCalibration,
}) => {
  return (
    <nav className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3.5 backdrop-blur-2xl bg-[#050811]/80 border-b border-white/10 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white flex items-center gap-2">
              КОНСПЕКТ
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 font-bold">
                Сделано ssskkkliieee
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
              Студия Рукописных Тетрадей
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-[#0B1120]/90 border border-white/10 text-xs font-medium">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              currentView === 'landing'
                ? 'bg-white/10 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Главная
          </button>
          
          <a
            href="#bento-features"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('bento-features')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            Возможности
          </a>

          <a
            href="#calibration-guide"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('calibration-guide')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            Инструкция A4
          </a>

          <button
            onClick={() => onNavigate('studio')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              currentView === 'studio'
                ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
            Студия
          </button>
        </div>

        {/* Right Section: Auth & CTA */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCalibration}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
              >
                <FileText className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Калибровка A4</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B1120] border border-white/10 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center font-bold text-[10px]">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-300 font-mono text-[11px] max-w-[120px] truncate hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={onSignOut}
                  title="Выйти"
                  className="text-slate-400 hover:text-rose-400 ml-1 p-0.5 rounded transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
              >
                Войти
              </button>

              <button
                onClick={() => onNavigate('studio')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#2DD4BF] to-teal-400 hover:from-teal-300 hover:to-cyan-400 text-slate-950 transition shadow-md shadow-[#2DD4BF]/20 flex items-center gap-1.5 active:scale-95"
              >
                <span>В Студию</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
