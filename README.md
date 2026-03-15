# Angular Arcade Lab 🕹️

> **GDG On Campus Workshop** — Learn Angular 21 by building an interactive arcade

## Tech Stack

| Concept | Implementation |
|---|---|
| Framework | Angular 21 (standalone components) |
| Change Detection | Zoneless + Signals (`provideZonelessChangeDetection`) |
| State | Angular Signals (`signal`, `computed`, `effect`) |
| Routing | Lazy-loaded routes per game |
| 3D Landing | Three.js r170 |
| Accessibility | ARIA roles, labels, live regions |
| i18n | Angular `i18n` (EN + BM translations) |
| Styling | SCSS with `:host-context` theming |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── app.config.ts           # Zoneless + router providers
│   │   ├── app.routes.ts           # Lazy-loaded game routes
│   │   ├── app.scss
│   │   ├── app.spec.ts
│   │   ├── app.ts
│   │   ├── components/
│   │   │   ├── desktop/ # OS-style icon grid
│   │   │   │   ├── desktop.html
│   │   │   │   ├── desktop.scss
│   │   │   │   ├── desktop.spec.ts
│   │   │   │   ├── desktop.ts
│   │   │   ├── games/
│   │   │   │   ├── games.html
│   │   │   │   ├── games.scss
│   │   │   │   ├── games.spec.ts
│   │   │   │   ├── games.ts
│   │   │   │   ├── jumper/         # Endless runner (rAF game loop)
│   │   │   │   │   ├── jumper.html
│   │   │   │   │   ├── jumper.scss
│   │   │   │   │   ├── jumper.spec.ts
│   │   │   │   │   ├── jumper.ts
│   │   │   │   ├── memory/         # Memory match (Signals state)
│   │   │   │   │   ├── memory.html
│   │   │   │   │   ├── memory.scss
│   │   │   │   │   ├── memory.spec.ts
│   │   │   │   │   ├── memory.ts
│   │   │   │   ├── quiz/           # Angular trivia (computed signals)
│   │   │   │   │   ├── quiz.html
│   │   │   │   │   ├── quiz.scss
│   │   │   │   │   ├── quiz.spec.ts
│   │   │   │   │   ├── quiz.ts
│   │   │   │   ├── snake/          # Snake game (keyboard events)
│   │   │   │   │   ├── snake.html
│   │   │   │   │   ├── snake.scss
│   │   │   │   │   ├── snake.spec.ts
│   │   │   │   │   ├── snake.ts
│   │   │   ├── landing/            # Three.js 3D laptop landing screen
│   │   │   │   ├── landing.html
│   │   │   │   ├── landing.scss
│   │   │   │   ├── landing.spec.ts
│   │   │   │   ├── landing.ts
│   │   ├── models/                 # Shared interfaces
│   │   │   ├── models.spec.ts
│   │   │   ├── models.ts
│   │   ├── services/               # Global theme signal
│   │   │   ├── theme.spec.ts
│   │   │   ├── theme.ts
│   ├── i18n/
│   │   ├── messages.ms.xlf         # Bahasa Malaysia translation
│   │   ├── messages.xlf            # English source strings
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss                 # Global styles + Google Fonts
```

## Quick Start

### Prerequisites
- Node.js 22+
- Angular CLI 21: `npm install -g @angular/cli@21`

### Installation
```bash
npm install
```

### Development server
```bash
ng serve
# Open http://localhost:4200
```

### Build for production
```bash
ng build
```

### Build with Malay (BM) locale
```bash
ng build --localize
# or for a specific locale:
ng build --configuration=production --locale=ms
```

## Angular 21 Concepts Demonstrated

### 1. Zoneless Change Detection
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Angular 21 default
    provideRouter(routes),
  ],
};
```

### 2. Signals as Reactive State
```typescript
// theme.service.ts
readonly theme = signal<Theme>('retro');
readonly isRetro = computed(() => this.theme() === 'retro');
readonly themeClass = computed(() => this.theme() === 'retro' ? 'theme-retro' : 'theme-modern');

// Update
this.theme.set('modern');          // set
this.score.update(s => s + 1);    // update based on previous value
```

### 3. New @for Control Flow
```html
@for (card of cards(); track card.id) {
  <div class="mem-card" (click)="flip(card.id)">...</div>
}
```

### 4. @if / @else Conditional Rendering
```html
@if (!finished()) {
  <div class="quiz-question">...</div>
} @else {
  <div class="results">...</div>
}
```

### 5. Lazy-Loaded Standalone Routes
```typescript
// app.routes.ts
{
  path: 'game/snake',
  loadComponent: () => import('./games/snake/snake.component').then(m => m.SnakeComponent),
}
```

### 6. ARIA Accessibility
```html
<div role="grid" aria-label="Memory card matching grid">
  <div role="gridcell" tabindex="0"
    [attr.aria-label]="card.matched ? card.emoji + ' matched' : 'Hidden card'"
    (keydown.enter)="flip(card.id)">
  </div>
</div>
```

### 7. i18n
```html
<h1 i18n="@@landing.title">Angular Arcade Lab</h1>
```

Extract: `ng extract-i18n --output-path src/i18n`

### 8. OnPush + Signals (no manual markForCheck needed)
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // Signals auto-trigger updates
})
```

## Games

| Game | Angular Concepts |
|---|---|
| 🐍 Snake | `@HostListener`, Canvas API, `setInterval`, `signal` |
| 🧠 Memory | `signal`, `computed`, `@for`, immutable state updates |
| ⚡ NG Quiz | Nested `@if/@else`, `computed` grade, `signal` progression |
| 🏃 Jumper | `requestAnimationFrame`, `@ViewChild`, `ChangeDetectionStrategy.OnPush` |

## Workshop Exercises

1. **Add a high score** — persist best score to `localStorage` using a service
2. **Add a new game** — create a new route + standalone component following the pattern
3. **Animate the desktop** — use Angular Animations (`@angular/animations`) for icon hover
4. **Add Japanese locale** — create `messages.ja.xlf` and wire it in `angular.json`
5. **Make it PWA** — run `ng add @angular/pwa` and enable offline play

## License
[LICENSE.md](LICENSE.md)
