'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Kaparós nyereményszelvény (demó).
 *
 * A "fólia" egy canvas a nyeremény fölött: a kaparás `destination-out`
 * radírral lyukat töröl bele, így alatta tényleg előbukkan a nyeremény.
 * Amikor a felület ~55%-a lekopott, a maradék magától felfeslik, konfetti
 * hullik, és a nyereménykártya megpattan. Mobilon érintéssel működik
 * (a kaparás közben az oldal nem görgethet), egérrel is húzható.
 */

type Prize = {
  id: string;
  weight: number;
  kind: 'coupon' | 'item';
  /** A nagy vizuál a kártyán: százalék vagy embléma. */
  big: string;
  label: string;
  desc: string;
};

const PRIZES: Prize[] = [
  { id: 'kupon10', weight: 38, kind: 'coupon', big: '10%', label: '10% kedvezmény', desc: 'a teljes rendelésedre' },
  { id: 'kupon15', weight: 22, kind: 'coupon', big: '15%', label: '15% kedvezmény', desc: 'a teljes rendelésedre' },
  { id: 'szallitas', weight: 18, kind: 'coupon', big: '🚚', label: 'Ingyenes szállítás', desc: 'a következő rendelésedre' },
  { id: 'hush', weight: 13, kind: 'item', big: '🧸', label: 'NOLA Hush szundikendő', desc: 'választható színben, a standon átvehető' },
  { id: 'pixie', weight: 9, kind: 'item', big: '🦋', label: 'NOLA Pixie pillangó függő', desc: 'a standon átvehető' },
];

function pickPrize(): Prize {
  const total = PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * total;
  for (const p of PRIZES) {
    roll -= p.weight;
    if (roll <= 0) return p;
  }
  return PRIZES[0];
}

/** Egyedi kinézetű kód — összetéveszthető karakterek (0/O, 1/I/L) nélkül. */
function makeCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) out += '-';
  }
  return 'PICI-' + out;
}

/** Konfetti a márka színeivel — könnyű, könyvtár nélküli megoldás. */
function fireConfetti(canvas: HTMLCanvasElement, originY: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ['#C4A591', '#B48D76', '#E8C9A0', '#8FAF8B', '#F7D6C4', '#FFFFFF'];
  const cx = window.innerWidth / 2;
  const parts: {
    x: number; y: number; vx: number; vy: number;
    rot: number; vr: number; w: number; h: number; color: string; life: number;
  }[] = [];
  for (let i = 0; i < 160; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const speed = 6 + Math.random() * 9;
    parts.push({
      x: cx + (Math.random() - 0.5) * 120,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      color: colors[i % colors.length],
      life: 150 + Math.random() * 60,
    });
  }

  let frame = 0;
  function tick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of parts) {
      if (frame > p.life) continue;
      alive++;
      p.vy += 0.16;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - frame / p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (alive > 0 && frame < 260) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
  requestAnimationFrame(tick);
}

export default function ScratchCard() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const foilRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);
  const measuring = useRef(false);
  const revealedRef = useRef(false);

  const [prize, setPrize] = useState<Prize | null>(null);
  const [code, setCode] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // A sorsolás mountoláskor történik, hogy a szerver-render determinisztikus maradjon.
  useEffect(() => {
    setPrize(pickPrize());
    setCode(makeCode());
  }, []);

  /** A fólia megrajzolása: rose-gold felület, fénycsíkok, felirat. */
  const drawFoil = useCallback(() => {
    const canvas = foilRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, '#DCC0AB');
    grad.addColorStop(0.5, '#C4A591');
    grad.addColorStop(1, '#AC8368');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Átlós fénycsíkok, hogy fóliásan csillogjon.
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = '#FFFFFF';
    for (let x = -rect.height; x < rect.width; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 16, 0);
      ctx.lineTo(x + 16 + rect.height * 0.6, rect.height);
      ctx.lineTo(x + rect.height * 0.6, rect.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Apró szemcsék.
    for (let i = 0; i < 130; i++) {
      ctx.globalAlpha = 0.05 + Math.random() * 0.14;
      ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#8A6A52';
      ctx.beginPath();
      ctx.arc(Math.random() * rect.width, Math.random() * rect.height, 0.7 + Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '700 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('✨ KAPARD LE! ✨', rect.width / 2, rect.height / 2 - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '400 14px system-ui, -apple-system, sans-serif';
    ctx.fillText('Húzd az ujjad a felületen', rect.width / 2, rect.height / 2 + 24);
  }, []);

  useEffect(() => {
    drawFoil();
    const onResize = () => {
      // Elforgatásnál újrarajzolunk; a megkezdett kaparás elvész, de a
      // szelvény nem törik el. Felfedés után már nincs mit rajzolni.
      if (!revealedRef.current) drawFoil();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawFoil]);

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    try {
      navigator.vibrate?.(60);
    } catch {
      /* nem támogatott — nem baj */
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && confettiRef.current && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      fireConfetti(confettiRef.current, rect.top + rect.height / 2);
    }
  }, []);

  /** Mennyi kopott le? Ritkított mintavétel, hogy mobilon se akadjon. */
  const measure = useCallback(() => {
    const canvas = foilRef.current;
    if (!canvas || measuring.current || revealedRef.current) return;
    measuring.current = true;
    requestAnimationFrame(() => {
      measuring.current = false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let total = 0;
      // Minden 8. pixel alfáját nézzük — bőven elég pontos.
      for (let i = 3; i < data.length; i += 32) {
        total++;
        if (data[i] < 128) clear++;
      }
      if (total > 0 && clear / total > 0.55) reveal();
    });
  }, [reveal]);

  const scratchTo = useCallback((clientX: number, clientY: number, connect: boolean) => {
    const canvas = foilRef.current;
    if (!canvas || revealedRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 44;
    ctx.beginPath();
    if (connect && lastPoint.current) {
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    lastPoint.current = { x, y };
    strokes.current++;
    if (strokes.current % 6 === 0) measure();
  }, [measure]);

  const reset = useCallback(() => {
    revealedRef.current = false;
    setRevealed(false);
    setCopied(false);
    setPrize(pickPrize());
    setCode(makeCode());
    lastPoint.current = null;
    strokes.current = 0;
    // A canvas előbb kapja vissza az átlátszatlanságot, aztán rajzolunk.
    requestAnimationFrame(drawFoil);
  }, [drawFoil]);

  const copy = useCallback(() => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      })
      .catch(() => {
        /* régi böngésző — a kód kézzel is kijelölhető */
      });
  }, [code]);

  return (
    <div className="w-full max-w-[430px] select-none" data-revealed={revealed ? 'true' : 'false'}>
      {/* Keyframe-ek csak ehhez az oldalhoz. */}
      <style>{`
        @keyframes prizePop {
          0% { transform: scale(0.82); opacity: 0.6; }
          55% { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes prizeGlow {
          0%, 100% { box-shadow: 0 10px 40px rgba(196,165,145,0.35); }
          50% { box-shadow: 0 10px 56px rgba(196,165,145,0.65); }
        }
        @keyframes codePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @media (prefers-reduced-motion: reduce) {
          .prize-pop, .code-pulse { animation: none !important; }
        }
      `}</style>

      {/* Konfetti a teljes képernyőn, kattintást nem fog el. */}
      <canvas
        ref={confettiRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none z-50"
        aria-hidden
      />

      <div
        className="relative rounded-3xl bg-white p-3"
        style={{ animation: revealed ? 'prizeGlow 2.4s ease-in-out 2' : undefined, boxShadow: '0 10px 40px rgba(74,74,74,0.14)' }}
      >
        <div ref={wrapRef} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FBF8F4]">
          {/* A nyeremény — a fólia alatt, kaparással bukkan elő. */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center ${revealed ? 'prize-pop' : ''}`}
            style={revealed ? { animation: 'prizePop 650ms cubic-bezier(0.22, 1.4, 0.4, 1) both' } : undefined}
          >
            {prize && (
              <>
                <p className="text-[#B48D76] tracking-[0.2em] font-semibold text-[11px] mb-2">
                  GRATULÁLUNK, NYERTÉL! 🎉
                </p>
                <div
                  className="font-headline font-bold text-[#4A4A4A] leading-none mb-2"
                  style={{ fontSize: prize.big.length <= 4 ? '3.4rem' : '3rem' }}
                >
                  {prize.big}
                </div>
                <p className="font-headline font-bold text-lg text-[#4A4A4A]">{prize.label}</p>
                <p className="font-body text-sm text-[#4A4A4A]/60 mt-1">{prize.desc}</p>

                <div
                  className="code-pulse mt-4 rounded-xl border-2 border-dashed border-[#C4A591] bg-[#F7F1EA] px-5 py-2.5"
                  style={revealed ? { animation: 'codePulse 1.6s ease-in-out 1.2s 2' } : undefined}
                >
                  <p className="text-[10px] tracking-[0.18em] text-[#B48D76] font-semibold mb-0.5">
                    {prize.kind === 'coupon' ? 'KUPONKÓDOD' : 'ÁTVÉTELI KÓDOD'}
                  </p>
                  <p className="font-mono font-bold text-lg text-[#4A4A4A] tracking-wider">{code}</p>
                </div>
              </>
            )}
          </div>

          {/* A kaparható fólia. */}
          <canvas
            ref={foilRef}
            className="absolute inset-0 cursor-crosshair"
            style={{
              opacity: revealed ? 0 : 1,
              transition: 'opacity 700ms ease-out',
              pointerEvents: revealed ? 'none' : 'auto',
              touchAction: 'none',
              WebkitTouchCallout: 'none',
            }}
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              scratchTo(e.clientX, e.clientY, false);
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1 && e.pointerType === 'mouse') return;
              if (!lastPoint.current) return;
              scratchTo(e.clientX, e.clientY, true);
            }}
            onPointerUp={() => {
              lastPoint.current = null;
              measure();
            }}
            onPointerCancel={() => {
              lastPoint.current = null;
            }}
          />
        </div>

        {revealed && prize && (
          <div className="px-3 pt-3 pb-1 text-center">
            {prize.kind === 'coupon' ? (
              <button
                type="button"
                onClick={copy}
                className="w-full rounded-2xl bg-[#8B5E7E] hover:opacity-90 transition-opacity text-white font-semibold text-sm tracking-wide py-3 cursor-pointer"
              >
                {copied ? '✓ Kimásolva!' : 'Kód másolása'}
              </button>
            ) : (
              <p className="font-body text-sm text-[#4A4A4A]/75 leading-relaxed">
                Mutasd fel ezt a képernyőt a Nola &amp; Co standnál, és vidd el a
                nyereményed! 💝
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={reset}
          className="text-sm text-[#B48D76] hover:text-[#4A4A4A] underline underline-offset-2 transition-colors cursor-pointer"
        >
          Új szelvény kaparása (demó)
        </button>
      </div>
    </div>
  );
}
