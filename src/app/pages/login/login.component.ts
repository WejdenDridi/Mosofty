import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit(): Promise<void> {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);

    await this.auth.initializing;
    const { error } = await this.auth.signIn(email, password);
    if (error) {
      this.error.set(error.message);
      this.submitting.set(false);
      return;
    }

    await this.auth.refreshProfile();
    const role = this.auth.profileSignal()?.role;
    if (!role) {
      this.error.set('Profile not found. Apply the Supabase schema and ensure your user has a profiles row.');
      this.submitting.set(false);
      return;
    }

    await this.router.navigateByUrl(this.auth.dashboardPathForRole(role));
    this.submitting.set(false);
  }
}
