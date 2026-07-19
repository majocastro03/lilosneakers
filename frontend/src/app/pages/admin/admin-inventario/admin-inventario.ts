import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../core/services/inventario/inventario-service';
import { ModalService } from '../../../shared/modal/modal.service';
import {
  InventarioProducto,
  InventarioTalla,
  Movimiento,
  ReporteDia,
  TipoMovimiento
} from '../../../core/interfaces/inventario';

type Tab = 'inventario' | 'movimientos' | 'reporte';

@Component({
  selector: 'app-admin-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-inventario.html',
  styleUrl: './admin-inventario.css'
})
export class AdminInventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private modalService = inject(ModalService);

  tab = signal<Tab>('inventario');

  // Inventario
  inventario = signal<InventarioProducto[]>([]);
  loading = signal(false);
  soloDisponibles = signal(false);
  busqueda = signal('');
  expandido = signal<Set<string>>(new Set());

  // Movimientos
  movimientos = signal<Movimiento[]>([]);
  loadingMov = signal(false);

  // Reporte
  reporte = signal<ReporteDia[]>([]);
  loadingRep = signal(false);

  // Modal registrar movimiento
  modalOpen = signal(false);
  guardando = signal(false);
  movProducto = signal<InventarioProducto | null>(null);
  movForm = {
    talla_id: '',
    tipo: 'entrada' as TipoMovimiento,
    cantidad: 1,
    motivo: '',
    precio_venta: null as number | null
  };

  productosFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.inventario();
    return this.inventario().filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.marca || '').toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    );
  });

  // Resumen
  totalProductosStock = computed(() => this.inventario().filter(p => p.stock_total > 0).length);
  totalUnidades = computed(() => this.inventario().reduce((s, p) => s + p.stock_total, 0));
  valorInventario = computed(() =>
    this.inventario().reduce((s, p) => s + (p.valor_inventario_costo || 0), 0)
  );

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    this.inventarioService.getInventario(this.soloDisponibles()).subscribe({
      next: (data) => {
        this.inventario.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.modalService.error(err.error?.error || 'Error al cargar el inventario');
      }
    });
  }

  toggleDisponibles() {
    this.soloDisponibles.update(v => !v);
    this.cargar();
  }

  toggleExpandir(id: string) {
    const set = new Set(this.expandido());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.expandido.set(set);
  }

  cambiarTab(t: Tab) {
    this.tab.set(t);
    if (t === 'movimientos' && this.movimientos().length === 0) this.cargarMovimientos();
    if (t === 'reporte' && this.reporte().length === 0) this.cargarReporte();
  }

  cargarMovimientos() {
    this.loadingMov.set(true);
    this.inventarioService.getMovimientos({ limit: 200 }).subscribe({
      next: (data) => { this.movimientos.set(data); this.loadingMov.set(false); },
      error: (err) => { this.loadingMov.set(false); this.modalService.error(err.error?.error || 'Error al cargar movimientos'); }
    });
  }

  cargarReporte() {
    this.loadingRep.set(true);
    this.inventarioService.getReporte().subscribe({
      next: (data) => { this.reporte.set(data); this.loadingRep.set(false); },
      error: (err) => { this.loadingRep.set(false); this.modalService.error(err.error?.error || 'Error al cargar el reporte'); }
    });
  }

  // === Modal movimiento ===
  abrirMovimiento(producto: InventarioProducto, tallaId?: string, tipo: TipoMovimiento = 'entrada') {
    this.movProducto.set(producto);
    this.movForm = {
      talla_id: tallaId || producto.tallas[0]?.talla_id || '',
      tipo,
      cantidad: 1,
      motivo: '',
      precio_venta: null
    };
    this.modalOpen.set(true);
  }

  cerrarModal() {
    this.modalOpen.set(false);
    this.movProducto.set(null);
  }

  tallaSeleccionada(): InventarioTalla | undefined {
    return this.movProducto()?.tallas.find(t => t.talla_id === this.movForm.talla_id);
  }

  guardarMovimiento() {
    const prod = this.movProducto();
    if (!prod) return;
    if (!this.movForm.talla_id) { this.modalService.error('Selecciona una talla'); return; }

    const cant = Number(this.movForm.cantidad);
    if (this.movForm.tipo !== 'ajuste' && (!cant || cant <= 0)) {
      this.modalService.error('La cantidad debe ser mayor a 0');
      return;
    }
    if (this.movForm.tipo === 'ajuste' && (cant < 0 || cant === null || cant === undefined || isNaN(cant))) {
      this.modalService.error('Ingresa el stock nuevo (0 o más)');
      return;
    }

    this.guardando.set(true);
    this.inventarioService.crearMovimiento({
      producto_id: prod.id,
      talla_id: this.movForm.talla_id,
      tipo: this.movForm.tipo,
      cantidad: cant,
      motivo: this.movForm.motivo?.trim() || undefined,
      precio_venta: this.movForm.tipo === 'salida' ? this.movForm.precio_venta : null
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.modalService.success('Movimiento registrado');
        this.cargar();
        // Refrescar movimientos/reporte si ya se habían cargado
        if (this.movimientos().length > 0) this.cargarMovimientos();
        if (this.reporte().length > 0) this.cargarReporte();
      },
      error: (err) => {
        this.guardando.set(false);
        this.modalService.error(err.error?.error || 'Error al registrar el movimiento');
      }
    });
  }

  generoLabel(genero?: string): string {
    if (genero === 'mujer') return 'Dama';
    if (genero === 'hombre') return 'Caballero';
    return '';
  }
}
