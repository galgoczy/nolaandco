export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AliasEditor from './AliasEditor';

export default async function AdminAliasesPage() {
  const aliases = await prisma.productAlias.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface">Termék aliasok</h1>
      </div>

      <p className="text-sm text-on-surface/60 mb-6 font-body max-w-2xl">
        Az aliasok „landing kártyák", amelyek a főoldalon és a termékek között külön termékként
        jelennek meg, de egy canonical termékre mutatnak (pl. a canonical <em>Poszter</em>-re).
        Az alias beállítja, hogy a tervezőben melyik design legyen alapból kiválasztva, amikor
        a látogató az adott kártyáról érkezik.
      </p>

      <div className="space-y-4">
        {aliases.length === 0 ? (
          <p className="text-sm text-on-surface/60 font-body">Nincsenek aliasok.</p>
        ) : (
          aliases.map((alias) => (
            <AliasEditor
              key={alias.id}
              alias={{
                id: alias.id,
                slug: alias.slug,
                name: alias.name,
                imageUrl: alias.imageUrl,
                badge: alias.badge,
                targetProductSlug: alias.targetProductSlug,
                defaultLayoutId: alias.defaultLayoutId,
                sortOrder: alias.sortOrder,
                active: alias.active,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
