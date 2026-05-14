import { Injectable, computed, inject, signal } from '@angular/core';
import { type EmailOtpType } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../models/database.types';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;

  readonly sessionSignal = signal<import('@supabase/supabase-js').Session | null>(null);
  readonly profileSignal = signal<Profile | null>(null);

  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly profile = computed(() => this.profileSignal());

  initializing = Promise.resolve();

  constructor() {
    this.initializing = this.initAuth();
  }

  private async initAuth(): Promise<void> {
    const {
      data: { session }
    } = await this.supabase.auth.getSession();
    this.sessionSignal.set(session);
    if (session?.user) {
      await this.loadProfile(session.user.id);
    }

    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      this.sessionSignal.set(session);
      if (session?.user) {
        await this.loadProfile(session.user.id);
      } else {
        this.profileSignal.set(null);
      }
    });
  }

  async loadProfile(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, email, fullname, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      this.profileSignal.set(null);
      return;
    }

    if (!data) {
      console.warn('Profile not found for user:', userId);
      this.profileSignal.set(null);
      return;
    }

    this.profileSignal.set(data as Profile);
  }

  async refreshProfile(): Promise<void> {
    const userId = this.sessionSignal()?.user?.id;
    if (userId) {
      await this.loadProfile(userId);
    }
  }

  async signIn(email: string, password: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  }

  async signUp(email: string, password: string, fullname: string, role: UserRole = 'employee'): Promise<{ error: Error | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullname,
          role
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    const session = data.session;
    const user = data.user;

    // If session exists (auto-confirm is on), load the profile
    if (session && user) {
      this.sessionSignal.set(session);
      await this.loadProfile(user.id);
    }

    return { error: null };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    this.sessionSignal.set(null);
    this.profileSignal.set(null);
    if (error) {
      console.error('Error signing out:', error.message);
    }
  }

  async verifyOtp(email: string, token: string, type: EmailOtpType = 'signup'): Promise<{ error: Error | null }> {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data.session) {
      this.sessionSignal.set(data.session);
      if (data.user) {
        await this.loadProfile(data.user.id);
      }
    }

    return { error: null };
  }

  dashboardPathForRole(role: UserRole | undefined | null): string {
    if (role === 'manager') return '/manager-dashboard';
    return '/employee-dashboard/dashboard';
  }

  /** True if session exists; does not validate profile row. */
  async hasSession(): Promise<boolean> {
    const {
      data: { session }
    } = await this.supabase.auth.getSession();
    return !!session;
  }
}
