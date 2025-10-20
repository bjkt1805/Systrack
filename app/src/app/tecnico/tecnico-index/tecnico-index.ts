import { Component, signal } from '@angular/core';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tecnico-index',
  standalone: false,
  templateUrl: './tecnico-index.html',
  styleUrl: './tecnico-index.css'
})

// Exportar clase para listar técnicos
export class TecnicoIndex {
  // Signal - Respuesta del API
  datos = signal<UsuarioModel[]>([]);

  constructor(private tecnicoService: TecnicoService,
              private router: Router
  ) {
    // Llamar al método para listar técnicos al inicializar el componente
    this.listTecnicos();
   }

  // Listar todos los técnicos del API
  listTecnicos() {
    this.tecnicoService.get().subscribe((respuesta: UsuarioModel[]) => {
      console.log("Lista de técnicos: ", respuesta);
      this.datos.set(respuesta);
    });
  }

  // Navegar al detalle de un técnico
  detalle(id: number) {
    this.router.navigate(['/tecnico', id]);
  }
}
