# Rezolvare: "URL blocat - Redirecţionarea a eşuat" Facebook

## Problema

După ce ai publicat aplicația Facebook, primești eroarea:
> "URL blocat - Redirecţionarea a eşuat deoarece, în setările OAuth client ale aplicaţiei, adresa URI de redirecţionare nu se află în lista adreselor URI permise."

Chiar dacă ai adăugat `https://api.outstand.so/v1/oauth/facebook/callback` în "Valid OAuth Redirect URIs".

## Soluție Pas cu Pas

### Pasul 1: Verifică Setările OAuth Client

1. Mergi la [Facebook Developers](https://developers.facebook.com/apps)
2. Selectează aplicația ta
3. Mergi la **Products** → **Facebook Login** → **Settings**

4. **Verifică că sunt activate:**
   - ✅ **Client OAuth Login** - trebuie să fie "Yes"
   - ✅ **Web OAuth Login** - trebuie să fie "Yes"
   - ⚠️ **Use Strict Mode for redirect URIs** - dacă este "Yes", URI-ul trebuie să fie EXACT ca cel configurat (fără parametri query suplimentari)

5. **IMPORTANT:** Dacă "Use Strict Mode" este "Yes", dezactivează-l temporar (setează la "No") pentru a testa, sau asigură-te că URI-ul este exact același.

### Pasul 2: Verifică Valid OAuth Redirect URIs

⚠️ **IMPORTANT:** Conform documentației oficiale Outstand, redirect URI-ul corect este:

1. În aceeași secțiune, scroll până la **Valid OAuth Redirect URIs**
2. **Adaugă EXACT (conform documentației Outstand):**
   ```
   https://www.outstand.so/app/api/socials/facebook/callback
   ```
   
   ⚠️ **NU** `https://api.outstand.so/v1/oauth/facebook/callback` - acesta este greșit!

3. **IMPORTANT:** 
   - Nu include spații înainte sau după
   - Nu include trailing slash (`/`) la sfârșit
   - Trebuie să fie exact `https://www.outstand.so/app/api/socials/facebook/callback`
   - Dacă "Use Strict Mode" este activat, URI-ul trebuie să fie EXACT (fără parametri query)

4. **Dacă folosești white-labeling (flow-ul nostru), adaugă și:**
   ```
   https://yourdomain.com/api/social-accounts/callback
   ```

### Pasul 3: Verifică App Domains

⚠️ **IMPORTANT:** Conform documentației oficiale Outstand:

1. Mergi la **Settings** → **Basic**
2. În secțiunea **App Domains**, verifică că ai:
   ```
   outstand.so
   ```
   ⚠️ **NU** `api.outstand.so` - acesta este greșit!
   (fără `https://`, doar domeniul)

3. În secțiunea **Website**, verifică că ai:
   ```
   https://www.outstand.so
   ```
   Sau URL-ul tău de producție dacă ai unul.

### Pasul 4: Salvează și Așteaptă

1. **Click pe "Save Changes"** în partea de jos a paginii
2. **Așteaptă 5-10 minute** pentru propagare
   - Facebook necesită timp pentru a propaga modificările
   - Chiar dacă aplicația este publică, modificările pot dura câteva minute

### Pasul 5: Verifică din Nou

1. După 5-10 minute, verifică din nou setările
2. Asigură-te că toate modificările sunt salvate
3. Încearcă din nou să te conectezi

## Probleme Comune

### Problema 1: "Use Strict Mode" este activat și blocat

Dacă **"Use Strict Mode for redirect URIs"** este "Yes" și este blocat (nu poți să îl dezactivezi), trebuie să adaugi **EXACT** redirect URI-ul pe care îl trimite Outstand.

**Soluție:**

1. **Verifică ce redirect URI trimite Outstand:**
   - În browser, deschide **Developer Tools** (F12)
   - Mergi la tab-ul **Network**
   - Încearcă să te conectezi la Facebook
   - Caută request-ul către `facebook.com` sau `outstand.so`
   - Verifică parametrul `redirect_uri` din request

2. **Adaugă toate variantele posibile în "Valid OAuth Redirect URIs":**
   ```
   https://api.outstand.so/v1/oauth/facebook/callback
   https://api.outstand.so/v1/oauth/facebook/callback?session=*
   https://api.outstand.so/oauth/facebook/callback
   https://api.outstand.so/oauth/facebook/callback?session=*
   ```
   (Notă: Facebook nu acceptă wildcards `*`, dar poți încerca să adaugi variantele comune)

3. **Contactează Outstand Support:**
   - Întreabă exact ce redirect URI folosesc pentru Facebook
   - Întreabă dacă adaugă parametri query (ex: `?session=...`)
   - Întreabă dacă există o modalitate de a configura redirect URI-ul

4. **Alternativă - Verifică în Outstand Dashboard:**
   - Mergi la Outstand Dashboard → Settings → Social Networks → Facebook
   - Verifică dacă există o opțiune pentru a configura redirect URI-ul
   - Poate că poți seta redirect URI-ul direct în Outstand

### Problema 2: URI-ul nu este salvat corect

Uneori Facebook nu salvează corect URI-ul.

**Soluție:**
1. Șterge URI-ul existent
2. Adaugă-l din nou
3. Salvează
4. Verifică că apare în listă

### Problema 3: Aplicația este în modul Development

Dacă aplicația este încă în modul Development, doar testerii pot folosi OAuth.

**Soluție:**
1. Mergi la **Settings** → **Basic**
2. Scroll până la **App Review**
3. Verifică status-ul aplicației
4. Dacă este "Development", fă-o publică sau adaugă-te ca tester

### Problema 4: Permisiunile nu sunt aprobate

Dacă ai publicat aplicația dar permisiunile nu sunt aprobate, OAuth poate să nu funcționeze.

**Soluție:**
1. Mergi la **App Review** → **Permissions and Features**
2. Verifică că permisiunile necesare sunt aprobate:
   - `pages_show_list`
   - `pages_manage_posts`
   - `pages_read_engagement`

## Verificare Rapidă

Înainte de a testa din nou, verifică:

1. ✅ **Client OAuth Login**: Yes
2. ✅ **Web OAuth Login**: Yes
3. ✅ **Valid OAuth Redirect URIs**: `https://www.outstand.so/app/api/socials/facebook/callback`
4. ✅ **App Domains**: `outstand.so` (NU `api.outstand.so`)
5. ✅ **Website URL**: `https://www.outstand.so`
6. ✅ **Aplicația este publică** (sau ești tester)
7. ✅ **Ai salvat toate modificările**
8. ✅ **Ai așteptat 5-10 minute** pentru propagare

## Dacă Problema Persistă

### Verifică Logs-urile

1. În browser, deschide **Developer Tools** (F12)
2. Mergi la tab-ul **Network**
3. Încearcă să te conectezi din nou
4. Caută request-ul către Facebook
5. Verifică ce redirect URI este trimis exact

### Contactează Outstand Support

Dacă problema persistă, poate că Outstand folosește un alt redirect URI sau are nevoie de configurare suplimentară.

Contact: support@outstand.so

### Verifică Documentația Outstand

Verifică documentația Outstand pentru Facebook OAuth pentru a confirma:
- Redirect URI-ul exact
- Dacă există configurații suplimentare necesare
- Dacă există limitări pentru aplicații noi publicate

## Notă Importantă

După ce publici o aplicație Facebook, modificările pot dura până la 10-15 minute pentru a fi propagate complet. Asigură-te că ai așteptat suficient timp înainte de a testa din nou.
