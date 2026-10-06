import React, { useState } from 'react';
import { Clock, Calendar, Check, Save, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DaySchedule, WorkingConfig } from '../../types';

export const ScheduleSettings: React.FC = () => {
  const { currentTenant, saveWorkingConfigDraft, publishAllChanges } = useApp();

  const [config, setConfig] = useState<WorkingConfig>(
    JSON.parse(JSON.stringify(currentTenant.draftWorkingConfig))
  );

  const handleToggleDay = (index: number) => {
    const updatedDays = [...config.days];
    updatedDays[index].isOpen = !updatedDays[index].isOpen;
    setConfig({ ...config, days: updatedDays });
  };

  const handleTimeChange = (
    index: number,
    field: 'startHour' | 'endHour' | 'breakStart' | 'breakEnd',
    val: string
  ) => {
    const updatedDays = [...config.days];
    updatedDays[index] = { ...updatedDays[index], [field]: val };
    setConfig({ ...config, days: updatedDays });
  };

  const handleSaveDraft = () => {
    saveWorkingConfigDraft(config);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Horários de Trabalho & Expediente
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Defina seus dias de atendimento, intervalos de almoço e tempo de pausa entre clientes
          </p>
        </div>

        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors shadow-sm shadow-amber-500/10"
        >
          <Save className="w-4 h-4" />
          Salvar Horários
        </button>
      </div>

      {/* Rules Notice */}
      <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-700 dark:text-neutral-300">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            Regras de Agendamento Automáticas Ativas:
          </p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-neutral-600 dark:text-neutral-400">
            <li>Horários fora do seu expediente são 100% bloqueados.</li>
            <li>Horários já passados no dia de hoje nunca aparecem para o cliente.</li>
            <li>O intervalo de almoço é respeitado e impede início de cortes que ultrapassem o horário.</li>
            <li>O tempo de buffer adiciona folga para esterilização e descanso entre atendimentos.</li>
          </ul>
        </div>
      </div>

      {/* Days Table */}
      <div className="rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {config.days.map((day, idx) => (
            <div
              key={day.dayOfWeek}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                day.isOpen ? 'bg-transparent' : 'bg-neutral-50/60 dark:bg-neutral-950/60 opacity-60'
              }`}
            >
              {/* Day Name & Toggle */}
              <div className="flex items-center gap-3 w-48">
                <button
                  type="button"
                  onClick={() => handleToggleDay(idx)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    day.isOpen ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      day.isOpen ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-semibold ${
                    day.isOpen
                      ? 'text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {day.dayName}
                </span>
              </div>

              {day.isOpen ? (
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {/* Working Hours */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-500">Expediente:</span>
                    <input
                      type="time"
                      value={day.startHour}
                      onChange={(e) => handleTimeChange(idx, 'startHour', e.target.value)}
                      className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-neutral-400">às</span>
                    <input
                      type="time"
                      value={day.endHour}
                      onChange={(e) => handleTimeChange(idx, 'endHour', e.target.value)}
                      className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Lunch / Break Hours */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-500">Almoço:</span>
                    <input
                      type="time"
                      value={day.breakStart || '12:30'}
                      onChange={(e) => handleTimeChange(idx, 'breakStart', e.target.value)}
                      className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-neutral-400">às</span>
                    <input
                      type="time"
                      value={day.breakEnd || '13:30'}
                      onChange={(e) => handleTimeChange(idx, 'breakEnd', e.target.value)}
                      className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-medium text-neutral-400 italic">
                  Dia de folga (fechado para agendamentos)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Buffer & Advance Booking Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-2 shadow-xs">
          <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Intervalo entre Clientes (Buffer)
          </label>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Tempo para higienizar ferramentas e descanso entre atendimentos
          </p>
          <select
            value={config.bufferBetweenMinutes}
            onChange={(e) => setConfig({ ...config, bufferBetweenMinutes: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
          >
            <option value={0}>Sem intervalo (0 min)</option>
            <option value={5}>5 minutos</option>
            <option value={10}>10 minutos (Recomendado)</option>
            <option value={15}>15 minutos</option>
            <option value={20}>20 minutos</option>
          </select>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-2 shadow-xs">
          <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Antecedência Mínima
          </label>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Evita agendamentos de última hora sem seu consentimento prévio
          </p>
          <select
            value={config.minNoticeMinutes}
            onChange={(e) => setConfig({ ...config, minNoticeMinutes: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
          >
            <option value={15}>15 minutos antes</option>
            <option value={30}>30 minutos antes</option>
            <option value={45}>45 minutos antes</option>
            <option value={60}>1 hora antes</option>
            <option value={120}>2 horas antes</option>
          </select>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-2 shadow-xs">
          <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Agendamento Máximo no Futuro
          </label>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Limite de dias à frente que os clientes podem reservar
          </p>
          <select
            value={config.maxAdvanceDays}
            onChange={(e) => setConfig({ ...config, maxAdvanceDays: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
          >
            <option value={7}>Próximos 7 dias</option>
            <option value={14}>Próximos 14 dias</option>
            <option value={21}>Próximos 21 dias</option>
            <option value={30}>Próximos 30 dias (1 mês)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
