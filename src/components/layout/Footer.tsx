import Link from 'next/link';
import Image from 'next/image';
import CookiePreferencesLink from './CookiePreferencesLink';

const quickLinks = [
  { label: 'Emlékpárnák', href: '/termekek?category=pillow' },
  { label: 'Születési poszterek', href: '/termekek?category=poster' },
  { label: 'Kalandköpenyek', href: '/termekek?category=cape' },
  { label: 'Koronák', href: '/termekek?category=crown' },
  { label: 'Válogatások', href: '/termekek?category=bundle' },
  { label: 'Ajándékkártya', href: '/termekek/nola-digitalis-ajandekkartya' },
  { label: 'Nektek', href: '/nektek' },
  { label: 'Rólunk', href: '/rolunk' },
];

const infoLinks = [
  { label: 'GYIK', href: '/gyik' },
  { label: 'Szállítás és fizetés', href: '/szallitas' },
  { label: 'Elállás és visszaküldés', href: '/visszakuldes' },
  { label: 'ÁSZF', href: '/aszf' },
  { label: 'Adatkezelési tájékoztató', href: '/adatkezeles' },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/nolaandco' },
  { label: 'Instagram', href: 'https://www.instagram.com/nolaandco.baby/' },
  { label: 'E-mail', href: 'mailto:hello@nolaandco.hu?subject=Érdeklődés%20a%20Nola%26Co%20weboldalról' },
  { label: 'Kapcsolat', href: '/kapcsolat' },
  { label: 'Kollaboráció', href: '/kollaboracio' },
];

export default function Footer() {
  return (
    <footer className="bg-[#F5F4EF] w-full pt-20 pb-10 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {/* GYORS LINKEK */}
          <div>
            <h5 className="text-[#B48D76] tracking-[0.15em] font-semibold text-xs mb-8">
              GYORS LINKEK
            </h5>
            <ul className="space-y-4 font-manrope text-sm text-[#B48D76]">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="footer-link hover:text-[#4A4A4A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* INFORMACIOK */}
          <div>
            <h5 className="text-[#B48D76] tracking-[0.15em] font-semibold text-xs mb-8">
              INFORMÁCIÓK
            </h5>
            <ul className="space-y-4 font-manrope text-sm text-[#B48D76]">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="footer-link hover:text-[#4A4A4A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesLink />
              </li>
            </ul>
          </div>

          {/* KAPCSOLODJUNK */}
          <div>
            <h5 className="text-[#B48D76] tracking-[0.15em] font-semibold text-xs mb-8">
              KAPCSOLÓDJUNK
            </h5>
            <ul className="space-y-4 font-manrope text-sm text-[#B48D76]">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="footer-link hover:text-[#4A4A4A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* Bottom Logo + Copyright */}
        <div className="pt-8 border-t border-[#B48D76]/10 flex flex-col items-center gap-4">
          <Image
            src="/images/logo-wide.svg"
            alt="Nola & Co."
            width={120}
            height={15}
            className="opacity-60"
          />
          <p className="text-[#B48D76] text-sm font-light tracking-wide">
            &copy; 2026 Nola &amp; Co. | hello@nolaandco.hu
          </p>
        </div>
      </div>
    </footer>
  );
}
