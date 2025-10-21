import { Component, inject, signal, ViewChild } from '@angular/core';
import {  MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
// import { TicketDiag } from '../ticket-diag/ticket-diag';
import { CategoriaService } from '../../share/services/api/categoria.service';
//import { CategoriaDiag } from '../categoria-diag/categoria-diag';
  
@Component({
  selector: 'app-categoria-index',
  standalone: false,
  templateUrl: './categoria-index.html',
  styleUrl: './categoria-index.css',
})
export class CategoriaIndex {
  // Signal
  //Respuesta del API
  datos = signal<CategoriaModel[]>([]);

  constructor(private vjService: CategoriaService,
    private router:Router
  ){
    this.listCategorias()
  }

  // Listar todos los categorias del API
  listCategorias() {
    this.vjService.get().subscribe((respuesta: CategoriaModel[]) => {
      console.log(respuesta);
      this.datos.set(respuesta);
    });
  }
  // Navegar al detalle de una categoria
  detalle(id: number) {
    this.router.navigate(['/categoria', id]);
  }
}