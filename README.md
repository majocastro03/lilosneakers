# Lilo's Sneakers 👟

E-commerce de zapatillas deportivas desarrollado con Angular y Node.js.

## 🌐 Deploy en Producción

- **Frontend**: https://lilosneakers.netlify.app
- **Backend**: https://lilosneakers-api.onrender.com
- **API Health**: https://lilosneakers-api.onrender.com/health

## 🛠️ Tecnologías

### Frontend
- Angular 19
- TypeScript
- TailwindCSS
- NgxPagination

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- Multer (uploads)
- Helmet + CORS

## 📦 Instalación Local

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configura tus variables de entorno
npm run dev
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

## 🚀 Deploy

El proyecto usa:
- **Render** para el backend (auto-deploy desde main)
- **Netlify** para el frontend (auto-deploy desde main)

### Variables de entorno requeridas (Render):
```
SUPABASE_URL=tu-url
SUPABASE_KEY=tu-key
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://lilosneakers.netlify.app
```

## 📁 Estructura del Proyecto

```
lilosneakers/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── config/
│   │   └── app.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── pages/
    │   │   ├── shared/
    │   │   ├── core/
    │   │   └── app.component.ts
    │   └── environments/
    ├── netlify.toml
    └── package.json
```

## 👨‍💻 Desarrollado por

María José Castro - [@majocastro03](https://github.com/majocastro03)

## 📄 Licencia

ISC
