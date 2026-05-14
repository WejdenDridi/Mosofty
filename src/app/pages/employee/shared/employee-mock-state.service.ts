import { Injectable, signal } from '@angular/core';
import type { MockCalendarEvent, MockConversation, MockFileRow, MockProject, MockTask } from './employee-mock.models';
import { SEED_CONVERSATIONS, SEED_FILES, SEED_PROJECTS, SEED_TASKS } from './employee-mock.seed';

function cloneConversations(rows: MockConversation[]): MockConversation[] {
  return rows.map((c) => ({
    ...c,
    messages: c.messages.map((m) => ({ ...m }))
  }));
}

@Injectable({ providedIn: 'root' })
export class EmployeeMockStateService {
  readonly tasks = signal<MockTask[]>(structuredClone(SEED_TASKS));
  readonly projects = signal<MockProject[]>(structuredClone(SEED_PROJECTS));
  readonly files = signal<MockFileRow[]>(structuredClone(SEED_FILES));
  readonly conversations = signal<MockConversation[]>(cloneConversations(SEED_CONVERSATIONS));
  readonly calendarEvents = signal<MockCalendarEvent[]>(this.buildMonthEvents());

  markTaskCompleted(id: string): void {
    this.tasks.update((list) =>
      list.map((t) =>
        t.id === id ? { ...t, status: 'done' as const, progress: 100 } : t
      )
    );
  }

  setTaskStatus(id: string, status: MockTask['status']): void {
    this.tasks.update((list) =>
      list.map((t) => {
        if (t.id !== id) return t;
        const progress = status === 'done' ? 100 : status === 'in progress' ? Math.max(t.progress, 35) : t.progress;
        return { ...t, status, progress };
      })
    );
  }

  addMockFile(name: string): void {
    const ext = name.includes('.') ? name.split('.').pop() || 'file' : 'file';
    const row: MockFileRow = {
      id: `f-${Date.now()}`,
      name,
      ext,
      size: `${(Math.random() * 5 + 0.2).toFixed(1)} MB`,
      uploadedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    };
    this.files.update((f) => [row, ...f]);
  }

  sendMessage(conversationId: string, text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    const at = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    const msg = { id: `m-${Date.now()}`, author: 'me' as const, text: trimmed, at };
    this.conversations.update((list) =>
      list.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastPreview: `You: ${trimmed}`,
              messages: [...c.messages, msg]
            }
          : c
      )
    );
  }

  /** Rebuild demo events when month changes (optional refresh). */
  refreshCalendarForMonth(year: number, monthIndex: number): void {
    this.calendarEvents.set(this.buildMonthEvents(year, monthIndex));
  }

  private buildMonthEvents(year?: number, monthIndex?: number): MockCalendarEvent[] {
    const d = new Date();
    const y = year ?? d.getFullYear();
    const m = monthIndex ?? d.getMonth();
    const pad = (n: number) => String(n).padStart(2, '0');
    const iso = (day: number) => `${y}-${pad(m + 1)}-${pad(day)}`;
    const last = daysInMonth(y, m);
    const pick = (day: number) => iso(Math.min(Math.max(1, day), last));
    return [
      { id: 'e1', title: 'Team standup', date: pick(3), time: '9:00 AM', type: 'meeting' },
      { id: 'e2', title: 'UI review session', date: pick(10), time: '11:00 AM', type: 'meeting' },
      { id: 'e3', title: 'Client feedback call', date: pick(14), time: '2:00 PM', type: 'meeting' },
      { id: 'e4', title: 'Upload final assets', date: pick(21), time: '4:00 PM', type: 'task' },
      { id: 'e5', title: 'Sprint deadline', date: pick(last), time: '6:00 PM', type: 'deadline' }
    ];
  }
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}
