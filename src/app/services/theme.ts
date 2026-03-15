import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'retro' | 'modern';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>('retro');

  readonly isRetro = computed(() => this.theme() === 'retro');
  readonly isModern = computed(() => this.theme() === 'modern');

  readonly themeClass = computed(() =>
    this.theme() === 'retro' ? 'theme-retro' : 'theme-modern'
  );

  setTheme(t: Theme): void {
    this.theme.set(t);
  }

  toggleTheme(): void {
    this.theme.update(t => (t === 'retro' ? 'modern' : 'retro'));
  }
}
