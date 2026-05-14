import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullname: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]]
  });

  async onSubmit(): Promise<void> {
    this.error.set(null);
    this.info.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fullname, email, password, confirm } = this.form.getRawValue();
    if (password !== confirm) {
      this.error.set('Passwords do not match');
      return;
    }

    this.submitting.set(true);
    await this.auth.initializing;

    const result = await this.auth.signUp(email, password, fullname, 'employee');

    if (result.error) {
      this.error.set(result.error.message);
      this.submitting.set(false);
      return;
    }

    const role = this.auth.profileSignal()?.role;
    const hasSession = await this.auth.hasSession();
    if (!hasSession || !role) {
      await this.router.navigate(['/verify-otp'], { queryParams: { email } });
      this.submitting.set(false);
      return;
    }

    await this.router.navigateByUrl(this.auth.dashboardPathForRole(role));
    this.submitting.set(false);
  }
}
