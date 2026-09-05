'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pickPrize, makeCode, PROMO_CONTACT_EMAIL, type Prize } from '@/lib/promoPrizes';

/**
 * Kaparós nyereményszelvény.
 *
 * A "fólia" egy canvas a nyeremény fölött: a kaparás `destination-out`
 * radírral lyukat töröl bele, így alatta tényleg előbukkan a nyeremény.
 * Amikor a felület ~55%-a lekopott, a maradék magától felfeslik, konfetti
 * hullik, és a nyereménykártya megpattan. Mobilon érintéssel működik
 * (a kaparás közben az oldal nem görgethet), egérrel is húzható.
 *
 * Két mód:
 *  - `demo`: a nyeremény a böngészőben sorsolódik, újrahúzható (a /pici-piac
 *    bemutatóoldal).
 *  - `card`: a QR-kódos vásári kártya. Az első érintéskor a szerver sorsol
 *    és a kártyához köti a nyereményt (POST /api/promo/start); ha a kártya
 *    már ki van kaparva (`initial`), a nyeremény fólia nélkül, azonnal
 *    látszik. Felfedés után a vendég elküldheti magának e-mailben.
 */

type Props = {
  mode?: 'demo' | 'card';
  token?: string;
  /** Már kikapart kártya állapota — ilyenkor nincs fólia, nincs sorsolás. */
  initial?: { prize: Prize; code: string; email: string | null } | null;
};

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

export default function ScratchCard({ mode = 'demo', token, initial = null }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const foilRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);
  const measuring = useRef(false);
  const revealedRef = useRef(!!initial);
  const prizeRef = useRef<Prize | null>(initial?.prize ?? null);
  const startRequested = useRef(false);
  const pendingReveal = useRef(false);

  const [prize, setPrize] = useState<Prize | null>(initial?.prize ?? null);
  const [code, setCode] = useState(initial?.code ?? '');
  const [revealed, setRevealed] = useState(!!initial);
  const [copied, setCopied] = useState(false);
  const [startError, setStartError] = useState('');

  // E-mail küldés (csak kártya módban).
  const [emailValue, setEmailValue] = useState('');
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [emailError, setEmailError] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(initial?.email ?? null);

  // Demó: a sorsolás mountoláskor, hogy a szerver-render determinisztikus maradjon.
  useEffect(() => {
    if (mode === 'demo') {
      const p = pickPrize();
      prizeRef.current = p;
      setPrize(p);
      setCode(makeCode());
    }
  }, [mode]);

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
    if (revealedRef.current) return; // már kikapart kártya: nincs fólia
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
    // Kártya módban a nyeremény a szervertől jön; ha még úton van, várunk rá.
    if (!prizeRef.current) {
      pendingReveal.current = true;
      return;
    }
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

  /** Kártya mód: az első érintéskor a szerver sorsol és a kártyához köt. */
  const startCard = useCallback(async () => {
    if (mode !== 'card' || !token || startRequested.current) return;
    startRequested.current = true;
    setStartError('');
    try {
      const res = await fetch('/api/promo/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.prize) {
        startRequested.current = false;
        setStartError(data.error || 'Nem sikerült betölteni a kártyát. Próbáld újra.');
        return;
      }
      prizeRef.current = data.prize;
      setPrize(data.prize);
      setCode(data.code);
      if (data.email) setSentTo(data.email);
      if (pendingReveal.current) {
        pendingReveal.current = false;
        reveal();
      }
    } catch {
      startRequested.current = false;
      setStartError('Nem sikerült betölteni a kártyát. Próbáld újra.');
    }
  }, [mode, token, reveal]);

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
    const p = pickPrize();
    prizeRef.current = p;
    setPrize(p);
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

  const sendEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token) return;
      setEmailError('');
      setEmailState('sending');
      try {
        const res = await fetch('/api/promo/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email: emailValue }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setEmailError(data.error || 'A küldés nem sikerült.');
          setEmailState('idle');
          return;
        }
        setSentTo(emailValue.trim().toLowerCase());
        setEmailState('sent');
      } catch {
        setEmailError('A küldés nem sikerült. Próbáld újra.');
        setEmailState('idle');
      }
    },
    [token, emailValue],
  );

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
        style={{
          animation: revealed && !initial ? 'prizeGlow 2.4s ease-in-out 2' : undefined,
          boxShadow: '0 10px 40px rgba(74,74,74,0.14)',
        }}
      >
        <div ref={wrapRef} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FBF8F4]">
          {/* A nyeremény — a fólia alatt, kaparással bukkan elő. */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center ${revealed ? 'prize-pop' : ''}`}
            style={revealed && !initial ? { animation: 'prizePop 650ms cubic-bezier(0.22, 1.4, 0.4, 1) both' } : undefined}
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
                  style={revealed && !initial ? { animation: 'codePulse 1.6s ease-in-out 1.2s 2' } : undefined}
                >
                  <p className="text-[10px] tracking-[0.18em] text-[#B48D76] font-semibold mb-0.5">
                    {prize.kind === 'coupon' ? 'KUPONKÓDOD' : 'ÁTVÉTELI KÓDOD'}
                  </p>
                  <p className="font-mono font-bold text-lg text-[#4A4A4A] tracking-wider">{code}</p>
                </div>
              </>
            )}
          </div>

          {/* A kaparható fólia. Már kikapart kártyánál nem is renderelődik. */}
          {!initial && (
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
                // Kártya mód: az első érintés indítja a sorsolást a szerveren.
                startCard();
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
          )}
        </div>

        {startError && (
          <p className="px-3 pt-3 text-sm text-red-500 text-center">{startError}</p>
        )}

        {revealed && prize && (
          <div className="px-3 pt-3 pb-1 text-center space-y-3">
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
                nyereményed! 💝 Ha már nem vagy a vásáron, írj nekünk az átvételi
                kódoddal:{' '}
                <a href={`mailto:${PROMO_CONTACT_EMAIL}`} className="underline text-[#8A6A52]">
                  {PROMO_CONTACT_EMAIL}
                </a>
              </p>
            )}

            {/* E-mail küldés — csak a vásári kártyánál. */}
            {mode === 'card' && (
              <div className="pt-2 border-t border-[#E0DAD1]">
                {sentTo && emailState !== 'sending' && (
                  <p className="text-sm text-green-800 mt-3">
                    ✓ Elküldtük ide: <span className="font-medium">{sentTo}</span>
                  </p>
                )}
                {emailState !== 'sent' && (
                  <form onSubmit={sendEmail} className="mt-3 space-y-2">
                    <p className="text-xs text-[#4A4A4A]/60">
                      {sentTo ? 'Küldés másik címre:' : 'Küldd el magadnak, hogy meglegyen később is:'}
                    </p>
                    <input
                      type="email"
                      required
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      placeholder="E-mail cím"
                      aria-label="E-mail cím"
                      className="w-full rounded-xl border border-[#E0DAD1] px-4 py-3 text-sm focus:outline-none focus:border-[#C4A591]"
                    />
                    <button
                      type="submit"
                      disabled={emailState === 'sending'}
                      className="w-full rounded-2xl border-2 border-[#C4A591] text-[#8A6A52] hover:bg-[#F7F1EA] transition-colors font-semibold text-sm tracking-wide py-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {emailState === 'sending' ? 'Küldés…' : 'Elküldöm magamnak'}
                    </button>
                    {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                    <p className="text-[11px] text-[#4A4A4A]/50">
                      Egyetlen levelet küldünk a nyereményeddel, hírlevélre nem iratkozol fel.
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {mode === 'demo' && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={reset}
            className="text-sm text-[#B48D76] hover:text-[#4A4A4A] underline underline-offset-2 transition-colors cursor-pointer"
          >
            Új szelvény kaparása (demó)
          </button>
        </div>
      )}
    </div>
  );
}
