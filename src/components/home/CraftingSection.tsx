import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function CraftingSection() {
  return (
    <section className="py-24 md:py-32 bg-[#C4A591] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Images */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              <div className="img-reveal aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX16NBVxrK1zL3KlA4O7BZSdZq-F6wpixhxb5_Cs4egvz4lbBVwPj37MP_VPYe9MW3O5Twb2Q2EjHMpcxKbYeUqD8lSjNE6vhFjmKwjgyKoS9tk-mf5tn5fD_y5b2wNEXZKrmDJOoSLSBaNawidOqcA7ZZj3jpfYPYLCDk4yv7xzoqLZgV3VksLmg_TpXsD80Gm3hUogtqWONxlxmmKSoBla3q8dIYXy_65EXkClobdQ5PtlAY2dFAOdz_xyHJgtpmNGBzMnKggPT4"
                  alt="Linen fabric"
                  width={600}
                  height={750}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="img-pop absolute -bottom-8 -right-8 w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-8 border-[#C4A591] hidden md:block">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuChXwBrpap9w8WX3xWx-zksNs3sCE7CHCNPWlOaVm7TK94yqykM-iiQI0eNomvWeRa0YLtCr0MO1aNffikjzvUHXHvC7wA2F_ThuYmISVraf1HAzoEI4lPKNWD7SldK8xoWcvn-zBCSQVqkTt354tByFmN7u_HBRU3ldm3O5azMW-hsoVWVTu0BwVZbTH-1mqux8bLluVAsUjHseDbdUEQ7iSTanqD7e3QpXdeG5nou0QjwnzJyNbEBus9lIH4fLPmDcVuuFEjPUIu_"
                  alt="Artisanal hands"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right: Text content */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <RevealOnScroll>
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-[#FDFBF7] mb-4">
                Crafting Excellence
              </h2>
            </RevealOnScroll>
            <RevealOnScroll>
              <h3 className="text-4xl md:text-5xl montserrat-light-caps text-[#FDFBF7] mb-8 leading-tight">
                HOGYAN KÉSZÜL?
              </h3>
            </RevealOnScroll>
            <div className="space-y-12">
              <RevealOnScroll>
                <p className="text-xl text-[#FDFBF7]/90 font-light leading-relaxed">
                  Every piece in the Nola &amp; Co collection is a testament to mindful creation.
                  We believe that what touches your baby&apos;s skin should be as pure as their first breath.
                </p>
              </RevealOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-[#FDFBF7] text-3xl">eco</span>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-[#FDFBF7]">
                      OEKO-TEX Certified
                    </h4>
                    <p className="text-sm text-[#FDFBF7]/80 leading-relaxed">
                      Standard 100 materials.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-[#FDFBF7] text-3xl">health_and_safety</span>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-[#FDFBF7]">
                      Hypoallergenic
                    </h4>
                    <p className="text-sm text-[#FDFBF7]/80 leading-relaxed">
                      For sensitive newborn skin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
