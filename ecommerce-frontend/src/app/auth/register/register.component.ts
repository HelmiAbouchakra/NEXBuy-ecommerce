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
  errorMessage = '';

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
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

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
        console.log('Registration Error:', error);

        if (error.error?.errors) {
          this.errorMessage = Object.entries(error.error.errors)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
