export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number; // in BRL
  category: 'cabelo' | 'barba' | 'combo' | 'tratamento';
  isActive: boolean;
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  isOpen: boolean;
  startHour: string; // "09:00"
  endHour: string;   // "19:00"
  breakStart?: string; // "12:00"
  breakEnd?: string;   // "13:00"
}

export interface WorkingConfig {
  days: DaySchedule[];
  slotIntervalMinutes: number; // 30, 45, 60
  bufferBetweenMinutes: number; // 5, 10, 15 min rest/cleanup
  minNoticeMinutes: number; // min advance time (e.g. 60 min)
  maxAdvanceDays: number;   // how far in future clients can book (e.g. 30 days)
}

export interface BarberTenant {
  id: string;
  slug: string; // e.g. "marcos-vintage"
  name: string;
  barbershopName: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  instagram: string;
  avatarUrl: string;
  coverUrl: string;
  publishedServices: Service[];
  draftServices: Service[];
  workingConfig: WorkingConfig;
  draftWorkingConfig: WorkingConfig;
  hasUnpublishedChanges: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string; // YYYY-MM-DD
  time: string; // "14:00"
  endTime: string; // "14:45"
  status: AppointmentStatus;
  createdAt: string;
  bookedVia: 'cliente_web' | 'barbeiro_manual';
}

export interface TimeSlot {
  time: string; // "14:00"
  endTime: string; // "14:45"
  available: boolean;
  reason?: 'ocupado' | 'almoco' | 'fora_expediente' | 'passado' | 'buffer_insuficiente';
}

export type ViewMode = 'barber' | 'client' | 'docs';
export type BarberSubTab = 'agenda' | 'servicos' | 'horarios' | 'perfil' | 'metricas';
