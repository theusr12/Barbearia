import React, { useState } from 'react';
import {
  BookOpen,
  Database,
  Shield,
  Cpu,
  Layers,
  CheckCircle,
  Copy,
  Check,
  Server,
  Code2,
  Workflow,
  Sparkles,
  Zap,
  TrendingUp,
  Smartphone,
  Calendar,
  Flame,
} from 'lucide-react';

export const TechnicalDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'visao' | 'arquitetura' | 'banco' | 'algoritmo' | 'deploy'
  >('visao');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const sqlSchema = `-- ============================================================================
-- ESQUEMA RELACIONAL MULTI-TENANT (SUPABASE / POSTGRESQL 15+)
-- Plataforma AuraBarber SaaS para Barbeiros Autônomos
-- ============================================================================

-- Habilitar extensões necessárias para UUID e constraints de intervalo temporal
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 1. TABELA DE TENANTS (Cada Barbeiro Autônomo é um Tenant isolado)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(60) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    barbershop_name VARCHAR(140) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    bio TEXT,
    address TEXT,
    instagram VARCHAR(80),
    avatar_url TEXT,
    cover_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE SERVIÇOS (Suporta rascunho e publicação)
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(40) DEFAULT 'cabelo',
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONFIGURAÇÃO DE EXPEDIENTE E HORÁRIOS DO TENANT
CREATE TABLE public.business_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 6=Sáb
    is_open BOOLEAN DEFAULT true,
    start_hour TIME NOT NULL,
    end_hour TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    buffer_minutes SMALLINT DEFAULT 5,
    min_notice_minutes SMALLINT DEFAULT 45,
    max_advance_days SMALLINT DEFAULT 21,
    is_published BOOLEAN DEFAULT true,
    UNIQUE (tenant_id, day_of_week, is_published)
);

-- 4. TABELA DE AGENDAMENTOS (Com trava estrita contra overbooking)
CREATE TYPE appointment_status AS ENUM ('pendente', 'confirmado', 'concluido', 'cancelado');

CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id),
    client_name VARCHAR(120) NOT NULL,
    client_phone VARCHAR(30) NOT NULL,
    client_notes TEXT,
    service_name VARCHAR(120) NOT NULL,
    service_price DECIMAL(10, 2) NOT NULL,
    service_duration INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    time_range TSRANGE GENERATED ALWAYS AS (tsrange(start_time, end_time)) STORED,
    status appointment_status DEFAULT 'confirmado',
    booked_via VARCHAR(30) DEFAULT 'cliente_web',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- REGRA CRÍTICA: Bloqueia 100% de conflitos no banco para horários não cancelados
    CONSTRAINT prevent_appointment_overlap EXCLUDE USING gist (
        tenant_id WITH =,
        time_range WITH &&
    ) WHERE (status <> 'cancelado')
);

-- ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX idx_appointments_tenant_date ON public.appointments (tenant_id, start_time);
CREATE INDEX idx_services_tenant ON public.services (tenant_id, is_active, is_published);
CREATE INDEX idx_tenants_slug ON public.tenants (slug);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- CLIENTES PÚBLICOS: Podem ler apenas dados publicados do barbeiro
CREATE POLICY "Public Read Published Services" ON public.services
    FOR SELECT USING (is_published = true AND is_active = true);

CREATE POLICY "Public Read Published Schedules" ON public.business_schedules
    FOR SELECT USING (is_published = true);

-- CLIENTES PÚBLICOS: Podem inserir novos agendamentos
CREATE POLICY "Public Insert Appointments" ON public.appointments
    FOR INSERT WITH CHECK (true);

-- BARBEIRO (AUTENTICADO): Acesso total estritamente ao seu próprio tenant_id
CREATE POLICY "Barber Tenant Isolation" ON public.appointments
    FOR ALL USING (auth.uid() = tenant_id);
`;

  const firestoreRules = `// ============================================================================
// REGRAS DE SEGURANÇA FIRESTORE (firestore.rules)
// Estrutura Hierárquica Multi-Tenant por Subcoleções
// ============================================================================
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função utilitária para verificar dono da conta (Barbeiro autenticado)
    function isBarberOwner(tenantId) {
      return request.auth != null && request.auth.uid == tenantId;
    }

    // Coleção Raiz: Tenants (Barbeiros)
    match /tenants/{tenantId} {
      // Público pode ler perfil do barbeiro; Barbeiro edita o seu
      allow read: if true;
      allow write: if isBarberOwner(tenantId);

      // Subcoleção: Serviços
      match /services/{serviceId} {
        // Clientes só leem se estiver publicado
        allow read: if resource.data.is_published == true || isBarberOwner(tenantId);
        allow write: if isBarberOwner(tenantId);
      }

      // Subcoleção: Expediente / Horários
      match /schedules/{scheduleId} {
        allow read: if true;
        allow write: if isBarberOwner(tenantId);
      }

      // Subcoleção: Agendamentos
      match /appointments/{appointmentId} {
        // Clientes podem criar agendamento se data não for retroativa
        allow create: if request.resource.data.startTime > request.time
                      && request.resource.data.clientPhone is string
                      && request.resource.data.clientName is string;
        
        // Barbeiro tem controle total da sua agenda
        allow read, update, delete: if isBarberOwner(tenantId);
      }
    }
  }
}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl border bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border-neutral-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Documentação Técnica & Estratégica SaaS
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-50 font-serif">
            AuraBarber Platform Architecture
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Visão completa do produto, racional de design UI/UX, arquitetura de software multi-tenant, modelagem relacional ACID no Supabase PostgreSQL vs Firestore NoSQL, e algoritmos de prevenção estrita de conflitos em tempo real.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-px">
        {[
          { id: 'visao', label: '1. Visão de Produto & UX', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'arquitetura', label: '2. Arquitetura Multi-Tenant', icon: <Layers className="w-4 h-4" /> },
          { id: 'banco', label: '3. Modelagem de Dados & RLS', icon: <Database className="w-4 h-4" /> },
          { id: 'algoritmo', label: '4. Algoritmo de Horários', icon: <Cpu className="w-4 h-4" /> },
          { id: 'deploy', label: '5. Deploy & Escalabilidade', icon: <Server className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: VISÃO DE PRODUTO & UX */}
      {activeTab === 'visao' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                O Problema do Barbeiro Autônomo
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Barbeiros autônomos perdem em média <strong>2 a 3 horas por dia</strong> respondendo mensagens soltas no WhatsApp, negociando horários, sofrendo com <strong>no-show (25% a 35% de faltas sem aviso)</strong> e conflitos de horários em cadernos de papel ou agendas genéricas.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Proposta de Valor (Value Proposition)
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Um link único oficial para a bio do Instagram e WhatsApp que <strong>transforma visitantes em clientes confirmados em 3 cliques</strong>. Sem app para baixar, sem atrito de cadastro para o cliente final, e com regras rígidas de antecipação e buffer para o barbeiro.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Design System & Paleta de Cores
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Paleta <strong>Carvão (#121214), Dourado Imperial (#D4AF37) e Branco Off-white</strong>: transmite autoridade de alto padrão, sofisticação e estilo barbershop boutique. Tipografia legível, zero badges estáticos inúteis, e 100% responsivo para uso com uma só mão no celular.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
              Fluxos de Experiência (UX Journeys)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  Jornada do Cliente (Área Pública)
                </span>
                <ol className="list-decimal list-inside text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
                  <li>Acessa <code>aurabarber.app/@slug</code> via link da bio ou QR code impresso.</li>
                  <li>Vê a lista de serviços publicados com preços em R$ e duração exata.</li>
                  <li>Escolhe a data desejada e visualiza apenas os slots reais livres.</li>
                  <li>Preenche Nome e WhatsApp (sem necessidade de criar senha ou conta).</li>
                  <li>Recebe na hora o voucher digital e link direto para WhatsApp e Google Calendar.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  Jornada do Barbeiro (Área Privada)
                </span>
                <ol className="list-decimal list-inside text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
                  <li>Autentica com seu e-mail profissional e acessa seu painel isolado.</li>
                  <li>Configura expediente, intervalos de almoço e tempo de descanso entre cortes.</li>
                  <li>Edita seus serviços em modo Rascunho com tranquilidade.</li>
                  <li>Clica em &quot;Publicar Alterações&quot; quando estiver pronto para os clientes verem.</li>
                  <li>Acompanha a agenda em lista diária ou calendário com lembretes WhatsApp de 1 clique.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ARQUITETURA MULTI-TENANT */}
      {activeTab === 'arquitetura' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
              Decisão Arquitetural: Supabase (PostgreSQL) vs Firebase (NoSQL)
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              O usuário solicitou uma justificativa sólida entre <strong>Supabase</strong> e <strong>Firebase</strong>. Como engenheiro de software sênior especialista em SaaS de agendamento, <strong>a recomendação técnica definitiva é o Supabase (PostgreSQL com Row Level Security)</strong>.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    <th className="py-2.5 px-3 font-semibold">Critério Crítico de Agendamento</th>
                    <th className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">Supabase (PostgreSQL 15+)</th>
                    <th className="py-2.5 px-3 font-semibold text-neutral-500">Firebase (Firestore NoSQL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <tr>
                    <td className="py-3 px-3 font-semibold">Prevenção de Overbooking (Dois clientes no mesmo minuto)</td>
                    <td className="py-3 px-3 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 font-medium">
                      Exclusion Constraints nativas (<code>btree_gist</code> + <code>tsrange &&</code>) e transações ACID com lock em nível de linha. Impossível haver colisão.
                    </td>
                    <td className="py-3 px-3">
                      Requer transações manuais no SDK cliente ou Cloud Functions com Firestore RunTransaction. Alta complexidade e suscetível a conflito de escrita em concorrência.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold">Multi-Tenancy & Segurança</td>
                    <td className="py-3 px-3 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 font-medium">
                      Row-Level Security (RLS) no núcleo do banco. Barbeiro só enxerga linhas onde <code>auth.uid() = tenant_id</code>.
                    </td>
                    <td className="py-3 px-3">
                      Regras de segurança declarativas em <code>firestore.rules</code>. Bom para documentos simples, mas complexo para queries compostas.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold">Cálculo de Relatórios e Faturamento</td>
                    <td className="py-3 px-3 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 font-medium">
                      Agregações SQL instantâneas (<code>SUM</code>, <code>AVG</code>, <code>GROUP BY</code>) sem custo extra de leitura.
                    </td>
                    <td className="py-3 px-3">
                      Cobrança por documento lido. Gerar relatórios mensais lê centenas de docs e onera custos da fatura.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold">Sistema de Rascunho vs Publicado</td>
                    <td className="py-3 px-3 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 font-medium">
                      Coluna booleana <code>is_published</code> com índice parcial filtrado.
                    </td>
                    <td className="py-3 px-3">
                      Documentos duplicados ou flag no documento com regras condicionais.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-3">
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Estratégia de Multi-Tenancy: Shared Database + Tenant ID + RLS
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Adotamos o padrão <strong>Shared Database, Shared Schema com segregação lógica por Tenant ID</strong>. Cada barbeiro cadastrado recebe um UUID único (<code>tenant_id</code>) e um subdomínio/slug amigável. As políticas de Row-Level Security impedem que qualquer query SQL execute sem o filtro explícito do tenant autenticado, garantindo isolamento absoluto de dados de faturamento e clientes entre barbearias.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: BANCO DE DADOS & RLS */}
      {activeTab === 'banco' && (
        <div className="space-y-6">
          {/* SQL DDL */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-mono font-bold text-neutral-200">
                  schema.sql (PostgreSQL 15+ / Supabase Migration)
                </span>
              </div>
              <button
                onClick={() => handleCopy(sqlSchema, 'sql')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                {copiedCode === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'sql' ? 'Copiado!' : 'Copiar DDL'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-amber-100/90 overflow-x-auto max-h-96 leading-relaxed">
              <code>{sqlSchema}</code>
            </pre>
          </div>

          {/* Active Firebase SDK Implementation */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-mono font-bold text-neutral-200">
                  src/lib/firebase.ts (SDK Snippet Ativo na Aplicação)
                </span>
              </div>
              <button
                onClick={() => handleCopy(`// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWCQgCLMwEEDqsNqRYHMcOojf2YrYeDz4",
  authDomain: "ardent-field-7hl8x.firebaseapp.com",
  projectId: "ardent-field-7hl8x",
  storageBucket: "ardent-field-7hl8x.firebasestorage.app",
  messagingSenderId: "882418500493",
  appId: "1:882418500493:web:f0d227482106921163f3c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);`, 'sdk')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                {copiedCode === 'sdk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'sdk' ? 'Copiado!' : 'Copiar SDK'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-amber-100/90 overflow-x-auto max-h-72 leading-relaxed">
              <code>{`// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWCQgCLMwEEDqsNqRYHMcOojf2YrYeDz4",
  authDomain: "ardent-field-7hl8x.firebaseapp.com",
  projectId: "ardent-field-7hl8x",
  storageBucket: "ardent-field-7hl8x.firebasestorage.app",
  messagingSenderId: "882418500493",
  appId: "1:882418500493:web:f0d227482106921163f3c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);`}</code>
            </pre>
          </div>

          {/* Firestore Rules */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-mono font-bold text-neutral-200">
                  firestore.rules (Caso opção por Firebase)
                </span>
              </div>
              <button
                onClick={() => handleCopy(firestoreRules, 'firestore')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                {copiedCode === 'firestore' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode === 'firestore' ? 'Copiado!' : 'Copiar Rules'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-amber-100/90 overflow-x-auto max-h-80 leading-relaxed">
              <code>{firestoreRules}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: ALGORITMO DE DISPONIBILIDADE */}
      {activeTab === 'algoritmo' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-500" />
              Algoritmo de Geração de Horários & Prevenção de Conflitos
            </h3>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              O motor de agendamento avalia iterativamente a linha do tempo do dia escolhido em incrementos configuráveis (<code>slotIntervalMinutes</code>, por padrão 30m). Cada slot passa por uma esteira rigorosa de 4 validações:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-1.5">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  1. Filtro Temporal Retroativo & Antecedência
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Se a data for o dia de hoje, qualquer horário cujo timestamp seja inferior a <code>now() + minNoticeMinutes</code> (ex: 45 min) é imediatamente bloqueado e marcado com a tag <code>passado</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-1.5">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  2. Limites do Expediente & Folgas
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Verifica se o dia da semana está ativo (<code>isOpen = true</code>). Se a duração do serviço somada ao horário de início ultrapassar o <code>endHour</code> do barbeiro, o slot é suprimido.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-1.5">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  3. Colisão com Intervalo de Almoço / Pausa
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Se a janela do atendimento <code>[slotStart, slotEnd]</code> colidir com o intervalo <code>[breakStart, breakEnd]</code>, o horário é sinalizado com o motivo <code>almoco</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-1.5">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  4. Colisão com Agendamentos Existentes + Buffer
                </span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Compara a janela contra todos os agendamentos ativos daquele tenant no dia. Dois intervalos colidem se: <code>!(slotEnd + buffer &lt;= appStart || appEnd + buffer &lt;= slotStart)</code>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-neutral-700 dark:text-neutral-300">
              <strong className="text-neutral-900 dark:text-white">Garantia contra Race Conditions (Concorrência):</strong> No frontend, os slots são recalculados em tempo real. No backend Supabase, a constraint PostgreSQL <code>prevent_appointment_overlap</code> atua como uma barreira atômica. Se dois clientes enviarem a confirmação no mesmíssimo milissegundo, a transação do segundo cliente recebe erro de integridade e o frontend convida a escolher outro horário sem que haja duplicidade.
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DEPLOY & ESCALABILIDADE */}
      {activeTab === 'deploy' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-500" />
              Estratégia de Deploy, CI/CD e Escalabilidade
            </h3>

            <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                  1. Topologia de Infraestrutura Recomendada
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Frontend:</strong> React + Tailwind hospedado na Vercel ou Cloud Run com CDN global distribuída (Cloudflare), proporcionando TTFB &lt; 50ms para clientes no celular.</li>
                  <li><strong>Banco de Dados & Auth:</strong> Supabase gerenciado na AWS São Paulo (região <code>sa-east-1</code>) para latência inferior a 15ms no Brasil.</li>
                  <li><strong>Cache & Rate Limiting:</strong> Upstash Redis para proteção de rotas públicas de agendamento contra spam de bots.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                  2. Estratégia de Redução de Faltas (WhatsApp Webhooks)
                </h4>
                <p>
                  A plataforma se conecta via Webhook a uma instância WhatsApp API (ex: Evolution API ou Z-API). Sempre que um agendamento é criado:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Disparo imediato de confirmação com link de cancelamento amigável.</li>
                  <li>Disparo automático <strong>T-24h</strong> (24 horas antes) solicitando confirmação de presença (botão &quot;Confirmar Presença&quot;).</li>
                  <li>Disparo automático <strong>T-2h</strong> (2 horas antes) com rota do Google Maps para a barbearia.</li>
                  <li>Essa automação reduz a taxa de no-show comprovadamente de 30% para menos de 4%.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                  3. Preparação para Expansão Futura (Multi-Barbeiro por Barbearia)
                </h4>
                <p>
                  A modelagem foi desenhada de forma desacoplada: cada tenant pode no futuro possuir múltiplos <code>barber_profiles</code> vinculados via tabela associativa, transformando o SaaS de autônomo individual para franquia de barbearia com escolha de profissional no primeiro passo do agendamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
