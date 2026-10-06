import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, formatCurrency } from '../../utils/formatters';
import { generateAvailableSlots } from '../../utils/scheduling';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTenant, bookAppointment, getTenantAppointments } = useApp();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(
    currentTenant.publishedServices[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedService =
    currentTenant.publishedServices.find((s) => s.id === selectedServiceId) ||
    currentTenant.publishedServices[0];

  // Calculate available slots for chosen service and date
  const availableSlots = selectedService
    ? generateAvailableSlots(
        selectedDate,
        selectedService,
        currentTenant.workingConfig,
        getTenantAppointments(currentTenant.id)
      )
    : [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Informe o nome do cliente.');
      return;
    }
    if (!clientPhone.trim()) {
      setError('Informe o telefone/WhatsApp do cliente.');
      return;
    }
    if (!selectedService) {
      setError('Selecione um serviço.');
      return;
    }
    if (!selectedTime) {
      setError('Escolha um horário.');
      return;
    }

    bookAppointment({
      tenantId: currentTenant.id,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      serviceDuration: selectedService.durationMinutes,
      date: selectedDate,
      time: selectedTime,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientNotes: clientNotes.trim(),
      bookedVia: 'barbeiro_manual',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-neutral-900 dark:text-neutral-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold">Agendamento Manual (Balcão / Telefone)</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Adicione um cliente diretamente na sua agenda
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                Nome do Cliente *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                WhatsApp / Telefone *
              </label>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Serviço Desejado *
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setSelectedTime('');
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
            >
              {currentTenant.publishedServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {formatCurrency(s.price)} ({s.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                Data do Atendimento *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                Horário Disponível *
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
              >
                <option value="">Selecione um horário</option>
                {availableSlots.map((slot) => (
                  <option
                    key={slot.time}
                    value={slot.time}
                    disabled={!slot.available}
                  >
                    {slot.time} - {slot.endTime} {slot.available ? '(Livre)' : `(${slot.reason})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Observações (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Prefere corte com navalha nas laterais..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
