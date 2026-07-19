import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class ContactoComponent {
  config = SITE_CONFIG;
}
