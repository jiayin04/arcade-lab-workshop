import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject, signal,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';

interface MemCard { id: number; emoji: string; label: string; description: string; flipped: boolean; matched: boolean; }

// Angular concepts
const PAIRS: [string, string, string][] = [
  ['⚡', 'signal()', 'A reactive primitive that holds state. Reading it in a template creates a dependency; writing it triggers updates.'],
  ['🔄', 'computed()', 'Derives a value from other signals. Re-evaluates lazily only when its dependencies change.'],
  ['🧩', 'component', 'The basic UI building block — a class + template + styles packaged together with a selector.'],
  ['🌲', 'tree', 'The component tree is Angular\'s internal graph of all live component instances, top-down.'],
  ['💉', 'inject()', 'Functional API to retrieve a dependency from the current injection context without constructor params.'],
  ['📦', '@NgModule', 'The legacy organisational unit that declares, imports, and exports groups of related components/pipes.'],
  ['🔗', 'pipe', 'A pure transform applied in templates via the | operator (e.g. date, async, currency).'],
  ['🎯', 'directive', 'A class that adds behaviour to a DOM element — structural ([ngIf]) or attribute ([ngClass]).'],
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
  isClosing = signal(false);

  flashcard = signal<{ emoji: string; label: string; description: string } | null>(null);
  private flashTimer: ReturnType<typeof setTimeout> | null = null;

  cards = signal<MemCard[]>([]);
  private flipped = signal<number[]>([]);
  private locked = signal(false);

  matchCount = computed(() => this.cards().filter(c => c.matched).length / 2);

  constructor() { this.newGame(); }

  newGame(): void {
    const deck = [...PAIRS, ...PAIRS]
      .sort(() => Math.random() - 0.5)
      .map(([emoji, label, description], id): MemCard => ({ id, emoji, label, description, flipped: false, matched: false }));
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
        const matched = this.cards()[a];
        // Flash card shown
        this.flashcard.set({ emoji: matched.emoji, label: matched.label, description: matched.description });
        if (this.flashTimer) clearTimeout(this.flashTimer);
        this.flashTimer = setTimeout(() => this.closeFlashCard(), 4000);

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


  closeFlashCard() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.flashcard.set(null);
      this.isClosing.set(false);
    }, 300);
  }
}