export const dynamic = 'force-dynamic';

import { isUrgentEnabled } from '@/lib/urgentProduction.server';
import UrgentToggle from './UrgentToggle';

export default async function AdminSettingsPage() {
  const urgentEnabled = await isUrgentEnabled();

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">Beállítások</h1>
      <UrgentToggle initial={urgentEnabled} />
    </div>
  );
}
