import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart3, Download, Printer,
  ClipboardList, TrendingUp, PieChart, Vote, Layers, UserCog, Shield, Award,
  Users, MapPin, GitCompare, CalendarDays,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SurveyData, Session } from '@/types/survey';
import {
  countOccurrences, countArrayOccurrences, toPercentages,
  formatDate, getUniqueInterviewers, exportToCSV,
} from '@/lib/analytics';
import InterviewerManagement from '@/components/InterviewerManagement';
import AccessControl from '@/components/AccessControl';
import OverviewTab from '@/components/OverviewTab';
import OpiniaoTab from '@/components/OpiniaoTab';
import CandidatosTab from '@/components/CandidatosTab';
import ComparisonTab from './ComparisonTab';
import SurveysManagementTab from '@/components/SurveysManagementTab';
import RodadasManagementTab from '@/components/RodadasManagementTab';
import IndividualReportTab from '@/components/IndividualReportTab';
import SurveyDetailModal from '@/components/SurveyDetailModal';
import AdminFilters from '@/components/AdminFilters';
import DeleteSurveyModal from '@/components/DeleteSurveyModal';
import { KpiCard } from '@/components/AdminWidgets';
import { META_ENTREVISTAS } from '@/data/surveyOptions';

interface AdminDashboardProps {
  session: Session;
  onLogout: () => void;
}

type FilterType = 'all' | string;

interface RodadaItem {
  id: string;
  nome: string;
  turno: string;
  ativa: boolean;
}

export default function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const adminName = session.name;
  const isMaster = session.role !== 'secondary';

  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [rodadas, setRodadas] = useState<RodadaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterRodada, setFilterRodada] = useState<FilterType>('all');
  const [filterBairro, setFilterBairro] = useState<FilterType>('all');
  const [filterArea, setFilterArea] = useState<FilterType>('all');
  const [filterInterviewer, setFilterInterviewer] = useState<FilterType>('all');

  const [detailRow, setDetailRow] = useState<SurveyData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SurveyData | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [surveysRes, rodadasRes] = await Promise.all([
        supabase.from('surveys').select('*').order('created_at', { ascending: false }),
        supabase.from('pesquisa_rodadas').select('*').order('created_at', { ascending: false })
      ]);

      if (surveysRes.error) throw surveysRes.error;
      if (rodadasRes.error) throw rodadasRes.error;

      setSurveys((surveysRes.data || []) as SurveyData[]);
      setRodadas((rodadasRes.data || []) as RodadaItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return surveys.filter((s) => {
      if (filterRodada !== 'all' && s.rodada !== filterRodada) return false;
      if (filterBairro !== 'all' && s.bairro !== filterBairro) return false;
      if (filterArea !== 'all' && s.area !== filterArea) return false;
      if (filterInterviewer !== 'all' && s.interviewer_name !== filterInterviewer) return false;
      return true;
    });
  }, [surveys, filterRodada, filterBairro, filterArea, filterInterviewer]);

  const interviewers = useMemo(() => getUniqueInterviewers(surveys), [surveys]);
  const progressPct = surveys.length > 0 ? Math.min((surveys.length / META_ENTREVISTAS) * 100, 100) : 0;
  const hasActiveFilters = filterRodada !== 'all' || filterBairro !== 'all' || filterArea !== 'all' || filterInterviewer !== 'all';

  const clearFilters = () => {
    setFilterRodada('all');
    setFilterBairro('all');
    setFilterArea('all');
    setFilterInterviewer('all');
  };

  const handleDeleteWithPassword = async () => {
    if (!deleteConfirm || !isMaster) return;
    if (!deletePassword) {
      setDeleteError('Digite sua senha de administrador para confirmar.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error('Usuário não autenticado.');

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword,
      });

      if (authError) {
        setDeleteError('Senha incorreta. A exclusão foi cancelada.');
        setDeleting(false);
        return;
      }

      const { error: deleteErrorDb } = await supabase.from('surveys').delete().eq('id', deleteConfirm.id);
      if (deleteErrorDb) throw deleteErrorDb;

      setDeleteConfirm(null);
      setDeletePassword('');
      await loadData();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir pesquisa');
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = () => { window.print(); };

  // Analytics
  const bairroData = useMemo(() => toPercentages(countOccurrences(filtered, 'bairro')), [filtered]);
  const areaData = useMemo(() => toPercentages(countOccurrences(filtered, 'area')), [filtered]);
  const sexoData = useMemo(() => toPercentages(countOccurrences(filtered, 'sexo')), [filtered]);
  const faixaData = useMemo(() => toPercentages(countOccurrences(filtered, 'faixa_etaria')), [filtered]);
  const escolaridadeData = useMemo(() => toPercentages(countOccurrences(filtered, 'escolaridade')), [filtered]);
  const avalPrefData = useMemo(() => toPercentages(countOccurrences(filtered, 'aval_prefeta')), [filtered]);
  const avalGovData = useMemo(() => toPercentages(countOccurrences(filtered, 'aval_governadora')), [filtered]);
  const problemaData = useMemo(() => toPercentages(countOccurrences(filtered, 'problema_principal')), [filtered]);
  const senadoEspData = useMemo(() => toPercentages(countArrayOccurrences(filtered, 'senado_espontanea')), [filtered]);
  const senadoEstData = useMemo(() => toPercentages(countArrayOccurrences(filtered, 'senado_estimulada')), [filtered]);
  const rejeicaoData = useMemo(() => toPercentages(countOccurrences(filtered, 'rejeicao_senado')), [filtered]);
  const depFedData = useMemo(() => toPercentages(countOccurrences(filtered, 'dep_federal')), [filtered]);
  const depEstData = useMemo(() => toPercentages(countOccurrences(filtered, 'dep_estadual')), [filtered]);
  const influenciaData = useMemo(() => toPercentages(countOccurrences(filtered, 'influencia_apoio')), [filtered]);
  const pesoData = useMemo(() => toPercentages(countOccurrences(filtered, 'peso_escolha')), [filtered]);

  const interviewerStats = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((s) => map.set(s.interviewer_name, (map.get(s.interviewer_name) || 0) + 1));
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  const [selectedInterviewerReport, setSelectedInterviewerReport] = useState<string | null>(null);

  const interviewerReportData = useMemo(() => {
    if (!selectedInterviewerReport) return null;
    const intvSurveys = filtered.filter((s) => s.interviewer_name === selectedInterviewerReport);
    const bairrosCovered = Array.from(new Set(intvSurveys.map((s) => s.bairro))).sort();
    const areasCovered = Array.from(new Set(intvSurveys.map((s) => s.area))).sort();
    const firstSubmission = intvSurveys.length > 0
      ? intvSurveys.reduce((min, s) => {
          const d = new Date(s.created_at || '').getTime();
          return d < min ? d : min;
        }, Date.now())
      : null;
    const lastSubmission = intvSurveys.length > 0
      ? intvSurveys.reduce((max, s) => {
          const d = new Date(s.created_at || '').getTime();
          return d > max ? d : max;
        }, 0)
      : null;
    const byDate = new Map<string, number>();
    intvSurveys.forEach((s) => {
      const day = s.created_at ? formatDate(s.created_at) : '—';
      byDate.set(day, (byDate.get(day) || 0) + 1);
    });
    const dailyBreakdown = Array.from(byDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return {
      total: intvSurveys.length,
      bairros: bairrosCovered,
      areas: areasCovered,
      firstSubmission,
      lastSubmission,
      dailyBreakdown,
      surveys: intvSurveys.sort((a, b) =>
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      ),
    };
  }, [selectedInterviewerReport, filtered]);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: PieChart },
    { id: 'opiniao', label: 'Opinião', icon: TrendingUp },
    { id: 'candidatos', label: 'Candidatos', icon: Vote },
    { id: 'comparativo', label: 'Comparativo / Cruzamento', icon: GitCompare },
    { id: 'gestao', label: 'Entrevistas', icon: Layers },
    { id: 'relatorio', label: 'Relatório Individual', icon: Award },
    ...(isMaster
      ? [
          { id: 'rodadas', label: 'Gerenciar Pesquisas', icon: CalendarDays },
          { id: 'entrevistadores', label: 'Gerenciar Equipe', icon: UserCog },
          { id: 'acessos', label: 'Controle de Acessos', icon: Shield },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-base sm:text-lg leading-tight">
                  Painel de Apuração {isMaster ? '(Master)' : '(Secundário)'}
                </h1>
                <p className="text-gray-400 text-xs">Bezerros/PE — Setembro 2026 · Olá, {adminName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => exportToCSV(filtered)} className="btn-secondary text-sm flex items-center gap-1.5 !py-2">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar CSV</span>
              </button>
              <button onClick={handlePrint} className="btn-secondary text-sm flex items-center gap-1.5 !py-2">
                <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimir</span>
              </button>
              <button onClick={onLogout} className="btn-secondary text-sm !py-2">Sair</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Progress + KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Progresso da Meta</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filtered.length} <span className="text-gray-400 text-base font-normal">/ {META_ENTREVISTAS}</span>
                </p>
              </div>
              <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-xl">
                <ClipboardList className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{progressPct.toFixed(1)}% da meta alcançada</p>
          </div>

          <KpiCard icon={Users} label="Entrevistadores" value={interviewers.length} color="emerald" />
          <KpiCard icon={MapPin} label="Bairros Cobertos" value={bairroData.length} color="amber" />
        </div>

        {/* Componente de Filtros isolado */}
        <AdminFilters
          filterRodada={filterRodada}
          setFilterRodada={setFilterRodada}
          filterBairro={filterBairro}
          setFilterBairro={setFilterBairro}
          filterArea={filterArea}
          setFilterArea={setFilterArea}
          filterInterviewer={filterInterviewer}
          setFilterInterviewer={setFilterInterviewer}
          rodadas={rodadas}
          interviewers={interviewers}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {error && (
          <div className="card p-4 mb-6 border-red-200 bg-red-50">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 no-print overflow-x-auto sticky top-16 bg-gray-50 z-20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : filtered.length === 0 && activeTab !== 'entrevistadores' && activeTab !== 'acessos' && activeTab !== 'rodadas' ? (
          <div className="card p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma entrevista encontrada com os filtros selecionados</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                surveys={filtered}
                bairroData={bairroData}
                areaData={areaData}
                sexoData={sexoData}
                faixaData={faixaData}
                escolaridadeData={escolaridadeData}
                interviewerStats={interviewerStats}
              />
            )}

            {activeTab === 'opiniao' && (
              <OpiniaoTab
                avalPrefData={avalPrefData}
                avalGovData={avalGovData}
                problemaData={problemaData}
                influenciaData={influenciaData}
                pesoData={pesoData}
              />
            )}

            {activeTab === 'candidatos' && (
              <CandidatosTab
                senadoEspData={senadoEspData}
                senadoEstData={senadoEstData}
                rejeicaoData={rejeicaoData}
                depFedData={depFedData}
                depEstData={depEstData}
              />
            )}

            {activeTab === 'comparativo' && (
              <ComparisonTab surveys={surveys} />
            )}

            {activeTab === 'gestao' && (
              <SurveysManagementTab
                filteredSurveys={filtered}
                onViewDetails={(row) => setDetailRow(row)}
                onDeleteSurvey={isMaster ? (row) => setDeleteConfirm(row) : () => {}}
              />
            )}

            {activeTab === 'relatorio' && (
              <IndividualReportTab
                interviewerStats={interviewerStats}
                selectedInterviewerReport={selectedInterviewerReport}
                onSelectInterviewer={(name) => setSelectedInterviewerReport(name)}
                interviewerReportData={interviewerReportData}
                onViewDetails={(row) => setDetailRow(row)}
              />
            )}

            {activeTab === 'rodadas' && isMaster && (
              <RodadasManagementTab />
            )}

            {activeTab === 'entrevistadores' && isMaster && (
              <InterviewerManagement adminName={adminName} />
            )}

            {activeTab === 'acessos' && isMaster && (
              <AccessControl adminName={adminName} />
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {detailRow && (
        <SurveyDetailModal detailRow={detailRow} onClose={() => setDetailRow(null)} />
      )}

      {/* Componente de Modal de Exclusão isolado */}
      {deleteConfirm && isMaster && (
        <DeleteSurveyModal
          deleteConfirm={deleteConfirm}
          deletePassword={deletePassword}
          setDeletePassword={setDeletePassword}
          deleteError={deleteError}
          deleting={deleting}
          onClose={() => { setDeleteConfirm(null); setDeletePassword(''); setDeleteError(''); }}
          onConfirm={handleDeleteWithPassword}
        />
      )}
    </div>
  );
}