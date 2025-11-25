import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { signIn } from '../lib/auth';

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: authError } = await signIn(email, password);

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'Credenciais inválidas. Tente novamente.'
            : authError.message
        );
        setIsLoading(false);
      }
      // Se não houver erro, o App.tsx vai detectar o usuário logado automaticamente
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  const isEmailValid = email.includes('@') && email.includes('.');

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="w-full max-w-md relative z-10 px-6">
        {/* Header */}
        <div className="flex flex-col items-center mb-12 animate-float">
          <h1 className="text-4xl font-bold tracking-tighter text-zinc-100">
            Sentinel<span className="text-zinc-600">.ai</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium tracking-wide">Acesso Administrativo</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group shadow-xl shadow-black/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">
                Email Corporativo
              </label>
              <div className="relative group/input">
                <Mail 
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    isEmailValid ? 'text-emerald-600' : 'text-zinc-600 group-focus-within/input:text-zinc-400'
                  }`} 
                  size={18} 
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">
                Senha de Acesso
              </label>
              <div className="relative group/input">
                <Lock 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-zinc-400 transition-colors" 
                  size={18} 
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-12 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group/check select-none">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                    rememberMe 
                      ? 'bg-zinc-700 border-zinc-700' 
                      : 'border-zinc-700 bg-transparent group-hover/check:border-zinc-500'
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && <Check size={10} className="text-zinc-200 stroke-[3px]" />}
                </div>
                <span className="text-xs text-zinc-500 group-hover/check:text-zinc-400 transition-colors">
                  Lembrar de mim
                </span>
              </label>
              <a 
                href="#" 
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors hover:underline decoration-zinc-700 underline-offset-4"
              >
                Esqueceu?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 text-red-400 text-xs bg-red-950/20 border border-red-900/30 p-3 rounded-lg animate-fade-in">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-zinc-100 hover:bg-white text-black font-medium rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 border border-transparent"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  Acessar Painel
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-zinc-700 font-mono flex items-center justify-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-600"></span>
            </span>
            System Operational • v1.0.0
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
