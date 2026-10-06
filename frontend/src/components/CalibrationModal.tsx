import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Loader2, Camera, Sparkles, FileText } from 'lucide-react';
import { api } from '../api/client';

interface CalibrationModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onCalibrationSuccess: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  userId,
  isOpen,
  onClose,
  onCalibrationSuccess
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResultMessage(null);
    setErrorMessage(null);
    setExtractedCount(null);

    try {
      const res = await api.uploadCalibration(userId, file);
      setResultMessage(res.message || 'Калибровка успешно завершена!');
      setExtractedCount(res.extracted_count);
      onCalibrationSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка обработки фото листа А4');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#0B1120]/95 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto cyber-scrollbar"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 35px -5px rgba(45, 212, 191, 0.2)'
        }}
      >
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 mb-3">
            <Camera className="w-3.5 h-3.5" />
            A4 OpenCV Calibration
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Калибровка вашего почерка
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Компьютерное зрение сегментирует рукописные глифы и обучит векторную модель вашим особенностям нажима и наклона.
          </p>
        </div>

        {/* Instructions Card */}
        <div className="p-4 rounded-2xl bg-[#050811] border border-white/10 space-y-3 text-xs mb-6">
          <p className="font-bold text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2DD4BF]" />
            Что написать на чистом листе А4:
          </p>
          <div className="space-y-2 font-mono text-[11px] bg-white/5 p-3.5 rounded-xl border border-white/5">
            <div>
              <span className="font-bold text-[#2DD4BF]">1. Заглавные: </span>
              <span className="text-slate-300">А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я</span>
            </div>
            <div>
              <span className="font-bold text-[#2DD4BF]">2. Строчные: </span>
              <span className="text-slate-300">а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я</span>
            </div>
            <div>
              <span className="font-bold text-[#2DD4BF]">3. Цифры: </span>
              <span className="text-amber-300">0 1 2 3 4 5 6 7 8 9</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Сфотографируйте лист строго сверху при дневном или ярком комнатном освещении.
          </p>
        </div>

        {/* Upload Dropzone */}
        <label className="flex flex-col items-center justify-center p-7 border-2 border-dashed border-[#2DD4BF]/30 hover:border-[#2DD4BF] rounded-2xl bg-[#050811]/60 hover:bg-[#2DD4BF]/5 cursor-pointer transition group">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2.5 py-3">
              <Loader2 className="w-8 h-8 text-[#2DD4BF] animate-spin" />
              <span className="text-xs font-bold text-white">Выполняем перспективную гомографию и сегментацию...</span>
              <span className="text-[11px] text-slate-400">Это может занять 3-5 секунд</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-white">
                Загрузить фото листа А4
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Поддерживаются JPG, PNG, WEBP любого разрешения со смартфона
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        {/* Feedback Messages */}
        {resultMessage && (
          <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-200">Почерк успешно обучен!</div>
              <div>{resultMessage}</div>
              {extractedCount !== null && (
                <div className="text-[11px] text-emerald-400/80 mt-1">
                  Извлечено и векторизовано глифов: {extractedCount}
                </div>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-200">Ошибка обработки</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
        >
          {resultMessage ? 'Отлично, применить в Студии' : 'Закрыть'}
        </button>
      </div>
    </div>
  );
};
