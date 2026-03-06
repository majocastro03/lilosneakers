import { Component } from '@angular/core';
<<<<<<< HEAD
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';
=======
import { RouterLink } from '@angular/router';
>>>>>>> origin/main

@Component({
  selector: 'app-footer',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterLink, UpperCasePipe],
=======
  imports: [RouterLink],
>>>>>>> origin/main
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
<<<<<<< HEAD
  config = SITE_CONFIG;
=======
  contactNumber = '320-939-0843';
  email = 'lilosneakers@gmail.com';
>>>>>>> origin/main
}
