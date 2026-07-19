import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Producto } from '../../core/interfaces/producto';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './product-card.html',
})
export class ProductCardComponent {
  producto = input.required<Producto>();
}
