import {
  Component, inject, signal, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme/theme';
import { GameApp } from '../../models/model';
import { I18nService } from '../../services/i18n/i18n';
import { AppDataService } from '../../services/app-data/app-data';
import { LangToggle } from '../lang-toggle/lang-toggle';

@Component({
  selector: 'app-desktop',
  standalone: true,
  imports: [LangToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './desktop.html',
  styleUrl: './desktop.scss',
})
export class Desktop implements OnInit {
  @ViewChild('wallpaper') wallpaperRef!: ElementRef<HTMLCanvasElement>;

  protected themeService = inject(ThemeService);
  private router = inject(Router);
  protected i18nService = inject(I18nService);
  protected appData = inject(AppDataService);
  clock = signal('00:00');
  date = signal('');
  selectedId = signal<string | null>(null);

  private clockInterval?: ReturnType<typeof setInterval>;
  private wallpaperRaf = 0;
  private wallT = 0;

  ngOnInit(): void {
    this.tickClock();
    this.clockInterval = setInterval(() => this.tickClock(), 1000);
  }

  ngAfterViewInit(): void {
    this.animateWallpaper();
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
    cancelAnimationFrame(this.wallpaperRaf);
  }

  launch(game: GameApp): void {
    this.router.navigate([game.route]);
  }

  selectIcon(id: string): void {
    this.selectedId.set(id);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // ── Animated wallpaper ───────────────────────────────────────
  private animateWallpaper(): void {
    const draw = () => {
      this.wallpaperRaf = requestAnimationFrame(draw);
      this.wallT += 0.008;
      const canvas = this.wallpaperRef?.nativeElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
      const W = canvas.width, H = canvas.height;

      if (this.themeService.isRetro()) {
        this.drawRetroWallpaper(ctx, W, H);
      } else {
        this.drawModernWallpaper(ctx, W, H);
      }
    };
    draw();
  }

  private drawRetroWallpaper(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    const t = this.wallT;

    // Deep dark background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, W, H);

    // Perspective grid (80s synthwave style)
    const horizon = H * 0.52;
    const vanishX = W / 2;

    // Sky gradient (deep purple to black)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#0d0221');
    skyGrad.addColorStop(0.5, '#1e0845');
    skyGrad.addColorStop(1, '#2d0a6b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizon);

    // Stars
    for (let i = 0; i < 120; i++) {
      const sx = ((i * 137.5 + t * 5) % W);
      const sy = (i * 73.1) % horizon;
      const br = 0.4 + Math.sin(t * 2 + i) * 0.3;
      ctx.fillStyle = `rgba(255,255,255,${br})`;
      ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }

    // Synthwave sun / moon
    const sunY = horizon - 60;
    const sunGrad = ctx.createRadialGradient(vanishX, sunY, 0, vanishX, sunY, 90);
    sunGrad.addColorStop(0, '#ff00ff');
    sunGrad.addColorStop(0.4, '#c026d3');
    sunGrad.addColorStop(0.7, '#7c3aed');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(vanishX, sunY, 90, 0, Math.PI * 2);
    ctx.fill();

    // Sun horizontal scan lines (iconic synthwave)
    ctx.fillStyle = '#030712';
    for (let i = 0; i < 12; i++) {
      const lh = 3 + i * 0.5;
      ctx.fillRect(vanishX - 90, sunY - 40 + i * 9, 180, lh);
    }

    // Ground
    const groundGrad = ctx.createLinearGradient(0, horizon, 0, H);
    groundGrad.addColorStop(0, '#1a0040');
    groundGrad.addColorStop(1, '#050010');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizon, W, H - horizon);

    // Grid lines (floor) — scrolling via t
    const lineCount = 16;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;

    for (let i = 0; i <= lineCount; i++) {
      const p = ((i / lineCount) + (t * 0.3 % (1 / lineCount))) % 1;
      const y = horizon + p * (H - horizon);
      const spread = (y - horizon) / (H - horizon);
      const x1 = vanishX - spread * (W * 0.7);
      const x2 = vanishX + spread * (W * 0.7);
      ctx.globalAlpha = spread * 0.6;
      ctx.beginPath();
      ctx.moveTo(x1, y); ctx.lineTo(x2, y);
      ctx.stroke();
    }

    const vLineCount = 14;
    for (let i = 0; i <= vLineCount; i++) {
      const frac = i / vLineCount;
      const gx = vanishX + (frac - 0.5) * 2 * W * 0.7;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Neon "ARCADE" text glow
    ctx.save();
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(0,255,255,${0.15 + Math.sin(t * 1.5) * 0.8})`;
    ctx.fillText('ANGULAR ARCADE LAB', W / 2, horizon - 110);
    ctx.restore();
  }

  private drawModernWallpaper(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    const t = this.wallT;

    // Deep dark base — near-black with a subtle blue-purple tint
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, '#0a0e1a');
    base.addColorStop(0.35, '#0d1020');
    base.addColorStop(0.65, '#0f0d1e');
    base.addColorStop(1, '#0a1018');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // Soft dark aurora orbs
    const orbs = [
      { x: 0.15, y: 0.3, r: 0.38, c1: 'rgba(99,102,241,0.22)', c2: 'transparent', speed: 0.7 },
      { x: 0.75, y: 0.55, r: 0.42, c1: 'rgba(139,92,246,0.18)', c2: 'transparent', speed: 0.5 },
      { x: 0.5, y: 0.1, r: 0.3, c1: 'rgba(236,72,153,0.14)', c2: 'transparent', speed: 0.9 },
      { x: 0.88, y: 0.25, r: 0.28, c1: 'rgba(20,184,166,0.12)', c2: 'transparent', speed: 0.6 },
      { x: 0.1, y: 0.75, r: 0.32, c1: 'rgba(59,130,246,0.14)', c2: 'transparent', speed: 0.8 },
    ];

    orbs.forEach(o => {
      const ox = (o.x + Math.sin(t * o.speed + o.x * 3) * 0.06) * W;
      const oy = (o.y + Math.cos(t * o.speed + o.y * 3) * 0.05) * H;
      const r = o.r * Math.min(W, H);
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      g.addColorStop(0, o.c1);
      g.addColorStop(1, o.c2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Subtle dot grid
    ctx.fillStyle = 'rgba(99,102,241,0.04)';
    const spacing = 32;
    for (let x = spacing / 2; x < W; x += spacing) {
      for (let y = spacing / 2; y < H; y += spacing) {
        const dist = Math.sqrt((x - W / 2) ** 2 + (y - H / 2) ** 2);
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.8 - dist / 120);
        ctx.globalAlpha = 0.04 * pulse;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  private tickClock(): void {
    const now = new Date();
    this.clock.set(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
    this.date.set(
      now.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
    );
  }
}
