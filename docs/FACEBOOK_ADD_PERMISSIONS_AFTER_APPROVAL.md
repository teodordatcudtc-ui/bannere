# Cum să Adaugi Permisiuni După Aprobarea public_profile - Facebook

## Situația Ta

✅ Ai primit aprobare pentru `public_profile`  
❌ Dar nu găsești unde să adaugi permisiunile avansate de care are nevoie Outstand:
- `pages_show_list`
- `pages_manage_posts`
- `pages_read_engagement`
- `pages_read_user_content`
- `pages_manage_engagement`
- `business_management` (opțional)

## ⚠️ IMPORTANT: Diferența dintre Secțiuni

### ❌ "App Review submissions" (Unde ești acum)
- **AICI** vezi permisiunile deja trimise pentru review
- **AICI** vezi status-ul aprobărilor (ex: `public_profile` - Approved)
- **NU AICI** adaugi permisiuni noi!

### ✅ "Permissions and Features" (Unde trebuie să mergi)
- **AICI** adaugi permisiuni noi
- **AICI** vezi toate permisiunile disponibile
- **AICI** trimiți permisiuni noi pentru review

## Soluție: Pași Exacti

### Pasul 1: Ieși din "App Review submissions"

1. **Ești pe pagina "App Review submissions"** (unde vezi `public_profile` - Approved)
2. **În sidebar-ul din stânga**, sub secțiunea **"Review"**, caută:
   - **"Permissions and Features"** (sau **"Permisiuni și funcții"** în română)
   - **NU** "App Review submissions" (acolo ești acum)

### Pasul 2: Click pe "Permissions and Features"

1. **În sidebar**, sub secțiunea **"Review"**, click pe:
   ```
   📋 Permissions and Features
   ```
   (sau **"Permisiuni și funcții"** dacă ești în română)

2. **Dacă nu vezi "Permissions and Features" în sidebar:**
   - Scroll în sidebar până găsești secțiunea **"Review"**
   - Sau caută în sidebar după cuvântul **"Permissions"**
   - Sau click pe **"Use Cases"** → **"Customize"**

### Pasul 3: Pe Pagina "Permissions and Features"

Pe această pagină ar trebui să vezi:

1. **Un câmp de căutare** în partea de sus (ex: "Search permissions...")
2. **O listă de permisiuni** disponibile
3. **Butonul "Add Permissions"** sau **"Browse"** (în partea de sus sau jos)

### Pasul 4: Caută și Adaugă Permisiunile

**Metoda 1: Căutare Directă**

1. **În câmpul de căutare**, caută fiecare permisiune:
   ```
   pages_show_list
   ```
   - Dacă apare în listă, vei vedea un buton **"Request"** sau **"Add"** lângă ea
   - Click pe **"Request"** sau **"Add"**

2. **Repetă pentru fiecare permisiune:**
   - `pages_show_list`
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_read_user_content`
   - `pages_manage_engagement`
   - `business_management` (doar dacă folosești Business Manager)

**Metoda 2: Browse Permissions**

1. **Click pe butonul "Add Permissions"** sau **"Browse"**
2. **Caută în listă** sau **filtrează după categorie:**
   - Caută categoria **"Pages"** sau **"Page Management"**
   - Sau caută direct numele permisiunii

3. **Pentru fiecare permisiune găsită:**
   - Click pe **"Request"** sau **"Add"**

### Pasul 5: Completează Formularul de Review

După ce click pe **"Request"** pentru o permisiune, vei vedea un formular:

**1. Use Case:**
- Selectează **"Pages API"** sau **"Facebook Login for Business"**
- Sau **"Custom Use Case"** dacă nu găsești celelalte

**2. How do you use this permission?**
```
Users connect their Facebook Pages through my application which uses Outstand API. 
The application allows users to schedule and automatically publish posts on their Facebook Pages.
```

**3. Why do you need this permission?**
```
This permission is required to allow users to manage their social media content from a single location. 
Users can schedule posts on their Facebook Pages, which saves time and allows them to manage 
multiple social platforms from one dashboard.
```

**4. Video Demo (Recomandat):**
- Înregistrează un video (2-5 minute) care arată:
  1. Utilizatorul se conectează la Facebook
  2. Selectează pagina Facebook
  3. Creează o postare programată
  4. Postarea este publicată automat
- Încarcă video-ul

**5. Screenshots (Obligatoriu):**
- Adaugă 3-5 screenshot-uri din aplicația ta:
  - Pagina de conectare la Facebook
  - Lista paginilor conectate
  - Formularul de programare postare
  - Calendarul cu postările programate

**6. Click pe "Submit for Review"**

### Pasul 6: Repetă pentru Toate Permisiunile

Repetă **Pasul 4** și **Pasul 5** pentru fiecare permisiune:
- `pages_show_list` ✅
- `pages_manage_posts` ✅
- `pages_read_engagement` ✅
- `pages_read_user_content` ✅
- `pages_manage_engagement` ✅
- `business_management` (opțional) ⚠️

## Dacă Nu Găsești "Permissions and Features"

### Opțiunea 1: Click pe "customize use cases"

Pe pagina "App Review submissions", vezi un link:
> "To remove permissions and features from your app, not just App Review, **customize use cases**"

1. **Click pe "customize use cases"**
2. Acolo ar trebui să poți adăuga permisiuni noi

### Opțiunea 2: Mergi Direct la Use Cases

1. **În sidebar**, caută **"Use Cases"** (cu iconița de creion sau listă)
2. **Click pe "Use Cases"** → **"Customize"**
3. Acolo ar trebui să poți adăuga permisiuni pentru Use Case-ul tău

### Opțiunea 3: Din Facebook Login Settings

1. **Mergi la Products → Facebook Login → Settings**
2. Scroll până jos
3. Caută secțiunea **"Permissions"** sau **"Requested Permissions"**
4. Acolo ar trebui să poți adăuga permisiuni

### Opțiunea 4: URL Direct

Încearcă să accesezi direct:
```
https://developers.facebook.com/apps/[YOUR_APP_ID]/app-review/permissions/
```

Înlocuiește `[YOUR_APP_ID]` cu ID-ul aplicației tale (găsești în Settings → Basic).

## Verificare: Unde Ești Acum?

### ❌ Ești pe "App Review submissions" dacă:
- Vezi mesajul "Submission approved" pentru `public_profile`
- Vezi lista "Previous submissions"
- Vezi butonul "View request details"

### ✅ Ești pe "Permissions and Features" dacă:
- Vezi un câmp de căutare pentru permisiuni
- Vezi o listă lungă de permisiuni disponibile
- Vezi butoane "Request" sau "Add" lângă permisiuni
- Vezi butonul "Add Permissions" sau "Browse"

## Permisiuni Minimale Necesare

Pentru a posta pe pagini Facebook prin Outstand, ai nevoie de **MINIM**:

1. ✅ `pages_show_list` - **OBLIGATORIU** - Lista paginilor
2. ✅ `pages_manage_posts` - **OBLIGATORIU** - Publicarea postărilor

**Opțional** (pentru funcții avansate):
3. `pages_read_engagement` - Statistici
4. `pages_read_user_content` - Citire conținut (poate fi deprecat)
5. `pages_manage_engagement` - Gestionare interacțiuni (poate fi deprecat)
6. `business_management` - Doar dacă folosești Business Manager

## Dacă Tot Nu Găsești

### Contactează Facebook Support

1. **Mergi la [Facebook Developers Support](https://developers.facebook.com/support/)**
2. **Creează un ticket de suport**
3. **Explică:**
   ```
   I received approval for public_profile, but I cannot find where to add 
   advanced permissions (pages_show_list, pages_manage_posts, etc.) for my app. 
   I am on the "App Review submissions" page, but I need to find "Permissions and Features" 
   to add new permissions. Can you guide me to the correct section?
   ```

### Alternativă: Managed Keys de la Outstand

Dacă nu găsești unde să adaugi permisiunile, contactează Outstand pentru **Managed Keys**:

1. **Email:** contact@outstand.so
2. **Solicită:** Managed Keys pentru Facebook
3. **Avantaje:**
   - ✅ Funcționează imediat
   - ✅ Nu trebuie să treci prin App Review
   - ✅ Permisiunile sunt deja aprobate de Outstand

## Verificare Finală

După ce ai adăugat permisiunile:

1. ✅ **Mergi la "App Review submissions"**
2. ✅ **Verifică că vezi permisiunile noi** în lista "New requests"
3. ✅ **Status-ul ar trebui să fie "In Review"** sau "Pending"
4. ✅ **Așteaptă aprobarea** (1-7 zile, de obicei 2-3 zile)

## Notă Importantă

- **"App Review submissions"** = Vezi ce ai trimis deja
- **"Permissions and Features"** = Adaugi permisiuni noi
- **"Use Cases"** = Configurezi cazuri de utilizare

Trebuie să mergi la **"Permissions and Features"** pentru a adăuga permisiuni noi!
