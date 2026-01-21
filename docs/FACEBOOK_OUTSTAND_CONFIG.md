# Configurare Facebook cu Outstand - Ghid Complet

## Configurare Corectă Conform Documentației Outstand

### Pasul 1: Configurează în Facebook Developer Console

1. **Mergi la [Facebook Developers](https://developers.facebook.com/apps)**
2. **Selectează aplicația ta**
3. **Mergi la Settings → Basic:**

   **App Domains:**
   ```
   outstand.so
   ```
   ⚠️ **IMPORTANT:** `outstand.so` (NU `api.outstand.so`)

   **Website → Site URL:**
   ```
   https://www.outstand.so
   ```
   Sau URL-ul tău de producție dacă ai unul.

4. **Mergi la Products → Facebook Login → Settings:**

   **Valid OAuth Redirect URIs:**
   ```
   https://www.outstand.so/app/api/socials/facebook/callback
   ```
   ⚠️ **IMPORTANT:** Acesta este callback-ul Outstand (NU `api.outstand.so`)

   **Dacă folosești white-labeling (flow-ul nostru):**
   ```
   https://www.outstand.so/app/api/socials/facebook/callback
   https://yourdomain.com/api/social-accounts/callback
   ```

   **Asigură-te că sunt activate:**
   - ✅ **Client OAuth Login**: Yes
   - ✅ **Web OAuth Login**: Yes

### Pasul 2: Permisiuni Necesare

Outstand solicită următoarele permisiuni (conform documentației lor):

- `pages_read_user_content` - Basic Facebook Page access
- `business_management` - Permission to manage business pages
- `pages_show_list` - Permission to read engagement metrics
- `pages_manage_posts` - Permission to publish posts
- `pages_read_engagement` - Permission to read engagement metrics
- `pages_manage_engagement` - Permission to interact with engagement

**Notă:** Dacă primești eroarea "Invalid Scopes", contactează Outstand Support pentru a verifica dacă toate aceste permisiuni sunt încă valide.

### Pasul 3: Configurează în Outstand Dashboard

1. Mergi la [Outstand Dashboard](https://app.outstand.so)
2. Mergi la **Settings** → **Social Networks** → **Facebook**
3. Adaugă credențialele:
   - **Client Key**: App ID (din Facebook)
   - **Client Secret**: App Secret (din Facebook)
4. Salvează configurația

## Flow White-Labeling (Flow-ul Nostru)

Dacă folosești white-labeling (flow-ul implementat în aplicația ta):

1. **Aplicația ta** → `POST /v1/social-networks/facebook/auth-url` cu `redirect_uri: "https://yourdomain.com/api/social-accounts/callback"`
2. **Outstand** → returnează `auth_url`
3. **Utilizatorul** → este redirecționat la Facebook pentru autorizare
4. **Facebook** → redirecționează către `https://www.outstand.so/app/api/socials/facebook/callback`
5. **Outstand** → procesează autorizarea și redirecționează către `redirect_uri`-ul tău cu `?session=xxx`
6. **Aplicația ta** → `GET /v1/social-accounts/pending/:sessionToken`
7. **Aplicația ta** → `POST /v1/social-accounts/pending/:sessionToken/finalize`

## Diferențe Importante

### ❌ Configurație Greșită (Anterior):
- App Domains: `api.outstand.so`
- Redirect URI: `https://api.outstand.so/v1/oauth/facebook/callback`

### ✅ Configurație Corectă (Conform Outstand):
- App Domains: `outstand.so`
- Redirect URI: `https://www.outstand.so/app/api/socials/facebook/callback`

## Rezolvare Eroare "Invalid Scopes"

Dacă primești eroarea "Invalid Scopes", verifică:

1. **Contactează Outstand Support:**
   - Email: contact@outstand.so
   - Întreabă dacă toate permisiunile sunt încă valide
   - Solicită actualizarea permisiunilor dacă este necesar

2. **Verifică în Facebook Developer Console:**
   - Mergi la **App Review** → **Permissions and Features**
   - Verifică status-ul fiecărei permisiuni
   - Elimină permisiunile deprecate din cerere

## Verificare Finală

După configurare, verifică:

1. ✅ **App Domains**: `outstand.so` (NU `api.outstand.so`)
2. ✅ **Valid OAuth Redirect URIs**: `https://www.outstand.so/app/api/socials/facebook/callback`
3. ✅ **Client OAuth Login**: Yes
4. ✅ **Web OAuth Login**: Yes
5. ✅ **Credențialele sunt configurate în Outstand Dashboard**

## Resurse

- [Outstand Facebook Documentation](https://docs.outstand.so) (documentația pe care ai trimis-o)
- [Outstand Support](mailto:contact@outstand.so)
- [Facebook Developers](https://developers.facebook.com/apps)
