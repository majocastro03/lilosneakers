import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Catalogo} from './pages/catalogo/catalogo';

export const routes: Routes = [
      { path: '', component: Home },
  { path: 'catalogo', component: Catalogo },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
