import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../core/services/inventario/inventario-service';
import { ModalService } from '../../../shared/modal/modal.service';
import { InventarioProducto } from '../../../core/interfaces/inventario';

type Formato = 'historia' | 'post';
type ElementoKey = 'marca' | 'nombre' | 'tallas' | 'genero' | 'precio';
interface Caja { x: number; y: number; w: number; h: number; }
interface ArteOpts {
  img: HTMLImageElement | null;
  nombre: string;
  precio: string;
  tallas: string;
  genero: string;
  mostrarNombre: boolean;
  pos: Record<ElementoKey, { fx: number; fy: number }>;
}

@Component({
  selector: 'app-admin-generador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-generador.html',
  styleUrl: './admin-generador.css'
})
export class AdminGeneradorComponent implements OnInit, AfterViewInit {
  private inventarioService = inject(InventarioService);
  private modalService = inject(ModalService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  productos = signal<InventarioProducto[]>([]);
  loading = signal(false);
  seleccionado = signal<InventarioProducto | null>(null);

  // Filtros
  busqueda = signal('');
  filtroTalla = signal('');
  filtroColor = signal('');
  filtroGenero = signal('');

  // Selección múltiple (para descarga por lote)
  seleccionMultiple = signal<Set<string>>(new Set());
  descargandoLote = signal(false);
  progreso = signal({ done: 0, total: 0 });

  // Campos editables del arte (modo edición individual)
  nombreTexto = '';
  precioTexto = '';
  tallasTexto = '';
  generoTexto = '';
  mostrarNombre = true;
  formato: Formato = 'historia';

  private img: HTMLImageElement | null = null;
  private viewReady = false;

  private readonly orden: ElementoKey[] = ['marca', 'nombre', 'tallas', 'genero', 'precio'];

  private readonly posDefault: Record<ElementoKey, { fx: number; fy: number }> = {
    marca:  { fx: 0.055, fy: 0.03 },
    nombre: { fx: 0.055, fy: 0.72 },
    tallas: { fx: 0.055, fy: 0.80 },
    genero: { fx: 0.055, fy: 0.88 },
    precio: { fx: 0.60,  fy: 0.50 }
  };
  private pos: Record<ElementoKey, { fx: number; fy: number }> = this.clonarDefault();

  private cajas: Partial<Record<ElementoKey, Caja>> = {};
  private arrastrando: ElementoKey | null = null;
  private offset = { x: 0, y: 0 };

  // ====== Opciones de filtros ======
  tallasDisponiblesFiltro = computed(() => {
    const set = new Set<string>();
    for (const p of this.productos()) {
      for (const t of p.tallas) if (t.cantidad > 0) set.add(t.talla);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  });

  coloresDisponiblesFiltro = computed(() => {
    const set = new Set<string>();
    for (const p of this.productos()) {
      for (const c of p.colores) set.add(c.nombre);
    }
    return [...set].sort();
  });

  productosFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const ft = this.filtroTalla();
    const fc = this.filtroColor();
    const fg = this.filtroGenero();

    return this.productos().filter(p => {
      if (q && !p.nombre.toLowerCase().includes(q) && !(p.marca || '').toLowerCase().includes(q)) return false;
      if (ft && !p.tallas.some(t => t.talla === ft && t.cantidad > 0)) return false;
      if (fg && !p.tallas.some(t => t.genero === fg && t.cantidad > 0)) return false;
      if (fc && !p.colores.some(c => c.nombre === fc)) return false;
      return true;
    });
  });

  hayFiltros = computed(() =>
    !!(this.busqueda() || this.filtroTalla() || this.filtroColor() || this.filtroGenero())
  );

  ngOnInit() { this.cargar(); }

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.seleccionado()) this.redraw();
  }

  cargar() {
    this.loading.set(true);
    this.inventarioService.getInventario().subscribe({
      next: (data) => { this.productos.set(data); this.loading.set(false); },
      error: (err) => { this.loading.set(false); this.modalService.error(err.error?.error || 'Error al cargar productos'); }
    });
  }

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtroTalla.set('');
    this.filtroColor.set('');
    this.filtroGenero.set('');
  }

  // ====== Selección múltiple ======
  estaSeleccionado(id: string) { return this.seleccionMultiple().has(id); }

  toggleSeleccion(id: string, ev?: Event) {
    ev?.stopPropagation();
    const set = new Set(this.seleccionMultiple());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.seleccionMultiple.set(set);
  }

  seleccionarTodosFiltrados() {
    const set = new Set(this.seleccionMultiple());
    for (const p of this.productosFiltrados()) set.add(p.id);
    this.seleccionMultiple.set(set);
  }

  limpiarSeleccion() { this.seleccionMultiple.set(new Set()); }

  // ====== Helpers de datos ======
  private clonarDefault(): Record<ElementoKey, { fx: number; fy: number }> {
    return JSON.parse(JSON.stringify(this.posDefault));
  }

  private formatThousands(n: number): string {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  private tallasDisponibles(p: InventarioProducto): string {
    const conStock = p.tallas.filter(t => t.cantidad > 0);
    const lista = (conStock.length > 0 ? conStock : p.tallas);
    const valores = lista.map(t => t.talla).filter((v, i, arr) => arr.indexOf(v) === i);
    return valores.join(' · ');
  }

  private generoDe(p: InventarioProducto): string {
    const generos = new Set(p.tallas.map(t => t.genero).filter(Boolean));
    if (generos.size === 1) {
      const g = [...generos][0];
      if (g === 'hombre') return 'Caballero';
      if (g === 'mujer') return 'Dama';
    }
    return '';
  }

  private optsDeProducto(p: InventarioProducto): ArteOpts {
    return {
      img: null,
      nombre: p.nombre,
      precio: '$' + this.formatThousands(p.precio_final),
      tallas: 'Tallas ' + this.tallasDisponibles(p),
      genero: this.generoDe(p),
      mostrarNombre: true,
      pos: this.clonarDefault()
    };
  }

  // ====== Modo edición individual ======
  seleccionar(p: InventarioProducto) {
    this.seleccionado.set(p);
    this.nombreTexto = p.nombre;
    this.precioTexto = '$' + this.formatThousands(p.precio_final);
    this.tallasTexto = 'Tallas ' + this.tallasDisponibles(p);
    this.generoTexto = this.generoDe(p);
    this.mostrarNombre = true;
    this.pos = this.clonarDefault();

    if (!this.isBrowser) return;
    this.img = null;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => { this.img = image; this.redraw(); };
    image.onerror = () => { this.img = null; this.redraw(); };
    image.src = p.imagen_url || 'assets/placeholder-product.jpg';

    const fonts = (document as any).fonts;
    if (fonts?.ready) fonts.ready.then(() => this.redraw());
  }

  precioCorto() {
    const num = parseInt(this.precioTexto.replace(/[^0-9]/g, ''), 10);
    if (!num) return;
    this.precioTexto = num % 1000 === 0 ? `$${num / 1000}k` : `$${(num / 1000).toFixed(1)}k`;
    this.redraw();
  }

  cambiarFormato(f: Formato) { this.formato = f; this.redraw(); }

  restablecerPosiciones() { this.pos = this.clonarDefault(); this.redraw(); }

  private optsActuales(): ArteOpts {
    return {
      img: this.img,
      nombre: this.nombreTexto,
      precio: this.precioTexto,
      tallas: this.tallasTexto,
      genero: this.generoTexto,
      mostrarNombre: this.mostrarNombre,
      pos: this.pos
    };
  }

  // ====== Dibujo ======
  private textoDe(key: ElementoKey, o: ArteOpts): string {
    switch (key) {
      case 'marca': return 'LILO SNEAKERS';
      case 'nombre': return o.nombre.trim();
      case 'tallas': return o.tallas.trim();
      case 'genero': return o.genero.trim().toUpperCase();
      case 'precio': return o.precio.trim();
      default: return '';
    }
  }

  private visible(key: ElementoKey, o: ArteOpts): boolean {
    switch (key) {
      case 'marca': return true;
      case 'nombre': return o.mostrarNombre && !!o.nombre.trim();
      case 'tallas': return !!o.tallas.trim();
      case 'genero': return !!o.genero.trim();
      case 'precio': return !!o.precio.trim();
      default: return false;
    }
  }

  private roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  private dibujarElemento(ctx: CanvasRenderingContext2D, key: ElementoKey, texto: string, x: number, y: number): Caja {
    if (key === 'marca' || key === 'nombre') {
      const fontSize = key === 'marca' ? 40 : 60;
      ctx.font = `800 ${fontSize}px Outfit, Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(texto, x, y);
      ctx.shadowBlur = 0;
      return { x, y, w: ctx.measureText(texto).width, h: fontSize * 1.15 };
    }

    const conf = {
      tallas: { bg: '#111827', color: '#ffffff', fontSize: 38 },
      genero: { bg: '#111827', color: '#ffffff', fontSize: 40 },
      precio: { bg: '#fbd0e0', color: '#e11d48', fontSize: 72 }
    }[key as 'tallas' | 'genero' | 'precio'];

    const padX = 32, padY = 18;
    ctx.font = `800 ${conf.fontSize}px Outfit, Arial, sans-serif`;
    const w = ctx.measureText(texto).width + padX * 2;
    const h = conf.fontSize + padY * 2;
    this.roundRectPath(ctx, x, y, w, h, 18);
    ctx.fillStyle = conf.bg;
    ctx.fill();
    ctx.fillStyle = conf.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, x + padX, y + h / 2 + 2);
    return { x, y, w, h };
  }

  /** Dibuja el arte completo en un contexto. Devuelve las cajas de cada elemento. */
  private dibujarArte(ctx: CanvasRenderingContext2D, W: number, H: number, o: ArteOpts): Partial<Record<ElementoKey, Caja>> {
    ctx.fillStyle = '#14231a';
    ctx.fillRect(0, 0, W, H);

    if (o.img) {
      const iw = o.img.width, ih = o.img.height;
      const scale = Math.max(W / iw, H / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(o.img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    const grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.45, W, H * 0.55);

    const cajas: Partial<Record<ElementoKey, Caja>> = {};
    for (const key of this.orden) {
      if (!this.visible(key, o)) continue;
      const p = o.pos[key];
      cajas[key] = this.dibujarElemento(ctx, key, this.textoDe(key, o), p.fx * W, p.fy * H);
    }
    return cajas;
  }

  private dimensiones() {
    return { W: 1080, H: this.formato === 'historia' ? 1920 : 1350 };
  }

  redraw() {
    if (!this.isBrowser || !this.viewReady) return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.seleccionado()) return;
    const { W, H } = this.dimensiones();
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.cajas = this.dibujarArte(ctx, W, H, this.optsActuales());
  }

  // ====== Arrastre ======
  private puntoCanvas(e: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  private elementoEn(x: number, y: number): ElementoKey | null {
    for (const key of [...this.orden].reverse()) {
      const c = this.cajas[key];
      if (c && x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) return key;
    }
    return null;
  }

  onPointerDown(e: PointerEvent) {
    if (!this.seleccionado()) return;
    const { x, y } = this.puntoCanvas(e);
    const key = this.elementoEn(x, y);
    if (!key) return;
    const c = this.cajas[key]!;
    this.arrastrando = key;
    this.offset = { x: x - c.x, y: y - c.y };
    this.canvasRef!.nativeElement.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  onPointerMove(e: PointerEvent) {
    if (!this.arrastrando) return;
    const canvas = this.canvasRef!.nativeElement;
    const { x, y } = this.puntoCanvas(e);
    const c = this.cajas[this.arrastrando]!;
    let nx = Math.max(0, Math.min(x - this.offset.x, canvas.width - c.w));
    let ny = Math.max(0, Math.min(y - this.offset.y, canvas.height - c.h));
    this.pos[this.arrastrando] = { fx: nx / canvas.width, fy: ny / canvas.height };
    this.redraw();
  }

  onPointerUp(e: PointerEvent) {
    if (this.arrastrando) {
      this.canvasRef?.nativeElement.releasePointerCapture(e.pointerId);
      this.arrastrando = null;
    }
  }

  // ====== Descarga ======
  private cargarImagen(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = url || 'assets/placeholder-product.jpg';
    });
  }

  private slug(nombre: string): string {
    return nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'producto';
  }

  private delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

  /** ¿El navegador puede compartir archivos (Web Share API)? */
  soportaCompartir(): boolean {
    if (!this.isBrowser) return false;
    const nav = navigator as any;
    return !!(nav.canShare && nav.share);
  }

  private canvasAArchivo(canvas: HTMLCanvasElement, nombre: string): Promise<File | null> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(null); return; }
        resolve(new File([blob], `lilo-${this.slug(nombre)}-${Date.now()}.png`, { type: 'image/png' }));
      }, 'image/png');
    });
  }

  private descargarArchivo(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Comparte archivos por el menú nativo. Devuelve true si se compartió; false si hubo que descargar. */
  private async compartirArchivos(files: File[], texto: string): Promise<boolean> {
    const nav = navigator as any;
    if (this.isBrowser && nav.canShare && nav.canShare({ files })) {
      try {
        await nav.share({ files, text: texto });
        return true;
      } catch (e: any) {
        // El usuario canceló el menú de compartir: no es error.
        if (e && e.name === 'AbortError') return true;
        // Si falla el share, caemos a descarga.
      }
    }
    files.forEach(f => this.descargarArchivo(f));
    return false;
  }

  private textoProductoActual(): string {
    const partes = [this.nombreTexto, this.precioTexto, this.tallasTexto].map(s => s.trim()).filter(Boolean);
    if (this.generoTexto.trim()) partes.push(this.generoTexto.trim());
    return partes.join(' · ');
  }

  private textoLote(ids: string[]): string {
    const lineas = ['👟 Te comparto estos modelos:', ''];
    for (const id of ids) {
      const p = this.productos().find(x => x.id === id);
      if (p) lineas.push(`• ${p.nombre} — $${this.formatThousands(p.precio_final)}`);
    }
    return lineas.join('\n');
  }

  // ====== Individual ======
  descargar() {
    const canvas = this.canvasRef?.nativeElement;
    const prod = this.seleccionado();
    if (!canvas || !prod) return;
    this.canvasAArchivo(canvas, prod.nombre).then(file => {
      if (file) this.descargarArchivo(file);
      else this.modalService.error('No se pudo exportar la imagen. Intenta con otra foto.');
    });
  }

  async compartir() {
    const canvas = this.canvasRef?.nativeElement;
    const prod = this.seleccionado();
    if (!canvas || !prod) return;
    const file = await this.canvasAArchivo(canvas, prod.nombre);
    if (!file) { this.modalService.error('No se pudo generar la imagen'); return; }
    const compartido = await this.compartirArchivos([file], this.textoProductoActual());
    if (!compartido) this.modalService.success('Tu dispositivo no permite compartir; descargué la imagen.');
  }

  // ====== Lote ======
  private async construirArchivosLote(ids: string[]): Promise<File[]> {
    const { W, H } = this.dimensiones();
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const archivos: File[] = [];

    const fonts = (document as any).fonts;
    if (fonts?.ready) await fonts.ready;

    for (const id of ids) {
      const p = this.productos().find(x => x.id === id);
      if (!p || !ctx) continue;
      const opts = this.optsDeProducto(p);
      opts.img = await this.cargarImagen(p.imagen_url);
      this.dibujarArte(ctx, W, H, opts);
      const file = await this.canvasAArchivo(canvas, p.nombre);
      if (file) archivos.push(file);
      this.progreso.update(v => ({ ...v, done: v.done + 1 }));
    }
    return archivos;
  }

  async descargarLote() {
    if (!this.isBrowser) return;
    const ids = [...this.seleccionMultiple()];
    if (ids.length === 0) return;

    this.descargandoLote.set(true);
    this.progreso.set({ done: 0, total: ids.length });
    try {
      const archivos = await this.construirArchivosLote(ids);
      for (const f of archivos) {
        this.descargarArchivo(f);
        await this.delay(400); // separación para que el navegador no bloquee las descargas
      }
      this.modalService.success(`${archivos.length} imagen(es) descargada(s)`);
    } catch {
      this.modalService.error('Hubo un problema al generar el lote de imágenes');
    } finally {
      this.descargandoLote.set(false);
    }
  }

  async compartirLote() {
    if (!this.isBrowser) return;
    const ids = [...this.seleccionMultiple()];
    if (ids.length === 0) return;

    this.descargandoLote.set(true);
    this.progreso.set({ done: 0, total: ids.length });
    try {
      const archivos = await this.construirArchivosLote(ids);
      if (archivos.length === 0) { this.modalService.error('No se pudieron generar las imágenes'); return; }
      const compartido = await this.compartirArchivos(archivos, this.textoLote(ids));
      if (!compartido) this.modalService.success('Tu dispositivo no permite compartir varias; descargué las imágenes.');
    } catch {
      this.modalService.error('Hubo un problema al compartir el lote');
    } finally {
      this.descargandoLote.set(false);
    }
  }
}
