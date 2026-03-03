# 🛍️ Lilo Sneakers - E-commerce Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Angular](https://img.shields.io/badge/Angular-20.3-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Status](https://img.shields.io/badge/status-active-success)

E-commerce platform completo para venta de zapatillas con panel de administración.

---

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+ y npm
- Backend corriendo en puerto 3001

### Instalación y Ejecución

```bash
# 1. Limpiar archivos duplicados (solo primera vez)
cd C:\Proyectos\lilosneakers\frontend
.\limpiar-proyecto.ps1

# 2. Instalar dependencias (si no están instaladas)
npm install

# 3. Iniciar servidor de desarrollo
npm start
```

La aplicación se abrirá en `http://localhost:4200`

---

## 📁 Estructura del Proyecto

```
src/app/
├── core/
│   ├── guards/           # Guards de autenticación
│   └── services/         # Servicios HTTP
├── pages/
│   ├── admin/           # Panel administrador
│   ├── catalogo/        # Catálogo público
│   ├── home/            # Página principal
│   └── login/           # Login
└── shared/              # Componentes compartidos
```

---

## ✨ Características

### Para Usuarios
- ✅ Catálogo de productos responsive
- ✅ Búsqueda en tiempo real
- ✅ Filtros por categoría y destacados
- ✅ Paginación
- ✅ Visualización de colores y tallas disponibles

### Para Administradores
- ✅ Login seguro con roles
- ✅ CRUD completo de productos
- ✅ Upload de imágenes
- ✅ Gestión de categorías
- ✅ Destacar productos

---

## 🔧 Tecnologías

- **Framework**: Angular 20.3 (Standalone Components)
- **Styling**: Tailwind CSS 3.4
- **State Management**: Angular Signals
- **HTTP**: Angular HttpClient con RxJS
- **Routing**: Angular Router con Lazy Loading
- **Forms**: Reactive Forms y Template-driven Forms
- **SSR**: Angular Universal

---

## 📚 Documentación

- [INICIO-RAPIDO.md](./INICIO-RAPIDO.md) - Guía de 3 pasos para iniciar
- [CORRECCIONES-COMPLETAS.md](./CORRECCIONES-COMPLETAS.md) - Documentación técnica completa
- [CHECKLIST-COMPLETO.md](./CHECKLIST-COMPLETO.md) - Checklist de verificación
- [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) - Resumen de implementación

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm start              # Inicia servidor de desarrollo

# Build
npm run build          # Build para producción

# Testing
npm test               # Ejecuta tests unitarios

# Limpieza
.\limpiar-proyecto.ps1 # Elimina archivos duplicados
```

---

## 🔐 Autenticación

### Credenciales de Prueba

**Admin:**
- Username: `admin`
- Password: (configurado en BD)

**Protección:**
- ✅ Guards en rutas protegidas
- ✅ Verificación de rol
- ✅ Sesión persistente
- ✅ Protección SSR con `isPlatformBrowser`

---

## 🌐 Rutas

| Ruta | Descripción | Protegida |
|------|-------------|-----------|
| `/` | Home | No |
| `/catalogo` | Catálogo de productos | No |
| `/login` | Inicio de sesión | No |
| `/admin/productos` | Administrar productos | Sí (Admin) |

---

## 🎨 Componentes Principales

### Catálogo
- Grid responsive de productos
- Búsqueda con debounce (500ms)
- Filtros dinámicos
- Paginación con navegación intuitiva
- Loading states y error handling

### Admin Panel
- Tabla de productos
- Modal para CRUD
- Upload de imágenes con preview
- Validaciones de formulario
- Mensajes de éxito/error

---

## 🔌 API Integration

### Servicios

**AuthService**
- `login(username, password)` - Autenticación
- `logout()` - Cerrar sesión
- `isAuthenticated()` - Verificar autenticación
- `isAdmin()` - Verificar rol admin

**ProductoService**
- `getProductos(filtros)` - Listar productos
- `crearProducto(formData)` - Crear producto
- `actualizarProducto(id, formData)` - Actualizar
- `eliminarProducto(id)` - Eliminar

**CategoriaService**
- `getCategorias()` - Listar categorías

### Proxy Configuration

```json
{
  "/api": {
    "target": "http://localhost:3001",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: Port 4200 already in use
```bash
npx kill-port 4200
npm start
```

### Error: Proxy no funciona
1. Verificar que backend esté en puerto 3001
2. Reiniciar el frontend
3. Ver logs de proxy en consola

### Error: localStorage SSR
Ya está solucionado con `isPlatformBrowser` en todos los servicios.

---

## 📱 Responsive Design

- **Desktop**: 4 columnas en grid
- **Tablet**: 2-3 columnas
- **Mobile**: 1 columna con menú hamburguesa

---

## 🔄 Estado del Proyecto

- ✅ Estructura limpia y organizada
- ✅ Sin archivos duplicados
- ✅ Código TypeScript estricto
- ✅ Componentes standalone
- ✅ Guards implementados
- ✅ SSR protection
- ✅ Documentación completa

---

## 📝 Próximos Pasos

- [ ] Implementar detalle de producto
- [ ] Agregar carrito de compras
- [ ] Sistema de favoritos
- [ ] Más filtros (precio, marca, talla)
- [ ] Sistema de pagos
- [ ] Dashboard de ventas

---

## 👥 Contribución

Este proyecto es parte de un sistema de e-commerce completo. Para contribuir:

1. Revisar la documentación en `/docs`
2. Seguir las convenciones de código de Angular
3. Probar todas las funcionalidades antes de commit
4. Mantener la documentación actualizada

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

## 📞 Contacto

**Desarrollador**: María José
**Proyecto**: Lilo Sneakers
**Fecha**: Diciembre 2025

---

## 🎉 Estado

```
✅ PROYECTO COMPLETAMENTE FUNCIONAL
✅ CÓDIGO LIMPIO Y DOCUMENTADO
✅ LISTO PARA DESARROLLO CONTINUO
```

---

*Última actualización: 22 de diciembre de 2025*
