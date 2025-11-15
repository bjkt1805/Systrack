import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule} from '@angular/common/http';
// import { HttpClient, HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { CoreModule } from './core/core-module';
import { ShareModule } from './share/share-module';
import { HomeModule } from './home/home-module';
import { UsuarioModule } from './usuario/usuario-module';
import { TecnicoModule } from './tecnico/tecnico-module';
import { CategoriaModule } from './categoria/categoria-module';
import { TicketModule } from './ticket/ticket-module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxSonnerToaster } from 'ngx-sonner'
import { HttpErrorInterceptorService } from './share/interceptor/http-error-interceptor.service';
import { AsignacionModule } from './asignacion/asignacion-module';
import { HttpAuthInterceptorService } from './share/interceptor/http-auth-interceptor.service';

// Importar modulos y servicios de traducción
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpLoader } from './translation-loader';

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    NgxSonnerToaster,
    CoreModule,
    ShareModule,
    HomeModule,
    UsuarioModule,
    TecnicoModule,
    CategoriaModule,
    TicketModule,
    AsignacionModule,
    AppRoutingModule,

    TranslateModule.forRoot({
      defaultLanguage: 'es', // cambiarlo a esp
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoader,
        deps: [HttpClient]
      }
    })

  ],

  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS, 
      useClass: HttpErrorInterceptorService,
      multi: true
    }, 
    { provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptorService,
      multi: true
    }
  ],

  // Desde dónde arranca la aplicación
  bootstrap: [App]
})
export class AppModule { }
