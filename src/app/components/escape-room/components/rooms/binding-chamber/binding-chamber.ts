import {
  Component, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EscapeRoomService } from '../../../service/escape-room';

interface BindRow {
  id: string;
  label: string;
  target: string;
  hint: string;
  correct: string;
  chosen: string;
  state: 'idle' | 'correct' | 'wrong';
}

const ROWS: BindRow[] = [
  { id: 'b0', label: 'Display a value from class in template',  target: '[innerHTML]',   hint: 'one-way: class → template',  correct: '[ ]',   chosen: '', state: 'idle' },
  { id: 'b1', label: 'Handle a button click event',             target: '(click)',        hint: 'one-way: template → class',  correct: '( )',   chosen: '', state: 'idle' },
  { id: 'b2', label: 'Sync an input field with a class property',target: '[(ngModel)]',  hint: 'two-way: both directions',   correct: '[( )]', chosen: '', state: 'idle' },
  { id: 'b3', label: 'Iterate over a list in the DOM',          target: '*ngFor',         hint: 'structural: alters DOM',     correct: '* ',    chosen: '', state: 'idle' },
];

const OPTIONS = ['[ ]', '( )', '[( )]', '* '];

@Component({
  selector: 'app-room-binding-chamber',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './binding-chamber.html',
  styleUrl:    './binding-chamber.scss',
})
export class BindingChamber {
  protected er = inject(EscapeRoomService);

  rows    = signal<BindRow[]>(ROWS.map(r => ({ ...r })));
  options = OPTIONS;
  checked = signal(false);
  result  = signal<'none' | 'pass' | 'fail'>('none');

  setChoice(id: string, val: string): void {
    this.rows.update(rows => rows.map(r => r.id === id ? { ...r, chosen: val, state: 'idle' } : r));
    this.checked.set(false);
    this.result.set('none');
  }

  verify(): void {
    this.checked.set(true);
    let allOk = true;
    this.rows.update(rows => rows.map(r => {
      const ok = r.chosen === r.correct;
      if (!ok) allOk = false;
      return { ...r, state: ok ? 'correct' : (r.chosen ? 'wrong' : 'idle') };
    }));

    if (allOk) {
      this.result.set('pass');
      // this.er.log('> All bindings verified ✓', 'sys');
      setTimeout(() => {
        // this.er.log('> BINDING CHAMBER: RESTORED ✓', 'sys');
        // this.er.completeRoom(2);
      }, 1000);
    } else {
      this.result.set('fail');
      // this.er.log('> Binding mismatch detected', 'err');
    }
  }
}