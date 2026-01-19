# Ghid Complet - Configurare Outstand.so

## ✅ Pasul 1: API Key (DEJA FĂCUT)

Ai adăugat deja `OUTSTAND_API_KEY` în `.env.local`. Perfect!

## 📋 Pasul 2: Rulează Migrarea SQL

Rulează migrarea pentru tabelul `social_accounts`:

1. Deschide Supabase Dashboard
2. Mergi la **SQL Editor**
3. Rulează fișierul `supabase/migration-social-accounts.sql`

SAU rulează direct în SQL Editor:

```sql
-- Verifică dacă tabelul există deja
SELECT * FROM public.social_accounts LIMIT 1;
```

Dacă primești eroare că tabelul nu există, rulează migrarea.

## 🔑 Pasul 3: Configurează Credențiale OAuth în Outstand (IMPORTANT!)

**Acest pas trebuie făcut O SINGURĂ DATĂ de tine (ca developer), nu de fiecare utilizator.**

### 3.1. Accesează Outstand Dashboard

1. Mergi la [Outstand.so Dashboard](https://app.outstand.so)
2. Loghează-te cu contul tău
3. Mergi la **Settings** → **Social Networks** sau **Integrations**

### 3.2. Pentru fiecare platformă, trebuie să:

#### Facebook & Instagram (Meta)
1. Creează aplicație în [Facebook Developer](https://developers.facebook.com/apps)
2. Adaugă produsul **Facebook Login** și **Instagram Basic Display**
3. **IMPORTANT - Configurează domeniile și redirect URI-urile:**
   
   **În tab-ul "Settings" → "Basic":**
   - Adaugă în **App Domains**: `api.outstand.so`
   - Adaugă în **Website** → **Site URL**: `https://api.outstand.so` (sau URL-ul tău de producție)
   
   **În tab-ul "Facebook Login" → "Settings":**
   - Adaugă în **Valid OAuth Redirect URIs**:
     - `https://api.outstand.so/v1/oauth/facebook/callback`
     - `https://api.outstand.so/oauth/facebook/callback` (dacă există)
     - Dacă folosești localhost pentru testare, adaugă și: `http://localhost:3000/api/social-accounts/callback`
   
   **În tab-ul "Products" → "Facebook Login" → "Settings":**
   - Asigură-te că **Client OAuth Login** este activat
   - Asigură-te că **Web OAuth Login** este activat
   
4. Obține **App ID** (Client ID) și **App Secret** (Client Secret) din tab-ul "Settings" → "Basic"
5. Adaugă în Outstand dashboard:
   - Mergi la [Outstand Dashboard](https://app.outstand.so) → **Settings** → **Social Networks**
   - Click pe **Facebook** sau **Add Network**
   - Network: `facebook` sau `instagram`
   - Client Key: App ID (din Facebook)
   - Client Secret: App Secret (din Facebook)
   - Salvează configurația

#### LinkedIn
1. Creează aplicație în [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. În **Auth** tab, adaugă redirect URI de la Outstand
3. Obține **Client ID** și **Client Secret**
4. Adaugă în Outstand

#### X (Twitter)
1. Creează aplicație în [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Configurează OAuth 2.0
3. Adaugă redirect URI
4. Obține **Client ID** și **Client Secret**
5. Adaugă în Outstand

#### TikTok
1. Creează aplicație în [TikTok Developer Portal](https://developers.tiktok.com)
2. Configurează OAuth
3. Adaugă redirect URI
4. Obține credențiale
5. Adaugă în Outstand

### 3.3. Publicare Aplicație pentru Utilizatori Publici

**IMPORTANT:** Dacă aplicația ta Facebook este în modul **Development**, doar testerii pot folosi OAuth. Pentru ca oricine să poată folosi aplicația:

#### Opțiunea A: App Review (Recomandat pentru producție)

1. **Completează informațiile aplicației:**
   - Mergi la **Settings** → **Basic**
   - Completează: App Name, App Icon, Privacy Policy URL, Terms of Service URL, Category, Contact Email
   - Configurează **Website** → **Site URL**: URL-ul tău de producție

2. **Solicită permisiunile necesare:**
   - Mergi la **App Review** → **Permissions and Features**
   - Adaugă și solicită permisiunile:
     - `pages_show_list` - Lista paginilor
     - `pages_manage_posts` - Publicarea postărilor
     - `pages_read_engagement` - Citirea interacțiunilor
     - `business_management` - Gestionarea business-ului (dacă este necesar)

3. **Creează video de demonstrație** pentru fiecare permisiune

4. **Trimite pentru review** (poate dura 1-7 zile)

5. **Publică aplicația** după aprobare:
   - **Settings** → **Basic** → **App Review** → **Make [App Name] public**

Vezi `docs/FACEBOOK_PUBLIC_APP_SETUP.md` pentru ghid complet.

#### Opțiunea B: Managed Keys (Alternativă)

Dacă nu vrei să treci prin App Review, contactează Outstand pentru **Managed Keys**:
- ✅ Outstand gestionează credențialele OAuth
- ✅ Permisiunile sunt deja aprobate
- ❌ Costă extra (contactează Outstand pentru prețuri)

Contact: support@outstand.so sau prin dashboard-ul Outstand

## 🧪 Pasul 4: Testează Conectarea

1. **Restart server-ul de development** (pentru a încărca noul API key):
   ```bash
   npm run dev
   ```

2. **Accesează pagina de Settings**:
   - Mergi la `/dashboard/settings`
   - Ar trebui să vezi secțiunea "Conturi Social Media"

3. **Încearcă să conectezi un cont**:
   - Click pe "Conectează" pentru o platformă
   - Ar trebui să te redirecționeze la OAuth flow

## ⚠️ Probleme Comune

### Eroare: "OUTSTAND_API_KEY is not configured"
- Verifică că ai restartat server-ul după ce ai adăugat API key-ul
- Verifică că în `.env.local` nu ai spații: `OUTSTAND_API_KEY=ost_...` (nu `OUTSTAND_API_KEY = ost_...`)

### Eroare: "Failed to get auth URL"
- Verifică că ai configurat credențialele OAuth în Outstand dashboard
- Verifică că API key-ul este corect

### Eroare: "No accounts found"
- Normal dacă nu ai conectat încă conturi
- După ce conectezi un cont prin OAuth, ar trebui să apară în listă

## 📝 Următorii Pași

După ce ai configurat totul:

1. ✅ Utilizatorii pot conecta conturile lor sociale din `/dashboard/settings`
2. ✅ Utilizatorii pot programa postări din `/dashboard/schedule`
3. ✅ Postările se procesează automat prin cron job (`/api/process-scheduled-posts`)

## 🔄 Configurare Cron Job

Pentru ca postările să se publice automat, configurează cron job-ul:

### ⚠️ Important: Planul Hobby de pe Vercel
Planul Hobby permite doar cron jobs **zilnice** (maximum o dată pe zi). Pentru frecvențe mai dese (ex: la fiecare minut sau oră), folosește un serviciu extern (vezi mai jos).

### Opțiunea 1: Vercel Cron (Zilnic - pentru planul Hobby)
Cron job-ul este deja configurat în `vercel.json` să ruleze o dată pe zi la miezul nopții:
```json
{
  "crons": [{
    "path": "/api/process-scheduled-posts",
    "schedule": "0 0 * * *"
  }]
}
```

**Limitare**: Postările vor fi procesate doar o dată pe zi. Pentru procesare mai frecventă, folosește Opțiunea 2.

### Opțiunea 2: Serviciu Extern (Recomandat pentru frecvențe mai dese)
Pentru a procesa postările mai des (ex: la fiecare minut sau oră), folosește un serviciu extern:

**Servicii recomandate:**
- [cron-job.org](https://cron-job.org) (gratuit)
- [EasyCron](https://www.easycron.com) (gratuit cu limitări)
- [Cronitor](https://cronitor.io) (gratuit cu limitări)

**Configurare:**
1. Creează un cont pe serviciul ales
2. Configurează un cron job care să apeleze:
   ```
   POST https://yourdomain.com/api/process-scheduled-posts
   Authorization: Bearer YOUR_CRON_SECRET
   ```
3. Setează frecvența dorită (ex: `* * * * *` pentru fiecare minut)

**Notă**: Dacă folosești un serviciu extern, poți șterge sau comenta secțiunea `crons` din `vercel.json`.

Vezi `docs/AUTOMATED_POSTING_SETUP.md` pentru detalii complete.
