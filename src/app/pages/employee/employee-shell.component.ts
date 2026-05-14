import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-employee-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './employee-shell.component.html'
})
export class EmployeeShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  greetingPrefix(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  firstName(): string {
    const full = this.auth.profileSignal()?.fullname?.trim();
    if (!full) return 'Sarah';
    return full.split(/\s+/)[0] ?? 'Sarah';
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }
}
