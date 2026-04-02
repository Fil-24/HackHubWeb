import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Hackathon } from '../../home/models/hackathon.model';


@Injectable({ providedIn: 'root' })
export class HackathonService {
  private readonly BASE_URL = '/api/hackathons';

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<Hackathon> {
    return this.http.get<Hackathon>(`${this.BASE_URL}/${id}`);
  }

  register(id: string): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/${id}/register`, {});
  }
}