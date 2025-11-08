import { Color } from "./color";
import { Marca } from "./marca";
import { TallaStock } from "./talla";

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descuento: number;
  precio_final: number;
  imagen_url: string;
  descripcion: string;
  destacado: boolean;
  categoria: string;
  categoria_slug?: string;
  mostrar_precio: boolean;
  colores: Color[];
  tallas: TallaStock[];
  marca: Marca;
  tallasDisponibles?: TallaStock[];     // t.cantidad > 0
  tallasPreview?: TallaStock[];         // primeras 3
  tallasExtraCount?: number;            // cuántas más hay
}