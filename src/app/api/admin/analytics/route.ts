import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export const dynamic = 'force-dynamic';

function getClient() {
  const credentialsJson = process.env.GA_SERVICE_ACCOUNT_KEY;
  if (!credentialsJson) return null;

  try {
    const credentials = JSON.parse(credentialsJson);
    return new BetaAnalyticsDataClient({ credentials });
  } catch {
    return null;
  }
}

const PROPERTY_ID = process.env.GA_PROPERTY_ID || ''; // numeric GA4 property ID

export async function GET() {
  const client = getClient();
  if (!client || !PROPERTY_ID) {
    return NextResponse.json(
      { error: 'Google Analytics nincs konfigurálva. Állítsd be a GA_SERVICE_ACCOUNT_KEY és GA_PROPERTY_ID env változókat.' },
      { status: 503 }
    );
  }

  try {
    // Run all reports in parallel
    const [realtimeRes, overviewRes, pagesRes, sourcesRes, dailyRes] = await Promise.all([
      // Realtime active users
      client.runRealtimeReport({
        property: `properties/${PROPERTY_ID}`,
        metrics: [{ name: 'activeUsers' }],
      }),

      // Last 30 days overview
      client.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
      }),

      // Top pages (last 30 days)
      client.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),

      // Traffic sources (last 30 days)
      client.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),

      // Daily visitors (last 30 days)
      client.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      }),
    ]);

    // Parse realtime
    const realtimeUsers = Number(realtimeRes[0]?.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    // Parse overview
    const overviewRow = overviewRes[0]?.rows?.[0]?.metricValues ?? [];
    const overview = {
      users: Number(overviewRow[0]?.value ?? 0),
      sessions: Number(overviewRow[1]?.value ?? 0),
      pageViews: Number(overviewRow[2]?.value ?? 0),
      avgSessionDuration: Math.round(Number(overviewRow[3]?.value ?? 0)),
      bounceRate: Math.round(Number(overviewRow[4]?.value ?? 0) * 100),
    };

    // Parse top pages
    const pages = (pagesRes[0]?.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? '',
      views: Number(row.metricValues?.[0]?.value ?? 0),
      users: Number(row.metricValues?.[1]?.value ?? 0),
    }));

    // Parse traffic sources
    const sources = (sourcesRes[0]?.rows ?? []).map((row) => ({
      source: row.dimensionValues?.[0]?.value ?? '(direct)',
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      users: Number(row.metricValues?.[1]?.value ?? 0),
    }));

    // Parse daily visitors
    const daily = (dailyRes[0]?.rows ?? []).map((row) => {
      const raw = row.dimensionValues?.[0]?.value ?? '';
      const date = raw.length === 8
        ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
        : raw;
      return {
        date,
        users: Number(row.metricValues?.[0]?.value ?? 0),
        sessions: Number(row.metricValues?.[1]?.value ?? 0),
      };
    });

    return NextResponse.json({
      realtimeUsers,
      overview,
      pages,
      sources,
      daily,
    });
  } catch (error) {
    console.error('GA Data API error:', error);
    return NextResponse.json(
      { error: 'Nem sikerült lekérdezni a Google Analytics adatokat.' },
      { status: 500 }
    );
  }
}
