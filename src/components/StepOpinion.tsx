import { Vote, AlertCircle } from 'lucide-react';
import { AVALIACOES, PROBLEMAS } from '@/data/surveyOptions';

interface StepOpinionProps {
  form: {
    aval_prefeta: string;
    aval_governadora: string;
    problema_principal: string;
    problema_principal_outro?: string;
  };
  errors: Record<string, string>;
  update: (field: string, value: string) => void;
}

export default function StepOpinion({ form, errors, update }: StepOpinionProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Vote className="w-5 h-5 text-blue-600" />
        <h2 className="text-gray-900 font-semibold">Avaliação e Opinião</h2>
      </div>

      <QuestionBlock number="1" title="Avaliação da prefeita Lucielle Laurentino">
        <div className="flex flex-wrap gap-2">
          {AVALIACOES.map((a) => (
            <Chip key={a} label={a} selected={form.aval_prefeta === a} onClick={() => update('aval_prefeta', a)} color={ratingColor(a)} />
          ))}
        </div>
        {errors.aval_prefeta && <FieldError msg={errors.aval_prefeta} />}
      </QuestionBlock>

      <QuestionBlock number="2" title="Avaliação da governadora Raquel Lyra">
        <div className="flex flex-wrap gap-2">
          {AVALIACOES.map((a) => (
            <Chip key={a} label={a} selected={form.aval_governadora === a} onClick={() => update('aval_governadora', a)} color={ratingColor(a)} />
          ))}
        </div>
        {errors.aval_governadora && <FieldError msg={errors.aval_governadora} />}
      </QuestionBlock>

      <QuestionBlock number="3" title="Principal problema de Bezerros (espontânea)">
        <div className="flex flex-wrap gap-2">
          {PROBLEMAS.map((p) => (
            <Chip key={p} label={p} selected={form.problema_principal === p} onClick={() => update('problema_principal', p)} />
          ))}
        </div>
        {form.problema_principal === 'Outra' && (
          <input
            type="text"
            value={form.problema_principal_outro || ''}
            onChange={(e) => update('problema_principal_outro', e.target.value)}
            placeholder="Especifique o problema..."
            className="input-field mt-3"
          />
        )}
        {errors.problema_principal && <FieldError msg={errors.problema_principal} />}
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

function Chip({ label, selected, onClick, color }: { label: string; selected: boolean; onClick: () => void; color?: 'green' | 'red' | 'yellow' }) {
  const colorClasses = {
    green: 'bg-emerald-600 border-emerald-600 text-white',
    red: 'bg-red-600 border-red-600 text-white',
    yellow: 'bg-amber-500 border-amber-500 text-white',
  };
  const c = color && selected ? colorClasses[color] : selected ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50';
  return (
    <button type="button" onClick={onClick} className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${c}`}>
      {label}
    </button>
  );
}

function ratingColor(r: string): 'green' | 'red' | 'yellow' | undefined {
  if (['Ótima', 'Boa'].includes(r)) return 'green';
  if (['Ruim', 'Péssima'].includes(r)) return 'red';
  if (r === 'Regular') return 'yellow';
  return undefined;
}