import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Clone the request with credentials enabled
    const authReq = request.clone({
      withCredentials: true,
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          // Status 0 usually indicates CORS error or network issue
          console.error('CORS or network error occurred:', error);
          // You could show a user-friendly message or trigger a specific action
        } else if (error.status === 401) {
          // Unauthorized - redirect to login
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
