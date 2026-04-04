import {
  Component, inject, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectionStrategy, signal, HostListener, computed,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';
import { DebugToken } from '../../../models/escape';
import { AppDataService } from '../../../../../services/app-data/app-data';

const W = 650, H = 460, GROUND = H - 22, PW = 52, PH = 6;

const MOVE_KEYS = ['ArrowLeft', 'ArrowRight', 'a', 'd'];

@Component({
  selector: 'app-debug-runner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './debug-runner.html',
  styleUrl: './debug-runner.scss',
})
export class DebugRunner implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected er = inject(EscapeRoomService);
  private appData = inject(AppDataService);

  readonly W = W; readonly H = H;
  readonly TOTAL = computed(() => this.validList().length);

  private validList(): string[] {
    return this.appData.escapeRoomContent()?.debugRunner.valid ?? [];
  }

  private invalidList(): string[] {
    return this.appData.escapeRoomContent()?.debugRunner.invalid ?? [];
  }

  private drUi() {
    return this.appData.escapeRoomContent()?.debugRunner.ui;
  }

  score = signal(0);
  lives = signal(3);
  running = signal(false);

  livesDisplay = () =>
    [...Array(this.lives()).fill('■'), ...Array(3 - this.lives()).fill('□')].join(' ');

  private px = W / 2 - PW / 2;
  private tokens: DebugToken[] = [];
  private validLeft: string[] = [];
  private inFlight = new Set<number>();
  private frame = 0;
  private raf = 0;
  private keys: Record<string, boolean> = {};

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngAfterViewInit(): void { this.drawIdle(); }
  ngOnDestroy(): void { cancelAnimationFrame(this.raf); }

  // ── Input ────────────────────────────────────────────────────────────────
  @HostListener('window:keydown', ['$event'])
  onKD(e: KeyboardEvent): void {
    this.keys[e.key] = true;
    if (MOVE_KEYS.includes(e.key)) e.preventDefault();
  }

  @HostListener('window:keyup', ['$event'])
  onKU(e: KeyboardEvent): void { this.keys[e.key] = false; }

  // ── Public ───────────────────────────────────────────────────────────────
  startGame(): void {
    if (this.validList().length === 0) return;

    cancelAnimationFrame(this.raf);
    this.px = W / 2 - PW / 2;
    this.tokens = [];
    this.validLeft = [...this.validList()];
    this.inFlight.clear();
    this.frame = 0;
    this.score.set(0);
    this.lives.set(3);
    this.running.set(true);
    this.loop();
  }

  // ── Game loop ─────────────────────────────────────────────────────────────
  private loop(): void {
    const ctx = this.ctx();
    if (!ctx) return;

    this.frame++;
    this.movePlayer();
    if (this.frame % 55 === 0) this.spawnToken();
    this.updateTokens();
    this.drawFrame(ctx);

    if (this.lives() <= 0) {
      this.endGame(ctx, false);
      return;
    }
    if (this.score() >= this.validList().length) {
      this.endGame(ctx, true);
      return;
    }

    this.raf = requestAnimationFrame(() => this.loop());
  }

  private movePlayer(): void {
    const goLeft = this.keys['ArrowLeft'] || this.keys['a'];
    const goRight = this.keys['ArrowRight'] || this.keys['d'];
    if (goLeft && this.px > 4) this.px -= 4;
    if (goRight && this.px < W - PW - 4) this.px += 4;
  }

  private updateTokens(): void {
    this.tokens = this.tokens.filter(t => {
      if (t.collected) return false;

      t.y += t.speed;

      const tw = t.text.length * 7 + 14;
      const hitX = t.x + tw > this.px && t.x < this.px + PW;
      const hitY = t.y + 18 > GROUND - PH && t.y < GROUND;
      const missed = t.y >= H + 20;

      if (hitX && hitY) {
        t.collected = true;
        this.collectToken(t);
        return false;
      }

      if (missed) {
        if (t.valid && t.validIndex >= 0) this.inFlight.delete(t.validIndex);
        return false;
      }

      return true;
    });
  }

  private collectToken(t: DebugToken): void {
    if (t.valid) {
      this.score.update(s => s + 1);
      if (t.validIndex >= 0) {
        this.validLeft.splice(t.validIndex, 1);
        this.inFlight.delete(t.validIndex);
      }
    } else {
      this.lives.update(l => l - 1);
    }
  }

  private endGame(ctx: CanvasRenderingContext2D, won: boolean): void {
    const ui = this.drUi();
    this.running.set(false);
    if (won) {
      this.drawMessage(ctx, ui?.winTitle ?? 'ALL BINDINGS RESTORED', 'rgba(0,200,80,0.85)');
      setTimeout(() => this.er.solveTerminal(2), 1400);
    } else {
      this.drawMessage(
        ctx,
        ui?.loseTitle ?? 'TEMPLATE CORRUPTED',
        'rgba(200,80,80,0.85)',
        ui?.loseRetry ?? 'Press ▶ RUN DEBUGGER to retry'
      );
    }
  }

  // ── Spawn ─────────────────────────────────────────────────────────────────
  private spawnToken(): void {
    const availableIndices = this.validLeft
      .map((_, i) => i)
      .filter(i => !this.inFlight.has(i));

    const spawnValid = availableIndices.length > 0 && Math.random() > 0.42;
    const vl = this.validList();
    const progress = vl.length ? this.score() / vl.length : 0;
    const speedBoost = progress * 1.2;

    let text: string;
    let validIndex = -1;

    if (spawnValid) {
      validIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      text = this.validLeft[validIndex];
      this.inFlight.add(validIndex);
    } else {
      const inv = this.invalidList();
      text = inv.length ? inv[Math.floor(Math.random() * inv.length)] : '';
    }

    if (!text) return;

    this.tokens.push({
      x: Math.random() * (W - 110) + 5,
      y: -22,
      text,
      valid: spawnValid,
      speed: 1.2 + Math.random() * 0.7 + speedBoost,
      collected: false,
      validIndex,
    });
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  private drawFrame(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#020206';
    ctx.fillRect(0, 0, W, H);

    this.drawScanLines(ctx);
    this.drawGround(ctx);
    this.drawTokens(ctx);
    this.drawPlayer(ctx);
  }

  private drawScanLines(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'rgba(200,160,80,0.025)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  private drawGround(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'rgba(200,160,80,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
  }

  private drawTokens(ctx: CanvasRenderingContext2D): void {
    this.tokens.forEach(t => {
      const tw = t.text.length * 7 + 14;
      const col = t.valid ? 'rgba(0,200,80,0.85)' : 'rgba(200,60,60,0.8)';
      const bg = t.valid ? 'rgba(0,200,80,0.07)' : 'rgba(200,60,60,0.07)';

      ctx.fillStyle = bg; ctx.fillRect(t.x, t.y, tw, 20);
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(t.x, t.y, tw, 20);
      ctx.fillStyle = col;
      ctx.font = '10px "Fira Code"'; ctx.textAlign = 'left';
      ctx.fillText(t.text, t.x + 6, t.y + 14);
    });
  }

  private drawPlayer(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(200,160,80,0.9)';
    ctx.fillRect(this.px, GROUND - PH, PW, PH);

    ctx.fillStyle = 'rgba(200,160,80,0.25)';
    ctx.fillRect(this.px, GROUND, PW, 3);

    ctx.fillStyle = 'rgba(200,160,80,0.45)';
    ctx.font = '7px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('DEBUGGER', this.px + PW / 2, GROUND - PH - 4);
  }

  private drawMessage(ctx: CanvasRenderingContext2D, msg: string, col: string, sub?: string): void {
    ctx.fillStyle = 'rgba(0,0,0,0.68)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = col;
    ctx.font = '25px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText(msg, W / 2, H / 2 - 8);

    if (sub) {
      ctx.fillStyle = 'rgba(200,160,80,0.4)';
      ctx.font = '15px "Share Tech Mono"';
      ctx.fillText(sub, W / 2, H / 2 + 12);
    }
  }

  private drawIdle(): void {
    const ctx = this.ctx();
    if (!ctx) return;

    const ui = this.drUi();
    ctx.fillStyle = '#020206'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(200,160,80,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
    ctx.fillStyle = 'rgba(200,160,80,0.28)';
    ctx.font = '15px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText(ui?.idle ?? 'PRESS ▶ RUN DEBUGGER', W / 2, H / 2);
  }

  // ── Util ──────────────────────────────────────────────────────────────────
  private ctx(): CanvasRenderingContext2D | null {
    return this.canvasRef?.nativeElement.getContext('2d') ?? null;
  }
}