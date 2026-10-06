import React, { useState } from 'react';
import {
  Copy,
  ExternalLink,
  QrCode,
  Instagram,
  MapPin,
  Phone,
  Store,
  User,
  Check,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfileSettings: React.FC = () => {
  const { currentTenant, updateTenantProfile, setViewMode, showToast } = useApp();

  const [name, setName] = useState(currentTenant.name);
  const [barbershopName, setBarbershopName] = useState(currentTenant.barbershopName);
  const [bio, setBio] = useState(currentTenant.bio);
  const [address, setAddress] = useState(currentTenant.address);
  const [phone, setPhone] = useState(currentTenant.phone);
  const [instagram, setInstagram] = useState(currentTenant.instagram);
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/@${currentTenant.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Link do perfil copiado com sucesso!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantProfile({
      name,
      barbershopName,
      bio,
      address,
      phone,
      instagram,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Perfil da Barbearia & Link Público
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Personalize as informações vistas pelos seus clientes e compartilhe seu link oficial
        </p>
      </div>

      {/* Public Link Card & QR Code preview */}
      <div className="p-6 rounded-2xl border bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Seu Link Exclusivo de Agendamentos
            </div>
            <h3 className="text-2xl font-black tracking-tight text-neutral-100">
              {currentTenant.barbershopName}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md">
              Cole este link na bio do seu Instagram, envie no WhatsApp ou imprima o QR Code para colocar no balcão da barbearia.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="px-3.5 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700 font-mono text-xs text-amber-400 flex items-center gap-2 select-all">
                <span>{publicUrl}</span>
              </div>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Link'}
              </button>

              <button
                onClick={() => setViewMode('client')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                Visualizar Como Cliente
              </button>
            </div>
          </div>

          {/* QR Code Simulation Card */}
          <div className="p-4 rounded-xl bg-white text-neutral-900 shadow-2xl flex flex-col items-center shrink-0 border border-neutral-200">
            {/* SVG QR Code pattern */}
            <div className="w-32 h-32 bg-neutral-950 p-2 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                {/* Simulated clean QR dots */}
                <rect x="5" y="5" width="25" height="25" fill="#D4AF37" rx="4" />
                <rect x="70" y="5" width="25" height="25" fill="#D4AF37" rx="4" />
                <rect x="5" y="70" width="25" height="25" fill="#D4AF37" rx="4" />
                <rect x="10" y="10" width="15" height="15" fill="#000" rx="2" />
                <rect x="75" y="10" width="15" height="15" fill="#000" rx="2" />
                <rect x="10" y="75" width="15" height="15" fill="#000" rx="2" />
                <circle cx="17.5" cy="17.5" r="4" fill="#D4AF37" />
                <circle cx="82.5" cy="17.5" r="4" fill="#D4AF37" />
                <circle cx="17.5" cy="82.5" r="4" fill="#D4AF37" />
                <rect x="35" y="10" width="6" height="10" fill="#fff" />
                <rect x="45" y="5" width="8" height="8" fill="#fff" />
                <rect x="35" y="25" width="15" height="6" fill="#fff" />
                <rect x="55" y="15" width="8" height="18" fill="#fff" />
                <rect x="35" y="38" width="30" height="25" fill="#D4AF37" rx="3" />
                <circle cx="50" cy="50" r="5" fill="#000" />
                <rect x="10" y="45" width="18" height="6" fill="#fff" />
                <rect x="15" y="55" width="8" height="8" fill="#fff" />
                <rect x="70" y="40" width="12" height="12" fill="#fff" />
                <rect x="85" y="55" width="10" height="10" fill="#fff" />
                <rect x="38" y="70" width="12" height="15" fill="#fff" />
                <rect x="55" y="75" width="10" height="8" fill="#fff" />
                <rect x="70" y="70" width="20" height="8" fill="#fff" />
                <rect x="75" y="85" width="15" height="8" fill="#fff" />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 mt-2">
              Aponte a Câmera
            </span>
            <span className="text-[9px] text-neutral-500 font-mono">
              @{currentTenant.slug}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Dados do Estabelecimento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Nome do Barbeiro
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Nome da Barbearia
            </label>
            <input
              type="text"
              value={barbershopName}
              onChange={(e) => setBarbershopName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              WhatsApp de Contato
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Instagram
            </label>
            <input
              type="text"
              placeholder="@meu_perfil"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
            Endereço Completo
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
            Biografia / Apresentação
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors shadow-sm shadow-amber-500/10"
          >
            Salvar Dados do Perfil
          </button>
        </div>
      </form>
    </div>
  );
};
