# Bannerly - AI-Powered Social Media Banner Generator

Bannerly is a SaaS application that allows users to generate branded advertising banners using AI and schedule them automatically on social media platforms (Facebook, Instagram, LinkedIn, TikTok) from a single interface.

## Features

- 🤖 **AI Image Generation**: Generate multiple banner variants using Kie API (Nano Banana model)
- 🎨 **Brand Kit**: Upload logo, set brand colors, and provide business description for consistent branding
- 📅 **Auto Scheduling**: Schedule posts across all major social platforms
- 💳 **Credit System**: Monthly subscription plans with credit-based usage
- 🔐 **Authentication**: Secure user authentication via Supabase Auth

## Tech Stack

- **Frontend**: Next.js 16 (React) + TypeScript + Tailwind CSS + ShadcnUI
- **Backend/Database**: Supabase (Auth, Database, Storage)
- **AI Image Generation**: Kie.ai API (Model: Nano Banana) - Direct integration
- **Social Media Posting**: Outstand.so API (Unified Social Media API)
- **Payments**: Polar.sh (Subscription model with monthly credits)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Kie.ai API key (get from https://kie.ai)
- Outstand API key (or alternative)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bannere-automate
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Polar.sh
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_SERVER_URL=https://api.polar.sh
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_STARTER_PRODUCT_ID=your_polar_starter_product_id
POLAR_STARTER_PRICE_ID=your_polar_starter_price_id
POLAR_GROWTH_PRODUCT_ID=your_polar_growth_product_id
POLAR_GROWTH_PRICE_ID=your_polar_growth_price_id
POLAR_AGENCY_PRODUCT_ID=your_polar_agency_product_id
POLAR_AGENCY_PRICE_ID=your_polar_agency_price_id

# Kie.ai API (Required for image generation)
KIE_API_KEY=your_kie_api_key
# Get your API key from: https://kie.ai/dashboard

# Outstand.so API (for social media posting)
# Get your API key from: https://www.outstand.so
OUTSTAND_API_KEY=your_outstand_api_key

# Cron Job Secret (for automated post processing)
CRON_SECRET=your_random_secret_string

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:

   a. Create a new Supabase project
   
   b. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   
   c. Create storage bucket: See detailed instructions in `supabase/storage-setup.md`
      - Create bucket named `logos` with public access
      - Configure RLS policies for secure file access

5. Set up Polar.sh:

   a. Create a Polar.sh account and organization at https://polar.sh
   
   b. Create three subscription products in Polar.sh:
      - Starter: €29/month
      - Growth: €59/month
      - Agency: €119/month
   
   c. Copy the Product IDs and Price IDs and add them to your `.env.local`
   
   d. Get your Organization Access Token (OAT) from Polar.sh dashboard
   
   e. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/polar`
   
   f. Subscribe to these events:
      - `checkout.succeeded`
      - `subscription.updated`
      - `subscription.canceled`
      - `invoice.paid`
   
   g. Run the migration script `supabase/migration-polar.sql` to update database schema

6. Set up Kie.ai API:

   a. Create an account at https://kie.ai
   
   b. Get your API key from the dashboard
   
   c. Add `KIE_API_KEY=your_api_key` to your `.env.local` file
   
   d. The application will automatically use Nano Banana model for image generation

7. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── generate-images/    # Image generation endpoint
│   │   ├── schedule-post/      # Post scheduling endpoint
│   │   ├── credits/            # Credit management
│   │   ├── create-checkout-session/  # Polar.sh checkout
│   │   └── webhooks/polar/    # Polar.sh webhooks
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Dashboard pages
│   │   ├── playground/         # Image generation UI
│   │   ├── schedule/           # Post scheduling UI
│   │   ├── subscribe/          # Subscription page
│   │   └── settings/           # Settings page
│   ├── onboarding/             # Brand kit setup
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # ShadcnUI components
│   └── dashboard-layout.tsx    # Dashboard layout
├── lib/
│   ├── supabase/               # Supabase clients
│   ├── polar.ts                # Polar.sh configuration
│   ├── types.ts                # TypeScript types
│   └── utils/                  # Utility functions
├── supabase/
│   └── schema.sql              # Database schema
└── middleware.ts               # Auth middleware
```

## Credit System

- **1 Credit** = 1 AI-generated image
- **5 Credits** = 1 scheduled post

### Subscription Plans

- **Starter** (€29/month): 100 credits/month
- **Growth** (€59/month): 300 credits/month
- **Agency** (€119/month): 1000 credits/month

Credits reset monthly on the billing date.

## User Journey

1. **Sign Up**: User creates an account
2. **Onboarding**: User sets up brand kit (logo, colors, business description)
3. **Generate**: User generates banners in the Playground
4. **Schedule**: User schedules posts on social media platforms
5. **Manage**: User manages subscriptions and settings

## API Integration

### Image Generation (Kie.ai Direct Integration)

The application directly calls Kie.ai API using the Nano Banana model. The endpoint `/api/generate-images` accepts:

```json
{
  "text": "Banner text",
  "theme": "modern",
  "variantCount": 5,
  "aspectRatio": "16:9",
  "brandKit": {
    "primary_color": "#000000",
    "secondary_color": "#FFFFFF",
    "business_description": "..."
  }
}
```

The API will:
1. Build an optimized prompt using the brand kit information
2. Create multiple generation tasks (one per variant)
3. Poll for completion and return image URLs
4. Save images to the database

Response:

```json
{
  "images": [
    {
      "id": "...",
      "image_url": "https://...",
      "prompt": "...",
      "theme": "modern",
      "variant_number": 1
    },
    ...
  ]
}
```

### Automated Post Processing

The application includes an endpoint `/api/process-scheduled-posts` that processes scheduled posts. This should be called periodically via a cron job.

**Setup Cron Job:**

⚠️ **Important**: Vercel Hobby plan only allows daily cron jobs (once per day). For more frequent execution, use an external service (see option 2).

1. **Vercel** (Daily - for Hobby plan): Already configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/process-scheduled-posts",
    "schedule": "0 0 * * *"
  }]
}
```
   - Runs once per day at midnight
   - For more frequent execution, use an external service

2. **External Service** (Recommended for frequent execution): Configure a cron job to call:
```
POST https://yourdomain.com/api/process-scheduled-posts
Authorization: Bearer YOUR_CRON_SECRET
```
   - Recommended services: [cron-job.org](https://cron-job.org), [EasyCron](https://www.easycron.com)
   - Can run as frequently as needed (e.g., every minute: `* * * * *`)

**Environment Variables:**
- `CRON_SECRET`: Secret for authenticating cron job requests
- `OUTSTAND_API_KEY`: API key for Outstand.ai (or similar service)

See `docs/AUTOMATED_POSTING_SETUP.md` for detailed setup instructions.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

This project is private and proprietary.
