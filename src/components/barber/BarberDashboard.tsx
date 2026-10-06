import React, { useState } from 'react';
import {
  Calendar,
  Scissors,
  Clock,
  User,
  TrendingUp,
  AlertTriangle,
  UploadCloud,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BarberSubTab } from '../../types';
import { AgendaView } from './AgendaView';
import { ServicesManager } from './ServicesManager';
import { ScheduleSettings } from './ScheduleSettings';
import { ProfileSettings } from './ProfileSettings';
import { MetricsOverview } from './MetricsOverview';
import { NewAppointmentModal } from './NewAppointmentModal';

export const BarberDashboard: React.FC = () => {
  const {
    currentTenant,
    barberSubTab,
    setBarberSubTab,
    publishAllChanges,
    discardDraftChanges,
  } = useApp();

  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);

  const tabs: { id: BarberSubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
    { id: 'servicos', label: 'Serviços & Preços', icon: <Scissors className="w-4 h-4" /> },
    { id: 'horarios', label: 'Expediente & Horários', icon: <Clock className="w-4 h-4" /> },
    { id: 'perfil', label: 'Perfil & Link Público', icon: <User className="w-4 h-4" /> },
    { id: 'metricas', label: 'Métricas & Faturamento', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Unpublished Changes Alert Banner */}
      {currentTenant.hasUnpublishedChanges && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 text-neutral-900 dark:text-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-amber-500/5 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-neutral-950 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 font-bold" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-50">
                Você possui alterações em rascunho não publicadas!
              </h4>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                As modificações em serviços ou expediente só ficarão visíveis para os clientes após serem salvas e publicadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={discardDraftChanges}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Descartar
            </button>
            <button
              onClick={publishAllChanges}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shadow-sm shadow-amber-500/20"
            >
              <UploadCloud className="w-4 h-4" />
              Publicar para Clientes
            </button>
          </div>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setBarberSubTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              barberSubTab === tab.id
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {barberSubTab === 'agenda' && (
          <AgendaView
            onOpenNewAppointment={() => setIsNewAppointmentModalOpen(true)}
          />
        )}
        {barberSubTab === 'servicos' && <ServicesManager />}
        {barberSubTab === 'horarios' && <ScheduleSettings />}
        {barberSubTab === 'perfil' && <ProfileSettings />}
        {barberSubTab === 'metricas' && <MetricsOverview />}
      </div>

      {/* Manual Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
      />
    </div>
  );
};
