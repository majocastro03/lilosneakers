import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  constructor(private router: Router) {}

  onLogin() {
    // Por ahora solo redirige a una página de login (la creamos después)
    this.router.navigate(['/login']);
  }
}
