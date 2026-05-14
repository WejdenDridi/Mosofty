import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      <div class="loader"></div>
      <p>Verifying your account...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #f8fafc;
      color: #1e293b;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .loader {
      border: 3px solid #e2e8f0;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    // Wait for the auth service to initialize and detect the session from the URL
    await this.auth.initializing;
    
    // Give it a tiny bit of time to ensure onAuthStateChange has fired
    setTimeout(async () => {
      const profile = this.auth.profileSignal();
      if (profile) {
        await this.router.navigateByUrl(this.auth.dashboardPathForRole(profile.role));
      } else {
        // If no profile, maybe it's still loading or something went wrong
        await this.auth.refreshProfile();
        const updatedProfile = this.auth.profileSignal();
        if (updatedProfile) {
          await this.router.navigateByUrl(this.auth.dashboardPathForRole(updatedProfile.role));
        } else {
          // Fallback to login
          await this.router.navigateByUrl('/login');
        }
      }
    }, 1500);
  }
}
