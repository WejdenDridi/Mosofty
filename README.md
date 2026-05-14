# Mosofty - Internal Management System

Mosofty is a modern, role-based Internal Management System built with Angular and Supabase. It features distinct dashboards for Managers and Employees, real-time task tracking, and a secure authentication flow using 6-digit OTP verification.

## ✨ Features

- **Role-Based Access Control**: Secure dashboards for Managers and Employees.
- **OTP Authentication**: Robust 6-digit code verification via email (bypasses email scanner issues).
- **Task Management**: Create, assign, and track tasks in real-time.
- **Modern UI**: Dark-themed, professional aesthetic inspired by modern SaaS platforms.
- **Supabase Integration**: Server-side profile creation and secure data handling via RLS.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Angular CLI (`npm install -g @angular/cli`)
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mosofty.git
   cd mosofty
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environments:
   - Rename `src/environments/environment.example.ts` to `src/environments/environment.development.ts`.
   - Add your Supabase URL and Anon Key.

4. Run the development server:
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`.

## 🛠️ Supabase Configuration

### 1. Database Schema
Ensure you have a `profiles` table with the following structure:
- `id` (uuid, primary key, references auth.users)
- `fullname` (text)
- `email` (text)
- `role` (text, e.g., 'manager', 'employee')

### 2. Profile Trigger
Add a trigger to automatically create a profile on signup:
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, fullname, email, role)
  values (new.id, new.raw_user_meta_data->>'fullname', new.email, new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Email Template
Update your **Confirm signup** template in the Supabase Dashboard to use the OTP token (`{{ .Token }}`).

## 📄 License

This project is licensed under the MIT License.
