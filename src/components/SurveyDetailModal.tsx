import { X } from 'lucide-react';
import type { SurveyData } from '@/types/survey';
import { formatDate, formatTime } from '@/lib/analytics';

interface SurveyDetailModalProps {
  detailRow: SurveyData;
  onClose: () => void;
}

export default function SurveyDetailModal({ detailRow, onClose }: SurveyDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Detalhes da Entrevista</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <DetailSection title="Identificação">
            <DetailItem label="Entrevistador" value={detailRow.interviewer_name} />
            <DetailItem label="Data/Hora" value={`${formatDate(detailRow.created_at || '')} às ${formatTime(detailRow.created_at || '')}`} />
          </DetailSection>
          <DetailSection title="Classificação">
            <DetailItem label="Bairro" value={detailRow.bairro || detailRow.cidade} />
            <DetailItem label="Sexo" value={detailRow.sexo} />
            <DetailItem label="Faixa Etária" value={detailRow.faixa_etaria} />
            <DetailItem label="Escolaridade" value={detailRow.escolaridade} />
            <DetailItem label="Área" value={detailRow.area} />
          </DetailSection>
          <DetailSection title="Opinião">
            <DetailItem label="Avaliação Prefeita" value={detailRow.aval_prefeta || '—'} />
            <DetailItem label="Avaliação Governadora" value={detailRow.aval_governadora || '—'} />
            <DetailItem label="Problema Principal" value={detailRow.problema_principal || '—'} />
            {detailRow.problema_principal === 'Outra' && (
              <DetailItem label="Problema (outro)" value={detailRow.problema_principal_outro || '—'} />
            )}
            <DetailItem label="Influência do Apoio" value={detailRow.influencia_apoio || '—'} />
            <DetailItem label="Peso na Escolha" value={detailRow.peso_escolha || '—'} />
            {detailRow.peso_escolha === 'Outra' && (
              <DetailItem label="Peso (outro)" value={detailRow.peso_escolha_outro || '—'} />
            )}
            <DetailItem label="Veículo de Comunicação" value={detailRow.veiculo_comunicacao || '—'} />
          </DetailSection>
          <DetailSection title="Candidatos">
            <DetailItem label="Senado (espontânea)" value={(detailRow.senado_espontanea || []).join(', ') || '—'} />
            <DetailItem label="Senado (estimulada)" value={(detailRow.senado_estimulada || []).join(', ') || '—'} />
            <DetailItem label="Rejeição Senado" value={detailRow.rejeicao_senado || '—'} />
            <DetailItem label="Deputado Federal" value={detailRow.dep_federal || '—'} />
            <DetailItem label="Deputado Estadual" value={detailRow.dep_estadual || '—'} />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</h4>
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">{children}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
  );
}