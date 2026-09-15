import { useState, useEffect } from 'react';
import { X, Globe, MapPin, Target, Users, CheckSquare, Plus, Edit2, Check, Save } from 'lucide-react';
import { estadosBrasil } from '@/data/electoralConfigs';

export interface SurveyConfigData {
  id: string;
  rodadaId: string;
  estado: string;
  cidade: string;
  zona: string;
  meta: number;
  metaEntrevistas?: number;
  eleitorado: number;
  eleitoradoLocal?: number;
  margemErro: string;
  cotas: {
    feminino: number;
    masculino: number;
    jovens: number;
    adultos: number;
    idosos: number;
  };
  cotasDemograficas?: {
    feminino: number;
    masculino: number;
    jovens: number;
    adultos: number;
    idosos: number;
  };
  modulos: {
    gestao: boolean;
    candidatos: boolean;
    deputados: boolean;
    problema: boolean;
    segundoTurno: boolean;
    sociodemografico: boolean;
  };
  questionarioModulos?: {
    gestao: boolean;
    candidatos: boolean;
    deputados: boolean;
    problema: boolean;
    segundoTurno: boolean;
    sociodemografico: boolean;
  };
  bairros: string[];
  entrevistadoresEscalados: string[];
}

export interface RodadaOption {
  id: string;
  name: string;
  turn: string;
}

interface InterviewerItem {
  id: string;
  name: string;
  code?: string;
}

interface SurveySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SurveyConfigData) => void;
  rodadasDisponiveis: RodadaOption[];
  interviewersList: InterviewerItem[]; // Lista de entrevistadores cadastrados
  onSaveRodadaInline?: (nome: string, turno: string, idParaEditar?: string) => void;
  configParaEditar?: SurveyConfigData | null;
}

const CIDADES_POR_UF_NACIONAL: Record<string, string[]> = {
  'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'São José dos Campos', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'Santos', 'Jundiaí'],
  'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão', 'Bezerros', 'Gravatá'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas'],
  'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'Petrópolis', 'Volta Redonda'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Lauro de Freitas', 'Jequié', 'Alagoinhas', 'Porto Seguro'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'Passo Fundo'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava'],
  'CE': ['Fortaleza', 'Caucaia', 'Maracanaú', 'Juazeiro do Norte', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade'],
  'SC': ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Jaraguá do Sul', 'Lages'],
  'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba'],
  'ES': ['Vila Velha', 'Serra', 'Cariacica', 'Vitória', 'Guarapari', 'Linhares', 'São Mateus', 'Colatina', 'Viana'],
  'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cajazeiras', 'Cabedelo'],
  'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tefé', 'Maués'],
  'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó'],
  'AL': ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'Penedo', 'São Miguel dos Campos', 'União dos Palmares'],
  'PI': ['Teresina', 'Parnaíba', 'Picos', 'Floriano', 'Barras', 'Ipueiras', 'Campo Maior', 'SR de Piauí'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Sorriso', 'Lucas do Rio Verde'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Sidrolândia', 'Naviraí', 'Nova Andradina'],
  'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Tobias Barreto', 'Simão Dias'],
  'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Jaru'],
  'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins'],
  'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó'],
  'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão'],
  'RR': ['Boa Vista', 'Rainha', 'Caracaraí', 'Rorainópolis', 'Mucajaí'],
  'DF': ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Plano Piloto', 'Águas Claras', 'Gama', 'Recanto das Emas'],
};

export default function SurveySetupModal({
  isOpen,
  onClose,
  onSave,
  rodadasDisponiveis,
  interviewersList,
  onSaveRodadaInline,
  configParaEditar,
}: SurveySetupModalProps) {
  const [rodadaId, setRodadaId] = useState(configParaEditar?.rodadaId || rodadasDisponiveis[0]?.id || '');
  const [estado, setEstado] = useState(configParaEditar?.estado || 'SP');
  const [cidade, setCidade] = useState(configParaEditar?.cidade || '');
  const [customCidade, setCustomCidade] = useState('');
  const [isEditingCidade, setIsEditingCidade] = useState(false);

  const [modoRodada, setModoRodada] = useState<'normal' | 'criar' | 'editar'>('normal');
  const [nomeNovaRodada, setNomeNovaRodada] = useState('');
  const [turnoNovaRodada, setTurnoNovaRodada] = useState('1º Turno');

  const [zona, setZona] = useState(configParaEditar?.zona || 'Ambas (Urbana e Rural)');
  const [meta, setMeta] = useState<number>(configParaEditar?.meta || configParaEditar?.metaEntrevistas || 400);
  const [eleitorado, setEleitorado] = useState<number>(configParaEditar?.eleitorado || configParaEditar?.eleitoradoLocal || 50000);
  const [margemErro, setMargemErro] = useState(configParaEditar?.margemErro || '±5,0% (IC 95%)');

  const [cotas, setCotas] = useState(configParaEditar?.cotas || configParaEditar?.cotasDemograficas || {
    feminino: 52,
    masculino: 48,
    jovens: 20,
    adultos: 60,
    idosos: 20,
  });

  const [modulos, setModulos] = useState(configParaEditar?.modulos || configParaEditar?.questionarioModulos || {
    gestao: true,
    candidatos: true,
    deputados: true,
    problema: true,
    segundoTurno: true,
    sociodemografico: true,
  });

  const [bairros, setBairros] = useState<string[]>(configParaEditar?.bairros || []);
  const [novoBairro, setNovoBairro] = useState('');
  
  // Estado para os entrevistadores escalados nesta frente
  const [entrevistadoresEscalados, setEntrevistadoresEscalados] = useState<string[]>(
    configParaEditar?.entrevistadoresEscalados || []
  );

  const cidadesDoEstado = CIDADES_POR_UF_NACIONAL[estado] || ['Capital', 'Interior'];

  useEffect(() => {
    if (configParaEditar) {
      setRodadaId(configParaEditar.rodadaId);
      setEstado(configParaEditar.estado);
      setCidade(configParaEditar.cidade);
      setZona(configParaEditar.zona);
      setMeta(configParaEditar.meta || configParaEditar.metaEntrevistas || 400);
      setEleitorado(configParaEditar.eleitorado || configParaEditar.eleitoradoLocal || 50000);
      setMargemErro(configParaEditar.margemErro);
      setCotas(configParaEditar.cotas || configParaEditar.cotasDemograficas || { feminino: 52, masculino: 48, jovens: 20, adultos: 60, idosos: 20 });
      setModulos(configParaEditar.modulos || configParaEditar.questionarioModulos || { gestao: true, candidatos: true, deputados: true, problema: true, segundoTurno: true, sociodemografico: true });
      setBairros(configParaEditar.bairros);
      setEntrevistadoresEscalados(configParaEditar.entrevistadoresEscalados || []);
    }
  }, [configParaEditar]);

  if (!isOpen) return null;

  const handleToggleEntrevistador = (name: string) => {
    if (entrevistadoresEscalados.includes(name)) {
      setEntrevistadoresEscalados(entrevistadoresEscalados.filter((item) => item !== name));
    } else {
      setEntrevistadoresEscalados([...entrevistadoresEscalados, name]);
    }
  };

  const handleSalvarRodadaInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovaRodada.trim()) return;

    if (onSaveRodadaInline) {
      if (modoRodada === 'criar') {
        onSaveRodadaInline(nomeNovaRodada.trim().toUpperCase(), turnoNovaRodada);
      } else if (modoRodada === 'editar' && rodadaId) {
        onSaveRodadaInline(nomeNovaRodada.trim().toUpperCase(), turnoNovaRodada, rodadaId);
      }
    }
    setModoRodada('normal');
    setNomeNovaRodada('');
  };

  const handleAddBairro = () => {
    if (novoBairro.trim() && !bairros.includes(novoBairro.trim())) {
      setBairros([...bairros, novoBairro.trim()]);
      setNovoBairro('');
    }
  };

  const handleRemoveBairro = (b: string) => {
    setBairros(bairros.filter((item) => item !== b));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCidade = isEditingCidade && customCidade.trim() ? customCidade.trim() : cidade || cidadesDoEstado[0];
    if (!finalCidade) {
      alert('Informe ou selecione a cidade de realização.');
      return;
    }

    const payload: SurveyConfigData = {
      id: configParaEditar?.id || `config_${Date.now()}`,
      rodadaId,
      estado,
      cidade: finalCidade,
      zona,
      meta: Number(meta),
      metaEntrevistas: Number(meta),
      eleitorado: Number(eleitorado),
      eleitoradoLocal: Number(eleitorado),
      margemErro,
      cotas,
      cotasDemograficas: cotas,
      modulos,
      questionarioModulos: modulos,
      bairros,
      entrevistadoresEscalados,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 my-8 relative max-h-[90vh] overflow-y-auto animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl text-blue-600">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {configParaEditar ? 'Editar Frente de Pesquisa' : 'Criar e Configurar Nova Frente de Pesquisa'}
            </h2>
            <p className="text-sm text-gray-500">Defina praça, rodadas, cotas e escalação de entrevistadores.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gerenciamento de Rodada */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-900 uppercase tracking-wide">Pesquisa / Rodada</label>
              <div className="flex items-center gap-2">
                {modoRodada === 'normal' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setModoRodada('criar');
                        setNomeNovaRodada('');
                        setTurnoNovaRodada('1º Turno');
                      }}
                      className="text-xs text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" /> Criar Rodada
                    </button>
                    {rodadaId && (
                      <button
                        type="button"
                        onClick={() => {
                          const rAtual = rodadasDisponiveis.find((r) => r.id === rodadaId);
                          if (rAtual) {
                            setNomeNovaRodada(rAtual.name);
                            setTurnoNovaRodada(rAtual.turn);
                          }
                          setModoRodada('editar');
                        }}
                        className="text-xs text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-sm"
                      >
                        <Edit2 className="w-3 h-3" /> Editar Rodada
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {modoRodada === 'normal' ? (
              <select
                value={rodadaId}
                onChange={(e) => setRodadaId(e.target.value)}
                className="input-field text-sm font-medium bg-white text-blue-900"
                required
              >
                {rodadasDisponiveis.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.turn})</option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-3 animate-fade-in">
                <p className="text-xs font-semibold text-blue-900">
                  {modoRodada === 'criar' ? '➕ Cadastrar Nova Rodada' : '✏️ Editar Rodada Selecionada'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={nomeNovaRodada}
                    onChange={(e) => setNomeNovaRodada(e.target.value)}
                    placeholder="Nome da Pesquisa / Rodada..."
                    className="input-field text-sm uppercase"
                    required
                    autoFocus
                  />
                  <select
                    value={turnoNovaRodada}
                    onChange={(e) => setTurnoNovaRodada(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="1º Turno">1º Turno</option>
                    <option value="2º Turno">2º Turno</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModoRodada('normal')}
                    className="btn-secondary text-xs !py-1.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSalvarRodadaInline}
                    className="btn-primary text-xs !py-1.5 flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" /> Salvar Rodada
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Estado (UF) *</label>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setCidade('');
                setIsEditingCidade(false);
              }}
              className="input-field text-sm font-medium bg-indigo-50/40 text-indigo-900"
              required
            >
              {estadosBrasil.map((est) => (
                <option key={est.sigla} value={est.sigla}>{est.nome} ({est.sigla})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Cidade de Realização *
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingCidade(!isEditingCidade)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {isEditingCidade ? 'Selecionar da Lista' : '+ Digitar Outra Cidade'}
                </button>
              </div>

              {!isEditingCidade ? (
                <select
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="input-field text-sm font-medium"
                  required
                >
                  <option value="">Selecione a cidade...</option>
                  {cidadesDoEstado.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCidade}
                    onChange={(e) => setCustomCidade(e.target.value)}
                    placeholder="Digite o nome da cidade..."
                    className="input-field text-sm flex-1"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCidade.trim()) {
                        setCidade(customCidade.trim());
                        setIsEditingCidade(false);
                      }
                    }}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                    title="Confirmar cidade"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Zona de Coleta</label>
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="input-field text-sm"
              >
                <option value="Ambas (Urbana e Rural)">Ambas (Urbana e Rural)</option>
                <option value="Apenas Urbana">Apenas Urbana</option>
                <option value="Apenas Rural">Apenas Rural</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-600" /> Meta de Entrevistados (N)
              </label>
              <input
                type="number"
                min="1"
                value={meta}
                onChange={(e) => setMeta(Number(e.target.value))}
                className="input-field bg-white text-sm font-bold text-blue-900"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> Eleitorado Local (Aptos TSE)
              </label>
              <input
                type="number"
                min="100"
                value={eleitorado}
                onChange={(e) => setEleitorado(Number(e.target.value))}
                className="input-field bg-white text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Margem de Erro Estimada</label>
              <input
                type="text"
                value={margemErro}
                onChange={(e) => setMargemErro(e.target.value)}
                className="input-field bg-white text-sm"
                placeholder="Ex: ±3,0%"
              />
            </div>
          </div>

          {/* Seção de Escalação de Entrevistadores Cadastrados */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" /> Escalar Entrevistadores para esta Frente
            </h3>
            <p className="text-xs text-gray-500">Selecione quais operadores cadastrados poderão coletar dados nesta praça:</p>
            
            {interviewersList.length === 0 ? (
              <p className="text-xs text-amber-600 italic">Nenhum entrevistador cadastrado no sistema. Cadastre na aba "Gerenciar Equipe".</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded-lg border border-emerald-200">
                {interviewersList.map((intv) => {
                  const nomeIntv = typeof intv === 'string' ? intv : intv.name;
                  const isChecked = entrevistadoresEscalados.includes(nomeIntv);
                  return (
                    <label key={typeof intv === 'string' ? intv : intv.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEntrevistador(nomeIntv)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                      />
                      <span className="font-medium text-gray-800">{nomeIntv}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" /> Sistema de Cotas Demográficas da Amostra (%)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] text-gray-600 font-medium mb-1 block">% Feminino</label>
                <input
                  type="number"
                  value={cotas.feminino}
                  onChange={(e) => setCotas({ ...cotas, feminino: Number(e.target.value) })}
                  className="input-field bg-white text-sm text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 font-medium mb-1 block">% Masculino</label>
                <input
                  type="number"
                  value={cotas.masculino}
                  onChange={(e) => setCotas({ ...cotas, masculino: Number(e.target.value) })}
                  className="input-field bg-white text-sm text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 font-medium mb-1 block">% Jovens (16-24)</label>
                <input
                  type="number"
                  value={cotas.jovens}
                  onChange={(e) => setCotas({ ...cotas, jovens: Number(e.target.value) })}
                  className="input-field bg-white text-sm text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 font-medium mb-1 block">% Adultos (25-59)</label>
                <input
                  type="number"
                  value={cotas.adultos}
                  onChange={(e) => setCotas({ ...cotas, adultos: Number(e.target.value) })}
                  className="input-field bg-white text-sm text-center"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 font-medium mb-1 block">% Idosos (60+)</label>
                <input
                  type="number"
                  value={cotas.idosos}
                  onChange={(e) => setCotas({ ...cotas, idosos: Number(e.target.value) })}
                  className="input-field bg-white text-sm text-center"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" /> Módulos de Perguntas Aplicados nesta Frente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modulos.gestao}
                  onChange={(e) => setModulos({ ...modulos, gestao: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-gray-700 font-medium">Avaliação de Gestão (Prefeito/Governador)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modulos.candidatos}
                  onChange={(e) => setModulos({ ...modulos, candidatos: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-gray-700 font-medium">Intenção de Voto para Senado (Espontânea/Estimulada)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modulos.deputados}
                  onChange={(e) => setModulos({ ...modulos, deputados: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-gray-700 font-medium">Intenção para Deputados (Federal e Estadual)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modulos.problema}
                  onChange={(e) => setModulos({ ...modulos, problema: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-gray-700 font-medium">Problema Principal do Município / Estado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modulos.segundoTurno}
                  onChange={(e) => setModulos({ ...modulos, segundoTurno: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-gray-700 font-medium">Simulação de 2º Turno (Confronto Direto)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modulos.sociodemografico}
                  onChange={(e) => setModulos({ ...modulos, sociodemografico: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-gray-700 font-medium">Bloco Sociodemográfico Completo</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">
              Bairros / Localidades Abrangidas (Opcional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={novoBairro}
                onChange={(e) => setNovoBairro(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBairro())}
                placeholder="Digite o nome do bairro e clique em Adicionar..."
                className="input-field text-sm flex-1"
              />
              <button
                type="button"
                onClick={handleAddBairro}
                className="btn-secondary text-sm !py-2 bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                + Adicionar
              </button>
            </div>
            {bairros.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {bairros.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-medium shadow-sm"
                  >
                    {b}
                    <button
                      type="button"
                      onClick={() => handleRemoveBairro(b)}
                      className="text-gray-400 hover:text-red-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Cancelar
            </button>
            <button type="submit" className="btn-primary text-sm">
              {configParaEditar ? 'Salvar Configuração' : 'Criar Frente de Pesquisa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}