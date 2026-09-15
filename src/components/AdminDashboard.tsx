import { lazy, Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart3, Download, Printer,
  ClipboardList, TrendingUp, PieChart, Vote, Layers, UserCog, Shield, Award,
  Users, MapPin, GitCompare, Settings, Globe,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SurveyData, Session, Interviewer } from '@/types/survey';
import {
  countOccurrences, countArrayOccurrences, toPercentages,
  getUniqueInterviewers, exportToCSV,
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
import DeleteSurveyModal from '@/components/DeleteSurveyModal';
import AdminFilters from '@/components/AdminFilters';
import RodadasManagerModal from '@/components/RodadasManagerModal';
import SurveySetupModal, { SurveyConfigData } from '@/components/SurveySetupModal';
import SurveysConfigListTab from '@/components/SurveysConfigListTab';
import { KpiCard } from '@/components/AdminWidgets';
import { META_ENTREVISTAS } from '@/data/surveyOptions';

const MapaCalorTab = lazy(() => import('@/components/MapaCalorTab'));

interface AdminDashboardProps {
  session: Session;
  onLogout: () => void;
}

type FilterType = 'all' | string;

export default function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const adminName = session.name;
  const isMaster = session.role !== 'secondary';

  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [registeredInterviewers, setRegisteredInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [rodadasList, setRodadasList] = useState<Array<{ id: string; name: string; turn: string }>>([
    { id: 'p1_1t', name: 'Pesquisa SP — 1º Turno', turn: '1º Turno' },
    { id: 'p2_1t', name: 'Pesquisa PE — 1º Turno', turn: '1º Turno' },
    { id: 'p3_2t', name: 'Pesquisa Geral — 2º Turno', turn: '2º Turno' },
  ]);

  const [configsList, setConfigsList] = useState<SurveyConfigData[]>([]);
  const [isSurveySetupOpen, setIsSurveySetupOpen] = useState(false);
  const [configEmEdicao, setConfigEmEdicao] = useState<SurveyConfigData | null>(null);

  const [isModalNovaRodadaOpen, setIsModalNovaRodadaOpen] = useState(false);
  const [rodadaParaEditarId, setRodadaParaEditarId] = useState<string | null>(null);

  const [filterRodada, setFilterRodada] = useState<FilterType>('all');
  const [filterEstado, setFilterEstado] = useState<FilterType>('all');
  const [filterBairro, setFilterBairro] = useState<string>('');
  const [filterArea, setFilterArea] = useState<FilterType>('all');
  const [filterInterviewer, setFilterInterviewer] = useState<FilterType>('all');

  const [detailRow, setDetailRow] = useState<SurveyData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SurveyData | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedInterviewerReport, setSelectedInterviewerReport] = useState<string | null>(null);

  // Carrega e desserializa os dados do Neon (unificando respostas_json na raiz para os gráficos)
  const loadSurveys = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = Array.isArray(data)
        ? data.filter((row): row is Record<string, unknown> => (
            typeof row === 'object' && row !== null
          ))
        : [];

      const formattedSurveys: SurveyData[] = rows.map((row) => {
        const respostas = typeof row.respostas_json === 'object' && row.respostas_json !== null
          ? row.respostas_json as Record<string, unknown>
          : {};

        return {
          ...row,
          ...respostas, // Desestrutura o JSONB para que os gráficos leiam as propriedades normalmente
        } as unknown as SurveyData;
      });

      setSurveys(formattedSurveys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  const loadRegisteredInterviewers = useCallback(async () => {
    const { data, error: interviewersError } = await supabase
      .from('interviewers')
      .select('id, name, code, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!interviewersError) {
      setRegisteredInterviewers((data || []) as unknown as Interviewer[]);
    }
  }, []);

  useEffect(() => {
    loadRegisteredInterviewers();
  }, [loadRegisteredInterviewers]);

  const handleSalvarRodada = (nome: string, turno: string, idParaEditar?: string) => {
    if (idParaEditar) {
      setRodadasList((prev) =>
        prev.map((r) => (r.id === idParaEditar ? { ...r, name: nome, turn: turno } : r))
      );
    } else {
      const novoId = `rodada_${Date.now()}`;
      setRodadasList((prev) => [...prev, { id: novoId, name: nome, turn: turno }]);
    }
    setRodadaParaEditarId(null);
  };

  const handleSalvarConfiguracao = (novaConfig: SurveyConfigData) => {
    setConfigsList((prev) => {
      const existe = prev.some((c) => c.id === novaConfig.id);
      if (existe) {
        return prev.map((c) => (c.id === novaConfig.id ? novaConfig : c));
      }
      return [...prev, novaConfig];
    });
    setConfigEmEdicao(null);
  };

  const handleDeleteConfig = (id: string) => {
    setConfigsList((prev) => prev.filter((c) => c.id !== id));
  };

  const rodadaEmEdicao = useMemo(() => {
    if (!rodadaParaEditarId) return null;
    const r = rodadasList.find((item) => item.id === rodadaParaEditarId);
    return r ? { id: r.id, name: r.name, turn: r.turn } : null;
  }, [rodadasList, rodadaParaEditarId]);

  // Filtro robusto que verifica tanto colunas relacionais quanto propriedades do respostas_json
  const filtered = useMemo(() => {
    return surveys.filter((s) => {
      if (filterRodada !== 'all' && s.rodada !== filterRodada) return false;
      if (filterEstado !== 'all' && s.estado !== filterEstado) return false;
      
      if (filterBairro && filterBairro.trim() !== '') {
        const termo = filterBairro.toLowerCase();
        const cidadeRaiz = (s.cidade || '').toLowerCase();
        const bairroRaiz = (s.bairro || '').toLowerCase();
        const cidadeJson = typeof s.respostas_json?.cidade === 'string'
          ? s.respostas_json.cidade.toLowerCase()
          : '';
        
        const matchLocal = cidadeRaiz.includes(termo) || bairroRaiz.includes(termo) || cidadeJson.includes(termo);
        if (!matchLocal) return false;
      }

      if (filterArea !== 'all' && s.area !== filterArea) return false;
      if (filterInterviewer !== 'all' && s.interviewer_name !== filterInterviewer) return false;
      return true;
    });
  }, [surveys, filterRodada, filterEstado, filterBairro, filterArea, filterInterviewer]);

  const interviewers = useMemo(() => getUniqueInterviewers(surveys), [surveys]);
  const progressPct = surveys.length > 0 ? Math.min((surveys.length / META_ENTREVISTAS) * 100, 100) : 0;
  const hasActiveFilters = filterRodada !== 'all' || filterEstado !== 'all' || (filterBairro && filterBairro.trim() !== '') || filterArea !== 'all' || filterInterviewer !== 'all';

  const clearFilters = () => {
    setFilterRodada('all');
    setFilterEstado('all');
    setFilterBairro('');
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
      setDeleteError('');
      await loadSurveys();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir pesquisa');
    } finally {
      setDeleting(false);
    }
  };

  const localidadesDisponiveis = useMemo(() => {
    const lista = surveys
      .filter((s) => filterEstado === 'all' || s.estado === filterEstado)
      .map((s): unknown => s.cidade || s.respostas_json?.cidade || s.bairro)
      .filter((loc): loc is string => typeof loc === 'string' && loc.trim() !== '');
    return Array.from(new Set(lista)).sort();
  }, [surveys, filterEstado]);

  // Analytics e relatórios alimentados pelas propriedades desestruturadas do JSONB
  const bairroData = useMemo(() => toPercentages(countOccurrences(filtered, 'cidade')), [filtered]);
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
  const segundoTurnoData = useMemo(() => toPercentages(countOccurrences(filtered, 'segundo_turno')), [filtered]);
  const influenciaData = useMemo(() => toPercentages(countOccurrences(filtered, 'influencia_apoio')), [filtered]);
  const pesoData = useMemo(() => toPercentages(countOccurrences(filtered, 'peso_escolha')), [filtered]);

  const interviewerStats = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((s) => map.set(s.interviewer_name, (map.get(s.interviewer_name) || 0) + 1));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filtered]);

  const rodadasFormatadas = useMemo(() => {
    return rodadasList.map((r) => ({ id: r.id, nome: r.name, turno: r.turn, ativa: true }));
  }, [rodadasList]);

  const rodadasParaConfiguracao = useMemo(() => {
    return rodadasList.map((r) => ({ id: r.id, name: r.name, turn: r.turn }));
  }, [rodadasList]);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: PieChart },
    { id: 'opiniao', label: 'Opinião', icon: TrendingUp },
    { id: 'candidatos', label: 'Candidatos', icon: Vote },
    { id: 'comparativo', label: 'Comparativo / Cruzamento', icon: GitCompare },
    { id: 'gestao', label: 'Entrevistas', icon: Layers },
    { id: 'relatorio', label: 'Relatório Individual', icon: Award },
    ...(isMaster
      ? [
          { id: 'frentes_campo', label: 'Frentes de Campo', icon: Globe },
          { id: 'mapa_calor', label: 'Mapa de Coleta', icon: MapPin },
          { id: 'entrevistadores', label: 'Gerenciar Equipe', icon: UserCog },
          { id: 'acessos', label: 'Controle de Acessos', icon: Shield },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
                <p className="text-gray-400 text-xs">Abrangência Nacional (Multi-Estado) · Olá, {adminName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isMaster && (
                <button
                  onClick={() => { setConfigEmEdicao(null); setIsSurveySetupOpen(true); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Configurar Campo</span>
                </button>
              )}
              <button onClick={() => exportToCSV(filtered)} className="btn-secondary text-sm flex items-center gap-1.5 !py-2">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar CSV</span>
              </button>
              <button onClick={() => window.print()} className="btn-secondary text-sm flex items-center gap-1.5 !py-2">
                <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimir</span>
              </button>
              <button onClick={onLogout} className="btn-secondary text-sm !py-2">Sair</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{progressPct.toFixed(1)}% da meta alcançada</p>
          </div>
          <KpiCard icon={Users} label="Entrevistadores" value={interviewers.length} color="emerald" />
          <KpiCard icon={MapPin} label="Cidades Cobertas" value={bairroData.length} color="amber" />
        </div>

        <AdminFilters
          filterRodada={filterRodada}
          setFilterRodada={setFilterRodada}
          filterEstado={filterEstado}
          setFilterEstado={setFilterEstado}
          filterBairro={filterBairro}
          setFilterBairro={setFilterBairro}
          filterArea={filterArea}
          setFilterArea={setFilterArea}
          filterInterviewer={filterInterviewer}
          setFilterInterviewer={setFilterInterviewer}
          rodadas={rodadasFormatadas}
          interviewers={interviewers}
          localidadesDisponiveis={localidadesDisponiveis}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          onOpenNovaRodadaModal={() => { setRodadaParaEditarId(null); setIsModalNovaRodadaOpen(true); }}
          onOpenEditarRodadaModal={(id) => { setRodadaParaEditarId(id); setIsModalNovaRodadaOpen(true); }}
          configsList={configsList}
          onSelectFrenteCampo={(id) => {
            const cfg = configsList.find((c) => c.id === id);
            if (cfg) {
              setFilterRodada(cfg.rodadaId);
              setFilterEstado(cfg.estado);
              setFilterBairro(cfg.cidade);
            }
          }}
        />

        {error && <div className="card p-4 mb-6 border-red-200 bg-red-50"><p className="text-sm text-red-600">{error}</p></div>}

        <div className="flex gap-1 mb-6 border-b border-gray-200 no-print overflow-x-auto sticky top-16 bg-gray-50 z-20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
        ) : filtered.length === 0 && activeTab !== 'entrevistadores' && activeTab !== 'acessos' && activeTab !== 'frentes_campo' && activeTab !== 'mapa_calor' ? (
          <div className="card p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma entrevista encontrada com os filtros selecionados</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab surveys={filtered} bairroData={bairroData} areaData={areaData} sexoData={sexoData} faixaData={faixaData} escolaridadeData={escolaridadeData} interviewerStats={interviewerStats} selectedState={filterEstado !== 'all' ? filterEstado : undefined} />}
            {activeTab === 'opiniao' && <OpiniaoTab avalPrefData={avalPrefData} avalGovData={avalGovData} problemaData={problemaData} influenciaData={influenciaData} pesoData={pesoData} />}
            {activeTab === 'candidatos' && <CandidatosTab senadoEspData={senadoEspData} senadoEstData={senadoEstData} rejeicaoData={rejeicaoData} depFedData={depFedData} depEstData={depEstData} segundoTurnoData={segundoTurnoData} />}
            {activeTab === 'comparativo' && <ComparisonTab surveys={surveys} />}
            {activeTab === 'gestao' && <SurveysManagementTab filteredSurveys={filtered} onViewDetails={(row) => setDetailRow(row)} onDeleteSurvey={isMaster ? (row) => setDeleteConfirm(row) : () => {}} />}
            {activeTab === 'relatorio' && <IndividualReportTab interviewerStats={interviewerStats} selectedInterviewerReport={selectedInterviewerReport} onSelectInterviewer={(name) => setSelectedInterviewerReport(name)} interviewerReportData={null} onViewDetails={(row) => setDetailRow(row)} />}
            
            {activeTab === 'frentes_campo' && isMaster && (
              <SurveysConfigListTab
                configsList={configsList}
                rodadasList={rodadasList}
                onEditConfig={(cfg) => { setConfigEmEdicao(cfg); setIsSurveySetupOpen(true); }}
                onDeleteConfig={handleDeleteConfig}
                onOpenNewConfig={() => { setConfigEmEdicao(null); setIsSurveySetupOpen(true); }}
              />
            )}

            {activeTab === 'mapa_calor' && isMaster && (
              <Suspense fallback={<div className="card p-12 text-center text-gray-500">Carregando mapa...</div>}>
                <MapaCalorTab surveys={filtered} />
              </Suspense>
            )}

            {activeTab === 'entrevistadores' && isMaster && <InterviewerManagement adminName={adminName} />}
            {activeTab === 'acessos' && isMaster && <AccessControl adminName={adminName} />}
          </>
        )}
      </div>

      {detailRow && <SurveyDetailModal detailRow={detailRow} onClose={() => setDetailRow(null)} />}
      
      <RodadasManagerModal
        isOpen={isModalNovaRodadaOpen}
        onClose={() => { setIsModalNovaRodadaOpen(false); setRodadaParaEditarId(null); }}
        onSaveRodada={handleSalvarRodada}
        rodadaParaEditar={rodadaEmEdicao}
      />

      <SurveySetupModal
        isOpen={isSurveySetupOpen}
        onClose={() => { setIsSurveySetupOpen(false); setConfigEmEdicao(null); }}
        onSave={handleSalvarConfiguracao}
        rodadasDisponiveis={rodadasParaConfiguracao}
        interviewersList={registeredInterviewers.map(({ id, name, code }) => ({ id, name, code: code || undefined }))}
        onSaveRodadaInline={handleSalvarRodada}
        configParaEditar={configEmEdicao}
      />
      
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