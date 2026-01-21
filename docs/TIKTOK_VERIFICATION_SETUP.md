# Configurare TikTok - Verificare Ownership

## Ce este necesar?

TikTok necesită verificarea ownership-ului domeniului sau URL-ului pentru a permite OAuth și postarea.

## Opțiuni de verificare

### Opțiunea 1: URL Prefix (Recomandat pentru început)

**Când să folosești:**
- Ai un domeniu specific (ex: `https://yourdomain.com`)
- Vrei să verifici doar un path specific
- Mai simplu de configurat

**Cum să configurezi:**

1. **Selectează "URL prefix"** în modal
2. **Adaugă URL-ul complet:**
   ```
   https://yourdomain.com
   ```
   Sau dacă vrei să verifici doar un path specific:
   ```
   https://yourdomain.com/api
   ```
3. **Click pe "Verify"**
4. **TikTok va genera un fișier de verificare:**
   - Va fi ceva de genul: `TikTok-Verify.html` sau similar
   - Va conține un cod de verificare

5. **Adaugă fișierul în aplicația ta:**
   - Descarcă fișierul generat de TikTok
   - Adaugă-l în folder-ul `public/` al aplicației tale Next.js
   - Sau adaugă-l la root-ul domeniului tău

6. **Verifică că fișierul este accesibil:**
   - Accesează: `https://yourdomain.com/TikTok-Verify.html`
   - Ar trebui să vezi conținutul fișierului

7. **Click pe "Verify" din nou în TikTok Developer Console**

### Opțiunea 2: Domain (Recomandat pentru producție)

**Când să folosești:**
- Vrei să verifici întregul domeniu
- Vrei să verifici și subdomeniile
- Mai robust, dar necesită acces la DNS

**Cum să configurezi:**

1. **Selectează "Domain"** în modal
2. **Adaugă doar domeniul (fără https://):**
   ```
   yourdomain.com
   ```
3. **Click pe "Verify"**
4. **TikTok va genera un DNS record:**
   - Va fi ceva de genul: `TXT` record
   - Va conține un cod de verificare

5. **Adaugă DNS record-ul:**
   - Mergi la provider-ul tău de DNS (ex: Cloudflare, Namecheap, etc.)
   - Adaugă un record `TXT`:
     - **Name/Host:** `@` sau `yourdomain.com`
     - **Type:** `TXT`
     - **Value:** Codul generat de TikTok
     - **TTL:** 3600 (sau default)

6. **Așteaptă propagarea DNS:**
   - Poate dura 5-30 minute
   - Verifică cu: `nslookup -type=TXT yourdomain.com`

7. **Click pe "Verify" din nou în TikTok Developer Console**

## Recomandare pentru aplicația ta

### Pentru testare rapidă:
- Folosește **URL prefix** cu: `https://yourdomain.com`
- Adaugă fișierul de verificare în `public/` folder

### Pentru producție:
- Folosește **Domain** pentru verificare completă
- Adaugă DNS record-ul

## Pași detaliați pentru URL Prefix

### 1. Configurează în TikTok Developer Console

1. Selectează **"URL prefix"**
2. Adaugă URL-ul: `https://yourdomain.com`
3. Click pe **"Verify"**
4. TikTok va genera un fișier (ex: `TikTok-Verify.html`)

### 2. Adaugă fișierul în aplicația ta

**Opțiunea A: În Next.js (public folder) - RECOMANDAT**

1. Descarcă fișierul generat de TikTok (poate fi `.txt` sau `.html`)
2. Adaugă-l în folder-ul `public/` al aplicației:
   ```
   public/TikTok-Verify.txt
   ```
   (sau cum se numește exact fișierul - păstrează numele exact!)
3. **IMPORTANT:** Păstrează numele exact al fișierului (ex: `TikTok-Verify.txt`)
4. Commit și push la Git:
   ```bash
   git add public/TikTok-Verify.txt
   git commit -m "Add TikTok verification file"
   git push
   ```
5. Vercel va redeploy automat
6. Verifică că este accesibil: `https://socialpilot-ten.vercel.app/TikTok-Verify.txt`
   (sau cum se numește exact fișierul)

**Opțiunea B: Direct pe server**

1. Descarcă fișierul generat de TikTok
2. Upload-l la root-ul domeniului tău (același nivel cu `index.html`)
3. Verifică că este accesibil: `https://yourdomain.com/TikTok-Verify.html`

### 3. Verifică ownership-ul

1. Înapoi în TikTok Developer Console
2. Click pe **"Verify"** din nou
3. TikTok va verifica dacă fișierul este accesibil
4. Dacă totul este OK, vei vedea un mesaj de succes

## Pași detaliați pentru Domain (DNS)

### 1. Configurează în TikTok Developer Console

1. Selectează **"Domain"**
2. Adaugă domeniul: `yourdomain.com` (fără https://)
3. Click pe **"Verify"**
4. TikTok va genera un cod pentru DNS record

### 2. Adaugă DNS Record

**Exemplu pentru Cloudflare:**
1. Mergi la Cloudflare Dashboard
2. Selectează domeniul tău
3. Mergi la **DNS** → **Records**
4. Click pe **Add record**
5. Configurează:
   - **Type:** `TXT`
   - **Name:** `@` (sau lasă gol pentru root domain)
   - **Content:** Codul generat de TikTok
   - **TTL:** Auto
6. Click pe **Save**

**Exemplu pentru Namecheap:**
1. Mergi la Namecheap Dashboard
2. Selectează domeniul
3. Mergi la **Advanced DNS**
4. Adaugă un record:
   - **Type:** `TXT Record`
   - **Host:** `@`
   - **Value:** Codul generat de TikTok
   - **TTL:** Automatic
5. Click pe **Save**

### 3. Verifică DNS Record

1. Așteaptă 5-30 minute pentru propagare
2. Verifică cu:
   ```bash
   nslookup -type=TXT yourdomain.com
   ```
   Sau folosește un tool online: https://mxtoolbox.com/TXTLookup.aspx

3. Ar trebui să vezi codul generat de TikTok în rezultat

### 4. Verifică ownership-ul

1. Înapoi în TikTok Developer Console
2. Click pe **"Verify"** din nou
3. TikTok va verifica DNS record-ul
4. Dacă totul este OK, vei vedea un mesaj de succes

## Verificare finală

După verificare, asigură-te că:

1. ✅ Ownership-ul este verificat în TikTok Developer Console
2. ✅ Status-ul arată "Verified" sau "Ownership verified"
3. ✅ Poți continua cu configurarea OAuth

## Probleme comune

### Eroare: "File not found"
- Verifică că fișierul este în locația corectă
- Verifică că fișierul este accesibil public (fără autentificare)
- Verifică că URL-ul este exact ca cel configurat

### Eroare: "DNS record not found"
- Așteaptă mai mult timp pentru propagare DNS (până la 48 de ore)
- Verifică că ai adăugat record-ul corect (TXT, nu A sau CNAME)
- Verifică că numele record-ului este corect (@ pentru root domain)

### Eroare: "Invalid URL"
- Asigură-te că URL-ul începe cu `https://`
- Asigură-te că nu ai spații în URL
- Verifică că domeniul este corect

## Notă importantă

- **Pentru Outstand:** TikTok va folosi callback-uri de la Outstand, deci poate fi necesar să verifici `api.outstand.so` în loc de domeniul tău
- **Verifică documentația Outstand** pentru a vedea ce domeniu trebuie verificat pentru TikTok

## Resurse utile

- [TikTok Developer Documentation](https://developers.tiktok.com/doc/)
- [TikTok OAuth Setup](https://developers.tiktok.com/doc/oauth-overview)
