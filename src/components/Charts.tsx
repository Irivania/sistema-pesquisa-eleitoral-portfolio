import { getChartColor } from '@/lib/analytics';

interface BarChartProps {
  data: { label: string; count: number; pct: number }[];
  showCount?: boolean;
}

export function HorizontalBarChart({ data, showCount = true }: BarChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 py-4">Sem dados disponíveis</p>;
  }

  return (
    <div className="space-y-2.5">
      {data.map((item, i) => (
        <div key={item.label} className="group">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-gray-700 truncate pr-2">{item.label}</span>
            <span className="text-gray-500 whitespace-nowrap">
              {showCount && <span className="mr-1.5">{item.count}</span>}
              <span className="font-semibold text-gray-700">{item.pct.toFixed(1)}%</span>
            </span>
          </div>
          <div className="h-7 bg-gray-100 rounded-lg overflow-hidden relative">
            <div
              className="h-full rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-2"
              style={{
                width: `${Math.max(item.pct, 2)}%`,
                backgroundColor: getChartColor(i),
              }}
            >
              {item.pct > 8 && (
                <span className="text-white text-xs font-bold">{item.pct.toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; count: number; pct: number }[];
}

export function DonutChart({ data }: DonutChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 py-4">Sem dados disponíveis</p>;
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {data.map((item, i) => {
            const dash = (item.pct / 100) * circumference;
            const segment = (
              <circle
                key={item.label}
                cx="80" cy="80" r={radius}
                fill="none"
                stroke={getChartColor(i)}
                strokeWidth="22"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
                className="transition-all duration-500"
              />
            );
            offset += dash;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-400">total</span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 w-full">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: getChartColor(i) }}
            />
            <span className="text-gray-700 flex-1 truncate">{item.label}</span>
            <span className="text-gray-500 font-medium whitespace-nowrap">
              {item.count} ({item.pct.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
