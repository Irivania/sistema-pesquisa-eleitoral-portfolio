import { useState, useMemo } from 'react';
import { GitCompare, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { SurveyData } from '@/types/survey';
import { RODADAS_PESQUISA, RodadaId } from '@/data/surveyOptions';
import { countArrayOccurrences, toPercentages } from '@/lib/analytics';
import { HorizontalBarChart } from '@/components/Charts';

interface ComparisonTabProps {
  surveys: SurveyData[];
}

export default function ComparisonTab({ surveys }: ComparisonTabProps) {
  const [rodadaA, setRodadaA] = useState<RodadaId>('p1_1t');
  const [rodadaB, setRodadaB] = useState<RodadaId>('p3_1t');

  const surveysA = useMemo(() => surveys.filter((s) => s.rodada === rodadaA), [surveys, rodadaA]);
  const surveysB = useMemo(() => surveys.filter((s) => s.rodada === rodadaB), [surveys, rodadaB]);

  const dataA = useMemo(() => toPercentages(countArrayOccurrences(surveysA, 'senado_estimulada')), [surveysA]);
  const dataB = useMemo(() => toPercentages(countArrayOccurrences(surveysB, 'senado_estimulada')), [surveysB]);

  const comparisonList = useMemo(() => {
    const mapA = new Map(dataA.map((item) => [item.label, item.pct]));
    const mapB = new Map(dataB.map((item) => [item.label, item.pct]));
    const allLabels = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));

    return allLabels.map((label) => {
      const pctA = mapA.get(label) || 0;
      const pctB = mapB.get(label) || 0;
      const diff = Number((pctB - pctA).toFixed(1));
      return { label, pctA, pctB, diff };
    }).sort((a, b) => b.pctB - a.pctB);
  }, [dataA, dataB]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Cruzamento e Comparativo entre Pesquisas</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Selecione duas rodadas diferentes para comparar a evolução das intenções de voto lado a lado.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Pesquisa Base (Anterior)
            </label>
            <select
              value={rodadaA}
              onChange={(e) => setRodadaA(e.target.value as RodadaId)}
              className="input-field text-sm"
            >
              {RODADAS_PESQUISA.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({surveys.filter(s => s.rodada === r.id).length} entrevistas)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Pesquisa Alvo (Recente)
            </label>
            <select
              value={rodadaB}
              onChange={(e) => setRodadaB(e.target.value as RodadaId)}
              className="input-field text-sm"
            >
              {RODADAS_PESQUISA.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({surveys.filter(s => s.rodada === r.id).length} entrevistas)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">
            {RODADAS_PESQUISA.find(r => r.id === rodadaA)?.name} ({surveysA.length} entrevistas)
          </h4>
          <HorizontalBarChart data={dataA} />
        </div>
        <div className="card p-5">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">
            {RODADAS_PESQUISA.find(r => r.id === rodadaB)?.name} ({surveysB.length} entrevistas)
          </h4>
          <HorizontalBarChart data={dataB} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Matriz de Variação de Votos (Pontos Percentuais)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Candidato / Opção</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Base ({rodadaA})</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Alvo ({rodadaB})</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Variação</th>
              </tr>
            </thead>
            <tbody>
              {comparisonList.map((row) => (
                <tr key={row.label} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{row.label}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{row.pctA}%</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-800">{row.pctB}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      row.diff > 0 ? 'bg-emerald-100 text-emerald-700' : row.diff < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {row.diff > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : row.diff < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {row.diff > 0 ? `+${row.diff}%` : `${row.diff}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}