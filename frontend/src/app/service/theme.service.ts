import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer } from './customer';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'tedbus-theme';
  private userEmail: string | null = null;
  private readonly themeSubject = new BehaviorSubject<Theme>(this.readGuestTheme());
  readonly theme$ = this.themeSubject.asObservable();

  constructor(private customerService: Customer) {
    this.applyTheme(this.themeSubject.value);
  }

  get theme(): Theme {
    return this.themeSubject.value;
  }

  get isDarkMode(): boolean {
    return this.theme === 'dark';
  }

  toggleTheme(): void {
    this.setTheme(this.isDarkMode ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.setThemeWithoutRemoteSave(theme);
    if (this.userEmail) {
      this.customerService.updateThemePreference(this.userEmail, theme).subscribe({
        error: (error) => console.error('Unable to save theme preference', error),
      });
    }
  }

  loadUserTheme(email: string, initialTheme?: Theme): void {
    this.userEmail = email;
    if (initialTheme === 'light' || initialTheme === 'dark') this.setThemeWithoutRemoteSave(initialTheme);

    this.customerService.getThemePreference(email).subscribe({
      next: ({ themePreference }) => this.setThemeWithoutRemoteSave(themePreference),
      error: (error) => console.error('Unable to load saved theme preference', error),
    });
  }

  clearUserTheme(): void {
    this.userEmail = null;
  }

  private setThemeWithoutRemoteSave(theme: Theme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // The selected theme remains active if browser storage is unavailable.
    }
  }

  private readGuestTheme(): Theme {
    try {
      return localStorage.getItem(this.storageKey) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }
}
