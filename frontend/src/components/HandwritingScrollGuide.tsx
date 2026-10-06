import React from 'react';
import { 
  FileText, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Maximize, 
  UploadCloud,
  ArrowRight
} from 'lucide-react';

interface HandwritingScrollGuideProps {
  onStartCalibration: () => void;
}

export const HandwritingScrollGuide: React.FC<HandwritingScrollGuideProps> = ({
  onStartCalibration,
}) => {
  const uppercaseLetters = "А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я".split(" ");
  const lowercaseLetters = "а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я".split(" ");
  const digitsAndSymbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "-", "=", "(", ")", "!", "?", "%"];

  return (
    <section id="calibration-guide" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#2DD4BF] font-bold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Калибровка без принтера
          </span>
          <h2 className="font-extrabold text-2xl sm:text-4xl text-white mt-2 tracking-tight">
            Обучите систему своему личному почерку
          </h2>
        </div>
        <p className="font-mono text-xs sm:text-sm text-slate-400 max-w-md">
          Никаких платных бланков и специальных шаблонов. Только чистый белый лист А4 и ваша любимая ручка.
        </p>
      </div>

      {/* Main Grid: Guide Steps + Simulated A4 Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Steps Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* STEP 1: Uppercase */}
          <div className="rounded-3xl p-6 sm:p-7 bg-[#0B1120]/80 border border-white/10 hover:border-white/20 transition-all shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] font-mono font-bold text-sm flex items-center justify-center">
                  01
                </span>
                <h3 className="text-lg font-bold text-white">
                  Заглавные буквы (А–Я)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                33 буквы
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Напишите в верхней трети листа заглавный русский алфавит с небольшим интервалом:
            </p>

            <div className="flex flex-wrap gap-1.5 p-3.5 rounded-2xl bg-[#050811] border border-white/5">
              {uppercaseLetters.map((char) => (
                <span
                  key={char}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs font-bold hover:bg-[#2DD4BF]/20 hover:border-[#2DD4BF]/50 hover:text-[#2DD4BF] transition cursor-default"
                >
                  {char}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
              Буквы не должны слипаться или пересекаться между собой.
            </p>
          </div>

          {/* STEP 2: Lowercase */}
          <div className="rounded-3xl p-6 sm:p-7 bg-[#0B1120]/80 border border-white/10 hover:border-white/20 transition-all shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] font-mono font-bold text-sm flex items-center justify-center">
                  02
                </span>
                <h3 className="text-lg font-bold text-white">
                  Строчные буквы (а–я)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                33 буквы
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              В средней части листа напишите строчные буквы своим естественным почерком:
            </p>

            <div className="flex flex-wrap gap-1.5 p-3.5 rounded-2xl bg-[#050811] border border-white/5">
              {lowercaseLetters.map((char) => (
                <span
                  key={char}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-200 font-mono text-xs hover:bg-[#2DD4BF]/20 hover:border-[#2DD4BF]/50 hover:text-[#2DD4BF] transition cursor-default"
                >
                  {char}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
              Пишите свободно, как на обычной лекции, соблюдая привычный наклон.
            </p>
          </div>

          {/* STEP 3: Digits & Symbols */}
          <div className="rounded-3xl p-6 sm:p-7 bg-[#0B1120]/80 border border-white/10 hover:border-white/20 transition-all shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] font-mono font-bold text-sm flex items-center justify-center">
                  03
                </span>
                <h3 className="text-lg font-bold text-white">
                  Цифры и базовые математические знаки
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
                18 символов
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              В нижней части листа добавьте цифры от 0 до 9 и часто используемые знаки:
            </p>

            <div className="flex flex-wrap gap-1.5 p-3.5 rounded-2xl bg-[#050811] border border-white/5">
              {digitsAndSymbols.map((char) => (
                <span
                  key={char}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-amber-300/90 font-mono text-xs font-bold hover:bg-[#2DD4BF]/20 hover:border-[#2DD4BF]/50 hover:text-[#2DD4BF] transition cursor-default"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* STEP 4: Camera Tips */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#0B1120] to-[#050811] border border-cyan-500/20 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-5 h-5 text-[#2DD4BF]" />
              <h3 className="text-base font-bold text-white">
                3 простых правила съемки листа
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <div className="font-bold text-white mb-1">1. Сверху вниз</div>
                <div className="text-slate-400 text-[11px]">Держите телефон параллельно столу без резкого угла.</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <div className="font-bold text-white mb-1">2. Без тени</div>
                <div className="text-slate-400 text-[11px]">Включите верхний свет, чтобы рука не отбрасывала тень.</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <div className="font-bold text-white mb-1">3. Все 4 угла</div>
                <div className="text-slate-400 text-[11px]">Компьютерное зрение автоматически выровняет лист.</div>
              </div>
            </div>
          </div>

        </div>

        {/* Visual Mock Sheet Column (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="rounded-3xl p-6 sm:p-7 bg-[#0B1120]/90 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#2DD4BF] uppercase tracking-wider font-bold">
                Образец листа А4
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                210 × 297 мм
              </span>
            </div>

            {/* Simulated Clean A4 Sheet with realistic ink */}
            <div 
              className="relative rounded-2xl overflow-hidden p-6 aspect-[1/1.35] shadow-2xl border border-slate-700/60 flex flex-col justify-between"
              style={{
                backgroundColor: '#FBFBFA',
                backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0)',
                backgroundSize: '16px 16px',
                color: '#1E293B',
              }}
            >
              {/* Corner Markers (Simulating auto-homography detection) */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-teal-600/60" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-teal-600/60" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-teal-600/60" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-teal-600/60" />

              {/* Top Header Section */}
              <div className="space-y-4">
                <div className="border-b border-dashed border-slate-300 pb-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>ОБРАЗЕЦ ПОЧЕРКА СТУДЕНТА</span>
                  <span>A4 CALIBRATION</span>
                </div>

                {/* Section 1: Uppercase Ink Sample */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Строка 1: Заглавные (А-Я)
                  </div>
                  <div 
                    className="text-base sm:text-lg font-bold tracking-widest text-[#1D4ED8]"
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  >
                    А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я
                  </div>
                </div>

                {/* Section 2: Lowercase Ink Sample */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Строка 2: Строчные (а-я)
                  </div>
                  <div 
                    className="text-base sm:text-lg tracking-wider text-[#1D4ED8]"
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  >
                    а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я
                  </div>
                </div>

                {/* Section 3: Digits Ink Sample */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Строка 3: Цифры и формулы
                  </div>
                  <div 
                    className="text-base sm:text-lg font-bold tracking-widest text-[#1D4ED8]"
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  >
                    0 1 2 3 4 5 6 7 8 9   (a + b)² = a² + 2ab + b²
                  </div>
                </div>
              </div>

              {/* Bottom Sheet Validation Badge */}
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Распознавание OpenCV: 33 заглавных, 33 строчных, 10 цифр</span>
              </div>
            </div>

            {/* Direct Calibration CTA */}
            <button
              onClick={onStartCalibration}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#2DD4BF] to-teal-400 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-[#2DD4BF]/20 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Загрузить лист и обучить почерк</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
