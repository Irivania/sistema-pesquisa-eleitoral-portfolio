import { MapPin, Users, Edit3, Trash2, Layers, Globe, CheckCircle2, PieChart } from 'lucide-react';
import type { SurveyConfigData } from '@/components/SurveySetupModal';

interface SurveysConfigListTabProps {
  configsList: SurveyConfigData[];
  rodadasList: Array<{ id: string; name: string; turn: string }>;
  onEditConfig: (config: SurveyConfigData) => void;
  onDeleteConfig: (id: string) => void;
  onOpenNewConfig: () => void;
}

export default function SurveysConfigListTab({
  configsList,
  rodadasList,
  onEditConfig,
  onDeleteConfig,
  onOpenNewConfig,
}: SurveysConfigListTabProps) {
  const getRodadaNome = (rodadaId: string) => {
    const r = rodadasList.find((item) => item.id === rodadaId);
    return r ? `${r.name} (${r.turn})` : 'Rodada Geral';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Configurações e Frentes de Pesquisa</h2>
          <p className="text-xs text-gray-500">Gerencie cidades, metas, cotas demográficas, questionários e equipes em campo.</p>
        </div>
        <button
          onClick={onOpenNewConfig}
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-sm flex items-center gap-1.5"
        >
          <Layers className="w-4 h-4" /> Nova Configuração de Campo
        </button>
      </div>

      {configsList.length === 0 ? (
        <div className="card p-12 text-center">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma frente de pesquisa configurada ainda.</p>
          <p className="text-xs text-gray-400 mt-1">Clique no botão acima para definir metas, cotas e questionários.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configsList.map((cfg) => {
            const modulosAtivosCount = Object.values(cfg.questionarioModulos || {}).filter(Boolean).length;
            const metaEntrevistas = cfg.metaEntrevistas ?? cfg.meta ?? 0;
            const margemErro = metaEntrevistas > 0 ? (100 / Math.sqrt(metaEntrevistas)).toFixed(1) : '0';
            const cotas = cfg.cotasDemograficas || cfg.cotas || { feminino: 52, masculino: 48, jovens: 20, adultos: 60, idosos: 20 };

            return (
              <div
                key={cfg.id}
                role="button"
                tabIndex={0}
                onClick={() => onEditConfig(cfg)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onEditConfig(cfg);
                  }
                }}
                className="card p-5 relative border border-gray-200 hover:shadow-md hover:border-blue-300 transition-shadow cursor-pointer"
                title="Clique para abrir e editar esta frente de pesquisa"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-wide">
                      {getRodadaNome(cfg.rodadaId)}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" /> {cfg.cidade} - {cfg.estado}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditConfig(cfg);
                      }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar configuração"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteConfig(cfg.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir configuração"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid de Metas, Eleitorado e Margem de Erro */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl mb-3 text-center border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Meta (N)</span>
                    <span className="text-sm font-bold text-gray-900">{metaEntrevistas}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Eleitorado</span>
                    <span className="text-sm font-bold text-blue-900">{(cfg.eleitoradoLocal || 0).toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Margem</span>
                    <span className="text-sm font-bold text-emerald-800">± {margemErro}%</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Zona de Coleta:</span>
                    <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-medium">
                      {cfg.zona === 'ambas' ? 'Urbana e Rural' : `Zona ${cfg.zona}`}
                    </span>
                  </div>

                  {/* Resumo de Cotas Demográficas */}
                  <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1">
                      <PieChart className="w-3.5 h-3.5 text-emerald-600" /> Cotas (Gen / Idade):
                    </span>
                    <span className="font-medium text-emerald-800 text-[11px]">
                      ♀ {cotas.feminino}% / ♂ {cotas.masculino}% · Jv {cotas.jovens}% / Ad {cotas.adultos}% / Id {cotas.idosos}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Módulos do Questionário:
                    </span>
                    <span className="font-medium text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                      {modulosAtivosCount} blocos ativos
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700 block mb-1">Bairros ({cfg.bairros.length}):</span>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {cfg.bairros.length === 0 ? (
                        <span className="italic text-gray-400">Pesquisa geral na cidade</span>
                      ) : (
                        cfg.bairros.map((b) => (
                          <span key={b} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                            {b}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" /> Equipe Escalada:
                    </span>
                    <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      {(cfg.entrevistadoresEscalados || []).length} entrevistador(es)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}