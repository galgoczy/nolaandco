"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Gift, Bell, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const benefits = [
  {
    icon: Gift,
    title: "Exkluzív kedvezmények",
    description: "Elsőként értesülsz az akciókról és egyedi kuponokról.",
  },
  {
    icon: Bell,
    title: "Új termékek",
    description: "Légy az első, aki megismeri az új stílusokat és kollekciókat.",
  },
  {
    icon: Sparkles,
    title: "Inspiráció",
    description:
      "Babaszoba tippek, ötletek és történetek más NOLA&CO szülőktől.",
  },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (res.ok) {
        setSubscribed(true);
        toast.success("Sikeresen feliratkoztál!");
      } else {
        toast.error("Hiba történt.");
      }
    } catch {
      toast.error("Hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-warm-beige min-h-screen">
        <section className="py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Mail size={28} className="text-terracotta" />
              </motion.div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-carbon">
                Csatlakozz a NOLA&CO családhoz
              </h1>
              <p className="mt-4 text-carbon-light font-light max-w-xl mx-auto">
                Iratkozz fel hírlevelünkre és ne maradj le semmiről. Heti egy
                levél, semmi spam.
              </p>
            </motion.div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center p-6 bg-warm-beige-dark rounded-2xl"
                >
                  <b.icon size={24} className="text-terracotta mx-auto mb-3" />
                  <h3 className="font-medium text-sm text-carbon mb-1">
                    {b.title}
                  </h3>
                  <p className="text-xs text-carbon-light font-light">
                    {b.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Form */}
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-terracotta/5 rounded-3xl p-12 border border-terracotta/10"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-4xl mb-4"
                >
                  💌
                </motion.div>
                <h2 className="font-display text-2xl text-carbon mb-2">
                  Köszönjük a feliratkozást!
                </h2>
                <p className="text-carbon-light font-light text-sm">
                  Hamarosan küldünk egy üdvözlő levelet az e-mail címedre.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleSubmit}
                className="bg-warm-beige-dark rounded-3xl p-8 lg:p-12 max-w-lg mx-auto"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-carbon-light mb-1">
                      Neved (opcionális)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Kis Anna"
                      className="w-full px-4 py-2.5 bg-white border border-terracotta/10 rounded-xl text-sm focus:outline-none focus:border-terracotta/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-carbon-light mb-1">
                      E-mail cím <span className="text-accent-red">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@cimed.hu"
                      required
                      className="w-full px-4 py-2.5 bg-white border border-terracotta/10 rounded-xl text-sm focus:outline-none focus:border-terracotta/30 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-terracotta text-white text-sm font-medium rounded-full hover:bg-terracotta-dark transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? "Feliratkozás..." : "Feliratkozás"}
                  </button>
                </div>
                <p className="mt-4 text-[10px] text-carbon-light/60 text-center">
                  A feliratkozással elfogadod az adatvédelmi tájékoztatónkat.
                  Bármikor leiratkozhatsz.
                </p>
              </motion.form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
