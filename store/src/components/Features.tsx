"use client";

import { motion } from "framer-motion";

export default function Features() {
  return (
    <section
      id="hogyan-keszul"
      className="bg-[#c4a591] px-8 py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left side - Images */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative"
          >
            {/* Main image placeholder */}
            <div className="relative aspect-[4/5] rounded-3xl shadow-2xl overflow-hidden bg-[#d4c4b0]">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.08) 8px, rgba(255,255,255,0.08) 9px)",
                }}
              />
            </div>

            {/* Small overlapping image */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-3xl border-8 border-[#c4a591] shadow-xl bg-[#b8a090] overflow-hidden z-10">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(255,255,255,0.1) 6px, rgba(255,255,255,0.1) 7px)",
                }}
              />
            </div>
          </motion.div>

          {/* Right side - Text content */}
          <div className="lg:col-span-7">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-sans font-extrabold text-[12px] tracking-[3.6px] uppercase text-[#fdfbf7]"
            >
              Crafting Excellence
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading font-light text-[48px] tracking-[4.8px] uppercase text-[#fdfbf7] mt-4"
            >
              HOGYAN KÉSZÜL?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans font-light text-[20px] text-[rgba(253,251,247,0.9)] leading-[32.5px] mt-4 max-w-xl"
            >
              Every piece in the Nola &amp; Co collection is a testament to
              mindful creation. We believe that what touches your baby&apos;s
              skin should be as pure as their first breath.
            </motion.p>

            {/* Feature items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 gap-8 mt-12"
            >
              {/* Item 1 - OEKO-TEX Certified */}
              <div>
                <div className="mb-3">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="#fdfbf7"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10 16.5L14 20.5L22 12.5"
                      stroke="#fdfbf7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="font-bold text-[14px] tracking-[0.7px] uppercase text-[#fdfbf7]">
                  OEKO-TEX Certified
                </p>
                <p className="text-[14px] text-[rgba(253,251,247,0.8)] mt-1">
                  Standard 100 materials.
                </p>
              </div>

              {/* Item 2 - Hypoallergenic */}
              <div>
                <div className="mb-3">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 4C16 4 6 12 6 19C6 24.5228 10.4772 28 16 28C21.5228 28 26 24.5228 26 19C26 12 16 4 16 4Z"
                      stroke="#fdfbf7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 20C12 20 14 22 16 22C18 22 20 20 20 20"
                      stroke="#fdfbf7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="font-bold text-[14px] tracking-[0.7px] uppercase text-[#fdfbf7]">
                  Hypoallergenic
                </p>
                <p className="text-[14px] text-[rgba(253,251,247,0.8)] mt-1">
                  For sensitive newborn skin.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
