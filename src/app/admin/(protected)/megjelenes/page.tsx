export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { SITE_IMAGE_SLOTS } from '@/lib/siteImages';
import { SITE_TEXT_SLOTS } from '@/lib/siteTexts';
import SiteImageManager from './SiteImageManager';
import SiteTextManager from './SiteTextManager';

export default async function AdminSiteImagesPage() {
  const [imageRows, textRows] = await Promise.all([
    prisma.siteImage.findMany(),
    prisma.siteText.findMany(),
  ]);
  const imageOverrides: Record<string, string> = {};
  imageRows.forEach((r) => {
    imageOverrides[r.key] = r.url;
  });
  const textOverrides: Record<string, string> = {};
  textRows.forEach((r) => {
    textOverrides[r.key] = r.value;
  });

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">Megjelenés</h1>
      <p className="text-sm text-on-surface/60 mb-6 max-w-2xl">
        A főoldal blokkjainak képei és szövegei. A módosítás legfeljebb egy percen belül
        megjelenik az oldalon. (A termékfotókat a Termékek, a kategóriaoldalak képeit a
        Kategóriák menüben kezelheted.)
      </p>

      <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Képek</h2>
      <SiteImageManager slots={SITE_IMAGE_SLOTS} overrides={imageOverrides} />

      <h2 className="text-xl font-headline font-bold text-on-surface mt-10 mb-4">Szövegek</h2>
      <SiteTextManager slots={SITE_TEXT_SLOTS} overrides={textOverrides} />
    </div>
  );
}
