import { MapPin, Layers, Users } from 'lucide-react';
import { HorizontalBarChart, DonutChart } from '@/components/Charts';
import type { SurveyData } from '@/types/survey';

interface OverviewTabProps {
  surveys: SurveyData[];
  bairroData: { label: string; count: number; pct: number }[];
  areaData: { label: string; count: number; pct: number }[];
  sexoData: { label: string; count: number; pct: number }[];
  faixaData: { label: string; count: number; pct: number }[];
  escolaridadeData: { label: string; count: number; pct: number }[];
  interviewerStats: { name: string; count: number }[];
}

export default function OverviewTab({
  surveys,
  bairroData,
  areaData,
  sexoData,
  faixaData,
  escolaridadeData,
  interviewerStats,
}: OverviewTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição por Bairro" icon={MapPin}>
          <HorizontalBarChart data={bairroData} />
        </ChartCard>
        <ChartCard title="Distribuição por Área" icon={Layers}>
          <DonutChart data={areaData} />
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Sexo / Gênero" icon={Users}>
          <DonutChart data={sexoData} />
        </ChartCard>
        <ChartCard title="Faixa Etária" icon={Users}>
          <HorizontalBarChart data={faixaData} />
        </ChartCard>
        <ChartCard title="Escolaridade" icon={Users}>
          <HorizontalBarChart data={escolaridadeData} />
        </ChartCard>
      </div>

      {/* Interviewer stats */}
      <ChartCard title="Produtividade por Entrevistador" icon={Users}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Entrevistador</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Entrevistas</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">% do Total</th>
                <th className="py-2 px-3 font-medium text-gray-500 w-1/3">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {interviewerStats.map((stat) => (
                <tr key={stat.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-800">{stat.name}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{stat.count}</td>
                  <td className="py-2.5 px-3 text-right text-gray-500">
                    {surveys.length > 0 ? ((stat.count / surveys.length) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${surveys.length > 0 ? (stat.count / Math.max(...interviewerStats.map((s) => s.count))) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
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