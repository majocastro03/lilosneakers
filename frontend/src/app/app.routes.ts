import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.Catalogo)
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./pages/producto-detalle/producto-detalle').then(m => m.ProductoDetalleComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito').then(m => m.CarritoComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutComponent)
  },
  { path: 'login', component: Login },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then(m => m.RegistroComponent)
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./pages/nosotros/nosotros').then(m => m.NosotrosComponent)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto').then(m => m.ContactoComponent)
  },
  {
    path: 'politicas',
    loadComponent: () => import('./pages/politicas/politicas').then(m => m.PoliticasComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
  },
  { path: '**', redirectTo: '404' }
];
