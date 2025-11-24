import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, Loader2, Shield } from 'lucide-react';
import { signIn } from '../lib/auth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await signIn(email, password);
      
      if (authError) {
        setError(authError.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : authError.message);
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-zinc-800/20 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-zinc-100 rounded-2xl blur-xl opacity-20" />
              <div className="relative w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
                <Shield className="w-8 h-8 text-black" />
              </div>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-zinc-100 tracking-tight mb-2"
          >
            Sentinel
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm text-zinc-500"
          >
            Monitor de Erros n8n
          </motion.p>
        </div>

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-100 hover:bg-white text-black font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-zinc-600 text-center">
              Acesso restrito a usuários autorizados
            </p>
          </div>
        </motion.div>

        {/* Version info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center text-xs text-zinc-700 mt-6"
        >
          Sentinel Dashboard v1.0.0
        </motion.p>
      </motion.div>
    </div>
  );
};
