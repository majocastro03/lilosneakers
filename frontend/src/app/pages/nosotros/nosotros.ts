import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css'
})
export class NosotrosComponent {
  config = SITE_CONFIG;
}
