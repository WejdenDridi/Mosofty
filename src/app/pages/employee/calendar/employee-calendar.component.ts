import { Component, computed, inject, signal } from '@angular/core';
import type { MockCalendarEvent } from '../shared/employee-mock.models';
import { EmployeeMockStateService } from '../shared/employee-mock-state.service';

interface CalCell {
  label: number | '';
  iso: string | null;
  inMonth: boolean;
}

@Component({
  standalone: true,
  selector: 'app-employee-calendar',
  templateUrl: './employee-calendar.component.html'
})
export class EmployeeCalendarComponent {
  readonly mock = inject(EmployeeMockStateService);

  readonly view = signal<{ y: number; m: number }>({
    y: new Date().getFullYear(),
    m: new Date().getMonth()
  });

  readonly selectedIso = signal<string | null>(null);

  readonly title = computed(() => {
    const { y, m } = this.view();
    return new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  });

  readonly cells = computed(() => this.buildCells(this.view().y, this.view().m));

  eventsOn(iso: string | null): MockCalendarEvent[] {
    if (!iso) return [];
    return this.mock.calendarEvents().filter((e) => e.date === iso);
  }

  prevMonth(): void {
    this.view.update((v) => {
      const d = new Date(v.y, v.m - 1, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      this.mock.refreshCalendarForMonth(y, m);
      return { y, m };
    });
    this.selectedIso.set(null);
  }

  nextMonth(): void {
    this.view.update((v) => {
      const d = new Date(v.y, v.m + 1, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      this.mock.refreshCalendarForMonth(y, m);
      return { y, m };
    });
    this.selectedIso.set(null);
  }

  selectCell(c: CalCell): void {
    if (!c.inMonth || !c.iso) return;
    this.selectedIso.set(c.iso);
  }

  isSelected(c: CalCell): boolean {
    return !!c.iso && this.selectedIso() === c.iso;
  }

  upcoming(): MockCalendarEvent[] {
    const today = new Date().toISOString().slice(0, 10);
    return [...this.mock.calendarEvents()].sort((a, b) => a.date.localeCompare(b.date)).filter((e) => e.date >= today);
  }

  private buildCells(year: number, monthIndex: number): CalCell[] {
    const first = new Date(year, monthIndex, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysIn = new Date(year, monthIndex + 1, 0).getDate();
    const cells: CalCell[] = [];
    const pad = (n: number) => String(n).padStart(2, '0');
    const iso = (d: number) => `${year}-${pad(monthIndex + 1)}-${pad(d)}`;

    for (let i = 0; i < startPad; i++) {
      cells.push({ label: '', iso: null, inMonth: false });
    }
    for (let d = 1; d <= daysIn; d++) {
      cells.push({ label: d, iso: iso(d), inMonth: true });
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
      cells.push({ label: '', iso: null, inMonth: false });
    }
    return cells.slice(0, 42);
  }
}
