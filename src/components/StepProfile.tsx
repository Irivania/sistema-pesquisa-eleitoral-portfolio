import { Newspaper, AlertCircle } from 'lucide-react';
import {
  CANDIDATOS_FEDERAL, CANDIDATOS_ESTADUAL, INFLUENCIA_OPCOES, PESO_ESCOLHA,
} from '@/data/surveyOptions';

const VEICULOS_COMUNICACAO_COMUNS = ['Instagram', 'Rádio', 'Facebook', 'WhatsApp', 'TV', 'Portal de Notícias'];

interface StepProfileProps {
  form: {
    dep_federal: string;
    dep_estadual: string;
    influencia_apoio: string;
    peso_escolha: string;
    peso_escolha_outro?: string;
    veiculo_comunicacao: string;
  };
  errors: Record<string, string>;
  update: (field: string, value: string) => void;
}

export default function StepProfile({ form, errors, update }: StepProfileProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-blue-600" />
        <h2 className="text-gray-900 font-semibold">Deputados e Perfil Político</h2>
      </div>

      <QuestionBlock number="7" title="Deputado Federal (única escolha)">
        <div className="flex flex-wrap gap-2">
          {CANDIDATOS_FEDERAL.map((c) => (
            <Chip key={c} label={c} selected={form.dep_federal === c} onClick={() => update('dep_federal', c)} />
          ))}
        </div>
        {errors.dep_federal && <FieldError msg={errors.dep_federal} />}
      </QuestionBlock>

      <QuestionBlock number="8" title="Deputado Estadual (única escolha)">
        <div className="flex flex-wrap gap-2">
          {CANDIDATOS_ESTADUAL.map((c) => (
            <Chip key={c} label={c} selected={form.dep_estadual === c} onClick={() => update('dep_estadual', c)} />
          ))}
        </div>
        {errors.dep_estadual && <FieldError msg={errors.dep_estadual} />}
      </QuestionBlock>

      <QuestionBlock number="9" title="Influência do apoio da prefeita Lucielle Laurentino">
        <div className="flex flex-wrap gap-2">
          {INFLUENCIA_OPCOES.map((i) => (
            <Chip key={i} label={i} selected={form.influencia_apoio === i} onClick={() => update('influencia_apoio', i)} />
          ))}
        </div>
        {errors.influencia_apoio && <FieldError msg={errors.influencia_apoio} />}
      </QuestionBlock>

      <QuestionBlock number="10" title="O que mais pesa na escolha de um candidato? (espontânea)">
        <div className="flex flex-wrap gap-2">
          {PESO_ESCOLHA.map((p) => (
            <Chip key={p} label={p} selected={form.peso_escolha === p} onClick={() => update('peso_escolha', p)} />
          ))}
        </div>
        {form.peso_escolha === 'Outra' && (
          <input
            type="text"
            value={form.peso_escolha_outro || ''}
            onChange={(e) => update('peso_escolha_outro', e.target.value)}
            placeholder="Especifique..."
            className="input-field mt-3"
          />
        )}
        {errors.peso_escolha && <FieldError msg={errors.peso_escolha} />}
      </QuestionBlock>

      <QuestionBlock number="11" title="Veículo de comunicação em que mais confia (espontânea)">
        <div className="flex flex-wrap gap-2 mb-3">
          {VEICULOS_COMUNICACAO_COMUNS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => update('veiculo_comunicacao', v)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                form.veiculo_comunicacao === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={form.veiculo_comunicacao}
          onChange={(e) => update('veiculo_comunicacao', e.target.value)}
          placeholder="Ou digite outro veículo..."
          className="input-field"
        />
        {errors.veiculo_comunicacao && <FieldError msg={errors.veiculo_comunicacao} />}
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