import { Routes } from '@angular/router';
import { AdminCatalogo } from './admin-catalogo/admin-catalogo';
import { AuthGuard } from '../../core/guards/auth.guards';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'catalogo', component: AdminCatalogo },
      { path: '', redirectTo: 'catalogo', pathMatch: 'full' }
    ]
  }
];
