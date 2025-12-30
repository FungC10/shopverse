# ShopVerse Deployment Plan

## ✅ Is Vercel the Right Choice?

**Yes, Vercel is perfect for ShopVerse.** Here's why:

### Why Vercel Works Great

1. **Native Next.js Support**: Vercel is built by the Next.js team, providing:
   - Zero-config deployment
   - Automatic optimizations (ISR, image optimization, etc.)
   - Built-in CDN and edge network
   - Automatic SSL certificates

2. **Serverless Architecture Benefits**:
   - ✅ **API Routes**: Your `/api/checkout` and `/api/stripe/webhook` run as serverless functions
   - ✅ **Auto-scaling**: Handles traffic spikes automatically
   - ✅ **Cost-effective**: Pay only for what you use (generous free tier)
   - ✅ **Global edge network**: Fast response times worldwide

3. **Perfect Fit for Your Stack**:
   - PostgreSQL via Prisma (works great with connection pooling)
   - Stripe webhooks (public HTTPS endpoint required - Vercel provides this)
   - Next.js App Router (fully supported)
   - Environment variables (easy management in Vercel dashboard)

### Serverless Considerations (Already Handled)

Your app is already designed with serverless in mind:

- ✅ **Rate Limiting**: In-memory rate limiter resets on cold starts (documented as acceptable for demo)
- ✅ **Database Connections**: Prisma handles connection pooling automatically
- ✅ **Webhook Endpoint**: Uses `runtime = 'nodejs'` for raw body access (required for Stripe signature verification)
- ✅ **Stateless Design**: No server-side sessions - everything in database or client storage

## Pre-Deployment Checklist

### 1. Database Setup

- [ ] **Choose a PostgreSQL provider**:
  - **Neon** (recommended): Serverless Postgres, great for Vercel
  - **Supabase**: PostgreSQL with additional features
  - **PlanetScale**: MySQL (would require schema changes)
  - **Railway/Render**: Traditional Postgres hosting

- [ ] **Create production database**:
  ```bash
  # Example with Neon
  # 1. Sign up at https://neon.tech
  # 2. Create a new project
  # 3. Copy the connection string (starts with postgresql://)
  ```

- [ ] **Test database connection**:
  ```bash
  # Set DATABASE_URL in your local .env
  DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
  
  # Test connection
  pnpm db:migrate:deploy
  pnpm db:seed
  ```

### 2. Stripe Setup

- [ ] **Get production Stripe keys**:
  - Go to [Stripe Dashboard](https://dashboard.stripe.com)
  - Switch to "Live mode" (toggle in top right)
  - Go to [API Keys](https://dashboard.stripe.com/apikeys)
  - Copy:
    - **Secret key** (starts with `sk_live_...`)
    - **Publishable key** (starts with `pk_live_...`)

- [ ] **Prepare webhook endpoint** (do this after first deployment):
  - You'll need your production URL first
  - We'll set this up in Step 4

### 3. Code Preparation

- [ ] **Verify all environment variables are documented**:
  - Check `README.md` for complete list
  - Ensure `.env.example` exists (or create one)

- [ ] **Run final checks**:
  ```bash
  # Type check
  pnpm typecheck
  
  # Lint
  pnpm lint
  
  # Tests
  pnpm test
  
  # Build locally
  pnpm build
  ```

- [ ] **Verify `vercel.json` exists**:
  ```json
  {
    "buildCommand": "pnpm db:migrate:conditional && pnpm build"
  }
  ```
  
  **Note**: The build command uses conditional migrations - migrations will be skipped if `DATABASE_URL` is not set, allowing the build to succeed. Migrations will run automatically when `DATABASE_URL` is configured.

## Step-by-Step Deployment Guide

### Step 1: Connect Repository to Vercel

1. **Sign up/Login to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub (recommended)

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your `shopverse` repository
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: Already set in `vercel.json`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install` (auto-detected)

### Step 2: Set Environment Variables

In Vercel project settings → Environment Variables, add:

#### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Stripe (Production keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App URL (will be your Vercel URL)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Webhook Secret (set after Step 3)
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Optional Variables

```bash
# Promo codes (if enabled)
NEXT_PUBLIC_ENABLE_PROMO_CODES=true
```

**Important**: 
- Set these for **Production**, **Preview**, and **Development** environments
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Never commit secrets to Git

### Step 3: Deploy

1. **Click "Deploy"** in Vercel dashboard
2. **Wait for build** (usually 2-3 minutes):
   - Vercel runs `pnpm install`
   - Runs `pnpm db:migrate:conditional` (from `vercel.json`) - will skip if `DATABASE_URL` not set
   - Runs `pnpm build`
   
   **Important**: If `DATABASE_URL` is not set yet, the build will succeed but migrations will be skipped. After setting `DATABASE_URL`, redeploy to run migrations.
3. **Get your production URL**: `https://your-app.vercel.app`

### Step 4: Configure Stripe Webhook

1. **Get your production URL** from Step 3

2. **Create webhook in Stripe Dashboard**:
   - Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - **Endpoint URL**: `https://your-app.vercel.app/api/stripe/webhook`
   - **Events to send**: Select `checkout.session.completed`
   - Click "Add endpoint"

3. **Copy webhook signing secret**:
   - After creating, click on the webhook endpoint
   - Copy the "Signing secret" (starts with `whsec_...`)

4. **Add to Vercel**:
   - Go back to Vercel → Project Settings → Environment Variables
   - Add `STRIPE_WEBHOOK_SECRET` with the `whsec_...` value
   - **Important**: Redeploy after adding (Vercel → Deployments → "Redeploy")

### Step 5: Verify Deployment

#### 1. Health Check
```bash
curl https://your-app.vercel.app/api/ping
# Should return: {"ok":true,"route":"ping"}
```

#### 2. Status Page
Visit: `https://your-app.vercel.app/status`
- Should show: DB connection ✅, Stripe key ✅, etc.

#### 3. Test Checkout Flow
1. **Browse catalog**: Visit `https://your-app.vercel.app`
2. **Add to cart**: Click on a product, add to cart
3. **Go to checkout**: Click cart icon → "Checkout"
4. **Fill address form**: Use test data
5. **Complete payment**: Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
6. **Verify success page**: Should show order receipt
7. **Check database**: Verify order was created:
   ```bash
   # Set DATABASE_URL to production
   DATABASE_URL="your-production-url" pnpm check:orders
   ```

#### 4. Verify Webhook
- Go to Stripe Dashboard → Webhooks → Your endpoint
- Check "Recent events" tab
- Should see `checkout.session.completed` events with ✅ status

## Post-Deployment Configuration

### Custom Domain (Optional)

1. **Add domain in Vercel**:
   - Project Settings → Domains
   - Add your domain (e.g., `shopverse.com`)
   - Follow DNS configuration instructions

2. **Update environment variables**:
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy

### Monitoring & Analytics

Consider adding:
- **Vercel Analytics**: Built-in (enable in project settings)
- **Sentry**: Error tracking (already ErrorBoundary-ready)
- **Stripe Dashboard**: Monitor payments and webhooks

## Important Considerations

### 1. Rate Limiting (Serverless Limitation)

**Current Implementation**: In-memory rate limiter (10 req/min)

**Serverless Behavior**:
- ✅ Works fine for demo/portfolio
- ⚠️ Resets on cold starts (each serverless function instance has its own memory)
- ⚠️ Not shared across instances

**For Production Scale**:
- Use **Vercel Edge Config** (key-value store)
- Or **Redis** (Upstash Redis works great with Vercel)
- Or **External service** (Cloudflare Rate Limiting)

**Current Status**: ✅ Acceptable for demo (documented in README)

### 2. Database Connection Pooling

**Prisma + Serverless Best Practices**:
- ✅ Prisma handles connection pooling automatically
- ✅ Use connection string with `?connection_limit=1` for serverless
- ✅ Neon/Supabase provide built-in pooling

**Recommended Connection String Format**:
```
postgresql://user:pass@host/db?sslmode=require&connection_limit=1
```

### 3. Webhook Timeout

**Vercel Serverless Function Limits**:
- **Hobby Plan**: 10 seconds max execution
- **Pro Plan**: 60 seconds max execution

**Your Webhook**:
- ✅ Should complete well under 10 seconds
- ✅ Uses efficient Prisma transactions
- ✅ No long-running operations

**If Timeout Issues**:
- Consider moving heavy processing to background jobs
- Use Stripe webhook retries (automatic)

### 4. Cold Starts

**What They Are**:
- First request to a serverless function after inactivity
- Can add 1-3 seconds latency

**Mitigation**:
- ✅ Vercel keeps functions warm for active projects
- ✅ ISR caching reduces API calls
- ✅ Your app is optimized (ISR on product pages)

**For Production**:
- Consider Vercel Pro plan (better cold start handling)
- Use Edge Functions for static/simple routes

### 5. Environment Variables

**Best Practices**:
- ✅ Never commit `.env` files
- ✅ Use Vercel's environment variable UI
- ✅ Set different values for Production/Preview/Development
- ✅ Rotate secrets regularly

## Troubleshooting

### Build Fails

**Error**: `Prisma Client not generated`
- **Fix**: Ensure `postinstall` script runs: `"postinstall": "prisma generate"`
- **Verify**: Check `package.json` has this script

**Error**: `Environment variable not found: DATABASE_URL`
- **Cause**: `DATABASE_URL` is not set in Vercel environment variables
- **Fix**: 
  1. Go to Vercel Project Settings → Environment Variables
  2. Add `DATABASE_URL` with your PostgreSQL connection string
  3. Set it for Production, Preview, and Development environments
  4. Redeploy the project
- **Note**: With the conditional migration script, builds will now succeed even without `DATABASE_URL`, but migrations will be skipped until it's set

**Error**: `Migration failed`
- **Fix**: Check `DATABASE_URL` is correct
- **Fix**: Ensure database exists and is accessible
- **Fix**: Check SSL mode: `?sslmode=require`

### Webhook Not Working

**Symptoms**: Orders not appearing in database

**Debug Steps**:
1. **Check Stripe Dashboard**:
   - Webhooks → Your endpoint → Recent events
   - Look for failed deliveries (red ❌)

2. **Check Vercel Logs**:
   - Project → Deployments → Click latest → Functions
   - Look for `/api/stripe/webhook` errors

3. **Verify Environment Variables**:
   - `STRIPE_WEBHOOK_SECRET` is set correctly
   - Matches the secret from Stripe Dashboard

4. **Test Locally**:
   ```bash
   # Use Stripe CLI to forward to production
   stripe listen --forward-to https://your-app.vercel.app/api/stripe/webhook
   ```

### Database Connection Issues

**Error**: `Can't reach database server`

**Fixes**:
- ✅ Check `DATABASE_URL` format
- ✅ Verify database allows connections from Vercel IPs
- ✅ Check SSL requirement (`?sslmode=require`)
- ✅ For Neon: Check "Connection pooling" settings

### Rate Limiting Not Working

**Expected**: In-memory rate limiter resets on cold starts

**This is Normal**: Each serverless function instance has separate memory

**For Production**: Implement persistent rate limiting (see "Important Considerations" above)

## Alternative Deployment Options

### If Not Vercel

**Railway**:
- ✅ Full Docker support
- ✅ PostgreSQL included
- ✅ Good for traditional deployments
- ⚠️ Less Next.js-optimized than Vercel

**Netlify**:
- ✅ Similar to Vercel
- ✅ Good Next.js support
- ⚠️ Slightly less optimized for App Router

**Self-Hosted (VPS)**:
- ✅ Full control
- ✅ No cold starts
- ⚠️ Requires server management
- ⚠️ Need to set up SSL, CDN, etc.

**Recommendation**: Stick with Vercel for this project - it's the best fit.

## Deployment Checklist Summary

- [ ] Database created and accessible
- [ ] Stripe production keys obtained
- [ ] Code builds successfully locally
- [ ] Repository connected to Vercel
- [ ] Environment variables set in Vercel
- [ ] Initial deployment successful
- [ ] Webhook endpoint configured in Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] Redeployed after webhook secret added
- [ ] Health check passes (`/api/ping`)
- [ ] Status page shows all green (`/status`)
- [ ] Test checkout flow works end-to-end
- [ ] Order appears in database after payment
- [ ] Webhook events showing as successful in Stripe Dashboard

## Next Steps After Deployment

1. **Monitor First Few Orders**: Watch Stripe Dashboard and database
2. **Set Up Error Tracking**: Consider Sentry for production errors
3. **Add Analytics**: Vercel Analytics or Google Analytics
4. **Document Production URL**: Update README with live link
5. **Set Up Alerts**: Configure Stripe webhook failure notifications

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma + Serverless**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Stripe Webhooks**: https://stripe.com/docs/webhooks

---

**Ready to deploy?** Start with Step 1 above! 🚀


