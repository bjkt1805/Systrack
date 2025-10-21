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

  constructor() {

    // Para obtener el id/parámetro de la ruta
    // Parsear el id a número
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Validación básica del id y enviarlo como parámetro al método obtenerCategoria
    /*if (!isNaN(id)) {
      this.obtenerCategoria(id);
    }*/
  }

  // Obtener categoría y actualizar la Signal
  /*obtenerCategoria(id: number) {
    this.categoriaService.getById(id).subscribe((data: UsuarioModel) => {
      console.log(data);
      this.datos.set(data); // Actualiza la Signal
    });
  }*/

  // Para regresar a la vista de lista de técnicos
  goBack(): void {
    this.router.navigate(['/categoria/']);
  }

}
