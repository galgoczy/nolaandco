"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Mennyi idő alatt készül el a párna?",
    answer:
      "Minden párnát kézzel készítünk, ezért a szokásos elkészítési idő 5-7 munkanap. Sürgős megrendelés esetén kérd az expressz elkészítést, amely 2-3 munkanap.",
  },
  {
    question: "Mosható a párna?",
    answer:
      "Igen! A NOLA&CO párnák 30°C-on, kímélő programmal mosógépben moshatók. Szárítógépbe ne tedd, természetes szárítást javaslunk. A hímzés tartós és mosásálló.",
  },
  {
    question: "Milyen anyagból készül?",
    answer:
      "Kizárólag Oeko-Tex Standard 100 tanúsított, 100% pamut anyagot használunk. A töltőanyag hipoallergén poliészter, ami bababiztos és tartja a formáját.",
  },
  {
    question: "Módosíthatom a megrendelést?",
    answer:
      "A rendelés leadásától számított 24 órán belül módosíthatod az adatokat. Keress minket e-mailben vagy Instagramon, és segítünk a változtatásban.",
  },
  {
    question: "Van lehetőség csomagolásra ajándékba?",
    answer:
      "A Prémium párnáink díszdobozban érkeznek. Az alap párnákhoz is kérhetsz ajándékcsomagolást +990 Ft-ért, ami tartalmaz egy szép dobozot és üdvözlőkártyát.",
  },
  {
    question: "Hogyan történik a szállítás?",
    answer:
      "GLS futárszolgálattal szállítunk egész Magyarországon. A szállítási idő 1-2 munkanap az elkészülést követően. 15 000 Ft felett ingyenes a szállítás!",
  },
  {
    question: "Vissza lehet küldeni?",
    answer:
      "Egyedi termékeink miatt visszaküldési jogot alapvetően nem tudunk biztosítani, de ha minőségi problémát tapasztalsz, természetesen cseréljük vagy visszatérítjük.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="gyik" className="py-24 lg:py-32 bg-warm-beige">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-terracotta font-light">
            Kérdéseid vannak?
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-carbon mt-3">
            Gyakori kérdések
          </h2>
          <div className="mt-6 w-16 h-[1px] bg-terracotta mx-auto" />
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 bg-warm-beige-dark rounded-2xl hover:bg-terracotta/5 transition-all duration-300 group"
              >
                <span className="text-left text-sm font-medium text-carbon group-hover:text-terracotta transition-colors">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown
                    size={18}
                    className="text-carbon-light group-hover:text-terracotta transition-colors"
                  />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 text-sm text-carbon-light font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
