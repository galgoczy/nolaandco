import StorageManager from './StorageManager';

export const dynamic = 'force-dynamic';

/** Blob-tárhely: kihasználtság, árva fájlok törlése. */
export default function StoragePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface">Tárhely</h1>
        <p className="text-sm text-on-surface/60 mt-1 max-w-2xl">
          A feltöltött képek és videók tárhelye (Vercel Blob, Hobby-csomagon 1 GB). Árva az a fájl,
          amelyre egyetlen termék, kategória, alias vagy megjelenés-kép sem hivatkozik — például egy
          lecserélt termékkép régi példánya. Ezek biztonságosan törölhetők.
        </p>
      </div>
      <StorageManager />
    </div>
  );
}
