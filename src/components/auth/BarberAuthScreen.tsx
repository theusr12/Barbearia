import React, { useState } from 'react';
import {
  Scissors,
  Lock,
  Mail,
  User,
  Store,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BarberAuthScreen: React.FC = () => {
  const { loginWithFirebase, registerWithFirebase } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regBarbershop, setRegBarbershop] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSlug, setRegSlug] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Preencha seu e-mail e sua senha.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithFirebase(loginEmail, loginPassword);
    setIsLoading(false);

    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regName.trim()) {
      setErrorMessage('Informe o nome do barbeiro.');
      return;
    }
    if (!regBarbershop.trim()) {
      setErrorMessage('Informe o nome da barbearia.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    const res = await registerWithFirebase({
      email: regEmail,
      password: regPassword,
      name: regName,
      barbershopName: regBarbershop,
      phone: regPhone || '11999998888',
      slug: regSlug || regBarbershop.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    });
    setIsLoading(false);

    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const fillQuickDemo = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-lg">
        {/* Brand Card Top */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/5 mb-1">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight font-serif">
            Aura<span className="text-amber-500">Barber</span> Studio
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Área exclusiva do profissional. Acesse sua agenda, catálogo de serviços e métricas financeiras.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            Backend Real Ativo (Firebase Auth SDK)
          </div>
        </div>

        {/* Auth Box */}
        <div className="rounded-3xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 text-neutral-900 dark:text-neutral-100">
          {/* Tabs: Entrar vs Criar Conta */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-neutral-850 text-neutral-900 dark:text-amber-400 shadow-sm font-black'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              Fazer Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-neutral-850 text-neutral-900 dark:text-amber-400 shadow-sm font-black'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              Criar Nova Barbearia
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  E-mail do Barbeiro
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@barbearia.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha secreta"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Pre-fill */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
                  Ou crie uma nova conta ao lado, ou teste com uma conta demo:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('marcos@vintageblade.com.br', '123456')}
                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 bg-neutral-50 dark:bg-neutral-950 text-left text-xs transition-colors"
                  >
                    <p className="font-bold text-neutral-800 dark:text-neutral-200 truncate">
                      Marcos Silva
                    </p>
                    <p className="text-[10px] text-neutral-400">Preencher teste</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('lucas@goldfade.com.br', '123456')}
                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 bg-neutral-50 dark:bg-neutral-950 text-left text-xs transition-colors"
                  >
                    <p className="font-bold text-neutral-800 dark:text-neutral-200 truncate">
                      Lucas Fade
                    </p>
                    <p className="text-[10px] text-neutral-400">Preencher teste</p>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Seu Nome *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Matheus Duarte"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        if (!regSlug) {
                          setRegSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Nome da Barbearia *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Razor Studio"
                      value={regBarbershop}
                      onChange={(e) => setRegBarbershop(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    WhatsApp Profissional *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    E-mail de Acesso *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      required
                      placeholder="barbeiro@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Senha (mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Seu Link Personalizado
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs">
                  <span className="text-neutral-400 select-none mr-1 font-mono">aurabarber.app/@</span>
                  <input
                    type="text"
                    placeholder="meu-studio"
                    value={regSlug}
                    onChange={(e) =>
                      setRegSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    className="bg-transparent focus:outline-none flex-1 font-mono text-amber-500 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Criar Minha Barbearia no Firebase</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security / SDK Verification Notice */}
        <div className="mt-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Infraestrutura de Autenticação Real Provisionada</span>
          </div>
          <p>
            Conectado com o Firebase Project oficial <code className="text-amber-500 font-mono font-bold">ardent-field-7hl8x</code>. As contas criadas persistem na nuvem e o token JWT é mantido com segurança de ponta a ponta.
          </p>
        </div>
      </div>
    </div>
  );
};
