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
