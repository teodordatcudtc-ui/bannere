# Configurare User Data Deletion pentru Facebook

## Problema

Facebook cere configurarea "User data deletion" înainte de a putea trimite aplicația pentru review.

## Soluție

### Pasul 1: Verifică că pagina există

Pagina `/data-deletion` a fost deja creată în aplicația ta. Verifică că este accesibilă:

1. **Pentru testare locală:**
   - Rulează `npm run dev`
   - Accesează: `http://localhost:3000/data-deletion`
   - Ar trebui să vezi pagina cu instrucțiuni

2. **Pentru producție:**
   - După deploy, accesează: `https://yourdomain.com/data-deletion`
   - Ar trebui să fie accesibilă public

### Pasul 2: Configurează în Facebook Developer Console

1. **Mergi la Facebook Developer Console:**
   - [Facebook Developers](https://developers.facebook.com/apps)
   - Selectează aplicația ta
   - Mergi la **Settings** → **Basic**

2. **Găsește secțiunea "User data deletion":**
   - Scroll până la secțiunea **User data deletion**
   - Ar trebui să vezi un dropdown cu opțiuni

3. **Selectează "Data deletion instructions URL":**
   - În dropdown, selectează **"Data deletion instructions URL"**
   - Va apărea un câmp de text: **"you can also provide a link"**

4. **Adaugă URL-ul:**
   
   **Pentru producție (recomandat):**
   ```
   https://yourdomain.com/data-deletion
   ```
   (Înlocuiește `yourdomain.com` cu domeniul tău real)
   
   **Pentru testare locală (temporar - NU pentru review):**
   ```
   http://localhost:3000/data-deletion
   ```
   ⚠️ **Atenție:** Facebook NU acceptă `localhost` pentru App Review. Trebuie să folosești un domeniu real.

5. **Salvează:**
   - Click pe **Save Changes**
   - Așteaptă câteva secunde pentru salvare

### Pasul 3: Verifică că URL-ul este accesibil

1. **Testează URL-ul:**
   - Deschide URL-ul într-un browser (sau browser incognito)
   - Ar trebui să vezi pagina cu instrucțiuni de ștergere date
   - Pagina trebuie să fie accesibilă fără autentificare

2. **Verifică că nu există erori:**
   - Pagina trebuie să se încarce corect
   - Nu trebuie să fie redirect-uri la login
   - Nu trebuie să fie erori 404 sau 500

### Pasul 4: Actualizează email-ul în pagină (opțional)

Dacă vrei să actualizezi email-ul de contact din pagină:

1. Deschide `app/data-deletion/page.tsx`
2. Caută `support@yourdomain.com`
3. Înlocuiește cu adresa ta reală de email
4. Salvează și redeploy

## Format URL Corect

Facebook acceptă doar URL-uri HTTPS în producție:

✅ **Corect:**
- `https://yourdomain.com/data-deletion`
- `https://www.yourdomain.com/data-deletion`

❌ **Incorect (pentru review):**
- `http://localhost:3000/data-deletion` (doar pentru testare locală)
- `http://yourdomain.com/data-deletion` (trebuie HTTPS)

## Ce conține pagina `/data-deletion`?

Pagina include:
- ✅ Explicații despre ce date stocăm
- ✅ 3 opțiuni pentru ștergerea datelor:
  - Prin aplicație
  - Prin email
  - Prin Facebook Settings
- ✅ Informații despre procesul de ștergere
- ✅ Instrucțiuni pentru găsirea Facebook User ID
- ✅ Informații de contact

## Dacă Primești Eroare

### Eroare: "URL is not accessible"
- Verifică că URL-ul este corect
- Verifică că pagina este accesibilă public (fără autentificare)
- Verifică că folosești HTTPS (nu HTTP) pentru producție

### Eroare: "URL must be a valid link"
- Asigură-te că URL-ul este complet (cu `https://`)
- Verifică că nu ai spații în URL
- Verifică că domeniul este corect

### Eroare: "Page not found (404)"
- Verifică că ai deploy-at aplicația
- Verifică că ruta `/data-deletion` există
- Verifică că ai salvat fișierul `app/data-deletion/page.tsx`

## Verificare Finală

Înainte de a trimite pentru review, verifică:

1. ✅ **URL-ul este configurat** în Facebook Developer Console
2. ✅ **URL-ul este accesibil** public (testează într-un browser incognito)
3. ✅ **Pagina se încarcă corect** fără erori
4. ✅ **Folosești HTTPS** (nu HTTP) pentru producție
5. ✅ **Nu folosești localhost** (doar pentru testare locală)

## Notă Importantă

Dacă aplicația ta nu este încă deploy-ată pe un domeniu real, poți:
1. **Folosește Vercel/Netlify** pentru un deploy rapid (gratuit)
2. **Sau așteaptă** până când ai un domeniu real înainte de App Review

Facebook NU acceptă `localhost` pentru App Review, deci vei avea nevoie de un domeniu real.
