# Configurare Domenii Facebook - Rezolvare Eroare "URL-ul nu poate fi încărcat"

## Problema

Când încerci să te conectezi la Facebook, primești eroarea:
> "URL-ul nu poate fi încărcat. Domeniul acestui URL nu este inclus în domeniile aplicaţiei."

## Soluție

Trebuie să configurezi domeniile și redirect URI-urile în aplicația ta Facebook.

### Pasul 1: Accesează Facebook Developer Console

1. Mergi la [Facebook Developers](https://developers.facebook.com/apps)
2. Selectează aplicația ta (sau creează una nouă)
3. Mergi la **Settings** → **Basic**

### Pasul 2: Configurează App Domains

În secțiunea **App Domains**, adaugă:
```
outstand.so
```

⚠️ **IMPORTANT:** `outstand.so` (NU `api.outstand.so`) - conform documentației Outstand

**Notă:** Nu include `http://` sau `https://`, doar domeniul.

### Pasul 3: Configurează Website URL

În secțiunea **Website**, adaugă:
```
https://www.outstand.so
```

Sau URL-ul tău de producție dacă ai unul.

### Pasul 4: Configurează OAuth Redirect URIs

1. Mergi la **Products** → **Facebook Login** → **Settings**
2. În secțiunea **Valid OAuth Redirect URIs**, adaugă:
   ```
   https://www.outstand.so/app/api/socials/facebook/callback
   ```
   
   ⚠️ **IMPORTANT:** Acesta este callback-ul Outstand conform documentației oficiale (NU `api.outstand.so/v1/oauth/facebook/callback`)
   
   **Dacă folosești white-labeling (flow-ul nostru), adaugă și:**
   ```
   https://yourdomain.com/api/social-accounts/callback
   ```
   
   **Pentru testare locală** (opțional):
   ```
   http://localhost:3000/api/social-accounts/callback
   ```

3. Asigură-te că sunt activate:
   - ✅ **Client OAuth Login**
   - ✅ **Web OAuth Login**

### Pasul 5: Salvează și Testează

1. Click pe **Save Changes** în partea de jos a paginii
2. Așteaptă 1-2 minute pentru ca modificările să fie propagate
3. Încearcă din nou să te conectezi la Facebook din aplicația ta

## Verificare Rapidă

După ce ai făcut modificările, verifică:

1. **App Domains** conține: `api.outstand.so`
2. **Valid OAuth Redirect URIs** conține: `https://api.outstand.so/v1/oauth/facebook/callback`
3. **Client OAuth Login** este activat
4. **Web OAuth Login** este activat

## Dacă Problema Persistă

### 1. Verifică Website URL
În **Settings** → **Basic**, asigură-te că ai configurat:
- **Website** → **Site URL**: `https://api.outstand.so` (sau URL-ul tău de producție)

### 2. Modul Development - Adaugă Testeri
Dacă aplicația ta este în modul **Development** (nu este publicată), doar administratorii și testerii pot folosi OAuth.

**Soluție:**
1. Mergi la **Roles** → **Testers** (sau **Roles** → **Roles** în sidebar)
2. Click pe **Add Testers**
3. Adaugă contul tău de Facebook (sau conturile care vor testa)
4. Utilizatorii adăugați vor primi o invitație pe Facebook
5. Trebuie să accepte invitația înainte să poată folosi OAuth

**Alternativ:** Publică aplicația (dar nu este necesar pentru testare dacă adaugi testeri)

### 3. Verifică că ai salvat modificările
- Facebook necesită câteva minute pentru propagare (până la 5 minute)
- Asigură-te că ai dat **Save Changes** în toate tab-urile

### 4. Verifică că ai adăugat corect domeniul
- **App Domains**: Doar `api.outstand.so` (fără `http://` sau `https://`)
- **Valid OAuth Redirect URIs**: `https://api.outstand.so/v1/oauth/facebook/callback` (cu protocol complet)

### 5. Verifică Platform Settings
În **Settings** → **Basic** → **Platforms**, asigură-te că:
- **Website** este adăugată ca platformă
- **Facebook Login** este adăugată ca platformă

### 6. Contactează Outstand Support
Dacă problema persistă, poate că Outstand folosește un alt domeniu sau format de callback. Contactează suportul Outstand pentru a confirma exact ce redirect URI folosesc.

## Note Importante

- **App Domains** trebuie să fie doar domeniul (fără protocol sau path)
- **Valid OAuth Redirect URIs** trebuie să fie URL-uri complete (cu protocol și path)
- Modificările pot dura până la 5 minute pentru a fi active
- Dacă aplicația este în modul Development, doar utilizatorii adăugați ca "Roles" → "Testers" pot folosi OAuth
