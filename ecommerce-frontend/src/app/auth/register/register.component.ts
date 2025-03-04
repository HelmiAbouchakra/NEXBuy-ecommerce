import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
  ],
  template: `
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required />
              <mat-error *ngIf="registerForm.get('name')?.hasError('required')"
                >Name is required</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required />
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')"
                >Email is required</mat-error
              >
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')"
                >Please enter a valid email</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="hidePassword ? 'password' : 'text'"
                required
              />
              <button
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
                type="button"
              >
                <mat-icon>{{
                  hidePassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('required')"
                >Password is required</mat-error
              >
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('minlength')"
                >Password must be at least 8 characters</mat-error
              >
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('pattern')"
              >
                Password must contain uppercase, lowercase, numbers, and symbols
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                formControlName="password_confirmation"
                [type]="hideConfirmPassword ? 'password' : 'text'"
                required
              />
              <button
                mat-icon-button
                matSuffix
                (click)="hideConfirmPassword = !hideConfirmPassword"
                type="button"
              >
                <mat-icon>{{
                  hideConfirmPassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              <mat-error
                *ngIf="
                  registerForm
                    .get('password_confirmation')
                    ?.hasError('required')
                "
                >Confirm password is required</mat-error
              >
              <mat-error *ngIf="registerForm.hasError('passwordMismatch')"
                >Passwords do not match</mat-error
              >
            </mat-form-field>

            <div class="image-upload">
              <button
                mat-stroked-button
                type="button"
                (click)="fileInput.click()"
              >
                <mat-icon>cloud_upload</mat-icon> Upload Profile Image
              </button>
              <input
                #fileInput
                type="file"
                accept="image/*"
                style="display: none"
                (change)="onFileSelected($event)"
              />
              <span *ngIf="selectedFile">{{ selectedFile.name }}</span>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
            >
              {{ isLoading ? 'Registering...' : 'Register' }}
            </button>
          </form>

          <div class="social-register">
            <p>Or sign up with:</p>
            <div class="social-buttons">
              <button
                mat-raised-button
                (click)="registerWithGoogle()"
                type="button"
              >
                <mat-icon>login</mat-icon> Google
              </button>
              <button
                mat-raised-button
                (click)="registerWithFacebook()"
                type="button"
              >
                <mat-icon>login</mat-icon> Facebook
              </button>
            </div>
          </div>

          <div class="login-link">
            <p>Already have an account? <a routerLink="/login">Login</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
      }

      mat-card {
        max-width: 500px;
        width: 100%;
        padding: 20px;
      }

      mat-form-field {
        width: 100%;
        margin-bottom: 16px;
      }

      .image-upload {
        margin: 16px 0;
      }

      .error-message {
        color: red;
        margin-bottom: 16px;
      }

      .social-register {
        margin-top: 24px;
        text-align: center;
      }

      .social-buttons {
        display: flex;
        justify-content: space-around;
        margin-top: 16px;
      }

      .login-link {
        margin-top: 24px;
        text-align: center;
      }
    `,
  ],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
          ),
        ],
      ],
      password_confirmation: ['', Validators.required],
      image: [null],
    },
    { validators: this.passwordMatchValidator }
  );

  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const passwordConfirmation = form.get('password_confirmation')?.value;

    if (password !== passwordConfirmation) {
      form.get('password_confirmation')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.registerForm.patchValue({ image: this.selectedFile });
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Create registration request object
    const registrationData = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      password_confirmation: this.registerForm.get('password_confirmation')?.value,
      image: this.selectedFile || undefined
    };

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Store the email in the router state to potentially pre-fill the login form
        this.router.navigate(['/login'], {
          state: {
            registrationSuccess: true,
            email: registrationData.email,
            message: 'Registration successful! Please login with your credentials.'
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error.errors) {
          // Format validation errors
          const errors = error.error.errors;
          this.errorMessage = Object.keys(errors)
            .map(key => `${key}: ${errors[key].join(', ')}`)
            .join('\n');
        } else {
          this.errorMessage = error.error.message || 'Registration failed';
        }
      }
    });
  }

  registerWithGoogle(): void {
    this.authService.getGoogleAuthUrl().subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (error) => {
        this.errorMessage = 'Failed to connect with Google';
      },
    });
  }

  registerWithFacebook(): void {
    this.authService.getFacebookAuthUrl().subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (error) => {
        this.errorMessage = 'Failed to connect with Facebook';
      },
    });
  }
}
