# Nola & Co — Beüzemelési útmutató

## 1. Adatbázis (Neon PostgreSQL)

### 1.1 Vercel environment változók beállítása

Menj a Vercel Dashboard → Settings → Environment Variables, és add hozzá:

| Változó | Érték |
|---------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_MOZnqAiI7mK0@ep-sweet-moon-agb6umfb-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |

> Ez a connection string a Neon DB-ből származik. Ha már beállítottad, ezt a lépést kihagyhatod.

### 1.2 Adatbázis séma létrehozása

Futtasd terminálban (lokálisan, a projekt mappájából):

```bash
# 1. Állítsd be a DATABASE_URL-t lokálisan is
export DATABASE_URL="postgresql://neondb_owner:npg_MOZnqAiI7mK0@ep-sweet-moon-agb6umfb-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# 2. Prisma séma push (táblákat létrehozza az adatbázisban)
npx prisma db push

# 3. Seed: feltölti a termékeket és admin felhasználókat
npx tsx prisma/seed.ts
```

### 1.3 Ellenőrzés

```bash
# Prisma Studio megnyitása (böngészőben nézegetheted az adatbázist)
npx prisma studio
```

Ellenőrizd, hogy megjelennek-e:
- **9 termék** (6 párna + 2 poszter + 1 ajándékkártya)
- **3 admin felhasználó**:
  - `admin@nolaandco.hu` (jelszó: `admin123`)
  - `galgoczy.krisztina@gmail.com` (Google auth)
  - `galgoczy.gergely@gmail.com` (Google auth)

---

## 2. Google OAuth beállítása (admin bejelentkezéshez)

### 2.1 Google Cloud projekt létrehozása

1. Nyisd meg: https://console.cloud.google.com
2. Kattints a felső sávban a projekt nevére → **"New Project"**
3. Név: `Nola and Co` → **Create**
4. Várd meg, míg létrejön, majd válaszd ki

### 2.2 OAuth Consent Screen beállítása

1. Bal oldali menü → **APIs & Services** → **OAuth consent screen**
2. Válaszd: **External** → **Create**
3. Töltsd ki:
   - App name: `Nola & Co Admin`
   - User support email: `galgoczy.krisztina@gmail.com`
   - Developer contact email: `galgoczy.krisztina@gmail.com`
4. **Save and Continue**
5. Scopes: nem kell hozzáadni semmit → **Save and Continue**
6. Test users: add hozzá mindkét e-mailt:
   - `galgoczy.krisztina@gmail.com`
   - `galgoczy.gergely@gmail.com`
7. **Save and Continue** → **Back to Dashboard**

### 2.3 OAuth Client ID létrehozása

1. Bal oldali menü → **APIs & Services** → **Credentials**
2. Felül: **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Nola & Co Webshop`
5. **Authorized redirect URIs** — add hozzá:
   - `https://TEDOMAINED.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (fejlesztéshez)
   > Cseréld ki a `TEDOMAINED.vercel.app`-ot a valódi Vercel domain-edre!
6. **Create**
7. Megjelenik a **Client ID** és **Client Secret** — másold ki mindkettőt

### 2.4 Vercel environment változók beállítása

Menj a Vercel Dashboard → Settings → Environment Variables, és add hozzá:

| Változó | Érték | Megjegyzés |
|---------|-------|------------|
| `GOOGLE_CLIENT_ID` | `1234...apps.googleusercontent.com` | A Google Console-ból |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | A Google Console-ból |
| `NEXTAUTH_SECRET` | *(random string)* | Generáld: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://TEDOMAINED.vercel.app` | A Vercel URL-ed |
| `ADMIN_SECRET` | *(random string)* | Generáld: `openssl rand -base64 32` |

> A `NEXTAUTH_SECRET` generálásához futtasd terminálban:
> ```bash
> openssl rand -base64 32
> ```
> Másold be az eredményt.

### 2.5 Redeploy

A Vercel env var-ok beállítása után **redeploy** szükséges:
- Vercel Dashboard → Deployments → legutóbbi → **Redeploy**

### 2.6 Tesztelés

1. Nyisd meg: `https://TEDOMAINED.vercel.app/admin/bejelentkezes`
2. Kattints a **"Bejelentkezés Google fiókkal"** gombra
3. Válaszd ki a `galgoczy.krisztina@gmail.com` vagy `galgoczy.gergely@gmail.com` fiókot
4. Ha minden jól van beállítva, átirányít az admin felületre

> **Fontos:** Amíg a Google OAuth app "Testing" módban van, csak a Test Users-be felvett e-mail címek tudnak bejelentkezni. Ha később más admint is szeretnél, add hozzá a Google Console-ban ÉS az adatbázisban is.

---

## 3. Stripe fizetés beállítása (később)

### Szükséges lépések:
1. Regisztrálj: https://dashboard.stripe.com
2. Developers → API keys → másold ki:
   - **Publishable key** (`pk_test_...` vagy `pk_live_...`)
   - **Secret key** (`sk_test_...` vagy `sk_live_...`)
3. Developers → Webhooks → Add endpoint:
   - URL: `https://TEDOMAINED.vercel.app/api/webhook`
   - Events: `checkout.session.completed`
   - Másold ki a **Webhook signing secret** (`whsec_...`)

### Vercel env var-ok:

| Változó | Érték |
|---------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` vagy `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` vagy `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

> Tipp: Először `test` kulcsokkal teszteld, később válts `live`-ra.

---

## 4. Szállítás integráció (később)

A szállítási módok a pénztár oldalon választhatók. Jelenleg a rendszer támogatja:
- **Foxpost csomagautomata**
- **Packeta csomagpont**
- **Házhozszállítás**

### Szükséges integrációk:
1. **Foxpost API** — https://foxpost.hu/uzleti-partnereinknek
   - Regisztráció és szerződés szükséges
   - API kulcs a csomagautomata lista lekérdezéséhez és címke generáláshoz
2. **Packeta API** — https://www.packeta.hu/uzleti-partnereknek
   - Regisztráció és szerződés szükséges
   - Widget a csomagpont választóhoz
3. **GLS / DPD / MPL** (házhozszállítás) — bármelyik futárszolgálat
   - API integráció a tracking number generáláshoz

> Ezeket később, a Stripe beüzemelése után érdemes megcsinálni.

---

## Összefoglaló: összes Vercel env var

| Változó | Szükséges most? | Leírás |
|---------|:---:|--------|
| `DATABASE_URL` | **Igen** | Neon PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | **Igen** | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | **Igen** | Google OAuth Client Secret |
| `NEXTAUTH_SECRET` | **Igen** | NextAuth titkosítási kulcs |
| `NEXTAUTH_URL` | **Igen** | Vercel domain URL |
| `ADMIN_SECRET` | **Igen** | Admin token titkosítási kulcs |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Később | Stripe publikus kulcs |
| `STRIPE_SECRET_KEY` | Később | Stripe titkos kulcs |
| `STRIPE_WEBHOOK_SECRET` | Később | Stripe webhook kulcs |
