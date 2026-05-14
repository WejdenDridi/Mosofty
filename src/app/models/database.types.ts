export type UserRole = 'manager' | 'employee';

export type TaskStatus = 'todo' | 'in progress' | 'done';

export interface Profile {
  id: string;
  email: string;
  fullname: string;
  role: UserRole;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  project_id: string | null;
  assigned_to: string;
  created_by: string;
  created_at: string;
}

export interface TaskWithRelations extends Task {
  assignee?: Pick<Profile, 'email' | 'fullname'>;
  project?: Pick<Project, 'name'> | null;
}
