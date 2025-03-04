export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  provider?: string;
}

export interface AuthResponse {
  user: User;
  message: string;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  image?: File;
}

export interface SocialAuthRedirect {
  url: string;
}
