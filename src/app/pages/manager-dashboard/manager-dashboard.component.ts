import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import type { Project, TaskWithRelations } from '../../models/database.types';
import { AuthService } from '../../core/auth.service';
import { TaskService } from '../../core/task.service';

interface ProgressRow {
  projectName: string;
  total: number;
  done: number;
}

@Component({
  standalone: true,
  selector: 'app-manager-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly tasksApi = inject(TaskService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly employees = signal<{ id: string; email: string; fullname: string }[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly tasks = signal<TaskWithRelations[]>([]);
  readonly loadError = signal<string | null>(null);
  readonly formMessage = signal<string | null>(null);

  readonly projectForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['']
  });

  readonly taskForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    due_date: [''],
    project_id: [''],
    assigned_to: ['', Validators.required]
  });

  readonly progressRows = computed<ProgressRow[]>(() => {
    const list = this.tasks();
    const map = new Map<string, { total: number; done: number }>();
    map.set('(No project)', { total: 0, done: 0 });

    for (const t of list) {
      const key = t.project?.name ?? '(No project)';
      let row = map.get(key);
      if (!row) {
        row = { total: 0, done: 0 };
        map.set(key, row);
      }
      row.total += 1;
      if (t.status === 'done') row.done += 1;
    }

    return Array.from(map.entries())
      .map(([projectName, v]) => ({ projectName, total: v.total, done: v.done }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);
  });

  ngOnInit(): void {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loadError.set(null);
    this.formMessage.set(null);

    const [emp, proj, allTasks] = await Promise.all([
      this.tasksApi.listEmployees(),
      this.tasksApi.listProjects(),
      this.tasksApi.listAllTasks()
    ]);

    if (emp.error) {
      this.loadError.set(emp.error.message);
      return;
    }
    if (proj.error) {
      this.loadError.set(proj.error.message);
      return;
    }
    if (allTasks.error) {
      this.loadError.set(allTasks.error.message);
      return;
    }

    this.employees.set(emp.data);
    this.projects.set(proj.data);
    this.tasks.set(allTasks.data);

    const pid = this.taskForm.controls.project_id.value;
    if (pid && !proj.data.some((p) => p.id === pid)) {
      this.taskForm.patchValue({ project_id: '' });
    }
  }

  async createProject(): Promise<void> {
    this.formMessage.set(null);
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const me = this.auth.profileSignal()?.id;
    if (!me) return;

    const { name, description } = this.projectForm.getRawValue();
    const { error } = await this.tasksApi.createProject(name, description.trim(), me);
    if (error) {
      this.formMessage.set(error.message);
      return;
    }
    this.projectForm.reset({ name: '', description: '' });
    this.formMessage.set('Project created.');
    await this.reload();
  }

  async createTask(): Promise<void> {
    this.formMessage.set(null);
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const me = this.auth.profileSignal()?.id;
    if (!me) return;

    const raw = this.taskForm.getRawValue();
    const project_id = raw.project_id || null;

    const { error } = await this.tasksApi.createTask({
      title: raw.title,
      description: raw.description.trim(),
      due_date: raw.due_date || null,
      project_id,
      assigned_to: raw.assigned_to,
      created_by: me
    });

    if (error) {
      this.formMessage.set(error.message);
      return;
    }

    this.taskForm.reset({
      title: '',
      description: '',
      due_date: '',
      project_id: '',
      assigned_to: ''
    });
    this.formMessage.set('Task assigned.');
    await this.reload();
  }

  async deleteTask(task: TaskWithRelations): Promise<void> {
    const { error } = await this.tasksApi.deleteTask(task.id);
    if (error) {
      this.loadError.set(error.message);
      return;
    }
    await this.reload();
  }

  statusLabel(raw: TaskWithRelations['status']): string {
    switch (raw) {
      case 'todo':
        return 'To do';
      case 'in progress':
        return 'In progress';
      case 'done':
        return 'Done';
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }

  fmtDate(raw: string | null): string {
    if (!raw) return '—';
    const d = new Date(raw + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  pct(done: number, total: number): number {
    if (!total) return 0;
    return Math.round((done / total) * 100);
  }
}
