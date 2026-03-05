# LiloSneakers - Documentacion Completa del Proyecto

> Documento de referencia para que una AI pueda retomar el desarrollo con contexto completo.
> Ultima actualizacion: Marzo 2026

---

## 1. Vision General

**LiloSneakers** es un e-commerce de zapatillas para el mercado colombiano. Consta de:

- **Frontend**: Angular 20 (standalone components, signals, SSR, Tailwind CSS)
- **Backend**: Express 5 + Supabase (auth, DB, storage)
- **Base de datos**: PostgreSQL via Supabase
- **Almacenamiento de imagenes**: Supabase Storage (bucket `imagenes`)

**URLs de produccion:**
- Frontend: `https://lilosneakers.netlify.app`
- Backend API: `https://lilosneakers-api.onrender.com/api`
- Supabase: `https://rspwzmotnomlxqhmyhop.supabase.co`

**URLs de desarrollo:**
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3001`
- Frontend usa proxy (`proxy.conf.json`) para redirigir `/api` a `localhost:3001`

---

## 2. Estructura de Carpetas

```
C:\Proyectos\lilosneakers\
├── backend/
│   ├── server.js                          # Entry point (puerto 3001)
│   ├── package.json                       # Express 5, Supabase, Multer, Helmet
│   ├── .env                               # SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
│   └── src/
│       ├── app.js                         # Express config, CORS, rutas, middleware
│       ├── config/
│       │   └── supabaseCliente.js         # createClient con service role key
│       ├── middleware/
│       │   ├── auth.js                    # authMiddleware + adminMiddleware
│       │   ├── errorHandler.js            # Manejo global de errores
│       │   ├── rateLimiter.js             # Login: 10/15min, Register: 5/1h, API: 100/15min
│       │   ├── upload.js                  # Multer memory storage, max 5MB, solo imagenes
│       │   └── validate.js                # Validadores: producto, categoria, marca, color, talla, registro
│       ├── routes/
│       │   ├── autenticacionRoutes.js
│       │   ├── categoriasRoutes.js
│       │   ├── productosRoutes.js
│       │   ├── perfilesRoutes.js
│       │   ├── marcasRoutes.js
│       │   ├── coloresRoutes.js
│       │   ├── tallasRoutes.js
│       │   ├── modificacionesRoutes.js    # Asignar colores/tallas a productos
│       │   ├── carritoRoutes.js
│       │   └── ordenesRoutes.js
│       └── controllers/
│           ├── autenticacionController.js
│           ├── categoriasController.js
│           ├── productosController.js     # CRUD + upload imagen a Supabase Storage
│           ├── perfilesController.js      # Registro de usuarios
│           ├── marcasController.js        # Soft delete (activo=false)
│           ├── coloresController.js
│           ├── tallasController.js
│           ├── modificacionesController.js
│           ├── carritoController.js       # Validacion de stock
│           └── ordenesController.js       # Crear orden, actualizar estado, decrementar stock
│
├── frontend/
│   ├── angular.json                       # SSR habilitado, Vite builder
│   ├── tailwind.config.js                 # Paleta primary #2596be (50-950)
│   ├── proxy.conf.json                    # /api -> localhost:3001
│   ├── package.json                       # Angular 20, Tailwind 3.4.14, PrimeNG 20 RC
│   └── src/
│       ├── environments/
│       │   ├── environment.ts             # production: apiUrl = render.com
│       │   └── environment.development.ts # development: apiUrl = '/api' (proxy)
│       ├── styles.css                     # PrimeNG imports, Tailwind directives, CSS vars, componentes
│       ├── app/
│       │   ├── app.ts                     # Root: RouterOutlet + ModalComponent
│       │   ├── app.html
│       │   ├── app.routes.ts              # Rutas principales
│       │   ├── app.config.ts              # ZonelessChangeDetection, SSR hydration, authInterceptor
│       │   ├── core/
│       │   │   ├── guards/
│       │   │   │   ├── admin.guard.ts     # CanActivateFn: verifica admin
│       │   │   │   └── auth.guards.ts     # CanActivate: verifica autenticacion
│       │   │   ├── interceptors/
│       │   │   │   └── auth.interceptor.ts # Bearer token + logout en 401
│       │   │   ├── interfaces/
│       │   │   │   ├── producto.ts         # Producto, con marca?, tallas, colores
│       │   │   │   ├── producto-query.ts   # ProductosQuery (filtros de busqueda)
│       │   │   │   ├── producto-response.ts # ProductosResponse (paginada)
│       │   │   │   ├── categoria.ts
│       │   │   │   ├── marca.ts
│       │   │   │   ├── color.ts
│       │   │   │   └── talla.ts           # TallaStock { id?, talla, cantidad }
│       │   │   └── services/
│       │   │       ├── auth.service.ts     # Login, logout, isAdmin, currentUser signal
│       │   │       ├── cart.service.ts     # Items signal, localStorage, addItem, validateCart
│       │   │       ├── producto.service.ts # getProductos, CRUD (version simple)
│       │   │       ├── categoria.service.ts
│       │   │       ├── producto/producto-service.ts  # Version extendida con asignarTallas/Colores
│       │   │       ├── categoria/categoria-service.ts
│       │   │       ├── marca/marca-service.ts
│       │   │       ├── colores/colores-service.ts
│       │   │       └── talla/talla-service.ts
│       │   ├── shared/
│       │   │   ├── header/                # Sticky header, search toggle, cart badge
│       │   │   ├── footer/                # Footer con info de contacto
│       │   │   └── modal/                 # ModalService (info/success/error/confirm) + ModalComponent
│       │   └── pages/
│       │       ├── home/                  # Hero dark + productos destacados + features
│       │       ├── catalogo/              # Grid con filtros (pills, marca, busqueda, orden)
│       │       ├── producto-detalle/      # Detalle con selector talla/cantidad + agregar al carrito
│       │       ├── carrito/               # Lista de items, actualizar cantidad, checkout
│       │       ├── checkout/              # Formulario de orden (direccion, telefono, notas)
│       │       ├── login/                 # Split-screen login (sin header/footer)
│       │       ├── registro/              # Formulario de registro completo
│       │       ├── nosotros/              # Pagina estatica
│       │       ├── contacto/              # Info de contacto
│       │       ├── politicas/             # Pagina estatica
│       │       ├── not-found/             # Pagina 404
│       │       └── admin/
│       │           ├── admin.routes.ts    # Rutas admin con adminGuard
│       │           ├── admin-productos/   # CRUD productos con modal, upload imagen
│       │           ├── admin-categorias/  # CRUD categorias
│       │           ├── admin-marcas/      # CRUD marcas
│       │           ├── admin-colores/     # CRUD colores con color picker
│       │           ├── admin-tallas/      # CRUD tallas
│       │           ├── admin-ordenes/     # Ver ordenes, cambiar estado
│       │           └── admin-catalogo/    # Vista alternativa de catalogo admin
│
└── documentation/
    └── PROYECTO.md                        # Este archivo
```

---

## 3. Base de Datos (Supabase PostgreSQL)

### Tablas

| Tabla | Campos clave | Notas |
|-------|-------------|-------|
| **perfiles** | id (UUID PK), nombre, apellido, username, telefono, tipo_usuario | tipo_usuario: 'cliente' o 'admin' |
| **productos** | id, nombre, precio, descuento, imagen_url, descripcion, destacado, mostrar_precio, categoria_id (FK), marca_id (FK) | precio_final = floor(precio * (1 - descuento/100)) |
| **categorias** | id, nombre, slug, created_at | |
| **marcas** | id, nombre, slug, descripcion, imagen_url, activo, actualizado_en | Soft delete con activo=false |
| **colores** | id, nombre, codigo_hex | Formato #RRGGBB |
| **tallas** | id, valor, tipo | tipo default: 'numerica' |
| **producto_colores** | producto_id (FK), color_id (FK) | Junction table M:N |
| **producto_tallas** | producto_id (FK), talla_id (FK), cantidad | Junction table M:N con stock |
| **ordenes** | id, usuario_id (FK), total, estado, direccion_envio, telefono_contacto, notas, created_at, updated_at | Estados: pendiente, confirmada, enviada, entregada, cancelada |
| **orden_items** | id, orden_id (FK), producto_id (FK), talla_id (FK), cantidad, precio_unitario, subtotal | |

### Storage
- Bucket: `imagenes`
- Path: `productos/{timestamp}-{random}.{ext}`
- Acceso publico para lectura

---

## 4. API Endpoints

### Autenticacion (`/api/auth`)
```
POST /api/auth/login          # Body: { username, password } → { user, session }
POST /api/auth/logout         # Auth required
GET  /api/auth/me             # Auth required → perfil del usuario
```

### Registro (`/api/perfiles`)
```
POST /api/perfiles            # Body: { email, password, nombre, apellido, username, telefono }
                              # Rate limit: 5/hora. Siempre crea tipo_usuario='cliente'
```

### Productos (`/api/productos`)
```
GET  /api/productos           # Query: page, limit, orderBy, categoria_id, marca_id, destacado, q, precio_min, precio_max, color_id, talla_id
GET  /api/productos/:id       # Incluye colores y tallas
POST /api/productos           # Admin + multipart/form-data (campo 'imagen')
PUT  /api/productos/:id       # Admin + multipart/form-data opcional
DELETE /api/productos/:id     # Admin
```

### Categorias (`/api/categorias`)
```
GET    /api/categorias        # Publico
GET    /api/categorias/:id    # Publico
POST   /api/categorias        # Admin
PUT    /api/categorias/:id    # Admin
DELETE /api/categorias/:id    # Admin
```

### Marcas (`/api/marcas`)
```
GET    /api/marcas            # Solo activas
GET    /api/marcas/:id
POST   /api/marcas            # Admin
PUT    /api/marcas/:id        # Admin
DELETE /api/marcas/:id        # Admin (soft delete: activo=false)
```

### Colores (`/api/colores`)
```
GET    /api/colores
GET    /api/colores/:id
POST   /api/colores           # Admin. Body: { nombre, codigo_hex }
PUT    /api/colores/:id       # Admin
DELETE /api/colores/:id       # Admin
```

### Tallas (`/api/tallas`)
```
GET    /api/tallas
GET    /api/tallas/:id
POST   /api/tallas            # Admin. Body: { valor, tipo }
PUT    /api/tallas/:id        # Admin
DELETE /api/tallas/:id        # Admin
```

### Modificaciones (`/api/modificaciones`)
```
POST   /api/modificaciones/:producto_id/colores          # Admin. Body: { colores: [{ color_id }] }
DELETE /api/modificaciones/:producto_id/colores/:color_id # Admin
POST   /api/modificaciones/:producto_id/tallas           # Admin. Body: { tallas: [{ talla_id, cantidad }] }
DELETE /api/modificaciones/:producto_id/tallas/:talla_id  # Admin
```

### Carrito (`/api/carrito`)
```
POST /api/carrito/validar     # Body: { items: [{ producto_id, talla_id, cantidad }] }
                              # Retorna: { valid, items: [...], total }
```

### Ordenes (`/api/ordenes`)
```
POST /api/ordenes             # Auth. Body: { items, direccion_envio, telefono_contacto, notas }
                              # Crea orden + decrementa stock
GET  /api/ordenes             # Auth. Usuarios ven las suyas, admin ve todas
GET  /api/ordenes/:id         # Auth. Con items y detalles de producto
PUT  /api/ordenes/:id/estado  # Admin. Body: { estado }
```

---

## 5. Rutas del Frontend

### Publicas
| Ruta | Componente | Carga |
|------|-----------|-------|
| `/` | Home | Eager |
| `/catalogo` | Catalogo | Lazy |
| `/producto/:id` | ProductoDetalle | Lazy |
| `/carrito` | Carrito | Lazy |
| `/checkout` | Checkout | Lazy |
| `/login` | Login | Eager |
| `/registro` | Registro | Lazy |
| `/nosotros` | Nosotros | Lazy |
| `/contacto` | Contacto | Lazy |
| `/politicas` | Politicas | Lazy |
| `/404` | NotFound | Lazy |
| `**` | Redirect a /404 | |

### Admin (requieren `adminGuard`)
| Ruta | Componente |
|------|-----------|
| `/admin` | Redirect a /admin/productos |
| `/admin/productos` | AdminProductos |
| `/admin/categorias` | AdminCategorias |
| `/admin/marcas` | AdminMarcas |
| `/admin/colores` | AdminColores |
| `/admin/tallas` | AdminTallas |
| `/admin/ordenes` | AdminOrdenes |

---

## 6. Interfaces TypeScript Clave

```typescript
// producto.ts
interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descuento: number;           // 0-100
  precio_final: number;        // Calculado en backend
  imagen_url: string;
  descripcion: string;
  destacado: boolean;
  categoria: string;
  categoria_id?: string;
  categoria_slug?: string;
  mostrar_precio?: boolean;
  colores: Color[];
  tallas: TallaStock[];
  marca?: Marca;
  tallasDisponibles?: TallaStock[];  // cantidad > 0
  tallasPreview?: TallaStock[];      // Primeras 3
  tallasExtraCount?: number;         // Cuantas mas hay
}

// producto-query.ts
interface ProductosQuery {
  page?: number; limit?: number; categoria_id?: string;
  destacado?: boolean; q?: string; search?: string;
  marca_id?: string; color_id?: string; talla_id?: string;
  genero?: string; precio_min?: number; precio_max?: number;
  orderBy?: string;
}

// producto-response.ts
interface ProductosResponse {
  productos: Producto[]; total: number;
  page: number; limit: number; totalPages: number;
}

// talla.ts
interface TallaStock { id?: string; talla: string; cantidad: number; }

// color.ts
interface Color { nombre: string; codigo_hex: string; }

// marca.ts
interface Marca { id: string; nombre: string; slug: string; imagen_url?: string; }

// categoria.ts
interface Categoria { id: string; nombre: string; }
```

---

## 7. Servicios Principales

### AuthService (`core/services/auth.service.ts`)
- `login(username, password)` → POST `/api/auth/login`, guarda token y user en localStorage
- `logout()` → Limpia storage, redirige a `/login`
- `isAuthenticated()` → boolean (verifica token en storage)
- `isAdmin()` → boolean (verifica tipo_usuario === 'admin')
- `getCurrentUser()` → User | null
- `getAccessToken()` → string | null
- Signal: `currentUser`

### CartService (`core/services/cart.service.ts`)
- `addItem(item)` → Agrega o incrementa cantidad
- `updateQuantity(productoId, tallaId, cantidad)`
- `removeItem(productoId, tallaId)`
- `clearCart()`
- `validateCart()` → POST `/api/carrito/validar`
- Signals: `items`, computed `totalItems`, computed `totalPrice`
- Persiste en localStorage como 'cart'

### ProductoService (`core/services/producto/producto-service.ts`)
- `getProductos(query)` → GET `/api/productos` con query params
- `getProductoById(id)` → GET `/api/productos/:id`
- `crearProducto(formData)` → POST `/api/productos`
- `actualizarProducto(id, formData)` → PUT `/api/productos/:id`
- `eliminarProducto(id)` → DELETE `/api/productos/:id`
- `asignarTallas(productoId, tallas)` → POST `/api/modificaciones/:id/tallas`
- `asignarColores(productoId, colores)` → POST `/api/modificaciones/:id/colores`
- `eliminarTalla(productoId, tallaId)` → DELETE `/api/modificaciones/:id/tallas/:tid`
- `eliminarColor(productoId, colorId)` → DELETE `/api/modificaciones/:id/colores/:cid`

### ModalService (`shared/modal/modal.service.ts`)
- `info(message, title?)` → Promise\<boolean\>
- `success(message, title?)` → Promise\<boolean\>
- `error(message, title?)` → Promise\<boolean\>
- `confirm(message, title?)` → Promise\<boolean\>
- `close(result)` → Resuelve el Promise
- Signal: `state` (ModalState)
- Reemplaza todos los `alert()` y `confirm()` nativos

---

## 8. Patrones y Convenciones

### Angular
- **Standalone Components**: Todos los componentes son standalone, sin NgModules
- **Signals**: Estado reactivo con `signal()`, `computed()`, `effect()`
- **Zoneless**: `provideZonelessChangeDetection()` en app.config
- **inject()**: Preferido sobre constructor injection
- **Lazy loading**: Componentes cargados con `loadComponent` en rutas
- **SSR**: `isPlatformBrowser()` para guardar en localStorage

### Tailwind CSS
- **Paleta primaria**: `#2596be` definida en `tailwind.config.js` como `primary` (50-950)
- **Componentes reutilizables**: `.btn-primary`, `.btn-primary-admin`, `.input-focus` en `styles.css`
- **Variables CSS**: `--color-primary`, `--primary-color` en `:root`
- **Responsive**: Mobile-first, breakpoints `sm:`, touch targets 44px minimo
- **PrimeNG**: Tema lara-light-blue, overrides via CSS vars

### Colores semanticos (NO cambiar)
- `bg-red-500` → Badges de descuento, errores
- `text-red-600` → Precios tachados, errores de validacion, acciones destructivas
- `bg-green-*` → Estados de exito
- `bg-yellow-*` → Badges de destacado
- `bg-black` / `bg-gray-950` → Footer, hero section
- `bg-purple-600` → Boton Instagram
- `bg-green-600` → Boton WhatsApp

### Backend
- **Auth**: Bearer token JWT via Supabase
- **Roles**: `authMiddleware` + `adminMiddleware` para rutas protegidas
- **Imagenes**: Multer (memory) → Supabase Storage bucket `imagenes`
- **Soft delete**: Marcas usan `activo=false`
- **Stock**: Se decrementa al crear orden, no al validar carrito
- **Precio final**: `Math.floor(precio * (1 - descuento/100))`

---

## 9. Flujos de Negocio

### Flujo de Compra
1. Usuario navega catalogo, filtra productos
2. Selecciona producto → detalle con tallas/colores
3. Elige talla + cantidad → agrega al carrito (localStorage)
4. Va al carrito → revisa items, ajusta cantidades
5. Checkout → debe estar autenticado (redirect a login si no)
6. Llena formulario (direccion, telefono, notas)
7. Backend valida stock, calcula totales, crea orden
8. Stock se decrementa en `producto_tallas`
9. Orden inicia en estado `pendiente`

### Flujo de Admin
1. Admin inicia sesion (redirige a `/admin/productos`)
2. CRUD de productos con upload de imagen
3. Gestiona categorias, marcas, colores, tallas
4. Ve ordenes y cambia estados: pendiente → confirmada → enviada → entregada (o cancelada)
5. Asigna colores/tallas a productos con stock

### Autenticacion
- Login por **username** (no email) → backend busca perfil, obtiene email, autentica con Supabase
- Token JWT guardado en localStorage como `session.access_token`
- Interceptor agrega `Authorization: Bearer {token}` a todas las peticiones HTTP
- 401 → logout automatico

---

## 10. Como Ejecutar

### Backend
```bash
cd C:\Proyectos\lilosneakers\backend
npm install
npm run dev        # Inicia con nodemon en puerto 3001
```

### Frontend
```bash
cd C:\Proyectos\lilosneakers\frontend
npm install
ng serve           # Inicia en puerto 4200 con proxy a 3001
```

### Variables de Entorno Backend (.env)
```
SUPABASE_URL=https://rspwzmotnomlxqhmyhop.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=3001
NODE_ENV=development
FRONTEND_URL=https://tu-frontend.netlify.app
```

---

## 11. Notas Importantes para Desarrollo

1. **Servicios duplicados**: Existen dos versiones de algunos servicios (ej: `producto.service.ts` y `producto/producto-service.ts`). Los de subcarpeta son mas completos.
2. **Admin seed**: El primer admin se crea manualmente en Supabase (tabla `perfiles`, campo `tipo_usuario='admin'`).
3. **CORS**: Actualizar origenes permitidos en `backend/src/app.js` para nuevos dominios.
4. **Rate limiting**: Usa almacenamiento en memoria - se resetea al reiniciar. Considerar Redis para produccion.
5. **Bucket Supabase**: El bucket `imagenes` debe existir con acceso publico para lectura.
6. **Tailwind safelist**: Clases dinamicas usadas en `admin-ordenes.ts` estan en el safelist de `tailwind.config.js`.
7. **SSR**: Accesos a `localStorage`, `window`, `document` deben estar protegidos con `isPlatformBrowser()`.
8. **Proxy**: En desarrollo, `/api` se redirige a `localhost:3001` via `proxy.conf.json`.
9. **Imagenes de producto**: Se suben como `multipart/form-data` con campo `imagen`. Max 5MB, solo imagenes.
10. **Modal system**: Usar `ModalService` en lugar de `alert()`/`confirm()`. Metodos async que retornan `Promise<boolean>`.
