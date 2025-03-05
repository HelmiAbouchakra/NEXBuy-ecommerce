import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
// import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import {
  BehaviorSubject,
  Observable,
  catchError,
  of,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SocialAuthRedirect,
  User,
} from '../models/user.module';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  // private cookieService = inject(CookieService);
  private toastr = inject(ToastrService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = environment.apiUrl;

  constructor() {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('password_confirmation', userData.password_confirmation);

    if (userData.image) {
      formData.append('image', userData.image);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, formData, {
      withCredentials: true,
    });
  }

  logout(): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/logout`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    if (this.currentUserSubject.value) {
      return new Observable<User>((observer) => {
        observer.next(this.currentUserSubject.value as User);
        observer.complete();
      });
    }

    const headers: any = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return this.http
      .get<User>(`${this.apiUrl}/me`, {
        headers,
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
        })
      );
  }

  checkCurrentUser(): Observable<User | null> {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }
    const headers: any = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return this.http
      .get<User>(`${this.apiUrl}/me`, {
        headers,
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
        catchError((error) => {
          return of(null);
        })
      );
  }

  getGoogleAuthUrl(): Observable<SocialAuthRedirect> {
    return this.http.get<SocialAuthRedirect>(environment.googleAuthUrl);
  }

  getFacebookAuthUrl(): Observable<SocialAuthRedirect> {
    return this.http.get<SocialAuthRedirect>(environment.facebookAuthUrl);
  }

  private authToken: string | null = null;
  handleSocialCallback(token: string): void {
    this.authToken = token;
    
    this.http
      .get<User>(`${this.apiUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          // Navigate directly to dashboard on success
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: () => {
          // Clear token and redirect on error
          this.authToken = null;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
      });
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
