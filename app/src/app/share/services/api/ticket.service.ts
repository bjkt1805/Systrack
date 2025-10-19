import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { TicketModel } from '../../models/TicketModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TicketService extends BaseAPI<TicketModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointTicket);
      }
}