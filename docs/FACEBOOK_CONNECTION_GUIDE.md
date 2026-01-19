# Ghid Complet - Conectare Facebook și Postare Automată

## ✅ Ce ai făcut deja

1. ✅ Aplicație Facebook creată în [Facebook Developer](https://developers.facebook.com/apps)
2. ✅ Aplicația conectată la Outstand în dashboard-ul Outstand
3. ✅ `OUTSTAND_API_KEY` adăugat în variabilele de mediu

## 🔗 Pasul 1: Conectează Contul Facebook

### 1.1. Accesează Setările

1. Mergi la `/dashboard/settings` în aplicația ta
2. Scroll până la secțiunea **"Conturi Social Media"**
3. Găsește **Facebook** în listă

### 1.2. Inițiază Conectarea

1. Click pe butonul **"Conectează"** lângă Facebook
2. Vei fi redirecționat la Facebook pentru autentificare
3. Autorizează aplicația să acceseze paginile tale Facebook

### 1.3. Selectează Paginile (dacă ai mai multe)

1. După autorizare, vei fi redirecționat la o pagină de selecție
2. Selectează paginile Facebook pe care vrei să le conectezi
3. Click pe **"Conectează X pagini"**
4. Vei fi redirecționat înapoi la setări cu mesajul de succes

### 1.4. Verifică Conectarea

- În secțiunea "Conturi Social Media", Facebook ar trebui să arate **"Conectat"** cu un badge verde
- Ar trebui să vezi numele paginii conectate

## 📅 Pasul 2: Programează o Postare

### 2.1. Generează un Banner

1. Mergi la `/dashboard/playground`
2. Generează un banner folosind AI
3. Salvează bannerul (se salvează automat în baza de date)

### 2.2. Programează Postarea

1. Mergi la `/dashboard/schedule`
2. Selectează bannerul generat
3. Adaugă un caption (text pentru postare)
4. Selectează data și ora pentru postare
5. **Selectează Facebook** (și alte platforme dacă vrei)
6. Click pe **"Programează Postarea"**

**Notă**: Postarea costă 5 credite (1 credit = 1 imagine generată, 5 credite = 1 postare programată)

### 2.3. Verifică Postarea Programată

1. Mergi la `/dashboard/calendar` pentru a vedea toate postările programate
2. Sau mergi la `/dashboard` pentru a vedea postările următoare

## ⚙️ Pasul 3: Configurare Cron Job (pentru postare automată)

Postările programate se procesează automat prin cron job. Ai două opțiuni:

### Opțiunea 1: Vercel Cron (o dată pe zi)

Cron job-ul este deja configurat în `vercel.json` să ruleze o dată pe zi la miezul nopții.

**Limitare**: Postările vor fi procesate doar o dată pe zi.

### Opțiunea 2: Serviciu Extern (recomandat)

Pentru procesare mai frecventă (ex: la fiecare minut sau oră):

1. Creează un cont pe [cron-job.org](https://cron-job.org) (gratuit)
2. Configurează un cron job:
   - **URL**: `POST https://yourdomain.com/api/process-scheduled-posts`
   - **Method**: POST
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`
   - **Schedule**: `* * * * *` (fiecare minut) sau `0 * * * *` (fiecare oră)
3. Adaugă `CRON_SECRET` în variabilele de mediu Vercel

## 🔍 Verificare și Debugging

### Verifică Conturile Conectate

1. Mergi la `/dashboard/settings`
2. Verifică secțiunea "Conturi Social Media"
3. Facebook ar trebui să fie marcat ca "Conectat"

### Verifică Postările Programate

1. Mergi la `/dashboard/calendar`
2. Vezi toate postările programate cu statusul lor:
   - **Pending**: Așteaptă să fie procesate
   - **Posted**: Postate cu succes
   - **Failed**: Eșuate (verifică logs pentru detalii)

### Testează Postarea Manuală

Poți testa postarea manuală prin:

```bash
curl -X POST https://yourdomain.com/api/process-scheduled-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Verifică Logs

- **Vercel Logs**: Mergi la Vercel Dashboard → Project → Logs
- **Supabase Logs**: Verifică tabela `scheduled_posts` pentru statusuri

## ⚠️ Probleme Comune

### "Failed to get auth URL"
- Verifică că `OUTSTAND_API_KEY` este setat corect în Vercel
- Verifică că aplicația Facebook este conectată în Outstand dashboard
- Verifică că redirect URI-ul este configurat corect în Outstand

### "No pages available"
- Asigură-te că ai pagini Facebook create
- Verifică că ai permis aplicației să acceseze paginile tale
- Verifică permisiunile OAuth în aplicația Facebook

### Postările nu se publică
- Verifică că cron job-ul rulează (verifică logs)
- Verifică că ai credite suficiente (5 credite per postare)
- Verifică că contul Facebook este conectat și activ
- Verifică că `OUTSTAND_API_KEY` este valid

### "OUTSTAND_API_KEY is not configured"
- Adaugă `OUTSTAND_API_KEY` în Vercel Environment Variables
- Fă redeploy după adăugarea variabilei

## 📝 Flow Complet

```
1. User → /dashboard/settings → Click "Conectează" Facebook
2. → /api/social-accounts/connect → Obține auth URL de la Outstand
3. → Redirect la Facebook OAuth
4. → User autorizează aplicația
5. → Facebook redirect → /api/social-accounts/callback?session=xxx
6. → Callback obține paginile disponibile de la Outstand
7. → Dacă mai multe pagini → /dashboard/settings/select-pages
8. → User selectează pagini → /api/social-accounts/finalize
9. → Conturile se salvează în baza de date
10. → Redirect → /dashboard/settings?connected=success

Postare:
1. User → /dashboard/schedule → Programează postare
2. → Postarea se salvează în `scheduled_posts` cu status 'pending'
3. → Cron job rulează → /api/process-scheduled-posts
4. → Se găsesc postări cu `scheduled_for <= now`
5. → Se postează pe Facebook prin Outstand API
6. → Status se actualizează la 'posted' sau 'failed'
```

## 🎉 Gata!

Acum poți:
- ✅ Conecta contul Facebook
- ✅ Programa postări pe Facebook
- ✅ Postările se publică automat la ora programată
