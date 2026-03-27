"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Sikeresen feliratkoztál!");
        setEmail("");
      } else {
        toast.error("Hiba történt, próbáld újra.");
      }
    } catch {
      toast.error("Hiba történt, próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-terracotta">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"
      />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left - text + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] text-white leading-tight mb-4">
              NE MARADJ LE
              <br />
              SEMMIRŐL
            </h2>

            <p className="text-white/60 font-light text-sm leading-relaxed mb-8 max-w-md">
              Iratkozz fel hírlevelünkre és értesülj elsőként az új stílusokról,
              akciókról és exkluzív kedvezményekről. Nem spammelünk, ígérjük!
            </p>

            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@cimed.hu"
                required
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/40 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="px-6 py-3 bg-[#F5F0E8] text-carbon text-sm font-medium rounded-full hover:bg-white transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Feliratkozás"}
              </motion.button>
            </form>
          </motion.div>

          {/* Right - floating product */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative w-[300px] h-[350px]"
            >
              <Image
                src="/icons/Korababa.png"
                alt="NOLA&CO"
                fill
                className="object-contain drop-shadow-2xl opacity-80"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
