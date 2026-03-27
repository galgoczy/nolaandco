"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Válaszd ki a formát – ORIGIN vagy NOVA",
    details: [
      "ORIGIN: a magzati állapotot idéző, oldalt fekvő pozíció",
      "NOVA: lendületesebb, dinamikusabb, hason fekvő pozíció",
    ],
  },
  {
    number: "02",
    title: "Dönts a stílusról – CORE, LINEA vagy ATELIER",
    details: [
      "CORE: skandináv minimalizmus",
      "LINEA: megszakítás nélküli vonalvezetés",
      "ATELIER: kézműves részletgazdagság",
    ],
  },
  {
    number: "03",
    title: "Add meg a születési adatokat – NÉV, DÁTUM, SÚLY, HOSSZ",
    details: [
      "Ezt követően mi 5-8 nap alatt elkészítjük a párnát és postázzuk számodra",
    ],
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      id="stilusok"
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      {/* Terracotta background with parallax */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-terracotta -z-10"
      />

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] text-white leading-tight">
            HÁROM EGYSZERŰ LÉPÉS A
            <br />
            NOLA-PÁRNÁIG
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-white/70 font-light text-sm max-w-2xl mx-auto mb-16"
        >
          Párnáinkat két különböző formában és három grafikai stílusban tudod
          megrendelni, hogy mindenki megtalálja azt, ami hozzá a legközelebb áll
        </motion.p>

        {/* Steps - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col"
            >
              {/* Number badge - rounded square like design */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-[72px] h-[72px] bg-[#F5F0E8]/90 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
              >
                <span className="text-2xl font-light text-carbon-light">
                  {step.number}
                </span>
              </motion.div>

              {/* Title */}
              <h3 className="text-lg font-display text-white mb-3 leading-snug">
                {step.title}
              </h3>

              {/* Details */}
              <div className="space-y-1.5">
                {step.details.map((detail, j) => (
                  <p key={j} className="text-sm text-white/60 font-light leading-relaxed">
                    {detail}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <a
            href="#parnak"
            className="inline-block px-10 py-3.5 bg-[#c8d8e4]/80 text-carbon text-sm font-medium tracking-wider rounded-full hover:bg-[#c8d8e4] transition-all duration-300 hover:shadow-lg italic"
          >
            Kezdd el a tervezést!
          </a>
        </motion.div>
      </div>
    </section>
  );
}
