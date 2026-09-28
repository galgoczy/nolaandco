import { prisma } from './prisma';

const KEY = 'urgent-production-enabled';

/**
 * Választható-e most a sürgősségi elkészítés (admin kapcsoló, szabad
 * kapacitás szerint). Ha még sosem állították be, kikapcsolt.
 */
export async function isUrgentEnabled(): Promise<boolean> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  return row?.value === 'true';
}

export async function setUrgentEnabled(enabled: boolean): Promise<void> {
  const value = enabled ? 'true' : 'false';
  await prisma.setting.upsert({
    where: { key: KEY },
    update: { value },
    create: { key: KEY, value },
  });
}
