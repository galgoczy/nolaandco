"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const audiences = [
  {
    title: "Kismamáknak",
    description:
      "Készülj a legszebb ajándékkal a kisbabád érkezésére. Egyedi párna, ami örökre megőrzi a születés pillanatát.",
    icon: "/icons/Angyalbaba.png",
    tag: "Saját babádnak",
  },
  {
    title: "Nagyszülőknek",
    description:
      "Az unoka érkezése különleges pillanat. Ajándékozz olyan emléket, ami generációkon át megmarad.",
    icon: "/icons/Korababa.png",
    tag: "Unokának",
  },
  {
    title: "Babaváró ajándéknak",
    description:
      "A legtökéletesebb ajándék babaváró partira vagy keresztelőre. Minden darab egyedi és személyre szóló.",
    icon: "/icons/Minőség.png",
    tag: "Ajándékba",
  },
];

export default function TargetAudience() {
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
            Kinek ajánljuk
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-carbon mt-3">
            Kinek tervezzük a párnákat?
          </h2>
          <div className="mt-6 w-16 h-[1px] bg-terracotta mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="group relative bg-warm-beige-dark rounded-3xl p-8 lg:p-10 text-center border border-transparent hover:border-terracotta/20 transition-all duration-500 hover:shadow-xl"
            >
              {/* Tag */}
              <span className="absolute top-4 right-4 text-[10px] tracking-wider uppercase bg-terracotta/10 text-terracotta px-3 py-1 rounded-full">
                {item.tag}
              </span>

              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              >
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={40}
                  height={40}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </motion.div>

              <h3 className="font-display text-xl font-medium text-carbon mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-carbon-light font-light leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
