'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

function FaqLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors">
      {children}
    </Link>
  );
}

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const faqItems: FaqItem[] = [
  {
    question: 'Hogyan adhatom meg a baba születési adatait?',
    answer:
      'A termékoldalon, a kosárba helyezés előtt találsz egy űrlapot. Kérjük, ide írd be a baba nevét, születési dátumát és idejét (opcionális), súlyát és hosszát. Fontos, hogy pontosan ellenőrizd az adatokat, mert a párnát/posztert ezek alapján készítjük el!',
  },
  {
    question: 'Más méretben is elérhető a párna?',
    answer:
      'Jelenleg 44 és 61 cm között tudod beállítani a baba hosszát. Ha ettől eltérő méretet szeretnél rendelni, csak írd be a megjegyzés rovatba!',
  },
  {
    question: 'Módosíthatom a születési adatokat a rendelés után?',
    answer: (
      <>Kérjük, a megrendelés véglegesítése előtt ellenőrizd az adatokat! Mivel a gyártás a rendelés leadása után nem sokkal elindul, módosításra csak az első 12 órában van lehetőség a <a href="mailto:rendeles@nolaandco.hu" className="text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors">rendeles@nolaandco.hu</a> címen.</>
    ),
  },
  {
    question: 'Az 1:1 méretarány mit jelent?',
    answer:
      'Azt jelenti, hogy a párna hossza megegyezik a babád születéskori testhosszával. A sziluett arányait pedig úgy terveztük, hogy az élethűen tükrözze a baba formáját.',
  },
  {
    question: 'Honnan tudom, hogy mekkora lesz a párna?',
    answer:
      'A párna hossza egyezik a megadott születési hosszal. Az arányokat a legmodernebb grafikai programokkal állítjuk be, hogy a baba „sziluettje" élethű maradjon minden méretnél. A párnákat úgy mérjük, mint születéskor a kórházakban a babákat, kissé végigvezetve a baba vonalain, tehát a feje búbjától a talpáig (varrástól varrásig). Kérlek, ezt vedd figyelembe, amikor esetleg otthon ellenőrzöd a kapott terméket. A párnák a hossztól függően átlagosan 300 g súlyúak.',
  },
  {
    question: 'Mosható a párna?',
    answer:
      'Igen! A teljes párna mosható mosógépben a hipoallergén, csomósodásmentes töltetnek köszönhetően. Kérlek, használd a kímélő programot (max 30°C), majd fektetve, levegőn szárítsd!',
  },
  {
    question: 'Vasalhatom a mintát?',
    answer:
      'TILOS! A sziluett és a születési adatok speciális, hőérzékeny technológiával kerülnek a párnára, a közvetlen hő (vasaló) károsíthatja a nyomatot. Kérlek, a minta környékét kerüld el a vasalóval!',
  },
  {
    question: 'Szárítógépben szárítható?',
    answer:
      'Kérjük, ne tedd szárítógépbe! A magas hőfok tönkre teheti a plüss anyagot és a minta épségét is. A levegőn, fektetve történő szárítás a legjobb megoldás.',
  },
  {
    question: 'Milyen szállítási módok közül választhatok?',
    answer:
      'Kényelmes csomagautomatás átvétel (Foxpost/Packeta) vagy házhozszállítás.',
  },
  {
    question: 'Fizethetek utánvéttel?',
    answer:
      'Mivel minden termékünk egyedi, névre szóló megrendelésre készül, az utánvétes fizetést sajnos nem tudjuk biztosítani. A rendeléseket bankkártyás fizetéssel (Stripe) vagy átutalással tudod kiegyenlíteni.',
  },
  {
    question: 'Mikor kapom meg a rendelésemet?',
    answer:
      'Mivel minden Nola termék egyedileg, az általad megadott születési adatok alapján készül, a gyártási időnk 5-8 munkanap. Amint a termék elkészült, azonnal átadjuk a futárnak, amiről e-mailben értesítünk. (Kiemelt időszakokban előfordulhat, hogy pár napos csúszással kell számolni a gyártásban, de erről előre tájékoztatunk.)',
  },
  {
    question: 'Tudok ajándékba venni párnát vagy posztert, ha még nem született meg a baba?',
    answer: (
      <>Persze! Erre a célra hoztuk létre a <FaqLink href="/termekek/nola-ajandekkartya">Digitális Ajándékkártyát</FaqLink>, ami egy kreatív és különleges ajándék. Így a megajándékozott akkor rendelheti meg a neki tetsző terméket, amikor már pontosan tudja a baba születési adatait.</>
    ),
  },
  {
    question: 'Küldhetek-e üzenetet a rendelésem mellé?',
    answer:
      'Természetesen! Minden rendelés mellé egy névre szóló köszönőkártyát teszünk, amin akár a te személyes üzenetedet is feltüntetjük, ha ajándékba küldöd a terméket. Ezt a rendelés megjegyzés rovatában tudod megadni.',
  },
  {
    question: 'Miért a „Csak dekoráció" figyelmeztetés a párnán?',
    answer:
      'A biztonsági előírások szerint csecsemőknek 1 éves kor alatt nem ajánlott a párna használata alvás közben. A Nola & Co. párnák babaszoba-dekorációnak és emlékőrzőnek készültek, kérjük, ennek megfelelően használd őket!',
  },
  {
    question: 'Hova szállítotok?',
    answer: (
      <>Jelenleg Magyarországon belül szállítunk, de dolgozunk a nemzetközi bővítésen. Iratkozz fel a <FaqLink href="/hirlevel">hírlevelünkre</FaqLink>, és értesítünk, ha elindult a külföldi szállítás!</>
    ),
  },
];

export default function FaqSection() {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-3xl mx-auto px-8">
        <div className="text-center mb-16">
          <RevealOnScroll>
            <h2 className="text-4xl md:text-5xl montserrat-light-caps text-carbon mb-6 leading-tight">
              GYAKRAN ISMÉTELT KÉRDÉSEK
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <p className="text-carbon-light max-w-2xl mx-auto font-light leading-relaxed">
              Ha nem találtad meg a választ, bátran írj nekünk:{' '}
              <a href="mailto:hello@nolaandco.hu" className="underline hover:text-[#C4A591] transition-colors">
                hello@nolaandco.hu
              </a>
            </p>
          </RevealOnScroll>
        </div>

        <div className="divide-y divide-[#4A4A4A]/10">
          {faqItems.map((item, i) => {
            const isOpen = openSet.has(i);
            return (
              <RevealOnScroll key={i} delay={Math.min(i * 60, 600)}>
                <div>
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between py-5 text-left gap-4 group"
                  >
                    <span className="text-[#C4A591] font-medium text-sm md:text-base leading-snug group-hover:text-[#4A4A4A] transition-colors">
                      {item.question}
                    </span>
                    <span className="text-[#C4A591] text-xl flex-shrink-0 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                      +
                    </span>
                  </button>
                  <div
                    className="accordion-body overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="text-[#4A4A4A] text-sm font-light leading-relaxed pb-5">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
