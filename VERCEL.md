# Deploy to Vercel

This app is a **Vite + React SPA**. `vercel.json` sends all routes to `index.html` so deep links like `/dashboard` work after deploy.

## Option A — Vercel dashboard (no CLI)

1. Push this folder to **GitHub** (repo can be private).
2. Go to [vercel.com](https://vercel.com) → **Add New…** → **Project**.
3. **Import** your repo.
4. Vercel should detect **Vite** automatically. Confirm:
   - **Root Directory:** leave default if the repo root *is* `Sales Product Search Screen`.  
     If the repo root is the parent `Project/` folder, set root to **`Sales Product Search Screen`**.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Share the production URL with your client.

## Option B — Vercel CLI (deploy from your laptop)

From **this directory** (`Sales Product Search Screen`):

```bash
cd "Project/Sales Product Search Screen"   # adjust if your path differs
npx vercel@latest login                    # browser opens once
npx vercel@latest                          # preview (optional)
npx vercel@latest --prod                   # production — share this URL
```

Or use npm scripts (same folder):

```bash
npm run deploy:preview   # preview
npm run deploy           # production
```

First time, the CLI may ask: **Link to existing project?** → choose as needed; **Which scope?** → your account; **Directory?** → `.`  

`vercel.json` in this folder sets build + SPA rewrites automatically.

## After deploy

- **Updates:** push to Git (if connected) or run `vercel --prod` again from CLI.
- **Prototype note:** Tell clients it’s static mock data (no real backend).
