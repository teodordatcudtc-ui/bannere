# Rezolvare Eroare "An error occurred" la Adăugarea Platformei Website - Facebook

## Problema

Când încerci să adaugi platforma "Website" în Facebook Developer Console și să setezi "Site URL" la `https://socialpilot-ten.vercel.app/`, primești eroarea:
> "An error occurred. Please try again."

## Cauze Posibile

1. **Domeniul nu este în "App Domains"** - Cel mai comun motiv
2. **URL-ul nu este accesibil sau valid**
3. **Formatarea URL-ului este greșită**
4. **Aplicația nu are toate setările de bază completate**

## Soluție Pas cu Pas

### Pasul 1: Verifică și Completează Settings → Basic

1. **Mergi la [Facebook Developers](https://developers.facebook.com/apps)**
2. **Selectează aplicația ta**
3. **Mergi la Settings → Basic**

### Pasul 2: Configurează App Domains (CRITIC!)

⚠️ **IMPORTANT:** Înainte de a adăuga platforma "Website", trebuie să adaugi domeniul în "App Domains".

În secțiunea **App Domains**, adaugă:
```
socialpilot-ten.vercel.app
```

**Sau dacă folosești un domeniu custom:**
```
yourdomain.com
```

**Notă:** 
- Nu include `http://` sau `https://`, doar domeniul
- Nu include path-uri (fără `/` la sfârșit)
- Pentru Vercel, folosește formatul `your-app.vercel.app`

### Pasul 3: Completează Câmpurile Obligatorii

Asigură-te că ai completat:
- ✅ **App Name** - Numele aplicației
- ✅ **App ID** - Generat automat
- ✅ **App Secret** - Generat automat (click pe "Show" pentru a-l vedea)
- ✅ **Contact Email** - Email-ul tău
- ✅ **App Domains** - `socialpilot-ten.vercel.app` (sau domeniul tău)

### Pasul 4: Salvează Modificările din Basic

1. **Click pe "Save Changes"** în partea de jos a paginii Settings → Basic
2. **Așteaptă 2-3 secunde** pentru ca modificările să fie salvate
3. **Verifică că nu apar erori**

### Pasul 5: Acum Adaugă Platforma Website

1. **Mergi la Settings → Basic**
2. **Scroll până la secțiunea "Platforms"** (sau click pe "+ Add Platform")
3. **Click pe "+ Add Platform"**
4. **Selectează "Website"**

### Pasul 6: Completează Site URL

În câmpul **Site URL**, adaugă:
```
https://socialpilot-ten.vercel.app
```

**IMPORTANT:**
- ✅ Include `https://`
- ✅ Nu include `/` la sfârșit (sau include dacă vrei)
- ✅ URL-ul trebuie să fie accesibil (să se încarce în browser)

### Pasul 7: Salvează Platforma Website

1. **Click pe "Save Changes"** în partea de jos
2. **Dacă apare eroare, continuă cu următorii pași**

## Dacă Eroarea Persistă

### Soluția 1: Verifică Formatarea URL-ului

Încearcă aceste variante pentru Site URL:
```
https://socialpilot-ten.vercel.app
https://socialpilot-ten.vercel.app/
```

**Nu folosi:**
- ❌ `http://socialpilot-ten.vercel.app` (fără `s` în `https`)
- ❌ `socialpilot-ten.vercel.app` (fără protocol)
- ❌ `https://socialpilot-ten.vercel.app/dashboard` (cu path)

### Soluția 2: Verifică că URL-ul este Accesibil

1. **Deschide un browser nou**
2. **Accesează:** `https://socialpilot-ten.vercel.app`
3. **Verifică că site-ul se încarcă fără erori**
4. **Dacă nu se încarcă, problema este la Vercel, nu la Facebook**

### Soluția 3: Verifică App Domains

1. **Mergi la Settings → Basic**
2. **Verifică că "App Domains" conține:**
   ```
   socialpilot-ten.vercel.app
   ```
3. **Dacă nu este acolo, adaugă-l și salvează**
4. **Așteaptă 1-2 minute**
5. **Încearcă din nou să adaugi platforma Website**

### Soluția 4: Șterge și Adaugă Din Nou

1. **Dacă platforma Website există deja:**
   - Click pe "Website" în lista de platforme
   - Click pe "Remove Platform" sau "Delete"
   - Confirmă ștergerea
2. **Așteaptă 5 secunde**
3. **Adaugă din nou platforma Website** (urmează Pașii 5-7)

### Soluția 5: Verifică Consola Browser-ului

1. **Deschide Developer Tools** (F12)
2. **Mergi la tab-ul "Console"**
3. **Încearcă să salvezi platforma Website**
4. **Verifică dacă apar erori JavaScript**
5. **Dacă apar erori, copiază-le și caută soluții online**

### Soluția 6: Încearcă cu un Browser Diferit

1. **Încearcă cu Chrome** (dacă folosești alt browser)
2. **Sau încearcă cu Firefox** (dacă folosești Chrome)
3. **Șterge cache-ul browser-ului** (Ctrl+Shift+Delete)
4. **Încearcă din nou**

### Soluția 7: Verifică că Aplicația Nu Este Blocată

1. **Mergi la Settings → Basic**
2. **Verifică status-ul aplicației:**
   - Dacă este "In Development", este OK
   - Dacă este "Live", este OK
   - Dacă este "Restricted" sau "Suspended", contactează Facebook Support

## Configurație Recomandată Finală

După ce ai adăugat platforma Website cu succes, configurația ta ar trebui să fie:

### Settings → Basic:
- **App Domains:**
  ```
  outstand.so
  socialpilot-ten.vercel.app
  ```
  (Ambele domenii, dacă folosești Outstand)

- **Website → Site URL:**
  ```
  https://socialpilot-ten.vercel.app
  ```

### Products → Facebook Login → Settings:
- **Valid OAuth Redirect URIs:**
  ```
  https://www.outstand.so/app/api/socials/facebook/callback
  https://socialpilot-ten.vercel.app/api/social-accounts/callback
  ```

## Verificare Finală

După ce ai adăugat platforma Website:

1. ✅ **App Domains** conține domeniul tău
2. ✅ **Website → Site URL** este setat corect
3. ✅ **Nu apar erori** când salvezi
4. ✅ **Poți adăuga "Reviewer Instructions"** (dacă este necesar)

## Dacă Tot Nu Funcționează

1. **Contactează Facebook Support:**
   - Mergi la [Facebook Developers Support](https://developers.facebook.com/support/)
   - Creează un ticket de suport
   - Menționează eroarea exactă și pașii pe care i-ai urmat

2. **Verifică Status-ul Facebook:**
   - Verifică dacă există probleme cu Facebook Developer Console
   - [Facebook Platform Status](https://developers.facebook.com/status/)

3. **Așteaptă și Încearcă Din Nou:**
   - Uneori Facebook are probleme temporare
   - Așteaptă 10-15 minute și încearcă din nou

## Notă Importantă

Dacă aplicația ta folosește Outstand.so pentru OAuth, trebuie să ai **AMBELE** domenii în App Domains:
- `outstand.so` (pentru OAuth flow-ul Outstand)
- `socialpilot-ten.vercel.app` (pentru aplicația ta)

Aceasta este configurația corectă pentru white-labeling cu Outstand.
