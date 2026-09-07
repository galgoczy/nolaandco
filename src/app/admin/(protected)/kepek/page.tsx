import VariantBackfill from './VariantBackfill';

export const dynamic = 'force-dynamic';

/**
 * Képváltozatok: a Blobban tárolt termék- és megjelenés-képekhez a kiszolgált
 * méretek (640/1080/1920 px, AVIF + WebP) utólagos legyártása. Az új
 * feltöltéseknél ez automatikusan megtörténik.
 */
export default function ImagesAdminPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface">Képváltozatok</h1>
        <p className="text-sm text-on-surface/60 mt-1 max-w-2xl">
          A látogatók nem az eredeti fotót kapják, hanem a belőle készült, méretre szabott AVIF
          (tartalékként WebP) változatot közvetlenül a tárhelyről. Az eredetik érintetlenül
          megmaradnak. Itt a korábban feltöltött képekhez gyárthatók le a hiányzó változatok.
        </p>
      </div>
      <VariantBackfill />
    </div>
  );
}
