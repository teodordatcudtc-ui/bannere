# Rezolvare: "Testing not started" pentru Facebook Login

## Problema

În Facebook Developer Console, la **Products** → **Facebook Login**, apare statusul **"Testing not started"**. Aceasta înseamnă că Facebook Login nu a fost configurat corect sau nu a fost trimis pentru review.

## Cauza

"Testing not started" apare când:
- Facebook Login nu a fost configurat complet
- Nu ai adăugat "Use Case" pentru Facebook Login
- Nu ai completat toate setările necesare
- Nu ai trimis pentru review

## Soluție: Pornește Testing pentru Facebook Login

### Pasul 1: Accesează Facebook Login Settings

1. Mergi la [Facebook Developers](https://developers.facebook.com/apps)
2. Selectează aplicația ta
3. În sidebar, mergi la **Products** → **Facebook Login**
4. Click pe **"Settings"** (sau pe card-ul "Facebook Login" dacă apare "Testing not started")

### Pasul 2: Configurează Setările de Bază

1. **Verifică că sunt activate:**
   - ✅ **Client OAuth Login**: Yes
   - ✅ **Web OAuth Login**: Yes

2. **Verifică Valid OAuth Redirect URIs:**
   - Adaugă: `https://www.outstand.so/app/api/socials/facebook/callback`
   - Dacă folosești white-labeling, adaugă și: `https://yourdomain.com/api/social-accounts/callback`

3. **Salvează modificările**

### Pasul 3: Adaugă "Use Case" (Dacă este necesar)

⚠️ **IMPORTANT:** Use Cases pot fi adăugate în mai multe locuri, în funcție de versiunea Facebook Developer Console:

**Opțiunea A: Din Products → Facebook Login**
1. Mergi la **Products** → **Facebook Login**
2. Click pe **"Settings"** sau pe card-ul "Facebook Login"
3. Caută secțiunea **"Use Cases"** sau **"App Use Cases"**
4. Click pe **"Add Use Case"** sau **"Configure"**
5. Selectează **"Facebook Login for Business"** sau **"Pages API"**

**Opțiunea B: Din App Dashboard**
1. În dashboard-ul principal al aplicației
2. Caută secțiunea **"Use Cases"** sau **"App Use Cases"**
3. Click pe **"Add"** sau **"Customize"**
4. Selectează **"Facebook Login for Business"**

**Opțiunea C: Dacă nu găsești Use Cases**
- Poate că Use Cases nu mai sunt necesare în versiunea nouă
- Încearcă să pornești testing-ul direct (vezi Pasul 4)

### Pasul 4: Pornește Testing (Fără Use Cases)

Dacă nu găsești unde să adaugi Use Cases, poți încerca să pornești testing-ul direct:

1. **Mergi la Products → Facebook Login:**
   - Click pe card-ul "Facebook Login" (unde apare "Testing not started")
   - Sau click pe **"Settings"** în sidebar

2. **Verifică dacă apare butonul "Start Testing" sau "Submit for Review":**
   - Dacă apare, click pe el
   - Dacă nu apare, continuă cu pasul următor

3. **Alternativă - Mergi direct la App Review:**
   - Mergi la **App Review** → **Permissions and Features**
   - Adaugă permisiunile necesare (vezi Pasul 5)
   - După ce adaugi permisiunile, testing-ul poate să pornească automat

4. **Sau contactează Facebook Support:**
   - Dacă nu vezi opțiunea de a porni testing-ul
   - Contactează [Facebook Developers Support](https://developers.facebook.com/support/)
   - Explică că vezi "Testing not started" dar nu găsești unde să pornești testing-ul

### Pasul 5: Adaugă Permisiunile

După ce ai pornit testing, adaugă permisiunile:

1. **Mergi la App Review → Permissions and Features**
2. **Caută și adaugă permisiunile:**
   - `pages_show_list`
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_read_user_content` (dacă este necesar)
   - `pages_manage_engagement` (dacă este necesar)
   - `business_management` (doar dacă folosești Business Manager)

3. **Pentru fiecare permisiune, click pe "Request"**

### Pasul 6: Completează App Review

Pentru fiecare permisiune:

1. **Completează formularul:**
   - **How do you use this permission?**
   - **Why do you need this permission?**
   - **Video Demo**
   - **Screenshots**

2. **Trimite pentru review**

## Verificare Rapidă

După ce ai configurat totul, verifică:

1. ✅ **Facebook Login** → Status: "In Review" sau "Live" (nu "Testing not started")
2. ✅ **Use Cases** → "Facebook Login for Business" sau "Pages API" este adăugat
3. ✅ **Permissions and Features** → Toate permisiunile sunt adăugate și trimise pentru review
4. ✅ **Settings** → **Basic** → **Business Verification**: Verified (dacă este necesar)

## Dacă "Start Testing" Nu Apare

Dacă nu vezi butonul "Start Testing":

1. **Verifică că ai completat toate setările:**
   - Valid OAuth Redirect URIs
   - Client OAuth Login: Yes
   - Web OAuth Login: Yes

2. **Verifică că ai adăugat Use Case:**
   - Use Cases → Customize
   - Adaugă "Facebook Login for Business"

3. **Verifică că aplicația este configurată corect:**
   - Settings → Basic → Toate câmpurile sunt completate
   - Privacy Policy URL
   - Terms of Service URL
   - Data deletion URL

4. **Contactează Facebook Support:**
   - Dacă tot nu apare, poate fi o problemă cu aplicația
   - Contactează [Facebook Developers Support](https://developers.facebook.com/support/)

## Alternativă: Folosește Managed Keys

Dacă nu vrei să treci prin App Review acum:

1. **Contactează Outstand:**
   - Email: contact@outstand.so
   - Solicită Managed Keys pentru Facebook
   - Ei au permisiunile deja aprobate și testing-ul deja configurat

2. **Avantaje:**
   - ✅ Funcționează imediat
   - ✅ Nu trebuie să treci prin App Review
   - ✅ Nu trebuie să configurezi testing-ul

## Resurse

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)
- [Outstand Support](mailto:contact@outstand.so)
