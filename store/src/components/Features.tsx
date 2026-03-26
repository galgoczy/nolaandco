"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    icon: "/icons/Oeko.png",
    title: "Oeko-Tex tanúsított",
    description: "Minden anyagunk bababiztos, a legmagasabb európai szabványoknak megfelelő",
  },
  {
    icon: "/icons/Kézzel készült.png",
    title: "Kézzel készült",
    description: "Minden darab egyedileg, szeretettel és odafigyeléssel készül",
  },
  {
    icon: "/icons/Mosás.png",
    title: "Mosható",
    description: "30°C-on mosógépben mosható, formáját megtartja mosás után is",
  },
  {
    icon: "/icons/Eco.png",
    title: "Környezettudatos",
    description: "Fenntartható anyagok, minimális csomagolás, zöld szállítás",
  },
  {
    icon: "/icons/Biztonság.png",
    title: "Biztonságos",
    description: "CE jelölés, gyermekeknek biztonságos, allergénmentes anyagok",
  },
  {
    icon: "/icons/Örök.png",
    title: "Örök emlék",
    description: "Időtálló minőség, ami generációkon át megőrzi az emlékeket",
  },
];

export default function Features() {
  return (
    <section className="py-24 lg:py-32 bg-warm-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-terracotta font-light">
            Miért minket
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-carbon mt-3">
            Prémium minőség, egyedi kivitelezés
          </h2>
          <div className="mt-6 w-16 h-[1px] bg-terracotta mx-auto" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group text-center p-6 rounded-2xl hover:bg-warm-beige-dark transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-14 h-14 mx-auto mb-4 bg-terracotta/10 rounded-2xl flex items-center justify-center group-hover:bg-terracotta/20 transition-colors"
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={28}
                  height={28}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </motion.div>
              <h3 className="font-medium text-sm text-carbon mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-carbon-light font-light leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
