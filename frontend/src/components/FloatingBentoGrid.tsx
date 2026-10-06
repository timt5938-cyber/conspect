import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Camera, 
  Mic, 
  Layers, 
  Download, 
  Sliders, 
  Highlighter, 
  ArrowRight,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface FloatingBentoGridProps {
  onOpenAuth: () => void;
  onOpenStudio: () => void;
}

export const FloatingBentoGrid: React.FC<FloatingBentoGridProps> = ({
  onOpenAuth,
  onOpenStudio,
}) => {
  // Sandbox Demo state
  const [paperStyle, setPaperStyle] = useState<'squared_5mm' | 'ruled' | 'blank'>('squared_5mm');
  const [penColor, setPenColor] = useState<'blue' | 'black' | 'purple' | 'red'>('blue');
  const [hasHighlighter, setHasHighlighter] = useState(true);
  const [hasMargins, setHasMargins] = useState(true);
  const [jitter, setJitter] = useState(1.2);

  // Spotlight mouse effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const penHex = {
    blue: '#1d4ed8',
    black: '#0f172a',
    purple: '#6b21a8',
    red: '#991b1b',
  }[penColor];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#2DD4BF] font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Технологический стек
          </span>
          <h2 className="font-extrabold text-2xl sm:text-4xl text-white mt-2 tracking-tight">
            Возможности Студии Конспектов
          </h2>
        </div>
        <p className="font-mono text-xs sm:text-sm text-slate-400 max-w-md">
          Полный цикл: от сырого аудио лекции или снимка до реалистичной рукописной тетради в PDF.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* CARD 1: Interactive Sandbox Demo (8 Cols) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-12 lg:col-span-8 overflow-hidden rounded-3xl p-6 sm:p-8 bg-[#0B1120]/80 backdrop-blur-xl border border-white/10 hover:border-[#2DD4BF]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between"
        >
          {/* Radial Spotlight */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(550px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(45, 212, 191, 0.12), transparent 70%)`,
            }}
          />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30">
                Интерактивное Демо
              </span>
              <span className="font-mono text-xs text-slate-400">
                Попробуйте прямо сейчас
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Реалистичный тетрадный холст 5 мм
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Настоящие пропорции школьной и студенческой тетради. Настройте лист и тип пасты:
            </p>

            {/* Sandbox Controls Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-2xl bg-black/40 border border-white/10">
              {/* Paper style */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                <button
                  onClick={() => setPaperStyle('squared_5mm')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${paperStyle === 'squared_5mm' ? 'bg-[#2DD4BF] text-black font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Клетка 5 мм
                </button>
                <button
                  onClick={() => setPaperStyle('ruled')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${paperStyle === 'ruled' ? 'bg-[#2DD4BF] text-black font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Линейка
                </button>
                <button
                  onClick={() => setPaperStyle('blank')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${paperStyle === 'blank' ? 'bg-[#2DD4BF] text-black font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Белый лист
                </button>
              </div>

              {/* Pen color */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400">Чернила:</span>
                {(['blue', 'black', 'purple', 'red'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setPenColor(color)}
                    className={`w-5 h-5 rounded-full border-2 transition ${penColor === color ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{
                      backgroundColor: {
                        blue: '#1d4ed8',
                        black: '#0f172a',
                        purple: '#7e22ce',
                        red: '#b91c1c',
                      }[color]
                    }}
                  />
                ))}
              </div>

              {/* Toggles */}
              <button
                onClick={() => setHasHighlighter(!hasHighlighter)}
                className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition ${hasHighlighter ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-bold' : 'bg-white/5 text-slate-400 border-white/10'}`}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>Хайлайтер</span>
              </button>
            </div>

            {/* Sandbox Canvas Simulator */}
            <div 
              className="relative w-full rounded-2xl overflow-hidden p-6 sm:p-8 border border-white/20 shadow-inner min-h-[220px]"
              style={{
                backgroundColor: '#ffffff',
                backgroundImage: paperStyle === 'squared_5mm' 
                  ? 'radial-gradient(circle, #93c5fd 0.75px, transparent 0.75px), linear-gradient(to right, #bfdbfe 1px, transparent 1px), linear-gradient(to bottom, #bfdbfe 1px, transparent 1px)' 
                  : paperStyle === 'ruled'
                  ? 'linear-gradient(to bottom, transparent 23px, #93c5fd 24px)'
                  : 'none',
                backgroundSize: paperStyle === 'squared_5mm' ? '20px 20px' : paperStyle === 'ruled' ? '100% 24px' : 'auto',
              }}
            >
              {/* Red Margins Line */}
              {hasMargins && (
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-red-400/80 pointer-events-none"
                  style={{ left: '50px' }}
                />
              )}

              {/* Simulated Handwriting Content */}
              <div 
                className="relative z-10 pl-8 font-serif leading-relaxed"
                style={{ 
                  color: penHex,
                  fontFamily: '"Caveat", "Marck Script", cursive',
                  fontSize: '18px',
                  lineHeight: '28px'
                }}
              >
                <div className="font-bold text-lg mb-1" style={{ color: penHex }}>
                  Лекция 14. Квантовая теория поля и термодинамика
                </div>
                <div className="text-sm text-slate-600 mb-2">
                  Дата: 14.10.2026 • Проф. Смирнов А.В.
                </div>
                <div className="mb-2">
                  1. Основные постулаты: система находится в термодинамическом равновесии,{' '}
                  <span 
                    className="px-1 rounded"
                    style={{ backgroundColor: hasHighlighter ? 'rgba(254, 240, 138, 0.7)' : 'transparent' }}
                  >
                    если энтропия изолированной системы максимальна ($S \rightarrow \max$).
                  </span>
                </div>
                <div>
                  2. След-но, для изохорного процесса $dU = \delta Q$, т.к. работа газа $A = 0$.
                </div>
              </div>
            </div>
          </div>

          {/* Action Call */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <span className="text-xs text-slate-400">
              ✓ Процедурное дрожание строк • Жидкие чернила • Подлинный конспект
            </span>
            <button
              onClick={onOpenStudio}
              className="px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-[#2DD4BF] to-[#10B981] text-black hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-[#2DD4BF]/20"
            >
              <span>Открыть полную студию</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 2: Multimodal AI Lecture Engine (4 Cols) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-6 lg:col-span-4 overflow-hidden rounded-3xl p-6 sm:p-8 bg-[#0B1120]/80 backdrop-blur-xl border border-white/10 hover:border-[#2DD4BF]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between"
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(45, 212, 191, 0.12), transparent 70%)`,
            }}
          />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF] mb-5">
              <Mic className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Аудио, Фото & Текст
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Загружайте диктофонную запись лекции, снимки презентации с доски или копируйте текст. Нейросеть Gemini 2.5 Flash сожмет материал, выделит ключевые тезисы и сократит по-студенчески.
            </p>

            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
                <span>Голосовые и аудиофайлы лекций</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
                <span>Фотоснимки слайдов и страниц</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
                <span>Студенческие сокращения («т.к.», «след-но»)</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="font-mono text-[11px] text-[#2DD4BF] uppercase tracking-wider font-semibold">
              Gemini 2.5 Flash AI Multimodal
            </span>
          </div>
        </div>

        {/* CARD 3: Freeform A4 Calibration (6 Cols) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-6 lg:col-span-6 overflow-hidden rounded-3xl p-6 sm:p-8 bg-[#0B1120]/80 backdrop-blur-xl border border-white/10 hover:border-[#2DD4BF]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between"
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(45, 212, 191, 0.12), transparent 70%)`,
            }}
          />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
              <Camera className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Ваш почерк с чистого листа А4
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Никаких шаблонных бланков распечатывать не требуется! Напишите на обычном листе бумаги заглавные (А-Я), строчные (а-я) буквы и цифры (0-9). Алгоритм компьютерного зрения OpenCV автоматически выровняет перспективу и вырежет буквы.
            </p>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-slate-300 space-y-1">
              <div><span className="text-[#2DD4BF] font-bold">1. Заглавные:</span> А Б В Г Д Е Ж З И ...</div>
              <div><span className="text-[#2DD4BF] font-bold">2. Строчные:</span> а б в г д е ж з и ...</div>
              <div><span className="text-[#2DD4BF] font-bold">3. Цифры:</span> 0 1 2 3 4 5 6 7 8 9</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-[11px] text-indigo-400 uppercase tracking-wider font-semibold">
              OpenCV Perspective Homography
            </span>
            <button
              onClick={onOpenStudio}
              className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 transition"
            >
              <span>Попробовать</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 4: Multi-page Vector PDF Generator (6 Cols) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-12 lg:col-span-6 overflow-hidden rounded-3xl p-6 sm:p-8 bg-[#0B1120]/80 backdrop-blur-xl border border-white/10 hover:border-[#2DD4BF]/50 transition-all duration-300 shadow-2xl flex flex-col justify-between"
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(45, 212, 191, 0.12), transparent 70%)`,
            }}
          />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Многостраничный PDF для печати
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Готовый файл компилируется в стандартный международный формат А4 с 300 DPI через движок ReportLab. Конспект выглядит так, будто вы писали его от руки шариковой ручкой прямо на парах — можно сразу отправлять преподавателю или пускать на принтер.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-base font-bold text-white">300 DPI</span>
                <span className="text-[10px] text-slate-400 uppercase">Чёткость</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-base font-bold text-white">100%</span>
                <span className="text-[10px] text-slate-400 uppercase">Вектор</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-base font-bold text-white">Cloud</span>
                <span className="text-[10px] text-slate-400 uppercase">Supabase</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">
              ReportLab & Pillow Engine
            </span>
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5"
            >
              <span>Создать аккаунт</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
