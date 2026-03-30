import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Hackathon } from '../models/hackathon.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private apiUrl = environment.apiUrl + '/hackathons';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Hackathon[]> {
    return this.http.get<Hackathon[]>(this.apiUrl);
  }

  cerca(query: string): Observable<Hackathon[]> {
    return this.http.get<Hackathon[]>(`${this.apiUrl}?q=${query}`);
  }
}