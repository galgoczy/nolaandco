import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Rólunk – Nola & Co.',
  description: 'A Nola & Co. története – egyedi születési emlékpárnák és poszterek szeretettel.',
};

export default function RolunkPage() {
  return (
    <section className="min-h-screen bg-warm-beige py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4 text-center">
            A Nola & Co. története
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-12" />
        </RevealOnScroll>

        <div className="space-y-8 text-carbon-light font-body text-base leading-relaxed">
          <RevealOnScroll>
            <h2 className="text-xl text-carbon font-medium mb-3">
              Minden egy meg nem érkezett csomaggal kezdődött.
            </h2>
            <p>
              Amikor megszületett az első kisfiam, az interneten találkoztam egy különleges
              születési emlékpárnával. Szerettem volna rendelni egyet – valamit, ami az érkezése
              pillanatát őrzi, méretben és jellegében. Ám hiába kerestem, hazai webshopokban
              nem találtam ahhoz hasonlót, külföldről pedig nem szállítottak Magyarországra.
              Így már akkor felmerült bennem a gondolat, hogy én készítsek ilyesmi „időkapszulákat".
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <p>
              Aztán megérkezett a második kisfiam, és az érzés, az igény még erősebb lett.
              Úgy gondoltam, ha ez a lehetőség még mindig nem elérhető itthon, akkor ez egy
              jel: nekem kell megteremtenem.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <h2 className="text-xl text-carbon font-medium mb-3 mt-12">
              Miért varrok én?
            </h2>
            <p>
              A Nola & Co. nem csupán egy márka. Ez egy családi örökség, ami végre értelmet nyer.
              Az édesapám varrodát (is) vezetett, az egyik nagymamám pedig varrónőként végzett –
              így a tű és a cérna bizonyos értelemben mindig is ott voltak a levegőben körülöttem,
              csak rájuk kellett találnom és elindulni ezen az úton.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <p>
              Rendszerszemléletű rendezvényszervezőként és két kisfiú anyukájaként pontosan tudom,
              milyen apróságok adják egy pillanat tökéletességét, és azt is, milyen gyorsan repülnek
              el ezek a napok, hetek. Így célom volt, hogy valamennyire mégis kézzel foghatóvá tegyem
              ezeket az emlékeket. Innen pedig már nem kellett sok ahhoz, hogy más termékötletek is
              megszülessenek a fejemben.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <p>
              Minden egyes termék, ami kikerül a műhelyünkből, egy gondosan megtervezett, szeretettel
              kreált &ldquo;időkapszula&rdquo;. Nem csupán dísztárgyat készítünk, hanem egy kivonatot
              abból a csodából, ami által a család létrejött.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <p className="mt-12 italic text-carbon">
              Köszönöm, hogy engeditek, hogy részese lehessek a Ti történeteteknek is.
            </p>
            <p className="mt-4 text-carbon font-medium">
              Kriszti
            </p>
            <p className="text-sm text-carbon-light">
              A Nola & Co. alapítója
            </p>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
