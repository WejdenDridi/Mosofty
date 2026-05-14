import { Injectable, inject } from '@angular/core';
import type { Project, TaskStatus, TaskWithRelations } from '../models/database.types';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly supabase = inject(SupabaseService).client;

  private taskSelect =
    'id, title, description, status, due_date, project_id, assigned_to, created_by, created_at, assignee:profiles!tasks_assigned_to_fkey(email, fullname), project:projects(name)';

  async listEmployees(): Promise<{ data: { id: string; email: string; fullname: string }[]; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, email, fullname')
      .eq('role', 'employee')
      .order('email');

    return { data: (data as { id: string; email: string; fullname: string }[]) ?? [], error: error ? new Error(error.message) : null };
  }

  async listProjects(): Promise<{ data: Project[]; error: Error | null }> {
    const { data, error } = await this.supabase.from('projects').select('*').order('created_at', { ascending: false });
    return { data: (data as Project[]) ?? [], error: error ? new Error(error.message) : null };
  }

  async createProject(name: string, description: string, createdBy: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.from('projects').insert({ name, description, created_by: createdBy });
    return { error: error ? new Error(error.message) : null };
  }

  async listAllTasks(): Promise<{ data: TaskWithRelations[]; error: Error | null }> {
    const { data, error } = await this.supabase.from('tasks').select(this.taskSelect).order('created_at', { ascending: false });
    return { data: ((data ?? []) as unknown as TaskWithRelations[]) ?? [], error: error ? new Error(error.message) : null };
  }

  async listMyTasks(userId: string): Promise<{ data: TaskWithRelations[]; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select(this.taskSelect)
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true, nullsFirst: false });

    return { data: ((data ?? []) as unknown as TaskWithRelations[]) ?? [], error: error ? new Error(error.message) : null };
  }

  async createTask(input: {
    title: string;
    description: string;
    due_date: string | null;
    project_id: string | null;
    assigned_to: string;
    created_by: string;
  }): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.from('tasks').insert({
      title: input.title,
      description: input.description,
      due_date: input.due_date || null,
      project_id: input.project_id,
      assigned_to: input.assigned_to,
      created_by: input.created_by,
      status: 'todo' as TaskStatus
    });
    return { error: error ? new Error(error.message) : null };
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.from('tasks').update({ status }).eq('id', taskId);
    return { error: error ? new Error(error.message) : null };
  }

  async deleteTask(taskId: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.from('tasks').delete().eq('id', taskId);
    return { error: error ? new Error(error.message) : null };
  }
}
