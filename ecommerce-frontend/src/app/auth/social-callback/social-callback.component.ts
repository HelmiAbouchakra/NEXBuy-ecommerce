import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
// import { WrapperComponent } from '../../components/wrapper/wrapper.component';

@Component({
  selector: 'app-social-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-callback.component.html',
  styleUrls: ['./social-callback.component.scss'],
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
        this.message = 'Authentication failed';
        setTimeout(() => this.router.navigate(['/login']), 2000);
        return;
      }

      if (token) {
        this.message = 'Authentication successful! Retrieving your profile...';
        this.authService.handleSocialCallback(token);
      } else {
        this.message =
          'No authentication token found. Redirecting back to login...';
      }
    });
  }
}
