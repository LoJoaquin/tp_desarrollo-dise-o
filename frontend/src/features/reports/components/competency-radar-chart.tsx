import type { CompetencyComparison } from "@/features/reports/types";

const width = 440;
const height = 360;
const centerX = 220;
const centerY = 169;
const radius = 105;

function wrapLabel(value: string, maxLength = 17) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Con una o dos competencias un radar no forma un polígono; se usan barras.
function CompetencyBarChart({ rows }: { rows: CompetencyComparison[] }) {
  const maxValue = Math.max(5, Math.ceil(Math.max(...rows.flatMap((row) => [row.valorRequerido, row.valorObtenido])) / 5) * 5);
  const chartHeight = 220;
  const top = 20;
  const left = 36;
  const groupWidth = (width - left - 20) / rows.length;
  const barWidth = Math.min(48, groupWidth / 3);
  const y = (value: number) => top + chartHeight - (chartHeight * Math.max(0, Math.min(value, maxValue))) / maxValue;

  return <div className="mx-auto w-full max-w-[460px]">
    <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" role="img" aria-label="Gráfico de barras que compara el nivel requerido y obtenido por competencia">
      {[0, 0.25, 0.5, 0.75, 1].map((step) => {
        const value = maxValue * step;
        return <g key={`grid-${step}`}>
          <line x1={left} x2={width - 20} y1={y(value)} y2={y(value)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={left - 6} y={y(value)} textAnchor="end" dominantBaseline="middle" fill="#94a3b8" fontSize="9">{value.toFixed(value % 1 ? 1 : 0)}</text>
        </g>;
      })}
      {rows.map((row, index) => {
        const center = left + groupWidth * index + groupWidth / 2;
        return <g key={`bars-${row.idCompetencia}`}>
          <rect x={center - barWidth - 3} y={y(row.valorRequerido)} width={barWidth} height={top + chartHeight - y(row.valorRequerido)} fill="#1e3a8a" fillOpacity="0.8" rx="3"><title>Requerido: {row.valorRequerido}</title></rect>
          <rect x={center + 3} y={y(row.valorObtenido)} width={barWidth} height={top + chartHeight - y(row.valorObtenido)} fill="#635bdb" rx="3"><title>Obtenido: {row.valorObtenido}</title></rect>
          {wrapLabel(row.nombreCompetencia, 24).map((line, lineIndex) => <text key={`${row.idCompetencia}-${lineIndex}`} x={center} y={top + chartHeight + 18 + lineIndex * 11} textAnchor="middle" fill="#53627a" fontSize="9" fontWeight="700">{line.toLocaleUpperCase("es-AR")}</text>)}
        </g>;
      })}
    </svg>
    <div className="mt-1 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <span className="inline-flex items-center gap-2"><i className="size-3 rounded bg-blue-900" />Requerido</span>
      <span className="inline-flex items-center gap-2"><i className="size-3 rounded bg-indigo-600" />Obtenido</span>
    </div>
  </div>;
}

export function CompetencyRadarChart({ rows }: { rows: CompetencyComparison[] }) {
  if (rows.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">El puesto no tiene competencias para comparar.</p>;
  }
  if (rows.length < 3) {
    return <CompetencyBarChart rows={rows} />;
  }

  const maxValue = Math.max(5, Math.ceil(Math.max(...rows.flatMap((row) => [row.valorRequerido, row.valorObtenido])) / 5) * 5);
  const angleFor = (index: number) => (Math.PI * 2 * index) / rows.length - Math.PI / 2;
  const point = (index: number, value: number, scale = radius) => {
    const angle = angleFor(index);
    const distance = scale * Math.max(0, Math.min(value / maxValue, 1));
    return { x: centerX + Math.cos(angle) * distance, y: centerY + Math.sin(angle) * distance };
  };
  const polygonPoints = (values: number[]) => rows.map((_, index) => {
    const current = point(index, values[index]);
    return `${current.x.toFixed(1)},${current.y.toFixed(1)}`;
  }).join(" ");
  const gridPoints = (level: number) => rows.map((_, index) => {
    const current = point(index, maxValue, radius * level / 5);
    return `${current.x.toFixed(1)},${current.y.toFixed(1)}`;
  }).join(" ");

  return <div className="mx-auto w-full max-w-[460px]">
    <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" role="img" aria-label="Gráfico de radar que compara el nivel requerido y obtenido por competencia">
      {[1, 2, 3, 4, 5].map((level) => <polygon key={`grid-${level}`} points={gridPoints(level)} fill="none" stroke="#dbe3ef" strokeWidth="1" />)}
      {rows.map((row, index) => {
        const end = point(index, maxValue);
        return <line key={`axis-${row.idCompetencia}`} x1={centerX} y1={centerY} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={polygonPoints(rows.map((row) => row.valorRequerido))} fill="#1e3a8a" fillOpacity="0.14" stroke="#1e3a8a" strokeWidth="2.4" strokeLinejoin="round" />
      <polygon points={polygonPoints(rows.map((row) => row.valorObtenido))} fill="#635bdb" fillOpacity="0.20" stroke="#635bdb" strokeWidth="2.8" strokeLinejoin="round" />
      {rows.map((row, index) => {
        const labelPoint = point(index, maxValue, radius + 31);
        const lines = wrapLabel(row.nombreCompetencia);
        const anchor = labelPoint.x < centerX - 14 ? "end" : labelPoint.x > centerX + 14 ? "start" : "middle";
        const startY = labelPoint.y - ((lines.length - 1) * 5);
        return <text key={`label-${row.idCompetencia}`} x={labelPoint.x} y={startY} textAnchor={anchor} dominantBaseline="middle" fill="#53627a" fontSize="9" fontWeight="700" letterSpacing="0.15">
          <title>{row.nombreCompetencia}</title>
          {lines.map((line, lineIndex) => <tspan key={`${row.idCompetencia}-${lineIndex}`} x={labelPoint.x} dy={lineIndex === 0 ? 0 : 11}>{line.toLocaleUpperCase("es-AR")}</tspan>)}
        </text>;
      })}
    </svg>
    <div className="mt-1 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <span className="inline-flex items-center gap-2"><i className="size-3 rounded bg-blue-900" />Requerido</span>
      <span className="inline-flex items-center gap-2"><i className="size-3 rounded bg-indigo-600" />Obtenido</span>
    </div>
  </div>;
}
