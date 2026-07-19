import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from './shared/modal/modal';
import { CartToastComponent } from './shared/cart-toast/cart-toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModalComponent, CartToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }