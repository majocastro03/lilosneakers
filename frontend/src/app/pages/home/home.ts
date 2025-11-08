import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
