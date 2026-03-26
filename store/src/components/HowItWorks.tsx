"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Válaszd ki a stílust",
    description:
      "Böngészd végig az Angyalbaba és Korababa stílusainkat. Válaszd ki, melyik illik leginkább a kisbabádhoz.",
    icon: "/icons/Egyedi.png",
    color: "from-terracotta/20 to-terracotta/5",
  },
  {
    number: "02",
    title: "Add meg az adatokat",
    description:
      "Töltsd ki a születési adatokat: név, dátum, súly, hossz. Ezek kerülnek a párnára gyönyörű hímzéssel.",
    icon: "/icons/Kézzel készült.png",
    color: "from-accent-red/15 to-accent-red/5",
  },
  {
    number: "03",
    title: "Mi elkészítjük neked",
    description:
      "Kézzel készítjük el a párnádat prémium anyagokból. 5-7 munkanapon belül szállítjuk, díszdobozban.",
    icon: "/icons/Szállítás.png",
    color: "from-terracotta/15 to-terracotta/5",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      id="hogyan-keszul"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Terracotta parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-terracotta -z-10"
      />

      {/* Decorative shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="absolute top-20 -left-20 w-60 h-60 rounded-full border border-white/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
        className="absolute bottom-20 -right-20 w-80 h-80 rounded-full border border-dashed border-white/5"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-white/60 font-light">
            Egyszerű folyamat
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mt-3">
            Három egyszerű lépés
            <br />
            <span className="text-warm-beige-dark">a NOLA-párnáig</span>
          </h2>
          <div className="mt-6 w-16 h-[1px] bg-white/30 mx-auto" />
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="group"
            >
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/10 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                {/* Step number */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative inline-flex items-center justify-center w-16 h-16 mb-6"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300`} />
                  <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={28}
                      height={28}
                    />
                  </div>
                </motion.div>

                {/* Number indicator */}
                <div className="absolute top-6 right-8 font-display text-6xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
                  {step.number}
                </div>

                <h3 className="text-xl font-display font-medium text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-white/70 font-light leading-relaxed">
                  {step.description}
                </p>

                {/* Connector line (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 border-t border-dashed border-white/20" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="#parnak"
            className="inline-flex items-center px-8 py-4 bg-white text-terracotta text-sm font-medium tracking-wider rounded-full hover:bg-warm-beige hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            KEZDJÜK EL
            <motion.span
              className="ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
