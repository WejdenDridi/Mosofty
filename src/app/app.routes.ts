import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'verify-otp',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/verify-otp/verify-otp.component').then((m) => m.VerifyOtpComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth-callback/auth-callback.component').then((m) => m.AuthCallbackComponent)
  },
  {
    path: 'manager-dashboard',
    canActivate: [authGuard, roleGuard],
    data: { role: 'manager' },
    loadComponent: () => import('./pages/manager-dashboard/manager-dashboard.component').then((m) => m.ManagerDashboardComponent)
  },
  {
    path: 'employee-dashboard',
    canActivate: [authGuard, roleGuard],
    data: { role: 'employee' },
    loadComponent: () => import('./pages/employee/employee-shell.component').then((m) => m.EmployeeShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/employee/dashboard/employee-dashboard-home.component').then((m) => m.EmployeeDashboardHomeComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/employee/tasks/employee-tasks.component').then((m) => m.EmployeeTasksComponent)
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/employee/projects/employee-projects.component').then((m) => m.EmployeeProjectsComponent)
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./pages/employee/calendar/employee-calendar.component').then((m) => m.EmployeeCalendarComponent)
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/employee/messages/employee-messages.component').then((m) => m.EmployeeMessagesComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/employee/settings/employee-settings.component').then((m) => m.EmployeeSettingsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
