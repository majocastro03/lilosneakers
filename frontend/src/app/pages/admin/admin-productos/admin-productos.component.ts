import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ProductoService, Producto, ProductosResponse } from '../../../core/services/producto.service';
import { CategoriaService, Categoria } from '../../../core/services/categoria.service';
import { MarcaService } from '../../../core/services/marca/marca-service';
import { ColoresService } from '../../../core/services/colores/colores-service';
import { TallaService } from '../../../core/services/talla/talla-service';
import { Marca } from '../../../core/interfaces/marca';
import { ModalService } from '../../../shared/modal/modal.service';
import { environment } from '../../../../environments/environment';
=======
import { Router} from '@angular/router';
import { ProductoService, Producto, ProductosResponse } from '../../../core/services/producto.service';
import { CategoriaService, Categoria } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';
>>>>>>> origin/main

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.component.html',
  styleUrl: './admin-productos.component.css'
})
export class AdminProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
<<<<<<< HEAD
  private marcaService = inject(MarcaService);
  private coloresService = inject(ColoresService);
  private tallaService = inject(TallaService);
  private http = inject(HttpClient);
=======
  private authService = inject(AuthService);
  private router = inject(Router);
>>>>>>> origin/main
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  allColores: any[] = [];
  allTallas: any[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Filtros
  filtroNombre = '';
  filtroCategoria = '';
  filtroMarca = '';
  filtroEstado = '';
  filtroActivo = '';

  // Mobile
  showMobileFilters = false;

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get productosFiltrados(): Producto[] {
    let filtered = this.productos.filter(p => {
      if (this.filtroNombre && !p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())) return false;
      if (this.filtroCategoria && p.categoria !== this.filtroCategoria) return false;
      if (this.filtroMarca && p.marca?.nombre !== this.filtroMarca) return false;
      if (this.filtroEstado === 'destacado' && !p.destacado) return false;
      if (this.filtroEstado === 'normal' && p.destacado) return false;
      if (this.filtroActivo === 'activo' && !p.activo) return false;
      if (this.filtroActivo === 'inactivo' && p.activo) return false;
      return true;
    });

    if (this.sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const valA = (a as any)[this.sortColumn] ?? 0;
        const valB = (b as any)[this.sortColumn] ?? 0;
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return filtered;
  }

  get tallasFiltradas(): any[] {
    if (!this.filtroGeneroTalla) return this.allTallas;
    return this.allTallas.filter((t: any) => t.genero === this.filtroGeneroTalla);
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  showModal = false;
  modoEdicion = false;

  form = {
    id: null as string | null,
    nombre: '',
    precio: 0,
    descuento: 0,
    descripcion: '',
    destacado: false,
<<<<<<< HEAD
    activo: true,
    categoria_id: '' as string,
    marca_id: '' as string,
=======
    categoria_id: '' as string,
>>>>>>> origin/main
    imagen: null as File | null
  };

  // Display strings for formatted inputs
  precioDisplay = '';
  descuentoDisplay = '';

  selectedColorIds: string[] = [];
  selectedTallaIds: string[] = [];
  filtroGeneroTalla = '';
  imagenPreview: string | null = null;

  // Multiple images
  existingImages: { id: string; imagen_url: string; orden: number }[] = [];
  newImageFiles: File[] = [];
  newImagePreviews: string[] = [];

  ngOnInit() {
    this.cargarDatos();
    this.cargarProductos();
  }

<<<<<<< HEAD
  cargarDatos() {
    forkJoin({
      categorias: this.categoriaService.getCategorias(),
      marcas: this.marcaService.getMarcas(),
      colores: this.coloresService.getColores(),
      tallas: this.tallaService.getTallas()
    }).subscribe({
      next: (data) => {
        this.categorias = data.categorias;
        this.marcas = data.marcas;
        this.allColores = data.colores;
        this.allTallas = data.tallas;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.cdr.markForCheck();
=======
  async logout() {
    const ok = await this.modalService.confirm('¿Estas seguro de cerrar sesion?');
    if (ok) {
      this.authService.logout();
    }
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.error = 'Error al cargar categorías';
        this.cdr.detectChanges();
>>>>>>> origin/main
      }
    });
  }

  cargarProductos() {
    this.loading = true;
    this.error = null;

    this.productoService.getProductos({ limit: 1000, incluir_inactivos: true }).subscribe({
      next: (data: ProductosResponse) => {
        this.productos = data.productos;
        this.loading = false;
<<<<<<< HEAD
        this.cdr.markForCheck();
=======
        this.cdr.detectChanges();
>>>>>>> origin/main
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'Error al cargar productos';
        this.loading = false;
<<<<<<< HEAD
        this.cdr.markForCheck();
=======
        this.cdr.detectChanges();
>>>>>>> origin/main
      }
    });
  }

  // === Price formatting (150.000) ===
  formatPrecioDisplay() {
    if (this.form.precio > 0) {
      this.precioDisplay = this.formatThousands(this.form.precio);
    } else {
      this.precioDisplay = '';
    }
  }

  onPrecioInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10) || 0;
    this.form.precio = num;
    this.precioDisplay = num > 0 ? this.formatThousands(num) : '';
    // Reposition cursor
    setTimeout(() => {
      input.value = this.precioDisplay;
    });
  }

  onPrecioFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.form.precio === 0) {
      this.precioDisplay = '';
      input.value = '';
    }
  }

  onPrecioBlur() {
    this.formatPrecioDisplay();
  }

  // === Discount formatting (30,00) ===
  formatDescuentoDisplay() {
    if (this.form.descuento > 0) {
      this.descuentoDisplay = this.form.descuento.toFixed(2).replace('.', ',');
    } else {
      this.descuentoDisplay = '';
    }
  }

  onDescuentoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(',', '.');
    // Allow only valid decimal format
    raw = raw.replace(/[^0-9.]/g, '');
    const num = parseFloat(raw) || 0;
    this.form.descuento = Math.min(num, 100);
  }

  onDescuentoFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.form.descuento === 0) {
      this.descuentoDisplay = '';
      input.value = '';
    } else {
      // Show raw number for editing
      this.descuentoDisplay = this.form.descuento.toString().replace('.', ',');
    }
  }

  onDescuentoBlur() {
    this.formatDescuentoDisplay();
  }

  private formatThousands(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.resetForm();
    this.showModal = true;
  }

  abrirModalEditar(producto: Producto) {
    this.modoEdicion = true;
<<<<<<< HEAD

    const categoriaEncontrada = this.categorias.find(c => c.nombre === producto.categoria);

=======
    
    // Buscar el UUID de la categoría basándose en el nombre
    const categoriaEncontrada = this.categorias.find(c => c.nombre === producto.categoria);
    
>>>>>>> origin/main
    this.form = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descuento: producto.descuento,
      descripcion: producto.descripcion || '',
      destacado: producto.destacado,
<<<<<<< HEAD
      activo: producto.activo ?? true,
      categoria_id: categoriaEncontrada?.id || '',
      marca_id: producto.marca_id || '',
=======
      categoria_id: categoriaEncontrada?.id || '',
>>>>>>> origin/main
      imagen: null
    };

    this.formatPrecioDisplay();
    this.formatDescuentoDisplay();
    this.selectedColorIds = producto.colores?.map(c => c.id) || [];
    this.selectedTallaIds = producto.tallas?.map(t => t.id) || [];
    this.imagenPreview = producto.imagen_url;
    this.existingImages = producto.imagenes || [];
    this.newImageFiles = [];
    this.newImagePreviews = [];
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.form = {
      id: null,
      nombre: '',
      precio: 0,
      descuento: 0,
      descripcion: '',
      destacado: false,
<<<<<<< HEAD
      activo: true,
      categoria_id: '',
      marca_id: '',
=======
      categoria_id: '',
>>>>>>> origin/main
      imagen: null
    };
    this.precioDisplay = '';
    this.descuentoDisplay = '';
    this.selectedColorIds = [];
    this.selectedTallaIds = [];
    this.filtroGeneroTalla = '';
    this.imagenPreview = null;
    this.existingImages = [];
    this.newImageFiles = [];
    this.newImagePreviews = [];
  }

  toggleColor(colorId: string) {
    const idx = this.selectedColorIds.indexOf(colorId);
    if (idx >= 0) {
      this.selectedColorIds.splice(idx, 1);
    } else {
      this.selectedColorIds.push(colorId);
    }
  }

  isColorSelected(colorId: string): boolean {
    return this.selectedColorIds.includes(colorId);
  }

  toggleTalla(tallaId: string) {
    const idx = this.selectedTallaIds.indexOf(tallaId);
    if (idx >= 0) {
      this.selectedTallaIds.splice(idx, 1);
    } else {
      this.selectedTallaIds.push(tallaId);
    }
  }

  isTallaSelected(tallaId: string): boolean {
    return this.selectedTallaIds.includes(tallaId);
  }

  onImagenChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.imagen = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onExtraImagesChange(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.newImageFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newImagePreviews.push(e.target.result);
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  }

  removeNewImage(index: number) {
    this.newImageFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  removeExistingImage(imagen: { id: string; imagen_url: string; orden: number }) {
    if (!this.form.id) return;
    this.http.delete(`${environment.apiUrl}/productos/${this.form.id}/imagenes/${imagen.id}`).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(i => i.id !== imagen.id);
        this.cdr.markForCheck();
      },
      error: (err) => this.modalService.error(err.error?.error || 'Error al eliminar imagen')
    });
  }

  guardarProducto() {
    // Validaciones
    if (!this.form.nombre || !this.form.precio) {
<<<<<<< HEAD
      this.modalService.error('Nombre y precio son requeridos');
=======
      this.error = 'Nombre y precio son requeridos';
      setTimeout(() => this.error = null, 3000);
>>>>>>> origin/main
      return;
    }

    if (!this.form.categoria_id) {
<<<<<<< HEAD
      this.modalService.error('Categoría es requerida');
      return;
    }

    if (!this.modoEdicion && !this.form.imagen) {
      this.modalService.error('La imagen es requerida para crear un producto');
=======
      this.error = 'Categoría es requerida';
      setTimeout(() => this.error = null, 3000);
      return;
    }

    // Validación de imagen para crear nuevo producto
    if (!this.modoEdicion && !this.form.imagen) {
      this.error = 'La imagen es requerida para crear un producto';
      setTimeout(() => this.error = null, 3000);
>>>>>>> origin/main
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.form.nombre);
    formData.append('precio', this.form.precio.toString());
    formData.append('descuento', this.form.descuento.toString());
    formData.append('descripcion', this.form.descripcion);
    formData.append('destacado', this.form.destacado.toString());
<<<<<<< HEAD
    formData.append('activo', this.form.activo.toString());
    formData.append('categoria_id', this.form.categoria_id);
    if (this.form.marca_id) {
      formData.append('marca_id', this.form.marca_id);
    }

=======
    formData.append('categoria_id', this.form.categoria_id);
    
>>>>>>> origin/main
    if (this.form.imagen) {
      formData.append('imagen', this.form.imagen);
    }

    this.loading = true;
    this.error = null;

    const isEditing = this.modoEdicion && this.form.id;
    const productoId = this.form.id;

    const request = isEditing
      ? this.productoService.actualizarProducto(this.form.id!, formData)
      : this.productoService.crearProducto(formData);

    request.subscribe({
      next: (res: any) => {
        const id = isEditing ? productoId! : res.producto?.id;
        if (id) {
          this.guardarAsociaciones(id, isEditing as boolean);
        } else {
          this.cerrarModal();
          this.cargarProductos();
          this.loading = false;
          this.modalService.success(isEditing ? 'Producto actualizado' : 'Producto creado');
        }
      },
      error: (err) => {
        console.error('Error al guardar producto:', err);
<<<<<<< HEAD
        this.loading = false;
        this.modalService.error(err.error?.error || 'Error al guardar el producto');
=======
        this.error = err.error?.error || 'Error al guardar el producto';
        this.loading = false;
        setTimeout(() => this.error = null, 5000);
>>>>>>> origin/main
      }
    });
  }

<<<<<<< HEAD
  private guardarAsociaciones(productoId: string, isEditing: boolean) {
    const apiUrl = `${environment.apiUrl}/productos/${productoId}`;

    if (isEditing) {
      const deleteRequests: any[] = [];
      const producto = this.productos.find(p => p.id === productoId);
      if (producto) {
        for (const color of producto.colores || []) {
          deleteRequests.push(this.http.delete(`${apiUrl}/colores/${color.id}`));
        }
        for (const talla of producto.tallas || []) {
          deleteRequests.push(this.http.delete(`${apiUrl}/tallas/${talla.id}`));
        }
      }

      if (deleteRequests.length > 0) {
        forkJoin(deleteRequests).subscribe({
          next: () => this.crearAsociaciones(productoId, isEditing),
          error: () => this.crearAsociaciones(productoId, isEditing)
        });
      } else {
        this.crearAsociaciones(productoId, isEditing);
      }
    } else {
      this.crearAsociaciones(productoId, isEditing);
    }
  }

  private crearAsociaciones(productoId: string, isEditing: boolean) {
    const apiUrl = `${environment.apiUrl}/productos/${productoId}`;
    const requests: any[] = [];

    if (this.selectedColorIds.length > 0) {
      requests.push(
        this.http.post(`${apiUrl}/colores`, {
          colores: this.selectedColorIds.map(id => ({ color_id: id }))
        })
      );
    }

    if (this.selectedTallaIds.length > 0) {
      requests.push(
        this.http.post(`${apiUrl}/tallas`, {
          tallas: this.selectedTallaIds.map(id => ({ talla_id: id, cantidad: 0 }))
        })
      );
    }

    const finalize = () => {
      if (this.newImageFiles.length > 0) {
        this.subirImagenesExtra(productoId, isEditing);
      } else {
        this.cerrarModal();
        this.cargarProductos();
        this.loading = false;
        this.modalService.success(isEditing ? 'Producto actualizado' : 'Producto creado');
      }
    };

    if (requests.length > 0) {
      forkJoin(requests).subscribe({
        next: () => finalize(),
        error: () => finalize()
      });
    } else {
      finalize();
    }
  }

  toggleActivo(producto: Producto) {
    const nuevoEstado = !producto.activo;
    const formData = new FormData();
    formData.append('nombre', producto.nombre);
    formData.append('precio', producto.precio.toString());
    formData.append('descuento', producto.descuento.toString());
    formData.append('descripcion', producto.descripcion || '');
    formData.append('destacado', producto.destacado.toString());
    formData.append('activo', nuevoEstado.toString());
    formData.append('categoria_id', producto.categoria_id || '');
    if (producto.marca_id) formData.append('marca_id', producto.marca_id);

    this.productoService.actualizarProducto(producto.id, formData).subscribe({
      next: () => {
        producto.activo = nuevoEstado;
        this.modalService.success(nuevoEstado ? 'Producto activado' : 'Producto desactivado');
        this.cdr.markForCheck();
      },
      error: (err) => this.modalService.error(err.error?.error || 'Error al cambiar estado')
    });
  }

  async confirmarEliminar(producto: Producto) {
    const ok = await this.modalService.confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`);
=======
  async confirmarEliminar(producto: Producto) {
    const ok = await this.modalService.confirm(`¿Estas seguro de eliminar "${producto.nombre}"?`);
>>>>>>> origin/main
    if (ok) {
      this.eliminarProducto(producto.id);
    }
  }

  eliminarProducto(id: string) {
    this.loading = true;

    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.cargarProductos();
        this.modalService.success('Producto eliminado');
      },
      error: (err) => {
        console.error('Error al eliminar producto:', err);
<<<<<<< HEAD
        this.loading = false;
        this.modalService.error(err.error?.error || 'Error al eliminar el producto');
      }
    });
  }

  private subirImagenesExtra(productoId: string, isEditing: boolean) {
    const apiUrl = `${environment.apiUrl}/productos/${productoId}/imagenes`;
    const uploads = this.newImageFiles.map(file => {
      const fd = new FormData();
      fd.append('imagen', file);
      return this.http.post(apiUrl, fd);
    });

    forkJoin(uploads).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarProductos();
        this.loading = false;
        this.modalService.success(isEditing ? 'Producto actualizado' : 'Producto creado');
      },
      error: () => {
        this.cerrarModal();
        this.cargarProductos();
        this.loading = false;
        this.modalService.error('Producto guardado, pero hubo un error al subir algunas imágenes');
=======
        this.error = err.error?.error || 'Error al eliminar el producto';
        this.loading = false;
        setTimeout(() => this.error = null, 5000);
>>>>>>> origin/main
      }
    });
  }
}
