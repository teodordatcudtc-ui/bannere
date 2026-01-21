# Publicare Aplicație Facebook - Ghid Complet

## De ce este necesar App Review?

Pentru ca oricine să poată folosi aplicația ta (nu doar testeri), trebuie să:
1. **Solici permisiunile necesare** prin Facebook App Review
2. **Publici aplicația** după aprobare

## Permisiuni Necesare pentru Outstand + Facebook

Pentru a permite utilizatorilor să se conecteze la Facebook și să posteze, ai nevoie de:

### Permisiuni de bază (nu necesită review):
- `public_profile` - Informații publice de profil
- `email` - Adresa de email

### Permisiuni care necesită review:
- `pages_show_list` - Lista paginilor Facebook ale utilizatorului (obligatoriu)
- `pages_read_engagement` - Citirea interacțiunilor paginii (recomandat)
- `pages_manage_posts` - Publicarea de postări pe pagini (obligatoriu)
- `pages_read_user_content` - Citirea conținutului utilizatorului (opțional)

**Notă:** `business_management` este necesar DOAR dacă folosești Facebook Business Manager. Pentru utilizatori normali cu pagini Facebook personale, NU este necesar.

## Procesul de App Review

### Pasul 1: Pregătește Aplicația

1. **Completează informațiile de bază:**
   - Mergi la **Settings** → **Basic**
   - Completează toate câmpurile obligatorii:
     - **App Name**: Numele aplicației tale
     - **App Icon**: Logo-ul aplicației (1024x1024px)
     - **Privacy Policy URL**: URL-ul către politica de confidențialitate (ex: `https://yourdomain.com/privacy`)
     - **Terms of Service URL**: URL-ul către termenii și condițiile (ex: `https://yourdomain.com/terms`)
     - **Category**: Alege categoria aplicației (ex: "Business", "Social")
     - **Contact Email**: Email-ul tău de contact

2. **Configurează User Data Deletion (IMPORTANT!):**
   - În **Settings** → **Basic**, scroll până la secțiunea **User data deletion**
   - Selectează **"Data deletion instructions URL"** (recomandat)
   - În câmpul **"you can also provide a link"**, adaugă URL-ul complet:
     - Pentru producție: `https://yourdomain.com/data-deletion`
     - Pentru testare locală (temporar): `http://localhost:3000/data-deletion`
   - **Notă:** Am creat deja această pagină în aplicația ta la `/data-deletion`
   - **IMPORTANT:** URL-ul trebuie să fie accesibil public (nu poate fi localhost în producție)

2. **Configurează Website:**
   - **Website** → **Site URL**: `https://yourdomain.com` (URL-ul tău de producție)

### Pasul 2: Pornește Testing pentru Facebook Login

⚠️ **IMPORTANT:** Dacă vezi "Testing not started" la Facebook Login, trebuie să pornești testing-ul:

1. **Mergi la Products → Facebook Login**
2. **Click pe card-ul "Facebook Login"** (unde apare "Testing not started")
3. **Verifică setările:**
   - Client OAuth Login: Yes
   - Web OAuth Login: Yes
   - Valid OAuth Redirect URIs: `https://www.outstand.so/app/api/socials/facebook/callback`
4. **Adaugă "Use Case":**
   - Mergi la **Use Cases** → **Customize**
   - Adaugă **"Facebook Login for Business"** sau **"Pages API"**
5. **Pornește Testing:**
   - Revino la **Products** → **Facebook Login**
   - Click pe **"Start Testing"** sau **"Submit for Review"**
   - Completează formularul

Vezi `docs/FACEBOOK_TESTING_NOT_STARTED_FIX.md` pentru detalii complete.

### Pasul 3: Adaugă Permisiunile

1. Mergi la **App Review** → **Permissions and Features**
2. Click pe **Add Permissions** sau caută permisiunile necesare
3. Adaugă permisiunile:
   - `pages_show_list` (obligatoriu - pentru a lista paginile)
   - `pages_manage_posts` (obligatoriu - pentru a posta)
   - `pages_read_engagement` (recomandat - pentru statistici)
   - `pages_read_user_content` (opțional - pentru citirea conținutului)
   
   **NU adăuga `business_management` dacă nu folosești Business Manager!**

### Pasul 3: Creează Video de Demonstrație

Pentru fiecare permisiune, Facebook cere un video care arată:
- **Cum folosești permisiunea** în aplicația ta
- **De ce ai nevoie de permisiunea respectivă**
- **Cum beneficiază utilizatorul**

**Exemplu pentru `pages_manage_posts`:**
1. Înregistrează un video care arată:
   - Utilizatorul se conectează la Facebook
   - Selectează pagina Facebook
   - Creează o postare programată
   - Postarea este publicată automat
2. Explică în descriere:
   - "Utilizatorii pot programa postări pe paginile lor Facebook"
   - "Aceasta permite gestionarea automată a conținutului social media"

### Pasul 4: Completează Formularul de Review

Pentru fiecare permisiune:
1. Click pe **Request** lângă permisiunea respectivă
2. Completează formularul:
   - **How do you use this permission?**: Descrie cum folosești permisiunea
   - **Why do you need this permission?**: Explică de ce este necesară
   - **Video Demo**: Încarcă video-ul de demonstrație
   - **Screenshots**: Adaugă screenshot-uri din aplicația ta
   - **User Instructions**: Instrucțiuni pentru reviewer (opțional)

### Pasul 5: Trimite pentru Review

1. După ce ai completat toate permisiunile, click pe **Submit for Review**
2. Facebook va verifica aplicația ta (poate dura 1-7 zile)
3. Vei primi notificări pe email despre status

### Pasul 6: Publică Aplicația

După ce permisiunile sunt aprobate:

1. Mergi la **Settings** → **Basic**
2. Scroll până la secțiunea **App Review**
3. Click pe **Make [App Name] public**
4. Confirmă acțiunea

**Notă:** Aplicația va fi publică, dar doar permisiunile aprobate vor fi disponibile pentru utilizatori.

## Alternativă: Outstand Managed Keys

Dacă nu vrei să treci prin procesul de App Review, poți folosi **Outstand Managed Keys**:

### Avantaje:
- ✅ Outstand gestionează credențialele OAuth
- ✅ Nu trebuie să treci prin App Review
- ✅ Permisiunile sunt deja aprobate de Facebook
- ✅ Mai puțină muncă pentru tine

### Dezavantaje:
- ❌ Costă extra (contactează Outstand pentru prețuri)
- ❌ Mai puțin control asupra configurației

### Cum să obții Managed Keys:

1. Contactează Outstand Support:
   - Email: support@outstand.so
   - Sau prin dashboard-ul Outstand
2. Solicită Managed Keys pentru Facebook
3. Ei vor configura totul pentru tine

## Verificare Finală

După ce aplicația este publică, verifică:

1. ✅ **App Review Status**: Toate permisiunile sunt aprobate
2. ✅ **App Status**: Public (nu Development)
3. ✅ **App Domains**: `api.outstand.so`
4. ✅ **Valid OAuth Redirect URIs**: `https://api.outstand.so/v1/oauth/facebook/callback`
5. ✅ **Website URL**: URL-ul tău de producție
6. ✅ **Privacy Policy**: URL-ul este accesibil public
7. ✅ **Terms of Service**: URL-ul este accesibil public

## Timeline Estimativ

- **Pregătire aplicație**: 1-2 ore
- **Creare video demo**: 1-2 ore
- **Completare formular review**: 30 minute - 1 oră
- **Review Facebook**: 1-7 zile (de obicei 2-3 zile)
- **Total**: ~1 săptămână

## Tips pentru Review Rapid

1. **Fii clar și concis** în descrieri
2. **Video-ul trebuie să fie clar** - arată exact ce face aplicația
3. **Folosește conturi de test** - nu conturi reale de producție
4. **Răspunde rapid la întrebări** - Facebook poate cere clarificări
5. **Asigură-te că aplicația funcționează** - reviewer-ii vor testa

## Dacă Review-ul este Respinse

Dacă Facebook respinge cererea:

1. **Citește feedback-ul** - Facebook explică de ce a fost respinsă
2. **Corectează problemele** - adresează fiecare punct
3. **Resubmite** - poți trimite din nou după corectare

## Resurse Utile

- [Facebook App Review Documentation](https://developers.facebook.com/docs/app-review)
- [Facebook Permissions Reference](https://developers.facebook.com/docs/permissions/reference)
- [Outstand Support](https://outstand.so/support)
