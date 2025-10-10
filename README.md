# 1wms.io - Gestion d'entrepôt simplifiée

Application SaaS de gestion d'entrepôt (WMS) avec React, TypeScript et Cloudflare Workers.

## 🎯 Fonctionnalités

✅ Authentification complète  
✅ Multi-tenant  
✅ JWT sécurisé  
✅ Dashboard  
✅ Routes protégées  

## 🚀 Démarrage
```bash
git clone https://github.com/YAMROUCHE/wmsforge-v2.git
cd wmsforge-v2
npm install
npx wrangler d1 migrations apply wmsforge-db --local
Terminal 1 : npm run dev:worker
Terminal 2 : npm run dev
Ouvrez http://localhost:5173
🛠️ Stack
Frontend : React 18, TypeScript, Vite, Tailwind
Backend : Cloudflare Workers, Hono, JWT
Database : Cloudflare D1, Drizzle ORM
🔌 API

POST /auth/register
POST /auth/login
GET /auth/me

👨‍💻 Développeur
Amrouche - v2.1.0 - 10 octobre 2025
