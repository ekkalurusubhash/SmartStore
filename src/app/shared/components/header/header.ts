import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '../../../core/services/layout-service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {

  private readonly layoutService = inject(LayoutService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly notificationService = inject(NotificationService);

  readonly currentUser = this.authService.user$;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly notifications = this.notificationService.notifications$;
  isCollapsed = computed(() => this.layoutService.isSidebarCollapsed());
  showNotifications = false;
  ngOnInit(): void {
    console.log("notifications ", this.notifications());
  }
  toggleCollapse(): void {
    this.layoutService.toggleSidebar();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
