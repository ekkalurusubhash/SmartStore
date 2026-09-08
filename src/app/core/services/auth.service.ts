import { Injectable, signal } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly jwtHelper = new JwtHelperService();

  private readonly _currentUser = signal<User | null>(null);
  private readonly _isAuthenticated = signal(false);

  private readonly tokenKey = 'auth_token';

  readonly user$ = this._currentUser.asReadonly();
  readonly isAuthenticated$ = this._isAuthenticated.asReadonly();

  constructor() {
    this.restoreSession();
  }

  /**
   * Restore user session from JWT stored in localStorage
   */
  private restoreSession(): void {
    const token = localStorage.getItem(this.tokenKey);

    if (!token) {
      this.logout();
      return;
    }

    if (this.jwtHelper.isTokenExpired(token)) {
      this.logout();
      return;
    }

    try {
      const decoded = this.jwtHelper.decodeToken(token);

      const user: User = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        createdAt: new Date()
      };

      this._currentUser.set(user);
      this._isAuthenticated.set(true);

    } catch (error) {
      console.error('Invalid token', error);
      this.logout();
    }
  }

  /**
   * Store JWT and restore session
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.restoreSession();
  }

  /**
   * Mock Login (Replace with backend API later)
   */
  login(name: string, email: string, role: UserRole): void {

    const base64Url = (data: unknown): string =>
      btoa(JSON.stringify(data))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: crypto.randomUUID(),
      name,
      email,
      role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    const fakeToken =
      `${base64Url(header)}.${base64Url(payload)}.dummy-signature`;

    this.setToken(fakeToken);
  }

  logout(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);

    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this._currentUser();
  }

  hasRole(role: UserRole): boolean {
    return this._currentUser()?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isSalesperson(): boolean {
    return this.hasRole('sales');
  }
}