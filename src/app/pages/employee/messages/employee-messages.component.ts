import { Component, computed, inject, signal } from '@angular/core';
import { EmployeeMockStateService } from '../shared/employee-mock-state.service';

@Component({
  standalone: true,
  selector: 'app-employee-messages',
  templateUrl: './employee-messages.component.html'
})
export class EmployeeMessagesComponent {
  readonly mock = inject(EmployeeMockStateService);

  readonly activeId = signal(this.mock.conversations()[0]?.id ?? '');
  readonly draft = signal('');

  readonly active = computed(() => this.mock.conversations().find((c) => c.id === this.activeId()) ?? null);

  select(id: string): void {
    this.activeId.set(id);
  }

  send(): void {
    const id = this.activeId();
    const text = this.draft();
    if (!id || !text.trim()) return;
    this.mock.sendMessage(id, text);
    this.draft.set('');
  }
}
