import {
  Component, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';

interface Slot { id: string; hint: string; correct: string; filled: string | null; state: 'idle'|'correct'|'wrong'; }

const SLOTS: Slot[] = [
  { id: 'nav',  hint: '[ NavbarComponent slot ]',  correct: 'NavbarComponent',  filled: null, state: 'idle' },
  { id: 'main', hint: '[ MainComponent slot ]',     correct: 'MainComponent',    filled: null, state: 'idle' },
  { id: 'card', hint: '[ child of Main — slot A ]', correct: 'CardComponent',    filled: null, state: 'idle' },
  { id: 'btn',  hint: '[ child of Main — slot B ]', correct: 'ButtonComponent',  filled: null, state: 'idle' },
];

const PIECES = ['NavbarComponent', 'CardComponent', 'ButtonComponent', 'MainComponent', 'FooterComponent'];

@Component({
  selector: 'app-room-component-vault',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './component-vault.html',
  styleUrl:    './component-vault.scss',
})
export class ComponentVault {
  protected er = inject(EscapeRoomService);

  pieces   = PIECES;
  slots    = signal<Slot[]>(SLOTS.map(s => ({ ...s })));
  selected = signal<string | null>(null);

  selectPiece(p: string): void {
    if (this.isPlaced(p)) return;
    this.selected.set(p);
    // this.er.log(`> Selected: ${p}`, 'info');
  }

  slotClick(slotId: string): void {
    const piece = this.selected();
    if (!piece) { 
      // this.er.log('> Pick a component first!', 'warn'); 
      return; }

    this.slots.update(slots => slots.map(s => {
      if (s.id !== slotId || s.filled) return s;
      const correct = s.correct === piece;
      if (correct) {
        // this.er.log(`> ${piece} placed correctly ✓`, 'sys');
        return { ...s, filled: piece, state: 'correct' };
      } else {
        // this.er.log('> Wrong slot — check the tree structure', 'err');
        setTimeout(() => {
          this.slots.update(ss => ss.map(x => x.id === slotId ? { ...x, filled: null, state: 'idle' } : x));
        }, 750);
        return { ...s, filled: piece, state: 'wrong' };
      }
    }));

    this.selected.set(null);

    if (this.slots().every(s => s.state === 'correct')) {
      setTimeout(() => {
        // this.er.log('> COMPONENT VAULT: SECURED ✓', 'sys');
        // this.er.log('> Tree structure: VALID', 'info');
        // this.er.completeRoom(1);
      }, 500);
    }
  }

  isPlaced(p: string): boolean {
    return this.slots().some(s => s.filled === p && s.state === 'correct');
  }
}