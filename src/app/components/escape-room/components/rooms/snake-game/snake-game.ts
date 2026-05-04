import {
  Component, inject, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectionStrategy, signal, HostListener,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';
import { SnakePoint, SnakeDir } from '../../../models/escape';
import { DecimalPipe } from '@angular/common';
import { I18nService } from '../../../../../services/i18n/i18n';

const COLS = 32, ROWS = 20, CELL = 18, TARGET = 5;

@Component({
  selector: 'app-snake-game',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './snake-game.html',
  styleUrl: './snake-game.scss',
})
export class SnakeGame implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected er = inject(EscapeRoomService);
  i18nService = inject(I18nService);
  readonly COLS = COLS; readonly ROWS = ROWS; readonly CELL = CELL; readonly TARGET = TARGET;

  score   = signal(0);
  running = signal(false);

  private snake: SnakePoint[] = [];
  private dir: SnakeDir = 'r';
  private food: SnakePoint = { x: 20, y: 10 };
  private timer?: ReturnType<typeof setInterval>;

  ngAfterViewInit(): void { this.drawIdle(); }
  ngOnDestroy(): void     { this.stop(); }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.running()) return;
    const map: Record<string, SnakeDir> = { ArrowUp:'u', ArrowDown:'d', ArrowLeft:'l', ArrowRight:'r', w:'u', s:'d', a:'l', d:'r' };
    const opp: Record<SnakeDir, SnakeDir> = { u:'d', d:'u', l:'r', r:'l' };
    const next = map[e.key];
    if (next && opp[next] !== this.dir) {
      this.dir = next;
      if (e.key.startsWith('Arrow')) e.preventDefault();
    }
  }

  startGame(): void {
    this.stop();
    this.snake = [{ x: 16, y: 10 }, { x: 15, y: 10 }, { x: 14, y: 10 }];
    this.dir = 'r';
    this.score.set(0);
    this.food = this.rndFood();
    this.running.set(true);
    this.timer = setInterval(() => this.tick(), 115);
  }

  private tick(): void {
    const hd: SnakePoint = {
      x: this.snake[0].x + (this.dir === 'r' ? 1 : this.dir === 'l' ? -1 : 0),
      y: this.snake[0].y + (this.dir === 'd' ? 1 : this.dir === 'u' ? -1 : 0),
    };
    if (hd.x < 0 || hd.x >= COLS || hd.y < 0 || hd.y >= ROWS ||
        this.snake.some(s => s.x === hd.x && s.y === hd.y)) {
      this.stop(); this.running.set(false); this.drawGameOver(); return;
    }
    this.snake.unshift(hd);
    if (hd.x === this.food.x && hd.y === this.food.y) {
      this.score.update(s => s + 1);
      if (this.score() >= TARGET) {
        this.stop(); this.running.set(false); this.drawWin(); return;
      }
      this.food = this.rndFood();
    } else { this.snake.pop(); }
    this.drawFrame();
  }

  private drawFrame(): void {
    const ctx = this.ctx(); if (!ctx) return;
    const W = COLS * CELL, H = ROWS * CELL;
    ctx.fillStyle = '#040408'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(200,160,80,0.07)'; ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += CELL) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    this.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? 'rgba(200,160,80,1)' : `rgba(200,160,80,${Math.max(0.2, 0.92 - i * 0.04)})`;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.fillStyle = 'rgba(255,80,80,0.9)';
    ctx.beginPath(); ctx.arc(this.food.x * CELL + CELL / 2, this.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2); ctx.fill();
  }

  private drawIdle(): void {
    const ctx = this.ctx(); if (!ctx) return;
    const W = COLS * CELL, H = ROWS * CELL;
    ctx.fillStyle = '#040408'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(200,160,80,0.07)'; ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += CELL) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(200,160,80,0.55)'; ctx.font = '12px "Share Tech Mono"'; ctx.textAlign = 'center';
    ctx.fillText('PRESS INITIALISE', W / 2, H / 2);
  }

  private drawGameOver(): void {
    const ctx = this.ctx(); if (!ctx) return;
    const W = COLS * CELL, H = ROWS * CELL;
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(200,80,80,0.9)'; ctx.font = '16px "Share Tech Mono"'; ctx.textAlign = 'center';
    ctx.fillText('SIGNAL LOST', W / 2, H / 2 - 10);
    ctx.fillStyle = 'rgba(200,160,80,0.7)'; ctx.font = '13px "Share Tech Mono"';
    ctx.fillText('Press INITIALISE to retry', W / 2, H / 2 + 14);
  }

  private drawWin(): void {
    const ctx = this.ctx(); if (!ctx) return;
    const W = COLS * CELL, H = ROWS * CELL;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,200,80,0.9)'; ctx.font = '16px "Share Tech Mono"'; ctx.textAlign = 'center';
    ctx.fillText('SIGNAL RESTORED', W / 2, H / 2);
    setTimeout(() => this.er.solveTerminal(0), 1400);
  }

  private stop(): void { if (this.timer) { clearInterval(this.timer); this.timer = undefined; } }
  private rndFood(): SnakePoint {
    let p: SnakePoint;
    do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (this.snake.some(s => s.x === p.x && s.y === p.y));
    return p;
  }
  private ctx(): CanvasRenderingContext2D | null {
    return this.canvasRef?.nativeElement.getContext('2d') ?? null;
  }
}