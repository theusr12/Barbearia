import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Appointment,
  AppointmentStatus,
  BarberSubTab,
  BarberTenant,
  Service,
  ViewMode,
  WorkingConfig,
} from '../types';
import { getInitialAppointments, initialTenants, defaultWorkingConfig } from '../data/initialData';
import { calculateEndTime } from '../utils/scheduling';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  FirebaseUser,
} from '../lib/firebase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Navigation & Theme
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  barberSubTab: BarberSubTab;
  setBarberSubTab: (tab: BarberSubTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Multi-Tenancy
  tenants: BarberTenant[];
  currentTenant: BarberTenant;
  setCurrentTenantId: (tenantId: string) => void;
  createNewBarberTenant: (data: {
    name: string;
    barbershopName: string;
    email: string;
    phone: string;
    slug: string;
  }) => BarberTenant;
  updateTenantProfile: (updates: Partial<BarberTenant>) => void;

  // Real Firebase Authentication
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  loginWithFirebase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithFirebase: (data: {
    email: string;
    password: string;
    name: string;
    barbershopName: string;
    phone: string;
    slug: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logoutFirebase: () => Promise<void>;

  // Draft vs Published Changes
  saveServiceDraft: (service: Service) => void;
  deleteServiceDraft: (serviceId: string) => void;
  saveWorkingConfigDraft: (config: WorkingConfig) => void;
  publishAllChanges: () => void;
  discardDraftChanges: () => void;

  // Appointments
  appointments: Appointment[];
  getTenantAppointments: (tenantId?: string) => Appointment[];
  bookAppointment: (data: {
    tenantId: string;
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    date: string;
    time: string;
    clientName: string;
    clientPhone: string;
    clientNotes?: string;
    bookedVia?: 'cliente_web' | 'barbeiro_manual';
  }) => Appointment | null;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  cancelAppointment: (id: string) => void;

  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TENANTS_STORAGE_KEY = 'aurabarber_tenants_v1';
const APPOINTMENTS_STORAGE_KEY = 'aurabarber_appointments_v1';
const THEME_STORAGE_KEY = 'aurabarber_theme_dark_v1';
const AUTH_STORAGE_KEY = 'aurabarber_auth_tenant_id_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true; // Default dark for luxury barber vibe
  });

  // Active view
  const [viewMode, setViewMode] = useState<ViewMode>('barber');
  const [barberSubTab, setBarberSubTab] = useState<BarberSubTab>('agenda');

  // Multi-tenant list
  const [tenants, setTenants] = useState<BarberTenant[]>(() => {
    try {
      const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialTenants;
  });

  // Current selected tenant
  const [currentTenantId, setCurrentTenantIdState] = useState<string>(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth && initialTenants.some((t) => t.id === savedAuth)) {
      return savedAuth;
    }
    return initialTenants[0].id;
  });

  // Real Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialAppointments();
  });

  // Toast alerts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);

      if (user && user.email) {
        // Sync or locate tenant for this user
        setTenants((prev) => {
          const existing = prev.find(
            (t) => t.email.toLowerCase() === user.email?.toLowerCase() || t.id === user.uid
          );
          if (existing) {
            setCurrentTenantIdState(existing.id);
            localStorage.setItem(AUTH_STORAGE_KEY, existing.id);
            return prev;
          }

          // If first time sign-in, auto-provision tenant
          const newId = user.uid;
          const safeEmail = user.email || 'barbeiro@aurabarber.app';
          const userDisplayName = user.displayName || safeEmail.split('@')[0] || 'Barbeiro';
          const userSlug = userDisplayName.toLowerCase().replace(/[^a-z0-9]/g, '-') || `barber-${newId.slice(0, 6)}`;
          
          const newTenant: BarberTenant = {
            id: newId,
            slug: userSlug,
            name: userDisplayName,
            barbershopName: `${userDisplayName} Barbershop`,
            email: safeEmail,
            phone: '11999998888',
            bio: `Atendimento profissional e personalizado por ${userDisplayName}.`,
            address: 'São Paulo - SP',
            instagram: `@${userSlug}`,
            avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            coverUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80',
            publishedServices: initialTenants[0].publishedServices.map((s) => ({
              ...s,
              id: `srv-${newId}-${Math.random().toString(36).substring(2, 6)}`,
              tenantId: newId,
            })),
            draftServices: initialTenants[0].publishedServices.map((s) => ({
              ...s,
              id: `srv-${newId}-${Math.random().toString(36).substring(2, 6)}`,
              tenantId: newId,
            })),
            workingConfig: defaultWorkingConfig,
            draftWorkingConfig: defaultWorkingConfig,
            hasUnpublishedChanges: false,
            createdAt: new Date().toISOString(),
          };

          setCurrentTenantIdState(newId);
          localStorage.setItem(AUTH_STORAGE_KEY, newId);
          return [newTenant, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  // Persist tenants
  useEffect(() => {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
  }, [tenants]);

  // Persist appointments
  useEffect(() => {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  const setCurrentTenantId = (tenantId: string) => {
    setCurrentTenantIdState(tenantId);
    localStorage.setItem(AUTH_STORAGE_KEY, tenantId);
  };

  // Firebase Auth Error Parser
  const parseFirebaseAuthError = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'E-mail ou senha incorretos.';
      case 'auth/user-not-found':
        return 'Nenhum usuário cadastrado com este e-mail.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso por outro barbeiro.';
      case 'auth/weak-password':
        return 'A senha é fraca. Ela deve ter pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Formato de e-mail inválido.';
      case 'auth/network-request-failed':
        return 'Falha na conexão de rede. Verifique sua internet.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas sem sucesso. Tente novamente em alguns minutos.';
      default:
        return 'Ocorreu um erro na autenticação. Tente novamente.';
    }
  };

  const loginWithFirebase = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      showToast(`Bem-vindo, ${userCredential.user.displayName || email}!`, 'success');
      return { success: true };
    } catch (err: any) {
      const msg = parseFirebaseAuthError(err?.code || '');
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const registerWithFirebase = async (data: {
    email: string;
    password: string;
    name: string;
    barbershopName: string;
    phone: string;
    slug: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      
      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: data.name.trim(),
      });

      // Provision tenant in local state
      const newTenant = createNewBarberTenant({
        name: data.name.trim(),
        barbershopName: data.barbershopName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        slug: data.slug.trim(),
      });

      // Bind tenant id to firebase user uid
      newTenant.id = userCredential.user.uid;
      setCurrentTenantId(userCredential.user.uid);

      showToast(`Conta de ${data.name} criada com sucesso no Firebase!`, 'success');
      return { success: true };
    } catch (err: any) {
      const msg = parseFirebaseAuthError(err?.code || '');
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logoutFirebase = async () => {
    try {
      await signOut(auth);
      showToast('Sessão encerrada com sucesso.', 'info');
    } catch (err) {
      showToast('Erro ao encerrar sessão.', 'error');
    }
  };

  const createNewBarberTenant = (data: {
    name: string;
    barbershopName: string;
    email: string;
    phone: string;
    slug: string;
  }): BarberTenant => {
    const newId = `tenant-${Math.random().toString(36).substring(2, 8)}`;
    const baseServices: Service[] = [
      {
        id: `srv-${newId}-1`,
        tenantId: newId,
        name: 'Corte Degradê / Tesoura',
        description: 'Corte personalizado moderno com acabamento na navalha.',
        durationMinutes: 45,
        price: 60,
        category: 'cabelo',
        isActive: true,
      },
      {
        id: `srv-${newId}-2`,
        tenantId: newId,
        name: 'Barba Modelada Tradicional',
        description: 'Toalha quente, alinhamento simétrico e hidratação.',
        durationMinutes: 30,
        price: 45,
        category: 'barba',
        isActive: true,
      },
    ];

    const cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '') || `barber-${Date.now()}`;

    const newTenant: BarberTenant = {
      id: newId,
      slug: cleanSlug,
      name: data.name,
      barbershopName: data.barbershopName,
      email: data.email,
      phone: data.phone,
      bio: `Barbearia de alto padrão. Atendimento personalizado por ${data.name}.`,
      address: 'São Paulo - SP',
      instagram: `@${cleanSlug}`,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80',
      publishedServices: baseServices,
      draftServices: baseServices,
      workingConfig: defaultWorkingConfig,
      draftWorkingConfig: defaultWorkingConfig,
      hasUnpublishedChanges: false,
      createdAt: new Date().toISOString(),
    };

    setTenants((prev) => [newTenant, ...prev]);
    setCurrentTenantId(newTenant.id);
    return newTenant;
  };

  const updateTenantProfile = (updates: Partial<BarberTenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === currentTenant.id ? { ...t, ...updates } : t))
    );
    showToast('Perfil do barbeiro atualizado.', 'success');
  };

  // Service Draft handling
  const saveServiceDraft = (service: Service) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== currentTenant.id) return t;
        const exists = t.draftServices.some((s) => s.id === service.id);
        const updatedServices = exists
          ? t.draftServices.map((s) => (s.id === service.id ? service : s))
          : [...t.draftServices, service];
        return {
          ...t,
          draftServices: updatedServices,
          hasUnpublishedChanges: true,
        };
      })
    );
    showToast('Serviço salvo em rascunho. Lembre-se de publicar!', 'info');
  };

  const deleteServiceDraft = (serviceId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== currentTenant.id) return t;
        return {
          ...t,
          draftServices: t.draftServices.filter((s) => s.id !== serviceId),
          hasUnpublishedChanges: true,
        };
      })
    );
    showToast('Serviço removido do rascunho.', 'warning');
  };

  // Schedule Draft handling
  const saveWorkingConfigDraft = (config: WorkingConfig) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== currentTenant.id) return t;
        return {
          ...t,
          draftWorkingConfig: config,
          hasUnpublishedChanges: true,
        };
      })
    );
    showToast('Horários salvos em rascunho. Clique em Publicar para aplicar.', 'info');
  };

  // Publish all drafts to live public profile
  const publishAllChanges = () => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== currentTenant.id) return t;
        return {
          ...t,
          publishedServices: [...t.draftServices],
          workingConfig: { ...t.draftWorkingConfig },
          hasUnpublishedChanges: false,
        };
      })
    );
    showToast('Alterações publicadas! Seus clientes já podem ver a nova agenda e serviços.', 'success');
  };

  const discardDraftChanges = () => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== currentTenant.id) return t;
        return {
          ...t,
          draftServices: [...t.publishedServices],
          draftWorkingConfig: { ...t.workingConfig },
          hasUnpublishedChanges: false,
        };
      })
    );
    showToast('Rascunhos descartados. Restaurado estado publicado.', 'info');
  };

  // Appointments
  const getTenantAppointments = (tenantId = currentTenant.id): Appointment[] => {
    return appointments.filter((app) => app.tenantId === tenantId);
  };

  const bookAppointment = (data: {
    tenantId: string;
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    date: string;
    time: string;
    clientName: string;
    clientPhone: string;
    clientNotes?: string;
    bookedVia?: 'cliente_web' | 'barbeiro_manual';
  }): Appointment | null => {
    const endTime = calculateEndTime(data.time, data.serviceDuration);

    const newAppointment: Appointment = {
      id: `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      tenantId: data.tenantId,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientNotes: data.clientNotes,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      servicePrice: data.servicePrice,
      serviceDuration: data.serviceDuration,
      date: data.date,
      time: data.time,
      endTime,
      status: 'confirmado',
      createdAt: new Date().toISOString(),
      bookedVia: data.bookedVia || 'cliente_web',
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    showToast(`Agendamento de ${data.clientName} confirmado para ${data.time}!`, 'success');
    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
    const labels: Record<AppointmentStatus, string> = {
      pendente: 'Pendente',
      confirmado: 'Confirmado',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    showToast(`Status atualizado para: ${labels[status]}`, 'info');
  };

  const cancelAppointment = (id: string) => {
    updateAppointmentStatus(id, 'cancelado');
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        barberSubTab,
        setBarberSubTab,
        isDarkMode,
        toggleDarkMode,
        tenants,
        currentTenant,
        setCurrentTenantId,
        createNewBarberTenant,
        updateTenantProfile,
        firebaseUser,
        isAuthLoading,
        loginWithFirebase,
        registerWithFirebase,
        logoutFirebase,
        saveServiceDraft,
        deleteServiceDraft,
        saveWorkingConfigDraft,
        publishAllChanges,
        discardDraftChanges,
        appointments,
        getTenantAppointments,
        bookAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
