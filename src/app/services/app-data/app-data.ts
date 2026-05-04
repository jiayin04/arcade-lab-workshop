import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, firstValueFrom } from 'rxjs';
import { GameApp } from '../../models/model';
import { TerminalDef } from '../../components/escape-room/models/escape';
import { EscapeRoomContent } from '../../components/escape-room/models/escape-room-content';

@Injectable({ providedIn: 'root' })
export class AppDataService {
  private http = inject(HttpClient);

  readonly games = signal<GameApp[]>([]);
  readonly terminals = signal<TerminalDef[]>([]);
  readonly escapeRoomContent = signal<EscapeRoomContent | null>(null);

  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (!this.loadPromise) {
      // TODO: WORKSHOP PART 1 - HTTP & Data Fetching
      // 1. We need to fetch 3 files simultaneously: 
      //    'assets/data/games.json'
      //    'assets/data/escape-terminals.json'
      //    'assets/data/escape-room-content.json'
      // 2. Use `firstValueFrom` and `forkJoin` to fetch them in parallel using `this.http.get`.
      // 3. When they resolve, use `.then(...)` to `.set()` the 3 signals above: games, terminals, escapeRoomContent.

      this.loadPromise = Promise.resolve(); // REMOVE ME during workshop

    }
    return this.loadPromise;
  }
}
