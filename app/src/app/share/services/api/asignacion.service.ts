import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AsignacionModel } from '../../models/AsignacionModel';
import { BaseAPI } from './base-api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AsignacionService {
    private http = inject(HttpClient);
    private apiURL = environment.apiURL;
    private endpoint = environment.endpointAsignacion;

    // Método para auto asignar un ticket
    autoAsignarTicket(ticketId: number): Observable<any> {
        return this.http.post(`${this.apiURL}/${this.endpoint}/auto-asignar/${ticketId}`, {});
    }
}

