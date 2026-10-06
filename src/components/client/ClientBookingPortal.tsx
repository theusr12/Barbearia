import React, { useState } from 'react';
import {
  Scissors,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Phone,
  Instagram,
  User,
  Sparkles,
  ShieldCheck,
  Share2,
  Copy,
  CalendarPlus,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Appointment, Service, TimeSlot } from '../../types';
import {
  formatCurrency,
  formatDateBr,
  formatDateFull,
  formatPhone,
  getTodayDateString,
  createWhatsAppLink,
} from '../../utils/formatters';
import { generateAvailableSlots } from '../../utils/scheduling';

export const ClientBookingPortal: React.FC = () => {
  const {
    currentTenant,
    getTenantAppointments,
    bookAppointment,
    showToast,
  } = useApp();

  // Wizard Steps: 1 = Service, 2 = Date & Time, 3 = Client Info, 4 = Success Receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Confirmed Appointment
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Only use PUBLISHED services and workingConfig for client view!
  const services = currentTenant.publishedServices.filter((s) => s.isActive);
  const workingConfig = currentTenant.workingConfig;
  const existingAppointments = getTenantAppointments(currentTenant.id);

  // Generate 14 selectable dates starting today
  const availableDates: { dateStr: string; dayNumber: number; dayName: string; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dayStr}`;

    availableDates.push({
      dateStr,
      dayNumber: d.getDate(),
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      isToday: i === 0,
    });
  }

  // Calculate available slots if service and date are chosen
  const availableSlots: TimeSlot[] = selectedService
    ? generateAvailableSlots(
        selectedDate,
        selectedService,
        workingConfig,
        existingAppointments
      )
    : [];

  // Step 1: Select Service
  const handleSelectService = (svc: Service) => {
    setSelectedService(svc);
    setSelectedSlot(null);
    setStep(2);
  };

  // Step 2: Select Slot
  const handleSelectSlot = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
  };

  const handleProceedToInfo = () => {
    if (!selectedSlot) {
      showToast('Por favor, selecione um horário disponível.', 'warning');
      return;
    }
    setStep(3);
  };

  // Step 3: Confirm booking
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      showToast('Por favor, informe seu nome completo.', 'error');
      return;
    }
    const cleanNumber = clientPhone.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setPhoneError('Por favor, informe um WhatsApp válido com DDD (ex: 11999998888).');
      return;
    }
    setPhoneError('');

    if (!selectedService || !selectedSlot) return;

    const newApp = bookAppointment({
      tenantId: currentTenant.id,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      serviceDuration: selectedService.durationMinutes,
      date: selectedDate,
      time: selectedSlot.time,
      clientName: clientName.trim(),
      clientPhone: cleanNumber,
      clientNotes: clientNotes.trim(),
      bookedVia: 'cliente_web',
    });

    if (newApp) {
      setConfirmedAppointment(newApp);
      setStep(4);
    }
  };

  // Helpers for step 4 (Success / Calendar / WhatsApp)
  const getWhatsAppConfirmationMessage = () => {
    if (!confirmedAppointment) return '';
    return `Olá ${currentTenant.name}! Acabei de agendar pelo seu link oficial do AuraBarber:\n\n✂️ *${confirmedAppointment.serviceName}*\n📅 *${formatDateFull(confirmedAppointment.date)}*\n⏰ *${confirmedAppointment.time}*\n👤 *${confirmedAppointment.clientName}*\n\nPode confirmar meu horário? Obrigado!`;
  };

  const generateGoogleCalendarUrl = () => {
    if (!confirmedAppointment) return '#';
    const [y, m, d] = confirmedAppointment.date.split('-');
    const [h, min] = confirmedAppointment.time.split(':');
    const [endH, endMin] = confirmedAppointment.endTime.split(':');

    const startIso = `${y}${m}${d}T${h}${min}00`;
    const endIso = `${y}${m}${d}T${endH}${endMin}00`;

    const title = encodeURIComponent(`${confirmedAppointment.serviceName} - ${currentTenant.barbershopName}`);
    const details = encodeURIComponent(
      `Agendamento com ${currentTenant.name}.\nLocal: ${currentTenant.address}\nWhatsApp: ${currentTenant.phone}`
    );
    const location = encodeURIComponent(currentTenant.address);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Mobile-First Hero Bar */}
      <div className="relative border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4 py-5 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/40 p-0.5 bg-neutral-800 shadow-lg">
              <img
                src={currentTenant.avatarUrl}
                alt={currentTenant.name}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-md"
              title="Barbeiro Verificado"
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-neutral-50 truncate tracking-tight">
                {currentTenant.barbershopName}
              </h1>
            </div>
            <p className="text-xs text-neutral-400 truncate">
              {currentTenant.name} · {currentTenant.instagram}
            </p>
            <p className="text-[11px] text-neutral-500 truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
              {currentTenant.address}
            </p>
          </div>
        </div>
      </div>

      {/* Main Flow Container */}
      <main className="max-w-md w-full mx-auto px-4 py-6 flex-1 space-y-6">
        {/* Progress indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep((prev) => (prev - 1) as any)}
                  className="p-1 -ml-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <span className="text-amber-500">
                Passo {step} de 3:
              </span>
              <span className="text-neutral-200">
                {step === 1 && 'Escolha o Serviço'}
                {step === 2 && 'Escolha a Data & Horário'}
                {step === 3 && 'Seus Dados para Confirmação'}
              </span>
            </div>

            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
              AuraBarber
            </span>
          </div>
        )}

        {/* STEP 1: SELECT SERVICE */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-neutral-50">
                Qual procedimento vamos fazer hoje?
              </h2>
              <p className="text-xs text-neutral-400">
                Escolha o serviço desejado para liberar a grade de horários disponíveis.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => handleSelectService(svc)}
                  className="w-full text-left p-4 rounded-2xl border transition-all bg-neutral-900/80 border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 group shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                          {svc.name}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {svc.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {svc.durationMinutes} min
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{svc.category}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-amber-500 block">
                        {formatCurrency(svc.price)}
                      </span>
                      <span className="text-[10px] text-neutral-500 group-hover:text-amber-400 flex items-center justify-end gap-0.5 mt-2">
                        Agendar <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT DATE & TIME */}
        {step === 2 && selectedService && (
          <div className="space-y-5 animate-fade-in">
            {/* Service Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-semibold">
                  Serviço Selecionado:
                </span>
                <p className="text-xs font-bold text-white">{selectedService.name}</p>
                <p className="text-[11px] text-amber-500 font-semibold">
                  {formatCurrency(selectedService.price)} · {selectedService.durationMinutes} minutos
                </p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-[11px] font-semibold text-neutral-400 hover:text-amber-400 underline underline-offset-4"
              >
                Trocar
              </button>
            </div>

            {/* Horizontal Date Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-200">
                1. Escolha o dia
              </label>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availableDates.map((item) => {
                  const isSelected = item.dateStr === selectedDate;
                  return (
                    <button
                      key={item.dateStr}
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`flex flex-col items-center justify-center w-16 h-18 rounded-2xl border transition-all shrink-0 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500 text-neutral-950 font-extrabold shadow-md shadow-amber-500/20'
                          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">
                        {item.dayName}
                      </span>
                      <span className="text-base font-black mt-0.5">
                        {item.dayNumber}
                      </span>
                      {item.isToday && (
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider px-1 rounded-sm mt-0.5 ${
                            isSelected ? 'bg-neutral-950 text-amber-400' : 'text-amber-500'
                          }`}
                        >
                          Hoje
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Time Slots Grid */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-200">
                  2. Escolha o horário de início
                </label>
                <span className="text-[11px] text-neutral-400 capitalize">
                  {formatDateBr(selectedDate)}
                </span>
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/50">
                  <p className="text-xs font-semibold text-neutral-300">
                    Barbearia fechada neste dia
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Por favor, escolha outra data acima para visualizar horários disponíveis.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.time === slot.time;

                    if (!slot.available) {
                      return (
                        <div
                          key={slot.time}
                          className="p-2.5 rounded-xl border border-neutral-850 bg-neutral-900/40 text-neutral-600 text-center select-none cursor-not-allowed"
                          title={
                            slot.reason === 'passado'
                              ? 'Horário já passou hoje'
                              : slot.reason === 'almoco'
                              ? 'Horário de almoço/pausa'
                              : 'Horário já reservado'
                          }
                        >
                          <span className="text-xs font-mono line-through block">
                            {slot.time}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider block opacity-70">
                            {slot.reason === 'passado'
                              ? 'Passou'
                              : slot.reason === 'almoco'
                              ? 'Almoço'
                              : 'Ocupado'}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.time}
                        onClick={() => handleSelectSlot(slot)}
                        className={`p-2.5 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20'
                            : 'border-neutral-800 bg-neutral-900 hover:border-amber-500/50 hover:bg-neutral-850 text-neutral-200'
                        }`}
                      >
                        <span className="text-sm font-mono font-bold block">
                          {slot.time}
                        </span>
                        <span className="text-[9px] opacity-80 block">
                          até {slot.endTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Next Button */}
            {selectedSlot && (
              <div className="pt-2">
                <button
                  onClick={handleProceedToInfo}
                  className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Continuar para Seus Dados
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CLIENT INFO & CONFIRMATION */}
        {step === 3 && selectedService && selectedSlot && (
          <form onSubmit={handleConfirmBooking} className="space-y-4 animate-fade-in">
            {/* Booking Summary Box */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Resumo da Reserva:</span>
                <span className="font-bold text-amber-500">
                  {formatCurrency(selectedService.price)}
                </span>
              </div>
              <div className="font-bold text-sm text-neutral-100">
                {selectedService.name} ({selectedService.durationMinutes} min)
              </div>
              <div className="text-xs text-neutral-300 flex items-center gap-2">
                <span className="capitalize">{formatDateFull(selectedDate)}</span>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-amber-400">{selectedSlot.time} às {selectedSlot.endTime}</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-300">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gabriel Miranda"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-800 bg-neutral-900 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-300">
                  Seu WhatsApp com DDD *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={clientPhone}
                    onChange={(e) => {
                      setClientPhone(e.target.value);
                      setPhoneError('');
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-800 bg-neutral-900 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                {phoneError ? (
                  <p className="text-red-400 text-[11px] mt-1">{phoneError}</p>
                ) : (
                  <p className="text-neutral-500 text-[10px] mt-1">
                    Enviaremos a confirmação e lembrete direto no seu WhatsApp.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-300">
                  Observações para o Barbeiro (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tenho preferência por tesoura no topo..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-800 bg-neutral-900 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Agendamento Agora
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Voltar e alterar horário
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: CONFIRMATION RECEIPT */}
        {step === 4 && confirmedAppointment && (
          <div className="space-y-6 animate-fade-in text-center">
            {/* Success icon */}
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Agendamento Confirmado!
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Seu horário foi reservado com sucesso com {currentTenant.name}.
              </p>
            </div>

            {/* Luxury Ticket Card */}
            <div className="rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 text-left shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500/80 font-bold">
                  #{confirmedAppointment.id.slice(-6).toUpperCase()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Barbearia
                  </span>
                  <p className="text-base font-bold text-white">
                    {currentTenant.barbershopName}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Profissional: {currentTenant.name}
                  </p>
                </div>

                <div className="h-px bg-neutral-800" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                      Data
                    </span>
                    <p className="text-xs font-bold text-neutral-200 capitalize">
                      {formatDateBr(confirmedAppointment.date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                      Horário
                    </span>
                    <p className="text-xs font-bold text-amber-400 font-mono">
                      {confirmedAppointment.time} às {confirmedAppointment.endTime}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Serviço Contratado
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs font-semibold text-neutral-200">
                      {confirmedAppointment.serviceName}
                    </p>
                    <span className="text-sm font-black text-amber-500">
                      {formatCurrency(confirmedAppointment.servicePrice)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-neutral-800" />

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">
                    Localização
                  </span>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {currentTenant.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={createWhatsAppLink(
                  currentTenant.phone,
                  getWhatsAppConfirmationMessage()
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <MessageSquare className="w-4 h-4" />
                Avisar Barbeiro pelo WhatsApp
              </a>

              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs border border-neutral-800 hover:bg-neutral-900 text-neutral-300 transition-colors flex items-center justify-center gap-2"
              >
                <CalendarPlus className="w-4 h-4 text-amber-500" />
                Adicionar ao Google Agenda
              </a>

              <button
                onClick={() => {
                  setSelectedService(null);
                  setSelectedSlot(null);
                  setClientName('');
                  setClientPhone('');
                  setClientNotes('');
                  setConfirmedAppointment(null);
                  setStep(1);
                }}
                className="w-full py-2 text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Fazer outro agendamento
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-4 text-center text-[11px] text-neutral-600">
        <p>
          Agendamento seguro proporcionado por{' '}
          <span className="text-amber-500/80 font-bold">AuraBarber SaaS</span>
        </p>
      </footer>
    </div>
  );
};
