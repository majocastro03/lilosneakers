import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../interfaces/user';
import { LoginResponse } from '../../interfaces/login-reponse';
import { environment } from '../../../../../../frontend/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(identifier: string, password: string): Observable<User> {
    const credentials = { identifier, password };

return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
  tap(response => console.log(' Respuesta completa del backend:', response)),
  map(response => {
    if (!response || !response.user) {
      throw new Error('Respuesta inesperada del backend');
    }
    return response.user;
  }),
  tap(user => {
    console.log('Usuario recibido:', user);
    this.currentUserSubject.next(user);
    this.setSession(user);
  }),
  catchError(this.handleError)
);

  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.clearSession(); // Usa método seguro
      }),
      catchError(this.handleError)
    );
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getProfile(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      map(response => response.user),
      tap(user => this.currentUserSubject.next(user)),
      catchError(err => {
        this.currentUserSubject.next(null);
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  // Método seguro para guardar sesión (solo en navegador)
  private setSession(user: User): void {
    if (this.isBrowser) {
      try {
        sessionStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.warn('No se pudo guardar en sessionStorage:', e);
      }
    }
  }

  // Método seguro para limpiar sesión
  private clearSession(): void {
    if (this.isBrowser) {
      try {
        sessionStorage.removeItem('user');
      } catch (e) {
        console.warn('No se pudo limpiar sessionStorage:', e);
      }
    }
  }

  // Método seguro para verificar sesión al iniciar
  private checkAuthStatus(): void {
    if (this.isBrowser) {
      try {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
        }
      } catch (e) {
        console.warn('Error al leer sessionStorage:', e);
        this.clearSession();
      }
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMsg = 'Error desconocido';
    
    if (error.status === 401) {
      errorMsg = 'Credenciales incorrectas';
    } else if (error.status === 403) {
      errorMsg = error.error?.error || 'Acceso denegado';
    } else if (error.error?.error) {
      errorMsg = error.error.error;
    }

    console.error('Auth error:', errorMsg, error);
    return throwError(() => errorMsg);
  }
}