import { Eye, Trash2 } from 'lucide-react';
import type { SurveyData } from '@/types/survey';
import { formatDate, formatTime } from '@/lib/analytics';

interface SurveysManagementTabProps {
  filteredSurveys: SurveyData[];
  onViewDetails: (row: SurveyData) => void;
  onDeleteSurvey: (row: SurveyData) => void;
}

export default function SurveysManagementTab({
  filteredSurveys,
  onViewDetails,
  onDeleteSurvey,
}: SurveysManagementTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 font-semibold">
          Gestão de Entrevistas ({filteredSurveys.length})
        </h2>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Data/Hora</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Entrevistador</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Bairro</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Área</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden sm:table-cell">Sexo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Faixa Etária</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 no-print">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Nenhuma entrevista encontrada com os filtros atuais
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-700">
                      <div>{row.created_at ? formatDate(row.created_at) : '—'}</div>
                      <div className="text-xs text-gray-400">{row.created_at ? formatTime(row.created_at) : ''}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{row.interviewer_name}</td>
                    <td className="py-3 px-4 text-gray-600">{row.bairro}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        row.area === 'Urbana' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.area}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{row.sexo}</td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{row.faixa_etaria}</td>
                    <td className="py-3 px-4 no-print">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDetails(row)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSurvey(row)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}