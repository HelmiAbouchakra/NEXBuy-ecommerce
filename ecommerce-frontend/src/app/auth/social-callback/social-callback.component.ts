import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-social-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './social-callback.component.html',
  styleUrls: ['./social-callback.component.scss']
})
export class SocialCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  message = 'Processing your authentication...';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const error = params['error'];
      if (error) {
        this.message = 'Authentication failed: ' + error;
        setTimeout(() => this.router.navigate(['/login']), 3000);
        return;
      }

      if (token) {
        this.message = 'Authentication successful! Retrieving your profile...';
        this.authService.handleSocialCallback(token);

        // Don't navigate here - let the auth service handle navigation
        // This avoids race conditions
      } else {
        this.message =
          'No authentication token found. Redirecting back to login...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      }
    });
  }
}
