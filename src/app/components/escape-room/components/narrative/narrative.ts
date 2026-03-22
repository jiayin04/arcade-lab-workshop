import {
  Component, inject, OnInit, OnDestroy,
  signal, ChangeDetectionStrategy,
} from '@angular/core';
import { EscapeRoomService } from '../../service/escape-room';

@Component({
  selector: 'app-er-narrative',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './narrative.html',
  styleUrl:    './narrative.scss',
})
export class Narrative implements OnInit, OnDestroy {
  protected er = inject(EscapeRoomService);

  displayText = signal('');
  typing      = signal(true);

  private queue:  string[] = [];
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.queue = [...this.er.narrLines()];
    this.displayText.set('');
    this.typeLine();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private typeLine(): void {
    if (!this.queue.length) {
      this.typing.set(false);
      return;
    }
    const line = this.queue.shift()!;
    let i = 0;
    this.typing.set(true);
    this.displayText.set('');
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.displayText.set(line.slice(0, ++i));
      if (i >= line.length) {
        clearInterval(this.timer);
        setTimeout(() => this.typeLine(), 800);
      }
    }, 26);
  }

  cont(): void {
    clearInterval(this.timer);
    this.er.continueFromNarr();
  }
}