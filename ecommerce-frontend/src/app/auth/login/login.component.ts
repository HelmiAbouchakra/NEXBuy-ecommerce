import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showEmailForm = false;

  ngOnInit(): void {
    // Check if we have a registration success message
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as {
        registrationSuccess?: boolean;
        email?: string;
        message?: string;
      };

      if (state.registrationSuccess) {
        this.successMessage =
          state.message ||
          'Registration successful! Please login with your credentials.';

        // Pre-fill the email field
        if (state.email) {
          this.loginForm.patchValue({
            email: state.email,
          });
          this.showEmailForm = true;
        }
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  loginWithGoogle(): void {
    this.authService.getGoogleAuthUrl().subscribe({
      next: (response) => {
        console.log('Google redirect URL:', response.url);
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Google auth error:', error);
        this.errorMessage = 'Failed to connect with Google. Please try again.';
      },
    });
  }

  loginWithFacebook(): void {
    this.authService.getFacebookAuthUrl().subscribe({
      next: (response) => {
        console.log('Facebook redirect URL:', response.url);
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Facebook auth error:', error);
        this.errorMessage =
          'Failed to connect with Facebook. Please try again.';
      },
    });
  }
}
