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

function formatPrice(amount: number) {
  return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft';
}

export default function StatisztikakPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'sales' | 'analytics'>('sales');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
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
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <p className="text-sm text-on-surface/60 mb-4">
              A Google Analytics valós idejű adatait közvetlenül a GA felületen érheted el.
              Az alábbi linkekkel gyorsan hozzáférhetsz a legfontosabb riportokhoz:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GaLink
                label="Valós idejű nézet"
                description="Ki van most az oldalon?"
                href="https://analytics.google.com/analytics/web/#/p/G-XQ02YFVB9M/realtime/overview"
              />
              <GaLink
                label="Felhasználók áttekintése"
                description="Látogatók, munkamenetek, oldalmegtekintések"
                href="https://analytics.google.com/analytics/web/#/p/G-XQ02YFVB9M/reports/reportinghub"
              />
              <GaLink
                label="Forgalmi források"
                description="Honnan érkeznek a látogatók?"
                href="https://analytics.google.com/analytics/web/#/p/G-XQ02YFVB9M/reports/explorer?params=_u..nav%3Dmaui&r=lifecycle-traffic-acquisition-v2"
              />
              <GaLink
                label="Oldalak és képernyők"
                description="Melyik oldal a legnépszerűbb?"
                href="https://analytics.google.com/analytics/web/#/p/G-XQ02YFVB9M/reports/explorer?params=_u..nav%3Dmaui&r=all-pages-and-screens"
              />
            </div>
          </div>
          <p className="text-xs text-on-surface/40 text-center">
            A GA4 property ID: G-XQ02YFVB9M · A részletes analitika elérhető a{' '}
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google Analytics
            </a>{' '}
            dashboardon.
          </p>
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

function GaLink({ label, description, href }: { label: string; description: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl border border-outline-variant/30 hover:border-primary/30 hover:bg-primary/5 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className="text-sm font-medium text-on-surface">{label}</span>
      </div>
      <p className="text-xs text-on-surface/50">{description}</p>
    </a>
  );
}
