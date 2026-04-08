'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  today: { orders: number; revenue: number };
  thisMonth: { orders: number; revenue: number };
  lastMonth: { orders: number; revenue: number };
  allTime: { orders: number; revenue: number; avgOrderValue: number };
  topProducts: { name: string; quantity: number; revenue: number }[];
  dailyChart: { date: string; revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
}

const statusLabels: Record<string, string> = {
  pending: 'Függőben',
  paid: 'Fizetett',
  processing: 'Feldolgozás alatt',
  shipped: 'Kiszállítva',
  delivered: 'Kézbesítve',
  cancelled: 'Törölve',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400',
  paid: 'bg-green-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-gray-400',
  cancelled: 'bg-red-500',
};

interface AnalyticsData {
  realtimeUsers: number;
  overview: {
    users: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  pages: { path: string; views: number; users: number }[];
  sources: { source: string; sessions: number; users: number }[];
  daily: { date: string; users: number; sessions: number }[];
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft';
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}p ${s}mp`;
}

export default function StatisztikakPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [ga, setGa] = useState<AnalyticsData | null>(null);
  const [gaError, setGaError] = useState('');
  const [loading, setLoading] = useState(true);
  const [gaLoading, setGaLoading] = useState(true);
  const [tab, setTab] = useState<'sales' | 'analytics'>('sales');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setGaError(data.error);
        } else {
          setGa(data);
        }
      })
      .catch(() => setGaError('Hálózati hiba'))
      .finally(() => setGaLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-on-surface/60 py-12 text-center">Nem sikerült betölteni a statisztikákat.</p>;
  }

  const maxDailyRevenue = Math.max(...stats.dailyChart.map((d) => d.revenue), 1);
  const totalStatusCount = stats.statusBreakdown.reduce((sum, s) => sum + s.count, 0);

  const monthGrowth =
    stats.lastMonth.revenue > 0
      ? Math.round(((stats.thisMonth.revenue - stats.lastMonth.revenue) / stats.lastMonth.revenue) * 100)
      : null;

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">
        Statisztikák
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('sales')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'sales' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface/60 hover:bg-surface-container-low'
          }`}
        >
          Értékesítés
        </button>
        <button
          onClick={() => setTab('analytics')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'analytics' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface/60 hover:bg-surface-container-low'
          }`}
        >
          Google Analytics
        </button>
      </div>

      {tab === 'sales' ? (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Mai bevétel" value={formatPrice(stats.today.revenue)} sub={`${stats.today.orders} rendelés`} />
            <Card
              label="Havi bevétel"
              value={formatPrice(stats.thisMonth.revenue)}
              sub={`${stats.thisMonth.orders} rendelés`}
              badge={monthGrowth !== null ? `${monthGrowth > 0 ? '+' : ''}${monthGrowth}%` : undefined}
              badgeColor={monthGrowth !== null && monthGrowth >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}
            />
            <Card label="Előző havi bevétel" value={formatPrice(stats.lastMonth.revenue)} sub={`${stats.lastMonth.orders} rendelés`} />
            <Card label="Átl. rendelésérték" value={formatPrice(stats.allTime.avgOrderValue)} sub={`${stats.allTime.orders} rendelés összesen`} />
          </div>

          {/* Revenue chart (last 30 days) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
              Bevétel (utolsó 30 nap)
            </h2>
            {stats.dailyChart.length === 0 ? (
              <p className="text-on-surface/50 text-sm py-8 text-center">Még nincs adat</p>
            ) : (
              <div className="flex items-end gap-[2px] h-48">
                {stats.dailyChart.map((d) => {
                  const height = Math.max((d.revenue / maxDailyRevenue) * 100, 2);
                  return (
                    <div key={d.date} className="flex-1 group relative flex flex-col justify-end">
                      <div
                        className="bg-primary/70 hover:bg-primary rounded-t transition-colors min-w-[4px]"
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-on-surface text-surface text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {d.date.slice(5)}: {formatPrice(d.revenue)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between text-xs text-on-surface/40 mt-2">
              <span>{stats.dailyChart[0]?.date.slice(5) ?? ''}</span>
              <span>{stats.dailyChart[stats.dailyChart.length - 1]?.date.slice(5) ?? ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top products */}
            <div className="bg-surface-container-lowest rounded-2xl p-6">
              <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
                Top termékek
              </h2>
              <div className="space-y-3">
                {stats.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-on-surface/40 w-5">{i + 1}.</span>
                      <span className="text-sm text-on-surface truncate">{p.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-sm font-medium text-on-surface">{p.quantity} db</span>
                      <span className="text-xs text-on-surface/50 ml-2">{formatPrice(p.revenue)}</span>
                    </div>
                  </div>
                ))}
                {stats.topProducts.length === 0 && (
                  <p className="text-on-surface/50 text-sm text-center py-4">Még nincs adat</p>
                )}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="bg-surface-container-lowest rounded-2xl p-6">
              <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
                Rendelés státuszok
              </h2>
              <div className="space-y-3">
                {stats.statusBreakdown.map((s) => {
                  const pct = totalStatusCount > 0 ? Math.round((s.count / totalStatusCount) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-on-surface">{statusLabels[s.status] ?? s.status}</span>
                        <span className="text-on-surface/60">{s.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${statusColors[s.status] ?? 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Google Analytics tab */
        <div className="space-y-6">
          {gaLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : gaError ? (
            <div className="bg-surface-container-lowest rounded-2xl p-6">
              <p className="text-sm text-on-surface/60 mb-4">{gaError}</p>
              <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-800 space-y-2">
                <p className="font-medium">A beállításhoz szükséges lépések:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Google Cloud Console → APIs &amp; Services → Enable &quot;Google Analytics Data API&quot;</li>
                  <li>Create a Service Account → Download JSON key</li>
                  <li>GA4 Admin → Property Access → Add service account email as Viewer</li>
                  <li>Vercel env: <code className="bg-yellow-100 px-1 rounded">GA_SERVICE_ACCOUNT_KEY</code> = a JSON fájl tartalma</li>
                  <li>Vercel env: <code className="bg-yellow-100 px-1 rounded">GA_PROPERTY_ID</code> = a GA4 property numerikus ID-ja</li>
                </ol>
              </div>
            </div>
          ) : ga ? (
            <>
              {/* Overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card label="Most az oldalon" value={ga.realtimeUsers.toString()} sub="valós idejű" badge="LIVE" badgeColor="text-green-600 bg-green-50" />
                <Card label="Látogatók (30 nap)" value={ga.overview.users.toLocaleString('hu-HU')} sub="egyedi felhasználók" />
                <Card label="Munkamenetek" value={ga.overview.sessions.toLocaleString('hu-HU')} sub="utolsó 30 nap" />
                <Card label="Oldalmegtekintések" value={ga.overview.pageViews.toLocaleString('hu-HU')} sub="utolsó 30 nap" />
                <Card label="Átl. munkamenet" value={formatDuration(ga.overview.avgSessionDuration)} sub={`Visszaford.: ${ga.overview.bounceRate}%`} />
              </div>

              {/* Daily visitors chart */}
              <div className="bg-surface-container-lowest rounded-2xl p-6">
                <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
                  Napi látogatók (30 nap)
                </h2>
                {ga.daily.length > 0 ? (
                  <>
                    <div className="flex items-end gap-[2px] h-48">
                      {ga.daily.map((d) => {
                        const maxUsers = Math.max(...ga.daily.map((x) => x.users), 1);
                        const height = Math.max((d.users / maxUsers) * 100, 2);
                        return (
                          <div key={d.date} className="flex-1 group relative flex flex-col justify-end">
                            <div
                              className="bg-blue-400/70 hover:bg-blue-500 rounded-t transition-colors min-w-[4px]"
                              style={{ height: `${height}%` }}
                            />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-on-surface text-surface text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              {d.date.slice(5)}: {d.users} látogató, {d.sessions} munkamenet
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-on-surface/40 mt-2">
                      <span>{ga.daily[0]?.date.slice(5)}</span>
                      <span>{ga.daily[ga.daily.length - 1]?.date.slice(5)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-on-surface/50 text-sm py-8 text-center">Még nincs adat</p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top pages */}
                <div className="bg-surface-container-lowest rounded-2xl p-6">
                  <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
                    Legnépszerűbb oldalak
                  </h2>
                  <div className="space-y-3">
                    {ga.pages.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-on-surface/40 w-5">{i + 1}.</span>
                          <span className="text-sm text-on-surface truncate font-mono">{p.path}</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-sm font-medium text-on-surface">{p.views}</span>
                          <span className="text-xs text-on-surface/50 ml-1">megtekintés</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traffic sources */}
                <div className="bg-surface-container-lowest rounded-2xl p-6">
                  <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
                    Forgalmi források
                  </h2>
                  <div className="space-y-3">
                    {ga.sources.map((s, i) => {
                      const maxSessions = Math.max(...ga.sources.map((x) => x.sessions), 1);
                      const pct = Math.round((s.sessions / maxSessions) * 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-on-surface">{s.source || '(direct)'}</span>
                            <span className="text-on-surface/60">{s.sessions} munkamenet</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-xs text-on-surface/40 text-center">
                Részletes analitika:{' '}
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google Analytics Dashboard
                </a>
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Card({
  label,
  value,
  sub,
  badge,
  badgeColor,
}: {
  label: string;
  value: string;
  sub: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-on-surface/60">{label}</p>
        {badge && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-2xl font-headline font-bold text-on-surface mt-1">{value}</p>
      <p className="text-xs text-on-surface/50 mt-1">{sub}</p>
    </div>
  );
}

