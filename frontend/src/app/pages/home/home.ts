import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer';
import { HeaderComponent } from '../../shared/header/header';

@Component({
  selector: 'app-home',
  imports: [FooterComponent, HeaderComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
