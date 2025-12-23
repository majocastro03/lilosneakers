import { Routes } from '@angular/router';
import { AdminProductosComponent } from './admin-productos/admin-productos.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  { 
    path: '', 
    redirectTo: 'productos', 
    pathMatch: 'full' 
  },
  { 
    path: 'productos', 
    component: AdminProductosComponent,
    canActivate: [adminGuard]
  }
];
