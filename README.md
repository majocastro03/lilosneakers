## 👟 Proyecto LiloSneakers

Aplicación web para la gestión y venta de zapatillas.  
Este proyecto está dividido en **Frontend** y **Backend**

---

## Tecnologías principales

### Frontend
- **Framework:** Angular  
- **Estilos:** Tailwind CSS  

### Backend
- **Runtime:** Node.js  
- **Base de datos y autenticación:** Supabase  

---

## Requisitos previos

| Herramienta | Comando para verificar | Versión usada |
|--------------|------------------------|----------------|
| Node.js | `node -v` | v20.17.0 |
| npm | `npm -v` | 10.5.0 |
| Angular CLI | `ng v` | 17.3.5 |

---

## Instalación

Clonar el repositorio y entrar en las carpetas correspondientes para instalar dependencias.

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

## Configuración del entorno
En el backend es necesario crear un archivo .env con las credenciales para la conexión a Supabase
```bash
SUPABASE_URL=URL
SUPABASE_KEY=URL
```

## Ejecución en desarrollo
### Frontend
```bash
ng serve
```

### Backend
```bash
npm run dev
```

### --> Para crear service en Angular
```bash
ng generate service core/services/autenticacion/auth-service
```

### --> Para crear componente en Angular
```bash
ng generate component pages/login
```

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
