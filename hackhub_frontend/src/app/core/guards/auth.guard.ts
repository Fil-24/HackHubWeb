import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../features/auth/service/auth.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Determines whether the user is allowed to access the route.
   *
   * Logic flow:
   * 1. Check if a token exists 
   * 2. If the currentUser is already loaded → allow access
   * 3. Otherwise, attempt to load the user from the server
   */
  canActivate(): Observable<boolean> {

    if (!this.auth.getToken()) {
      this.router.navigate(['/login']);
      return of(false);
    }

    if (this.auth.currentUser) {
      return of(true);
    }

    return this.auth.loadUser$().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}