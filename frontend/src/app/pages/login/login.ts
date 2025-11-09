import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { HeaderComponent } from "../../shared/header/header";
import { FooterComponent } from "../../shared/footer/footer";
import { AuthService } from '../../core/services/autenticacion/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  loginError: string | null = null;
  loginSuccess: string | null = null; // ✅ Para mensaje de éxito
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void { }

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
      // Marcar todos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.loginError = null;
    this.loginSuccess = null;

    const { username: identifier, password } = this.loginForm.value;
    console.log('📤 Enviando credenciales:', { identifier, password });
    this.authService.login(identifier, password).subscribe({
      next: (user) => {
        this.loading = false;
        this.loginSuccess = '¡Inicio de sesión exitoso!'; //

        // Redirigir después de breve delay (para mostrar mensaje)
        setTimeout(() => {
          if (user.tipo_usuario === 'admin') {
            this.router.navigate(['/admin/catalogo']);
          } else {
            this.router.navigate(['/']);
          }
        }, 800);
      },
      error: (err) => {
        this.loading = false;
        this.loginError = err;
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
