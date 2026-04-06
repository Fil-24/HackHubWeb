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

  //TODO: Unire API di accettazione e rifiuto, passando accept come parametro booleano
  respond(id: number, accept: boolean) {
      return this.http.patch(`${this.apiUrl}/${id}/response?accept=${accept}`, {});
    }

  invite(email: string) {
    return this.http.post(this.apiUrl, { email });
  }
}