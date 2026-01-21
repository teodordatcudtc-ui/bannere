# Rezolvare: "Use Strict Mode" Blocat - Facebook

## Problema

"Use Strict Mode for redirect URIs" este activat și blocat (nu poți să îl dezactivezi). În acest caz, trebuie să adaugi **EXACT** redirect URI-ul pe care îl trimite Outstand.

## De ce este blocat?

"Use Strict Mode" poate deveni blocat dacă:
- Aplicația este publică
- Ai folosit deja OAuth
- Facebook a detectat activitate OAuth
- Este o setare de securitate impusă de Facebook

## Soluție: Găsește Redirect URI-ul Exact

### Pasul 1: Verifică ce Redirect URI trimite Outstand

1. **Deschide Developer Tools în browser:**
   - Apasă `F12` sau click dreapta → "Inspect"
   - Mergi la tab-ul **Network**

2. **Încearcă să te conectezi la Facebook:**
   - Click pe "Conectează la Facebook" în aplicația ta
   - Urmărește request-urile în tab-ul Network

3. **Caută request-ul către Facebook:**
   - Caută request-uri către `facebook.com` sau `graph.facebook.com`
   - Sau request-uri către `outstand.so`

4. **Verifică parametrul `redirect_uri`:**
   - Click pe request-ul relevant
   - Mergi la tab-ul **Payload** sau **Query String Parameters**
   - Caută parametrul `redirect_uri` sau `redirect_uri`
   - Copiază **EXACT** valoarea (inclusiv parametri query dacă există)

### Pasul 2: Adaugă Redirect URI-ul Exact în Facebook

1. Mergi la **Facebook Developers** → **Products** → **Facebook Login** → **Settings**
2. În **Valid OAuth Redirect URIs**, adaugă **EXACT** redirect URI-ul găsit:
   - Dacă este: `https://api.outstand.so/v1/oauth/facebook/callback?session=abc123`
   - Adaugă-l exact așa (dar fără valoarea specifică a session-ului)

**PROBLEMĂ:** Facebook nu acceptă wildcards în redirect URI-uri în modul strict.

### Pasul 3: Contactează Outstand Support

Deoarece Facebook nu acceptă wildcards și Outstand probabil adaugă parametri dinamici, trebuie să contactezi Outstand:

**Email:** support@outstand.so

**Întreabă:**
1. Ce redirect URI exact folosesc pentru Facebook OAuth?
2. Adaugă parametri query la redirect URI (ex: `?session=...`)?
3. Există o modalitate de a configura redirect URI-ul fără parametri query?
4. Există o modalitate de a dezactiva parametrii query pentru redirect URI?

### Pasul 4: Soluții Alternative

#### Opțiunea A: Configurează Redirect URI în Outstand

Poate că Outstand permite configurarea redirect URI-ului direct în dashboard-ul lor:

1. Mergi la [Outstand Dashboard](https://app.outstand.so)
2. Mergi la **Settings** → **Social Networks** → **Facebook**
3. Verifică dacă există o opțiune pentru a configura redirect URI-ul
4. Configurează-l să nu adauge parametri query sau să folosească un format specific

#### Opțiunea B: Folosește Callback-ul Tău Direct

Dacă Outstand permite, poți configura să folosească callback-ul tău direct în loc de callback-ul lor:

1. În Outstand Dashboard, verifică dacă poți seta redirect URI-ul
2. Setează-l la: `https://yourdomain.com/api/social-accounts/callback`
3. Adaugă acest URI în Facebook: `https://yourdomain.com/api/social-accounts/callback`
4. Apoi redirectează manual către Outstand din callback-ul tău

**Notă:** Această opțiune necesită modificări în cod și poate să nu fie suportată de Outstand.

#### Opțiunea C: Contactează Facebook Support

Dacă "Use Strict Mode" este blocat din greșeală:

1. Mergi la [Facebook Developers Support](https://developers.facebook.com/support/)
2. Creează un ticket de suport
3. Explică că ai nevoie să dezactivezi "Use Strict Mode"
4. Sau explică că ai nevoie să adaugi redirect URI-uri cu parametri query

## Verificare Rapidă

Înainte de a contacta suportul, verifică:

1. ✅ **Ce redirect URI exact trimite Outstand?** (folosește Developer Tools)
2. ✅ **Outstand adaugă parametri query?** (ex: `?session=...`)
3. ✅ **Poți configura redirect URI-ul în Outstand Dashboard?**
4. ✅ **Există documentație Outstand despre redirect URI-uri?**

## Notă Importantă

Dacă Outstand adaugă parametri query dinamici (ex: `?session=abc123` unde `abc123` se schimbă la fiecare request), atunci **NU** poți adăuga toate variantele în Facebook (sunt infinite).

În acest caz, singura soluție este:
- Să contactezi Outstand pentru a configura redirect URI-ul fără parametri query
- Sau să contactezi Facebook pentru a dezactiva "Use Strict Mode"
- Sau să folosești un callback intermediar (callback-ul tău care apoi redirectează către Outstand)

## Resurse

- [Outstand Support](mailto:support@outstand.so)
- [Facebook Developers Support](https://developers.facebook.com/support/)
- [Facebook OAuth Documentation](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow)
