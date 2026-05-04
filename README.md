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

## Debug Mode

The escape room includes a debug panel (🐛 button) for testing:
- Jump to any game phase or room
- Start any terminal game directly
- Mark terminals as solved/unsolved

## Code of Conduct
[Code of Conduct](CODE_OF_CONDUCT)

## License

[MIT LICENSE](LICENSE)


