import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Search,
  Plus,
  Clock,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
import {
  formatCurrency,
  formatDateBr,
  formatDateFull,
  formatPhone,
  getTodayDateString,
  createWhatsAppLink,
} from '../../utils/formatters';

interface AgendaViewProps {
  onOpenNewAppointment: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onOpenNewAppointment }) => {
  const {
    currentTenant,
    getTenantAppointments,
    updateAppointmentStatus,
  } = useApp();

  const [agendaMode, setAgendaMode] = useState<'lista' | 'calendario'>('lista');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const appointments = getTenantAppointments(currentTenant.id);

  // Filtered appointments for list mode
  const dailyAppointments = appointments
    .filter((app) => app.date === selectedDate)
    .filter((app) => (statusFilter === 'todos' ? true : app.status === statusFilter))
    .filter(
      (app) =>
        app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.clientPhone.includes(searchQuery) ||
        app.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  // Change date helpers
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayDateString());
  };

  const statusBadges: Record<AppointmentStatus, { label: string; color: string; border: string }> = {
    confirmado: {
      label: 'Confirmado',
      color: 'text-emerald-500 bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    pendente: {
      label: 'Pendente',
      color: 'text-amber-500 bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    concluido: {
      label: 'Concluído',
      color: 'text-sky-500 bg-sky-500/10',
      border: 'border-sky-500/20',
    },
    cancelado: {
      label: 'Cancelado',
      color: 'text-rose-500 bg-rose-500/10',
      border: 'border-rose-500/20',
    },
  };

  // WhatsApp message generator
  const getWhatsAppMessage = (app: Appointment) => {
    return `Olá ${app.clientName}! Aqui é o ${currentTenant.name} da ${currentTenant.barbershopName}. Estou passando para confirmar seu horário para *${app.serviceName}* no dia *${formatDateBr(app.date)}* às *${app.time}*. Qualquer imprevisto me avise por aqui!`;
  };

  // Total daily stats
  const totalDailyRevenue = dailyAppointments
    .filter((a) => a.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.servicePrice, 0);

  // Month days generator for calendar mode
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Blank days before month start
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of month
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, dateStr });
    }
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Agenda de Atendimentos
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Gerencie seus clientes, horários e envie lembretes via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher: Lista vs Calendário */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setAgendaMode('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                agendaMode === 'lista'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-amber-400 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista Diária
            </button>
            <button
              onClick={() => setAgendaMode('calendario')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                agendaMode === 'calendario'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-amber-400 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendário
            </button>
          </div>

          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors shadow-sm shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Agendar</span>
          </button>
        </div>
      </div>

      {agendaMode === 'lista' ? (
        <div className="space-y-4">
          {/* Date Navigator Bar */}
          <div className="p-3 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleSetToday}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  selectedDate === getTodayDateString()
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Hoje
              </button>

              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                title="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-amber-500"
              />

              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hidden md:inline capitalize">
                {formatDateFull(selectedDate)}
              </span>
            </div>

            {/* Quick Metrics of the Day */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Atendimentos:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {dailyAppointments.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Faturamento previsto:</span>
                <span className="font-bold text-amber-500">
                  {formatCurrency(totalDailyRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, telefone ou serviço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:border-amber-500 focus:outline-none text-neutral-900 dark:text-neutral-100"
              />
            </div>

            {/* Status Segmented Controls */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
              {['todos', 'confirmado', 'pendente', 'concluido', 'cancelado'].map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors whitespace-nowrap ${
                    statusFilter === statusKey
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-amber-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {statusKey === 'todos' ? 'Todos' : statusKey}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments List */}
          {dailyAppointments.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
                Não há horários marcados para este dia com os filtros atuais.
              </p>
              <button
                onClick={onOpenNewAppointment}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agendar Cliente Manualmente
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyAppointments.map((app) => {
                const badge = statusBadges[app.status];
                const waLink = createWhatsAppLink(app.clientPhone, getWhatsAppMessage(app));

                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border transition-all bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    {/* Time & Service info */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 shrink-0 text-center py-2 px-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-base font-extrabold text-neutral-900 dark:text-neutral-50 block">
                          {app.time}
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                          até {app.endTime}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
                          {app.serviceDuration} min
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-50">
                            {app.clientName}
                          </h4>
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                          {app.bookedVia === 'barbeiro_manual' && (
                            <span className="text-[10px] text-neutral-400">
                              · Manual
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                            {app.serviceName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-amber-500">
                            {formatCurrency(app.servicePrice)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            {formatPhone(app.clientPhone)}
                          </span>
                        </div>

                        {app.clientNotes && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 italic bg-neutral-50 dark:bg-neutral-950 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 max-w-xl">
                            Obs: &quot;{app.clientNotes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions (WhatsApp, Status update) */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800 justify-end">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors"
                        title="Abrir WhatsApp com mensagem de lembrete"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Status Dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateAppointmentStatus(app.id, e.target.value as AppointmentStatus)
                        }
                        className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="confirmado">Confirmar</option>
                        <option value="pendente">Pendente</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelar</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Calendar Month Mode */
        <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white capitalize">
              {calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newM = new Date(calendarMonth);
                  newM.setMonth(newM.getMonth() - 1);
                  setCalendarMonth(newM);
                }}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalendarMonth(new Date())}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Mês Atual
              </button>
              <button
                onClick={() => {
                  const newM = new Date(calendarMonth);
                  newM.setMonth(newM.getMonth() + 1);
                  setCalendarMonth(newM);
                }}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-neutral-400 py-2 border-b border-neutral-100 dark:border-neutral-800">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {getCalendarDays().map((item, index) => {
              if (!item) {
                return <div key={`empty-${index}`} className="h-20 rounded-xl bg-transparent" />;
              }

              const count = appointments.filter(
                (a) => a.date === item.dateStr && a.status !== 'cancelado'
              ).length;
              const isToday = item.dateStr === getTodayDateString();
              const isSelected = item.dateStr === selectedDate;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => {
                    setSelectedDate(item.dateStr);
                    setAgendaMode('lista');
                  }}
                  className={`h-20 p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10'
                      : isToday
                      ? 'border-neutral-400 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850'
                      : 'border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday ? 'text-amber-500' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {item.day}
                    </span>
                    {count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>

                  {count > 0 ? (
                    <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded px-1.5 py-0.5 truncate">
                      {count} {count === 1 ? 'cliente' : 'clientes'}
                    </div>
                  ) : (
                    <span className="text-[10px] text-neutral-400">Livre</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
