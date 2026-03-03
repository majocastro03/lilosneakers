import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css'
})
export class NosotrosComponent {}
