import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { SLAModel } from '../../models/SLAModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SLAService extends BaseAPI<SLAModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointSLA);
      }
}