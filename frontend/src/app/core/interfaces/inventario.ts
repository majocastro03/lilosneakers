export interface InventarioTalla {
  talla_id: string;
  talla: string;
  valor_us?: string;
  valor_eur?: string;
  valor_cm?: string;
  genero?: string;
  cantidad: number;
}

export interface InventarioProducto {
  id: string;
  nombre: string;
  imagen_url: string;
  activo: boolean;
  categoria: string;
  marca: string | null;
  precio: number;
  precio_final: number;
  precio_costo: number | null;
  ganancia_unit: number | null;
  margen: number | null;
  stock_total: number;
  entrega_inmediata: boolean;
  valor_inventario_costo: number | null;
  tallas: InventarioTalla[];
  colores: { nombre: string; codigo_hex: string }[];
}

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
  precio_venta: number | null;
  precio_costo: number | null;
  ganancia: number | null;
  referencia: string | null;
  origen: string;
  creado_en: string;
  producto: { id: string; nombre: string; imagen_url: string } | null;
  talla: { valor: string; genero?: string } | null;
}

export interface CrearMovimiento {
  producto_id: string;
  talla_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string;
  precio_venta?: number | null;
  referencia?: string;
}

export interface ReporteDia {
  fecha: string;
  entradas: number;
  salidas: number;
  unidades_vendidas: number;
  ingresos: number;
  ganancia: number;
}
