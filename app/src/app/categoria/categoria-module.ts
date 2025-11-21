import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriaRoutingModule } from './categoria-routing-module';

// Importar los módulos de Angular Material que se van a utilizar para el módulo Técnico
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoriaIndex } from './categoria-index/categoria-index';
import { CategoriaDetail } from './categoria-detail/categoria-detail';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoriaForm } from './categoria-form/categoria-form';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    CategoriaIndex,
    CategoriaDetail,
    CategoriaForm
  ],
  imports: [
    CommonModule,
    CategoriaRoutingModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule,
    MatDialogModule,
    MatRadioModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    TranslateModule,
    ReactiveFormsModule,

  ]
})
export class CategoriaModule { }