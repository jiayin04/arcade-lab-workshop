import {
  Component, inject, ChangeDetectionStrategy, Input,
} from '@angular/core';
import { I18nService, LOCALE_OPTIONS } from '../../services/i18n/i18n';
import { ThemeService } from '../../services/theme/theme';

@Component({
  selector: 'app-lang-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './lang-toggle.html',
  styleUrl: './lang-toggle.scss',
})
export class LangToggle {
  @Input() compact = false;

  protected i18n = inject(I18nService);
  protected themeService = inject(ThemeService);
  protected locales = LOCALE_OPTIONS;
}
