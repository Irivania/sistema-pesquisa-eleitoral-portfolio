import { Filter, X } from 'lucide-react';
import { FilterSelect } from '@/components/AdminWidgets';
import { BAIRROS, AREAS } from '@/data/surveyOptions';

interface RodadaItem {
  id: string;
  nome: string;
  turno: string;
  ativa: boolean;
}

interface AdminFiltersProps {
  filterRodada: string;
  setFilterRodada: (val: string) => void;
  filterBairro: string;
  setFilterBairro: (val: string) => void;
  filterArea: string;
  setFilterArea: (val: string) => void;
  filterInterviewer: string;
  setFilterInterviewer: (val: string) => void;
  rodadas: RodadaItem[];
  interviewers: string[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export default function AdminFilters({
  filterRodada,
  setFilterRodada,
  filterBairro,
  setFilterBairro,
  filterArea,
  setFilterArea,
  filterInterviewer,
  setFilterInterviewer,
  rodadas,
  interviewers,
  hasActiveFilters,
  clearFilters,
}: AdminFiltersProps) {
  return (
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
              {rodadas.map((r) => (
                <option key={r.id} value={r.nome}>{r.nome} ({r.turno})</option>
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
  );
}