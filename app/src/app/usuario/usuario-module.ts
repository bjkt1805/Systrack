import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioRoutingModule } from './usuario-routing-module';
import { UsuarioLogin } from './usuario-login/usuario-login';
import { UsuarioRegister } from './usuario-register/usuario-register';
import { TranslateModule } from '@ngx-translate/core';
import { UsuarioEdit } from './usuario-edit/usuario-edit';
import {UsuarioResetPassword} from './usuario-reset-password/usuario-reset-password';
import { UsuarioIndex } from './usuario-index/usuario-index';


@NgModule({
  declarations: [
    UsuarioLogin, 
    UsuarioRegister, 
    UsuarioEdit, 
    UsuarioResetPassword, 
    UsuarioIndex
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    UsuarioRoutingModule,
    TranslateModule
  ]
})
export class UsuarioModule { }
