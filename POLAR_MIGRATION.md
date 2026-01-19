# Migrare de la Stripe la Polar.sh

## Pași pentru migrare

### 1. Instalare și configurare

1. SDK-ul Polar.sh a fost deja instalat: `@polar-sh/sdk`
2. Elimină dependențele Stripe din `package.json`:
   ```bash
   npm uninstall stripe @stripe/stripe-js
   ```

### 2. Variabile de mediu

#### Unde să găsești fiecare variabilă în Polar.sh:

**1. POLAR_ACCESS_TOKEN (Organization Access Token)**
   - Mergi în dashboard-ul Polar.sh: https://polar.sh
   - Click pe **Settings** (setări) în sidebar-ul stâng
   - Selectează **API** sau **Access Tokens**
   - Click pe **"Create Access Token"** sau **"Generate Token"**
   - Copiază tokenul generat (începe cu `polar_oat_...`)
   - ⚠️ **IMPORTANT**: Copiază-l imediat, nu vei mai putea să-l vezi după!

**2. POLAR_SERVER_URL**
   - Pentru producție: `https://api.polar.sh` (implicit)
   - Pentru sandbox/test: `https://sandbox-api.polar.sh`
   - De obicei poți lăsa implicit dacă folosești producția

**3. POLAR_WEBHOOK_SECRET**
   - Mergi în **Settings** → **Webhooks**
   - Click pe **"Create Webhook"** sau **"Add Webhook Endpoint"**
   - Adaugă URL-ul: `https://yourdomain.com/api/webhooks/polar`
   - După creare, Polar va genera un **Webhook Secret**
   - Copiază secretul (de obicei începe cu `whsec_...` sau similar)

**4. POLAR_STARTER_PRODUCT_ID**
   - Mergi în **Products** din sidebar
   - Click pe **"Create Product"** sau **"New Product"**
   - Creează produsul "Starter":
     - Nume: "Starter"
     - Tip: **Subscription** (abonament recurent)
     - Preț: €29/lună
     - Billing period: **Monthly** (lunar)
   - După creare, găsește **Product ID**:
     - Click pe produs pentru a-l deschide
     - Product ID este în URL (ex: `/products/prod_abc123`) sau în detaliile produsului
     - Sau click pe meniul "⋮" (trei puncte) lângă produs și selectează **"Copy Product ID"**
   - ⚠️ **IMPORTANT**: În Polar.sh NU există "Price ID" separat! Prețul este parte din produs.

**5. POLAR_GROWTH_PRODUCT_ID**
   - Același proces ca pentru Starter
   - Creează produsul "Growth" cu prețul €59/lună (Monthly subscription)
   - Copiază doar Product ID

**6. POLAR_AGENCY_PRODUCT_ID**
   - Același proces ca pentru Starter
   - Creează produsul "Agency" cu prețul €119/lună (Monthly subscription)
   - Copiază doar Product ID

#### Adaugă în `.env.local`:
```env
POLAR_ACCESS_TOKEN=polar_oat_xxxxxxxxxxxxx
POLAR_SERVER_URL=https://api.polar.sh
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
POLAR_STARTER_PRODUCT_ID=prod_xxxxxxxxxxxxx
POLAR_GROWTH_PRODUCT_ID=prod_xxxxxxxxxxxxx
POLAR_AGENCY_PRODUCT_ID=prod_xxxxxxxxxxxxx
```

#### Note importante:
- ⚠️ **În Polar.sh NU există "Price ID" separat!** Spre deosebire de Stripe, prețurile sunt parte integrantă din produs
- Când creezi produsul cu prețul €29/lună, acel preț este deja atașat la Product ID
- Pentru checkout, folosești doar Product ID - Polar va folosi automat prețul setat în produs
- Dacă vrei să vezi Product ID-ul, deschide produsul și verifică URL-ul sau folosește opțiunea "Copy Product ID" din meniul produsului

### 3. Actualizare bază de date

Rulează scriptul de migrare:
```sql
-- Vezi supabase/migration-polar.sql
```

### 4. Configurare Polar.sh (Pași detaliați)

#### Pasul 1: Creează cont și organizație
1. Mergi pe https://polar.sh și creează cont
2. Creează o organizație (Organization) dacă nu ai deja

#### Pasul 2: Creează produsele de abonament
1. Mergi în **Products** din sidebar
2. Click pe **"Create Product"** sau **"New Product"**
3. Pentru fiecare plan:
   
   **Starter Plan:**
   - Nume: "Starter"
   - Tip: **Subscription** (abonament recurent)
   - Preț: €29/lună
   - Billing period: **Monthly** (lunar)
   - Salvează și notează doar **Product ID** (nu există Price ID separat în Polar.sh)
   
   **Growth Plan:**
   - Nume: "Growth"
   - Tip: **Subscription**
   - Preț: €59/lună
   - Billing period: **Monthly**
   - Salvează și notează doar **Product ID**
   
   **Agency Plan:**
   - Nume: "Agency"
   - Tip: **Subscription**
   - Preț: €119/lună
   - Billing period: **Monthly**
   - Salvează și notează doar **Product ID**

#### Pasul 3: Configurează webhook-ul
1. Mergi în **Settings** → **Webhooks**
2. Click pe **"Create Webhook"** sau **"Add Webhook Endpoint"**
3. Adaugă:
   - **URL**: `https://yourdomain.com/api/webhooks/polar`
   - Pentru development local, poți folosi ngrok sau similar
4. Selectează evenimentele la care vrei să te abonezi:
   - ✅ `checkout.succeeded` sau `order.paid`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `invoice.paid`
5. Salvează și copiază **Webhook Secret** generat

#### Pasul 4: Obține Access Token
1. Mergi în **Settings** → **API** sau **Access Tokens**
2. Click pe **"Create Access Token"** sau **"Generate Token"**
3. Dă-i un nume descriptiv (ex: "SocialPilot Production")
4. Copiază tokenul imediat (începe cu `polar_oat_...`)

### 5. Testare

1. Testează checkout-ul cu un plan de test
2. Verifică webhook-urile în dashboard-ul Polar
3. Testează fluxul complet de la checkout la adăugarea creditelor

## Note importante

- API-ul Polar.sh poate avea structuri diferite față de Stripe
- Verifică documentația oficială Polar.sh pentru structura exactă a webhook-urilor
- Ajustează codul din `app/api/webhooks/polar/route.ts` conform structurii reale a evenimentelor Polar
