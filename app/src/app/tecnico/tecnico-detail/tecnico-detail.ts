import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { ValoracionService } from '../../share/services/api/valoracion.service';

@Component({
  selector: 'app-tecnico-detail',
  standalone: false,
  templateUrl: './tecnico-detail.html',
  styleUrls: ['./tecnico-detail.css']
})
export class TecnicoDetail {

  // Signal para almacenar los datos del técnico
  datos = signal<UsuarioModel | null>(null);

  // Signals para el promedio de valoración
  promedioValoracion = signal<number>(0);
  totalValoraciones = signal<number>(0);
  cargandoValoracion = signal<boolean>(false);

  // Inyectar servicio para llamar al detalle del técnico
  private tecnicoService = inject(TecnicoService);

  // Inyectar servicio de valoraciones
  private ValoracionService = inject(ValoracionService);

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
      this.obtenerPromedioValoracion(id);// Obtener el promedio de valoración del técnico
    }
  }

  // Obtener técnico y actualizar la Signal
  obtenerTecnico(id: number) {
    this.tecnicoService.getById(id).subscribe((data: UsuarioModel) => {
      console.log(data);
      this.datos.set(data); // Actualiza la Signal
    });
  }

    // Obtener promedio de valoración del técnico
  obtenerPromedioValoracion(tecnicoId: number) {
    this.cargandoValoracion.set(true);
    this.ValoracionService.getPromedioByTecnico(tecnicoId).subscribe({
      next: (data) => {
        console.log('[TECNICO DETAIL] Promedio valoración:', data);
        this.promedioValoracion.set(data.promedio);
        this.totalValoraciones.set(data.totalValoraciones);
        this.cargandoValoracion.set(false);
      },
      error: (error) => {
        console.error('[TECNICO DETAIL] Error obteniendo promedio:', error);
        this.cargandoValoracion.set(false);
        // Mantener valores en 0 si hay error
        this.promedioValoracion.set(0);
        this.totalValoraciones.set(0);
      }
    });
  }

  // Obtener array de estrellas para mostrar el rating
  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  // Para regresar a la vista de lista de técnicos
  goBack(): void {
    this.router.navigate(['/tecnico/']);
  }

}
