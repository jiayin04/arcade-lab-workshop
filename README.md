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
git clone https://github.com/jiayin04/arcade-lab-workshop.git
cd arcade-lab-workshop
npm install
```

> **Workshop Branches:**
> - `main`: The fully functional, completed version of the application.
> - `workshop-guide`: The starting point for the workshop, featuring guided learning exercises and incomplete code for you to fill in.
> 
> To follow along with the workshop, switch to the guide branch:
> ```bash
> git checkout workshop-guide
> ```

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

You're the last developer on call in a server room where critical Angular systems have failed. Your mission: restore the terminals by participating in guided exercises to complete the source code and learn modern Angular 21 concepts.

- Refer to [Guided Learning](https://www.notion.so/GDGoC-APU-Angular-Arcade-Lab-Workshop-339d60301a1a80058993f28f6417197f) in Notion for step-by-step workshop instructions.

### Workshop Modules & Angular Concepts

| Workshop Part | Concept | Game / Component | Description |
|---|---|---|---|
| **Part 1** | Data Fetching | 🌐 App Data Service | Fetch data with `HttpClient` and RxJS `forkJoin` |
| **Part 2** | UI & State | 🧠 Memory Game | Connect data via Dependency Injection, Signals, and Control Flow |
| **Part 3** | Game Interaction | 🐍 Snake Game | Add event binding, formatting pipes, i18n, and ARIA accessibility |
| **Quiz** | Custom Pipes | 🧠 Memory Game | Build a custom `mask` pipe to hide string characters |

## Debug Mode

The escape room includes a debug panel (🐛 button) for testing:
- Jump to any game phase or room
- Start any terminal game directly
- Mark terminals as solved/unsolved

## Code of Conduct
[Code of Conduct](CODE_OF_CONDUCT.md)

## License

[MIT LICENSE](LICENSE)


