import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject, signal,
} from '@angular/core';
import { MemoryCard } from '../../../models/models';
import { ThemeService } from '../../../services/theme';
import { Games } from '../games';

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍑', '🫐'];

@Component({
  selector: 'app-memory',
  standalone: true,
  imports: [Games],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './memory.html',
  styleUrl: './memory.scss',
})
export class Memory {
  protected themeService = inject(ThemeService);

  readonly TOTAL_PAIRS = EMOJIS.length;

  // Angular 21: All state as signals
  cards = signal<MemoryCard[]>([]);
  private flipped = signal<number[]>([]);
  private locked = signal(false);

  matchCount = computed(() => this.cards().filter(c => c.matched).length);
  won = computed(() => this.matchCount() === this.TOTAL_PAIRS);

  constructor() {
    this.newGame();
  }

  newGame(): void {
    const pairs = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id): MemoryCard => ({ id, emoji, flipped: false, matched: false }));
    this.cards.set(pairs);
    this.flipped.set([]);
    this.locked.set(false);
  }

  flip(id: number): void {
    if (this.locked()) return;
    const card = this.cards()[id];
    if (card.flipped || card.matched) return;

    // Reveal the card
    this.cards.update(cs =>
      cs.map(c => c.id === id ? { ...c, flipped: true } : c)
    );

    const current = [...this.flipped(), id];
    this.flipped.set(current);

    if (current.length === 2) {
      this.locked.set(true);
      const [a, b] = current;
      const ca = this.cards()[a];
      const cb = this.cards()[b];

      if (ca.emoji === cb.emoji) {
        // Match!
        this.cards.update(cs =>
          cs.map(c => (c.id === a || c.id === b) ? { ...c, matched: true, flipped: false } : c)
        );
        this.flipped.set([]);
        this.locked.set(false);
      } else {
        // No match — flip back after delay
        setTimeout(() => {
          this.cards.update(cs =>
            cs.map(c => (c.id === a || c.id === b) ? { ...c, flipped: false } : c)
          );
          this.flipped.set([]);
          this.locked.set(false);
        }, 850);
      }
    }
  }
}
