import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { SocialCallbackGuard } from './guards/social-callback.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'login-email',
    loadComponent: () =>
      import('./auth/login-email/login-email.component').then(
        (m) => m.LoginEmailComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'auth/social-callback',
    loadComponent: () =>
      import('./auth/social-callback/social-callback.component').then(
        (m) => m.SocialCallbackComponent
      ),
    canActivate: [SocialCallbackGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'products',
  //   loadComponent: () =>
  //     import('./pages/products/product-list/product-list.component').then(
  //       (m) => m.ProductListComponent
  //     ),
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'products/:id',
  //   loadComponent: () =>
  //     import('./pages/products/product-detail/product-detail.component').then(
  //       (m) => m.ProductDetailComponent
  //     ),
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'cart',
  //   loadComponent: () =>
  //     import('./pages/cart/cart.component').then((m) => m.CartComponent),
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'admin',
  //   loadChildren: () =>
  //     import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  //   canActivate: [AuthGuard],
  //   data: { requiresAdmin: true },
  // },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
