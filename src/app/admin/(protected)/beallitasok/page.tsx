export const dynamic = 'force-dynamic';

import { isUrgentEnabled } from '@/lib/urgentProduction.server';
import { SELLERS, SELLER_CUTOVER } from '@/lib/sellers';
import { getActiveSeller, getSellerSetting } from '@/lib/sellers.server';
import UrgentToggle from './UrgentToggle';
import SellerSelect from './SellerSelect';

export default async function AdminSettingsPage() {
  const [urgentEnabled, sellerSetting, activeSeller] = await Promise.all([
    isUrgentEnabled(),
    getSellerSetting(),
    getActiveSeller(),
  ]);
  const cutover = SELLER_CUTOVER.toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">Beállítások</h1>
      <UrgentToggle initial={urgentEnabled} />
      <SellerSelect
        initial={sellerSetting}
        activeName={activeSeller.legalName}
        options={[
          {
            value: 'auto',
            label: 'Automatikus',
            hint: `${cutover} előtt ${SELLERS.kriszti.legalName}, utána ${SELLERS.gergely.legalName}.`,
          },
          { value: 'gergely', label: SELLERS.gergely.legalName, hint: `Adószám: ${SELLERS.gergely.taxNumber}` },
          { value: 'kriszti', label: SELLERS.kriszti.legalName, hint: `Adószám: ${SELLERS.kriszti.taxNumber}` },
        ]}
        keyStatus={Object.values(SELLERS).map((s) => ({ name: s.legalName, ok: !!process.env[s.agentKeyEnv] }))}
      />
    </div>
  );
}
