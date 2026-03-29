import Link from 'next/link';
import Image from 'next/image';

const quickLinks = [
  { label: 'Főoldal', href: '/' },
  { label: 'Rólunk', href: '/rolunk' },
  { label: 'Origin', href: '/termekek?series=origin' },
  { label: 'Nova', href: '/termekek?series=nova' },
  { label: 'Poszter', href: '/termekek?category=poster' },
  { label: 'Ajándékkártya', href: '/ajandek' },
];

const infoLinks = [
  { label: 'GYIK', href: '/gyik' },
  { label: 'Szállítás és fizetés', href: '/szallitas' },
  { label: 'Elállás és visszaküldés', href: '/visszakuldes' },
  { label: 'Kapcsolat', href: '/kapcsolat' },
  { label: 'ÁSZF', href: '/aszf' },
  { label: 'Adatkezelési tájékoztató', href: '/adatkezeles' },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'E-mail', href: 'mailto:hello@nolaandco.hu' },
  { label: 'Kollaboráció', href: '/kollaboracio' },
];

export default function Footer() {
  return (
    <footer className="bg-[#F5F4EF] w-full pt-20 pb-10 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Left: Logo + Newsletter heading */}
          <div className="md:col-span-6 space-y-6">
            <div>
              <Image
                src="/images/logo.svg"
                alt="Nola & Co."
                width={140}
                height={46}
              />
            </div>
            <div>
              <h5 className="text-[#B48D76] tracking-widest font-headline font-semibold text-xl">
                HÍRLEVÉL
              </h5>
            </div>
          </div>

          {/* GYORS LINKEK */}
          <div className="md:col-span-2">
            <h5 className="text-[#B48D76] tracking-[0.15em] font-semibold text-xs mb-8">
              GYORS LINKEK
            </h5>
            <ul className="space-y-4 font-manrope text-sm text-[#B48D76]">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="footer-link hover:text-[#A93832] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* INFORMACIOK */}
          <div className="md:col-span-2">
            <h5 className="text-[#B48D76] tracking-[0.15em] font-semibold text-xs mb-8">
              INFORMÁCIÓK
            </h5>
            <ul className="space-y-4 font-manrope text-sm text-[#B48D76]">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="footer-link hover:text-[#A93832] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* KAPCSOLODJUNK */}
          <div className="md:col-span-2">
            <h5 className="text-[#B48D76] tracking-[0.15em] font-semibold text-xs mb-8">
              KAPCSOLÓDJUNK
            </h5>
            <ul className="space-y-4 font-manrope text-sm text-[#B48D76]">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="footer-link hover:text-[#A93832] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#B48D76]/10 text-center">
          <p className="text-[#B48D76] text-sm font-light tracking-wide">
            &copy; 2026 Nola &amp; Co. Nordic Serenity. | hello@nolaandco.hu
          </p>
        </div>
      </div>
    </footer>
  );
}
