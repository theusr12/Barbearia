import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Tag,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Service } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const ServicesManager: React.FC = () => {
  const {
    currentTenant,
    saveServiceDraft,
    deleteServiceDraft,
    publishAllChanges,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [price, setPrice] = useState(60);
  const [category, setCategory] = useState<Service['category']>('cabelo');
  const [error, setError] = useState('');

  const services = currentTenant.draftServices;

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(45);
    setPrice(60);
    setCategory('cabelo');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    setName(svc.name);
    setDescription(svc.description);
    setDurationMinutes(svc.durationMinutes);
    setPrice(svc.price);
    setCategory(svc.category);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o título do serviço.');
      return;
    }
    if (price <= 0) {
      setError('O valor deve ser maior que zero.');
      return;
    }
    if (durationMinutes <= 0) {
      setError('A duração deve ser de pelo menos 15 minutos.');
      return;
    }

    const serviceData: Service = {
      id: editingService ? editingService.id : `srv-${Date.now().toString(36)}`,
      tenantId: currentTenant.id,
      name: name.trim(),
      description: description.trim(),
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      category,
      isActive: true,
    };

    saveServiceDraft(serviceData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Catálogo de Serviços
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Defina os cortes, barbas e tratamentos com duração e valor em reais
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors shadow-sm shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          Adicionar Serviço
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => {
          const isPublished = currentTenant.publishedServices.some(
            (p) =>
              p.id === svc.id &&
              p.name === svc.name &&
              p.price === svc.price &&
              p.durationMinutes === svc.durationMinutes &&
              p.description === svc.description
          );

          return (
            <div
              key={svc.id}
              className="p-5 rounded-2xl border transition-all bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-amber-500/30 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                      {svc.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span className="capitalize">{svc.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {svc.durationMinutes} minutos
                      </span>
                    </div>
                  </div>

                  <span className="text-lg font-black text-amber-500">
                    {formatCurrency(svc.price)}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 my-2">
                  {svc.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  {isPublished ? (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Publicado na Área do Cliente
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-500 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Rascunho não publicado
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Editar serviço"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteServiceDraft(svc.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Excluir serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-neutral-900 dark:text-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="my-3 p-2.5 rounded-lg bg-red-500/10 text-red-500 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Corte Degradê Navalhado"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="65"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Duração (Minutos) *
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={40}>40 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={50}>50 minutos</option>
                    <option value={60}>60 minutos (1h)</option>
                    <option value={75}>75 minutos (1h 15m)</option>
                    <option value={90}>90 minutos (1h 30m)</option>
                    <option value={120}>120 minutos (2h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Service['category'])}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
                >
                  <option value="cabelo">Cabelo</option>
                  <option value="barba">Barba</option>
                  <option value="combo">Combo (Cabelo + Barba)</option>
                  <option value="tratamento">Tratamento / Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Descrição do Serviço
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes para o cliente (ex: toalha quente, lavagem inclusa...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10"
                >
                  Salvar em Rascunho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
