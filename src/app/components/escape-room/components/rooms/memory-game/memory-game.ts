import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject, signal,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';
import { MemoryPairRow } from '../../../models/escape-room-content';
import { AppDataService } from '../../../../../services/app-data/app-data';
import { UpperCasePipe } from '@angular/common';

interface MemCard { id: number; emoji: string; label: string; description: string; flipped: boolean; matched: boolean; }

@Component({
  selector: 'app-memory-game',
  standalone: true,
  imports: [UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './memory-game.html',
  styleUrl: './memory-game.scss',
})
export class MemoryGame {
  protected er = inject(EscapeRoomService);
  private appData = inject(AppDataService);

  private pairRows(): MemoryPairRow[] {
    return this.appData.escapeRoomContent()?.memoryGame.pairs ?? [];
  }

  readonly TOTAL = computed(() => this.pairRows().length);
  isClosing = signal(false);

  flashcard = signal<{ emoji: string; label: string; description: string } | null>(null);
  private flashTimer: ReturnType<typeof setTimeout> | null = null;

  cards = signal<MemCard[]>([]);
  private flipped = signal<number[]>([]);
  private locked = signal(false);

  matchCount = computed(() => this.cards().filter(c => c.matched).length / 2);

  constructor() { this.newGame(); }

  newGame(): void {
    const rows = this.pairRows();
    const deck = [...rows, ...rows]
      .sort(() => Math.random() - 0.5)
      .map((row, id): MemCard => ({
        id,
        emoji: row.emoji,
        label: row.label,
        description: row.description,
        flipped: false,
        matched: false,
      }));
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

        if (this.matchCount() >= this.TOTAL()) {
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