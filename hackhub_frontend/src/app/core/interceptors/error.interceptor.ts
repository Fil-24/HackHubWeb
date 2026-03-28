import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Unknown error';

        if (error.error instanceof ErrorEvent) {
          // Client error
          errorMessage = `${error.error.message}!`;
        } else if (typeof error.error === 'string') {
          // Server errore as string
          errorMessage = `${error.error}`;
        } else if (error.error && error.error.message) {
          // Server errore as JSON {status, message}
          errorMessage = `${error.error.message}!`;
        } else {
          // General Fallback with only status code
          errorMessage = `Server error: code ${error.status}`;
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}