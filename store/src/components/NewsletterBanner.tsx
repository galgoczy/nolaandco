"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
        toast.success("Sikeresen feliratkoztál! 💌");
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
    <section className="relative py-24 lg:py-32 overflow-hidden bg-terracotta">
      {/* Decorative */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs tracking-[0.3em] uppercase text-white/60 font-light">
            Maradj velünk
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-white mt-3">
            Iratkozz fel hírlevelünkre
          </h2>
          <p className="mt-4 text-white/70 font-light text-sm">
            Értesülj elsőként az új stílusokról, akciókról és exkluzív
            kedvezményekről. Nem spammelünk, ígérjük!
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@cimed.hu"
            required
            className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="px-8 py-3 bg-white text-terracotta text-sm font-medium rounded-full hover:bg-warm-beige transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Feliratkozás"}
          </motion.button>
        </motion.form>

        <p className="mt-4 text-[10px] text-white/40">
          A feliratkozással elfogadod az adatvédelmi tájékoztatónkat.
        </p>
      </div>
    </section>
  );
}
