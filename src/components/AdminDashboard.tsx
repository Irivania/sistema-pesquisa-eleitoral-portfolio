import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart3, Download, Printer, Filter, X,
  ClipboardList, TrendingUp, PieChart, Vote, Layers, UserCog, Shield, Award,
  Users, MapPin, GitCompare,
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
import IndividualReportTab from '@/components/IndividualReportTab';
import SurveyDetailModal from '@/components/SurveyDetailModal';
import { KpiCard, FilterSelect } from '@/components/AdminWidgets';
import {
  BAIRROS, AREAS,
  META_ENTREVISTAS, RODADAS_PESQUISA,
} from '@/data/surveyOptions';

interface AdminDashboardProps {
  session: Session;
  onLogout: () => void;
}

type FilterType = 'all' | string;

export default function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const adminName = session.name;
  const isMaster = session.role !== 'secondary';

  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
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

  const loadSurveys = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSurveys((data || []) as SurveyData[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

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
      await loadSurveys();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir pesquisa');
    } finally {
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Analytics baseados nos dados filtrados
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
        <div className="hidden print-only mb-6">
          <h1 className="text-2xl font-bold">Levantamento Interno de Opinião — Bezerros/PE</h1>
          <p className="text-gray-600">Setembro 2026 — Relatório de Apuração</p>
          <p className="text-gray-500 text-sm">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

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

        {/* Filters + Rodada Selector */}
        <div className="card p-4 mb-6 no-print">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filtros e Seleção de Pesquisa</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="ml-auto text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Pesquisa / Rodada</label>
              <div className="relative">
                <select
                  value={filterRodada}
                  onChange={(e) => setFilterRodada(e.target.value)}
                  className="input-field appearance-none pr-8 text-sm bg-blue-50/40 font-medium text-blue-900"
                >
                  <option value="all">Todas as Pesquisas (Geral)</option>
                  {RODADAS_PESQUISA.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bairro / Localidade</label>
              <FilterSelect value={filterBairro} onChange={setFilterBairro} options={BAIRROS} allLabel="Todos os bairros" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Área</label>
              <FilterSelect value={filterArea} onChange={setFilterArea} options={AREAS} allLabel="Todas as áreas" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Entrevistador</label>
              <FilterSelect value={filterInterviewer} onChange={setFilterInterviewer} options={interviewers} allLabel="Todos os entrevistadores" />
            </div>
          </div>
        </div>

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
        ) : filtered.length === 0 && activeTab !== 'entrevistadores' && activeTab !== 'acessos' ? (
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

            {activeTab === 'entrevistadores' && isMaster && (
              <InterviewerManagement adminName={adminName} />
            )}

            {activeTab === 'acessos' && isMaster && (
              <AccessControl adminName={adminName} />
            )}
          </>
        )}
      </div>

      {/* Detail Modal Modularizado */}
      {detailRow && (
        <SurveyDetailModal detailRow={detailRow} onClose={() => setDetailRow(null)} />
      )}

      {/* Delete Confirmation with Password */}
      {deleteConfirm && isMaster && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <div className="text-amber-600 font-bold text-lg">⚠️</div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm">Cuidado: Ação Irreversível</h3>
                <p className="text-xs text-amber-700">Você está prestes a excluir permanentemente esta entrevista.</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Entrevista de <strong>{deleteConfirm.interviewer_name}</strong> no bairro <strong>{deleteConfirm.bairro}</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Digite sua senha de Administrador Master para confirmar:
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Sua senha..."
                className="input-field text-sm"
                autoFocus
              />
              {deleteError && <p className="text-xs text-red-600 mt-1">{deleteError}</p>}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeletePassword(''); setDeleteError(''); }}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteWithPassword}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}