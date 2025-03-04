import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
export class LoginEmailComponent {
  email: string = '';
  password: string = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    public router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

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

    this.authService.login(loginData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Welcome back!', 'Login Successful');
        this.router.navigate(['/dashboard']);
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

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
