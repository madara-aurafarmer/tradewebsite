# TRADERPRICE™ website
Founder: Rishabh Kumar. Static site + one serverless API (`api/data.js`).

## Deploy on Vercel
1. Import this GitHub repo in Vercel (Framework: Other, no build command).
2. Project → Storage → add **Upstash Redis** (Marketplace). It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. Project → Settings → Environment Variables → add `ADMIN_PASSWORD` (your admin password). Never commit it.
4. Redeploy. Open `/adminxpass`, enter the password, edit data, press **Save and publish**.

Admin page: `https://your-site.vercel.app/adminxpass`
For bot/DDoS protection also enable Vercel Firewall (Attack Challenge Mode) or put Cloudflare in front.
© TRADERPRICE™. All rights reserved.
