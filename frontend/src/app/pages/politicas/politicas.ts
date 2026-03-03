import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-politicas',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './politicas.html',
  styleUrl: './politicas.css'
})
export class PoliticasComponent {}
