# Cum să Adaugi Permisiuni prin "Cazuri de utilizare" - Facebook

## Situația Ta

✅ Aplicația ta este **"Published"** (publicată)  
✅ Vezi sidebar-ul cu "Cazuri de utilizare" (Use Cases)  
❌ Trebuie să adaugi permisiunile necesare Outstand

## Soluție: Folosește "Cazuri de utilizare"

### Pasul 1: Click pe "Cazuri de utilizare"

1. **În sidebar-ul din stânga**, vezi:
   ```
   📋 Cazuri de utilizare
   ```
2. **Click pe "Cazuri de utilizare"**

### Pasul 2: Pe Pagina "Cazuri de utilizare"

Pe această pagină ar trebui să vezi:

1. **Lista de Use Cases existente** (dacă ai deja)
2. **Butonul "Add Use Case"** sau **"Adaugă caz de utilizare"**
3. **Sau link-ul "Customize"** pentru a personaliza use cases

### Pasul 3: Adaugă Use Case pentru Pages API

**Opțiunea 1: Adaugă Use Case Nou**

1. **Click pe "Add Use Case"** sau **"Adaugă caz de utilizare"**
2. **Caută și selectează:**
   - **"Pages API"** (recomandat)
   - Sau **"Facebook Login for Business"**
   - Sau **"Custom Use Case"** dacă nu găsești celelalte

3. **Completează detaliile:**
   - **Nume:** "Gestionare și publicare postări pe pagini Facebook"
   - **Descriere:** "Utilizatorii se conectează la paginile lor Facebook pentru a programa și publica postări automat prin Outstand API"

**Opțiunea 2: Customize Use Case Existente**

1. **Dacă vezi un link "Customize"** sau **"Personalizează"**, click pe el
2. **Acolo vei putea adăuga permisiuni** pentru use case-urile existente

### Pasul 4: Adaugă Permisiunile

După ce ai adăugat Use Case-ul, vei putea adăuga permisiunile asociate:

1. **În secțiunea de permisiuni pentru Use Case**, caută și adaugă:
   - ✅ `pages_show_list` - Lista paginilor
   - ✅ `pages_manage_posts` - Publicarea postărilor
   - ✅ `pages_read_engagement` - Citirea interacțiunilor
   - ⚠️ `pages_read_user_content` - Citirea conținutului (poate fi deprecat)
   - ⚠️ `pages_manage_engagement` - Gestionarea interacțiunilor (poate fi deprecat)
   - ⚠️ `business_management` - Doar dacă folosești Business Manager

2. **Pentru fiecare permisiune:**
   - Click pe **"Request"** sau **"Add"**
   - Completează formularul de review (vezi mai jos)

### Pasul 5: Completează Formularul de Review

Pentru fiecare permisiune care necesită review:

**1. How do you use this permission?**
```
Users connect their Facebook Pages through my application which uses Outstand API. 
The application allows users to schedule and automatically publish posts on their Facebook Pages.
```

**2. Why do you need this permission?**
```
This permission is required to allow users to manage their social media content from a single location. 
Users can schedule posts on their Facebook Pages, which saves time and allows them to manage 
multiple social platforms from one dashboard.
```

**3. Video Demo (Recomandat):**
- Înregistrează un video (2-5 minute) care arată:
  1. Utilizatorul se conectează la Facebook
  2. Selectează pagina Facebook
  3. Creează o postare programată
  4. Postarea este publicată automat
- Încarcă video-ul

**4. Screenshots (Obligatoriu):**
- Adaugă 3-5 screenshot-uri din aplicația ta:
  - Pagina de conectare la Facebook (`/dashboard/settings`)
  - Lista paginilor conectate
  - Formularul de programare postare (`/dashboard/schedule`)
  - Calendarul cu postările programate

**5. Click pe "Submit for Review"**

### Pasul 6: Alternativă - Mergi Direct la Permissions

Dacă în "Cazuri de utilizare" nu găsești unde să adaugi permisiuni direct:

1. **Din "Cazuri de utilizare"**, caută link-ul:
   - **"Permissions and Features"** sau
   - **"Permisiuni și funcții"** sau
   - **"View all permissions"**

2. **Click pe link-ul respectiv** - te va duce la pagina unde poți adăuga permisiuni direct

## Dacă Nu Găsești "Cazuri de utilizare" în Sidebar

### Verifică Sidebar-ul Complet

1. **Scroll în sidebar** până jos
2. **Caută sub secțiunea "Review":**
   - **"Permissions and Features"** (sau "Permisiuni și funcții")
   - **"App Review submissions"**
   - **"Use Cases"** sau **"Cazuri de utilizare"**

### Sau Accesează Direct

Încearcă să accesezi direct URL-urile:

**Pentru Use Cases:**
```
https://developers.facebook.com/apps/[YOUR_APP_ID]/use-cases/
```

**Pentru Permissions:**
```
https://developers.facebook.com/apps/[YOUR_APP_ID]/app-review/permissions/
```

Înlocuiește `[YOUR_APP_ID]` cu ID-ul aplicației tale (găsești în Settings → Basic).

## Permisiuni Minimale Necesare

Pentru a posta pe pagini Facebook prin Outstand, ai nevoie de **MINIM**:

1. ✅ `pages_show_list` - **OBLIGATORIU** - Lista paginilor
2. ✅ `pages_manage_posts` - **OBLIGATORIU** - Publicarea postărilor

**Opțional** (pentru funcții avansate):
3. `pages_read_engagement` - Statistici
4. `pages_read_user_content` - Citire conținut (poate fi deprecat)
5. `pages_manage_engagement` - Gestionare interacțiuni (poate fi deprecat)
6. `business_management` - Doar dacă folosești Business Manager

## Verificare Finală

După ce ai adăugat permisiunile:

1. ✅ **Mergi la "Review" → "App Review submissions"** (sau "Analiza aplicației")
2. ✅ **Verifică că vezi permisiunile noi** în lista "New requests"
3. ✅ **Status-ul ar trebui să fie "In Review"** sau "Pending"
4. ✅ **Așteaptă aprobarea** (1-7 zile, de obicei 2-3 zile)

## Notă Importantă

- **"Cazuri de utilizare"** (Use Cases) = Definești de ce ai nevoie de permisiuni
- **"Permissions and Features"** = Adaugi permisiuni specifice
- **"App Review submissions"** = Vezi ce ai trimis pentru review

Încearcă mai întâi "Cazuri de utilizare", apoi caută link-ul către "Permissions and Features" dacă nu găsești direct permisiunile.
