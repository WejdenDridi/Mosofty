import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-employee-settings',
  imports: [FormsModule],
  templateUrl: './employee-settings.component.html',
  styleUrls: ['./employee-settings.component.css']
})
export class EmployeeSettingsComponent {
  readonly auth = inject(AuthService);

  readonly fullname = signal(this.auth.profileSignal()?.fullname ?? '');
  readonly email = signal(this.auth.profileSignal()?.email ?? '');
  readonly password = signal('');
  readonly emailNotif = signal(true);
  readonly pushNotif = signal(true);
  readonly marketing = signal(false);
  readonly darkMode = signal(true);
  readonly language = signal('en');
  readonly saved = signal(false);

  saveProfile(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
