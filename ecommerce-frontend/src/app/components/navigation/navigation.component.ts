import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-button routerLink="/dashboard">
        <span class="brand-name">E-Commerce</span>
      </button>

      <span class="spacer"></span>

      <button mat-button routerLink="/products">Products</button>

      <button mat-icon-button routerLink="/cart" aria-label="Shopping cart">
        <mat-icon matBadge="0" matBadgeColor="accent">shopping_cart</mat-icon>
      </button>

      <ng-container *ngIf="authService.currentUser$ | async as user">
        <button mat-button [matMenuTriggerFor]="userMenu">
          <span class="user-name">{{ user.name }}</span>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>account_circle</mat-icon>
            <span>Profile</span>
          </button>

          <button mat-menu-item routerLink="/orders">
            <mat-icon>receipt</mat-icon>
            <span>Orders</span>
          </button>

          <ng-container *ngIf="user.role === 'admin'">
            <button mat-menu-item routerLink="/admin">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Admin Panel</span>
            </button>
          </ng-container>

          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }

      .brand-name {
        font-size: 1.2rem;
        font-weight: 500;
      }

      .user-name {
        margin-right: 8px;
      }
    `,
  ],
})
export class NavigationComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout().subscribe();
  }
}
