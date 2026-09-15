import { Filter, X, MapPin, Globe, Plus } from 'lucide-react';
import type { SurveyConfigData } from '@/components/SurveySetupModal';

interface RodadaItem {
  id: string;
  nome: string;
  turno: string;
  ativa: boolean;
}

interface AdminFiltersProps {
  filterRodada: string;
  setFilterRodada: (val: string) => void;
  filterEstado: string;
  setFilterEstado: (val: string) => void;
  filterBairro: string;
  setFilterBairro: (val: string) => void;
  filterArea: string;
  setFilterArea: (val: string) => void;
  filterInterviewer: string;
  setFilterInterviewer: (val: string) => void;
  rodadas: RodadaItem[];
  interviewers: string[];
  localidadesDisponiveis?: string[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  onOpenNovaRodadaModal: () => void;
  onOpenEditarRodadaModal: (rodadaId: string) => void;
  configsList?: SurveyConfigData[];
  onSelectFrenteCampo?: (configId: string) => void;
}

export default function AdminFilters({
  setFilterRodada,
  setFilterEstado,
  filterBairro,
  setFilterBairro,
  rodadas,
  hasActiveFilters,
  clearFilters,
  onOpenNovaRodadaModal,
  configsList = [],
  onSelectFrenteCampo,
}: AdminFiltersProps) {
  return (
    <div className="card p-5 mb-6 no-print space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Gerenciamento e Seleção de Frentes de Pesquisa</span>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button 
              onClick={clearFilters} 
              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpar Filtro Ativo
            </button>
          )}
          <button
            onClick={onOpenNovaRodadaModal}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Rodada
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        {/* Bloco de Frentes de Campo Cadastradas (Atalhos Rápidos) */}
        <div className="lg:col-span-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
            <Globe className="w-3.5 h-3.5 text-blue-600" /> Frentes Ativas:
          </div>
          {configsList.length === 0 ? (
            <span className="text-xs text-gray-400 italic">Nenhuma frente configurada. Vá em "Configurar Campo" no topo.</span>
          ) : (
            configsList.map((cfg) => {
              const rodadaObj = rodadas.find((r) => r.id === cfg.rodadaId);
              return (
                <button
                  key={cfg.id}
                  onClick={() => {
                    if (onSelectFrenteCampo) {
                      setFilterRodada(cfg.rodadaId);
                      setFilterEstado(cfg.estado);
                      setFilterBairro(cfg.cidade);
                      onSelectFrenteCampo(cfg.id);
                    }
                  }}
                  className="text-xs bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500 group-hover:text-white" /> 
                  <span>{cfg.cidade} - {cfg.estado}</span>
                  <span className="text-[10px] opacity-75 font-normal">({rodadaObj?.nome || 'Rodada'})</span>
                </button>
              );
            })
          )}
        </div>

        {/* Busca Rápida por Localidade / Cidade */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Busca Rápida de Coleta</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterBairro}
              onChange={(e) => setFilterBairro(e.target.value)}
              placeholder="Filtrar por cidade ou bairro..."
              className="input-field text-sm pl-9 bg-gray-50/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}