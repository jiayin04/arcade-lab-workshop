import {
  Component, inject, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectionStrategy, signal, HostListener,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';
import { CodePiece, CodeSlot } from '../../../models/escape';

const CD_PAIRS = [
  { comp: 'UserDashboard', service: 'DataService' },
  { comp: 'LoginForm', service: 'AuthService' },
  { comp: 'ActivityLog', service: 'LogService' },
  { comp: 'NavGuard', service: 'RouterService' },
];

const CW = 680, CH = 450, SLOT_H = 55, PIECE_W = 158, PIECE_H = 50;

@Component({
  selector: 'app-code-drop',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-drop.html',
  styleUrl: './code-drop.scss',
})
export class CodeDrop implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected er = inject(EscapeRoomService);

  readonly CW = CW; readonly CH = CH; readonly TOTAL = CD_PAIRS.length;

  score = signal(0);
  fuses = signal(3);
  running = signal(false);

  fusesDisplay = () => Array(this.fuses()).fill('■').concat(Array(3 - this.fuses()).fill('□')).join(' ');

  private piece: CodePiece | null = null;
  private slots: CodeSlot[] = [];
  private queue: string[] = [];
  private qIdx = 0;
  private raf = 0;
  private frame = 0;
  private keys: Record<string, boolean> = {};

  ngAfterViewInit(): void { this.drawIdle(); }
  ngOnDestroy(): void { cancelAnimationFrame(this.raf); }

  @HostListener('window:keydown', ['$event'])
  onKD(e: KeyboardEvent): void {
    this.keys[e.key] = true;
    if (['ArrowLeft', 'ArrowRight', 'a', 'd', ' '].includes(e.key)) e.preventDefault();
    if (e.key === ' ' && this.piece) this.piece.fast = true;
  }

  @HostListener('window:keyup', ['$event'])
  onKU(e: KeyboardEvent): void {
    this.keys[e.key] = false;
    if (e.key === ' ' && this.piece) this.piece.fast = false;
  }

  startGame(): void {
    cancelAnimationFrame(this.raf);
    this.score.set(0);
    this.fuses.set(3);
    this.running.set(true);
    this.frame = 0;
    this.queue = CD_PAIRS.map(p => p.service).sort(() => Math.random() - 0.5);
    this.qIdx = 0;
    const slotW = CW / CD_PAIRS.length;
    this.slots = CD_PAIRS.map((p, i): CodeSlot => ({
      x: i * slotW, w: slotW, comp: p.comp, service: p.service, wired: false,
    }));
    this.piece = null;
    this.spawnPiece();
    this.loop();
  }

  private loop(): void {
    const ctx = this.ctx(); if (!ctx || !this.running()) return;
    this.frame++;

    const p = this.piece;
    if (p && !p.settled) {
      if ((this.keys['ArrowLeft'] || this.keys['a']) && p.x > 2) p.x -= 3.8;
      if ((this.keys['ArrowRight'] || this.keys['d']) && p.x < CW - p.w - 2) p.x += 3.8;
      p.y += p.fast ? 7 : 1.6;

      const landY = CH - SLOT_H - 14;
      if (p.y + p.h >= landY) {
        p.y = landY - p.h; p.settled = true;
        const pCenter = p.x + p.w / 2;
        const hit = this.slots.find(s => pCenter >= s.x && pCenter < s.x + s.w && !s.wired);
        if (hit && hit.service === p.svc) {
          hit.wired = true;
          this.score.update(s => s + 1);
        } else {
          this.fuses.update(f => f - 1);
        }
        setTimeout(() => {
          if (!this.running()) return;
          if (this.fuses() <= 0) return;
          this.piece = null;
          this.spawnPiece();
        }, 280);
      }
    }

    this.drawFrame(ctx);

    if (this.fuses() <= 0) {
      this.running.set(false);
      ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, CW, CH);
      ctx.fillStyle = 'rgba(200,80,80,0.85)'; ctx.font = '25px "Share Tech Mono"'; ctx.textAlign = 'center';
      ctx.fillText('INJECTOR OVERLOADED', CW / 2, CH / 2 - 8);
      ctx.fillStyle = 'rgba(200,160,80,0.42)'; ctx.font = '15px "Share Tech Mono"';
      ctx.fillText('Press ▶ START INJECTOR to retry', CW / 2, CH / 2 + 12);
      return;
    }
    if (this.score() >= CD_PAIRS.length) {
      this.running.set(false);
      ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, CW, CH);
      ctx.fillStyle = 'rgba(0,200,80,0.85)'; ctx.font = '25px "Share Tech Mono"'; ctx.textAlign = 'center';
      ctx.fillText('inject() CHAIN RESTORED', CW / 2, CH / 2);
      setTimeout(() => this.er.solveTerminal(3), 1400);
      return;
    }

    this.raf = requestAnimationFrame(() => this.loop());
  }

  private drawFrame(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#020206'; ctx.fillRect(0, 0, CW, CH);

    // Grid lines
    ctx.strokeStyle = 'rgba(200,160,80,0.022)'; ctx.lineWidth = 1;
    for (let y = 0; y < CH; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }

    // Component slots at bottom
    this.slots.forEach(s => {
      ctx.fillStyle = s.wired ? 'rgba(0,200,80,0.1)' : 'rgba(200,160,80,0.04)';
      ctx.fillRect(s.x + 2, CH - SLOT_H, s.w - 4, SLOT_H - 2);
      ctx.strokeStyle = s.wired ? 'rgba(0,200,80,0.4)' : 'rgba(200,160,80,0.16)';
      ctx.lineWidth = 1; ctx.strokeRect(s.x + 2, CH - SLOT_H, s.w - 4, SLOT_H - 2);
      ctx.fillStyle = s.wired ? 'rgba(0,200,80,0.8)' : 'rgba(200,160,80,0.6)';
      ctx.font = '11px "Fira Code"'; ctx.textAlign = 'center';
      ctx.fillText(s.comp, s.x + s.w / 2, CH - SLOT_H + 17);
      ctx.fillStyle = s.wired ? 'rgba(0,200,80,0.55)' : 'rgba(200,160,80,0.5)';
      ctx.font = '9px "Fira Code"';
      ctx.fillText(s.wired ? `inject(${s.service})` : 'inject(?)', s.x + s.w / 2, CH - SLOT_H + 33);
    });

    // Guide line for active piece
    const p = this.piece;
    if (p && !p.settled) {
      const pc = p.x + p.w / 2;
      this.slots.forEach(s => {
        if (pc >= s.x && pc < s.x + s.w && !s.wired) {
          const match = s.service === p.svc;
          ctx.strokeStyle = match ? 'rgba(0,200,80,0.16)' : 'rgba(200,60,60,0.12)';
          ctx.lineWidth = 1; ctx.setLineDash([4, 7]);
          ctx.beginPath(); ctx.moveTo(pc, p.y + p.h); ctx.lineTo(pc, CH - SLOT_H); ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Falling piece
      ctx.fillStyle = 'rgba(200,160,80,0.1)'; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = 'rgba(200,160,80,0.72)'; ctx.lineWidth = 1.5; ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = 'rgba(200,160,80,0.92)'; ctx.font = 'bold 10px "Fira Code"'; ctx.textAlign = 'center';
      ctx.fillText(`inject(${p.svc})`, p.x + p.w / 2, p.y + p.h / 2 + 4);
    }
  }

  private drawIdle(): void {
    const ctx = this.ctx(); if (!ctx) return;
    ctx.fillStyle = '#020206'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = 'rgba(200,160,80,0.28)'; ctx.font = '15px "Share Tech Mono"'; ctx.textAlign = 'center';
    ctx.fillText('PRESS ▶ START INJECTOR', CW / 2, CH / 2);
  }

  private spawnPiece(): void {
    const unwired = CD_PAIRS
      .filter(p => !this.slots.find(s => s.service === p.service && s.wired))
      .map(p => p.service);

    if (unwired.length === 0) return;

    // Pick randomly from the unwired pool
    const svc = unwired[Math.floor(Math.random() * unwired.length)];
    this.piece = {
      x: CW / 2 - PIECE_W / 2,
      y: -PIECE_H - 5,
      w: PIECE_W, h: PIECE_H,
      svc, fast: false, settled: false,
    };
  }

  private ctx(): CanvasRenderingContext2D | null {
    return this.canvasRef?.nativeElement.getContext('2d') ?? null;
  }
}
