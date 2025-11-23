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

    // Intentar obtener el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') as 'en' | 'es';

    // Si existe un idioma guardado y es válido, usarlo
    // Si no, usar el idioma por defecto (español)
    if (savedLanguage && ['es', 'en'].includes(savedLanguage)) {
      translate.use(savedLanguage);
    } else {
      translate.use('es');
    }
  }

  cambiarIdioma(lang: 'en' | 'es'): void {
    // Cambia el idioma activo de la aplicación
    this.translate.use(lang);

    // Guarda la preferencia del idioma en localStorage del navegador
    // Esto permite recordar la preferencia del usuario entre sesiones
    localStorage.setItem('selectedLanguage', lang);
  }
}
