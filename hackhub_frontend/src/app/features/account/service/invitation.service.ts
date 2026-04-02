import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Invitation } from '../models/invitation.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {

  private apiUrl = environment.apiUrl + '/invitations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(this.apiUrl+'/user');
  }

  acceptInvitation(idInvitation: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idInvitation}/response?accept=true`, {});
  }

  rejectInvitation(idInvitation: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idInvitation}/response?accept=false`, {});
  }

}