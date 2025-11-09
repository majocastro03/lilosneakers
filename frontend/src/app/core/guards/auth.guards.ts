import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/autenticacion/auth-service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    const isAuth = this.authService.isAuthenticated();

    if (!isAuth) {
      console.warn('🔒 Acceso denegado: usuario no autenticado');
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
