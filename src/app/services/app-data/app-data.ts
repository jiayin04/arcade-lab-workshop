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
      this.loadPromise = firstValueFrom(
        forkJoin({
          games: this.http.get<GameApp[]>('assets/data/games.json'),
          terminals: this.http.get<TerminalDef[]>('assets/data/escape-terminals.json'),
          escapeRoomContent: this.http.get<EscapeRoomContent>('assets/data/escape-room-content.json'),
        })
      ).then(({ games, terminals, escapeRoomContent }) => {
        this.games.set(games);
        this.terminals.set(terminals);
        this.escapeRoomContent.set(escapeRoomContent);
      });
    }
    return this.loadPromise;
  }
}
