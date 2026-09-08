import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  name = signal('');
  email = signal('');
  selectedRole = signal<UserRole | ''>('');
  isNameValid(): boolean {
    return this.name().trim().length >= 3;
  }
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email().trim());
  }
  isFormValid(): boolean {
    return (
      this.isNameValid() &&
      this.isEmailValid() &&
      !!this.selectedRole()
    );
  }
  handleLogin(): void {
    if (!this.isFormValid()) {
      return;
    }
    this.authService.login(
      this.name(),
      this.email(),
      this.selectedRole() as UserRole
    );
    this.router.navigate(['/dashboard']);
  }
}