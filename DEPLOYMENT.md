# 🚀 Free Deployment Guide

## Setup: Frontend on Vercel + Backend on Local PC

### Prerequisites
- ngrok account (free): https://ngrok.com/signup
- Vercel account (free): https://vercel.com/signup

---

## Step 1: Expose Backend with ngrok (FREE)

1. **Install ngrok**:
```bash
brew install ngrok
```

2. **Get your auth token**:
   - Sign up at https://ngrok.com/signup
   - Go to https://dashboard.ngrok.com/get-started/your-authtoken
   - Copy your authtoken

3. **Configure ngrok**:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

4. **Start ngrok** (keep this terminal running):
```bash
cd backend
ngrok http 5001
```

5. **Copy the HTTPS URL**:
   - Look for line like: `Forwarding https://abc123.ngrok-free.app -> http://localhost:5001`
   - **Copy the HTTPS URL** (e.g., `abc123.ngrok-free.app`)

---

## Step 2: Configure Frontend

1. **Update `.env.production`**:
```bash
cd ../frontend
nano .env.production
```

2. **Replace `YOUR_NGROK_URL`** with your ngrok URL:
```
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app/api/v1
```

Save and exit (Ctrl+X, then Y, then Enter)

---

## Step 3: Deploy to Vercel (FREE)

1. **Login to Vercel**:
```bash
npx vercel login
```

2. **Deploy**:
```bash
npx vercel --prod
```

3. **Follow prompts**:
   - Set up and deploy: **Yes**
   - Which scope: **Your account**
   - Link to existing project: **No**
   - Project name: **raghhav-roadways**
   - Directory: **./** (press Enter)
   - Override settings: **No**

4. **Add Environment Variable on Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add:
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: `https://YOUR_NGROK_URL/api/v1`
   - Save
   - Redeploy (Deployments tab → ... → Redeploy)

---

## Step 4: Access Your App

Your app will be live at: `https://raghhav-roadways.vercel.app`

---

## ⚠️ Important Notes

### ngrok Free Plan Limitations:
- URL changes every time you restart ngrok
- 40 requests/minute
- Sessions expire after 2 hours

### When ngrok URL changes:
1. Update `.env.production`
2. Update Vercel environment variable
3. Redeploy: `npx vercel --prod`

### Keeping Backend Running:
Your backend must be running on your PC for the app to work!

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: ngrok
ngrok http 5001
```

---

## 💡 Better Long-term Solution

Deploy backend to **Railway** (free tier):
- No changing URLs
- Always online
- Free PostgreSQL database included
- Guide: https://railway.app

---

## Troubleshooting

**CORS errors**: Backend CORS is pre-configured to allow:
- `localhost:3000`
- All `.vercel.app` domains
- All `.ngrok` domains

**Can't access**: Make sure:
1. Backend is running (`npm run dev`)
2. ngrok is running and connected
3. Environment variable on Vercel matches ngrok URL
