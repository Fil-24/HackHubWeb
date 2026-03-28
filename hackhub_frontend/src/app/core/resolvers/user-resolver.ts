import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account } from '../../features/account/models/account.model';
import { Resolve } from '@angular/router';
import { AuthService } from '../../features/auth/service/auth.service';

/*DA CAPIRE SE È UTILE*/
@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<Account> {
  constructor(private auth: AuthService) {}

  resolve(): Observable<Account> {
    return this.auth.loadUser$();
  }
}