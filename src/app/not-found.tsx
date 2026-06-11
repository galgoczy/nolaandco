import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="min-h-[80vh] bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="montserrat-light-caps text-8xl text-outline-variant mb-6">
          404
        </p>
        <h1 className="font-headline font-medium text-2xl text-carbon mb-4">
          Az oldal nem található
        </h1>
        <p className="text-carbon-light font-body mb-10">
          A keresett oldal nem létezik vagy áthelyezésre került.
        </p>
        <Button href="/">Vissza a főoldalra</Button>
      </div>
    </section>
  );
}
