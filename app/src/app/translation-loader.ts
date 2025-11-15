import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Función para cargar archivos de traducción
export function HttpLoader(http: HttpClient): TranslateLoader {
return new TranslateHttpLoader(http, './assets/i18n/', '.json');}