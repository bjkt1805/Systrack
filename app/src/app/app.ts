import { Component, signal } from '@angular/core';

// Importar el servicio de Traducción (TranslationService)
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');

  // Método constructor para utilizar servicio de traducción
  constructor(private translate: TranslateService) {
    
    // Idiomas soportados (Español e Inglés)
    translate.addLangs(['es', 'en']);

    // Idioma por defecto (Español)
    translate.setDefaultLang('en'); // Cambiarlo a esp

    // Usar idioma por defecto al inicio
    translate.use('en'); // Cambiarlo a esp
  }

  cambiarIdioma(lang: 'en' | 'es') {
    this.translate.use(lang);
  }
}
