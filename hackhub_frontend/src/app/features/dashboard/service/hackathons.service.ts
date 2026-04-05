import { Injectable } from '@angular/core';
import { Hackathon } from '../models/hackathon.model';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HackathonsService {
  
  private apiUrl = environment.apiUrl + '/hackathons';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Hackathon[]> {
    return this.http.get<Hackathon[]>(this.apiUrl);

  }
}
