// Azonnali skeleton a terméklistázáshoz, amíg az adatbázis-lekérdezés fut.
export default function TermekekLoading() {
  return (
    <section className="pt-6 md:pt-10 pb-20 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-sm bg-surface-container-low mb-3" />
              <div className="h-4 w-2/3 mx-auto rounded bg-surface-container-low mb-2" />
              <div className="h-3 w-1/3 mx-auto rounded bg-surface-container-low" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
