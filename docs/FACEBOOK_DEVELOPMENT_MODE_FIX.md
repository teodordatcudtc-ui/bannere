# Rezolvare: Eroare Facebook OAuth în Modul Development

## Problema

Primești eroarea:
> "URL-ul nu poate fi încărcat. Domeniul acestui URL nu este inclus în domeniile aplicaţiei."

Chiar dacă ai configurat:
- ✅ App Domains: `api.outstand.so`
- ✅ Valid OAuth Redirect URIs: `https://api.outstand.so/v1/oauth/facebook/callback`
- ✅ Client OAuth Login: Yes
- ✅ Web OAuth Login: Yes

## Cauza Principală: Modul Development

Dacă aplicația ta Facebook este în modul **Development** (nu este publicată), doar utilizatorii adăugați ca **Administrators** sau **Testers** pot folosi OAuth.

## Soluție: Adaugă Testeri

### Pasul 1: Accesează Roles

1. Mergi la [Facebook Developers](https://developers.facebook.com/apps)
2. Selectează aplicația ta
3. În sidebar-ul din stânga, mergi la **Roles** → **Roles** (sau **Roles** → **Testers**)

### Pasul 2: Adaugă Testeri

1. Click pe butonul **Add Testers** (sau **Add People**)
2. În câmpul de căutare, caută contul de Facebook al persoanei care va testa
3. Selectează rolul: **Tester** (sau **Developer** pentru tine)
4. Click pe **Add**

### Pasul 3: Acceptă Invitația

1. Persoana adăugată va primi o notificare pe Facebook
2. Trebuie să accepte invitația pentru a deveni tester
3. După acceptare, poate folosi OAuth

### Pasul 4: Testează Din Nou

1. Așteaptă câteva minute după ce ai adăugat testerul
2. Asigură-te că testerul a acceptat invitația
3. Încearcă din nou să te conectezi la Facebook

## Verificări Suplimentare

### 1. Website URL

În **Settings** → **Basic**, verifică că ai:
- **Website** → **Site URL**: `https://api.outstand.so`

### 2. Platform Settings

În **Settings** → **Basic** → **Platforms**, asigură-te că:
- **Website** este adăugată
- **Facebook Login** este adăugată

### 3. App Review (Opțional)

Dacă vrei să faci aplicația publică (nu doar pentru testeri):
1. Mergi la **App Review** → **Permissions and Features**
2. Solicită permisiunile necesare
3. După aprobare, aplicația poate fi folosită de oricine

**Notă:** Pentru testare, nu este necesar să faci App Review - doar adaugă testeri.

## Alternativă: Publică Aplicația (Nu Recomandat pentru Testare)

Dacă vrei să faci aplicația publică imediat (fără App Review):
1. Mergi la **Settings** → **Basic**
2. Scroll până la **App Review**
3. Click pe **Make [App Name] public**
4. Confirmă acțiunea

**Atenție:** Aplicația va fi publică, dar fără permisiuni aprobate, funcționalitatea va fi limitată.

## Verificare Finală

După ce ai adăugat testeri, verifică:

1. ✅ Testerul apare în lista de **Roles** → **Roles**
2. ✅ Testerul a acceptat invitația pe Facebook
3. ✅ Website URL este configurat: `https://api.outstand.so`
4. ✅ App Domains conține: `api.outstand.so`
5. ✅ Valid OAuth Redirect URIs conține: `https://api.outstand.so/v1/oauth/facebook/callback`

## Dacă Problema Persistă

1. **Așteaptă 5-10 minute** - Facebook necesită timp pentru propagare
2. **Verifică că folosești contul corect** - Trebuie să folosești contul adăugat ca Tester
3. **Contactează Outstand Support** - Poate că folosesc un alt format de callback sau domeniu
4. **Verifică logs-urile** - Uită-te în consola browser-ului și în terminalul serverului pentru erori detaliate
