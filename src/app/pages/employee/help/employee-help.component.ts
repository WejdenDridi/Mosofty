import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-employee-help',
  template: `
    <div class="emp-inner-page">
      <header>
        <h1 class="emp-page-title">Help &amp; Support</h1>
        <p class="emp-page-desc">Guides and quick answers for Mosofty employees.</p>
      </header>
      <section class="glass-card emp-settings-card">
        <h2 style="margin: 0 0 12px; font-size: 1rem">Getting started</h2>
        <p style="margin: 0; color: var(--text-muted); line-height: 1.6">
          Use the sidebar to switch between Dashboard, Tasks, Projects, Calendar, and Messages. Everything here runs on mock data so you can explore the UI without a backend.
        </p>
      </section>
      <section class="glass-card emp-settings-card">
        <h2 style="margin: 0 0 12px; font-size: 1rem">Contact</h2>
        <p style="margin: 0; color: var(--text-muted); line-height: 1.6">
          Email <span style="color: var(--accent)">support@mosofty.app</span> — typical response under 24h (demo copy).
        </p>
      </section>
    </div>
  `
})
export class EmployeeHelpComponent {}
