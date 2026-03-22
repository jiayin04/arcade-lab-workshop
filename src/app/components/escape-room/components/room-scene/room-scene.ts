import {
  Component, inject, AfterViewInit, OnDestroy,
  ElementRef, ViewChild, ChangeDetectionStrategy, signal,
} from '@angular/core';
import { EscapeRoomService, TERMINALS } from '../../service/escape-room';
import { RoomHotspot, RoomId } from '../../models/escape';

@Component({
  selector: 'app-room-scene',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-scene.html',
  styleUrl:    './room-scene.scss',
})
export class RoomScene implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected er = inject(EscapeRoomService);
  hotspots = signal<RoomHotspot[]>([]);

  private cv!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animId = 0;
  private dustT  = 0;
  private hsRegistered = false;

  ngAfterViewInit(): void {
    this.cv  = this.canvasRef.nativeElement;
    this.ctx = this.cv.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', this.onResize);
    this.loop();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    this.cv.width  = this.cv.offsetWidth  || window.innerWidth;
    this.cv.height = this.cv.offsetHeight || window.innerHeight;
    this.hsRegistered = false;
    this.hotspots.set([]);
  };

  private resize(): void {
    this.cv.width  = this.cv.offsetWidth  || window.innerWidth;
    this.cv.height = this.cv.offsetHeight || window.innerHeight;
  }

  private loop(): void {
    this.animId = requestAnimationFrame(() => this.loop());
    this.dustT += 0.016;
    const id = this.er.currentRoom();
    if (!this.hsRegistered) {
      this.hsRegistered = true;
      this.hotspots.set([]);
      this.registerHotspots(id);
    }
    if      (id === 0) this.drawServerRoom();
    else if (id === 1) this.drawCorridor();
    else if (id === 2) this.drawMainframe();
  }

  // ─────────────────────────────────────────────────────────
  // HOTSPOTS — correct terminal-to-room mapping
  // Room 0: T01, T02 only   Room 1: T03 only   Room 2: T04 only
  // ─────────────────────────────────────────────────────────
  private registerHotspots(id: RoomId): void {
    const W = this.cv.width, H = this.cv.height;

    if (id === 0) {
      const rW = W * 0.11, rH = H * 0.42, rY = H * 0.1;
      this.hotspots.set([
        {
          x: W * 0.1 + rW * 0.1, y: rY + rH * 0.2, w: rW * 0.8, h: rH * 0.5,
          label: 'TERMINAL-01 [SIGNAL CORE]',
          action: () => this.interactTerminal(0),
        },
        {
          x: W * 0.26 + rW * 0.1, y: rY + rH * 0.2, w: rW * 0.8, h: rH * 0.5,
          label: 'TERMINAL-02 [COMPONENT MAP]',
          action: () => this.interactTerminal(1),
        },
        {
          x: W * 0.88, y: H * 0.2, w: W * 0.1, h: H * 0.35,
          label: 'CORRIDOR →',
          action: () => {
            if (!this.er.solved()[0] || !this.er.solved()[1]) {
              this.narr('SEALED DOOR', ['Restore Terminal 01 and Terminal 02 first.'], [], null);
            } else { this.transitionRoom(1); }
          },
        },
      ]);
    }

    if (id === 1) {
      const dw = W * 0.22, dh = H * 0.38, dx = W / 2 - dw / 2, dy = H * 0.08;
      const px = W * 0.76, py = H * 0.22, pw = W * 0.12, ph = H * 0.32;
      this.hotspots.set([
        {
          x: dx, y: dy, w: dw, h: dh, label: 'MAINFRAME ROOM',
          action: () => {
            if (!this.er.solved()[2]) {
              this.narr('LOCKED', ['Fix Terminal 03 first to unlock the mainframe.'], [], null);
            } else { this.transitionRoom(2); }
          },
        },
        { x: px, y: py, w: pw, h: ph, label: 'TERMINAL-03 [TEMPLATE DEBUGGER]', action: () => this.interactTerminal(2) },
        { x: 0, y: H - 36, w: 180, h: 28, label: '← SERVER ROOM', action: () => this.transitionRoom(0) },
      ]);
    }

    if (id === 2) {
      const mw = W * 0.55, mh = H * 0.62, mx = (W - mw) / 2, my = (H - mh) / 2 - 10;
      const sw = mw * 0.42, sh = mh * 0.22, sx = mx + (mw - sw) / 2, sy = my + mh * 0.08;
      const spots: RoomHotspot[] = [
        { x: 0, y: H - 36, w: 150, h: 28, label: '← CORRIDOR', action: () => this.transitionRoom(1) },
      ];
      if (!this.er.solved()[3]) {
        spots.push({ x: sx, y: sy, w: sw, h: sh, label: 'TERMINAL-04 [DEPENDENCY INJECTOR]', action: () => this.interactTerminal(3) });
      }
      this.hotspots.set(spots);
    }
  }

  // ─────────────────────────────────────────────────────────
  // ROOM 0 — Server Room
  // High-contrast: dark charcoal walls, visible rack panels,
  // bright LEDs, warm amber accents throughout
  // ─────────────────────────────────────────────────────────
  private drawServerRoom(): void {
    const c = this.ctx, W = this.cv.width, H = this.cv.height, cx = W / 2;

    // ── Background ──
    // Floor — warm dark brown, clearly different from wall
    c.fillStyle = '#1e1510';
    c.fillRect(0, H * 0.58, W, H);

    // Wall — cool dark grey-purple, clearly separate from floor
    c.fillStyle = '#1a1520';
    c.fillRect(0, 0, W, H * 0.58);

    // Horizon divider line — visible amber
    c.strokeStyle = '#5a4a28';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, H * 0.58); c.lineTo(W, H * 0.58); c.stroke();

    // Ceiling trim
    c.fillStyle = '#0e0b12';
    c.fillRect(0, 0, W, H * 0.06);
    c.strokeStyle = '#4a3a20';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, H * 0.06); c.lineTo(W, H * 0.06); c.stroke();

    // Floor tiles — subtle grid
    c.strokeStyle = 'rgba(100,80,50,0.25)';
    c.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
      const fy = H * 0.58 + i * (H * 0.42 / 10);
      c.beginPath(); c.moveTo(0, fy); c.lineTo(W, fy); c.stroke();
    }
    for (let i = 0; i < 12; i++) {
      c.beginPath(); c.moveTo(W * i / 12, H * 0.58); c.lineTo(W * i / 12, H); c.stroke();
    }

    // ── Emergency ceiling light ──
    const fl = Math.sin(this.dustT * 3) > 0.96 ? 0.3 : 1.0;
    c.fillStyle = `rgba(220,40,40,${fl})`;
    c.beginPath(); c.arc(cx, H * 0.03, 10, 0, Math.PI * 2); c.fill();
    // Red wash across ceiling
    const redW = c.createRadialGradient(cx, 0, 0, cx, 0, W * 0.5);
    redW.addColorStop(0, `rgba(200,20,20,${0.2 * fl})`);
    redW.addColorStop(1, 'transparent');
    c.fillStyle = redW;
    c.fillRect(0, 0, W, H * 0.3);

    // ── Server racks ──
    const rW = W * 0.11, rH = H * 0.44, rY = H * 0.1;
    [0.1, 0.26, 0.56, 0.72].forEach((xf, i) => {
      this.drawRack(W * xf, rY, rW, rH, i);
    });

    // ── Labels on interactive racks ──
    c.font = 'bold 9px "Share Tech Mono"';
    c.textAlign = 'center';
    c.fillStyle = '#c8a060';
    c.fillText('▲ T-01', W * 0.1 + rW / 2, rY - 8);
    c.fillText('▲ T-02', W * 0.26 + rW / 2, rY - 8);
    c.fillStyle = '#4a3a28';
    c.fillText('OFFLINE', W * 0.56 + rW / 2, rY - 8);
    c.fillText('OFFLINE', W * 0.72 + rW / 2, rY - 8);

    // ── Cable runs on ceiling ──
    c.strokeStyle = '#3a3040'; c.lineWidth = 4;
    [0.2, 0.35, 0.6, 0.75].forEach(xf => {
      c.beginPath(); c.moveTo(W * xf, 0); c.lineTo(W * xf, H * 0.1); c.stroke();
    });

    // ── Dust motes ──
    for (let d = 0; d < 20; d++) {
      const sx = (Math.sin(this.dustT * 0.3 + d * 1.7) * 0.5 + 0.5) * W;
      const sy = (Math.cos(this.dustT * 0.2 + d * 2.3) * 0.5 + 0.5) * H * 0.55;
      c.fillStyle = `rgba(200,160,80,${0.04 + Math.sin(this.dustT + d) * 0.02})`;
      c.beginPath(); c.arc(sx, sy, 1.5, 0, Math.PI * 2); c.fill();
    }

    // ── Corridor door ──
    this.drawDoor(W * 0.88, H * 0.18, W * 0.1, H * 0.38, 'CORRIDOR\n→');

    // ── Bottom hint ──
    c.fillStyle = '#7a6040';
    c.font = '9px "Share Tech Mono"';
    c.textAlign = 'center';
    c.fillText('CLICK TERMINALS TO INTERACT', cx, H - 10);
  }

  private drawRack(x: number, y: number, w: number, h: number, i: number): void {
    const c = this.ctx;
    // Only first 2 racks have terminal state
    const ok = i < 2 ? this.er.solved()[i] : false;
    const interactive = i < 2;

    // ── Cabinet body ──
    c.fillStyle = '#252030';
    c.fillRect(x, y, w, h);

    // Side highlight strip
    c.fillStyle = '#3a3248';
    c.fillRect(x, y, 3, h);

    // Cabinet border — bright amber for interactive, dim for decorative
    c.strokeStyle = interactive ? '#8a7040' : '#3a3040';
    c.lineWidth = interactive ? 1.5 : 1;
    c.strokeRect(x, y, w, h);

    // ── Unit rows ──
    const uh = h / 14;
    for (let u = 0; u < 14; u++) {
      const uy = y + u * uh + 1.5;
      const rowH = uh - 2.5;

      // Row panel
      if (u === 4 && interactive) {
        // Main status row — visible background
        c.fillStyle = ok ? '#003800' : '#380000';
      } else {
        c.fillStyle = u % 2 === 0 ? '#1e1a28' : '#1a1624';
      }
      c.fillRect(x + 3, uy, w - 6, rowH);

      // LED dot
      if (u === 4 && interactive) {
        // Big blinking status LED
        const blink = !ok ? Math.sin(this.dustT * 5 + i * 1.2) > 0 : true;
        c.fillStyle = ok ? '#00ff55' : (blink ? '#ff3300' : '#660000');
        c.beginPath(); c.arc(x + w - 8, uy + rowH / 2, 3.5, 0, Math.PI * 2); c.fill();

        // LED glow halo
        c.fillStyle = ok ? 'rgba(0,255,85,0.15)' : `rgba(255,50,0,${blink ? 0.2 : 0.05})`;
        c.beginPath(); c.arc(x + w - 8, uy + rowH / 2, 8, 0, Math.PI * 2); c.fill();
      } else {
        // Small activity LEDs on other rows
        const active = Math.sin(this.dustT * 3 + u * 0.8 + i * 1.5) > 0.6;
        c.fillStyle = active ? 'rgba(0,150,30,0.7)' : 'rgba(0,50,10,0.5)';
        c.beginPath(); c.arc(x + w - 8, uy + rowH / 2, 2, 0, Math.PI * 2); c.fill();
      }

      // Port slots on each row
      if (interactive) {
        c.fillStyle = '#151020';
        c.fillRect(x + 4, uy + rowH * 0.2, w * 0.35, rowH * 0.6);
      }
    }

    // ── Status text below rack ──
    if (interactive) {
      c.fillStyle = ok ? '#00cc44' : '#cc2200';
      c.font = 'bold 9px "Share Tech Mono"';
      c.textAlign = 'center';
      c.fillText(ok ? '■ ONLINE' : '■ ERROR', x + w / 2, y + h + 14);
    }
  }

  private drawDoor(x: number, y: number, w: number, h: number, lbl: string): void {
    const c = this.ctx;
    // Door frame — clearly lighter than wall
    c.fillStyle = '#120f1a';
    c.fillRect(x, y, w, h);

    // Door border — bright amber
    c.strokeStyle = '#8a7040';
    c.lineWidth = 2;
    c.strokeRect(x, y, w, h);

    // Inner panel inset
    c.fillStyle = '#1e1a28';
    c.fillRect(x + 4, y + 4, w - 8, h - 8);
    c.strokeStyle = '#5a4a28';
    c.lineWidth = 1;
    c.strokeRect(x + 4, y + 4, w - 8, h - 8);

    // Door handle dot
    c.fillStyle = '#c8a060';
    c.beginPath(); c.arc(x + w - 10, y + h / 2, 4, 0, Math.PI * 2); c.fill();

    // Label
    c.fillStyle = '#d4a840';
    c.font = 'bold 9px "Share Tech Mono"';
    c.textAlign = 'center';
    lbl.split('\n').forEach((line, li) => {
      c.fillText(line, x + w / 2, y + h / 2 - 4 + li * 14);
    });
  }

  // ─────────────────────────────────────────────────────────
  // ROOM 1 — Corridor
  // Perspective hallway, clearly visible walls, pipe, panels
  // ─────────────────────────────────────────────────────────
  private drawCorridor(): void {
    const c = this.ctx, W = this.cv.width, H = this.cv.height, cx = W / 2;

    // ── Background ──
    // Far wall (centre) — lighter to create depth
    c.fillStyle = '#1a1624';
    c.fillRect(0, 0, W, H);

    // Left and right walls darker — creates tunnel effect
    const leftW = c.createLinearGradient(0, 0, W * 0.35, 0);
    leftW.addColorStop(0, '#0e0b14'); leftW.addColorStop(1, 'transparent');
    c.fillStyle = leftW; c.fillRect(0, 0, W * 0.35, H);

    const rightW = c.createLinearGradient(W * 0.65, 0, W, 0);
    rightW.addColorStop(0, 'transparent'); rightW.addColorStop(1, '#0e0b14');
    c.fillStyle = rightW; c.fillRect(W * 0.65, 0, W * 0.35, H);

    // Floor — warm darker than walls
    c.fillStyle = '#141018';
    c.fillRect(0, H * 0.62, W, H);

    // ── Perspective guide lines ──
    c.strokeStyle = '#3a3048';
    c.lineWidth = 1;
    // Ceiling lines
    c.beginPath(); c.moveTo(0, 0); c.lineTo(cx, H * 0.12); c.stroke();
    c.beginPath(); c.moveTo(W, 0); c.lineTo(cx, H * 0.12); c.stroke();
    // Floor lines
    c.beginPath(); c.moveTo(0, H); c.lineTo(cx, H * 0.62); c.stroke();
    c.beginPath(); c.moveTo(W, H); c.lineTo(cx, H * 0.62); c.stroke();
    // Wall edges
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, H); c.stroke();
    c.beginPath(); c.moveTo(W, 0); c.lineTo(W, H); c.stroke();

    // Floor horizon
    c.strokeStyle = '#4a3a20';
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, H * 0.62); c.lineTo(W, H * 0.62); c.stroke();

    // ── Ceiling light strip — flickering ──
    const fl = Math.sin(this.dustT * 4.5) > 0.92 ? 0.15 : 0.85;
    c.fillStyle = `rgba(220,200,160,${fl})`;
    c.fillRect(cx - 25, 0, 50, 6);
    // Light cone
    const coneGrad = c.createLinearGradient(0, 0, 0, H * 0.55);
    coneGrad.addColorStop(0, `rgba(220,200,160,${fl * 0.3})`);
    coneGrad.addColorStop(1, 'transparent');
    c.fillStyle = coneGrad;
    c.beginPath(); c.moveTo(cx - 70, 0); c.lineTo(cx - 25, H * 0.55); c.lineTo(cx + 25, H * 0.55); c.lineTo(cx + 70, 0); c.fill();

    // ── Pipe — left wall, clearly visible ──
    // Pipe body
    c.strokeStyle = '#6a5a40'; c.lineWidth = 10;
    c.beginPath(); c.moveTo(W * 0.08, 0); c.lineTo(W * 0.10, H); c.stroke();
    // Pipe highlight
    c.strokeStyle = '#8a7a58'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(W * 0.078, 0); c.lineTo(W * 0.098, H); c.stroke();
    // Pipe shadow
    c.strokeStyle = '#3a2a18'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(W * 0.108, 0); c.lineTo(W * 0.118, H); c.stroke();
    // Brackets
    c.fillStyle = '#5a4a30';
    [0.2, 0.45, 0.72].forEach(yf => {
      c.fillRect(W * 0.055, H * yf - 4, W * 0.07, 8);
      c.strokeStyle = '#7a6a40'; c.lineWidth = 1;
      c.strokeRect(W * 0.055, H * yf - 4, W * 0.07, 8);
    });

    // ── Mainframe door — center ──
    const dw = W * 0.24, dh = H * 0.40, dx = cx - dw / 2, dy = H * 0.08;
    // Door surround / frame
    c.fillStyle = '#251f30';
    c.fillRect(dx - 6, dy - 6, dw + 12, dh + 12);
    // Door panel
    c.fillStyle = '#100e18';
    c.fillRect(dx, dy, dw, dh);
    // Door border
    c.strokeStyle = '#9a8050';
    c.lineWidth = 2;
    c.strokeRect(dx, dy, dw, dh);
    // Door inner recess
    c.fillStyle = '#1a1625';
    c.fillRect(dx + 5, dy + 5, dw - 10, dh - 10);
    c.strokeStyle = '#4a3a28'; c.lineWidth = 1;
    c.strokeRect(dx + 5, dy + 5, dw - 10, dh - 10);

    // Door label
    c.fillStyle = '#c8a060';
    c.font = 'bold 11px "Share Tech Mono"';
    c.textAlign = 'center';
    c.fillText('MAINFRAME', cx, dy + dh / 2 - 8);

    // Lock/unlock status
    const locked = !this.er.solved()[2];
    c.fillStyle = locked ? '#cc3300' : '#00bb44';
    c.font = '9px "Share Tech Mono"';
    c.fillText(locked ? '[ LOCKED ]' : '[ OPEN ]', cx, dy + dh / 2 + 10);

    // Warning light above door
    const pulse = 0.5 + Math.sin(this.dustT * 2.5) * 0.5;
    c.fillStyle = `rgba(220,40,40,${pulse})`;
    c.beginPath(); c.arc(cx, dy - 14, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgba(220,40,40,0.15)`;
    c.beginPath(); c.arc(cx, dy, 55, 0, Math.PI * 2); c.fill();

    // ── Terminal 03 — right wall panel ──
    const px = W * 0.75, py = H * 0.20, pw = W * 0.14, ph = H * 0.35;
    const ok3 = this.er.solved()[2];

    // Panel housing
    c.fillStyle = '#201c2c';
    c.fillRect(px - 4, py - 4, pw + 8, ph + 8);

    // Panel face
    c.fillStyle = '#2a2438';
    c.fillRect(px, py, pw, ph);

    // Panel border — bright when unsolved (draws attention)
    c.strokeStyle = ok3 ? '#408060' : '#c8a060';
    c.lineWidth = 2;
    c.strokeRect(px, py, pw, ph);

    // Screen area
    const scrPulse = ok3 ? 0.8 : (0.5 + Math.sin(this.dustT * 6) * 0.4);
    c.fillStyle = ok3 ? '#001a08' : '#1a0400';
    c.fillRect(px + 5, py + 5, pw - 10, ph * 0.55);
    c.strokeStyle = ok3 ? '#306050' : '#805030'; c.lineWidth = 1;
    c.strokeRect(px + 5, py + 5, pw - 10, ph * 0.55);

    // Screen glow fill
    c.fillStyle = ok3 ? `rgba(0,200,60,${scrPulse * 0.3})` : `rgba(255,60,20,${scrPulse * 0.35})`;
    c.fillRect(px + 5, py + 5, pw - 10, ph * 0.55);

    // Screen text
    c.fillStyle = ok3 ? '#00ff66' : '#ff4422';
    c.font = 'bold 9px "Share Tech Mono"';
    c.textAlign = 'center';
    c.fillText(ok3 ? 'ONLINE' : 'ERROR', px + pw / 2, py + ph * 0.3);

    // Keyboard/buttons below screen
    c.fillStyle = '#1a1628';
    c.fillRect(px + 5, py + ph * 0.6, pw - 10, ph * 0.25);
    // Button row
    for (let b = 0; b < 4; b++) {
      c.fillStyle = '#302840';
      c.fillRect(px + 7 + b * (pw - 14) / 4, py + ph * 0.65, (pw - 14) / 4 - 2, ph * 0.14);
    }

    // Label
    c.fillStyle = '#c8a060';
    c.font = 'bold 8px "Share Tech Mono"';
    c.textAlign = 'center';
    c.fillText('TERMINAL-03', px + pw / 2, py - 8);

    // ── Back label ──
    c.fillStyle = '#8a7050';
    c.font = '10px "Share Tech Mono"';
    c.textAlign = 'left';
    c.fillText('← SERVER ROOM', 16, H - 14);
  }

  // ─────────────────────────────────────────────────────────
  // ROOM 2 — Mainframe
  // Large visible cabinet, bright screen, animated tape reels
  // ─────────────────────────────────────────────────────────
  private drawMainframe(): void {
    const c = this.ctx, W = this.cv.width, H = this.cv.height, cx = W / 2;

    // ── Background ──
    c.fillStyle = '#100e18';
    c.fillRect(0, 0, W, H);

    // Floor
    c.fillStyle = '#0e0c16';
    c.fillRect(0, H * 0.72, W, H);
    c.strokeStyle = '#3a3050'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, H * 0.72); c.lineTo(W, H * 0.72); c.stroke();

    // Floor tiles
    c.strokeStyle = 'rgba(80,70,100,0.2)'; c.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      c.beginPath(); c.moveTo(W * i / 8, H * 0.72); c.lineTo(W * i / 8, H); c.stroke();
    }
    for (let i = 0; i < 4; i++) {
      c.beginPath(); c.moveTo(0, H * 0.72 + i * H * 0.07); c.lineTo(W, H * 0.72 + i * H * 0.07); c.stroke();
    }

    const ok4 = this.er.solved()[3];
    const mw = W * 0.55, mh = H * 0.62, mx = (W - mw) / 2, my = (H - mh) / 2 - 15;

    // ── Cabinet shadow ──
    c.fillStyle = ok4 ? 'rgba(0,180,60,0.06)' : 'rgba(180,30,30,0.08)';
    c.fillRect(mx - 30, my - 20, mw + 60, mh + 40);

    // ── Cabinet body ──
    c.fillStyle = '#201c2e';
    c.fillRect(mx, my, mw, mh);

    // Cabinet border — clearly visible
    c.strokeStyle = '#9a8050';
    c.lineWidth = 2;
    c.strokeRect(mx, my, mw, mh);

    // Top edge highlight
    c.strokeStyle = '#c8a060';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + mw, my); c.stroke();

    // Side highlight strips
    c.fillStyle = '#302848';
    c.fillRect(mx, my, 4, mh);
    c.fillRect(mx + mw - 4, my, 4, mh);

    // ── Tape reels ──
    ([[mx + mw * 0.2, my + mh * 0.24], [mx + mw * 0.8, my + mh * 0.24]] as [number,number][]).forEach(([rpx, rpy]) => {
      const r = mw * 0.13;
      // Reel housing
      c.fillStyle = '#181425';
      c.beginPath(); c.arc(rpx, rpy, r + 4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#6a5a38'; c.lineWidth = 2;
      c.beginPath(); c.arc(rpx, rpy, r + 4, 0, Math.PI * 2); c.stroke();

      // Reel outer ring
      c.strokeStyle = '#a09060'; c.lineWidth = 3;
      c.beginPath(); c.arc(rpx, rpy, r, 0, Math.PI * 2); c.stroke();

      // Hub
      c.fillStyle = '#2a2238';
      c.beginPath(); c.arc(rpx, rpy, r * 0.3, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#8a7a50'; c.lineWidth = 2;
      c.beginPath(); c.arc(rpx, rpy, r * 0.3, 0, Math.PI * 2); c.stroke();

      // Rotating spokes
      c.strokeStyle = '#7a6a44'; c.lineWidth = 1.5;
      for (let a = 0; a < 6; a++) {
        const angle = a * Math.PI / 3 + this.dustT * 0.7;
        c.beginPath();
        c.moveTo(rpx + Math.cos(angle) * r * 0.3, rpy + Math.sin(angle) * r * 0.3);
        c.lineTo(rpx + Math.cos(angle) * r * 0.9, rpy + Math.sin(angle) * r * 0.9);
        c.stroke();
      }

      // Film strip connecting reels
      c.strokeStyle = '#3a3228'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(rpx, rpy + r * 0.9); c.lineTo(cx, rpy + r * 0.95); c.stroke();
    });

    // ── Memory banks ──
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 4; row++) {
        const bx = mx + 16 + col * (mw - 32) / 8;
        const by = my + mh * 0.52 + row * (mh * 0.42 / 4);
        const bw = (mw - 32) / 8 - 4;
        const bh = mh * 0.42 / 4 - 4;

        // Bank panel
        const active = Math.sin(this.dustT * 8 + col * 1.3 + row * 2.7) > 0.8;
        c.fillStyle = active ? '#002000' : '#181428';
        c.fillRect(bx, by, bw, bh);
        c.strokeStyle = '#4a4060'; c.lineWidth = 0.5;
        c.strokeRect(bx, by, bw, bh);

        // Status LED on each bank
        c.fillStyle = active ? '#00cc44' : 'rgba(0,60,20,0.6)';
        c.beginPath(); c.arc(bx + 4, by + 4, 2, 0, Math.PI * 2); c.fill();
      }
    }

    // ── Central screen — large and prominent ──
    const sw = mw * 0.44, sh = mh * 0.22, sx = mx + (mw - sw) / 2, sy = my + mh * 0.06;

    // Screen bezel
    c.fillStyle = '#0e0c18';
    c.fillRect(sx - 6, sy - 6, sw + 12, sh + 12);
    c.strokeStyle = '#c8a060';
    c.lineWidth = 2;
    c.strokeRect(sx - 6, sy - 6, sw + 12, sh + 12);

    // Screen face
    c.fillStyle = ok4 ? '#001a08' : '#1a0400';
    c.fillRect(sx, sy, sw, sh);

    // Screen glow
    const glow = 0.15 + Math.sin(this.dustT * 2.2) * 0.08;
    c.fillStyle = ok4 ? `rgba(0,200,60,${glow * 1.5})` : `rgba(200,40,20,${glow})`;
    c.fillRect(sx, sy, sw, sh);

    // Scanlines on screen
    c.fillStyle = 'rgba(0,0,0,0.15)';
    for (let sl = 0; sl < sh; sl += 3) {
      c.fillRect(sx, sy + sl, sw, 1);
    }

    // Screen text — large and readable
    c.font = 'bold 13px "Share Tech Mono"';
    c.textAlign = 'center';
    c.fillStyle = ok4 ? '#00ff66' : '#ff5533';
    c.fillText(ok4 ? '✓ SYSTEM RESTORED' : '✗ inject() REQUIRED', cx, sy + sh * 0.45);

    c.font = '9px "Share Tech Mono"';
    c.fillStyle = ok4 ? 'rgba(0,200,80,0.7)' : 'rgba(255,120,80,0.7)';
    c.fillText(ok4 ? 'ALL SYSTEMS ONLINE' : '[ CLICK TO ACCESS TERMINAL-04 ]', cx, sy + sh * 0.72);

    // Label above screen
    c.fillStyle = '#c8a060';
    c.font = 'bold 8px "Share Tech Mono"';
    c.fillText('DEPENDENCY INJECTOR', cx, sy - 12);

    // ── Back label ──
    c.fillStyle = '#8a7050';
    c.font = '10px "Share Tech Mono"';
    c.textAlign = 'left';
    c.fillText('← CORRIDOR', 16, H - 14);
  }

  // ── Room transitions ──────────────────────────────────────
  private transitionRoom(id: RoomId): void {
    cancelAnimationFrame(this.animId);
    this.hsRegistered = false;
    this.hotspots.set([]);
    this.er.setRoom(id);

    if (id === 1 && !(window as any)['_erN1']) {
      (window as any)['_erN1'] = true;
      setTimeout(() => this.narr('CORRIDOR B', [
        'The corridor smells of burnt solder.',
        'Terminal 03 is mounted on the wall to your right.',
        'The mainframe door is straight ahead — locked.',
        'Fix the template binding system first.',
      ], [], null), 120);
    }
    if (id === 2 && !(window as any)['_erN2']) {
      (window as any)['_erN2'] = true;
      setTimeout(() => this.narr('MAINFRAME — RESTRICTED', [
        'The mainframe hums with residual power.',
        'Tape reels spin slowly — still processing something.',
        'The dependency injector is the final broken system.',
        'Wire it correctly and the app reboots.',
      ], [], null), 120);
    }

    setTimeout(() => {
      this.resize();
      this.registerHotspots(id);
      this.loop();
    }, 30);
  }

  private interactTerminal(i: number): void {
    if (this.er.solved()[i]) {
      this.narr('TERMINAL ' + (i + 1), ['This system is already online.', 'Status: RESTORED.'], [], null);
      return;
    }
    const t = TERMINALS[i];
    // TODO: CHANGE BACK
    this.er.goGame(i);
    // this.er.goNarrative(t.loc, t.lines, [], () => this.er.goGame(i));
  }

  private narr(loc: string, lines: string[], choices: any[], cb: (() => void) | null): void {
    this.er.goNarrative(loc, lines, choices, cb);
  }
}