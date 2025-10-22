import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { CategoriaModel } from '../../share/models/CategoriaModel';

@Component({
  selector: 'app-categoria-detail',
  standalone: false,
  templateUrl: './categoria-detail.html',
  styleUrl: './categoria-detail.css'
})
export class CategoriaDetail {

  // Signal para almacenar los datos del categoría
  datos = signal<CategoriaModel | null>(null);

  // Inyectar servicio para llamar al detalle del categoría
  private categoriaService = inject(CategoriaService);

  // Para obtener el parámetro de la ruta 
  private route = inject(ActivatedRoute);

  // Para redireccionar
  private router = inject(Router);

  constructor(
  ) {
    // Obtener el ID desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID recibido:', id);
    
    if (id) {
      this.loadCategoria(Number(id));
    }
  }

  // Cargar los datos de la categoría desde el API
  loadCategoria(id: number) {
    this.categoriaService.getById(id).subscribe({
      next: (respuesta: CategoriaModel) => {
        console.log('Categoría cargada:', respuesta);
        this.datos.set(respuesta);
      },
      error: (error) => {
        console.error('Error al cargar categoría:', error);
        this.datos.set(null);
      }
    });
  }

  // Para regresar a la vista de lista de técnicos
  goBack(): void {
    this.router.navigate(['/categoria/']);
  }

}
