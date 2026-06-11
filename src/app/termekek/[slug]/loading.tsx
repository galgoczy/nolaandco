// Azonnali skeleton a terméklaphoz, amíg az adatbázis-lekérdezés fut.
export default function TermekLoading() {
  return (
    <section className="pt-4 pb-16 md:pt-8 md:pb-24 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-x-16 animate-pulse">
          <div className="w-full lg:w-1/2">
            <div className="aspect-[3/4] max-w-[470px] mx-auto lg:ml-auto lg:mr-0 rounded-sm bg-surface-container-low" />
          </div>
          <div className="w-full lg:w-1/2 space-y-6 mt-12 lg:mt-0">
            <div className="h-9 w-3/4 rounded bg-surface-container-low" />
            <div className="h-7 w-1/3 rounded bg-surface-container-low" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-surface-container-low" />
              <div className="h-4 w-full rounded bg-surface-container-low" />
              <div className="h-4 w-2/3 rounded bg-surface-container-low" />
            </div>
            <div className="h-32 rounded-2xl bg-surface-container-low" />
            <div className="h-12 rounded-full bg-surface-container-low" />
          </div>
        </div>
      </div>
    </section>
  );
}
