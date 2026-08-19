import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Értesítés törölve | Nola & Co',
  robots: { index: false },
};

export default function ErtesitesTorolvePage() {
  return (
    <section className="min-h-[70vh] bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-headline font-medium text-2xl text-carbon mb-4">
          Töröltük az értesítést
        </h1>
        <p className="text-carbon-light font-body mb-10">
          Az e-mail címedet eltávolítottuk, erről a termékről nem küldünk több üzenetet.
        </p>
        <Button href="/termekek">Vissza a termékekhez</Button>
      </div>
    </section>
  );
}
