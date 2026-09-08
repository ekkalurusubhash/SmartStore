import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { LayoutService } from '../../../core/services/layout-service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';

interface MenuItem {
  routeLink: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly layoutService = inject(LayoutService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  currentYear = new Date().getFullYear();
  appVersion = '1.0.0';
  isCollapsed = computed(() => this.layoutService.isSidebarCollapsed());
  isAdmin = computed(() => this.authService.isAdmin());
  currentUser = this.authService.user$;
  lowStockCount = this.productService.lowStockCount;

  allItems: MenuItem[] = [
    {
      routeLink: 'dashboard',
      icon: 'fas fa-th-large',
      label: 'Dashboard',
    },
    {
      routeLink: 'inventory',
      icon: 'fas fa-cube',
      label: 'Inventory',
      adminOnly: true,
    },
    {
      routeLink: 'sales',
      icon: 'fas fa-shopping-cart',
      label: 'Sales',
    },
    {
      routeLink: 'employees',
      icon: 'fas fa-users',
      label: 'Employees',
      adminOnly: true,
    },
    {
      routeLink: 'analytics',
      icon: 'fas fa-sync-alt',
      label: 'Reorder',
    },
  ];

  items = computed(() => {
    const filtered = this.allItems.filter(item => !item.adminOnly || this.isAdmin());
    // Add badge for inventory with low stock count
    return filtered.map(item => ({
      ...item,
      badge: item.label === 'Inventory' ? this.lowStockCount() : undefined
    }));
  });


  toggleCollapse(): void {
    this.layoutService.toggleSidebar();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    const name = this.currentUser()?.name || 'User';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
