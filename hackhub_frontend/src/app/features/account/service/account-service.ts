import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { Account } from '../models/account.model';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private baseUrl = environment.apiUrl + '/accounts';
  private userSignal = signal<Account | null>(null);
  private tokenKey = 'authToken';

  user = this.userSignal.asReadonly();

    constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.tokenKey);
  }
 //----------------update profile----------------
 
  updateProfile(updateData: Partial<Account>): Observable<Account> {
    // Fai attenzione all'endpoint: qui ho usato `${this.baseUrl}/me` (es. PUT /auth/me). 
    // Se il tuo backend ha un URL diverso per l'update (es. /auth/update), cambialo qui.
    return this.http.put<Account>(`${this.baseUrl}/profile`, updateData).pipe(
      tap((updatedUser: Account) => {
        // Aggiorniamo il signal locale con i nuovi dati validati e restituiti dal server
        this.userSignal.set(updatedUser);
      })
    );
  }

}
