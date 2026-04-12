import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ReportRequest } from '../model/reportRequest.model';
import { Observable } from 'rxjs';
import { Report } from '../model/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/reports';

  reportTeam(payload: ReportRequest) {
    return this.http.post(this.apiUrl, payload);
  }

  reportManagement(idHackathon: number, idTeam: number, disabled: boolean) {
    return this.http.patch(
      `${this.apiUrl}/management/hackathons/${idHackathon}/teams/${idTeam}?disabled=${disabled}`,
      {}
    );
  }

  getReportsByTeam(idHackathon: number, idTeam: number): Observable<Report[]> {
    return this.http.get<Report[]>(
      `${this.apiUrl}/hackathons/${idHackathon}/teams/${idTeam}`
    );
  }
}