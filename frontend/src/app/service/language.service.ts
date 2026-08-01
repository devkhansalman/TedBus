import { Injectable, signal, WritableSignal } from '@angular/core';
import { TranslateService, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Customer } from './customer';

export interface SupportedLanguage {
  code: string;
  label: string;
  flag?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        `[i18n Warning] Missing translation key: "${params.key}" for language: "${params.translateService.getCurrentLang() || 'en'}"`
      );
    }
    return params.key;
  }
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly STORAGE_KEY = 'tedbus_lang';
  public readonly defaultLang = 'en';

  public readonly supportedLanguages: SupportedLanguage[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  ];

  public currentLangSignal: WritableSignal<string> = signal(this.defaultLang);
  private currentLangSubject = new BehaviorSubject<string>(this.defaultLang);
  public currentLang$: Observable<string> = this.currentLangSubject.asObservable();

  private userEmail: string | null = null;

  constructor(
    private translate: TranslateService,
    private customerService: Customer
  ) {
    this.initLanguage();
  }

  private initLanguage(): void {
    this.translate.addLangs(this.supportedLanguages.map((l) => l.code));
    this.translate.setFallbackLang(this.defaultLang);

    const savedLang = this.getSavedLanguage();
    const targetLang = this.isSupported(savedLang) ? savedLang : this.defaultLang;

    this.applyLanguage(targetLang);
  }

  /**
   * Called by UI (e.g. navbar language selector).
   * Saves to localStorage always; also PATCHes backend if logged in.
   */
  public useLanguage(langCode: string): void {
    if (!this.isSupported(langCode)) {
      langCode = this.defaultLang;
    }

    this.applyLanguage(langCode);
    this.saveLanguageLocally(langCode);
    this.syncLanguageWithBackend(langCode);
  }

  /**
   * Called on login. Fetches the user's saved language from the backend
   * and applies it without re-saving to the backend.
   */
  public loadUserLanguage(email: string, initialLang?: string): void {
    this.userEmail = email;

    // Optimistically apply the language from the login response
    if (initialLang && this.isSupported(initialLang)) {
      this.applyLanguage(initialLang);
      this.saveLanguageLocally(initialLang);
    }

    // Fetch the authoritative preference from the backend
    this.customerService.getLanguagePreference(email).subscribe({
      next: ({ preferredLanguage }) => {
        if (this.isSupported(preferredLanguage)) {
          this.applyLanguage(preferredLanguage);
          this.saveLanguageLocally(preferredLanguage);
        }
      },
      error: (err) => {
        console.error('Unable to load saved language preference', err);
      },
    });
  }

  /**
   * Called on logout. Clears the user email so subsequent changes
   * are only persisted to localStorage (guest mode).
   */
  public clearUserLanguage(): void {
    this.userEmail = null;
  }

  public getCurrentLanguage(): string {
    return this.translate.getCurrentLang() || this.currentLangSignal() || this.defaultLang;
  }

  public getSupportedLanguages(): SupportedLanguage[] {
    return this.supportedLanguages;
  }

  private isSupported(code: string): boolean {
    return this.supportedLanguages.some((lang) => lang.code === code);
  }

  private getSavedLanguage(): string {
    try {
      return localStorage.getItem(this.STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  /**
   * Apply language to ngx-translate and update reactive state.
   * Does NOT trigger any remote save.
   */
  private applyLanguage(langCode: string): void {
    this.translate.use(langCode).subscribe({
      next: () => {
        this.currentLangSignal.set(langCode);
        this.currentLangSubject.next(langCode);
      },
      error: (err) => {
        console.error(`Failed to load translation for ${langCode}`, err);
      },
    });
  }

  private saveLanguageLocally(langCode: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, langCode);
    } catch (e) {
      console.warn('Unable to persist language in localStorage', e);
    }
  }

  private syncLanguageWithBackend(langCode: string): void {
    if (this.userEmail) {
      this.customerService.updateLanguagePreference(this.userEmail, langCode).subscribe({
        error: (err) => {
          console.error('Unable to save language preference to backend', err);
        },
      });
    }
  }
}
