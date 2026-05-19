# Deployment Guide: AI Multi-Agent Decision Intelligence System

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- Git

### 1. Backend Setup (FastAPI + Uvicorn)

```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend will be available at: `http://localhost:8000`
- Health check: `http://localhost:8000/docs` (Swagger UI)

### 2. Frontend Setup (Next.js 15)

```bash
cd frontend
cp .env.example .env.local
# .env.local already configured for http://localhost:8000
npm install
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 3. Test the System

1. Open browser: `http://localhost:3000`
2. Enter a question in the input box
3. Click "Analyze with AI"
4. Watch agents process in real-time
5. See typed final recommendation

---

## Deployment: Vercel (Frontend) + Render (Backend)

### Step 1: Deploy Backend on Render

#### Setup a new Render Web Service
1. Go to [render.com](https://render.com)
2. Sign in and create new **Web Service**
3. Connect your GitHub repository
4. Choose the repository and branch
5. Select **Start from scratch** or **Auto-detect** → Python

#### Configuration
- **Name**: `ai-decision-agent-api`
- **Environment**: `Python 3.9`
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`

#### Environment Variables (add in Render dashboard)
```
# Use GROQ_API_KEY for Groq models, or OPENAI_API_KEY for OpenAI/OpenRouter.
GROQ_API_KEY=your_groq_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
ALLOWED_ORIGINS=https://your-frontend-vercel-app.vercel.app,http://localhost:3000
MODEL=groq/llama-3.1-8b-instant
# MODEL=openrouter/deepseek/deepseek-chat
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

#### Notes
- Render will provide a public URL like: `https://ai-decision-agent-api.onrender.com`
- First deploy takes 5-10 minutes
- Backend will auto-redeploy on git push

### Step 2: Deploy Frontend on Vercel

#### Setup a new Vercel Deployment
1. Go to [vercel.com](https://vercel.com)
2. Sign in and create new **Project**
3. Import your GitHub repository
4. Select **frontend** as root directory
5. Configure build settings

#### Configuration
- **Framework Preset**: `Next.js`
- **Root Directory**: `./frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Environment Variables (add in Vercel dashboard → Project Settings → Environment Variables)
```
NEXT_PUBLIC_API_URL=https://ai-decision-agent-api.onrender.com
NEXT_PUBLIC_DEBUG=0
```

#### Notes
- Vercel will auto-deploy on git push
- Frontend includes shimmers, animations, and glassmorphism effects
- App will be available at: `https://your-frontend-name.vercel.app`

---

## Important Configuration

### CORS Setup (Backend)

Your backend uses environment-based CORS configuration:

**Local Development** (allow all origins):
```
ALLOWED_ORIGINS=*
```

**Production** (restrict to specific origins):
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://custom-domain.com
```

### API Timeout & Retry Logic (Frontend)

Frontend automatically:
- Retries multiple host configurations (localhost, 127.0.0.1, window hostname)
- Uses 60-second timeout (plenty for multi-agent processing)
- Logs all attempts to browser console for debugging
- Shows debug panel with raw backend response

---

## Production Deployment Checklist

- [ ] Backend `.env` has `OPENAI_API_KEY` set
- [ ] Backend `ALLOWED_ORIGINS` includes your Vercel frontend URL
- [ ] Frontend `.env.production` has `NEXT_PUBLIC_API_URL` set to Render backend URL
- [ ] Both services have proper error handling and logging
- [ ] Tested end-to-end: submit question → agents process → recommendation displays
- [ ] Check Vercel/Render dashboards for build errors
- [ ] Monitor error logs (Render dashboard, Vercel analytics)

---

## Troubleshooting

### Frontend times out / "Could not reach backend"
- Check browser DevTools → Console for `[analyze]` logs
- Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Ensure backend is running and not in Render free tier sleep
- Test backend directly: `curl https://api-url.onrender.com/docs`

### CORS errors in browser console
- Add frontend URL to backend `ALLOWED_ORIGINS` on Render
- Format: `https://your-frontend.vercel.app` (no trailing slash)
- Render restarts required for env var changes

### Backend API taking too long (timeout)
- Multi-agent processing can take 30-60 seconds
- Frontend timeout is set to 60s (sufficient)
- Check Render logs for API delays or quota limits
- Consider scaling backend resources on Render

### "512 MB limit" on Vercel
- This is for serverless functions; your app runs as Next.js (not functions)
- Vercel's static serving + API routes are separate from the limit
- Your backend on Render has no memory restrictions for standard deployment

---

## Local Testing with Production Config

To test frontend against Render backend locally:
```bash
# In frontend/.env.local
NEXT_PUBLIC_API_URL=https://ai-decision-agent-api.onrender.com
```

Then run: `npm run dev` and visit `http://localhost:3000`

---

## File Structure After Deployment

```
ai-decision-agent/
├── backend/
│   ├── main.py (with CORS config)
│   ├── requirements.txt
│   └── .env (secrets, not in git)
├── frontend/
│   ├── app/
│   │   ├── page.tsx (with env-based API URL)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── .env.local (local development)
│   ├── .env.example (template)
│   └── next.config.ts
└── DEPLOYMENT.md (this file)
```

---

## Next Steps

1. Deploy backend to Render first
2. Get the public URL (e.g., `https://xxx.onrender.com`)
3. Deploy frontend to Vercel with that URL as `NEXT_PUBLIC_API_URL`
4. Test end-to-end
5. Monitor logs for any issues

Good luck! 🚀
