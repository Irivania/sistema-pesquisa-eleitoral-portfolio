import type { SurveyData } from '@/types/survey';

interface DeleteSurveyModalProps {
  deleteConfirm: SurveyData;
  deletePassword: string;
  setDeletePassword: (val: string) => void;
  deleteError: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteSurveyModal({
  deleteConfirm,
  deletePassword,
  setDeletePassword,
  deleteError,
  deleting,
  onClose,
  onConfirm,
}: DeleteSurveyModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <div className="text-amber-600 font-bold text-lg">⚠️</div>
          <div>
            <h3 className="font-bold text-amber-900 text-sm">Cuidado: Ação Irreversível</h3>
            <p className="text-xs text-amber-700">Você está prestes a excluir permanentemente esta entrevista.</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Entrevista de <strong>{deleteConfirm.interviewer_name}</strong> no bairro <strong>{deleteConfirm.bairro}</strong>.
        </p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Digite sua senha de Administrador Master para confirmar:
          </label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Sua senha..."
            className="input-field text-sm"
            autoFocus
          />
          {deleteError && <p className="text-xs text-red-600 mt-1">{deleteError}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </button>
        </div>
      </div>
    </div>
  );
}