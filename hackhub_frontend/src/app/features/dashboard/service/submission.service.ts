import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluationPayload, SubmissionResponse, SubmitProjectPayload } from '../models/submission.model';
import { Team } from '../../teams/model/team.model';
 

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/submissions'; // Modifica con la tua base URL

  submitProject(payload: SubmitProjectPayload): Observable<string> {
    // Il backend restituisce una stringa, usiamo responseType: 'text'
    return this.http.post(this.apiUrl, payload, { responseType: 'text' });
  }

  updateSubmission(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}`, {}, { responseType: 'text' });
  }

  getSubmissionForStaff(id: number): Observable<SubmissionResponse> {
    return this.http.get<SubmissionResponse>(`${this.apiUrl}/${id}/staff`);
  }

  getSubmissionForTeam(id: number): Observable<SubmissionResponse> {
    return this.http.get<SubmissionResponse>(`${this.apiUrl}/${id}/team`);
  }

  evaluateSubmission(id: number, payload: EvaluationPayload): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/evaluation`, payload, { responseType: 'text' });
  }

  getWinner(idHackathon: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/winner/hackathons/${idHackathon}`);
  }

}