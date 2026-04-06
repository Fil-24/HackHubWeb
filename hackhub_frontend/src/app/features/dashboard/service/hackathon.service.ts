import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable} from 'rxjs';

import { Hackathon } from '../models/hackathon.model';
import { Rule } from '../models/rule.model';
import { HackathonCreate } from '../models/HackathonCreate.model';


@Injectable({ providedIn: 'root' })
export class HackathonService {
  private readonly BASE_URL = '/api/hackathons';

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<Hackathon> {
    return this.http.get<Hackathon>(`${this.BASE_URL}/${id}`);
  }
  getAll(): Observable<Hackathon[]> {
    return this.http.get<Hackathon[]>(this.BASE_URL);

  }


  register(id: string): Observable<void> {
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
}