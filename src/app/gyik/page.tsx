import FaqSection from '@/components/home/FaqSection';

export const metadata = {
  title: 'Gyakran Ismételt Kérdések – Nola & Co.',
  description: 'Válaszok a leggyakrabban feltett kérdésekre a Nola & Co. termékeiről és rendelésről.',
};

export default function GyikPage() {
  return (
    <main>
      <FaqSection />
    </main>
  );
}
