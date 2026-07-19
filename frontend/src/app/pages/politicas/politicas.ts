import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-politicas',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './politicas.html',
  styleUrl: './politicas.css'
})
export class PoliticasComponent {
  config = SITE_CONFIG;
}
