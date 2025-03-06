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
import { ToastrService } from 'ngx-toastr';

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
  loginSuccess = false;
  redirectCountdown = 3;

  private loginSubscription?: Subscription;
  private countdownSubscription?: Subscription;

  constructor(
    public router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.countdownSubscription?.unsubscribe();
  }

  // Simple validation for form state (button enabling/disabling)
  isFormValid(): boolean {
    return !!this.email && !!this.password;
  }

  // Validation with feedback - only called on submit
  validateFormWithFeedback(): boolean {
    if (!this.email) {
      this.toastr.error('Email is required', 'Validation Error');
      return false;
    }

    if (!this.validateEmail(this.email)) {
      this.toastr.error('Please enter a valid email address', 'Validation Error');
      return false;
    }

    if (!this.password) {
      this.toastr.error('Password is required', 'Validation Error');
      return false;
    }
    return true;
  }

  onSubmit(): void {
    // Validate with toastr notifications on submit
    if (!this.validateFormWithFeedback()) {
      return;
    }

    this.isLoading = true;

    const loginData: LoginRequest = {
      email: this.email,
      password: this.password,
    };

    this.loginSubscription = this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loginSuccess = true;
        this.toastr.success('Login successful! Redirecting to dashboard...');
        this.startRedirectCountdown();
      },

      error: (error: ApiError) => {
        this.isLoading = false;
        
        if (typeof error.error === 'string') {
          this.toastr.error(error.error, 'Login Failed');
        } else if (error.error?.message) {
          this.toastr.error(error.error.message, 'Login Failed');
        } else if (error.error?.error) {
          this.toastr.error(error.error.error, 'Login Failed');
        } else if (error.message) {
          this.toastr.error(error.message, 'Login Failed');
        } else if (error.error?.errors) {
          Object.entries(error.error.errors).forEach(([field, message]) => {
            this.toastr.error(`${field}: ${message}`, 'Validation Error');
          });
        } else {
          this.toastr.error('Login failed. Please try again.', 'Error');
        }
      },
    });
  }

  startRedirectCountdown(): void {
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

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}