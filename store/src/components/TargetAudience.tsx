"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function TargetAudience() {
  return (
    <section className="py-20 lg:py-28 bg-[#F5F0E8]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] text-terracotta leading-tight">
            KIKNEK TERVEZZÜK A
            <br />
            PÁRNÁKAT
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-carbon-light font-light text-sm max-w-2xl mx-auto mb-14 italic"
        >
          A Nola & Co. termékeit azért hívtuk életre, hogy visszahozzuk azt a
          semmihez sem fogható, törékeny érzést, amit egy újszülött érkezése,
          karunkban tartása ad
        </motion.p>

        {/* Bento grid layout matching design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* Row 1 */}
          {/* SZÜLŐKNEK - left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:row-span-2"
          >
            <div className="mb-4">
              <h3 className="text-lg tracking-wide text-carbon-light font-light mb-1">
                SZÜLŐKNEK
              </h3>
              <p className="text-sm text-carbon-light/70 font-light italic">
                ...akiknek túl gyorsan felnőttek a kisbabáik
              </p>
            </div>
            <div className="relative aspect-[4/5] bg-[#e8e0d6] rounded-xl overflow-hidden">
              <Image
                src="/icons/Angyalbaba.png"
                alt="Szülőknek"
                fill
                className="object-contain p-8"
              />
            </div>
          </motion.div>

          {/* ÖRÖKBEFOGADÓ SZÜLŐKNEK - center top */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg tracking-wide text-carbon font-medium mb-1">
              ÖRÖKBEFOGADÓ SZÜLŐKNEK
            </h3>
            <p className="text-sm text-carbon-light/70 font-light italic mb-4">
              ...akik számára az első ölelés váratott magára
            </p>

            {/* Features box */}
            <div className="bg-terracotta/90 rounded-xl p-6 text-white/90">
              <ul className="space-y-2.5 text-[13px] font-light">
                <li>– PRÉMIUM MINŐSÉG</li>
                <li>– OEKO-TEX TANÚSÍTOTT ALAPANYAGOK</li>
                <li>– HYPOALLERGÉN TÖLTET</li>
                <li>– MOSÓGÉPBEN MOSHATÓ</li>
                <li>– KÉZZEL, EGYEDILEG KÉSZÍTETT</li>
                <li>– MAGYAR TERMÉK</li>
              </ul>
            </div>
          </motion.div>

          {/* Right image - ÖRÖKBEFOGADÓ photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative aspect-[3/4] bg-[#e8e0d6] rounded-xl overflow-hidden"
          >
            <Image
              src="/icons/Korababa.png"
              alt="Örökbefogadó szülőknek"
              fill
              className="object-contain p-8"
            />
          </motion.div>

          {/* Row 2 */}
          {/* KORABABÁK SZÜLEINEK - center bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg tracking-wide text-carbon-light font-light mb-1">
              KORABABÁK SZÜLEINEK
            </h3>
            <p className="text-sm text-carbon-light/70 font-light italic">
              ...hogy emlékezzenek, milyen messziről indultak és mekkora utat
              jártak be
            </p>
          </motion.div>

          {/* ANGYALBABÁK + Rating */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-4">
              <h3 className="text-lg tracking-wide text-carbon-light font-light mb-1">
                ANGYALBABÁK SZÜLEINEK
              </h3>
              <p className="text-sm text-carbon-light/70 font-light italic">
                ...hogy az emlék ne csupán a szívükbe égve maradjon meg
              </p>
            </div>

            {/* Rating badge */}
            <div className="bg-[#c8d8e4]/40 rounded-xl p-6 text-center">
              <span className="text-4xl font-display text-carbon/60">4.9</span>
              <p className="text-xs text-carbon-light/50 mt-1 italic">
                előzetes visszajelzések
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
