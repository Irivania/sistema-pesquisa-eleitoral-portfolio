import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, XCircle, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Rodada {
  id: string;
  nome: string;
  turno: string;
  data_inicio: string;
  data_fim: string;
  dias_duracao: number;
  ativa: boolean;
}

export default function RodadasManagementTab() {
  const [rodadas, setRodadas] = useState<Rodada[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [turno, setTurno] = useState('1º Turno');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diasDuracao, setDiasDuracao] = useState<number>(1);
  const [ativa, setAtiva] = useState(true);

  const fetchRodadas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pesquisa_rodadas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRodadas(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRodadas();
  }, []);

  // Calcula automaticamente os dias de duração quando dataInicio ou dataFim mudam
  useEffect(() => {
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio + 'T00:00:00');
      const fim = new Date(dataFim + 'T00:00:00');
      const diffTime = fim.getTime() - inicio.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0) {
        setDiasDuracao(diffDays);
      } else {
        setDiasDuracao(1);
      }
    }
  }, [dataInicio, dataFim]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setNome('');
    setTurno('1º Turno');
    setDataInicio('');
    setDataFim('');
    setDiasDuracao(1);
    setAtiva(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (rodada: Rodada) => {
    setEditingId(rodada.id);
    setNome(rodada.nome);
    setTurno(rodada.turno);
    setDataInicio(rodada.data_inicio);
    setDataFim(rodada.data_fim);
    setDiasDuracao(rodada.dias_duracao);
    setAtiva(rodada.ativa);
    setModalOpen(true);
  };

  const handleSaveRodada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !dataInicio || !dataFim) return;

    const payload = {
      nome,
      turno,
      data_inicio: dataInicio,
      data_fim: dataFim,
      dias_duracao: Number(diasDuracao),
      ativa,
    };

    let error = null;

    if (editingId) {
      // Atualizar rodada existente
      const res = await supabase
        .from('pesquisa_rodadas')
        .update(payload)
        .eq('id', editingId);
      error = res.error;
    } else {
      // Criar nova rodada
      const res = await supabase.from('pesquisa_rodadas').insert([payload]);
      error = res.error;
    }

    if (!error) {
      setModalOpen(false);
      setEditingId(null);
      setNome('');
      setDataInicio('');
      setDataFim('');
      setDiasDuracao(1);
      fetchRodadas();
    } else {
      alert('Erro ao salvar rodada: ' + error.message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('pesquisa_rodadas')
      .update({ ativa: !currentStatus })
      .eq('id', id);

    if (!error) {
      fetchRodadas();
    }
  };

  const deleteRodada = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta rodada?')) return;
    const { error } = await supabase.from('pesquisa_rodadas').delete().eq('id', id);
    if (!error) {
      fetchRodadas();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Rodadas e Pesquisas</h2>
          <p className="text-sm text-gray-500">Cadastre e controle os períodos de coleta para os entrevistadores.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Pesquisa / Rodada
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando rodadas...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rodadas.map((r) => (
            <div key={r.id} className={`card p-5 border-l-4 ${r.ativa ? 'border-l-emerald-500' : 'border-l-gray-300'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                    {r.turno}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">{r.nome}</h3>
                </div>
                <button
                  onClick={() => toggleStatus(r.id, r.ativa)}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    r.ativa ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {r.ativa ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {r.ativa ? 'Ativa' : 'Inativa'}
                </button>
              </div>

              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Início: {new Date(r.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Fim: {new Date(r.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
                <p>⏱️ Duração: {r.dias_duracao} dia(s)</p>
              </div>

              <div className="flex justify-end gap-1 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleOpenEditModal(r)}
                  className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                  title="Editar rodada"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteRodada(r.id)}
                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                  title="Excluir rodada"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {rodadas.length === 0 && (
            <p className="text-sm text-gray-400 col-span-full text-center py-8">Nenhuma rodada cadastrada até o momento.</p>
          )}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Pesquisa / Rodada' : 'Cadastrar Nova Pesquisa'}
            </h3>
            <form onSubmit={handleSaveRodada} className="space-y-4">
              <div>
                <label className="label-text">Nome Amigável da Pesquisa *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value.toUpperCase())}
                  placeholder="EX: 1º TURNO - PESQUISA 1"
                  className="input-field uppercase"
                  required
                />
              </div>

              <div>
                <label className="label-text">Turno *</label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="input-field"
                >
                  <option value="1º Turno">1º Turno</option>
                  <option value="2º Turno">2º Turno</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Data Início *</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Data Fim *</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Dias de Duração (Automático)</label>
                <input
                  type="number"
                  min="1"
                  value={diasDuracao}
                  onChange={(e) => setDiasDuracao(Number(e.target.value))}
                  className="input-field bg-gray-50 font-semibold text-gray-800"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ativaCheck"
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="ativaCheck" className="text-sm font-medium text-gray-700">
                  Deixar esta pesquisa ativa imediatamente para coleta
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Salvar Alterações' : 'Salvar Pesquisa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}