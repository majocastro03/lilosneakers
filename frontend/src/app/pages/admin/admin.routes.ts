import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout';
import { AdminProductosComponent } from './admin-productos/admin-productos.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
<<<<<<< HEAD
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'productos',
        pathMatch: 'full'
      },
      {
        path: 'productos',
        component: AdminProductosComponent,
      },
      {
        path: 'categorias',
        loadComponent: () => import('./admin-categorias/admin-categorias').then(m => m.AdminCategoriasComponent),
      },
      {
        path: 'marcas',
        loadComponent: () => import('./admin-marcas/admin-marcas').then(m => m.AdminMarcasComponent),
      },
      {
        path: 'colores',
        loadComponent: () => import('./admin-colores/admin-colores').then(m => m.AdminColoresComponent),
      },
      {
        path: 'tallas',
        loadComponent: () => import('./admin-tallas/admin-tallas').then(m => m.AdminTallasComponent),
      },
      {
        path: 'ordenes',
        loadComponent: () => import('./admin-ordenes/admin-ordenes').then(m => m.AdminOrdenesComponent),
      }
    ]
=======
    redirectTo: 'productos',
    pathMatch: 'full'
  },
  {
    path: 'productos',
    component: AdminProductosComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'categorias',
    loadComponent: () => import('./admin-categorias/admin-categorias').then(m => m.AdminCategoriasComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'marcas',
    loadComponent: () => import('./admin-marcas/admin-marcas').then(m => m.AdminMarcasComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'colores',
    loadComponent: () => import('./admin-colores/admin-colores').then(m => m.AdminColoresComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'tallas',
    loadComponent: () => import('./admin-tallas/admin-tallas').then(m => m.AdminTallasComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'ordenes',
    loadComponent: () => import('./admin-ordenes/admin-ordenes').then(m => m.AdminOrdenesComponent),
    canActivate: [adminGuard]
>>>>>>> origin/main
  }
];
