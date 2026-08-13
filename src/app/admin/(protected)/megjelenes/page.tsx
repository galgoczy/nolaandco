export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { SITE_IMAGE_SLOTS } from '@/lib/siteImages';
import SiteImageManager from './SiteImageManager';

export default async function AdminSiteImagesPage() {
  const rows = await prisma.siteImage.findMany();
  const overrides: Record<string, string> = {};
  rows.forEach((r) => {
    overrides[r.key] = r.url;
  });

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">Megjelenés</h1>
      <p className="text-sm text-on-surface/60 mb-6 max-w-2xl">
        A főoldal statikus szekcióinak képei. A csere azonnal él; a &bdquo;Vissza az
        eredetire&rdquo; a beépített képet állítja vissza. (A termékfotókat a Termékek, a
        kategóriaoldalak képeit a Kategóriák menüben kezelheted.)
      </p>
      <SiteImageManager slots={SITE_IMAGE_SLOTS} overrides={overrides} />
    </div>
  );
}
