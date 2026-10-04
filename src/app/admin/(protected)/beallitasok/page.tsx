export const dynamic = 'force-dynamic';

import { isUrgentEnabled } from '@/lib/urgentProduction.server';
import { SELLERS, SELLER_CUTOVER } from '@/lib/sellers';
import { getActiveSeller, getSellerSetting } from '@/lib/sellers.server';
import UrgentToggle from './UrgentToggle';
import SellerSelect from './SellerSelect';
import WeightedSettings from './WeightedSettings';
import { prisma } from '@/lib/prisma';
import { getWeightedConfig } from '@/lib/weightedPillow.server';

export default async function AdminSettingsPage() {
  const [urgentEnabled, sellerSetting, activeSeller, weightedConfig, pillows] = await Promise.all([
    isUrgentEnabled(),
    getSellerSetting(),
    getActiveSeller(),
    getWeightedConfig(),
    prisma.product.findMany({
      where: { category: 'pillow' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, active: true, weightedEnabled: true, weightedMaxGrams: true },
    }),
  ]);
  // Miért nem rendelhető most a súlyarányos változat (az admin számára).
  const weightedProblems: string[] = [];
  if (weightedConfig.status === 'unavailable') weightedProblems.push('A rendelhetőség „Nem rendelhető”.');
  if (!weightedConfig.maxGrams) weightedProblems.push('Nincs érvényes központi súlymaximum.');
  if (!weightedConfig.price) weightedProblems.push('Nincs megadva ár.');
  if (weightedConfig.status === 'preorder' && !weightedConfig.info.trim())
    weightedProblems.push('Előrendelésnél kötelező a várható elkészítési/feladási tájékoztató.');
  if (!pillows.some((p) => p.weightedEnabled)) weightedProblems.push('Egyik párnánál sincs engedélyezve.');
  const cutover = SELLER_CUTOVER.toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">Beállítások</h1>
      <UrgentToggle initial={urgentEnabled} />
      <WeightedSettings
        initial={weightedConfig}
        problems={weightedProblems}
        pillows={pillows.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: `${p.name}${p.active ? '' : ' (inaktív)'}`,
          enabled: p.weightedEnabled,
          maxOverride: p.weightedMaxGrams,
        }))}
      />
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
