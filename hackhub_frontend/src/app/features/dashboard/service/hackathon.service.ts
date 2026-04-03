import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// TODO: rimuovere commento e import sottostante quando il backend avrà dati reali
// import { Observable } from 'rxjs';
import { Observable, of } from 'rxjs';

import { Hackathon } from '../models/hackathon.model';


@Injectable({ providedIn: 'root' })
export class HackathonService {
  private readonly BASE_URL = '/api/hackathons';

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<Hackathon> {
    // TODO: rimuovere il mock quando il backend avrà dati reali
    const mock: Hackathon = {
      id: 1,
      name: 'AI Innovation Hackathon 2025',
      location: 'Milano, Talent Garden Calabiana',
      prize: 5000,
      maxTeamMembers: 5,
      maxNumberTeams: 48,
      startDate: '2025-03-14T09:00:00',
      endDate: '2026-12-16T18:00:00',
      status: 'OPEN',
      teams: [],
      staff: null as any,
      rules: []
    };
    return of(mock);
 
    // return this.http.get<Hackathon>(`${this.BASE_URL}/${id}`);
  }

  register(id: string): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/${id}/register`, {});
  }
}