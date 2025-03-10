import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WrapperComponent } from '../../components/wrapper/wrapper.component';
import { AuthService } from '../../services/auth.service';

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    WrapperComponent,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  errorMessage = '';

  loginWithGoogle(): void {
    this.authService.getGoogleAuthUrl().subscribe({
      next: (response) => {
        // console.log('Google redirect URL:', response.url);
        window.location.href = response.url;
      },
      error: (error: AuthError) => {
        // console.error('Google auth error:', error);
        // this.errorMessage = error.message || 'Failed to connect with Google. Please try again.';
        this.toastr.error(error.message || 'Failed to connect with Google. Please try again.');
      },
    });
  }

  loginWithFacebook(): void {
    this.authService.getFacebookAuthUrl().subscribe({
      next: (response) => {
        // console.log('Facebook redirect URL:', response.url);
        window.location.href = response.url;
      },
      error: (error: AuthError) => {
        // console.error('Facebook auth error:', error);
        // this.errorMessage = error.message || 'Failed to connect with Facebook. Please try again.';
        this.toastr.error(error.message || 'Failed to connect with Facebook. Please try again.');
      },
    });
  }

  continueWithEmail(): void {
    this.router.navigate(['/login-email']);
  }
}