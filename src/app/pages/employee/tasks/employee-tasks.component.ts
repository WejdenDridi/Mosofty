import { Component, computed, inject, signal } from '@angular/core';
import type { MockTask } from '../shared/employee-mock.models';
import type { TaskStatus } from '../../../models/database.types';
import { EmployeeMockStateService } from '../shared/employee-mock-state.service';

type TaskFilter = 'all' | TaskStatus;

@Component({
  standalone: true,
  selector: 'app-employee-tasks',
  templateUrl: './employee-tasks.component.html'
})
export class EmployeeTasksComponent {
  private readonly mock = inject(EmployeeMockStateService);

  readonly search = signal('');
  readonly filter = signal<TaskFilter>('all');
  readonly selected = signal<MockTask | null>(null);

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const f = this.filter();
    return this.mock.tasks().filter((t) => {
      if (f !== 'all' && t.status !== f) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q)
      );
    });
  });

  setFilter(f: TaskFilter): void {
    this.filter.set(f);
  }

  openTask(t: MockTask): void {
    this.selected.set(t);
  }

  closeModal(): void {
    this.selected.set(null);
  }

  markSelectedDone(): void {
    const t = this.selected();
    if (!t) return;
    this.mock.markTaskCompleted(t.id);
    this.selected.set({ ...t, status: 'done', progress: 100 });
  }

  statusClass(s: TaskStatus): string {
    if (s === 'done') return 'done';
    if (s === 'in progress') return 'in-progress';
    return 'todo';
  }

  statusLabel(s: TaskStatus): string {
    if (s === 'done') return 'Completed';
    if (s === 'in progress') return 'In progress';
    return 'Pending';
  }
}
