import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Hackathon } from '../models/hackathon.model';
import { environment } from '../../../../environments/environment';
import { Rule } from '../models/rule.model';
import { HackathonCreate } from '../models/HackathonCreate.model';

@Injectable({ providedIn: 'root' })
export class HackathonService {
  private readonly BASE_URL = environment.apiUrl + '/hackathons';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Hackathon> {
    return this.http.get<Hackathon>(`${this.BASE_URL}/${id}`);
  }

  getAll(): Observable<Hackathon[]> {
    return this.http.get<Hackathon[]>(this.BASE_URL);
  }
  getMyHackathons(): Observable<Hackathon[]> {
    return this.http.get<Hackathon[]>(`${this.BASE_URL}/my`);
  }

  // AGGIORNATO: il backend usa POST /api/hackathons/{id}/teams
  register(id: number): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/${id}/teams`, {});
  }

  getRules(): Observable<Rule[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/rules`);
  }
    
  createHackathon(hackathonData: HackathonCreate): Observable<Hackathon> {
    return this.http.post<any>(this.BASE_URL, hackathonData);
  }

  updateHackathon(data: any): Observable<Hackathon> {
    return this.http.put<any>(this.BASE_URL, data);
  }

  // AGGIORNATO: il backend usa POST /api/hackathons/{id}/staff/mentors
  assignMentor(hackathonId: number, email: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/${hackathonId}/staff/mentors`, { email });
  }

  // AGGIORNATO: il backend usa DELETE /api/hackathons/{id}/staff/mentors/{idAccount}
  removeMentor(hackathonId: number, mentorId: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${hackathonId}/staff/mentors/${mentorId}`);
  }

  // AGGIORNATO: il backend prende l'ID dell'Hackathon, non l'ID del team! Usa DELETE /api/hackathons/{id}/teams
  unsubscribeTeam(hackathonId: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${hackathonId}/teams`);
  }

  // Corretti: il backend usa /api/hackathons/{id}/rules/{idRule}
  addRule(hackathonId: number, ruleId: number): Observable<Rule> {
    return this.http.post<Rule>(`${this.BASE_URL}/${hackathonId}/rules/${ruleId}`, {});
  }

  removeRule(hackathonId: number, ruleId: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${hackathonId}/rules/${ruleId}`);
  }

}