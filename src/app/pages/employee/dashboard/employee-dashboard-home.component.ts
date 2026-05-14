import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { TaskStatus, TaskWithRelations } from '../../../models/database.types';
import { AuthService } from '../../../core/auth.service';
import { TaskService } from '../../../core/task.service';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface DisplayTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  deadlineLabel: string;
  progress: number;
  status: TaskStatus;
  avatars: string[];
}

@Component({
  standalone: true,
  selector: 'app-employee-dashboard-home',
  imports: [RouterLink],
  templateUrl: './employee-dashboard-home.component.html'
})
export class EmployeeDashboardHomeComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly tasksApi = inject(TaskService);

  readonly rows = signal<TaskWithRelations[]>([]);
  readonly loadError = signal<string | null>(null);
  readonly busyId = signal<string | null>(null);

  private readonly demoTasks: DisplayTask[] = [
    {
      id: 'demo-1',
      title: 'Design Mobile Login Screen',
      description: 'High-fidelity mockups and handoff specs for mobile auth.',
      priority: 'high',
      deadlineLabel: 'Today — 5:00 PM',
      progress: 75,
      status: 'in progress',
      avatars: ['A', 'L', 'K']
    },
    {
      id: 'demo-2',
      title: 'Fix Dashboard Responsiveness',
      description: 'Breakpoints and grid alignment for tablet views.',
      priority: 'medium',
      deadlineLabel: 'Tomorrow — 12:00 PM',
      progress: 40,
      status: 'in progress',
      avatars: ['K', 'S']
    },
    {
      id: 'demo-3',
      title: 'Prepare Client Presentation',
      description: 'Slide deck and talking points for Q4 review.',
      priority: 'low',
      deadlineLabel: 'Fri — 3:00 PM',
      progress: 20,
      status: 'todo',
      avatars: ['M']
    }
  ];

  readonly weeklyProductivity = [62, 48, 71, 55, 80, 66, 74];

  readonly scheduleEvents = [
    { time: '9:00 AM', title: 'Team Meeting', color: 'var(--accent)', initials: ['A', 'L'] },
    { time: '11:00 AM', title: 'UI Review Session', color: 'var(--info)', initials: ['L', 'S'] },
    { time: '2:00 PM', title: 'Client Feedback Call', color: 'var(--warn-orange)', initials: ['K'] },
    { time: '4:00 PM', title: 'Upload Final Assets', color: 'var(--accent)', initials: ['S', 'A'] }
  ];

  readonly teamMembers = [
    { name: 'Ahmed', task: 'Working on API', online: true, initial: 'A' },
    { name: 'Lina', task: 'UI Design', online: true, initial: 'L' },
    { name: 'Karim', task: 'Testing', online: false, initial: 'K' }
  ];

  readonly recentFiles = [
    { name: 'UI_Mockup.fig', date: 'Nov 10, 2026', ext: 'fig' },
    { name: 'ClientNotes.pdf', date: 'Nov 9, 2026', ext: 'pdf' },
    { name: 'DashboardAssets.zip', date: 'Nov 8, 2026', ext: 'zip' }
  ];

  readonly activities = [
    { type: 'ok', text: 'Manager approved your task', time: '2h ago' },
    { type: 'info', text: 'New comment added on Mobile Login', time: '4h ago' },
    { type: 'warn', text: 'Deadline updated for Client deck', time: 'Yesterday' },
    { type: 'info', text: 'New file shared: Brand_Guidelines.pdf', time: 'Yesterday' }
  ];

  readonly displayTasks = computed(() => {
    const fromApi = this.rows().map((t) => this.taskToDisplay(t));
    if (fromApi.length === 0) return this.demoTasks;
    return fromApi.slice(0, 8);
  });

  readonly stats = computed(() => {
    const list = this.rows();
    if (list.length === 0) {
      return {
        assigned: 18,
        completed: 12,
        pendingReview: 4,
        overdue: 2,
        assignedDelta: '+5%',
        weeklyBetter: '+12%'
      };
    }
    const completed = list.filter((t) => t.status === 'done').length;
    const pendingReview = list.filter((t) => t.status === 'in progress').length;
    const today = this.startOfToday();
    const overdue = list.filter(
      (t) => t.status !== 'done' && t.due_date && new Date(t.due_date + 'T00:00:00') < today
    ).length;
    return {
      assigned: list.length,
      completed,
      pendingReview,
      overdue,
      assignedDelta: '+5%',
      weeklyBetter: '+12%'
    };
  });

  readonly ringSweep = computed(() => {
    const s = this.stats();
    if (!s.assigned) return '0deg';
    const pct = Math.min(100, (s.completed / s.assigned) * 100);
    return `${(pct / 100) * 360}deg`;
  });

  readonly scheduleDateLabel = computed(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  });

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loadError.set(null);
    const userId = this.auth.profileSignal()?.id;
    if (!userId) {
      this.loadError.set('Not signed in');
      return;
    }
    const { data, error } = await this.tasksApi.listMyTasks(userId);
    if (error) {
      this.loadError.set(error.message);
      return;
    }
    this.rows.set(data);
  }

  async onStatusChange(task: TaskWithRelations, value: TaskStatus): Promise<void> {
    if (task.status === value) return;
    this.busyId.set(task.id);
    const { error } = await this.tasksApi.updateTaskStatus(task.id, value);
    this.busyId.set(null);
    if (error) {
      this.loadError.set(error.message);
      return;
    }
    await this.refresh();
  }

  async toggleTaskDone(task: DisplayTask): Promise<void> {
    if (task.id.startsWith('demo-')) return;
    const row = this.rows().find((r) => r.id === task.id);
    if (!row) return;
    const next: TaskStatus = row.status === 'done' ? 'todo' : 'done';
    await this.onStatusChange(row, next);
  }

  isTaskDone(task: DisplayTask): boolean {
    if (task.id.startsWith('demo-')) return task.status === 'done';
    const row = this.rows().find((r) => r.id === task.id);
    return row?.status === 'done';
  }

  barHeight(i: number): number {
    const v = this.weeklyProductivity[i] ?? 0;
    return Math.max(8, (v / 100) * 100);
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private taskToDisplay(t: TaskWithRelations): DisplayTask {
    return {
      id: t.id,
      title: t.title,
      description: t.description?.trim() || 'No description yet.',
      priority: this.inferPriority(t),
      deadlineLabel: this.deadlineLabel(t),
      progress: this.progressFromStatus(t.status),
      status: t.status,
      avatars: ['T', 'Y', 'U']
    };
  }

  private inferPriority(t: TaskWithRelations): TaskPriority {
    if (t.due_date) {
      const due = new Date(t.due_date + 'T00:00:00');
      const diff = (due.getTime() - this.startOfToday().getTime()) / 86400000;
      if (diff <= 0) return 'high';
      if (diff <= 2) return 'medium';
    }
    return 'low';
  }

  private deadlineLabel(t: TaskWithRelations): string {
    if (!t.due_date) return 'No deadline';
    const due = new Date(t.due_date + 'T00:00:00');
    const today = this.startOfToday();
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
    const time = '5:00 PM';
    if (diff === 0) return `Today — ${time}`;
    if (diff === 1) return `Tomorrow — ${time}`;
    return this.fmtDate(t.due_date);
  }

  private progressFromStatus(s: TaskStatus): number {
    if (s === 'done') return 100;
    if (s === 'in progress') return 50;
    return 15;
  }

  private fmtDate(raw: string | null): string {
    if (!raw) return 'No deadline';
    const d = new Date(raw + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
