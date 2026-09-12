import type { SurveyData } from '@/types/survey';

export function countOccurrences(data: SurveyData[], field: keyof SurveyData): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of data) {
    const val = row[field];
    if (val === null || val === undefined || val === '') continue;
    const key = String(val);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

export function countArrayOccurrences(data: SurveyData[], field: keyof SurveyData): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of data) {
    const val = row[field];
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item) counts.set(item, (counts.get(item) || 0) + 1);
      }
    }
  }
  return counts;
}

export function toPercentages(counts: Map<string, number>): { label: string; count: number; pct: number }[] {
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function getUniqueInterviewers(data: SurveyData[]): string[] {
  const set = new Set<string>();
  data.forEach((d) => set.add(d.interviewer_name));
  return Array.from(set).sort();
}

const CHART_COLORS = [
  '#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5',
  '#0d9488', '#be185d', '#a16207', '#1e40af', '#16a34a',
];

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function exportToCSV(data: SurveyData[]): void {
  const headers = [
    'ID', 'Entrevistador', 'Data', 'Hora', 'Bairro', 'Sexo', 'Faixa Etária',
    'Escolaridade', 'Área', 'Avaliação Prefeita', 'Avaliação Governadora',
    'Problema Principal', 'Problema Outro', 'Senado Espontânea',
    'Senado Estimulada', 'Rejeição Senado', 'Deputado Federal',
    'Deputado Estadual', 'Influência Apoio', 'Peso Escolha', 'Peso Escolha Outro',
    'Veículo Comunicação',
  ];

  const rows = data.map((d) => [
    d.id || '', d.interviewer_name, d.created_at ? formatDate(d.created_at) : '',
    d.created_at ? formatTime(d.created_at) : '', d.bairro, d.sexo, d.faixa_etaria,
    d.escolaridade, d.area, d.aval_prefeta, d.aval_governadora,
    d.problema_principal, d.problema_principal_outro || '',
    (d.senado_espontanea || []).join('; '),
    (d.senado_estimulada || []).join('; '),
    d.rejeicao_senado, d.dep_federal, d.dep_estadual, d.influencia_apoio,
    d.peso_escolha, d.peso_escolha_outro || '', d.veiculo_comunicacao,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        const str = String(cell ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pesquisa-bezerros-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
