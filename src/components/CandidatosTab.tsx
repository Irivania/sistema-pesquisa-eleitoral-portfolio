import { Vote } from 'lucide-react';
import { HorizontalBarChart } from '@/components/Charts';

interface CandidatosTabProps {
  senadoEspData: { label: string; count: number; pct: number }[];
  senadoEstData: { label: string; count: number; pct: number }[];
  rejeicaoData: { label: string; count: number; pct: number }[];
  depFedData: { label: string; count: number; pct: number }[];
  depEstData: { label: string; count: number; pct: number }[];
}

export default function CandidatosTab({
  senadoEspData,
  senadoEstData,
  rejeicaoData,
  depFedData,
  depEstData,
}: CandidatosTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Senado — Espontânea (até 2 escolhas)" icon={Vote}>
          <HorizontalBarChart data={senadoEspData} />
        </ChartCard>
        <ChartCard title="Senado — Estimulada (até 2 escolhas)" icon={Vote}>
          <HorizontalBarChart data={senadoEstData} />
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Rejeição para o Senado" icon={Vote}>
          <HorizontalBarChart data={rejeicaoData} />
        </ChartCard>
        <ChartCard title="Deputado Federal" icon={Vote}>
          <HorizontalBarChart data={depFedData} />
        </ChartCard>
      </div>
      <ChartCard title="Deputado Estadual" icon={Vote}>
        <HorizontalBarChart data={depEstData} />
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