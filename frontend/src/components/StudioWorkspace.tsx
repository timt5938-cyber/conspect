import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  FileText, 
  Eye, 
  Download, 
  Sliders, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  Loader2, 
  ZoomIn, 
  ZoomOut, 
  Upload, 
  Key, 
  FolderArchive,
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api, PresetsResponse, GenerateResponse } from '../api/client';
import { CalibrationModal } from './CalibrationModal';
import { SettingsModal } from './SettingsModal';
import { User as SupabaseUser } from '@supabase/supabase-js';

const SAMPLE_LECTURES = [
  {
    label: "Основы Python",
    text: `Тема: Основы языка Python

1. Типы данных и переменные
Python является языком с динамической типизацией.
Основные типы: int, float, str, bool, list, dict, set, tuple.
[ВАЖНО] Списки изменяемы (mutable), а кортежи неизменяемы (immutable).
[ФОРМУЛА] result = [x**2 for x in range(10) if x % 2 == 0]
2. Функции и замыкания
Функции определяются ключевым словом def и являются объектами первого класса.
[ВЫВОД] Python идеален для быстрой разработки и анализа данных.`
  },
  {
    label: "Базы данных и ACID",
    text: `Тема: Транзакции в реляционных СУБД

1. Понятие транзакции
Транзакция — логическая единица работы, неделимая последовательность SQL-команд.
[ВАЖНО] Каждая транзакция обязана удовлетворять принципам ACID:
- Atomicity (Атомарность) -> все или ничего
- Consistency (Согласованность) -> целостность данных
- Isolation (Изолированность) -> независимость потоков
- Durability (Долговечность) -> сохранение на диске
[ФОРМУЛА] BEGIN TRANSACTION; UPDATE accounts SET balance = balance - 100; COMMIT;
[ВЫВОД] ACID гарантирует надежность критических финансовых операций.`
  },
  {
    label: "Физика: Законы Ньютона",
    text: `Тема: Законы классической механики

1. Инерциальные системы отсчета
Существуют системы, в которых тело сохраняет состояние покоя или равномерного прямолинейного движения.
[ФОРМУЛА] F = m * a
2. Третий закон динамики
Действию всегда есть равное и противоположное противодействие.
[ВАЖНО] Силы взаимодействия имеют одинаковую физическую природу и направлены вдоль одной прямой.
[ВЫВОД] Механика Ньютона применима для макрообъектов на скоростях много меньше скорости света.`
  }
];

interface StudioWorkspaceProps {
  user: SupabaseUser | null;
  onOpenAuth: () => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  user,
  onOpenAuth,
}) => {
  // Effective user ID: Supabase UUID if logged in, or anonymous persistent UUID
  const [effectiveUserId] = useState(() => {
    if (user?.id) return user.id;
    let stored = localStorage.getItem('conspect_anon_uid');
    if (!stored) {
      stored = 'guest-' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('conspect_anon_uid', stored);
    }
    return stored;
  });

  const activeUserId = user?.id || effectiveUserId;

  // Editor states
  const [text, setText] = useState(SAMPLE_LECTURES[1].text);
  const [mode, setMode] = useState('smart'); // 'smart' or 'verbatim'

  // Customization state
  const [paperStyle, setPaperStyle] = useState('squared_5mm');
  const [hasMargins, setHasMargins] = useState(true);
  const [penColor, setPenColor] = useState('blue_ballpoint');
  const [fontPreset, setFontPreset] = useState('marck_script');
  const [jitter, setJitter] = useState(1.0);
  const [slant, setSlant] = useState(1.0);
  const [humanize, setHumanize] = useState(true);

  // Settings & Modals
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Live preview & data
  const [presetsData, setPresetsData] = useState<PresetsResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [zoomPreview, setZoomPreview] = useState(false);

  // Generation state & results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GenerateResponse | null>(null);
  const [savedHistory, setSavedHistory] = useState<any[]>([]);

  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch presets on mount
  useEffect(() => {
    api.getPresets()
      .then(setPresetsData)
      .catch((err) => console.error('Presets error:', err));
  }, []);

  // Fetch saved user conspectuses
  useEffect(() => {
    if (activeUserId) {
      api.getUserConspectuses(activeUserId)
        .then(setSavedHistory)
        .catch(() => {});
    }
  }, [activeUserId, generatedResult]);

  // Live preview debounce
  useEffect(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    setIsLoadingPreview(true);
    previewTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.getPreview({
          text,
          paper_style: paperStyle,
          has_margins: hasMargins,
          pen_color: penColor,
          font_preset: fontPreset,
          jitter,
          slant,
          humanize,
        });
        setPreviewUrl(res.page_preview_base64);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error('Failed to load preview:', err);
      } finally {
        setIsLoadingPreview(false);
      }
    }, 450);

    return () => {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    };
  }, [text, paperStyle, hasMargins, penColor, fontPreset, jitter, slant, humanize]);

  // Generate full PDF
  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const res = await api.generate({
        user_id: activeUserId,
        text,
        mode,
        paper_style: paperStyle,
        has_margins: hasMargins,
        pen_color: penColor,
        font_preset: fontPreset,
        jitter,
        slant,
        humanize,
        custom_gemini_key: geminiKey || undefined,
      });

      setGeneratedResult(res);

      // Trigger instant browser download if PDF base64 is available
      if (res.pdf_base64) {
        const link = document.createElement('a');
        link.href = res.pdf_base64;
        link.download = `${res.title || 'conspectus'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert(err.message || 'Ошибка генерации конспекта');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
              Рабочая область
            </span>
            {!user && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Гостевой режим (локально)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Студия Синтеза Конспектов
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCalibrationOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1120] hover:bg-white/10 border border-white/10 text-white transition active:scale-95 shadow"
          >
            <Upload className="w-4 h-4 text-[#2DD4BF]" />
            <span>Калибровка A4</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B1120] hover:bg-white/10 border border-white/10 text-slate-300 transition"
            title="Настройки Gemini API"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">API Ключ</span>
          </button>

          {!user && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/10 text-white transition"
            >
              <span>Войти</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Controls (Left) + Live Page Preview & Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input & Customizer (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION 1: Text Editor */}
          <div className="rounded-3xl p-6 bg-[#0B1120]/80 border border-white/10 shadow-xl space-y-4">
            
            {/* Mode switch */}
            <div className="flex p-1 rounded-xl bg-[#050811] border border-white/5">
              <button
                onClick={() => setMode('smart')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  mode === 'smart'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Умный конспект (Gemini 2.0)</span>
              </button>

              <button
                onClick={() => setMode('verbatim')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  mode === 'verbatim'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Слово в слово</span>
              </button>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs cyber-scrollbar">
              <span className="text-slate-400 text-[11px] font-mono shrink-0">Примеры:</span>
              {SAMPLE_LECTURES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setText(sample.text)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#2DD4BF]/15 hover:border-[#2DD4BF]/40 text-slate-300 hover:text-[#2DD4BF] text-[11px] font-medium transition border border-white/5"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Вставьте сюда текст лекции, формулы или конспект..."
                rows={8}
                className="w-full p-4 rounded-2xl bg-[#050811] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition resize-none cyber-scrollbar font-mono"
              />
              <div className="absolute bottom-3 right-4 text-[11px] font-mono text-slate-400">
                {text.length} симв.
              </div>
            </div>
          </div>

          {/* SECTION 2: Notebook & Handwriting Customizer */}
          <div className="rounded-3xl p-6 bg-[#0B1120]/80 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="w-4 h-4 text-[#2DD4BF]" />
              <h3 className="font-bold text-white text-sm">
                Параметры тетради и почерка
              </h3>
            </div>

            {/* Handwriting Preset Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Стиль почерка:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {presetsData?.presets.map((preset) => {
                  const isSelected = fontPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setFontPreset(preset.id)}
                      className={`p-3 rounded-2xl text-left border transition relative cursor-pointer ${
                        isSelected
                          ? 'border-[#2DD4BF] bg-[#2DD4BF]/10 shadow-[0_0_15px_-3px_rgba(45,212,191,0.25)]'
                          : 'border-white/10 bg-[#050811] hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs text-white flex items-center justify-between">
                        <span>{preset.name}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {preset.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ink & Paper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Pen Ink */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Цвет ручки:
                </label>
                <div className="flex items-center gap-2.5">
                  {presetsData?.pen_colors.map((color) => {
                    const isSelected = penColor === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => setPenColor(color.id)}
                        title={color.name}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition active:scale-90 cursor-pointer ${
                          isSelected ? 'ring-2 ring-offset-2 ring-offset-[#0B1120] ring-[#2DD4BF] scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paper Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Разметка листа:
                </label>
                <select
                  value={paperStyle}
                  onChange={(e) => setPaperStyle(e.target.value)}
                  className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-white/10 bg-[#050811] text-white outline-none focus:border-[#2DD4BF] cursor-pointer"
                >
                  {presetsData?.paper_styles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggles & Sliders */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              
              {/* Margins toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Красные тетрадные поля (25 мм)</div>
                  <div className="text-[11px] text-slate-400">Школьная и студенческая вертикальная отсечка</div>
                </div>
                <input
                  type="checkbox"
                  checked={hasMargins}
                  onChange={(e) => setHasMargins(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2DD4BF] focus:ring-[#2DD4BF] bg-[#050811] border-white/20 cursor-pointer"
                />
              </div>

              {/* Humanize markers */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Выделения маркером и рамки формул</div>
                  <div className="text-[11px] text-slate-400">Неровное рукописное обведение ключевых определений</div>
                </div>
                <input
                  type="checkbox"
                  checked={humanize}
                  onChange={(e) => setHumanize(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2DD4BF] focus:ring-[#2DD4BF] bg-[#050811] border-white/20 cursor-pointer"
                />
              </div>

              {/* Jitter */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                  <span>Неровность строк (дрожание руки):</span>
                  <span className="text-[#2DD4BF] font-bold">{jitter.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.2"
                  value={jitter}
                  onChange={(e) => setJitter(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#050811] rounded-lg appearance-none cursor-pointer accent-[#2DD4BF]"
                />
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Live Page Preview & Generation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          
          <div className="rounded-3xl p-6 bg-[#0B1120]/80 border border-white/10 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#2DD4BF]" />
                <span className="font-bold text-white text-sm">Живое превью тетради</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                  1 из {totalPages} стр.
                </span>
                <button
                  onClick={() => setZoomPreview(!zoomPreview)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                  title="Масштаб"
                >
                  {zoomPreview ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Preview Viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-[#050811] border border-white/10 flex items-center justify-center min-h-[380px] p-2">
              {isLoadingPreview && (
                <div className="absolute inset-0 bg-[#050811]/75 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 text-white">
                  <Loader2 className="w-7 h-7 text-[#2DD4BF] animate-spin" />
                  <span className="text-xs font-mono text-slate-300">Рендеринг тетрадного листа...</span>
                </div>
              )}

              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Превью тетради"
                  className={`transition-all duration-300 rounded shadow-2xl object-contain max-h-[500px] w-auto ${
                    zoomPreview ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  onClick={() => setZoomPreview(!zoomPreview)}
                />
              ) : (
                <div className="text-center p-6 text-slate-500 font-mono text-xs">
                  Загрузка предпросмотра страницы...
                </div>
              )}
            </div>

            {/* Big Action: Generate Full PDF */}
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating || isLoadingPreview}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2DD4BF] to-teal-400 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-extrabold text-sm transition-all duration-200 shadow-xl shadow-[#2DD4BF]/20 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Синтезируем рукописный PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Сгенерировать и скачать PDF</span>
                </>
              )}
            </button>

            {/* Generated Result Banner */}
            {generatedResult && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 space-y-2 animate-fade-in text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Конспект успешно готов! ({generatedResult.page_count} стр.)</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {generatedResult.title}
                </div>
                {generatedResult.pdf_url && (
                  <a
                    href={generatedResult.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#2DD4BF] hover:underline font-mono"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Открыть сохраненный файл в Supabase Storage</span>
                  </a>
                )}
              </div>
            )}

          </div>

          {/* Saved Conspectuses History */}
          {savedHistory.length > 0 && (
            <div className="rounded-3xl p-5 bg-[#0B1120]/70 border border-white/10 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <FolderArchive className="w-4 h-4 text-[#2DD4BF]" />
                <span>Сохраненные конспекты в Supabase</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto cyber-scrollbar">
                {savedHistory.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.pdf_url || item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#050811] hover:bg-white/5 border border-white/5 text-xs text-slate-300 transition"
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-white truncate">{item.title || 'Конспект'}</div>
                      <div className="text-[10px] text-slate-400">{item.page_count || 1} стр.</div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Calibration Modal */}
      <CalibrationModal
        userId={activeUserId}
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        onCalibrationSuccess={() => {
          // Trigger preview reload with calibrated font
          setFontPreset('calibrated_custom');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiKey={geminiKey}
        setGeminiKey={setGeminiKey}
      />
    </div>
  );
};
