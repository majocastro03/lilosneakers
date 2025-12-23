import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  nombre: string;
  apellido?: string;
  username: string;
  tipo_usuario: 'cliente' | 'admin';
  email?: string;
}

export interface LoginResponse {
  user: User;
  session: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  // Signal para reactive state
  currentUser = signal<User | null>(null);
  
  private apiUrl = '/api/auth';
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Solo cargar del storage si estamos en el navegador
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
      console.error('Error al cargar usuario:', error);
      localStorage.removeItem('currentUser');
    }
  }

  private saveToStorage(key: string, value: any) {
    if (!this.isBrowser) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error al guardar en storage:', error);
    }
  }

  private removeFromStorage(key: string) {
    if (!this.isBrowser) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error al eliminar de storage:', error);
    }
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
      })
    );
  }

  logout() {
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
