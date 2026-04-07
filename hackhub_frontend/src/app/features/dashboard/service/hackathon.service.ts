import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable} from 'rxjs';

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


  register(id: number): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/${id}/register`, {});
  }

  getRules(): Observable<Rule[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/rules`);
  }
    
  createHackathon(hackathonData: HackathonCreate): Observable<Hackathon> {
    return this.http.post<any>(this.BASE_URL, hackathonData);
  }
  updateHackathon(id: number, data: HackathonCreate): Observable<Hackathon> {
      return this.http.put<any>(`${this.BASE_URL}/${id}`, data);
    }

// --- METODI DA AGGIUNGERE AL TUO HACKATHON SERVICE ---

  assignMentor(hackathonId: number, email: string): Observable<any> {
    // Sostituisci l'URL con quello corretto del tuo backend
    return this.http.post<any>(`${this.BASE_URL}/${hackathonId}/mentors`, { email });
  }

  removeMentor(hackathonId: number, mentorId: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/${hackathonId}/mentors/${mentorId}`);
  }

  unsubscribeTeam(teamId: number): Observable<void> {
    // Sostituisci con l'endpoint corretto per disiscrivere un team
    return this.http.delete<void>(`${this.BASE_URL}/teams/${teamId}/unsubscribe`);
  }

  addRule(hackathonId: number, ruleId: number): Observable<Rule> {
    return this.http.post<Rule>(`${this.BASE_URL}/${hackathonId}/rules/${ruleId}`, {});
  }

  removeRule(hackathonId: number, ruleId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${hackathonId}/rules/${ruleId}`);
  }


}