import { prisma } from './prisma';
import { SELLERS, defaultSellerId, isSellerId, type Seller, type SellerId } from './sellers';

const KEY = 'active-seller';

/** Az admin beállítás: 'auto' (időpont szerint) vagy egy rögzített eladó. */
export type SellerSetting = 'auto' | SellerId;

export async function getSellerSetting(): Promise<SellerSetting> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const value = row?.value;
  return isSellerId(value) ? value : 'auto';
}

export async function setSellerSetting(value: SellerSetting): Promise<void> {
  await prisma.setting.upsert({
    where: { key: KEY },
    update: { value },
    create: { key: KEY, value },
  });
}

/** Az éppen aktív eladó — ez kerül az új rendelésekre és a jogi szövegekbe. */
export async function getActiveSeller(): Promise<Seller> {
  const setting = await getSellerSetting();
  return SELLERS[setting === 'auto' ? defaultSellerId() : setting];
}
