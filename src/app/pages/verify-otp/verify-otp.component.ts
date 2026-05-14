import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-verify-otp',
  imports: [ReactiveFormsModule],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.email.set(emailParam);
    }
  }

  async onVerify(): Promise<void> {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const emailValue = this.email();
    if (!emailValue) {
      this.error.set('Email is missing. Please try signing up again.');
      return;
    }

    const { otp } = this.form.getRawValue();
    this.submitting.set(true);

    const result = await this.auth.verifyOtp(emailValue, otp);
    
    if (result.error) {
      this.error.set(result.error.message);
      this.submitting.set(false);
      return;
    }

    // Success! Redirect to dashboard
    const role = this.auth.profileSignal()?.role;
    await this.router.navigateByUrl(this.auth.dashboardPathForRole(role));
    this.submitting.set(false);
  }
}
