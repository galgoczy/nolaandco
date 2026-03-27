"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const faqCards = [
  {
    question: "MIKOR KAPOM MEG A RENDELÉSEMET?",
    answer:
      "Mivel minden Nola termék egyedileg, az általad megadott születési adatok alapján készül, a gyártási időnk 5-8 munkanap. Amint a termék elkészült, azonnal átadjuk a futárnak, amiről e-mailben értesítünk.",
    stars: 5,
    author: null,
    date: null,
  },
  {
    question: "TÖKÉLETES AJÁNDÉK",
    answer:
      "Keresztelőre rendeltük és hatalmas sikere volt! A minőség csodálatos, a hímzés gyönyörű és a díszdoboz is nagyon elegáns. Mindenképpen ajánlom mindenkinek, aki egyedi és különleges ajándékot keres.",
    stars: 5,
    author: "Katalin M.",
    date: "2026.01.15.",
  },
  {
    question: "GYÖNYÖRŰ KIVITELEZÉS",
    answer:
      "Már a második párnát rendeltem és ugyanolyan elégedett vagyok, mint az elsővel. Az anyag puha, a hímzés precíz, és a szállítás is gyors volt. Köszönjük a csodás munkát!",
    stars: 5,
    author: "Réka B.",
    date: "2026.02.08.",
  },
];

export default function FAQ() {
  return (
    <section id="gyik" className="bg-[#fdfbf7] py-24">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading font-light text-[48px] tracking-[4.8px] text-center text-[#333] uppercase"
        >
          GYAKRAN ISMÉTELT KÉRDÉSEK
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-sans text-center text-[#4a4a4a] max-w-2xl mx-auto mt-4 leading-relaxed"
        >
          Ha felmerül benned bármilyen kérdés, kérlek olvasd át a gyakran
          ismételt kérdéseket, ahol igyekeztünk minél több kérdést megválaszolni.
          Ha mégsem találtad meg azt, amit kerestél, bátran írj nekünk:{" "}
          <a
            href="mailto:hello@nolaandco.hu"
            className="text-[#a93832] hover:underline transition-colors"
          >
            hello@nolaandco.hu
          </a>
        </motion.p>

        {/* FAQ cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {faqCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-warm-beige-dark/30 rounded-2xl p-10 min-h-[287px] flex flex-col"
            >
              {/* Question title */}
              <h3 className="font-sans font-bold text-sm uppercase tracking-widest text-[#B48D76]">
                {card.question}
              </h3>

              {/* Star rating */}
              <div className="flex gap-1 mt-3">
                {Array.from({ length: card.stars }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="text-hero-btn/60 fill-hero-btn/60"
                  />
                ))}
              </div>

              {/* Answer text */}
              <p className="font-sans text-[14px] text-[#4a4a4a] leading-relaxed mt-4 flex-1">
                {card.answer}
              </p>

              {/* Author / date footer for testimonial cards */}
              {card.author && (
                <>
                  <div className="border-t border-[#e5e5e5] mt-6 pt-4 flex items-center justify-between">
                    <span className="font-sans text-[13px] font-bold text-[#333]">
                      {card.author}
                    </span>
                    <span className="font-sans text-[13px] text-[#4a4a4a]">
                      {card.date}
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
