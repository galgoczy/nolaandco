'use client';

import { useEffect, useState } from 'react';

/**
 * Kliensoldali lekérdezés: választható-e most a sürgősségi elkészítés.
 * `null`, amíg a válasz meg nem jön — addig a felület nem kínálja fel.
 * `active = false` esetén nem kérdez (pl. nem párna termékoldalon).
 */
export function useUrgentProductionEnabled(active = true): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    if (!active) return;
    let alive = true;
    fetch('/api/urgent-production', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => {
        if (alive) setEnabled(d.enabled === true);
      })
      .catch(() => {
        if (alive) setEnabled(false);
      });
    return () => {
      alive = false;
    };
  }, [active]);
  return enabled;
}
