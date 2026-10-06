import React, { useState } from 'react';
import { X, Sparkles, Scissors, Store, Mail, Phone, Hash } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NewBarberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewBarberModal: React.FC<NewBarberModalProps> = ({ isOpen, onClose }) => {
  const { createNewBarberTenant } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    barbershopName: '',
    email: '',
    phone: '',
    slug: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' ? val.toLowerCase().replace(/[^a-z0-9]/g, '-') : prev.slug,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Informe o nome do barbeiro.';
    if (!formData.barbershopName.trim()) newErrors.barbershopName = 'Informe o nome da barbearia.';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'E-mail válido obrigatório.';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone/WhatsApp é obrigatório.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createNewBarberTenant({
      name: formData.name.trim(),
      barbershopName: formData.barbershopName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-neutral-900 dark:text-neutral-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Criar Conta de Barbeiro</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Provisionamento instantâneo com multi-tenancy isolado
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Nome do Barbeiro
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Matheus Duarte"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
              />
            </div>
            {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Nome da Barbearia / Estúdio
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Razor & Crown Barbershop"
                value={formData.barbershopName}
                onChange={(e) => setFormData({ ...formData, barbershopName: e.target.value })}
                className="w-full pl-3 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
              />
            </div>
            {errors.barbershopName && <p className="text-red-500 text-[11px] mt-1">{errors.barbershopName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                E-mail
              </label>
              <input
                type="email"
                placeholder="contato@barbeiro.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
              />
              {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                WhatsApp
              </label>
              <input
                type="text"
                placeholder="(11) 99999-8888"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
              />
              {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Slug do Link Público
            </label>
            <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm">
              <span className="text-neutral-400 select-none mr-1 font-mono text-xs">aurabarber.app/@</span>
              <input
                type="text"
                placeholder="meu-studio"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                  })
                }
                className="bg-transparent focus:outline-none flex-1 font-mono text-xs text-amber-500 font-semibold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Criar e Ativar Barbearia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
