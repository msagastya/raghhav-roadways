# Quick Supabase Setup - Fresh Project (5 minutes)

Your current project is paused/unreachable. Let's create a fresh one.

## Step 1: Create New Project (2 minutes)

```
1. Go to: https://supabase.com/dashboard
2. Click: "New Project"
3. Fill in:
   - Name: raghhav-roadways-new
   - Password: YourStrongPassword123 (remember this!)
   - Region: Asia Pacific (ap-south-1) - Singapore or Mumbai
   - Click: "Create new project"
4. Wait 2-3 minutes for initialization
```

## Step 2: Get Connection String (1 minute)

```
1. In your new project → Click "Settings" (gear icon)
2. Go to "Database" section
3. Under "Connection String" → Select "URI"
4. Copy the full connection string
   Should look like:
   postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

## Step 3: Update Local .env

Replace the entire DATABASE_URL line in:
`/Users/msagastya/Desktop/raghhav-roadways/backend/.env`

```bash
# OLD (doesn't work):
DATABASE_URL="postgresql://postgres.dlmgmdemfvjpnokkgylq:RRoadways%232025@aws-0-ap-south-1.supabase.co:5432/postgres"

# NEW (from your fresh project):
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:[PORT]/postgres"
```

## Step 4: Test Connection

Run the diagnostic:
```bash
bash /Users/msagastya/Desktop/raghhav-roadways/test-db-connection.sh
```

Should say: ✅ Database server is REACHABLE!

## Step 5: Run Setup

```bash
bash /Users/msagastya/Desktop/raghhav-roadways/AUTOMATED_SETUP.sh
```

This will:
- ✅ Run migrations
- ✅ Create admin user
- ✅ Verify everything works

---

## Step 6: Update Vercel

Update DATABASE_URL in Vercel:

```
1. Go to: https://vercel.com/msagastya/raghhav-roadways/settings/environment-variables
2. Find: DATABASE_URL
3. Click: Edit
4. Paste: Your new connection string
5. Click: Save
6. Redeploy: git push origin master
```

---

**Timing:** 5-10 minutes total
**Result:** Working backend + database + admin user

Let me know once you have the new connection string! 🚀
