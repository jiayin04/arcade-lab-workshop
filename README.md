# Angular Escape Room 🔐

> **GDG Workshop** — Learn Angular 21 by escaping a server room through interactive games

## Tech Stack

| Concept | Implementation |
|---|---|
| Framework | Angular 21 (standalone components) |
| Change Detection | Zoneless + Signals (`provideZonelessChangeDetection`) |
| State Management | Angular Signals (`signal`, `computed`, `effect`) |
| Routing | Component-based routing |
| 3D Landing | Three.js r170 |
| Accessibility | ARIA roles, labels, live regions |
| i18n | Angular `i18n` (EN + MS + ZH translations) |
| Styling | SCSS with theming |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── app.config.ts           # Zoneless + router providers
│   │   ├── app.routes.ts           # Route configuration
│   │   ├── app.scss
│   │   ├── app.spec.ts
│   │   ├── app.ts
│   │   ├── components/
│   │   │   ├── desktop/            # OS-style desktop interface
│   │   │   │   ├── desktop.html
│   │   │   │   ├── desktop.scss
│   │   │   │   ├── desktop.spec.ts
│   │   │   │   ├── desktop.ts
│   │   │   ├── escape-room/        # Main escape room component
│   │   │   │   ├── escape-room.html
│   │   │   │   ├── escape-room.scss
│   │   │   │   ├── escape-room.spec.ts
│   │   │   │   ├── escape-room.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── narrative/     # Story text display
│   │   │   │   │   ├── room-scene/    # Interactive room navigation
│   │   │   │   │   ├── rooms/         # Individual room components
│   │   │   │   ├── models/            # TypeScript interfaces
│   │   │   │   ├── service/           # Game state management
│   │   │   ├── landing/             # Three.js 3D laptop landing
│   │   │   │   ├── landing.html
│   │   │   │   ├── landing.scss
│   │   │   │   ├── landing.spec.ts
│   │   │   │   ├── landing.ts
│   │   │   ├── lang-toggle/         # Language switcher
│   │   ├── models/                  # Shared interfaces
│   │   │   ├── model.ts
│   │   ├── services/                # Global services
│   │   │   ├── app-data/            # Game content provider
│   │   │   ├── i18n/                # Internationalization
│   │   │   ├── theme/               # Theme management
│   ├── assets/
│   │   ├── data/
│   │   │   ├── escape-room-content.json  # Story content
│   │   │   ├── escape-terminals.json     # Terminal configurations
│   │   │   ├── games.json                 # Game metadata
│   │   ├── i18n/
│   │   │   ├── en.json              # English translations
│   │   │   ├── ms.json              # Malay translations
│   │   │   ├── zh.json              # Chinese translations
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss                  # Global styles + fonts
```

## Quick Start

### Prerequisites
- Node.js 22+
- Angular CLI 21: `npm install -g @angular/cli@21`

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
# Open http://localhost:4200
```

### Build for Production
```bash
npm run build
```

## The Escape Room Experience

You're the last developer on call in a server room where four critical Angular systems have failed. Your mission: restore each terminal by solving interactive puzzles that teach Angular 21 concepts.

### Terminals & Angular Concepts

| Terminal | Concept | Game | Description |
|---|---|---|---|
| **T1** | Signals & Reactivity | 🐍 Snake Game | Learn reactive state with `signal()` and `computed()` |
| **T2** | Template Binding | 🧠 Memory Game | Master `[()]` banana-in-a-box syntax |
| **T3** | Dependency Injection | ⚡ Debug Runner | Understand `inject()` and service patterns |
| **T4** | Component Architecture | 📦 Code Drop | Build with standalone components |


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
// escape-room.service.ts
readonly phase = signal<GamePhase>('intro');
readonly solved = signal<boolean[]>([false, false, false, false]);
readonly solvedCount = computed(() => this.solved().filter(Boolean).length);

// Update reactively
this.phase.set('room');
this.solved.update(solved => solved.map((s, i) => i === terminal ? true : s));
```

### 3. New Control Flow Syntax
```html
<!-- @if/@else for conditional rendering -->
@if (er.phase() === 'intro') {
  <div class="intro-screen">Welcome to the escape room!</div>
} @else if (er.phase() === 'room') {
  <app-room-scene />
}

<!-- @for for lists -->
@for (s of er.solved(); track $index) {
  <div class="terminal" [class.solved]="s">Terminal {{$index + 1}}</div>
}
```

### 4. Standalone Components
```typescript
@Component({
  selector: 'app-escape-room',
  standalone: true,  // No NgModule needed!
  imports: [CommonModule, RoomScene, Narrative, SnakeGame],
  templateUrl: './escape-room.html',
})
export class EscapeRoom {
  // Component logic here
}
```

### 5. Dependency Injection with inject()
```typescript
@Injectable({ providedIn: 'root' })
export class EscapeRoomService {
  private appData = inject(AppDataService);  // No constructor needed!
  readonly terminals = computed(() => this.appData.terminals());
}
```

### 6. ARIA Accessibility
```html
<div class="room-screen" role="region" aria-label="Server room navigation">
  <div class="terminal-progress" role="list" aria-label="Terminal status">
    @for (s of solved(); track $index) {
      <div class="prog-dot" role="listitem"
           [attr.aria-label]="'Terminal ' + ($index + 1) + (s ? ': online' : ': offline')">
      </div>
    }
  </div>
</div>
```

### 7. i18n Internationalization
```html
<!-- escape-room.html -->
<h1 i18n="@@escape.title">ANGULAR ESCAPE</h1>
<p i18n="@@escape.instructions">Four systems must be restored before dawn.</p>
```


## Debug Mode

The escape room includes a debug panel (🐛 button) for testing:
- Jump to any game phase or room
- Start any terminal game directly
- Mark terminals as solved/unsolved

## License

[MIT LICENSE](LICENSE)
