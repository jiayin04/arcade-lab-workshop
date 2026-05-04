import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject, signal,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';
import { MemoryPairRow } from '../../../models/escape-room-content';
import { AppDataService } from '../../../../../services/app-data/app-data';

interface MemCard { id: number; emoji: string; label: string; description: string; flipped: boolean; matched: boolean; }

@Component({
  selector: 'app-memory-game',
  standalone: true,
  // imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './memory-game.html',
  styleUrl: './memory-game.scss',
})
export class MemoryGame {
  protected er = inject(EscapeRoomService);

  // TODO: WORKSHOP PART 2A - Dependency Injection
  // 1. We need data for the cards! Inject `AppDataService`.
  // private appData = ...

  // 2. Create a method or computed signal to grab the pairs:
  // private pairRows() { ... }

  private pairRows(): MemoryPairRow[] { return []; } // REMOVE ME during workshop

  readonly TOTAL = computed(() => this.pairRows().length);
  isClosing = signal(false);

  flashcard = signal<{ emoji: string; label: string; description: string } | null>(null);
  private flashTimer: ReturnType<typeof setTimeout> | null = null;

  private flipped = signal<number[]>([]);
  private locked = signal(false);


  // TODO: WORKSHOP PART 2B - Signals (Reactive State)
  // 3. Move the `cards` signal definition here with match count computed property.
  cards = []; // REMOVE ME DURING WORKSHOP
  matchCount = signal(0); // REMOVE ME DURING WORKSHOP

  closeFlashCard() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.flashcard.set(null);
      this.isClosing.set(false);
    }, 300);
  }
}