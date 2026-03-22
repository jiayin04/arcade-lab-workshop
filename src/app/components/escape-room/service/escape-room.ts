import { Injectable, signal, computed } from '@angular/core';
import {
  GamePhase, RoomId, GameType, NarrChoice, TerminalDef,
} from '../models/escape';

// Angular concept: @Injectable + providedIn: 'root'
// This service IS the dependency injection demo — every component gets the
// same instance via inject(), sharing state reactively through signals.

export const TERMINALS: TerminalDef[] = [
  {
    id: 0,
    loc: 'TERMINAL-01 — SIGNAL CORE',
    lines: [
      'The terminal flickers with a dying glow.',
      '"ERROR: Reactive chain severed."',
      '"signal() nodes are disconnected from their computed() chain."',
      '"Navigate the data stream. Collect 5 signal nodes."',
      '"Restore the reactivity engine."',
    ],
    game: 'snake',
    tag: 'TERMINAL-01 — SIGNAL STREAM',
  },
  {
    id: 1,
    loc: 'TERMINAL-02 — COMPONENT MAP',
    lines: [
      'Fragments of the component tree flash across the screen.',
      '"WARNING: Tree structure corrupted."',
      '"Pairs of Angular concepts have been scrambled in memory."',
      '"Match each concept to restore the component architecture."',
    ],
    game: 'memory',
    tag: 'TERMINAL-02 — COMPONENT RECONSTRUCTION',
  },
  {
    id: 2,
    loc: 'TERMINAL-03 — TEMPLATE DEBUGGER',
    lines: [
      'The screen shows a partially compiled template.',
      '"CRITICAL: Binding syntax corrupted."',
      '"A rogue bug is scrambling template tokens mid-compilation."',
      '"Chase it down — collect only VALID Angular binding syntax."',
      '"One wrong token corrupts the entire template. Stay sharp."',
    ],
    game: 'debug',
    tag: 'TERMINAL-03 — TEMPLATE DEBUGGER',
  },
  {
    id: 3,
    loc: 'TERMINAL-04 — DEPENDENCY INJECTOR',
    lines: [
      'The mainframe screen pulses with fragments of falling code.',
      '"FATAL: inject() chain severed."',
      '"Service declarations are falling through the component tree."',
      '"Catch each service and drop it into the correct component."',
      '"Wrong placement blows a fuse. Three fuses remain."',
    ],
    game: 'codedrop',
    tag: 'TERMINAL-04 — CODE DROP',
  },
];

@Injectable({ providedIn: 'root' })
export class EscapeRoomService {
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
    this.activeTerminal.set(terminal);
    this.activeGame.set(TERMINALS[terminal].game);
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

    const resultLines: Record<number, string> = {
      0: '"SIGNAL CORE: RESTORED. Reactivity engine online."',
      1: '"COMPONENT MAP: REBUILT. Tree structure valid."',
      2: '"TEMPLATE DEBUGGER: CLEAN. All bindings verified."',
      3: '"DEPENDENCY INJECTOR: WIRED. All services connected."',
    };

    this.goNarrative(
      'SYSTEM LOG',
      [
        '>> ' + resultLines[idx],
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
}