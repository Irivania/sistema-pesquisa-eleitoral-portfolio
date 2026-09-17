import { useState, useEffect } from 'react';
import {
  Check, ChevronRight, ChevronLeft, Save, CheckCircle2,
  AlertCircle, RotateCcw, MapPin, Vote, TrendingUp, Newspaper,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SurveyData } from '@/types/survey';
import { RodadaId } from '@/data/surveyOptions';
import { electoralConfigs, estadosBrasil } from '@/data/electoralConfigs';
import StepClassification from './StepClassification';
import StepOpinion from './StepOpinion';
import StepCandidates from './StepCandidates';
import StepProfile from './StepProfile';

interface SurveyFormProps {
  interviewerName: string;
  onSaved: () => void;
}

const TOTAL_STEPS = 4;

const emptyForm: Omit<SurveyData, 'interviewer_name'> = {
  rodada: 'p1_1t',
  estado: 'SP', // Estado padrão inicial
  cidade: '', // Cidade será preenchida conforme o estado
  sexo: '',
  faixa_etaria: '',
  escolaridade: '',
  area: '',
  aval_prefeta: '',
  aval_governadora: '',
  presidente: '',
  governador: '',
  prefeito: '',
  problema_principal: '',
  problema_principal_outro: '',
  senado_espontanea: [],
  senado_estimulada: [],
  rejeicao_senado: '',
  dep_federal: '',
  dep_estadual: '',
  influencia_apoio: '',
  peso_escolha: '',
  peso_escolha_outro: '',
  veiculo_comunicacao: '',
};

export default function SurveyForm({ interviewerName, onSaved }: SurveyFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [frentesPermitidas, setFrentesPermitidas] = useState<Record<string, unknown>[]>([]);
  const [loadingFrentes, setLoadingFrentes] = useState(true);

  // Busca as frentes em que este entrevistador foi escalado
  useEffect(() => {
    async function carregarFrentes() {
      try {
        const { data, error } = await supabase.from('survey_configs').select('*');
        
        if (error) {
          console.warn('Tabela survey_configs não encontrada ou vazia, usando fallback padrão.');
        }

        const frentes = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];

        const minhasFrentes = frentes.filter((cfg) => {
          const entrevistadores = cfg.interviewers || cfg.entrevistadoresEscalados || cfg.team;
          if (Array.isArray(entrevistadores)) {
            return entrevistadores.some((item: unknown) => {
              const nome = typeof item === 'string'
                ? item
                : typeof item === 'object' && item !== null && 'name' in item && typeof item.name === 'string'
                  ? item.name
                  : undefined;

              return nome?.toLowerCase() === interviewerName.toLowerCase();
            });
          }
          return false;
        });

        if (minhasFrentes.length > 0) {
          setFrentesPermitidas(minhasFrentes);
          const primeiraFrente = minhasFrentes[0];
          const est = (primeiraFrente.estado as string) || 'SP';
          const cid = (primeiraFrente.cidade as string) || '';
          
          setForm((prev) => ({
            ...prev,
            estado: est,
            cidade: cid,
            rodada: (primeiraFrente.rodada as RodadaId) || prev.rodada,
          }));
        } else {
          // Fallback padrão caso não esteja vinculado estritamente a uma frente na tabela
          setFrentesPermitidas([{
            cidade: 'São Paulo',
            estado: 'SP',
            rodada: 'p1_1t'
          }]);
          setForm((prev) => ({ ...prev, estado: 'SP', cidade: 'São Paulo' }));
        }
      } catch (err) {
        console.error('Erro ao carregar frentes:', err);
      } finally {
        setLoadingFrentes(false);
      }
    }

    carregarFrentes();
  }, [interviewerName]);

  // Configuração eleitoral dinâmica baseada no estado selecionado
  const currentConfig = electoralConfigs[form.estado || 'SP'] || electoralConfigs['SP'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (field: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Se o estado mudar, redefine a cidade para a primeira disponível do novo estado
      if (field === 'estado') {
        const novaConfig = electoralConfigs[value];
        const primeiroMunicipio = novaConfig ? Object.keys(novaConfig.municipios)[0] || '' : '';
        next.cidade = primeiroMunicipio;
      }

      return next;
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleArrayItem = (field: 'senado_espontanea' | 'senado_estimulada', item: string, max: number) => {
    setForm((prev) => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((c) => c !== item) };
      }
      if (current.length >= max) return prev;
      return { ...prev, [field]: [...current, item] };
    });
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!form.rodada) newErrors.rodada = 'Selecione a rodada';
      if (!form.estado) newErrors.estado = 'Selecione o estado';
      if (!form.cidade) newErrors.cidade = 'Selecione a cidade';
      if (!form.sexo) newErrors.sexo = 'Selecione o sexo';
      if (!form.faixa_etaria) newErrors.faixa_etaria = 'Selecione a faixa etária';
      if (!form.escolaridade) newErrors.escolaridade = 'Selecione a escolaridade';
      if (!form.area) newErrors.area = 'Selecione a área';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const obterGeolocalizacao = (): Promise<{ latitude: number | null; longitude: number | null }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Aviso de GPS:', error.message);
          resolve({ latitude: null, longitude: null });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      const { latitude, longitude } = await obterGeolocalizacao();

      const { rodada, estado, cidade, ...perguntasDoQuestionario } = form;

      const payload = {
        rodada,
        estado,
        cidade,
        interviewer_name: interviewerName,
        latitude,
        longitude,
        respostas_json: perguntasDoQuestionario,
      };

      const { error } = await supabase.from('surveys').insert([payload]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm((prev) => ({ ...emptyForm, estado: prev.estado, cidade: prev.cidade, rodada: prev.rodada })); 
        setStep(0);
        onSaved();
      }, 2000);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Erro ao salvar.' });
    } finally {
      setSaving(false);
    }
  };

  const stepIcons = [MapPin, Vote, TrendingUp, Newspaper];
  const stepLabels = ['Classificação', 'Opinião', 'Candidatos', 'Perfil'];

  if (loadingFrentes) {
    return (
      <div className="card p-8 text-center">
        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Carregando permissões de praça...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Exibição da praça ativa / Seletor dinâmico de Estado e Cidade */}
      {frentesPermitidas.length > 1 ? (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-800 uppercase block">Múltiplas Frentes Vinculadas</span>
            <p className="text-sm text-gray-700">Escolha em qual praça deseja registrar a entrevista:</p>
          </div>
          <select
            value={form.cidade}
            onChange={(e) => {
              const selecionada = frentesPermitidas.find((f) => f.cidade === e.target.value);
              if (selecionada) {
                const est = (selecionada.estado as string) || 'SP';
                setForm((prev) => ({
                  ...prev,
                  cidade: (selecionada.cidade as string) || '',
                  estado: est,
                  rodada: (selecionada.rodada as RodadaId) || prev.rodada,
                }));
              }
            }}
            className="input-field text-sm font-semibold text-blue-900 bg-white py-1"
          >
            {frentesPermitidas.map((frente, idx) => (
              <option key={idx} value={frente.cidade as string}>
                {(frente.cidade as string)} — {(frente.estado as string)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase block">Frente de Coleta Ativa ({currentConfig.nomeEstado})</span>
            <p className="text-sm font-bold text-gray-800">
              {form.cidade ? `${form.cidade} — ${form.estado}` : `${currentConfig.nomeEstado}`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Operador</span>
            <span className="text-sm font-semibold text-blue-600">{interviewerName}</span>
          </div>
        </div>
      )}

      {/* Stepper Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, i) => {
            const Icon = stepIcons[i];
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : isComplete ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-blue-600' : isComplete ? 'text-emerald-600' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {success ? (
        <div className="card p-12 text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Questionário Salvo!</h2>
          <p className="text-gray-500">Salvando dados geolocalizados para {currentConfig.nomeEstado}...</p>
        </div>
      ) : (
        <div className="card p-6 sm:p-8 animate-fade-in">
          {/* Repassando o config e os estados disponíveis para os componentes filhos */}
          {step === 0 && (
            <StepClassification 
              form={form} 
              errors={errors} 
              update={update} 
              config={currentConfig} 
              estadosBrasil={estadosBrasil} 
            />
          )}
          {step === 1 && <StepOpinion form={form} errors={errors} update={update} config={currentConfig} />}
          {step === 2 && <StepCandidates form={form} update={update} toggleArrayItem={toggleArrayItem} config={currentConfig} />}
          {step === 3 && <StepProfile form={form} errors={errors} update={update} config={currentConfig} />}

          {errors.submit && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errors.submit}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <div>{step > 0 && <button type="button" onClick={prevStep} className="btn-secondary flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" /> Voltar</button>}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 mr-2">Etapa {step + 1} de {TOTAL_STEPS} ({currentConfig.nomeEstado})</span>
              {step < TOTAL_STEPS - 1 ? (
                <button type="button" onClick={nextStep} className="btn-primary flex items-center gap-1.5">Avançar <ChevronRight className="w-4 h-4" /></button>
              ) : (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setForm({ ...emptyForm, estado: form.estado, cidade: form.cidade }); setStep(0); setErrors({}); }} className="btn-secondary flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> Limpar</button>
                  <button type="button" onClick={handleSave} disabled={saving} className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
                    {saving ? 'Salvando com GPS...' : <><Save className="w-4 h-4" /> Salvar Questionário</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}