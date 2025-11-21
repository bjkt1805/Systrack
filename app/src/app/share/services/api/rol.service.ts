import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { RolModel } from '../../models/RolModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RolService extends BaseAPI<RolModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointRol);
      }
}