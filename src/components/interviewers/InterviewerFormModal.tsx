import { UserPlus, X } from 'lucide-react';
import type { Interviewer } from '@/types/survey';

interface InterviewerFormModalProps {
  editingInterviewer: Interviewer | null;
  newName: string;
  setNewName: (val: string) => void;
  newCode: string;
  setNewCode: (val: string) => void;
  newPhone: string;
  setNewPhone: (val: string) => void;
  processing: boolean;
  onClose: () => void;
  onSave: () => void;
  onGenerateCode: () => void;
}

export default function InterviewerFormModal({
  editingInterviewer,
  newName,
  setNewName,
  newCode,
  setNewCode,
  newPhone,
  setNewPhone,
  processing,
  onClose,
  onSave,
  onGenerateCode,
}: InterviewerFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              {editingInterviewer ? 'Editar Entrevistador' : 'Adicionar Entrevistador'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label-text">Nome *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSave()}
              placeholder="Ex: Maria Silva"
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="label-text">ID / Código (Senha) *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSave()}
                placeholder="Ex: ENT-AB12"
                className="input-field font-mono uppercase"
              />
              <button
                type="button"
                onClick={onGenerateCode}
                className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Gerar
              </button>
            </div>
          </div>
          <div>
            <label className="label-text">Telefone (opcional)</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSave()}
              placeholder="Ex: (81) 99999-9999"
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="button" onClick={onSave} disabled={processing} className="btn-primary flex items-center gap-2">
              {processing ? 'Salvando...' : editingInterviewer ? 'Salvar Alterações' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}