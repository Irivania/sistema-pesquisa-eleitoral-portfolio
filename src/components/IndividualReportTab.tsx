import {
  Award, Users, ChevronRight, MapPin, Map as MapIcon, Calendar, Clock, Eye, ClipboardList,
} from 'lucide-react';
import type { SurveyData } from '@/types/survey';
import { formatDate, formatTime } from '@/lib/analytics';

interface IndividualReportTabProps {
  interviewerStats: { name: string; count: number }[];
  selectedInterviewerReport: string | null;
  onSelectInterviewer: (name: string) => void;
  interviewerReportData: {
    total: number;
    bairros: string[];
    areas: string[];
    firstSubmission: number | null;
    lastSubmission: number | null;
    dailyBreakdown: { date: string; count: number }[];
    surveys: SurveyData[];
  } | null;
  onViewDetails: (row: SurveyData) => void;
}

export default function IndividualReportTab({
  interviewerStats,
  selectedInterviewerReport,
  onSelectInterviewer,
  interviewerReportData,
  onViewDetails,
}: IndividualReportTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Interviewer selector */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Relatório por Entrevistador</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Selecione um entrevistador para ver o desempenho individual: entrevistas realizadas, bairros cobertos e data/hora dos envios.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {interviewerStats.map((stat) => (
            <button
              key={stat.name}
              onClick={() => onSelectInterviewer(stat.name)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                selectedInterviewerReport === stat.name
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                selectedInterviewerReport === stat.name ? 'bg-blue-600' : 'bg-blue-50'
              }`}>
                <Users className={`w-5 h-5 ${selectedInterviewerReport === stat.name ? 'text-white' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{stat.name}</p>
                <p className="text-xs text-gray-500">{stat.count} entrevistas</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-colors ${
                selectedInterviewerReport === stat.name ? 'text-blue-600' : 'text-gray-300'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Report content */}
      {selectedInterviewerReport && interviewerReportData && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{interviewerReportData.total}</p>
              <p className="text-xs text-gray-500 mt-1">Entrevistas</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-bold text-emerald-600">{interviewerReportData.bairros.length}</p>
              <p className="text-xs text-gray-500 mt-1">Bairros Cobertos</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-bold text-amber-600">{interviewerReportData.dailyBreakdown.length}</p>
              <p className="text-xs text-gray-500 mt-1">Dias de Coleta</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-bold text-gray-700">
                {interviewerReportData.lastSubmission
                  ? formatDate(new Date(interviewerReportData.lastSubmission).toISOString())
                  : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Último Envio</p>
            </div>
          </div>

          {/* Bairros + daily breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Bairros Cobertos" icon={MapIcon}>
              <div className="flex flex-wrap gap-2">
                {interviewerReportData.bairros.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhum bairro registrado</p>
                ) : interviewerReportData.bairros.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    <MapPin className="w-3.5 h-3.5" /> {b}
                  </span>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Coleta por Dia" icon={Calendar}>
              {interviewerReportData.dailyBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum registro</p>
              ) : (
                <div className="space-y-2">
                  {interviewerReportData.dailyBreakdown.map((d) => (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-28 shrink-0">{d.date}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-lg transition-all duration-500 flex items-center justify-end px-2"
                          style={{
                            width: `${Math.max((d.count / Math.max(...interviewerReportData.dailyBreakdown.map((x) => x.count))) * 100, 15)}%`,
                          }}
                        >
                          <span className="text-xs text-white font-bold">{d.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>

          {/* Detailed submissions table */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">
                Envios Detalhados ({interviewerReportData.surveys.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Bairro</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Área</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 no-print">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {interviewerReportData.surveys.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-700">
                        {row.created_at ? formatDate(row.created_at) : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {row.created_at ? formatTime(row.created_at) : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{row.bairro}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          row.area === 'Urbana' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {row.area}
                        </span>
                      </td>
                      <td className="py-3 px-4 no-print text-center">
                        <button
                          onClick={() => onViewDetails(row)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!selectedInterviewerReport && interviewerStats.length > 0 && (
        <div className="card p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Selecione um entrevistador acima</p>
          <p className="text-gray-400 text-sm">para ver o relatório individual de desempenho</p>
        </div>
      )}

      {interviewerStats.length === 0 && (
        <div className="card p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma entrevista registrada</p>
          <p className="text-gray-400 text-sm">Os relatórios individuais aparecerão aqui</p>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}