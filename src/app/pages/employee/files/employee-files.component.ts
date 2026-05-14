import { Component, computed, inject, signal } from '@angular/core';
import { EmployeeMockStateService } from '../shared/employee-mock-state.service';

@Component({
  standalone: true,
  selector: 'app-employee-files',
  templateUrl: './employee-files.component.html'
})
export class EmployeeFilesComponent {
  readonly mock = inject(EmployeeMockStateService);
  readonly search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.mock.files();
    if (!q) return list;
    return list.filter((f) => f.name.toLowerCase().includes(q));
  });

  onUploadPick(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.mock.addMockFile(file.name);
    }
    input.value = '';
  }

  triggerPick(input: HTMLInputElement): void {
    input.click();
  }
}
