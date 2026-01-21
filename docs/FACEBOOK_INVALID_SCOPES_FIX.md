# Rezolvare: "Invalid Scopes" Facebook

## Problema

Primești eroarea:
> "Invalid Scopes: pages_read_user_content, business_management, pages_show_list, pages_manage_posts, pages_read_engagement, pages_manage_engagement. This message is only shown to developers."

## Cauza

Conform documentației oficiale Outstand, ei solicită următoarele permisiuni:
- `pages_read_user_content` - Basic Facebook Page access
- `business_management` - Permission to manage business pages
- `pages_show_list` - Permission to read engagement metrics
- `pages_manage_posts` - Permission to publish posts
- `pages_read_engagement` - Permission to read engagement metrics
- `pages_manage_engagement` - Permission to interact with engagement

Dacă primești eroarea "Invalid Scopes", poate fi din cauza:
- Unele permisiuni nu mai sunt valide în Facebook Graph API
- Permisiunile nu au fost aprobate prin App Review
- Aplicația nu are Business Verification (pentru `business_management`)

## Permisiuni Valide pentru Facebook Pages (2024)

### Permisiuni de bază (nu necesită review):
- `public_profile` - Informații publice de profil
- `email` - Adresa de email

### Permisiuni pentru Pages (conform Outstand):
- `pages_show_list` - ✅ VALID - Lista paginilor
- `pages_read_engagement` - ✅ VALID - Citirea interacțiunilor
- `pages_manage_posts` - ✅ VALID - Publicarea postărilor
- `pages_read_user_content` - ⚠️ VERIFICĂ - Poate necesita Business Verification
- `pages_manage_engagement` - ⚠️ VERIFICĂ - Poate necesita Business Verification
- `business_management` - ✅ VALID - Dar necesită Business Manager sau Business Verification

### Permisiuni care au fost redenumite:
- `pages_read_user_content` → Poate fi înlocuit cu `pages_read_engagement`
- `pages_manage_engagement` → Poate fi înlocuit cu `pages_manage_posts`

## Soluție: Adaugă și Aprobă Permisiunile

### Pasul 1: Adaugă Permisiunile în Facebook Developer Console

1. **Mergi la [Facebook Developers](https://developers.facebook.com/apps)**
2. **Selectează aplicația ta**
3. **Mergi la App Review → Permissions and Features**

4. **Caută și adaugă permisiunile necesare:**
   - Click pe **"Add Permissions"** sau caută fiecare permisiune
   - Adaugă următoarele permisiuni:
     - `pages_show_list`
     - `pages_manage_posts`
     - `pages_read_engagement`
     - `pages_read_user_content`
     - `pages_manage_engagement`
     - `business_management` (doar dacă folosești Business Manager)

5. **Pentru fiecare permisiune:**
   - Click pe **"Request"** lângă permisiunea respectivă
   - Completează formularul de review (vezi mai jos)

### Pasul 2: Completează App Review pentru Permisiuni

Pentru fiecare permisiune care necesită review:

1. **Click pe "Request"** lângă permisiunea respectivă
2. **Completează formularul:**
   - **How do you use this permission?**: 
     - "Utilizatorii se conectează la paginile lor Facebook prin Outstand API pentru a programa și publica postări automat."
   - **Why do you need this permission?**:
     - "Permite utilizatorilor să gestioneze conținutul social media de la un singur loc, programând postări pe paginile lor Facebook."
   - **Video Demo**: Încarcă un video care arată flow-ul complet
   - **Screenshots**: Adaugă screenshot-uri din aplicația ta

3. **Trimite pentru review**

### Pasul 3: Verifică Business Verification (pentru business_management)

Dacă Outstand solicită `business_management`, poate fi necesară Business Verification:

1. Mergi la **Settings** → **Basic** → **Business Verification**
2. Verifică dacă aplicația ta are Business Verification
3. Dacă nu, poate fi necesar să o obții pentru `business_management`

**Alternativ:** Contactează Outstand pentru a verifica dacă `business_management` este obligatoriu sau poate fi omis.

### Pasul 4: Așteaptă Aprobarea

- Review-ul poate dura 1-7 zile (de obicei 2-3 zile)
- Vei primi notificări pe email despre status
- După aprobare, permisiunile vor fi disponibile

## Soluție Rapidă: Folosește Managed Keys

Dacă nu vrei să treci prin App Review acum, poți folosi **Managed Keys** de la Outstand:

1. **Contactează Outstand:**
   - Email: contact@outstand.so
   - Solicită Managed Keys pentru Facebook
   - Ei au permisiunile deja aprobate

2. **Avantaje:**
   - ✅ Nu trebuie să treci prin App Review
   - ✅ Permisiunile sunt deja aprobate
   - ✅ Funcționează imediat

3. **Dezavantaje:**
   - ❌ Costă extra (contactează Outstand pentru prețuri)
   - ❌ Mai puțin control asupra configurației

## Soluție: Verifică Business Verification

Dacă primești eroarea "Invalid Scopes", poate fi din cauza că aplicația ta nu are **Business Verification**.

1. Mergi la **Settings** → **Basic** → **Business Verification**
2. Verifică dacă aplicația ta are Business Verification
3. Dacă nu, poate fi necesar să o obții pentru unele permisiuni (ex: `business_management`)

### Opțiunea 2: Contactează Outstand Support

Dacă problema persistă, contactează Outstand pentru clarificări.

**Email:** contact@outstand.so (conform documentației lor)

**Mesaj exemplu:**
```
Salut,

Am o problemă cu conectarea la Facebook prin Outstand. 
Facebook returnează eroarea:
"Invalid Scopes: pages_read_user_content, business_management, 
pages_show_list, pages_manage_posts, pages_read_engagement, 
pages_manage_engagement"

Se pare că unele permisiuni nu mai sunt valide sau au fost deprecate.
Poți verifica și actualiza permisiunile solicitate pentru Facebook?

Permisiunile valide pentru 2024 ar trebui să fie:
- pages_show_list
- pages_read_engagement  
- pages_manage_posts

Mulțumesc!
```

### Opțiunea 2: Verifică Configurarea în Outstand Dashboard

1. Mergi la [Outstand Dashboard](https://app.outstand.so)
2. Mergi la **Settings** → **Social Networks** → **Facebook**
3. Verifică dacă există o opțiune pentru a configura permisiunile (scopes)
4. Dacă există, configurează doar permisiunile valide:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`

### Opțiunea 3: Verifică Documentația Outstand

Verifică documentația Outstand pentru Facebook pentru a vedea:
- Ce permisiuni solicită exact
- Dacă există o modalitate de a configura permisiunile
- Dacă există o versiune actualizată a API-ului

## Permisiuni Recomandate pentru Aplicația Ta

Pentru a posta pe pagini Facebook, ai nevoie de:

### Minim necesar:
- `pages_show_list` - pentru a lista paginile
- `pages_manage_posts` - pentru a posta

### Opțional (pentru funcții avansate):
- `pages_read_engagement` - pentru statistici
- `pages_read_user_content` - dacă este încă suportat

### NU este necesar:
- `business_management` - doar dacă folosești Business Manager
- `pages_manage_engagement` - poate fi deprecat

## Verificare în Facebook Developer Console

1. Mergi la **App Review** → **Permissions and Features**
2. Verifică ce permisiuni ai solicitat
3. Verifică status-ul fiecărei permisiuni:
   - ✅ Aprobat
   - ⏳ În review
   - ❌ Respinse
   - ⚠️ Deprecat

4. Dacă vezi permisiuni deprecate, elimină-le din cerere

## Dacă Outstand Nu Poate Actualiza Permisiunile

Dacă Outstand nu poate actualiza permisiunile imediat, poți:

1. **Folosește Managed Keys de la Outstand:**
   - Outstand gestionează credențialele
   - Ei au permisiunile deja configurate corect
   - Contactează Outstand pentru Managed Keys

2. **Așteaptă actualizarea Outstand:**
   - Contactează suportul Outstand
   - Solicită actualizarea permisiunilor
   - Așteaptă o versiune nouă care să folosească permisiuni valide

## Verificare Rapidă

Înainte de a contacta Outstand, verifică:

1. ✅ **Ce permisiuni exact solicită Outstand?** (verifică în Developer Tools)
2. ✅ **Ce permisiuni sunt valide în 2024?** (verifică documentația Facebook)
3. ✅ **Poți configura permisiunile în Outstand Dashboard?**
4. ✅ **Există o versiune actualizată a Outstand API?**

## Resurse

- [Facebook Permissions Reference](https://developers.facebook.com/docs/permissions/reference)
- [Facebook Pages Permissions](https://developers.facebook.com/docs/pages/overview/permissions)
- [Outstand Support](mailto:support@outstand.so)

## Notă Importantă

Această problemă este de obicei cauzată de Outstand care folosește permisiuni deprecate. Trebuie să contactezi Outstand pentru a actualiza permisiunile la versiunile valide.
