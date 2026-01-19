# Configurare Postări Automate

Acest document explică cum să configurezi sistemul de postări automate pe rețelele sociale.

## Cum funcționează

1. **Programare**: Utilizatorii programează postări prin interfața web
2. **Stocare**: Postările sunt salvate în baza de date cu status `pending`
3. **Procesare**: Un cron job apelează periodic endpoint-ul `/api/process-scheduled-posts`
4. **Postare**: Endpoint-ul procesează postările care sunt gata și le postează pe platformele selectate
5. **Actualizare**: Statusul postărilor este actualizat în baza de date (`posted` sau `failed`)

## Configurare Cron Job

### Opțiunea 1: Vercel Cron Jobs (Recomandat pentru Vercel)

1. Creează un fișier `vercel.json` în root-ul proiectului:

```json
{
  "crons": [{
    "path": "/api/process-scheduled-posts",
    "schedule": "* * * * *"
  }]
}
```

2. Adaugă variabila de mediu `CRON_SECRET` în Vercel:
   - Mergi la Project Settings → Environment Variables
   - Adaugă `CRON_SECRET` cu o valoare secretă (ex: un string aleatoriu)

3. Actualizează endpoint-ul pentru a folosi secretul:

Endpoint-ul este deja configurat să accepte `Authorization: Bearer ${CRON_SECRET}`.

### Opțiunea 2: External Cron Service (cron-job.org, EasyCron, etc.)

1. Creează un cont pe un serviciu de cron jobs
2. Configurează un job care apelează:
   ```
   POST https://yourdomain.com/api/process-scheduled-posts
   Authorization: Bearer YOUR_CRON_SECRET
   ```
3. Setează frecvența la fiecare minut (`* * * * *`)

### Opțiunea 3: Server Cron (pentru self-hosted)

Adaugă în crontab:

```bash
* * * * * curl -X POST https://yourdomain.com/api/process-scheduled-posts -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Configurare Outstand.so API

### Pasul 1: Obține API Key

1. Creează cont la [Outstand.so](https://www.outstand.so)
2. Obține API key din dashboard
3. Adaugă în `.env.local`:
   ```
   OUTSTAND_API_KEY=your_outstand_api_key
   ```

### Pasul 2: Configurează Credențiale OAuth (BYOK - Bring Your Own Key)

**IMPORTANT**: Trebuie să creezi aplicații developer pe fiecare platformă (o singură dată):

#### Facebook & Instagram (Meta)
1. Creează aplicație în [Facebook Developer](https://developers.facebook.com)
2. Configurează OAuth redirect URIs
3. Obține Client ID și Client Secret
4. Configurează în Outstand dashboard sau via API

#### LinkedIn
1. Creează aplicație în [LinkedIn Developer Portal](https://www.linkedin.com/developers)
2. Configurează redirect URIs
3. Obține Client ID și Client Secret
4. Configurează în Outstand

#### X (Twitter)
1. Creează aplicație în [X Developer Portal](https://developer.twitter.com)
2. Configurează OAuth 2.0
3. Obține Client ID și Client Secret
4. Configurează în Outstand

#### TikTok
1. Creează aplicație în [TikTok Developer Portal](https://developers.tiktok.com)
2. Obține credențiale
3. Configurează în Outstand

**Notă**: Outstand oferă și "Managed Keys" - ei gestionează credențialele pentru tine (costă extra).

### Pasul 3: Conectează Conturile Sociale

După ce ai configurat credențialele, utilizatorii pot conecta conturile lor sociale:

1. Utilizatorul accesează `/dashboard/settings`
2. Click pe "Conectează cont" pentru platforma dorită
3. Se redirecționează la OAuth flow-ul Outstand
4. Autorizează accesul
5. Contul este salvat în baza de date

### Endpoint-uri Disponibile

- `GET /api/social-accounts` - Obține conturile conectate
- `POST /api/social-accounts/connect` - Inițiază conexiunea OAuth
- `GET /api/social-accounts/callback` - Callback OAuth (folosit automat)

## Testare Manuală

Poți testa procesarea postărilor manual:

```bash
curl -X POST http://localhost:3000/api/process-scheduled-posts \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

Sau folosește GET pentru a vedea mesajul de utilizare:

```bash
curl http://localhost:3000/api/process-scheduled-posts
```

## Monitorizare

Postările procesate pot fi monitorizate prin:

1. **Dashboard**: Vezi statusul postărilor în interfața web
2. **Database**: Verifică tabela `scheduled_posts` pentru status
3. **Logs**: Verifică console logs pentru erori

## Troubleshooting

### Postările nu sunt procesate

1. Verifică că cron job-ul rulează (verifică logs)
2. Verifică că `CRON_SECRET` este configurat corect
3. Verifică că există postări cu status `pending` și `scheduled_for <= now`

### Postările eșuează

1. Verifică că `OUTSTAND_API_KEY` este configurat corect
2. Verifică că utilizatorul are conturi sociale conectate pentru platformele selectate
3. Verifică logs pentru erori specifice platformelor
4. Verifică că URL-urile imaginilor sunt accesibile public
5. Verifică că credențialele OAuth sunt configurate corect în Outstand

### Rate Limiting

Dacă primești erori de rate limiting:
- Reduce frecvența cron job-ului
- Implementează retry logic în `lib/social-media.ts`
- Folosește queue system (Redis, etc.)

## Securitate

- **CRON_SECRET**: Folosește un secret puternic și nu-l expune public
- **API Keys**: Păstrează API keys în variabile de mediu
- **Access Tokens**: Nu stoca access tokens în baza de date fără criptare

## Limitări Actuale

- Procesează maxim 10 postări per apel (configurabil în endpoint)
- Nu suportă retry automat pentru postări eșuate
- Nu suportă postări video (doar imagini)
- Nu suportă postări cu multiple imagini

## Îmbunătățiri Viitoare

- [ ] Retry logic pentru postări eșuate
- [ ] Support pentru video posts
- [ ] Support pentru multiple images
- [ ] Queue system pentru procesare asincronă
- [ ] Webhook notifications pentru status updates
- [ ] Analytics pentru postări
