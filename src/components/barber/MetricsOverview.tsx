import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Scissors,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const MetricsOverview: React.FC = () => {
  const { currentTenant, getTenantAppointments } = useApp();
  const appointments = getTenantAppointments(currentTenant.id);

  const completed = appointments.filter((a) => a.status === 'concluido');
  const confirmed = appointments.filter((a) => a.status === 'confirmado');
  const cancelled = appointments.filter((a) => a.status === 'cancelado');
  const totalValid = appointments.filter((a) => a.status !== 'cancelado');

  const totalRevenue = totalValid.reduce((sum, a) => sum + a.servicePrice, 0);
  const averageTicket = totalValid.length > 0 ? totalRevenue / totalValid.length : 0;
  const completionRate =
    appointments.length > 0
      ? Math.round((completed.length / (appointments.length - cancelled.length || 1)) * 100)
      : 100;

  // Services distribution
  const serviceCounts: Record<string, { count: number; revenue: number }> = {};
  totalValid.forEach((app) => {
    if (!serviceCounts[app.serviceName]) {
      serviceCounts[app.serviceName] = { count: 0, revenue: 0 };
    }
    serviceCounts[app.serviceName].count += 1;
    serviceCounts[app.serviceName].revenue += app.servicePrice;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Métricas & Indicadores Financeiros
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Acompanhe o faturamento, ticket médio e taxa de presença da sua barbearia
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Faturamento Total</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-950 dark:text-neutral-50">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            +18% comparado à semana anterior
          </span>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Ticket Médio</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-500">
            {formatCurrency(averageTicket)}
          </div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Por atendimento realizado
          </span>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Agendamentos Válidos</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-950 dark:text-neutral-50">
            {totalValid.length}
          </div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {completed.length} concluídos · {confirmed.length} confirmados
          </span>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Taxa de Conclusão</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-500">
            {completionRate}%
          </div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {cancelled.length} cancelamentos
          </span>
        </div>
      </div>

      {/* Top Services Breakdown */}
      <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <Scissors className="w-4 h-4 text-amber-500" />
          Serviços Mais Procurados & Receita Gerada
        </h3>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {Object.entries(serviceCounts).map(([svcName, stats]) => (
            <div key={svcName} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {svcName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {stats.count} {stats.count === 1 ? 'cliente atendido' : 'clientes atendidos'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-extrabold text-amber-500">
                  {formatCurrency(stats.revenue)}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {Math.round((stats.revenue / (totalRevenue || 1)) * 100)}% do faturamento
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
