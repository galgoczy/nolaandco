'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface SearchProduct {
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  category: string | null;
}

interface SearchPage {
  title: string;
  description: string;
  href: string;
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [pages, setPages] = useState<SearchPage[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setProducts([]);
      setPages([]);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setProducts([]);
      setPages([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setProducts(data.products || []);
        setPages(data.pages || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasResults = products.length > 0 || pages.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="icon-hover text-[#C4A591] hover:text-[#4A4A4A]"
        aria-label="Keresés"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 md:pt-32">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-carbon-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Keresés termékek és oldalak között..."
                className="flex-1 text-sm text-carbon bg-transparent outline-none placeholder:text-carbon-light/60"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-carbon-light hover:text-carbon transition-colors"
                aria-label="Bezárás"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="px-6 py-8 text-center text-sm text-carbon-light">
                  Keresés...
                </div>
              )}

              {!loading && query.length >= 2 && !hasResults && (
                <div className="px-6 py-8 text-center text-sm text-carbon-light">
                  Nincs találat &ldquo;{query}&rdquo; kifejezésre.
                </div>
              )}

              {!loading && products.length > 0 && (
                <div className="px-6 py-4">
                  <h3 className="text-xs font-semibold text-carbon-light uppercase tracking-wider mb-3">
                    Termékek
                  </h3>
                  <div className="space-y-2">
                    {products.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/termekek/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-carbon truncate">{p.name}</p>
                          <p className="text-xs text-carbon-light">{formatPrice(p.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!loading && pages.length > 0 && (
                <div className="px-6 py-4 border-t border-outline-variant/10">
                  <h3 className="text-xs font-semibold text-carbon-light uppercase tracking-wider mb-3">
                    Oldalak
                  </h3>
                  <div className="space-y-1">
                    {pages.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        onClick={() => setOpen(false)}
                        className="block p-3 rounded-xl hover:bg-surface-container transition-colors"
                      >
                        <p className="text-sm font-medium text-carbon">{p.title}</p>
                        <p className="text-xs text-carbon-light mt-0.5">{p.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
