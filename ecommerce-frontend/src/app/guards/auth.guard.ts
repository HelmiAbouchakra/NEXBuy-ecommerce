import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const currentPath = state.url;
    const publicRoutes = ['/login', '/register', '/auth/social-callback'];
    
    const isPublicRoute = publicRoutes.some(path => currentPath === path || currentPath.startsWith(path));
    
    if (isPublicRoute) {
      return of(true);
    }
    
    return this.authService.checkCurrentUser().pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
        
        if (route.data['requiresAdmin'] && user.role !== 'admin') {
          this.router.navigate(['/dashboard']);
          return false;
        }
        
        return true;
      })
    );
  }
}
