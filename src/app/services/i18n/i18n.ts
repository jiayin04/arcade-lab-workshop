import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type AppLocale = 'en' | 'ms' | 'zh';

export interface LocaleOption {
  code: AppLocale;
  label: string;
  nativeName: string;
  flag: string;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en', label: 'EN',  nativeName: 'English',         flag: '🇬🇧' },
  { code: 'ms', label: 'BM',  nativeName: 'Bahasa Malaysia', flag: '🇲🇾' },
  { code: 'zh', label: '中文', nativeName: '中文 (简体)',       flag: '🇨🇳' },
];

type TranslationMap = Record<string, string>;

const STORAGE_KEY = 'aal-locale';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private http = inject(HttpClient);

  readonly locale       = signal<AppLocale>(this.loadSavedLocale());
  private translations  = signal<TranslationMap>({});
  readonly loading      = signal(true);
  readonly locales      = LOCALE_OPTIONS;

  readonly activeOption = computed(() =>
    LOCALE_OPTIONS.find(l => l.code === this.locale()) ?? LOCALE_OPTIONS[0]
  );

  constructor() {
    this.loadTranslations(this.locale());
  }

  /** Translate a key — falls back to the key itself if not yet loaded */
  t(key: string): string {
    return this.translations()[key] ?? key;
  }

  setLocale(code: AppLocale): void {
    if (code === this.locale()) return;
    this.locale.set(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
    this.loadTranslations(code);
  }

  private loadTranslations(code: AppLocale): void {
    this.loading.set(true);

    const url = `assets/i18n/${code}.json`;

    this.http.get<TranslationMap>(url).subscribe({
      next: (data) => {
        this.translations.set(data);
        this.loading.set(false);
        console.log(`[i18n] Loaded locale "${code}" (${Object.keys(data).length} keys)`);
      },
      error: (err) => {
        console.error(`[i18n] Failed to load "${url}". Make sure src/assets/i18n/${code}.json exists and angular.json assets config includes src/assets.`, err);

        // Fallback to English
        if (code !== 'en') {
          this.http.get<TranslationMap>('assets/i18n/en.json').subscribe({
            next: (data) => { this.translations.set(data); this.loading.set(false); },
            error: (e) => {
              console.error('[i18n] Fallback to en.json also failed. HttpClient may not be provided — add provideHttpClient() to app.config.ts', e);
              this.loading.set(false);
            },
          });
        } else {
          this.loading.set(false);
        }
      },
    });
  }

  private loadSavedLocale(): AppLocale {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as AppLocale | null;
      if (stored && LOCALE_OPTIONS.some(l => l.code === stored)) return stored;
    } catch {}
    return 'en';
  }
}