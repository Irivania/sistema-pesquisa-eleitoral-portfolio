import { MapPin, AlertCircle } from 'lucide-react';
import {
  CIDADES_SP, SEXOS, FAIXAS_ETARIAS, ESCOLARIDADES, AREAS, RODADAS_PESQUISA, RodadaId,
} from '@/data/surveyOptions';

const CIDADES_COMUNS = ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco'];

interface StepClassificationProps {
  form: {
    rodada?: RodadaId;
    cidade: string;
    sexo: string;
    faixa_etaria: string;
    escolaridade: string;
    area: string;
  };
  errors: Record<string, string>;
  update: (field: string, value: string | RodadaId) => void;
}

export default function StepClassification({ form, errors, update }: StepClassificationProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="text-gray-900 font-semibold">Localidade e Rodada da Pesquisa (São Paulo)</h2>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <label className="block text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1.5">
          Rodada Atual *
        </label>
        <select
          value={form.rodada || 'p1_1t'}
          onChange={(e) => update('rodada', e.target.value as RodadaId)}
          className="input-field bg-white text-sm font-medium border-blue-300"
        >
          {RODADAS_PESQUISA.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {errors.rodada && <FieldError msg={errors.rodada} />}
      </div>

      <div>
        <label className="label-text">Cidade / Município atual *</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {CIDADES_COMUNS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => update('cidade', c)}
              className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                form.cidade === c
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏙️ {c}
            </button>
          ))}
        </div>

        <select
          value={form.cidade}
          onChange={(e) => update('cidade', e.target.value)}
          className="input-field"
        >
          <option value="">Ou selecione na lista completa de cidades...</option>
          {CIDADES_SP.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.cidade && <FieldError msg={errors.cidade} />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        <div>
          <label className="label-text">Sexo / Gênero *</label>
          <div className="flex flex-wrap gap-2">
            {SEXOS.map((s) => (
              <Chip key={s} label={s} selected={form.sexo === s} onClick={() => update('sexo', s)} />
            ))}
          </div>
          {errors.sexo && <FieldError msg={errors.sexo} />}
        </div>

        <div>
          <label className="label-text">Faixa Etária *</label>
          <div className="flex flex-wrap gap-2">
            {FAIXAS_ETARIAS.map((f) => (
              <Chip key={f} label={f} selected={form.faixa_etaria === f} onClick={() => update('faixa_etaria', f)} />
            ))}
          </div>
          {errors.faixa_etaria && <FieldError msg={errors.faixa_etaria} />}
        </div>
      </div>

      <div>
        <label className="label-text">Escolaridade *</label>
        <div className="flex flex-wrap gap-2">
          {ESCOLARIDADES.map((e) => (
            <Chip key={e} label={e} selected={form.escolaridade === e} onClick={() => update('escolaridade', e)} />
          ))}
        </div>
        {errors.escolaridade && <FieldError msg={errors.escolaridade} />}
      </div>

      <div>
        <label className="label-text">Área *</label>
        <div className="flex gap-3">
          {AREAS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => update('area', a)}
              className={`px-6 py-2.5 rounded-lg font-medium border-2 transition-all duration-150 ${
                form.area === a ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        {errors.area && <FieldError msg={errors.area} />}
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5" /> {msg}
    </p>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${
        selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}