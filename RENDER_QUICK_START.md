# 🚀 Quick Start Guide - Render Deployment

## TL;DR (Tóm tắt nhanh)

Bạn cần làm những bước sau để deploy AI Growth Planner lên Render:

### 1️⃣ Chuẩn bị (5 phút)

```bash
# Chạy script kiểm tra
./prepare-render-deployment.sh

# Push code to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2️⃣ Tạo Database (3 phút)

1. Vào https://render.com
2. Dashboard → **"New +"** → **"PostgreSQL"**
3. Đặt tên: `ai-growth-planner-db`
4. Chọn region gần nhất
5. Copy **Internal Database URL**

### 3️⃣ Deploy Backend (5 phút)

1. Dashboard → **"New +"** → **"Web Service"**
2. Chọn GitHub repo
3. Cấu hình:
   - **Name**: `ai-growth-planner-backend`
   - **Root Directory**: `./backend`
   - **Build Command**: `npm install -g pnpm && pnpm install && pnpm run build`
   - **Start Command**: `node dist/main.js`
4. **Environment Variables** (copy từ `.env.example`):
   ```
   DATABASE_HOST=<db-url-host>
   DATABASE_PORT=5432
   DATABASE_USERNAME=avnadmin
   DATABASE_PASSWORD=<your-password>
   DATABASE_NAME=ai_growth_planner
   NODE_ENV=production
   PORT=3000
   AI_PROVIDER=openrouter
   OPENROUTER_API_KEY=<your-key>
   OPENROUTER_MODEL=openai/gpt-3.5-turbo
   OPENROUTER_REFERER=<your-backend-url>
   JWT_SECRET=<random-secret>
   JWT_EXPIRATION=7d
   ```
5. Click **"Deploy"**
6. **Copy backend URL** (e.g., `https://xxx.onrender.com`)

### 4️⃣ Deploy Frontend (5 phút)

1. Dashboard → **"New +"** → **"Web Service"**
2. Chọn GitHub repo (cùng repo)
3. Cấu hình:
   - **Name**: `ai-growth-planner-web`
   - **Root Directory**: `./web`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=<your-backend-url-from-step-3>
   NODE_ENV=production
   ```
5. Click **"Deploy"**
6. **Done!** 🎉

---

## 📋 Detailed Documentation

- **Full Guide**: [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)
- **Checklist**: [RENDER_DEPLOYMENT_CHECKLIST.md](RENDER_DEPLOYMENT_CHECKLIST.md)

---

## 🔍 Testing

### Backend
```bash
curl https://your-backend.onrender.com/
```

### Frontend
```
https://your-frontend.onrender.com
```

### Database Connection
- Backend logs should show: `Connected to database successfully`
- Frontend should be able to fetch data from backend

---

## ⚠️ Important Notes

1. **Free Tier**: Services spin down after 15 minutes of inactivity
   - Upgrade to Starter ($7/month) for always-on service

2. **Environment Variables**: 
   - Never commit `.env` files
   - Use `.env.example` as template
   - Set all variables in Render dashboard

3. **Database Migrations**:
   - If using TypeORM migrations, run them from Render Shell after first deploy

4. **CORS**: If frontend can't connect to backend
   - Check backend CORS settings
   - Ensure `NEXT_PUBLIC_API_URL` is correct

---

## 🆘 Troubleshooting

### "Failed to connect to database"
- Check DATABASE_* variables in Render
- Verify PostgreSQL is running
- Test with external database URL from local machine

### "Cannot GET /"
- Check backend build logs
- Ensure `pnpm-lock.yaml` is committed
- Verify port is set to 3000

### "Frontend can't reach backend"
- Check `NEXT_PUBLIC_API_URL` env var
- Visit backend URL directly in browser
- Check browser console for CORS errors

### "Free tier service spinning down"
- Expected behavior after 15 minutes of inactivity
- Upgrade to Starter plan for production

---

## 📞 Support Links

- **Render Docs**: https://render.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Your Domain (Custom DNS)            │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (Next.js)                         │
│  https://your-web.onrender.com              │
│  ↓                                          │
│  Backend (NestJS)                           │
│  https://your-api.onrender.com              │
│  ↓                                          │
│  PostgreSQL Database                        │
│  Hosted on Render                           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✨ Next Steps After Deployment

1. **Test thoroughly**: Walk through all features
2. **Monitor logs**: Check Render dashboards regularly
3. **Setup monitoring**: Consider Render's monitoring features
4. **Custom domain**: Connect your own domain (optional)
5. **Backups**: Setup automatic database backups
6. **CI/CD**: Enable automatic deployments on git push

---

Good luck! 🚀

For more details, see the full guides in this repository.
