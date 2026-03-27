"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const faqs = [
  {
    question: "MIKOR KAPOM MEG A RENDELÉSEMET?",
    answer:
      "Mivel minden Nola termék egyedileg, az általad megadott születési adatok alapján készül, a gyártási időnk 5-8 munkanap. Amint a termék elkészült, azonnal átadjuk a futárnak, amiről e-mailben értesítünk.",
    stars: 5,
  },
  {
    question: "MILYEN ANYAGOKBÓL KÉSZÜL?",
    answer:
      "Kizárólag OEKO-TEX® Standard 100 tanúsított pamut huzatot és cérnát használunk. A töltet hipoallergén, csomósodásmentes és formatartó, ami számtalan mosás után is puha marad.",
    stars: 5,
  },
  {
    question: "HOGYAN KELL MOSNI?",
    answer:
      "Mosógépben, kímélő programon, 30°C-on mosható az egész párna. Utána levegőn érdemes szárítani. A hímzés tartós és mosásálló – a formáját és szépségét megőrzi.",
    stars: 5,
  },
];

export default function FAQ() {
  return (
    <section id="gyik" className="py-20 lg:py-28 bg-[#F5F0E8]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] text-terracotta/60 leading-tight">
            GYAKRAN ISMÉTELT
            <br />
            KÉRDÉSEK
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-carbon-light/60 font-light text-sm max-w-3xl mx-auto mb-16"
        >
          Ha felmerül benned bármilyen kérdés, kérlek olvasd át a gyakran
          ismételt kérdéseket, ahol rigyekeztünk minél több kérdést megválaszolni.
          <br />
          Ha mégsem találtad meg azt, amit kerestél, bátran írj nekünk:{" "}
          <a
            href="mailto:hello@nolaandco.hu"
            className="text-terracotta hover:text-terracotta-dark transition-colors"
          >
            hello@nolaandco.hu
          </a>
        </motion.p>

        {/* FAQ cards in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-warm-beige rounded-2xl p-7 lg:p-8 border border-terracotta/5 transition-shadow duration-300 hover:shadow-lg hover:shadow-terracotta/5"
            >
              {/* Question */}
              <h3 className="text-sm font-medium tracking-wide text-carbon mb-4">
                {faq.question}
              </h3>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: faq.stars }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="text-terracotta/30 fill-terracotta/30"
                  />
                ))}
              </div>

              {/* Answer */}
              <p className="text-sm text-carbon-light font-light leading-relaxed">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
