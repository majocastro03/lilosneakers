import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Catalogo } from './pages/catalogo/catalogo';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'catalogo', component: Catalogo },
  { path: 'login', component: Login },
  { path: 'admin', loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes) },
  { path: '**', redirectTo: '' }
];