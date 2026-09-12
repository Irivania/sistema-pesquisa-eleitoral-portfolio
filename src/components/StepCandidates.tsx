import { Vote, AlertCircle } from 'lucide-react';
import { CANDIDATOS_SENADO } from '@/data/surveyOptions';

interface StepCandidatesProps {
  form: {
    senado_espontanea: string[];
    senado_estimulada: string[];
    rejeicao_senado: string;
  };
  errors: Record<string, string>;
  update: (field: string, value: string) => void;
  toggleArrayItem: (field: 'senado_espontanea' | 'senado_estimulada', item: string, max: number) => void;
}

export default function StepCandidates({ form, errors, update, toggleArrayItem }: StepCandidatesProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Vote className="w-5 h-5 text-blue-600" />
        <h2 className="text-gray-900 font-semibold">Intenções de Voto</h2>
      </div>

      <QuestionBlock number="4" title="Senado — espontânea (Selecione exatamente 2 escolhas)">
        <MultiChoice options={CANDIDATOS_SENADO} selected={form.senado_espontanea || []} onToggle={(item) => toggleArrayItem('senado_espontanea', item, 2)} max={2} />
        {errors.senado_espontanea && <FieldError msg={errors.senado_espontanea} />}
      </QuestionBlock>

      <QuestionBlock number="5" title="Senado — estimulada (Selecione exatamente 2 escolhas)">
        <MultiChoice options={CANDIDATOS_SENADO} selected={form.senado_estimulada || []} onToggle={(item) => toggleArrayItem('senado_estimulada', item, 2)} max={2} />
        {errors.senado_estimulada && <FieldError msg={errors.senado_estimulada} />}
      </QuestionBlock>

      <QuestionBlock number="6" title="Rejeição para o Senado (Única escolha)">
        <div className="flex flex-wrap gap-2">
          {CANDIDATOS_SENADO.map((c) => (
            <Chip key={c} label={c} selected={form.rejeicao_senado === c} onClick={() => update('rejeicao_senado', c)} />
          ))}
        </div>
        {errors.rejeicao_senado && <FieldError msg={errors.rejeicao_senado} />}
      </QuestionBlock>
    </div>
  );
}

function QuestionBlock({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-blue-200 pl-4 py-1">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">{number}</span>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="ml-8">{children}</div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5" /> {msg}
    </p>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${selected ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
      {label}
    </button>
  );
}

function MultiChoice({ options, selected, onToggle, max }: { options: string[]; selected: string[]; onToggle: (item: string) => void; max: number }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const isDisabled = !isSelected && selected.length >= max;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              disabled={isDisabled}
              className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${
                isSelected ? 'bg-blue-600 text-white border-blue-600' : isDisabled ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt} {isSelected && '✓'}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">Selecionados: {selected.length} / {max}</p>
    </>
  );
}