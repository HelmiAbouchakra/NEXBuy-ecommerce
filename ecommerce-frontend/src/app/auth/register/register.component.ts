import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomButtonComponent } from '../../components/custom-button/custom-button.component';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';
import { WrapperComponent } from '../../components/wrapper/wrapper.component';
import { AuthService } from '../../services/auth.service';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  image?: File;
}

interface ApiError {
  error?: {
    errors?: Record<string, string[]>;
    message?: string;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WrapperComponent,
    CustomInputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  password_confirmation: string = '';
  selectedFile: File | null = null;
  isLoading = false;

  constructor(
    public router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  // Basic frontend validation for form completion
  // Used for enabling/disabling the submit button
  isFormValid(): boolean {
    return (
      !!this.name &&
      !!this.email &&
      !!this.password &&
      !!this.password_confirmation &&
      this.password === this.password_confirmation
    );
  }

  onSubmit(): void {
    // Minimal frontend validation - just check for password match
    // before sending to the server
    if (this.password !== this.password_confirmation) {
      this.toastr.error('Passwords do not match', 'Validation Error');
      return;
    }

    this.isLoading = true;

    const registrationData: RegisterRequest = {
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.password_confirmation,
      image: this.selectedFile || undefined,
    };

    this.authService.register(registrationData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Account created successfully!', 'Success');
        this.router.navigate(['/dashboard']);
      },
      error: (error: ApiError) => {
        this.isLoading = false;
        
        if (error.error?.errors) {
          // Show individual toastr for each validation error from backend
          Object.entries(error.error.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              // Laravel typically returns arrays of error messages per field
              messages.forEach(message => {
                this.toastr.error(`${field}: ${message}`, 'Validation Error');
              });
            } else {
              this.toastr.error(`${field}: ${messages}`, 'Validation Error');
            }
          });
        } else if (error.error?.message) {
          this.toastr.error(error.error.message, 'Registration Failed');
        } else if (typeof error.error === 'string') {
          this.toastr.error(error.error, 'Registration Failed');
        } else {
          this.toastr.error('Registration failed. Please try again.', 'Error');
        }
      },
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}