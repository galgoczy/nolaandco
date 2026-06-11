# Nola & Co — Beüzemelési útmutató (Vercel)

Ez az útmutató a webshop Vercelen történő beüzemelését írja le lépésről lépésre. A hosting **Vercel**, az adatbázis **Neon PostgreSQL**, az admin auth **Google OAuth (NextAuth)**.

---

## Előfeltételek

Mielőtt elkezded, szükséged lesz egy fiókra mindhárom szolgáltatásnál (mind ingyenes):

- **Vercel** → https://vercel.com (GitHub fiókkal célszerű belépni)
- **Neon** → https://neon.tech (PostgreSQL adatbázis)
- **Google Cloud** → https://console.cloud.google.com (OAuth admin auth-hoz)

Ajánlott (de nem kötelező) a **Vercel CLI** lokális fejlesztéshez:
```bash
npm i -g vercel
vercel login
```

---

## 1. lépés: Projekt importálása Vercelbe

1. Nyisd meg: https://vercel.com/new
2. **Import Git Repository** → válaszd ki a `galgoczy/nolaandco` repót
3. **Framework Preset**: automatikusan felismeri a Next.js-t — hagyd úgy
4. **Environment Variables** szekciót egyelőre hagyd üresen (lejjebb töltjük ki)
5. Kattints **Deploy** → várd meg az első (valószínűleg sikertelen) buildet
   > Az első build elbukhat, mert még nincsenek env var-ok. Ez normális — a 6. lépésben újra deploy-oljuk.
6. Jegyezd meg a Vercel által kiosztott domain-t (pl. `nolaandco.vercel.app`) — erre szükség lesz.

---

## 2. lépés: Neon adatbázis létrehozása

1. Nyisd meg: https://console.neon.tech
2. **Create Project**:
   - Name: `nolaandco`
   - Region: `EU Central (Frankfurt)` (Vercelhez legközelebb)
   - PostgreSQL version: legújabb
3. A létrehozás után másold ki a **Connection string**-et (Dashboard → Connection Details → pooled connection, `postgresql://...sslmode=require...`)

---

## 3. lépés: Environment változók beállítása Vercelen

Vercel Dashboard → a projekt → **Settings** → **Environment Variables**. Add hozzá a következőket (mindegyik környezethez: Production + Preview + Development):

| Változó | Érték | Honnan |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Neon connection string (2. lépés) |
| `NEXTAUTH_URL` | `https://nolaandco.vercel.app` | A saját Vercel domain-ed |
| `NEXTAUTH_SECRET` | *(random 32 char)* | `openssl rand -base64 32` |
| `ADMIN_SECRET` | *(random 32 char)* | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | *(később)* | 5. lépésben |
| `GOOGLE_CLIENT_SECRET` | *(később)* | 5. lépésben |

> `NEXTAUTH_SECRET` és `ADMIN_SECRET` generálásához futtasd terminálban:
> ```bash
> openssl rand -base64 32
> ```

A `GOOGLE_*` változókat az 5. lépésben kapod meg — addig hagyhatod üresen vagy placeholder-rel.

---

## 4. lépés: Adatbázis séma és seed

A sémát és a kezdeti adatokat lokálisan futtatjuk, de a Vercel env var-okat használva — így nincs szükség külön `.env` fájlra.

### Opció A — Vercel CLI-vel (ajánlott)

```bash
# 1. Húzd le a Vercel env var-okat lokális .env.local fájlba
vercel link            # kösd össze a projektet, ha még nincs
vercel env pull .env.local

# 2. Prisma séma push (létrehozza a táblákat Neonban)
npx prisma db push

# 3. Seed: termékek + admin felhasználók betöltése
npx tsx prisma/seed.ts
```

### Opció B — DATABASE_URL kézi beállításával

```bash
export DATABASE_URL="postgresql://...sslmode=require..."   # Neonból
npx prisma db push
npx tsx prisma/seed.ts
```

### Ellenőrzés

```bash
npx prisma studio
```

A Prisma Studio-ban ellenőrizd, hogy megjelennek:
- **9 termék** (6 párna + 2 poszter + 1 ajándékkártya)
- **3 admin felhasználó**:
  - `admin@nolaandco.hu` (jelszó: `admin123`)
  - `galgoczy.krisztina@gmail.com` (Google auth)
  - `galgoczy.gergely@gmail.com` (Google auth)

---

## 5. lépés: Google OAuth beállítása

### 5.1 Google Cloud projekt

1. Nyisd meg: https://console.cloud.google.com
2. Felső sáv → projekt dropdown → **New Project**
3. Név: `Nola and Co` → **Create**, majd válaszd ki

### 5.2 OAuth Consent Screen

1. Bal menü → **APIs & Services** → **OAuth consent screen**
2. **External** → **Create**
3. Töltsd ki:
   - App name: `Nola & Co Admin`
   - User support email: `galgoczy.krisztina@gmail.com`
   - Developer contact email: `galgoczy.krisztina@gmail.com`
4. **Save and Continue**
5. Scopes: hagyd üresen → **Save and Continue**
6. Test users → add hozzá:
   - `galgoczy.krisztina@gmail.com`
   - `galgoczy.gergely@gmail.com`
7. **Save and Continue** → **Back to Dashboard**

### 5.3 OAuth Client ID

1. **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Nola & Co Webshop`
5. **Authorized redirect URIs** — add hozzá MINDHÁROM-at:
   - `https://nolaandco.vercel.app/api/auth/callback/google` (production)
   - `https://nolaandco-*.vercel.app/api/auth/callback/google` (preview — opcionális)
   - `http://localhost:3000/api/auth/callback/google` (fejlesztés)
   > Cseréld a `nolaandco.vercel.app`-ot a saját Vercel domain-edre!
6. **Create** → másold ki a **Client ID**-t és **Client Secret**-et

### 5.4 Vercel env var-ok frissítése

Vercel Dashboard → Settings → Environment Variables → frissítsd / add hozzá:

| Változó | Érték |
|---|---|
| `GOOGLE_CLIENT_ID` | `1234...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` |

---

## 6. lépés: Redeploy és tesztelés

Env var változtatás után **mindig redeploy** szükséges (a Vercel nem automatikus itt):

1. Vercel Dashboard → **Deployments** → legutóbbi → `⋯` → **Redeploy**
2. Várd meg a sikeres buildet (✔ zöld pipa)

### Tesztelési checklist

- [ ] **Főoldal**: `https://nolaandco.vercel.app` betölt, a termékek megjelennek
- [ ] **Termékek oldal**: `/termekek` — 9 terméket lát
- [ ] **Kosár**: tudsz terméket hozzáadni és eltávolítani
- [ ] **Admin (token)**: `/admin/bejelentkezes` — `admin@nolaandco.hu` / `admin123` működik
- [ ] **Admin (Google)**: ugyanitt **Bejelentkezés Google fiókkal** → a 2 engedélyezett e-mail át tud lépni
- [ ] **Hírlevél form**: a főoldal alján a feliratkozás sikeres

> **Fontos:** amíg a Google OAuth app **"Testing"** módban van, csak a Test Users listában szereplő e-mailek tudnak bejelentkezni. Új admin hozzáadásához mind a Google Console Test Users listáját, MIND az adatbázis `AdminUser` tábláját frissíteni kell.

---

## Lokális fejlesztés

Ha lokálisan szeretnél dolgozni a projekten:

```bash
# 1. Env var-ok szinkronizálása Vercelből
vercel env pull .env.local

# 2. Fejlesztői szerver
npm install
npm run dev
```

A `.env.local` fájl sosincs commitolva (a `.gitignore` kizárja). Ha új env var-t adsz hozzá Vercelen, futtasd újra a `vercel env pull` parancsot.

---

## 7. lépés (később): Stripe fizetés

### Lépések
1. Regisztráció: https://dashboard.stripe.com
2. **Developers** → **API keys** — másold ki:
   - **Publishable key** (`pk_test_...` / `pk_live_...`)
   - **Secret key** (`sk_test_...` / `sk_live_...`)
3. **Developers** → **Webhooks** → **Add endpoint**:
   - URL: `https://nolaandco.vercel.app/api/webhook`
   - Events: `checkout.session.completed`
   - Másold ki a **Signing secret** (`whsec_...`)

### Vercel env var-ok

| Változó | Érték |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` vagy `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` vagy `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

Env var változás után **Redeploy**. Először `test` kulcsokkal teszteld, majd válts `live`-ra.

---

## 8. lépés (később): Szállítás integráció

A pénztár a következő szállítási módokat támogatja:
- **Foxpost csomagautomata** — https://foxpost.hu/uzleti-partnereinknek
- **Packeta csomagpont** — https://www.packeta.hu/uzleti-partnereknek
- **Házhozszállítás** (GLS / DPD / MPL)

Mindegyikhez szerződés és API kulcs szükséges. A Stripe beüzemelése után érdemes nekikezdeni.

---

## Összefoglaló: Vercel environment változók

| Változó | Szükséges most? | Leírás |
|---|:-:|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | A Vercel domain teljes URL-je (https://...) |
| `NEXTAUTH_SECRET` | ✅ | NextAuth titkosítási kulcs (`openssl rand -base64 32`) |
| `ADMIN_SECRET` | ✅ | Admin token aláíró kulcs (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth Client Secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | később | Stripe publikus kulcs |
| `STRIPE_SECRET_KEY` | később | Stripe titkos kulcs |
| `STRIPE_WEBHOOK_SECRET` | később | Stripe webhook aláíró kulcs |

---

## Gyakori hibák

| Hiba | Megoldás |
|---|---|
| `Build error: DATABASE_URL is not defined` | Állítsd be a `DATABASE_URL`-t Vercelen és **Redeploy** |
| Google login után `AccessDenied` | Az e-mail nincs benne az `AdminUser` táblában — futtasd újra a seedet |
| Google login `redirect_uri_mismatch` | A Google Console Authorized redirect URIs listájában nincs a pontos Vercel URL |
| NextAuth `Configuration` error | Hiányzik a `NEXTAUTH_SECRET` vagy a `NEXTAUTH_URL` nem a valódi domain |
| Env var változott de nem érvényesül | Env var módosítás után **mindig Redeploy** szükséges |
