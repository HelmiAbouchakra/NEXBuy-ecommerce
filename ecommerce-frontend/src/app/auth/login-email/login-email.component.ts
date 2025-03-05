import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { CustomButtonComponent } from '../../components/custom-button/custom-button.component';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { WrapperComponent } from '../../components/wrapper/wrapper.component';
import { AuthService } from '../../services/auth.service';

interface LoginRequest {
  email: string;
  password: string;
}

interface ApiError {
  status?: number;
  error?: any;
  message?: string;
  statusText?: string;
}

@Component({
  selector: 'app-login-email',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WrapperComponent,
    CustomInputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './login-email.component.html',
  styleUrls: ['./login-email.component.scss'],
})
export class LoginEmailComponent implements OnDestroy {
  email: string = '';
  password: string = '';
  isLoading = false;
  errorMessage = '';

  
  loginSuccess = false;
  successMessage = '';
  redirectCountdown = 3;

  private loginSubscription?: Subscription;
  private countdownSubscription?: Subscription;

  constructor(
    public router: Router,
    private authService: AuthService,
  ) {}

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.countdownSubscription?.unsubscribe();
  }

  isFormValid(): boolean {
    return !!this.email && !!this.password;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = {
      email: this.email,
      password: this.password,
    };

    this.loginSubscription = this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Show success state instead of immediate redirect
        this.loginSuccess = true;
        this.successMessage = 'Login successful! Redirecting to dashboard...';

        // Start countdown for redirect
        this.startRedirectCountdown();
      },
      error: (error: ApiError) => {
        this.isLoading = false;
        if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else if (error.error?.errors) {
          this.errorMessage = Object.entries(error.error.errors)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        } else {
          this.errorMessage = JSON.stringify(error, null, 2);
        }
      },
    });
  }

  startRedirectCountdown(): void {
    // Clean up existing subscription if any
    this.countdownSubscription?.unsubscribe();

    this.countdownSubscription = interval(1000)
      .pipe(take(3))
      .subscribe({
        next: () => {
          this.redirectCountdown--;
        },
        complete: () => {
          this.router.navigate(['/dashboard']);
        },
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
