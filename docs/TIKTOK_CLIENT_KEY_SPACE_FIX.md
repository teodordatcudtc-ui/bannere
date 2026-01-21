# Rezolvare Eroare TikTok: client_key cu Spațiu

## Problema

Când încerci să te conectezi la TikTok, primești eroarea:
> "A survenit o eroare. Nu te-ai putut conecta cu TikTok. Acest lucru se poate datora anumitor setări ale aplicației. client_key"

În URL-ul de autorizare TikTok, vezi:
```
client_key=+awgn5g7ra91wbxv1
```

Caracterul `+` este encoding-ul pentru spațiu, ceea ce înseamnă că TikTok primește ` awgn5g7ra91wbxv1` (cu spațiu în față) în loc de `awgn5g7ra91wbxv1`.

## Cauza

Outstand trimite `client_key` cu un spațiu în față, probabil din cauza unei configurații greșite sau a unei probleme în Outstand.

## Soluție

### Pasul 1: Verifică Configurația în Outstand Dashboard

1. **Mergi la [Outstand Dashboard](https://app.outstand.so)**
2. **Settings** → **Social Networks** → **TikTok**
3. **Verifică Client Key:**
   - Ar trebui să fie exact: `awgn5g7ra91wbxv1`
   - **NU** trebuie să aibă spații în față sau după
   - **NU** trebuie să aibă caractere invizibile

4. **Dacă vezi spații sau caractere invizibile:**
   - Șterge complet Client Key-ul
   - Copiază din nou Client Key-ul de la TikTok (fără spații)
   - Adaugă-l din nou în Outstand
   - Salvează

### Pasul 2: Reconfigurează prin API (Recomandat)

Dacă problema persistă, reconfigurează prin API pentru a fi sigur că nu există spații:

**PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer ost_KPfrOdEohCQqxxNqhdtFtGqQoEKPyGCRsTQQMhMuBnxBgJwVsoXSEkTbMuFPaeSg"
    "Content-Type" = "application/json"
}

$body = @{
    network = "tiktok"
    client_key = "awgn5g7ra91wbxv1"
    client_secret = "LHiMlC8J4ygfgmUVVzoCoSA44PI0rxXp"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.outstand.so/v1/social-networks" -Method PUT -Headers $headers -Body $body
```

**Notă:** Am folosit `PUT` în loc de `POST` pentru a actualiza configurația existentă.

**Sau șterge și adaugă din nou:**
```powershell
# Șterge configurația existentă (dacă API-ul suportă DELETE)
# Apoi adaugă din nou cu POST
```

### Pasul 3: Verifică în TikTok Developer Console

1. **Mergi la [TikTok Developer Portal](https://developers.tiktok.com)**
2. **Selectează aplicația ta**
3. **Mergi la "Basic Information"** sau **"Keys"**
4. **Verifică Client Key:**
   - Ar trebui să fie exact: `awgn5g7ra91wbxv1`
   - Copiază-l din nou (fără spații)
   - Compară-l cu cel din Outstand

### Pasul 4: Contactează Outstand Support

Dacă problema persistă după ce ai verificat totul, contactează Outstand Support:

1. **Email:** contact@outstand.so
2. **Subiect:** "TikTok client_key sent with leading space in OAuth URL"
3. **Explică:**
   - Eroarea: `unauthorized_client` cu `error_type=client_key`
   - URL-ul de autorizare conține `client_key=+awgn5g7ra91wbxv1` (cu `+` care este encoding pentru spațiu)
   - Client Key-ul corect este `awgn5g7ra91wbxv1` (fără spații)
   - Ai configurat corect în Outstand Dashboard, dar Outstand trimite client_key cu spațiu în față
   - Screenshot-uri cu eroarea și URL-ul

## Verificare Rapidă

După ce ai reconfigurat, verifică:

1. **În Outstand Dashboard:**
   - Client Key este exact `awgn5g7ra91wbxv1` (fără spații)
   - Client Secret este corect

2. **Testează conexiunea:**
   - Mergi la aplicația ta → Dashboard → Settings
   - Click pe "Conectează" pentru TikTok
   - Verifică URL-ul de autorizare TikTok
   - Ar trebui să fie: `client_key=awgn5g7ra91wbxv1` (fără `+` în față)

## Dacă Problema Persistă

Dacă după reconfigurare problema persistă, este posibil să fie o problemă în Outstand care trimite client_key cu spațiu. În acest caz:

1. **Contactează Outstand Support** (vezi Pasul 4)
2. **Solicită Managed Keys** pentru TikTok (dacă este disponibil)
3. **Verifică dacă există o actualizare a Outstand** care rezolvă problema

## Notă Importantă

- **Client Key** trebuie să fie exact ca în TikTok Developer Console (fără spații)
- **Spațiile invizibile** pot cauza probleme
- **Encoding-ul URL** transformă spațiile în `+`, de aceea vezi `client_key=+awgn5g7ra91wbxv1`
