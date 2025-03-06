import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { WrapperComponent } from '../../components/wrapper/wrapper.component';
import { AuthService } from '../../services/auth.service';

// Interface for auth callback query parameters
export interface AuthCallbackParams {
  token?: string;
  error?: string;
  error_type?: string;
}

// Interface for component state
export interface CallbackState {
  message: string;
  errorOccurred: boolean;
  redirectCountdown: number;
}

@Component({
  selector: 'app-social-callback',
  standalone: true,
  imports: [CommonModule, WrapperComponent],
  templateUrl: './social-callback.component.html',
  styleUrls: ['./social-callback.component.scss'],
})
export class SocialCallbackComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Component state
  state: CallbackState = {
    message: 'Processing your authentication...',
    errorOccurred: false,
    redirectCountdown: 3
  };

  // Getters for template usage
  get message(): string { return this.state.message; }
  get errorOccurred(): boolean { return this.state.errorOccurred; }
  get redirectCountdown(): number { return this.state.redirectCountdown; }

  // Subscriptions to manage
  private countdownSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  ngOnInit(): void {
    this.handleAuthCallback();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.countdownSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  private handleAuthCallback(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      (params: AuthCallbackParams) => {
        const token = params.token;
        const error = params.error;
        const errorType = params.error_type || '';

        if (error) {
          this.handleError(errorType);
          return;
        }

        if (token) {
          this.handleSuccessfulAuth(token);
        } else {
          this.handleMissingToken();
        }
      }
    );
  }

  private handleError(errorType: string): void {
    this.state.errorOccurred = true;

    // Set appropriate error message based on error type
    switch (errorType) {
      case 'expired':
        this.state.message = 'Your authentication session has expired';
        break;
      case 'invalid':
        this.state.message = 'Invalid authentication credentials';
        break;
      case 'access_denied':
        this.state.message = 'You denied access to your account';
        break;
      default:
        this.state.message = 'Authentication failed';
    }

    this.startRedirectCountdown();
  }

  private handleSuccessfulAuth(token: string): void {
    this.state.message = 'Authentication successful! Retrieving your profile...';
    this.authService.handleSocialCallback(token);
    // No need to handle redirects here as the auth service will do it
  }

  private handleMissingToken(): void {
    this.state.errorOccurred = true;
    this.state.message =
      'No authentication token found. Redirecting back to login...';
    this.startRedirectCountdown();
  }

  startRedirectCountdown(): void {
    // Clean up existing subscription if any
    this.countdownSubscription?.unsubscribe();

    this.countdownSubscription = interval(1000)
      .pipe(take(3))
      .subscribe({
        next: () => {
          this.state.redirectCountdown--;
        },
        complete: () => {
          this.router.navigate(['/login']);
        },
      });
  }
}