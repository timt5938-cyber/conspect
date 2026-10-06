import React, { useState } from 'react';
import { X, Key, Database, Sparkles, Check, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  setGeminiKey: (k: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  geminiKey,
  setGeminiKey
}) => {
  const [localKey, setLocalKey] = useState(geminiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiKey(localKey);
    localStorage.setItem('user_gemini_api_key', localKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#0B1120]/95 border border-white/10 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl text-white space-y-5"
        style={{
          boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px -5px rgba(45, 212, 191, 0.15)'
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-[#2DD4BF]" />
            <span>Параметры и API ключи</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Gemini API Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Пользовательский Google Gemini API Key:
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="AIzaSy... (необязательно, по умолчанию серверный)"
              className="w-full p-3 rounded-xl bg-[#050811] border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Бесплатный ключ можно получить в{' '}
              <a 
                href="https://aistudio.google.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#2DD4BF] hover:underline"
              >
                Google AI Studio
              </a>
              . Если оставить пустым, синтез выполняется через центральный сервер.
            </p>
            <button
              onClick={handleSave}
              className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-teal-400 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow cursor-pointer"
            >
              {saved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>{saved ? 'Ключ сохранен!' : 'Сохранить ключ'}</span>
            </button>
          </div>

          {/* Cloud Info */}
          <div className="p-3.5 rounded-2xl bg-[#050811] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">База данных Supabase</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                conspect: Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200">Нейросеть реструктуризации</span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">
                gemini-2.0-flash
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
        >
          Готово
        </button>
      </div>
    </div>
  );
};
