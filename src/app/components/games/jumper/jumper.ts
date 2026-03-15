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
import { ThemeService } from '../../../services/theme';
import { Games } from '../games';

interface Obstacle { x: number; w: number; h: number; }

const W = 520, H = 155, GROUND = 125, PLAYER_X = 65;

@Component({
  selector: 'app-jumper',
  standalone: true,
  imports: [Games],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './jumper.html',
  styleUrl: './jumper.scss',
})
export class Jumper implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected themeService = inject(ThemeService);

  readonly W = W;
  readonly H = H;

  score   = signal(0);
  running = signal(false);

  private y    = 0;
  private vy   = 0;
  private obs: Obstacle[] = [];
  private spd  = 3.2;
  private frame = 0;
  private raf   = 0;

  ngAfterViewInit(): void {
    this.drawIdle();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      e.preventDefault();
      this.running() ? this.jump() : this.startGame();
    }
  }

  onTap(): void {
    this.running() ? this.jump() : this.startGame();
  }

  startGame(): void {
    cancelAnimationFrame(this.raf);
    this.y = 0; this.vy = 0; this.obs = [];
    this.spd = 3.2; this.frame = 0;
    this.score.set(0);
    this.running.set(true);
    this.loop();
  }

  private jump(): void {
    if (this.y >= 0) this.vy = -9.5;
  }

  private loop(): void {
    this.raf = requestAnimationFrame(() => this.loop());
    const ctx = this.getCtx(); if (!ctx) return;

    this.frame++;
    this.score.set(Math.floor(this.frame / 5));

    // Physics
    this.vy += 0.55;
    this.y = Math.min(0, this.y + this.vy);

    // Spawn obstacles
    const gap = Math.max(35, 80 - Math.floor(this.score() / 25));
    if (this.frame % gap === 0) {
      this.obs.push({ x: W, w: 14 + Math.random() * 10, h: 18 + Math.random() * 28 });
    }
    this.obs.forEach(o => o.x -= this.spd + this.score() / 300);
    this.obs = this.obs.filter(o => o.x > -30);
    this.spd = Math.min(8, 3.2 + this.score() / 200);

    this.render(ctx);
  }

  private render(ctx: CanvasRenderingContext2D): void {
    const isR = this.themeService.isRetro();
    const py  = GROUND + this.y;

    // Sky
    ctx.fillStyle = isR ? '#050510' : '#87ceeb';
    ctx.fillRect(0, 0, W, H);

    // Clouds (modern only)
    if (!isR) {
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      [[70, 22, 35, 12], [210, 18, 28, 10], [390, 24, 38, 13]].forEach(([cx, cy, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(cx + Math.sin(this.frame / 150) * 8, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Ground
    ctx.fillStyle = isR ? 'rgba(0,255,136,0.05)' : 'rgba(0,0,0,0.03)';
    for (let gx = 0; gx < W; gx += 20) {
      ctx.fillRect(gx, GROUND, 2, 4 + Math.sin(this.frame / 60 + gx / 30) * 2);
    }
    ctx.fillStyle = isR ? '#003300' : '#4caf50';
    ctx.fillRect(0, GROUND, W, H - GROUND);

    // Player
    if (isR) {
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(PLAYER_X - 8, py - 22, 16, 16);
      ctx.fillRect(PLAYER_X - 6, py - 6, 4, 8);
      ctx.fillRect(PLAYER_X + 2, py - 6, 4, 8);
      ctx.fillStyle = '#001a00';
      ctx.fillRect(PLAYER_X - 4, py - 18, 3, 3);
      ctx.fillRect(PLAYER_X + 3, py - 18, 3, 3);
    } else {
      // Body
      ctx.fillStyle = '#1565c0';
      ctx.beginPath(); ctx.ellipse(PLAYER_X, py - 11, 8, 11, 0, 0, Math.PI * 2); ctx.fill();
      // Head
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath(); ctx.arc(PLAYER_X, py - 25, 7, 0, Math.PI * 2); ctx.fill();
      // Legs
      ctx.fillStyle = '#1565c0';
      const legOff = Math.sin(this.frame * 0.3) * 3;
      ctx.fillRect(PLAYER_X - 5, py - 4, 4, 8 + legOff);
      ctx.fillRect(PLAYER_X + 1, py - 4, 4, 8 - legOff);
    }

    // Obstacles
    let dead = false;
    this.obs.forEach(o => {
      ctx.fillStyle = isR ? '#ff00aa' : '#5d4037';
      ctx.fillRect(o.x, GROUND - o.h, o.w, o.h);
      if (o.x < PLAYER_X + 9 && o.x + o.w > PLAYER_X - 8 && py - 22 < GROUND - o.h + o.h + 4) {
        dead = true;
      }
    });

    if (dead) this.gameOver(ctx);
  }

  private gameOver(ctx: CanvasRenderingContext2D): void {
    cancelAnimationFrame(this.raf);
    this.running.set(false);
    const isR = this.themeService.isRetro();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = isR ? '#ff00aa' : '#e53935';
    ctx.font = isR ? '8px "Press Start 2P"' : 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 8);
    ctx.fillStyle = isR ? '#ffcc00' : '#fff';
    ctx.font = isR ? '6px "Press Start 2P"' : '12px Inter';
    ctx.fillText(`Score: ${this.score()}`, W / 2, H / 2 + 12);
  }

  private drawIdle(): void {
    const ctx = this.getCtx(); if (!ctx) return;
    const isR = this.themeService.isRetro();
    ctx.fillStyle = isR ? '#050510' : '#87ceeb';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = isR ? '#003300' : '#4caf50';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = isR ? '#00ff88' : '#1b5e20';
    ctx.font = isR ? '8px "Press Start 2P"' : '13px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Press START or SPACE', W / 2, 75);
  }

  private getCtx(): CanvasRenderingContext2D | null {
    return this.canvasRef?.nativeElement.getContext('2d') ?? null;
  }
}
