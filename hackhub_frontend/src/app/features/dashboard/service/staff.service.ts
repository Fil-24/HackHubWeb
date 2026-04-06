import { Injectable } from '@angular/core';
import { Staff } from '../models/staff.model';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  constructor(private http: HttpClient) { }
  private staffUrl = environment.apiUrl + '/accounts/staff';

  getStaff(): Observable<Staff[]> {
    return this.http.get<any[]>(`${this.staffUrl}`);

  }
}
