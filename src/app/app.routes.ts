import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { loginGuard } from './core/guards/login-guard';
export const routes: Routes = [
    // Public route
    {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () =>
            import('./features/auth/login/login')
                .then(m => m.Login)
    },
    // Protected layout
    {
        path: '',
        canActivate: [authGuard],
        canMatch: [authGuard], // prevents even loading module if not logged in
        loadComponent: () =>
            import('./main/main')
                .then(m => m.Main),
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard')
                        .then(m => m.Dashboard)
            },
            {
                path: 'inventory',
                loadComponent: () =>
                    import('./features/inventory/inventory')
                        .then(m => m.Inventory)
            },
            {
                path: 'sales',
                loadComponent: () =>
                    import('./features/sales/sales')
                        .then(m => m.Sales)
            },
            {
                path: 'employees',
                loadComponent: () =>
                    import('./features/employees/employees')
                        .then(m => m.Employees)
            },
            {
                path: 'analytics',
                loadComponent: () =>
                    import('./features/analytics/analytics')
                        .then(m => m.Analytics)
            },
            // Default child route
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    // Fallback
    {
        path: '**',
        redirectTo: 'login'
    }
];