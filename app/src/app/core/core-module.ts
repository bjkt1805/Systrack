import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { RouterModule } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button'; 
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatMenuModule} from '@angular/material/menu'; 
import {MatBadgeModule} from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [Header, Footer],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    TranslateModule
  ],
  exports: [Header, Footer],
})
export class CoreModule { }