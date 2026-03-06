import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
<<<<<<< HEAD
import { SITE_CONFIG } from '../../core/config/site.config';
=======
>>>>>>> origin/main

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class ContactoComponent {
<<<<<<< HEAD
  config = SITE_CONFIG;
=======
  contactNumber = '320-939-0843';
  email = 'lilosneakers@gmail.com';
  instagram = 'https://www.instagram.com/lilosneakers__/';
>>>>>>> origin/main
}
