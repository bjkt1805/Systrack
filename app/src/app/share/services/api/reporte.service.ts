import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ReporteService  {

  urlAPI: string = environment.apiURL;

  constructor(private http: HttpClient) {}

  getVideojuegosbyGenero(): Observable<any> {
    return this.http.get<any>(this.urlAPI+'/reporte/vj-genero/');
  }
  getVideojuegosbyMes(): Observable<any> {
    return this.http.get<any>(this.urlAPI+'/reporte/vj-mes');
  }
  getVentasbyMes(mes:number): Observable<any> {
    return this.http.get<any>(this.urlAPI+'/reporte/ventas-mes/'+mes);
  }
}