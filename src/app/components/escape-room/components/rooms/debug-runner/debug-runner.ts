import {
  Component, inject, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectionStrategy, signal, HostListener,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';
import { DebugToken } from '../../../models/escape';

const VALID   = ['[value]', '(click)', '[(ngModel)]', '*ngFor', '[class]', '(change)'];
const INVALID = ['{{ngFor}}', '[click]', '(value)=', 'ngModel', '*ngClass=', '#ref()'];
const W = 500, H = 260, GROUND = H - 22, PW = 52, PH = 6;

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

  readonly W = W; readonly H = H; readonly TOTAL = VALID.length;

  score   = signal(0);
  lives   = signal(3);
  running = signal(false);

  livesDisplay = () => Array(this.lives()).fill('■').concat(Array(3 - this.lives()).fill('□')).join(' ');

  private px   = W / 2 - PW / 2;
  private tokens: DebugToken[] = [];
  private validLeft: string[] = [];
  private frame  = 0;
  private raf    = 0;
  private keys: Record<string, boolean> = {};

  ngAfterViewInit(): void { this.drawIdle(); }
  ngOnDestroy(): void     { cancelAnimationFrame(this.raf); }

  @HostListener('window:keydown', ['$event'])
  onKD(e: KeyboardEvent): void {
    this.keys[e.key] = true;
    if (['ArrowLeft','ArrowRight','a','d'].includes(e.key)) e.preventDefault();
  }

  @HostListener('window:keyup', ['$event'])
  onKU(e: KeyboardEvent): void { this.keys[e.key] = false; }

  startGame(): void {
    cancelAnimationFrame(this.raf);
    this.px = W / 2 - PW / 2;
    this.tokens = [];
    this.validLeft = [...VALID];
    this.frame = 0;
    this.score.set(0);
    this.lives.set(3);
    this.running.set(true);
    this.loop();
  }

  private loop(): void {
    const ctx = this.ctx(); if (!ctx) return;
    this.frame++;

    // Move player
    if ((this.keys['ArrowLeft'] || this.keys['a']) && this.px > 4)          this.px -= 4;
    if ((this.keys['ArrowRight'] || this.keys['d']) && this.px < W - PW - 4) this.px += 4;

    // Spawn tokens
    if (this.frame % 55 === 0) this.spawnToken();

    // Update & collide
    this.tokens = this.tokens.filter(t => {
      if (t.collected) return false;
      t.y += t.speed;
      const tw = t.text.length * 7 + 14;
      if (t.y + 18 > GROUND - PH && t.y < GROUND && t.x + tw > this.px && t.x < this.px + PW) {
        t.collected = true;
        if (t.valid) {
          this.score.update(s => s + 1);
        } else {
          this.lives.update(l => l - 1);
        }
        return false;
      }
      return t.y < H + 20;
    });

    this.drawFrame(ctx);

    // End conditions
    if (this.lives() <= 0) {
      this.running.set(false);
      this.drawMessage(ctx, 'TEMPLATE CORRUPTED', 'rgba(200,80,80,0.85)', 'Press ▶ RUN DEBUGGER to retry');
      return;
    }
    if (this.score() >= VALID.length) {
      this.running.set(false);
      this.drawMessage(ctx, 'ALL BINDINGS RESTORED', 'rgba(0,200,80,0.85)');
      setTimeout(() => this.er.solveTerminal(2), 1400);
      return;
    }

    this.raf = requestAnimationFrame(() => this.loop());
  }

  private drawFrame(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#020206'; ctx.fillRect(0, 0, W, H);

    // Scan lines
    ctx.strokeStyle = 'rgba(200,160,80,0.025)'; ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Ground
    ctx.strokeStyle = 'rgba(200,160,80,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();

    // Tokens
    this.tokens.forEach(t => {
      const tw = t.text.length * 7 + 14;
      const col = t.valid ? 'rgba(0,200,80,0.85)' : 'rgba(200,60,60,0.8)';
      ctx.fillStyle = t.valid ? 'rgba(0,200,80,0.07)' : 'rgba(200,60,60,0.07)';
      ctx.fillRect(t.x, t.y, tw, 20);
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(t.x, t.y, tw, 20);
      ctx.fillStyle = col; ctx.font = '10px "Fira Code"'; ctx.textAlign = 'left';
      ctx.fillText(t.text, t.x + 6, t.y + 14);
    });

    // Player cursor
    ctx.fillStyle = 'rgba(200,160,80,0.9)';
    ctx.fillRect(this.px, GROUND - PH, PW, PH);
    ctx.fillStyle = 'rgba(200,160,80,0.25)';
    ctx.fillRect(this.px, GROUND, PW, 3);
    ctx.fillStyle = 'rgba(200,160,80,0.45)';
    ctx.font = '7px "Share Tech Mono"'; ctx.textAlign = 'center';
    ctx.fillText('DEBUGGER', this.px + PW / 2, GROUND - PH - 4);
  }

  private drawMessage(ctx: CanvasRenderingContext2D, msg: string, col: string, sub?: string): void {
    ctx.fillStyle = 'rgba(0,0,0,0.68)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = col; ctx.font = '11px "Share Tech Mono"'; ctx.textAlign = 'center';
    ctx.fillText(msg, W / 2, H / 2 - 8);
    if (sub) {
      ctx.fillStyle = 'rgba(200,160,80,0.4)'; ctx.font = '9px "Share Tech Mono"';
      ctx.fillText(sub, W / 2, H / 2 + 12);
    }
  }

  private drawIdle(): void {
    const ctx = this.ctx(); if (!ctx) return;
    ctx.fillStyle = '#020206'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(200,160,80,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
    ctx.fillStyle = 'rgba(200,160,80,0.28)'; ctx.font = '10px "Share Tech Mono"'; ctx.textAlign = 'center';
    ctx.fillText('PRESS ▶ RUN DEBUGGER', W / 2, H / 2);
  }

  private spawnToken(): void {
    const isValid = Math.random() > 0.42 && this.validLeft.length > 0;
    let text: string;
    if (isValid) {
      const vi = Math.floor(Math.random() * this.validLeft.length);
      text = this.validLeft.splice(vi, 1)[0];
    } else {
      text = INVALID[Math.floor(Math.random() * INVALID.length)];
    }
    this.tokens.push({
      x: Math.random() * (W - 110) + 5,
      y: -22, text, valid: isValid,
      speed: 1.2 + Math.random() * 0.9,
      collected: false,
    });
  }

  private ctx(): CanvasRenderingContext2D | null {
    return this.canvasRef?.nativeElement.getContext('2d') ?? null;
  }
}