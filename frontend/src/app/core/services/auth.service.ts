import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  nombre: string;
  apellido?: string;
  username: string;
  tipo_usuario: 'cliente' | 'admin';
  email?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  currentUser = signal<User | null>(null);

  private apiUrl = `${environment.apiUrl}/auth`;
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage() {
    if (!this.isBrowser) return;

    try {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
      }
    } catch (error) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('session');
    }
  }

  private saveToStorage(key: string, value: any) {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Storage not available
    }
  }

  private removeFromStorage(key: string) {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Storage not available
    }
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    try {
      const sessionJson = localStorage.getItem('session');
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        return session?.access_token || null;
      }
    } catch {
      // Invalid session data
    }
    return null;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.currentUser.set(response.user);
        this.saveToStorage('currentUser', response.user);
        this.saveToStorage('session', response.session);
      }),
      catchError(error => {
        const msg = error.error?.error || 'Error al iniciar sesión';
        return throwError(() => msg);
      })
    );
  }

  logout() {
    const token = this.getAccessToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({ error: () => {} });
    }
    this.currentUser.set(null);
    this.removeFromStorage('currentUser');
    this.removeFromStorage('session');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.tipo_usuario === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }
}
