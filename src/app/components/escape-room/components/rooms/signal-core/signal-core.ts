import {
  Component, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';

const CHOICES = ['price', 'quantity', 'total', 'discount', 'finalPrice'];
const CORRECT = ['quantity', 'total'] as const;

@Component({
  selector: 'app-room-signal-core',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signal-core.html',
  styleUrl: './signal-core.scss',
})
export class SignalCore {
  protected er = inject(EscapeRoomService);

  choices = CHOICES;
  slots = signal<[string | null, string | null]>([null, null]);
  slotState = signal<['idle' | 'correct' | 'wrong', 'idle' | 'correct' | 'wrong']>(['idle', 'idle']);
  activeSlot = signal<0 | 1 | null>(null);

  selectSlot(idx: 0 | 1): void {
    if (this.slots()[idx] !== null) return;
    this.activeSlot.set(idx);
  }

  choiceClick(c: string): void {
    const idx = this.activeSlot();
    if (idx === null) {
      // this.er.log('> Select a slot first!', 'warn'); 
      return;
    }
    if (this.slots()[idx] !== null) return;

    const correct = c === CORRECT[idx];
    const newSlots = [...this.slots()] as [string | null, string | null];
    newSlots[idx] = c;
    this.slots.set(newSlots);

    const newState = [...this.slotState()] as ['idle' | 'correct' | 'wrong', 'idle' | 'correct' | 'wrong'];
    newState[idx] = correct ? 'correct' : 'wrong';
    this.slotState.set(newState);
    this.activeSlot.set(null);

    if (correct) {
      // this.er.log(`> Signal "${c}" reconnected ✓`, 'sys');
    } else {
      // this.er.log('> Wrong signal — chain broken', 'err');
      setTimeout(() => {
        const reset = [...this.slots()] as [string | null, string | null];
        reset[idx] = null;
        this.slots.set(reset);
        const rs = [...this.slotState()] as ['idle' | 'correct' | 'wrong', 'idle' | 'correct' | 'wrong'];
        rs[idx] = 'idle';
        this.slotState.set(rs);
      }, 750);
    }

    if (this.slots()[0] === CORRECT[0] && this.slots()[1] === CORRECT[1]) {
      setTimeout(() => {
        // this.er.log('> SIGNAL CORE: RESTORED ✓', 'sys');
        // this.er.log('> Reactivity engine online', 'info');
        // this.er.completeRoom(0);
      }, 500);
    }
  }

  isUsed(c: string): boolean {
    return this.slots().includes(c);
  }
}