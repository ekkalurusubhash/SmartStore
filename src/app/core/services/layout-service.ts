import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {

  // ✅ global signal
  isSidebarCollapsed = signal(false);

  // ✅ toggle method
  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  // ✅ set explicitly
  setSidebarState(value: boolean) {
    this.isSidebarCollapsed.set(value);
  }
}