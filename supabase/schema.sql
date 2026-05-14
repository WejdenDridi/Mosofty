-- Internal Management System — run this in the Supabase SQL Editor.
-- Replace nothing; execute as a whole after creating a new project.

-- Safely drop all existing tables to guarantee a clean rebuild with all foreign keys intact
drop table if exists public.tasks cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  fullname text not null,
  role text not null default 'employee' check (role in ('manager', 'employee'))
);

alter table public.profiles enable row level security;

-- (The automatic trigger has been removed. Profile creation is handled by the Angular frontend via auth.service.ts)

comment on table public.profiles is 'Application users; role manager | employee';

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  status text not null default 'todo' check (status in ('todo', 'in progress', 'done')),
  due_date date,
  project_id uuid references public.projects (id) on delete set null,
  assigned_to uuid not null constraint tasks_assigned_to_fkey references public.profiles (id),
  created_by uuid not null constraint tasks_created_by_fkey references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_project_idx on public.tasks (project_id);

alter table public.tasks enable row level security;

-- Helper function to bypass RLS and check if the current user is a manager without causing infinite recursion
create or replace function public.is_manager()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'manager'
  );
$$;

-- ─── RLS: profiles ───────────────────────────────────────────────────────
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_select_managers_all" on public.profiles;
create policy "profiles_select_managers_all"
  on public.profiles for select
  to authenticated
  using (public.is_manager());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_managers" on public.profiles;
create policy "profiles_update_managers"
  on public.profiles for update
  to authenticated
  using (public.is_manager());

-- ─── RLS: projects ───────────────────────────────────────────────────────
drop policy if exists "projects_managers_crud" on public.projects;
create policy "projects_managers_crud"
  on public.projects for all
  to authenticated
  using (public.is_manager())
  with check (public.is_manager());

drop policy if exists "projects_select_employee_assigned" on public.projects;
create policy "projects_select_employee_assigned"
  on public.projects for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.project_id = projects.id
        and t.assigned_to = auth.uid()
    )
  );

-- ─── RLS: tasks ──────────────────────────────────────────────────────────
drop policy if exists "tasks_select_assignee_or_manager" on public.tasks;
create policy "tasks_select_assignee_or_manager"
  on public.tasks for select
  to authenticated
  using (
    assigned_to = auth.uid()
    or public.is_manager()
  );

drop policy if exists "tasks_insert_managers" on public.tasks;
create policy "tasks_insert_managers"
  on public.tasks for insert
  to authenticated
  with check (
    public.is_manager()
    and created_by = auth.uid()
  );

drop policy if exists "tasks_update_managers" on public.tasks;
create policy "tasks_update_managers"
  on public.tasks for update
  to authenticated
  using (public.is_manager());

drop policy if exists "tasks_update_assignee_status_only" on public.tasks;
create policy "tasks_update_assignee_status_only"
  on public.tasks for update
  to authenticated
  using (assigned_to = auth.uid())
  with check (assigned_to = auth.uid());

drop policy if exists "tasks_delete_managers" on public.tasks;
create policy "tasks_delete_managers"
  on public.tasks for delete
  to authenticated
  using (public.is_manager());

-- Promote first user to manager (run once manually in SQL editor):
-- update public.profiles set role = 'manager' where email = 'your@email.com';


