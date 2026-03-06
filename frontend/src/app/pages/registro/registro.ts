<<<<<<< HEAD
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
=======
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
>>>>>>> origin/main
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-registro',
  standalone: true,
<<<<<<< HEAD
  imports: [HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {}
=======
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  registerForm: FormGroup;
  hidePassword = true;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: [''],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  showError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && (control.dirty || control.touched) && !!control.errors;
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control?.errors) return '';
    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['pattern']) return 'Solo letras, números y guión bajo';
    return 'Valor inválido';
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = null;

    const { confirmPassword: _, ...userData } = this.registerForm.value;

    this.http.post('/api/perfiles', userData).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Cuenta creada exitosamente. Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al crear la cuenta';
      }
    });
  }
}
>>>>>>> origin/main
