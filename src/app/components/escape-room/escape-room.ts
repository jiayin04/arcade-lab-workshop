import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EscapeRoomService } from './service/escape-room';
import { AppDataService } from '../../services/app-data/app-data';
import { RoomScene } from './components/room-scene/room-scene';
import { Narrative } from './components/narrative/narrative';
import { SnakeGame } from './components/rooms/snake-game/snake-game';
import { MemoryGame } from './components/rooms/memory-game/memory-game';
import { DebugRunner } from './components/rooms/debug-runner/debug-runner';
import { CodeDrop } from './components/rooms/code-drop/code-drop';

@Component({
  selector: 'app-escape-room',
  standalone: true,
  imports: [
    CommonModule,
    RoomScene,
    Narrative,
    SnakeGame,
    MemoryGame,
    DebugRunner,
    CodeDrop,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escape-room.html',
  styleUrl: './escape-room.scss',
})
export class EscapeRoom {
  protected er = inject(EscapeRoomService);
  private router = inject(Router);
  private appData = inject(AppDataService);

  // Debug controls
  showDebug = false;
  show = true;

  get gameTag(): string {
    const idx = this.er.activeTerminal();
    const terminals = this.appData.terminals();
    return idx >= 0 && terminals[idx] ? terminals[idx].tag : 'PUZZLE';
  }

  /** TODO: Entry point — show opening narrative then go to room */
  startIntro(): void {
    const intro = this.appData.escapeRoomContent()?.intro;
    this.er.goRoom();
    this.er.goNarrative(
      intro?.loc ?? 'SERVER ROOM B-4',
      intro?.lines ?? [
        'The emergency lights cast everything red.',
        'Somewhere, a fan spins down to silence.',
        'Three terminals are dark. One blinks with a corrupted prompt.',
        'You need to fix the reactivity system first.',
      ],
      [],
      () => this.er.goRoom()
    );
  }

  exitToDesktop(): void {
    this.er.reset();
    // Clear corridor/mainframe narration flags for next play
    delete (window as any)['_erN1'];
    delete (window as any)['_erN2'];
    this.router.navigate(['/desktop']);
  }

  replay(): void {
    delete (window as any)['_erN1'];
    delete (window as any)['_erN2'];
    this.er.reset();
  }
}