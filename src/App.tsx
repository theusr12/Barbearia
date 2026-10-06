import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/ui/Header';
import { BarberDashboard } from './components/barber/BarberDashboard';
import { ClientBookingPortal } from './components/client/ClientBookingPortal';
import { TechnicalDocumentation } from './components/docs/TechnicalDocumentation';
import { NewBarberModal } from './components/auth/NewBarberModal';
import { BarberAuthScreen } from './components/auth/BarberAuthScreen';
import { ToastContainer } from './components/ui/ToastContainer';

const MainApp: React.FC = () => {
  const { viewMode, firebaseUser, isAuthLoading } = useApp();
  const [isNewBarberModalOpen, setIsNewBarberModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      {/* Top Header Navigation (always present for navigation between Barber, Client and Technical Docs) */}
      <Header onOpenNewBarberModal={() => setIsNewBarberModalOpen(true)} />

      {/* Main Area based on selected View Mode */}
      <div className="pb-12">
        {viewMode === 'barber' && (
          isAuthLoading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-neutral-400">Verificando autenticação no Firebase...</p>
            </div>
          ) : firebaseUser ? (
            <BarberDashboard />
          ) : (
            <BarberAuthScreen />
          )
        )}
        {viewMode === 'client' && <ClientBookingPortal />}
        {viewMode === 'docs' && <TechnicalDocumentation />}
      </div>

      {/* Modals & Alerts */}
      <NewBarberModal
        isOpen={isNewBarberModalOpen}
        onClose={() => setIsNewBarberModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
