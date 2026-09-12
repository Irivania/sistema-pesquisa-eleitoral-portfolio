import type { Interviewer } from '@/types/survey';

interface InterviewerDeleteModalProps {
  deleteConfirm: Interviewer;
  onClose: () => void;
  onConfirm: () => void;
}

export default function InterviewerDeleteModal({ deleteConfirm, onClose, onConfirm }: InterviewerDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
          <p className="text-gray-600 mb-6">
            Deseja realmente excluir <strong>{deleteConfirm.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="button" onClick={onConfirm} className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}