import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1 class="welcome-message">
        Welcome back, {{ (authService.currentUser$ | async)?.name }}!
      </h1>

      <div class="dashboard-grid">
        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Browse Products</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Explore our wide range of products.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/products">
              Shop Now
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Your Orders</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Track and manage your orders.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/orders">
              View Orders
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Shopping Cart</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>View items in your shopping cart.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/cart">
              Go to Cart
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card
          class="dashboard-card"
          *ngIf="(authService.currentUser$ | async)?.role === 'admin'"
        >
          <mat-card-header>
            <mat-card-title>Admin Panel</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Manage your e-commerce store.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/admin">
              Admin Dashboard
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 24px;
      }

      .welcome-message {
        margin-bottom: 24px;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }

      .dashboard-card {
        height: 100%;
      }
    `,
  ],
})
export class DashboardComponent {
  authService = inject(AuthService);
}
