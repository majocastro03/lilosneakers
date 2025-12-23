import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'login', component: Login },
  { 
    path: 'admin', 
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes) 
  },
  { path: '**', redirectTo: '' }
];
