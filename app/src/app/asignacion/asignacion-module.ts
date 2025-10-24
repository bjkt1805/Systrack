import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsignacionRoutingModule } from './asignacion-routing-module';
import { AsignacionIndex } from './asignacion-index/asignacion-index';
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    AsignacionIndex
  ],
  imports: [
    CommonModule,
    AsignacionRoutingModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
]
})
export class AsignacionModule { }
