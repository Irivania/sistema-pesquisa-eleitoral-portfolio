import { useState } from 'react';
import {
  Check, ChevronRight, ChevronLeft, Save, CheckCircle2,
  AlertCircle, RotateCcw, MapPin, Vote, TrendingUp, Newspaper,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SurveyData } from '@/types/survey';
import { RodadaId } from '@/data/surveyOptions';
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
  bairro: '',
  sexo: '',
  faixa_etaria: '',
  escolaridade: '',
  area: '',
  aval_prefeta: '',
  aval_governadora: '',
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

  const update = (field: string, value: string | string[] | RodadaId | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  // Validação flexível e segura por etapa
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!form.rodada) newErrors.rodada = 'Selecione a rodada';
      if (!form.bairro) newErrors.bairro = 'Selecione o bairro';
      if (!form.sexo) newErrors.sexo = 'Selecione o sexo';
      if (!form.faixa_etaria) newErrors.faixa_etaria = 'Selecione a faixa etária';
      if (!form.escolaridade) newErrors.escolaridade = 'Selecione a escolaridade';
      if (!form.area) newErrors.area = 'Selecione a área';
    } else if (step === 1) {
      if (!form.aval_prefeta) newErrors.aval_prefeta = 'Informe a avaliação da prefeita';
      if (!form.aval_governadora) newErrors.aval_governadora = 'Informe a avaliação da governadora';
      if (!form.problema_principal) newErrors.problema_principal = 'Informe o problema principal';
    } else if (step === 2) {
      // Etapa 3 (índice 2): Candidatos - Mantida flexível para permitir avanço sem travar seleções opcionais
      // Caso queira exigir algum campo específico aqui no futuro, basta adicionar a regra abaixo.
    } else if (step === 3) {
      if (!form.influencia_apoio) newErrors.influencia_apoio = 'Responda sobre a influência';
      if (!form.peso_escolha) newErrors.peso_escolha = 'Responda sobre o peso da escolha';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { 
    if (validateStep()) {
      setErrors({});
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); 
    }
  };

  const prevStep = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSave = async () => {
    if (!validateStep()) return;

    setSaving(true);
    setErrors({});
    try {
      const payload = { ...form, interviewer_name: interviewerName };
      const { error } = await supabase.from('surveys').insert([payload]);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm((prev) => ({ ...emptyForm, bairro: prev.bairro, rodada: prev.rodada }));
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

  return (
    <div className="max-w-3xl mx-auto">
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
          <p className="text-gray-500">Preparando para a próxima entrevista...</p>
        </div>
      ) : (
        <div className="card p-6 sm:p-8 animate-fade-in">
          {step === 0 && <StepClassification form={form} errors={errors} update={update} />}
          {step === 1 && <StepOpinion form={form} update={update} />}
          {step === 2 && <StepCandidates form={form} update={update} toggleArrayItem={toggleArrayItem} />}
          {step === 3 && <StepProfile form={form} update={update} />}

          {errors.submit && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errors.submit}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <div>{step > 0 && <button type="button" onClick={prevStep} className="btn-secondary flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" /> Voltar</button>}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 mr-2">Etapa {step + 1} de {TOTAL_STEPS}</span>
              {step < TOTAL_STEPS - 1 ? (
                <button type="button" onClick={nextStep} className="btn-primary flex items-center gap-1.5">Avançar <ChevronRight className="w-4 h-4" /></button>
              ) : (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setForm(emptyForm); setStep(0); setErrors({}); }} className="btn-secondary flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> Limpar</button>
                  <button type="button" onClick={handleSave} disabled={saving} className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
                    {saving ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Questionário</>}
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