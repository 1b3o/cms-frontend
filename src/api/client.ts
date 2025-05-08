// src/api/client.ts
import axios, { AxiosInstance } from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RefreshTokenRequest, 
  RegisterRequest, 
  User, 
  UpdateUserRequest,
  ChangePasswordRequest
} from '../types';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Auth-Token zu Requests hinzufügen
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  // Auth-Methoden
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    this.saveTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // No need to convert, already using consistent naming
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    this.saveTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await this.client.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken
    });
    
    this.saveTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await this.client.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    this.clearTokens();
  }

  // User-Methoden
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/users/me');
    return response.data;
  }

  async updateUser(data: UpdateUserRequest): Promise<User> {
    // No need to convert, already using consistent naming
    const response = await this.client.patch<User>('/users/me', data);
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.client.patch('/users/me/password', data);
  }

  // Helper-Methoden
  private saveTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }
}

// Singleton-Instanz erstellen
export const api = new ApiClient();