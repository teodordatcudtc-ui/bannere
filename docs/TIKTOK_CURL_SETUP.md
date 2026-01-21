# Cum să Rulezi Comanda curl pentru TikTok în Outstand

## Opțiunea 1: PowerShell (Windows) - Recomandat

⚠️ **IMPORTANT:** PowerShell interpretează `curl` ca alias pentru `Invoke-WebRequest`. Folosește una dintre metodele de mai jos.

### Metoda 1: Folosește curl.exe (Recomandat)

1. **Deschide PowerShell:**
   - Apasă `Windows + X`
   - Selectează **"Windows PowerShell"** sau **"Terminal"**
   - Sau caută "PowerShell" în meniul Start

2. **Rulează comanda cu `curl.exe` (forțează utilizarea curl real):**
   ```powershell
   curl.exe -X POST https://api.outstand.so/v1/social-networks -H "Authorization: Bearer ost_KPfrOdEohCQqxxNqhdtFtGqQoEKPyGCRsTQQMhMuBnxBgJwVsoXSEkTbMuFPaeSg" -H "Content-Type: application/json" -d "{\"network\": \"tiktok\", \"client_key\": \"awgn5g7ra91wbxv1\", \"client_secret\": \"LHiMlC8J4ygfgmUVVzoCoSA44PI0rxXp\"}"
   ```

### Metoda 2: Folosește Invoke-WebRequest (PowerShell nativ)

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

Invoke-WebRequest -Uri "https://api.outstand.so/v1/social-networks" -Method POST -Headers $headers -Body $body
```

### Metoda 3: Folosește Invoke-RestMethod (mai simplu pentru JSON)

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

Invoke-RestMethod -Uri "https://api.outstand.so/v1/social-networks" -Method POST -Headers $headers -Body $body
```

## Opțiunea 2: Command Prompt (CMD)

1. **Deschide Command Prompt:**
   - Apasă `Windows + R`
   - Scrie `cmd` și apasă Enter

2. **Rulează comanda:**
   ```cmd
   curl -X POST https://api.outstand.so/v1/social-networks -H "Authorization: Bearer ost_KPfrOdEohCQqxxNqhdtFtGqQoEKPyGCRsTQQMhMuBnxBgJwVsoXSEkTbMuFPaeSg" -H "Content-Type: application/json" -d "{\"network\": \"tiktok\", \"client_key\": \"awgn5g7ra91wbxv1\", \"client_secret\": \"LHiMlC8J4ygfgmUVVzoCoSA44PI0rxXp\"}"
   ```

## Opțiunea 3: Git Bash (dacă ai Git instalat)

1. **Deschide Git Bash**
2. **Rulează comanda originală:**
   ```bash
   curl -X POST https://api.outstand.so/v1/social-networks \
     -H "Authorization: Bearer ost_KPfrOdEohCQqxxNqhdtFtGqQoEKPyGCRsTQQMhMuBnxBgJwVsoXSEkTbMuFPaeSg" \
     -H "Content-Type: application/json" \
     -d '{
       "network": "tiktok",
       "client_key": "awgn5g7ra91wbxv1",
       "client_secret": "LHiMlC8J4ygfgmUVVzoCoSA44PI0rxXp"
     }'
   ```

## Opțiunea 4: Postman (Interfață Grafică)

1. **Deschide Postman** (sau instalează-l de la [postman.com](https://www.postman.com/downloads/))
2. **Creează un request nou:**
   - Method: **POST**
   - URL: `https://api.outstand.so/v1/social-networks`
3. **Adaugă Headers:**
   - Key: `Authorization`, Value: `Bearer ost_KPfrOdEohCQqxxNqhdtFtGqQoEKPyGCRsTQQMhMuBnxBgJwVsoXSEkTbMuFPaeSg`
   - Key: `Content-Type`, Value: `application/json`
4. **Adaugă Body:**
   - Selectează **"raw"** și **"JSON"**
   - Adaugă:
     ```json
     {
       "network": "tiktok",
       "client_key": "awgn5g7ra91wbxv1",
       "client_secret": "LHiMlC8J4ygfgmUVVzoCoSA44PI0rxXp"
     }
     ```
5. **Click pe "Send"**

## Răspuns Așteptat

Dacă totul este OK, ar trebui să primești un răspuns de succes:

```json
{
  "success": true,
  "message": "TikTok network configured successfully"
}
```

Sau ceva similar.

## Dacă Primești Eroare

### Eroare: "curl is not recognized"
- **Soluție:** Instalează curl sau folosește Git Bash
- **Sau:** Folosește Postman (Opțiunea 4)

### Eroare: "Unauthorized" sau "401"
- Verifică că API Key-ul este corect
- Verifică că ai pus `Bearer ` înainte de API Key

### Eroare: "Network already configured"
- Înseamnă că TikTok este deja configurat în Outstand
- Verifică în Outstand Dashboard → Settings → Social Networks

## Verificare După Configurare

1. **Mergi la [Outstand Dashboard](https://app.outstand.so)**
2. **Settings** → **Social Networks**
3. **Verifică că TikTok apare ca "Configured" sau "Active"**

## Notă Importantă

Dacă ai configurat deja TikTok manual în Outstand Dashboard, **nu este necesar** să rulezi și comanda curl. Comanda curl este doar o alternativă dacă nu găsești opțiunea în dashboard.
