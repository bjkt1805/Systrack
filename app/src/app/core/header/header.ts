import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  constructor(private router: Router) {}
  // Para regresar a la vista de inicio
  irInicio(): void {
    this.router.navigate(['/']);
  }
}
