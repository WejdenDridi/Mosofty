import type { MockConversation, MockFileRow, MockProject, MockTask } from './employee-mock.models';

export const SEED_TASKS: MockTask[] = [
  {
    id: 't1',
    title: 'Design Mobile Login Screen',
    description: 'High-fidelity mockups, flows, and dev-ready specs for Mosofty mobile auth.',
    status: 'in progress',
    priority: 'high',
    dueDate: new Date().toISOString().slice(0, 10),
    dueLabel: 'Today — 5:00 PM',
    progress: 75,
    projectName: 'Mobile App',
    assigneeAvatars: ['A', 'L', 'K']
  },
  {
    id: 't2',
    title: 'Fix Dashboard Responsiveness',
    description: 'Grid and breakpoints for tablet; align with design tokens.',
    status: 'in progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    dueLabel: 'Tomorrow — 12:00 PM',
    progress: 40,
    projectName: 'Web Platform',
    assigneeAvatars: ['K', 'S']
  },
  {
    id: 't3',
    title: 'Prepare Client Presentation',
    description: 'Q4 roadmap slides and narrative for Acme Corp workshop.',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    dueLabel: 'Fri — 3:00 PM',
    progress: 20,
    projectName: 'Growth',
    assigneeAvatars: ['M']
  },
  {
    id: 't4',
    title: 'Audit color contrast in settings',
    description: 'WCAG AA pass on forms and toggles.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    dueLabel: 'Next week',
    progress: 10,
    projectName: 'Accessibility',
    assigneeAvatars: ['S']
  },
  {
    id: 't5',
    title: 'Handoff icons to development',
    description: 'Export SVG sprite and document usage.',
    status: 'done',
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    dueLabel: 'Yesterday',
    progress: 100,
    projectName: 'Design System',
    assigneeAvatars: ['L', 'A']
  },
  {
    id: 't6',
    title: 'Review PR: navigation shell',
    description: 'Code review for employee layout and routes.',
    status: 'in progress',
    priority: 'high',
    dueDate: new Date().toISOString().slice(0, 10),
    dueLabel: 'Today — 6:30 PM',
    progress: 30,
    projectName: 'Web Platform',
    assigneeAvatars: ['K']
  }
];

export const SEED_PROJECTS: MockProject[] = [
  {
    id: 'p1',
    name: 'Mobile App',
    description: 'Mosofty native experience — tasks, push, and offline cache.',
    progress: 68,
    deadline: 'Dec 18, 2026',
    status: 'active',
    team: [
      { name: 'Sarah', initial: 'S' },
      { name: 'Ahmed', initial: 'A' },
      { name: 'Lina', initial: 'L' }
    ]
  },
  {
    id: 'p2',
    name: 'Web Platform',
    description: 'Employee and manager dashboards, reporting, and SSO.',
    progress: 52,
    deadline: 'Jan 9, 2027',
    status: 'active',
    team: [
      { name: 'Karim', initial: 'K' },
      { name: 'Sarah', initial: 'S' }
    ]
  },
  {
    id: 'p3',
    name: 'Design System',
    description: 'Tokens, components, and Figma libraries.',
    progress: 88,
    deadline: 'Nov 30, 2026',
    status: 'on-hold',
    team: [{ name: 'Lina', initial: 'L' }]
  }
];

export const SEED_CONVERSATIONS: MockConversation[] = [
  {
    id: 'c1',
    name: 'Design — Mobile',
    initial: 'D',
    online: true,
    lastPreview: 'Lina: Can we bump the corner radius on cards?',
    messages: [
      { id: 'm1', author: 'them', text: 'Hey Sarah, quick question on the login hero asset.', at: '10:12 AM' },
      { id: 'm2', author: 'me', text: 'Uploading the revised SVG now — one sec.', at: '10:14 AM' },
      { id: 'm3', author: 'them', text: 'Perfect, thanks!', at: '10:18 AM' }
    ]
  },
  {
    id: 'c2',
    name: 'Karim (QA)',
    initial: 'K',
    online: false,
    lastPreview: 'You: Sounds good, I’ll retest after deploy.',
    messages: [
      { id: 'm4', author: 'them', text: 'Build 402 is on staging — dashboard nav regression fixed.', at: 'Yesterday' },
      { id: 'm5', author: 'me', text: 'Great, I’ll run through the employee flows tonight.', at: 'Yesterday' }
    ]
  },
  {
    id: 'c3',
    name: '#mosofty-release',
    initial: '#',
    online: true,
    lastPreview: 'Bot: Release checklist updated.',
    messages: [{ id: 'm6', author: 'them', text: 'Reminder: freeze at EOD Thursday.', at: '8:00 AM' }]
  }
];

export const SEED_FILES: MockFileRow[] = [
  { id: 'f1', name: 'UI_Mockup.fig', ext: 'fig', size: '4.2 MB', uploadedAt: 'Nov 10, 2026' },
  { id: 'f2', name: 'ClientNotes.pdf', ext: 'pdf', size: '1.1 MB', uploadedAt: 'Nov 9, 2026' },
  { id: 'f3', name: 'DashboardAssets.zip', ext: 'zip', size: '28 MB', uploadedAt: 'Nov 8, 2026' },
  { id: 'f4', name: 'Motion_Login.json', ext: 'json', size: '120 KB', uploadedAt: 'Nov 6, 2026' }
];
