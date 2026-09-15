import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, LogOut, ChevronRight, User, Clock, AlertCircle,
  Lock, KeyRound, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SurveyForm from '@/components/SurveyForm';

interface InterviewerViewProps {
  name: string;
  onLogout: () => void;
}

interface AppSettings {
  override_active: boolean;
  override_expires_at: string | null;
}

const START_HOUR = 8;
const END_HOUR = 16;

function isWithinAllowedHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= START_HOUR && hour < END_HOUR;
}

function formatCurrentTime(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function InterviewerView({ name, onLogout }: InterviewerViewProps) {
  const [myCount, setMyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [metaEntrevistas, setMetaEntrevistas] = useState(500); // Meta padrão de 500 configurada na cotação
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [overrideActive, setOverrideActive] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatCurrentTime());

  const loadCountsAndMeta = useCallback(async () => {
    try {
      const { count: total } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true });

      const { count: mine } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('interviewer_name', name);

      // Tenta buscar a meta cadastrada nas configurações da rodada/frente
      const { data: configData } = await supabase
        .from('survey_configs')
        .select('*')
        .maybeSingle();

      if (configData && (configData as Record<string, unknown>).meta) {
        setMetaEntrevistas(Number((configData as Record<string, unknown>).meta) || 500);
      }

      setTotalCount(total || 0);
      setMyCount(mine || 0);
    } catch {
      // silently ignore — counts are non-critical UI
    }
  }, [name]);

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('override_active, override_expires_at')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const s = data as unknown as AppSettings;
        if (s.override_active) {
          if (s.override_expires_at) {
            const expiry = new Date(s.override_expires_at).getTime();
            if (Date.now() < expiry) {
              setOverrideActive(true);
            } else {
              setOverrideActive(false);
            }
          } else {
            setOverrideActive(true);
          }
        } else {
          setOverrideActive(false);
        }
      }
    } catch {
      // non-critical — default to no override
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    loadCountsAndMeta();
    loadSettings();
  }, [loadCountsAndMeta, loadSettings]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatCurrentTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSaved = () => {
    loadCountsAndMeta();
  };

  const handleValidateCode = async () => {
    const codigoDigitado = codeValue ? codeValue.trim().toUpperCase() : '';

    if (!codigoDigitado || codigoDigitado === 'UNDEFINED') {
      setCodeError('Digite um código de liberação válido.');
      return;
    }

    setCodeLoading(true);
    setCodeError('');

    try {
      const { data, error } = await supabase
        .from('exception_codes')
        .select('id, used')
        .eq('code', codigoDigitado)
        .eq('used', false)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setCodeError('Código inválido ou já utilizado.');
        return;
      }

      const registro = data as Record<string, unknown>;
      const { error: updateError } = await supabase
        .from('exception_codes')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('id', registro.id);

      if (updateError) throw updateError;

      setOverrideActive(true);
      setShowCodeInput(false);
      setCodeValue('');
    } catch {
      setCodeError('Erro ao validar código. Tente novamente.');
    } finally {
      setCodeLoading(false);
    }
  };

  const withinHours = isWithinAllowedHours();
  const canCollect = withinHours || overrideActive;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-sm sm:text-base leading-tight">
                  Coleta de Dados
                </h1>
                <p className="text-gray-400 text-xs">Bezerros/PE — Setembro 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{name}</span>
              </div>
              <button onClick={onLogout} className="btn-secondary text-sm !py-2 flex items-center gap-1.5">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats bar corrigido para a meta configurada (500) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{myCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Minhas entrevistas</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total geral</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{Math.max(0, metaEntrevistas - totalCount)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Faltam p/ meta ({metaEntrevistas})</p>
          </div>
        </div>

        {/* Mobile name display */}
        <div className="sm:hidden flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg mb-4">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{name}</span>
        </div>

        {/* Time restriction status */}
        {loadingSettings ? (
          <div className="card p-4 mb-6 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Verificando horário de coleta...</span>
          </div>
        ) : !canCollect ? (
          <div className="space-y-4 mb-6">
            <div className="card p-6 border-amber-200 bg-amber-50">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Horário de Coleta Encerrado
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    O horário de coleta externa foi encerrado (das 08h às 16h).
                    Solicite liberação ao administrador.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Horário atual: {currentTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {!showCodeInput ? (
              <button
                onClick={() => setShowCodeInput(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <KeyRound className="w-4 h-4" />
                Tenho um código de liberação
              </button>
            ) : (
              <div className="card p-6 animate-scale-in">
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Código de Liberação</h3>
                  <button
                    onClick={() => { setShowCodeInput(false); setCodeValue(''); setCodeError(''); }}
                    className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Digite o código fornecido pelo administrador para liberar a coleta fora do horário.
                </p>
                <input
                  type="text"
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidateCode()}
                  placeholder="Ex: LIB-ABCD12"
                  className="input-field uppercase tracking-wider font-mono"
                  autoFocus
                />
                {codeError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mt-3 flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {codeError}
                  </div>
                )}
                <button
                  onClick={handleValidateCode}
                  disabled={codeLoading}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                >
                  {codeLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Liberar Acesso
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {overrideActive && !withinHours && (
              <div className="card p-3 mb-4 border-emerald-200 bg-emerald-50 flex items-center gap-2 animate-fade-in">
                <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm text-emerald-700">
                  Coleta liberada por exceção. Você pode preencher questionários agora.
                </span>
              </div>
            )}

            <SurveyForm interviewerName={name} onSaved={handleSaved} />
          </>
        )}

        <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 px-2">
          <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>
            Preencha todos os campos obrigatórios (marcados com *) para salvar o questionário.
            Os dados são enviados automaticamente para o painel do administrador.
          </p>
        </div>
      </div>
    </div>
  );
}