import { useState, useEffect } from 'react';

interface RodadaItem {
  id: string;
  name: string;
  turn: string;
}

interface RodadasManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRodada: (nome: string, turno: string, idParaEditar?: string) => void;
  rodadaParaEditar?: RodadaItem | null;
}

export default function RodadasManagerModal({
  isOpen,
  onClose,
  onSaveRodada,
  rodadaParaEditar,
}: RodadasManagerModalProps) {
  const [nome, setNome] = useState('');
  const [turno, setTurno] = useState('1º Turno');

  // Preenche os campos automaticamente se estiver editando
  useEffect(() => {
    if (rodadaParaEditar) {
      setNome(rodadaParaEditar.name);
      setTurno(rodadaParaEditar.turn);
    } else {
      setNome('');
      setTurno('1º Turno');
    }
  }, [rodadaParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!nome.trim()) return;
    onSaveRodada(nome.trim(), turno, rodadaParaEditar?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 text-lg mb-2">
          {rodadaParaEditar ? 'Editar Pesquisa / Rodada' : 'Cadastrar Nova Pesquisa / Rodada'}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {rodadaParaEditar ? 'Altere as informações da rodada selecionada.' : 'Crie uma nova rodada para segmentar suas coletas em campo.'}
        </p>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nome da Pesquisa</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Pesquisa PE — 2ª Rodada"
              className="input-field text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Turno / Categoria</label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="input-field text-sm bg-white"
            >
              <option value="1º Turno">1º Turno</option>
              <option value="2º Turno">2º Turno</option>
              <option value="Eleição Suplementar">Eleição Suplementar</option>
              <option value="Tracking Diário">Tracking Diário</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!nome.trim()}
            className="btn-primary bg-blue-600 hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {rodadaParaEditar ? 'Salvar Alterações' : 'Salvar Nova Pesquisa'}
          </button>
        </div>
      </div>
    </div>
  );
}