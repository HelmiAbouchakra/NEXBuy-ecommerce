import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SocialCallbackGuard implements CanActivate {
  private router = inject(Router);
  private toastr = inject(ToastrService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if there are valid parameters in the URL
    const hasToken =
      !!route.queryParamMap.get('token') ||
      !!route.queryParamMap.get('access_token');
    const hasCode = !!route.queryParamMap.get('code');
    const hasError = !!route.queryParamMap.get('error');

    // Only allow access if the URL has at least one of these parameters
    const isValidAccess = hasToken || hasCode || hasError;

    if (!isValidAccess) {
      // Show a toast message explaining why they're being redirected
      const toastRef = this.toastr.warning(
        'This page is only accessible through social login flows',
        'Redirecting to login page',
        {
          timeOut: 3000,
          progressBar: true,
        }
      );

      setTimeout(() => {
        this.toastr.clear(toastRef.toastId);
        this.router.navigate(['/login']);
      }, 1500);

      return false;
    }

    return true;
  }
}
