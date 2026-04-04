import { Injectable, inject, signal, computed } from '@angular/core';
import {
  GamePhase, RoomId, GameType, NarrChoice,
} from '../models/escape';
import { AppDataService } from '../../../services/app-data/app-data';

// Angular concept: @Injectable + providedIn: 'root'
// This service IS the dependency injection demo — every component gets the
// same instance via inject(), sharing state reactively through signals.

@Injectable({ providedIn: 'root' })
export class EscapeRoomService {
  private appData = inject(AppDataService);
  // Angular concept: signal() — reactive primitive state
  readonly phase        = signal<GamePhase>('intro');
  readonly currentRoom  = signal<RoomId>(0);
  readonly activeGame   = signal<GameType | null>(null);
  readonly activeTerminal = signal<number>(-1);

  // solved[0..3] — which terminals are fixed
  readonly solved = signal<boolean[]>([false, false, false, false]);

  // Narrative state
  readonly narrLoc     = signal('');
  readonly narrLines   = signal<string[]>([]);
  readonly narrChoices = signal<NarrChoice[]>([]);
  readonly narrCallback = signal<(() => void) | null>(null);

  // Angular concept: computed() — derived reactive value
  readonly solvedCount  = computed(() => this.solved().filter(Boolean).length);
  readonly allSolved    = computed(() => this.solved().every(Boolean));

  // ── Navigation ───────────────────────────────────────────
  goIntro():  void { this.phase.set('intro'); }
  goRoom():   void { this.phase.set('room'); }
  goNarrative(loc: string, lines: string[], choices: NarrChoice[], cb: (() => void) | null): void {
    this.narrLoc.set(loc);
    this.narrLines.set([...lines]);
    this.narrChoices.set(choices);
    this.narrCallback.set(cb);
    this.phase.set('narrative');
  }
  goGame(terminal: number): void {
    const terminals = this.appData.terminals();
    const def = terminals[terminal];
    if (!def) return;
    this.activeTerminal.set(terminal);
    this.activeGame.set(def.game);
    this.phase.set('game');
  }
  continueFromNarr(): void {
    const cb = this.narrCallback();
    this.phase.set('room');
    if (cb) cb();
  }

  // ── Room transition ───────────────────────────────────────
  setRoom(id: RoomId): void {
    this.currentRoom.set(id);
  }

  // ── Terminal completion ───────────────────────────────────
  solveTerminal(idx: number): void {
    const updated = [...this.solved()];
    updated[idx] = true;
    this.solved.set(updated);

    const line = this.appData.terminals()[idx]?.resultLine ?? '';

    this.goNarrative(
      'SYSTEM LOG',
      [
        '>> ' + line,
        '>> Systems online: ' + (this.solvedCount()) + '/4',
      ],
      [],
      () => {
        if (this.allSolved()) {
          setTimeout(() => this.phase.set('win'), 400);
        }
      }
    );
  }

  reset(): void {
    this.phase.set('intro');
    this.currentRoom.set(0);
    this.activeGame.set(null);
    this.activeTerminal.set(-1);
    this.solved.set([false, false, false, false]);
  }

  // ── Debug methods for scene jumping ──────────────────────
  debugGoToPhase(phase: GamePhase): void {
    this.phase.set(phase);
  }

  debugGoToRoom(roomId: RoomId): void {
    this.currentRoom.set(roomId);
    this.phase.set('room');
  }

  debugStartGame(terminal: number): void {
    this.goGame(terminal);
  }

  debugSolveTerminal(idx: number): void {
    this.solveTerminal(idx);
  }

  debugResetSolved(): void {
    this.solved.set([false, false, false, false]);
  }
}