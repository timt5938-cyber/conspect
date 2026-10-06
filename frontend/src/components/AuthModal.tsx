import React, { useState } from 'react';
import { X, Mail, Lock, Sparkles, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { signIn, signUp } = useSupabaseAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        await signUp(email, password);
        setSuccessMsg('Регистрация успешна! Если настроено подтверждение, проверьте почту, либо войдите.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Ошибка аутентификации';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Неверный email или пароль';
      } else if (msg.includes('User already registered')) {
        msg = 'Пользователь с таким email уже зарегистрирован';
      } else if (msg.includes('Password should be at least')) {
        msg = 'Пароль должен содержать минимум 6 символов';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#0B1120]/95 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-white overflow-hidden"
        style={{
          boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px -5px rgba(45, 212, 191, 0.15)'
        }}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

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
            <Sparkles className="w-3.5 h-3.5" />
            Supabase Cloud Auth
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {mode === 'signin' ? 'Вход в Студию' : 'Создать аккаунт'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Сохраняйте свои рукописные шрифты, калибровки A4 и историю PDF конспектов в облаке.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 mb-6 rounded-xl bg-[#050811] border border-white/5">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Войти
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050811] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050811] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-teal-400 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-[#2DD4BF]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Обработка...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Войти в аккаунт' : 'Зарегистрироваться'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer text */}
        <div className="mt-5 text-center text-xs text-slate-500">
          Защищено RLS-политиками Supabase (EU Central)
        </div>
      </div>
    </div>
  );
};
