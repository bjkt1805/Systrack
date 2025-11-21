import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsuarioRoutingModule } from './usuario-routing-module';
import { UsuarioLogin } from './usuario-login/usuario-login';
import { UsuarioRegister } from './usuario-register/usuario-register';


@NgModule({
  declarations: [
    UsuarioLogin, 
    UsuarioRegister
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
    UsuarioRoutingModule
  ]
})
export class UsuarioModule { }
