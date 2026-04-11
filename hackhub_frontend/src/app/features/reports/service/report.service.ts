import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Report } from '../model/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/reports';

  reportTeam(payload: Report) {
    return this.http.post(this.apiUrl, payload);
  }
}