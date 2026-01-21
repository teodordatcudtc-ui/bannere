# Cum să Adaugi Permisiuni Facebook - Ghid Pas cu Pas

## Problema

Primești eroarea "Invalid Scopes" pentru că permisiunile nu sunt adăugate sau aprobate în aplicația ta Facebook.

## Soluție: Adaugă Permisiunile

### Pasul 1: Accesează Permissions and Features

⚠️ **IMPORTANT:** Nu confunda "App Review submissions" cu "Permissions and Features"!

- ❌ **"App Review submissions"** - Aici trimiți permisiunile deja adăugate pentru review
- ✅ **"Permissions and Features"** - AICI adaugi permisiuni noi

**Pași:**
1. Mergi la [Facebook Developers](https://developers.facebook.com/apps)
2. Selectează aplicația ta
3. **În sidebar-ul din stânga**, sub secțiunea **"Review"**, caută:
   - **"Permissions and Features"** (NU "App Review submissions")
   - Sau **"Permisiuni și funcții"** (dacă ești în română)
4. **Click pe "Permissions and Features"**

**Dacă nu găsești "Permissions and Features" în sidebar:**
- Click pe link-ul **"customize use cases"** de pe pagina "App Review submissions"
- Sau mergi la **"Use Cases"** → **"Customize"** din sidebar

### Pasul 2: Adaugă Permisiunile

1. **Caută permisiunile necesare:**
   - În câmpul de căutare, caută fiecare permisiune:
     - `pages_show_list`
     - `pages_manage_posts`
     - `pages_read_engagement`
     - `pages_read_user_content`
     - `pages_manage_engagement`
     - `business_management`

2. **Pentru fiecare permisiune:**
   - Dacă apare în listă, click pe **"Request"** sau **"Add"**
   - Dacă nu apare, poate fi căuta în **"Add Permissions"** sau **"Browse"**

3. **Status-ul permisiunilor:**
   - **Standard Access** - Nu necesită review (ex: `public_profile`, `email`)
   - **Advanced Access** - Necesită review (ex: `pages_manage_posts`)

### Pasul 3: Solicită Review pentru Permisiuni

Pentru permisiunile care necesită **Advanced Access**:

1. **Click pe "Request"** lângă permisiunea respectivă
2. **Completează formularul:**

   **Use Case:**
   - Selectează **"Pages API"** sau **"Facebook Login for Business"**

   **How do you use this permission?**
   ```
   Utilizatorii se conectează la paginile lor Facebook prin aplicația mea 
   care folosește Outstand API. Aplicația permite utilizatorilor să programeze 
   și să publice postări automat pe paginile lor Facebook.
   ```

   **Why do you need this permission?**
   ```
   Această permisiune este necesară pentru a permite utilizatorilor să gestioneze 
   conținutul social media de la un singur loc. Utilizatorii pot programa postări 
   pe paginile lor Facebook, ceea ce le economisește timp și le permite să 
   gestioneze mai multe platforme sociale dintr-un singur dashboard.
   ```

   **Video Demo:**
   - Înregistrează un video (2-5 minute) care arată:
     1. Utilizatorul se conectează la Facebook
     2. Selectează pagina Facebook
     3. Creează o postare programată
     4. Postarea este publicată automat
   - Încarcă video-ul

   **Screenshots:**
   - Adaugă 3-5 screenshot-uri din aplicația ta:
     - Pagina de conectare la Facebook
     - Lista paginilor conectate
     - Formularul de programare postare
     - Calendarul cu postările programate

3. **Click pe "Submit for Review"**

### Pasul 4: Permisiuni Care Pot Fi Probleme

#### `business_management`

Această permisiune necesită **Business Verification**:

1. Mergi la **Settings** → **Basic** → **Business Verification**
2. Dacă nu ai Business Verification, poate fi necesar să:
   - Creezi un Business Manager
   - Sau contactezi Outstand pentru a verifica dacă este obligatorie

**Alternativ:** Contactează Outstand pentru a verifica dacă `business_management` poate fi omisă dacă nu folosești Business Manager.

#### `pages_read_user_content` și `pages_manage_engagement`

Aceste permisiuni pot fi deprecate sau necesită Business Verification.

**Soluție:** Contactează Outstand pentru a verifica dacă sunt obligatorii sau pot fi omise.

### Pasul 5: Așteaptă Aprobarea

1. **Review-ul poate dura 1-7 zile** (de obicei 2-3 zile)
2. **Vei primi notificări pe email** despre status
3. **După aprobare**, permisiunile vor fi disponibile

### Pasul 6: Verifică Status-ul

1. Mergi la **App Review** → **Permissions and Features**
2. Verifică status-ul fiecărei permisiuni:
   - ✅ **Approved** - Aprobat
   - ⏳ **In Review** - În review
   - ❌ **Rejected** - Respinse
   - ⚠️ **Expired** - Expirat

## Dacă Permisiunile Nu Apar în Listă

Dacă nu găsești permisiunile în listă:

1. **Verifică că ai adăugat "Use Case" corect:**
   - Mergi la **Use Cases** → **Customize**
   - Adaugă **"Pages API"** sau **"Facebook Login for Business"**

2. **Verifică că aplicația nu este în modul Development:**
   - Unele permisiuni apar doar pentru aplicații publice
   - Sau pentru aplicații care au trecut prin App Review

3. **Contactează Facebook Support:**
   - Dacă permisiunile nu apar deloc, poate fi o problemă cu aplicația
   - Contactează [Facebook Developers Support](https://developers.facebook.com/support/)

## Alternativă: Managed Keys

Dacă nu vrei să treci prin App Review acum:

1. **Contactează Outstand:**
   - Email: contact@outstand.so
   - Solicită Managed Keys pentru Facebook
   - Ei au permisiunile deja aprobate

2. **Avantaje:**
   - ✅ Funcționează imediat
   - ✅ Nu trebuie să treci prin App Review
   - ✅ Permisiunile sunt deja aprobate

## Verificare Finală

După ce ai adăugat permisiunile, verifică:

1. ✅ **Toate permisiunile sunt adăugate** în App Review → Permissions and Features
2. ✅ **Status-ul este "Approved"** sau "In Review"
3. ✅ **Ai trimis pentru review** toate permisiunile necesare
4. ✅ **Ai așteptat aprobarea** (1-7 zile)

## Resurse

- [Facebook App Review Documentation](https://developers.facebook.com/docs/app-review)
- [Facebook Permissions Reference](https://developers.facebook.com/docs/permissions/reference)
- [Outstand Support](mailto:contact@outstand.so)
