export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import BannerEditor from './BannerEditor';

export default async function AdminBannerPage() {
  const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-on-surface mb-6">Szalagcím</h1>
      <p className="text-sm text-on-surface/60 font-body mb-6">
        Az aktív szalagcím a sticky menüsor fölött jelenik meg. Egyszerre csak egy lehet aktív.
      </p>
      <BannerEditor
        initial={banners.map((b) => ({
          id: b.id,
          text: b.text,
          textColor: b.textColor,
          bgColor: b.bgColor,
          href: b.href ?? '',
          bold: b.bold,
          active: b.active,
          endsAt: b.endsAt ? b.endsAt.toISOString().slice(0, 16) : '',
        }))}
      />
    </div>
  );
}
