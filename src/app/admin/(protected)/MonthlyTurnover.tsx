'use client';

import { useEffect, useState } from 'react';

type DayPoint = { day: number; count: number; revenue: number };
type MonthData = {
  year: number;
  month: number;
  totalCount: number;
  totalRevenue: number;
  days: DayPoint[];
};

const MONTHS_HU = [
  'január', 'február', 'március', 'április', 'május', 'június',
  'július', 'augusztus', 'szeptember', 'október', 'november', 'december',
];

const COUNT_COLOR = '#4A90D9';
const REVENUE_COLOR = '#C4A591';

function huf(n: number): string {
  return n.toLocaleString('hu-HU') + ' Ft';
}

export default function MonthlyTurnover() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1); // 1-12
  const [data, setData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState(true);
  const [showRevenue, setShowRevenue] = useState(true);

  const curYear = now.getUTCFullYear();
  const curMonth = now.getUTCMonth() + 1;
  const isCurrent = year === curYear && month === curMonth;
  // Don't step into the future.
  const canNext = year < curYear || (year === curYear && month < curMonth);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/stats/monthly?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const prev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (!canNext) return;
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  };
  const jumpToCurrent = () => {
    setYear(curYear);
    setMonth(curMonth);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8">
      {/* Header + month nav */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-headline font-bold text-on-surface">Havi forgalom</h2>
          <p className="text-sm text-on-surface/60 mt-0.5">
            {year}. {MONTHS_HU[month - 1]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Előző hónap"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface/70 hover:bg-surface-container-high transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={jumpToCurrent}
            aria-label="Aktuális hónap"
            title="Ugrás az aktuális hónapra"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${
              isCurrent
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container text-on-surface/70 border-transparent hover:bg-surface-container-high'
            }`}
          >
            ●
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            aria-label="Következő hónap"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface/70 hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>

      {/* Monthly totals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-surface-container p-4">
          <p className="text-xs text-on-surface/60">Rendelések (hó)</p>
          <p className="text-2xl font-headline font-bold text-on-surface mt-1">
            {data?.totalCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl bg-surface-container p-4">
          <p className="text-xs text-on-surface/60">Bevétel (hó)</p>
          <p className="text-2xl font-headline font-bold text-on-surface mt-1">
            {huf(data?.totalRevenue ?? 0)}
          </p>
        </div>
      </div>

      {/* Series toggles */}
      <div className="flex flex-wrap gap-3 mb-3">
        <button
          type="button"
          onClick={() => setShowCount((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            showCount ? 'border-transparent' : 'opacity-40 border-gray-200'
          }`}
          style={showCount ? { backgroundColor: `${COUNT_COLOR}1a`, color: COUNT_COLOR } : {}}
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COUNT_COLOR }} />
          Rendelések száma
        </button>
        <button
          type="button"
          onClick={() => setShowRevenue((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            showRevenue ? 'border-transparent' : 'opacity-40 border-gray-200'
          }`}
          style={showRevenue ? { backgroundColor: `${REVENUE_COLOR}1a`, color: '#8a6f58' } : {}}
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: REVENUE_COLOR }} />
          Bevétel
        </button>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-[280px] flex items-center justify-center text-on-surface/40 text-sm">
          Betöltés…
        </div>
      ) : (
        <Chart days={data?.days ?? []} showCount={showCount} showRevenue={showRevenue} />
      )}
    </div>
  );
}

function Chart({
  days,
  showCount,
  showRevenue,
}: {
  days: DayPoint[];
  showCount: boolean;
  showRevenue: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 760;
  const H = 300;
  const pad = { top: 16, right: 64, bottom: 26, left: 48 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const n = days.length;

  if (n === 0) {
    return (
      <p className="text-sm text-on-surface/50 py-8 text-center">Nincs adat erre a hónapra.</p>
    );
  }

  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const maxRevenue = Math.max(1, ...days.map((d) => d.revenue));
  const x = (i: number) => pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yCount = (v: number) => pad.top + innerH - (v / maxCount) * innerH;
  const yRevenue = (v: number) => pad.top + innerH - (v / maxRevenue) * innerH;

  const countPoints = days.map((d, i) => `${x(i)},${yCount(d.count)}`).join(' ');
  const revenuePoints = days.map((d, i) => `${x(i)},${yRevenue(d.revenue)}`).join(' ');

  const step = Math.max(1, Math.ceil(n / 8));
  const compact = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}e` : String(v));

  // Map a mouse position to the nearest day index (viewBox coords).
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - pad.left) / innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const hv = hover != null ? days[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* baseline */}
        <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="#E5E1DA" strokeWidth={1} />

        {/* Left axis (order count) */}
        <text x={pad.left - 6} y={pad.top + 4} textAnchor="end" fontSize={10} fill={COUNT_COLOR}>{maxCount}</text>
        <text x={pad.left - 6} y={pad.top + innerH} textAnchor="end" fontSize={10} fill={COUNT_COLOR}>0</text>
        {/* Right axis (revenue) */}
        <text x={pad.left + innerW + 6} y={pad.top + 4} textAnchor="start" fontSize={10} fill="#8a6f58">{compact(maxRevenue)}</text>
        <text x={pad.left + innerW + 6} y={pad.top + innerH} textAnchor="start" fontSize={10} fill="#8a6f58">0</text>

        {/* Crosshair on hover */}
        {hv && (
          <line x1={x(hover!)} y1={pad.top} x2={x(hover!)} y2={pad.top + innerH} stroke="#00000022" strokeWidth={1} />
        )}

        {showRevenue && (
          <>
            <polyline points={revenuePoints} fill="none" stroke={REVENUE_COLOR} strokeWidth={2} />
            {days.map((d, i) => (
              <circle key={`r${i}`} cx={x(i)} cy={yRevenue(d.revenue)} r={hover === i ? 4.5 : 2.5} fill={REVENUE_COLOR} />
            ))}
          </>
        )}
        {showCount && (
          <>
            <polyline points={countPoints} fill="none" stroke={COUNT_COLOR} strokeWidth={2} />
            {days.map((d, i) => (
              <circle key={`c${i}`} cx={x(i)} cy={yCount(d.count)} r={hover === i ? 4.5 : 2.5} fill={COUNT_COLOR} />
            ))}
          </>
        )}

        {/* x-axis day labels */}
        {days.map((d, i) =>
          i % step === 0 || i === n - 1 ? (
            <text key={`x${i}`} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="#999">
              {d.day}
            </text>
          ) : null,
        )}
      </svg>

      {/* Hover tooltip */}
      {hv && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 bg-white rounded-lg shadow-lg border border-black/5 px-3 py-2 text-xs whitespace-nowrap"
          style={{ left: `${(x(hover!) / W) * 100}%`, top: 0 }}
        >
          <div className="font-semibold text-carbon mb-1">{hv.day}. nap</div>
          {showCount && (
            <div style={{ color: COUNT_COLOR }}>Rendelés: <strong>{hv.count}</strong></div>
          )}
          {showRevenue && (
            <div style={{ color: '#8a6f58' }}>Bevétel: <strong>{hv.revenue.toLocaleString('hu-HU')} Ft</strong></div>
          )}
        </div>
      )}
    </div>
  );
}
