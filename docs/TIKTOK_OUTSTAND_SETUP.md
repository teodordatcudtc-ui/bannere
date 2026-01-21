# Configurare TikTok în Outstand - Rezolvare Eroare "client_key"

## Problema

Când încerci să te conectezi la TikTok din aplicația ta, primești eroarea:
> "A survenit o eroare. Nu te-ai putut conecta cu TikTok. Acest lucru se poate datora anumitor setări ale aplicației. client_key"

## Cauza

TikTok folosește modelul **BYOK (Bring Your Own Key)** în Outstand. Aceasta înseamnă că trebuie să configurezi credențialele TikTok (Client Key și Client Secret) în Outstand **înainte** de a putea folosi OAuth.

## Soluție: Configurează TikTok în Outstand

### Pasul 1: Obține Credențialele TikTok

1. **Mergi la [TikTok Developer Portal](https://developers.tiktok.com)**
2. **Selectează aplicația ta** (sau creează una nouă)
3. **Mergi la "Basic Information"** sau **"Keys"**
4. **Copiază:**
   - **Client Key** (sau **Client ID**)
   - **Client Secret**

### Pasul 2: Configurează Redirect URI în TikTok Developer Console

⚠️ **IMPORTANT:** Înainte de a configura în Outstand, asigură-te că ai setat Redirect URI-ul corect în TikTok Developer Console.

1. **Mergi la TikTok Developer Console** → **Your App** → **Basic Information**
2. **Scroll până la "Redirect URI"** sau **"OAuth 2.0 Redirect URI"**
3. **Adaugă Redirect URI-ul Outstand:**
   ```
   https://www.outstand.so/app/api/socials/tiktok/callback
   ```
   ⚠️ **IMPORTANT:** Acesta este callback-ul Outstand conform documentației oficiale.

4. **Salvează modificările**

### Pasul 3: Verifică Scopes în TikTok Developer Console

Asigură-te că ai solicitat și aprobat următoarele scopes în TikTok Developer Console:

- ✅ `user.info.basic` - Access profile info (avatar and display name)
- ✅ `user.info.profile` - Read additional profile info (bio, profile link, verification status)
- ✅ `user.info.stats` - Read profile engagement statistics
- ✅ `video.publish` - Post content to TikTok (DIRECT_POST mode)
- ✅ `video.upload` - Upload draft content to TikTok for further editing (INBOX mode)
- ✅ `video.list` - Read public videos on TikTok (for post metrics)

**Cum să verifici:**
1. Mergi la **"Permissions"** sau **"Scopes"** în TikTok Developer Console
2. Verifică că toate scopes-urile de mai sus sunt **"Approved"** sau **"Active"**

### Pasul 4: Configurează Credențialele în Outstand

Ai două opțiuni:

#### Opțiunea 1: Via Outstand Dashboard (Recomandat)

1. **Mergi la [Outstand Dashboard](https://app.outstand.so)**
2. **Loghează-te** cu contul tău
3. **Mergi la Settings** → **Social Networks** (sau **Integrations**)
4. **Caută "TikTok"** sau **"Add Network"**
5. **Completează:**
   - **Network:** `tiktok`
   - **Client Key:** Client Key-ul tău de la TikTok
   - **Client Secret:** Client Secret-ul tău de la TikTok
6. **Click pe "Save"** sau **"Add"**

#### Opțiunea 2: Via Outstand API

Dacă nu găsești opțiunea în dashboard, poți configura direct prin API:

```bash
curl -X POST https://api.outstand.so/v1/social-networks \
  -H "Authorization: Bearer YOUR_OUTSTAND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "tiktok",
    "client_key": "YOUR_TIKTOK_CLIENT_KEY",
    "client_secret": "YOUR_TIKTOK_CLIENT_SECRET"
  }'
```

**Înlocuiește:**
- `YOUR_OUTSTAND_API_KEY` - API Key-ul tău de la Outstand (din `.env.local`: `OUTSTAND_API_KEY`)
- `YOUR_TIKTOK_CLIENT_KEY` - Client Key-ul de la TikTok
- `YOUR_TIKTOK_CLIENT_SECRET` - Client Secret-ul de la TikTok

**Exemplu cu valori reale:**
```bash
curl -X POST https://api.outstand.so/v1/social-networks \
  -H "Authorization: Bearer ost_KPfrOdEohCQqxxNqhdtFtGqQoEKPyGCRsTQQMhMuBnxBgJwVsoXSEkTbMuFPaeSg" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "tiktok",
    "client_key": "aw1234567890abcdef",
    "client_secret": "xyz9876543210fedcba"
  }'
```

**Răspuns de succes:**
```json
{
  "success": true,
  "message": "TikTok network configured successfully"
}
```

### Pasul 5: Verifică Configurația

După ce ai configurat credențialele:

1. **Verifică în Outstand Dashboard:**
   - Mergi la **Settings** → **Social Networks**
   - Verifică că TikTok apare ca **"Configured"** sau **"Active"**

2. **Testează conexiunea:**
   - Mergi la aplicația ta → **Dashboard** → **Settings**
   - Click pe **"Conectează"** pentru TikTok
   - Ar trebui să funcționeze acum!

## Verificare Finală

Înainte de a testa, verifică că:

1. ✅ **TikTok Developer Console:**
   - Redirect URI este setat: `https://www.outstand.so/app/api/socials/tiktok/callback`
   - Toate scopes-urile necesare sunt aprobate
   - Aplicația este publicată (dacă este necesar)

2. ✅ **Outstand:**
   - Client Key este configurat corect
   - Client Secret este configurat corect
   - Network este setat la `tiktok`

3. ✅ **Aplicația ta:**
   - `OUTSTAND_API_KEY` este setat în `.env.local`
   - Server-ul este repornit după modificări

## Dacă Eroarea Persistă

### Verifică Logs-urile

1. **În browser, deschide Developer Tools** (F12)
2. **Mergi la tab-ul "Console"**
3. **Încearcă să te conectezi la TikTok**
4. **Verifică erorile** din console

### Verifică Răspunsul Outstand API

1. **În terminal-ul unde rulează aplicația**, verifică logs-urile
2. **Caută mesaje despre TikTok** sau `client_key`
3. **Verifică dacă Outstand returnează erori**

### Contactează Outstand Support

Dacă problema persistă după ce ai configurat totul corect:

1. **Email:** contact@outstand.so
2. **Explică:**
   - Eroarea exactă: "client_key error when connecting TikTok"
   - Ce ai configurat (Redirect URI, scopes, credențiale în Outstand)
   - Screenshot-uri cu eroarea

## Alternativă: Managed Keys

Dacă nu vrei să gestionezi credențialele singur:

1. **Contactează Outstand Support:** contact@outstand.so
2. **Solicită Managed Keys pentru TikTok**
3. **Avantaje:**
   - ✅ Funcționează imediat
   - ✅ Nu trebuie să gestionezi credențialele
   - ✅ Outstand gestionează totul
4. **Dezavantaje:**
   - ⚠️ Costă extra (verifică prețurile cu Outstand)
   - ⚠️ Turnaround time: ~1 business day

## Notă Importantă

- **BYOK (Bring Your Own Key)** înseamnă că trebuie să configurezi credențialele în Outstand
- **Redirect URI** trebuie să fie exact: `https://www.outstand.so/app/api/socials/tiktok/callback`
- **Scopes** trebuie să fie aprobate în TikTok Developer Console
- **Aplicația TikTok** trebuie să fie publicată (dacă este necesar)

## Resurse

- [Outstand TikTok Documentation](https://docs.outstand.so) (verifică documentația oficială)
- [TikTok Developer Portal](https://developers.tiktok.com)
- [TikTok OAuth Documentation](https://developers.tiktok.com/doc/oauth-overview)
