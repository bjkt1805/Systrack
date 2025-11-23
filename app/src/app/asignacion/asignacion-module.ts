import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsignacionRoutingModule } from './asignacion-routing-module';
import { AsignacionIndex } from './asignacion-index/asignacion-index';
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from "@angular/material/chips";
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    AsignacionIndex
  ],
  imports: [
    CommonModule,
    AsignacionRoutingModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    TranslateModule
]
})
export class AsignacionModule { }
