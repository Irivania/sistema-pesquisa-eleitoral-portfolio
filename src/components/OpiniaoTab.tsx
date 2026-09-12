import { TrendingUp } from 'lucide-react';
import { HorizontalBarChart, DonutChart } from '@/components/Charts';

interface OpiniaoTabProps {
  avalPrefData: { label: string; count: number; pct: number }[];
  avalGovData: { label: string; count: number; pct: number }[];
  problemaData: { label: string; count: number; pct: number }[];
  influenciaData: { label: string; count: number; pct: number }[];
  pesoData: { label: string; count: number; pct: number }[];
}

export default function OpiniaoTab({
  avalPrefData,
  avalGovData,
  problemaData,
  influenciaData,
  pesoData,
}: OpiniaoTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Avaliação da Prefeita Lucielle Laurentino" icon={TrendingUp}>
          <HorizontalBarChart data={avalPrefData} />
        </ChartCard>
        <ChartCard title="Avaliação da Governadora Raquel Lyra" icon={TrendingUp}>
          <HorizontalBarChart data={avalGovData} />
        </ChartCard>
      </div>
      <ChartCard title="Principal Problema de Bezerros (espontânea)" icon={TrendingUp}>
        <HorizontalBarChart data={problemaData} />
      </ChartCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Influência do Apoio da Prefeita" icon={TrendingUp}>
          <DonutChart data={influenciaData} />
        </ChartCard>
        <ChartCard title="O que mais pesa na escolha de um candidato" icon={TrendingUp}>
          <HorizontalBarChart data={pesoData} />
        </ChartCard>
      </div>
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