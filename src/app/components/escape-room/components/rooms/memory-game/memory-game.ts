import {
  Component, inject, signal, computed, ChangeDetectionStrategy,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';

interface MemCard { id: number; emoji: string; label: string; flipped: boolean; matched: boolean; }

// Angular concepts hidden as emoji pairs — the label shows the concept name on match
const PAIRS: [string, string][] = [
  ['⚡', 'signal()'],
  ['🔄', 'computed()'],
  ['🧩', 'component'],
  ['🌲', 'tree'],
  ['💉', 'inject()'],
  ['📦', '@NgModule'],
  ['🔗', 'pipe'],
  ['🎯', 'directive'],
];

@Component({
  selector: 'app-memory-game',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './memory-game.html',
  styleUrl: './memory-game.scss',
})
export class MemoryGame {
  protected er = inject(EscapeRoomService);

  readonly TOTAL = PAIRS.length;

  cards    = signal<MemCard[]>([]);
  private flipped = signal<number[]>([]);
  private locked  = signal(false);

  matchCount = computed(() => this.cards().filter(c => c.matched).length);

  constructor() { this.newGame(); }

  newGame(): void {
    const deck = [...PAIRS, ...PAIRS]
      .sort(() => Math.random() - 0.5)
      .map(([emoji, label], id): MemCard => ({ id, emoji, label, flipped: false, matched: false }));
    this.cards.set(deck);
    this.flipped.set([]);
    this.locked.set(false);
  }

  flip(id: number): void {
    if (this.locked()) return;
    const card = this.cards()[id];
    if (card.flipped || card.matched) return;

    this.cards.update(cs => cs.map(c => c.id === id ? { ...c, flipped: true } : c));
    const current = [...this.flipped(), id];
    this.flipped.set(current);

    if (current.length === 2) {
      this.locked.set(true);
      const [a, b] = current;
      if (this.cards()[a].emoji === this.cards()[b].emoji) {
        this.cards.update(cs => cs.map(c => (c.id === a || c.id === b) ? { ...c, matched: true, flipped: false } : c));
        this.flipped.set([]);
        this.locked.set(false);
        if (this.matchCount() >= this.TOTAL) {
          setTimeout(() => this.er.solveTerminal(1), 700);
        }
      } else {
        setTimeout(() => {
          this.cards.update(cs => cs.map(c => (c.id === a || c.id === b) ? { ...c, flipped: false } : c));
          this.flipped.set([]);
          this.locked.set(false);
        }, 900);
      }
    }
  }
}