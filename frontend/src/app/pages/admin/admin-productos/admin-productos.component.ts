import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService, Producto, ProductosResponse } from '../../../core/services/producto.service';
import { CategoriaService, Categoria } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';

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
  private authService = inject(AuthService);
  private router = inject(Router);

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Modal
  showModal = false;
  modoEdicion = false;
  productoActual: Partial<Producto> = {};

  // Formulario
  form = {
    id: null as number | null,
    nombre: '',
    precio: 0,
    descuento: 0,
    descripcion: '',
    destacado: false,
    categoria_id: null as string | null,
    imagen: null as File | null
  };

  imagenPreview: string | null = null;

  // Usuario actual
  get currentUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  cargarProductos() {
    this.loading = true;
    this.error = null;

    this.productoService.getProductos({ limit: 1000 }).subscribe({
      next: (data: ProductosResponse) => {
        this.productos = data.productos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'Error al cargar productos';
        this.loading = false;
      }
    });
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.resetForm();
    this.showModal = true;
  }

  abrirModalEditar(producto: Producto) {
    this.modoEdicion = true;
    this.productoActual = producto;
    
    this.form = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descuento: producto.descuento,
      descripcion: producto.descripcion || '',
      destacado: producto.destacado,
      categoria_id: producto.categoria,
      imagen: null
    };
    
    this.imagenPreview = producto.imagen_url;
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
      categoria_id: null,
      imagen: null
    };
    this.imagenPreview = null;
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

  guardarProducto() {
    if (!this.form.nombre || !this.form.precio) {
      this.error = 'Nombre y precio son requeridos';
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.form.nombre);
    formData.append('precio', this.form.precio.toString());
    formData.append('descuento', this.form.descuento.toString());
    formData.append('descripcion', this.form.descripcion);
    formData.append('destacado', this.form.destacado.toString());
    
    if (this.form.categoria_id) {
      formData.append('categoria_id', this.form.categoria_id.toString());
    }
    
    if (this.form.imagen) {
      formData.append('imagen', this.form.imagen);
    }

    this.loading = true;
    this.error = null;

    const request = this.modoEdicion && this.form.id
      ? this.productoService.actualizarProducto(this.form.id, formData)
      : this.productoService.crearProducto(formData);

    request.subscribe({
      next: () => {
        this.successMessage = this.modoEdicion 
          ? 'Producto actualizado exitosamente'
          : 'Producto creado exitosamente';
        
        setTimeout(() => this.successMessage = null, 3000);
        
        this.cerrarModal();
        this.cargarProductos();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al guardar producto:', err);
        this.error = 'Error al guardar el producto';
        this.loading = false;
      }
    });
  }

  confirmarEliminar(producto: Producto) {
    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
      this.eliminarProducto(producto.id);
    }
  }

  eliminarProducto(id: number) {
    this.loading = true;
    
    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.successMessage = 'Producto eliminado exitosamente';
        setTimeout(() => this.successMessage = null, 3000);
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error al eliminar producto:', err);
        this.error = 'Error al eliminar el producto';
        this.loading = false;
      }
    });
  }
}
