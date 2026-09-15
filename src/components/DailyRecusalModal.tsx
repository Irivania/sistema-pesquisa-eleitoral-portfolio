import { useState } from 'react';
import { X, UserX, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DailyRecusalModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewerName: string;
  cidadeAtual: string;
}

export default function DailyRecusalModal({
  isOpen,
  onClose,
  interviewerName,
  cidadeAtual,
}: DailyRecusalModalProps) {
  const [abordagens, setAbordagens] = useState<number>(0);
  const [recusas, setRecusas] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const taxaRecusaCalc = abordagens > 0 ? ((recusas / abordagens) * 100).toFixed(1) : '0';

  const handleSaveLog = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('interviewer_daily_logs').insert([
        {
          interviewer_name: interviewerName,
          cidade: cidadeAtual || 'Geral',
          abordagens_totais: Number(abordagens),
          recusas: Number(recusas),
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAbordagens(0);
        setRecusas(0);
        onClose();
      }, 1500);
    } catch (err) {
      alert('Erro ao salvar relatório diário: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <UserX className="w-5 h-5 text-amber-600" /> Relatório Diário de Recusas e Abordagens
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-gray-900 text-sm">Relatório enviado com sucesso!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Informe o panorama do seu dia de campo para mensurar o clima político e a receptividade na praça.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total de Eleitores Abordados (Convidados)</label>
              <input
                type="number"
                value={abordagens}
                onChange={(e) => setAbordagens(Number(e.target.value))}
                className="input-field text-sm"
                min={0}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total de Recusas Obtidas</label>
              <input
                type="number"
                value={recusas}
                onChange={(e) => setRecusas(Number(e.target.value))}
                className="input-field text-sm"
                min={0}
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">Taxa de Recusa Calculada:</span>
              <span className="text-sm font-bold text-amber-800">{taxaRecusaCalc}%</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary text-sm">
                Cancelar
              </button>
              <button
                onClick={handleSaveLog}
                disabled={saving || abordagens === 0}
                className="btn-primary bg-amber-600 hover:bg-amber-700 text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {saving ? 'Enviando...' : 'Enviar Relatório Diário'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}