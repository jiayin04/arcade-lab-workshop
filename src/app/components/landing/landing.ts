import {
  Component, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme';
import * as THREE from 'three';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  protected themeService = inject(ThemeService);
  private router = inject(Router);

  entering = signal(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private lid!: THREE.Group;
  private rimLight!: THREE.PointLight;
  private screenMat!: THREE.MeshStandardMaterial;
  private laptopGroup!: THREE.Group;
  private rafId = 0;
  private floatT = 0;
  private openProg = 0;
  private opening = false;

  ngAfterViewInit(): void {
    this.initThree();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.renderer?.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  onLaptopClick(): void {
    if (!this.entering()) {
      this.entering.set(true);
      this.opening = true;
    }
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.offsetWidth || 600;
    const h = canvas.offsetHeight || 400;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    this.camera.position.set(0, 1.6, 5.8);
    this.camera.lookAt(0, 0.2, 0);

    // ── Much brighter lighting so laptop reads against dark background ──
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.1));

    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xc0d8ff, 0.7);
    fill.position.set(-4, 3, 2);
    this.scene.add(fill);

    // Under-light to lift shadows on base
    const under = new THREE.DirectionalLight(0xffffff, 0.4);
    under.position.set(0, -4, 3);
    this.scene.add(under);

    this.rimLight = new THREE.PointLight(0x00ffaa, 3, 14);
    this.rimLight.position.set(0, 2.5, 3);
    this.scene.add(this.rimLight);

    this.laptopGroup = new THREE.Group();
    this.scene.add(this.laptopGroup);
    this.buildLaptop();
    this.animate();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private buildLaptop(): void {
    const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.85 });
    const keyMat  = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.25 });

    // ── Base chassis ──────────────────────────────────────────
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.13, 2.1), bodyMat.clone());
    base.userData['part'] = 'body';
    base.position.y = -0.065;
    base.castShadow = true;
    base.receiveShadow = true;
    this.laptopGroup.add(base);

    // ── Keyboard deck (slightly recessed panel) ───────────────
    const deckMat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.5 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.01, 1.4), deckMat);
    deck.userData['part'] = 'deck';
    deck.position.set(0, 0.065, -0.1);
    this.laptopGroup.add(deck);

    // ── Trackpad ──────────────────────────────────────────────
    const tpadMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.6 });
    const tp = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.012, 0.58), tpadMat);
    tp.userData['part'] = 'tpad';
    tp.position.set(0, 0.068, 0.52);
    this.laptopGroup.add(tp);

    // ── Keys (4 rows × 12 cols) ───────────────────────────────
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        const k = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.04, 0.155), keyMat.clone());
        k.userData['part'] = 'key';
        k.position.set(-1.07 + col * 0.19, 0.085, -0.14 + row * 0.195);
        this.laptopGroup.add(k);
      }
    }

    // ── Lid (hinges at z = -1.05) ─────────────────────────────
    this.lid = new THREE.Group();
    this.lid.position.set(0, 0, -1.05);
    this.laptopGroup.add(this.lid);

    const lidBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 2.1), bodyMat.clone());
    lidBody.userData['part'] = 'body';
    lidBody.position.set(0, 0, 1.05);
    lidBody.castShadow = true;
    this.lid.add(lidBody);

    // Thin rubber edge strip
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.1 });
    const edge = new THREE.Mesh(new THREE.BoxGeometry(3.22, 0.12, 2.12), edgeMat);
    edge.position.set(0, -0.01, 1.05);
    this.lid.add(edge);

    // Screen bezel (matte black frame)
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.15, metalness: 0.95 });
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(2.95, 0.065, 1.86), bezelMat);
    bezel.position.set(0, 0.083, 1.05);
    this.lid.add(bezel);

    // Screen panel — glows with theme colour
    this.screenMat = new THREE.MeshStandardMaterial({ roughness: 0.02, metalness: 0.0 });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.045, 1.64), this.screenMat);
    screen.position.set(0, 0.105, 1.05);
    this.lid.add(screen);

    this.lid.rotation.x = -Math.PI * 0.5; // closed
    this.updateLaptopColors();
  }

  private animate(): void {
    this.rafId = requestAnimationFrame(() => this.animate());
    this.floatT += 0.016;

    this.laptopGroup.rotation.y = Math.sin(this.floatT * 0.4) * 0.2;
    this.laptopGroup.position.y = Math.sin(this.floatT * 0.6) * 0.07;

    if (this.opening && this.openProg < 1) {
      this.openProg = Math.min(1, this.openProg + 0.022);
      this.lid.rotation.x = -Math.PI * 0.5 + this.openProg * Math.PI * 0.48;
      this.screenMat.emissiveIntensity = this.openProg * 2.0;
      this.rimLight.intensity = 3 + this.openProg * 7;

      if (this.openProg >= 1) {
        this.opening = false;
        this.transitionToDesktop();
      }
    }

    this.updateLaptopColors();
    this.renderer.render(this.scene, this.camera);
  }

  private updateLaptopColors(): void {
    const isRetro = this.themeService.isRetro();

    if (isRetro) {
      // RETRO: vivid electric-purple chassis, neon-green rim, purple screen glow
      this.rimLight.color.set(0x00ffaa);
      this.screenMat.color.set(0x0d0221);
      this.screenMat.emissive.set(0xc026d3);   // fuchsia glow
    } else {
      // MODERN: bright silver-white chassis, cool blue rim, blue screen glow
      this.rimLight.color.set(0x60a5fa);
      this.screenMat.color.set(0x020c1b);
      this.screenMat.emissive.set(0x2563eb);   // blue glow
    }

    this.scene.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat?.color) return;

      switch (mesh.userData['part']) {
        case 'body':
          // RETRO: saturated violet-purple (very visible)
          // MODERN: bright silver-white (very visible)
          mat.color.set(isRetro ? 0x6d28d9 : 0xf1f5f9);
          mat.metalness = isRetro ? 0.55 : 0.88;
          mat.roughness = isRetro ? 0.35 : 0.18;
          break;

        case 'key':
          // RETRO: dark indigo keys with slight contrast
          // MODERN: anthracite dark keys
          mat.color.set(isRetro ? 0x3b0764 : 0x1e293b);
          mat.roughness = 0.7;
          mat.metalness = isRetro ? 0.2 : 0.3;
          break;

        case 'deck':
          mat.color.set(isRetro ? 0x5b21b6 : 0xe2e8f0);
          mat.metalness = isRetro ? 0.5 : 0.8;
          mat.roughness = isRetro ? 0.4 : 0.25;
          break;

        case 'tpad':
          mat.color.set(isRetro ? 0x4c1d95 : 0xcbd5e1);
          mat.metalness = isRetro ? 0.45 : 0.75;
          mat.roughness = isRetro ? 0.4 : 0.3;
          break;
      }
    });
  }

  private transitionToDesktop(): void {
    this.router.navigate(['/desktop']);
  }

  private onResize(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}