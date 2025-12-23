import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from "../../shared/header/header";
import { FooterComponent } from "../../shared/footer/footer";
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  loginError: string | null = null;
  loginSuccess: string | null = null;
  currentYear = new Date().getFullYear();

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/productos']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  showError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && (control.dirty || control.touched) && !!control.errors;
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) {
      const required = errors['minlength'].requiredLength;
      return `Mínimo ${required} caracteres`;
    }
    return 'Valor inválido';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.loginError = null;
    this.loginSuccess = null;

    const { username, password } = this.loginForm.value;
    
    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.loginSuccess = '¡Inicio de sesión exitoso!';

        // Redirigir según el tipo de usuario
        setTimeout(() => {
          if (response.user.tipo_usuario === 'admin') {
            this.router.navigate(['/admin/productos']);
          } else {
            this.router.navigate(['/']);
          }
        }, 800);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error de login:', err);
        this.loginError = err.error?.error || 'Usuario o contraseña incorrectos';
        this.loginSuccess = null;
      }
    });
  }

  onForgotPassword(): void {
    alert('Funcionalidad de recuperación de contraseña estará disponible próximamente.');
  }

  onRegister(): void {
    alert('El registro de nuevos usuarios está deshabilitado temporalmente.');
  }
}
