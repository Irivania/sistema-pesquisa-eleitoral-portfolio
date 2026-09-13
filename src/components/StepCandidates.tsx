import { useState, useMemo } from 'react';
import { Vote, Search } from 'lucide-react';
import { 
  CANDIDATOS_SENADO, 
  CANDIDATOS_GOVERNADOR, 
  CANDIDATOS_PRESIDENTE, 
  DEPUTADOS_FEDERAIS_SP, 
  DEPUTADOS_ESTADUAIS_SP 
} from '@/data/surveyOptions';

interface StepCandidatesProps {
  form: {
    presidente: string;
    governador: string;
    senado_espontanea: string[];
    senado_estimulada: string[];
    rejeicao_senado: string;
    dep_federal: string;
    dep_estadual: string;
  };
  update: (field: string, value: string | string[]) => void;
  toggleArrayItem: (field: 'senado_espontanea' | 'senado_estimulada', item: string, max: number) => void;
}

export default function StepCandidates({ form, update, toggleArrayItem }: StepCandidatesProps) {
  // Estados locais para a busca interativa de deputados
  const [searchFed, setSearchFed] = useState('');
  const [searchEst, setSearchEst] = useState('');

  // Filtro inteligente para Deputado Federal (Nome, Número ou Partido)
  const filteredFederais = useMemo(() => {
    const term = searchFed.toLowerCase().trim();
    if (!term) return DEPUTADOS_FEDERAIS_SP.slice(0, 6);
    return DEPUTADOS_FEDERAIS_SP.filter(
      (c) => c.name.toLowerCase().includes(term) || c.number.includes(term) || c.party.toLowerCase().includes(term)
    );
  }, [searchFed]);

  // Filtro inteligente para Deputado Estadual (Nome, Número ou Partido)
  const filteredEstaduais = useMemo(() => {
    const term = searchEst.toLowerCase().trim();
    if (!term) return DEPUTADOS_ESTADUAIS_SP.slice(0, 6);
    return DEPUTADOS_ESTADUAIS_SP.filter(
      (c) => c.name.toLowerCase().includes(term) || c.number.includes(term) || c.party.toLowerCase().includes(term)
    );
  }, [searchEst]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Vote className="w-5 h-5 text-blue-600" />
        <h2 className="text-gray-900 font-semibold">Intenções de Voto - Eleições 2026 (SP)</h2>
      </div>

      {/* Presidente */}
      <QuestionBlock number="1" title="Presidente da República — Estimulada (única escolha)">
        <div className="flex flex-wrap gap-2">
          {CANDIDATOS_PRESIDENTE.map((c) => (
            <Chip key={c} label={c} selected={form.presidente === c} onClick={() => update('presidente', c)} />
          ))}
        </div>
      </QuestionBlock>

      {/* Governador de SP */}
      <QuestionBlock number="2" title="Governador de São Paulo — Estimulada (única escolha)">
        <div className="flex flex-wrap gap-2">
          {CANDIDATOS_GOVERNADOR.map((c) => (
            <Chip key={c} label={c} selected={form.governador === c} onClick={() => update('governador', c)} />
          ))}
        </div>
      </QuestionBlock>

      {/* Senado Espontânea */}
      <QuestionBlock number="3" title="Senado — Espontânea (até 2 escolhas)">
        <MultiChoice options={CANDIDATOS_SENADO} selected={form.senado_espontanea || []} onToggle={(item) => toggleArrayItem('senado_espontanea', item, 2)} max={2} />
      </QuestionBlock>

      {/* Senado Estimulada */}
      <QuestionBlock number="4" title="Senado — Estimulada (até 2 escolhas)">
        <MultiChoice options={CANDIDATOS_SENADO} selected={form.senado_estimulada || []} onToggle={(item) => toggleArrayItem('senado_estimulada', item, 2)} max={2} />
      </QuestionBlock>

      {/* Rejeição Senado */}
      <QuestionBlock number="5" title="Rejeição para o Senado (única escolha)">
        <div className="flex flex-wrap gap-2">
          {CANDIDATOS_SENADO.map((c) => (
            <Chip key={c} label={c} selected={form.rejeicao_senado === c} onClick={() => update('rejeicao_senado', c)} />
          ))}
        </div>
      </QuestionBlock>

      {/* Deputado Federal com Busca Inteligente */}
      <QuestionBlock number="6" title="Deputado Federal (Busque por Nome, Número ou Partido)">
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFed}
              onChange={(e) => setSearchFed(e.target.value)}
              placeholder="Digite o nome, número ou partido..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
            {filteredFederais.map((cand) => {
              const label = `${cand.name} (${cand.party} - ${cand.number})`;
              const isSelected = form.dep_federal === label;
              return (
                <button
                  key={cand.number}
                  type="button"
                  onClick={() => update('dep_federal', label)}
                  className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                    isSelected ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="block font-medium">{cand.name}</span>
                  <span className="opacity-80 font-mono">{cand.party} • {cand.number}</span>
                </button>
              );
            })}
          </div>
          {form.dep_federal && <p className="text-xs text-blue-600 font-medium">Selecionado: {form.dep_federal}</p>}
        </div>
      </QuestionBlock>

      {/* Deputado Estadual com Busca Inteligente */}
      <QuestionBlock number="7" title="Deputado Estadual (Busque por Nome, Número ou Partido)">
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchEst}
              onChange={(e) => setSearchEst(e.target.value)}
              placeholder="Digite o nome, número ou partido..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
            {filteredEstaduais.map((cand) => {
              const label = `${cand.name} (${cand.party} - ${cand.number})`;
              const isSelected = form.dep_estadual === label;
              return (
                <button
                  key={cand.number}
                  type="button"
                  onClick={() => update('dep_estadual', label)}
                  className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                    isSelected ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="block font-medium">{cand.name}</span>
                  <span className="opacity-80 font-mono">{cand.party} • {cand.number}</span>
                </button>
              );
            })}
          </div>
          {form.dep_estadual && <p className="text-xs text-blue-600 font-medium">Selecionado: {form.dep_estadual}</p>}
        </div>
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