# Debug - OUTSTAND_API_KEY

## Problema: "OUTSTAND_API_KEY is not configured"

### Verificări:

1. **Formatul în `.env.local`**:
   ```
   ✅ CORECT: OUTSTAND_API_KEY=ost_KPfrOdEohCQqxxNqhdtFtGqQoEKPyGCRsTQQMhMuBnxBgJwVsoXSEkTbMuFPaeSg
   ❌ GREȘIT: OUTSTAND_API_KEY = ost_... (cu spații)
   ```

2. **Restart server-ul**:
   - Oprește server-ul (`Ctrl+C`)
   - Rulează din nou: `npm run dev`
   - Variabilele de mediu se încarcă doar la start

3. **Verifică în consolă**:
   - Deschide Developer Tools (F12)
   - Mergi la tab-ul Console
   - Când dai click pe "Conectează", ar trebui să vezi logs

4. **Verifică Network tab**:
   - Deschide Developer Tools → Network
   - Click pe "Conectează"
   - Verifică request-ul către `/api/social-accounts/connect`
   - Vezi răspunsul - ar trebui să conțină `authUrl`

## Testare rapidă:

1. Deschide consola browser-ului (F12)
2. Rulează:
   ```javascript
   fetch('/api/social-accounts/connect', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ platform: 'facebook' })
   }).then(r => r.json()).then(console.log)
   ```
3. Verifică răspunsul - ar trebui să vezi `authUrl` sau un mesaj de eroare clar

## Dacă tot nu funcționează:

1. Verifică că `.env.local` este în root-ul proiectului (același nivel cu `package.json`)
2. Verifică că nu ai `.env` sau `.env.production` care suprascrie variabilele
3. Verifică că serverul rulează (nu doar build-ul)
