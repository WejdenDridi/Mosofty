import type { TaskStatus } from '../../../models/database.types';

export type MockTaskStatus = TaskStatus;

export type MockPriority = 'high' | 'medium' | 'low';

export interface MockTask {
  id: string;
  title: string;
  description: string;
  status: MockTaskStatus;
  priority: MockPriority;
  dueDate: string;
  dueLabel: string;
  progress: number;
  projectName: string;
  assigneeAvatars: string[];
}

export type ProjectStatus = 'active' | 'on-hold' | 'completed';

export interface MockProject {
  id: string;
  name: string;
  description: string;
  progress: number;
  deadline: string;
  status: ProjectStatus;
  team: { name: string; initial: string }[];
}

export type CalendarEventType = 'task' | 'meeting' | 'deadline';

export interface MockCalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: CalendarEventType;
}

export interface MockMessage {
  id: string;
  author: 'me' | 'them';
  text: string;
  at: string;
}

export interface MockConversation {
  id: string;
  name: string;
  initial: string;
  online: boolean;
  lastPreview: string;
  messages: MockMessage[];
}

export interface MockFileRow {
  id: string;
  name: string;
  ext: string;
  size: string;
  uploadedAt: string;
}
