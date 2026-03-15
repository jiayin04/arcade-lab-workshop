import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-games',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'games.html',
  styleUrl: './games.scss',
})
export class Games {
  @Input() title = 'Game';

  protected themeService = inject(ThemeService);
  private router = inject(Router);

  close(): void {
    this.router.navigate(['/desktop']);
  }
}

