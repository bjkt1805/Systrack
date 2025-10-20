import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { UsuarioModel } from '../../share/models/UsuarioModel';

@Component({
  selector: 'app-tecnico-detail',
  standalone: false,
  templateUrl: './tecnico-detail.html',
  styleUrl: './tecnico-detail.css'
})
export class TecnicoDetail {

  // Signal para almacenar los datos del técnico
  datos = signal<UsuarioModel | null>(null);

  // Inyectar servicio para llamar al detalle del técnico
  private tecnicoService = inject(TecnicoService);

  // Para obtener el parámetro de la ruta 
  private route = inject(ActivatedRoute);

  // Para redireccionar
  private router = inject(Router);

  constructor() {

    // Para obtener el id/parámetro de la ruta
    // Parsear el id a número
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Validación básica del id y enviarlo como parámetro al método obtenerTecnico
    if (!isNaN(id)) {
      this.obtenerTecnico(id);
    }
  }

  // Obtener técnico y actualizar la Signal
  obtenerTecnico(id: number) {
    this.tecnicoService.getById(id).subscribe((data: UsuarioModel) => {
      console.log(data);
      this.datos.set(data); // Actualiza la Signal
    });
  }

  // Para regresar a la vista de lista de técnicos
  goBack(): void {
    this.router.navigate(['/tecnico/']);
  }

}
