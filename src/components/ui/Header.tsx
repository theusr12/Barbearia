import React, { useState } from 'react';
import {
  Scissors,
  Calendar,
  Smartphone,
  BookOpen,
  Sun,
  Moon,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Plus,
  Sparkles,
  LogOut,
  LogIn,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenNewBarberModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewBarberModal }) => {
  const {
    viewMode,
    setViewMode,
    isDarkMode,
    toggleDarkMode,
    tenants,
    currentTenant,
    setCurrentTenantId,
    firebaseUser,
    logoutFirebase,
    showToast,
  } = useApp();

  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/@${currentTenant.slug}`;
    navigator.clipboard.writeText(url);
    showToast(`Link copiado: ${url}`, 'success');
  };

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors bg-white/90 border-neutral-200 dark:bg-neutral-950/90 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Multi-Tenant Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-500/10">
              <Scissors className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-neutral-900 dark:text-neutral-50">
                  Aura<span className="text-amber-500">Barber</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  SaaS
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Plataforma para Barbeiros Autônomos
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden md:block" />

          {/* Tenant Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0">
                <img
                  src={currentTenant.avatarUrl}
                  alt={currentTenant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-semibold block truncate max-w-[130px]">
                  {currentTenant.barbershopName}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {isTenantDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl shadow-2xl border bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 p-2 z-50">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 px-2 py-1">
                  Barbeiros Registrados (Multi-Tenant)
                </div>
                <div className="space-y-1 my-1">
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTenantId(t.id);
                        setIsTenantDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        t.id === currentTenant.id
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={t.avatarUrl}
                          alt={t.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="truncate">
                          <p className="truncate font-medium">{t.barbershopName}</p>
                          <p className="text-[10px] text-neutral-400">@{t.slug} · {t.name}</p>
                        </div>
                      </div>
                      {t.id === currentTenant.id && (
                        <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => {
                      setIsTenantDropdownOpen(false);
                      onOpenNewBarberModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Cadastrar Nova Barbearia
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Environment Modes */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
          <button
            onClick={() => setViewMode('barber')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'barber'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-amber-400 shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Área do Barbeiro</span>
            <span className="sm:hidden">Barbeiro</span>
            {!firebaseUser && (
              <span className="w-2 h-2 rounded-full bg-amber-500 ml-0.5" title="Login necessário" />
            )}
          </button>

          <button
            onClick={() => setViewMode('client')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'client'
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Área do Cliente</span>
            <span className="sm:hidden">Cliente</span>
          </button>

          <button
            onClick={() => setViewMode('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'docs'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-amber-400 shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Documentação Técnica</span>
            <span className="md:hidden">Docs</span>
          </button>
        </div>

        {/* Right Tools (Firebase User, Link sharing, Theme toggle) */}
        <div className="flex items-center gap-2">
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 pl-2">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[120px]">
                  {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
                </span>
                <span className="text-[9px] text-emerald-500 flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Firebase Conectado
                </span>
              </div>
              <button
                onClick={() => logoutFirebase()}
                title="Desconectar do Firebase"
                className="p-2 rounded-lg text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setViewMode('barber')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-500" />
              <span>Entrar</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            title="Copiar link público para agendamento do cliente"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Link do Cliente</span>
          </button>

          <button
            onClick={toggleDarkMode}
            aria-label="Alternar tema claro/escuro"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
