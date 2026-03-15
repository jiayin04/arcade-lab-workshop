import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { SnakeDir, SnakePoint } from '../../../models/models';
import { ThemeService } from '../../../services/theme';
import { Games } from '../games';

const COLS = 22, ROWS = 14, CELL = 16;

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [Games],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './snake.html',
  styleUrl: './snake.scss',
})
export class Snake implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected themeService = inject(ThemeService);

  readonly COLS = COLS;
  readonly ROWS = ROWS;
  readonly CELL = CELL;

  score = signal(0);
  running = signal(false);

  private snake: SnakePoint[] = [];
  private dir: SnakeDir = 'r';
  private food: SnakePoint = { x: 15, y: 7 };
  private timer: ReturnType<typeof setInterval> | null = null;

  ngAfterViewInit(): void {
    this.drawIdle();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  startGame(): void {
    this.stop();
    this.snake = [{ x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }];
    this.dir = 'r';
    this.score.set(0);
    this.food = this.randomFood();
    this.running.set(true);
    this.timer = setInterval(() => this.tick(), 115);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.running()) return;
    const map: Record<string, SnakeDir> = {
      ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r',
      w: 'u', s: 'd', a: 'l', d: 'r',
    };
    const opp: Record<SnakeDir, SnakeDir> = { u: 'd', d: 'u', l: 'r', r: 'l' };
    const next = map[e.key];
    if (next && opp[next] !== this.dir) {
      this.dir = next;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    }
  }

  private tick(): void {
    const head = this.snake[0];
    const next: SnakePoint = {
      x: head.x + (this.dir === 'r' ? 1 : this.dir === 'l' ? -1 : 0),
      y: head.y + (this.dir === 'd' ? 1 : this.dir === 'u' ? -1 : 0),
    };

    if (
      next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS ||
      this.snake.some(s => s.x === next.x && s.y === next.y)
    ) {
      this.stop();
      this.running.set(false);
      this.drawGameOver();
      return;
    }

    this.snake.unshift(next);
    if (next.x === this.food.x && next.y === this.food.y) {
      this.score.update(s => s + 1);
      this.food = this.randomFood();
    } else {
      this.snake.pop();
    }
    this.draw();
  }

  private draw(): void {
    const ctx = this.getCtx(); if (!ctx) return;
    const W = COLS * CELL, H = ROWS * CELL;
    const isR = this.themeService.isRetro();
    ctx.fillStyle = isR ? '#050510' : '#e8f5e9';
    ctx.fillRect(0, 0, W, H);

    if (isR) {
      ctx.strokeStyle = 'rgba(0,255,136,0.04)'; ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }
    }

    this.snake.forEach((s, i) => {
      const alpha = Math.max(0.15, 0.95 - i * 0.04);
      if (isR) {
        ctx.fillStyle = i === 0 ? '#00ff88' : `rgba(0,255,136,${alpha})`;
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      } else {
        ctx.fillStyle = i === 0 ? '#2e7d32' : `rgba(46,125,50,${alpha})`;
        ctx.beginPath();
        ctx.roundRect?.(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 3);
        ctx.fill();
      }
    });

    if (isR) {
      ctx.fillStyle = '#ff00aa';
      ctx.fillRect(this.food.x * CELL + 2, this.food.y * CELL + 2, CELL - 4, CELL - 4);
    } else {
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc(this.food.x * CELL + CELL / 2, this.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawIdle(): void {
    const ctx = this.getCtx(); if (!ctx) return;
    const W = COLS * CELL, H = ROWS * CELL;
    const isR = this.themeService.isRetro();
    ctx.fillStyle = isR ? '#050510' : '#e8f5e9';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = isR ? '#00ff88' : '#2e7d32';
    ctx.font = isR ? '8px "Press Start 2P"' : '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Press START', W / 2, H / 2);
  }

  private drawGameOver(): void {
    const ctx = this.getCtx(); if (!ctx) return;
    const W = COLS * CELL, H = ROWS * CELL;
    const isR = this.themeService.isRetro();
    ctx.fillStyle = isR ? '#ff00aa' : '#e53935';
    ctx.font = isR ? '8px "Press Start 2P"' : 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 8);
    ctx.fillStyle = isR ? '#ffcc00' : '#555';
    ctx.font = isR ? '6px "Press Start 2P"' : '13px Inter';
    ctx.fillText(`Score: ${this.score()}`, W / 2, H / 2 + 14);
  }

  private stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  private randomFood(): SnakePoint {
    let p: SnakePoint;
    do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (this.snake.some(s => s.x === p.x && s.y === p.y));
    return p;
  }

  private getCtx(): CanvasRenderingContext2D | null {
    return this.canvasRef?.nativeElement.getContext('2d') ?? null;
  }
}

