import { Component, inject, signal } from '@angular/core';
import type { MockProject } from '../shared/employee-mock.models';
import { EmployeeMockStateService } from '../shared/employee-mock-state.service';

@Component({
  standalone: true,
  selector: 'app-employee-projects',
  templateUrl: './employee-projects.component.html'
})
export class EmployeeProjectsComponent {
  readonly state = inject(EmployeeMockStateService);
  readonly selected = signal<MockProject | null>(null);

  open(p: MockProject): void {
    this.selected.set(p);
  }

  close(): void {
    this.selected.set(null);
  }

  statusLabel(s: MockProject['status']): string {
    if (s === 'active') return 'Active';
    if (s === 'on-hold') return 'On hold';
    return 'Completed';
  }
}
