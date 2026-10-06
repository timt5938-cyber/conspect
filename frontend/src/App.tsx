import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  Layers, 
  FileCheck, 
  Zap, 
  ChevronRight,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LiquidChromeLogo } from './components/LiquidChromeLogo';
import { FloatingBentoGrid } from './components/FloatingBentoGrid';
import { HandwritingScrollGuide } from './components/HandwritingScrollGuide';
import { StudioWorkspace } from './components/StudioWorkspace';
import { AuthModal } from './components/AuthModal';
import { CalibrationModal } from './components/CalibrationModal';
import { Footer } from './components/Footer';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);

  const { user, signOut } = useSupabaseAuth();

  // Active user UUID or anonymous fallback
  const activeUserId = user?.id || 'guest-' + (localStorage.getItem('conspect_anon_uid') || 'anonymous');

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-[#2DD4BF]/30 selection:text-white relative overflow-x-hidden washi-grain font-sans">
      
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-[#2DD4BF]/10 via-teal-900/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-blue-600/5 blur-[100px] pointer-events-none -z-10" />

      {/* Navigation Capsule */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={async () => {
          try {
            await signOut();
          } catch (e) {
            console.error(e);
          }
        }}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' ? (
          <>
            {/* HERO SECTION */}
            <section className="relative pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 flex flex-col items-center justify-center text-center">
              
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-float-1">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
                <span className="font-mono text-xs text-slate-300 font-semibold tracking-wide">
                  Сделано ssskkkliieee • Без шаблонов • Чистый А4
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Liquid Chrome 3D Logo Component */}
              <div className="w-full max-w-4xl mx-auto my-2 sm:my-4 flex justify-center">
                <LiquidChromeLogo 
                  text="КОНСПЕКТ" 
                  subtitle="Студия реалистичных рукописных конспектов" 
                />
              </div>

              {/* Subheading */}
              <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed mt-6 mb-10">
                Превратите любой текст, лекцию или конспект в живую рукописную тетрадь. 
                Реалистичный нажим, дрожание руки, поля 25 мм и калибровка под ваш личный почерк по одному обычному листу А4.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
                <button
                  onClick={() => {
                    setCurrentView('studio');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-[#2DD4BF] to-teal-400 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-extrabold text-sm transition-all duration-200 shadow-xl shadow-[#2DD4BF]/25 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  <span>Открыть Студию</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href="#calibration-guide"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Калибровка А4</span>
                </a>
              </div>

              {/* Micro stats banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 mt-16 pt-8 border-t border-white/10 max-w-3xl mx-auto font-mono text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">5 мм</div>
                  <div className="text-xs text-slate-400 mt-1">Тетрадная клетка</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#2DD4BF] tracking-tight">OpenCV</div>
                  <div className="text-xs text-slate-400 mt-1">Авто-гомография</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">2.0 Flash</div>
                  <div className="text-xs text-slate-400 mt-1">Синтез тезисов</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#2DD4BF] tracking-tight">100%</div>
                  <div className="text-xs text-slate-400 mt-1">Без шаблонов</div>
                </div>
              </div>
            </section>

            {/* BENTO GRID WITH INTERACTIVE SANDBOX DEMO */}
            <section id="bento-features" className="relative scroll-mt-20">
              <FloatingBentoGrid
                onOpenAuth={() => setIsAuthOpen(true)}
                onOpenStudio={() => {
                  setCurrentView('studio');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </section>

            {/* HIGH-CONTRAST A4 CALIBRATION WALKTHROUGH */}
            <HandwritingScrollGuide
              onStartCalibration={() => setIsCalibrationOpen(true)}
            />

            {/* BOTTOM CALL TO ACTION */}
            <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-16">
              <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-[#2DD4BF]/30 bg-gradient-to-br from-[#0B1120] via-[#050811] to-[#0B1120] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-2 max-w-xl">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Готовы сгенерировать свой первый конспект?
                  </h3>
                  <p className="text-sm text-slate-300">
                    Перейдите в Студию, вставьте текст лекции и скачайте готовый многостраничный PDF за 5 секунд.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentView('studio');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2DD4BF] to-teal-400 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-[#2DD4BF]/25 flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <span>Перейти в Студию</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          </>
        ) : (
          /* STUDIO WORKSPACE VIEW */
          <StudioWorkspace
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* A4 Handwriting Calibration Modal */}
      <CalibrationModal
        userId={activeUserId}
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        onCalibrationSuccess={() => {
          setIsCalibrationOpen(false);
          setCurrentView('studio');
        }}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
};
