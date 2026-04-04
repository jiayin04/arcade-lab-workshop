# Contributing to Angular Escape Room 🔐

Thank you for your interest in contributing to the Angular Escape Room workshop! This project teaches Angular 21 concepts through an interactive escape room experience. We welcome contributions from developers of all skill levels.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Adding New Terminals](#adding-new-terminals)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- **Node.js 22+** - Required for Angular 21
- **Angular CLI 21** - `npm install -g @angular/cli@21`
- **Git** - For version control
- **VS Code** (recommended) - With Angular extensions

### Quick Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/angular-escape-room.git
cd angular-escape-room

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:4200 in your browser
```

## Development Setup

### Environment Configuration

The project uses Angular 21 with zoneless change detection and signals. Key configuration files:

- `angular.json` - Angular CLI configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

### Available Scripts

```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
npm run lint       # Code linting
```

### Internationalization

The project supports English (EN) and Malay (MS) translations:

```bash
# Extract i18n strings
ng extract-i18n --output-path src/i18n

# Build with specific locale
ng build --configuration=production --locale=ms
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── escape-room/        # Main escape room component
│   │   │   ├── components/     # Sub-components (narrative, room-scene, rooms)
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── service/        # Game state management
│   │   ├── desktop/            # OS-style desktop interface
│   │   ├── landing/            # Three.js 3D landing page
│   │   └── lang-toggle/        # Language switcher
│   ├── services/               # Global services (theme, i18n, app-data)
│   └── models/                 # Shared interfaces
├── assets/
│   ├── data/                   # JSON content files
│   └── i18n/                   # Translation files
```

## How to Contribute

### Types of Contributions

1. **🐛 Bug Fixes** - Fix issues in existing terminals or gameplay
2. **✨ New Features** - Add new terminals, rooms, or mechanics
3. **📚 Documentation** - Improve README, add tutorials, or code comments
4. **🎨 UI/UX** - Enhance styling, accessibility, or user experience
5. **🌐 Localization** - Add new languages or improve translations
6. **🧪 Testing** - Add or improve test coverage

### Development Workflow

1. **Choose an Issue** - Check [open issues](../../issues) or create a new one
2. **Create a Branch** - Use descriptive branch names:
   ```bash
   git checkout -b feature/add-new-terminal
   git checkout -b fix/memory-game-bug
   git checkout -b docs/update-contributing-guide
   ```
3. **Make Changes** - Follow the coding standards below
4. **Test Your Changes** - Ensure everything works correctly
5. **Submit a PR** - Follow the PR guidelines

## Adding New Terminals

The escape room teaches Angular concepts through interactive terminals. Each terminal consists of:

### Terminal Structure

```
src/app/components/escape-room/components/rooms/
├── your-terminal/
│   ├── your-terminal.html       # Game UI
│   ├── your-terminal.scss       # Styling
│   ├── your-terminal.spec.ts    # Unit tests
│   └── your-terminal.ts         # Game logic
```

### Steps to Add a New Terminal

1. **Choose an Angular Concept** - What will participants learn?
2. **Design the Game** - Create an engaging puzzle that teaches the concept
3. **Update Models** - Add new types to `models/escape.ts`
4. **Create Game Component** - Implement the terminal component
5. **Update Service** - Add terminal handling in `EscapeRoomService`
6. **Add Content** - Update `escape-room-content.json` with story text
7. **Update UI** - Add terminal to the room scene and escape room template
8. **Add Tests** - Write comprehensive unit tests

### Example: Adding Terminal 5

```typescript
// 1. Update models/escape.ts
export type GameType = 'snake' | 'memory' | 'debug' | 'codedrop' | 'yourgame';

// 2. Create new component
@Component({
  selector: 'app-your-terminal',
  standalone: true,
  templateUrl: './your-terminal.html',
  styleUrl: './your-terminal.scss',
})
export class YourTerminal {
  // Game logic here
}

// 3. Update EscapeRoomService
goGame(terminal: number): void {
  // Add case for your new terminal
  switch (def.game) {
    case 'yourgame': /* handle your game */
  }
}
```

## Coding Standards

### TypeScript Guidelines

- **Strict Mode**: All TypeScript strict checks enabled
- **Signals**: Use Angular signals for reactive state
- **Types**: Define interfaces for all data structures
- **Inject**: Use `inject()` instead of constructor injection

```typescript
// ✅ Good
readonly score = signal(0);
readonly isComplete = computed(() => this.score() >= 100);

private router = inject(Router);

// ❌ Avoid
constructor(private router: Router) {}
```

### Component Patterns

- **Standalone Components**: All components are standalone
- **OnPush Change Detection**: Use `ChangeDetectionStrategy.OnPush`
- **Control Flow**: Use new `@if/@else` and `@for` syntax

```typescript
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (gameState() === 'playing') {
      <div>Game in progress...</div>
    } @else {
      <div>Game over!</div>
    }
  `,
})
```

### Styling Guidelines

- **SCSS**: Use SCSS for component styling
- **CSS Variables**: Use CSS custom properties for theming
- **BEM**: Follow BEM naming convention where appropriate
- **Responsive**: Ensure mobile-friendly design

### File Naming

- **Components**: `component-name.ts`, `component-name.html`, `component-name.scss`
- **Services**: `service-name.ts`
- **Models**: `model-name.ts`
- **Tests**: `component-name.spec.ts`

## Testing

### Test Structure

- **Unit Tests**: Test individual components and services
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user flows (future enhancement)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

```typescript
describe('SnakeGame', () => {
  let component: SnakeGame;
  let fixture: ComponentFixture<SnakeGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnakeGame],
    }).compileComponents();

    fixture = TestBed.createComponent(SnakeGame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle keyboard input', () => {
    // Test keyboard event handling
  });
});
```

## Submitting Changes

### Pull Request Process

1. **Update Documentation** - Ensure README and docs reflect your changes
2. **Add Tests** - Include tests for new functionality
3. **Update Changelog** - Document breaking changes
4. **Squash Commits** - Combine related commits into logical units

### PR Template

When creating a PR, include:

- **Description**: What changes were made and why
- **Testing**: How the changes were tested
- **Screenshots**: UI changes with before/after screenshots
- **Breaking Changes**: Any breaking changes and migration guide

### Commit Messages

Follow conventional commit format:

```
feat: add new terminal for routing concepts
fix: resolve memory game scoring bug
docs: update contributing guidelines
style: format code with prettier
test: add unit tests for snake game
```

## Reporting Issues

### Bug Reports

When reporting bugs, include:

- **Steps to Reproduce**: Clear steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable

### Feature Requests

For new features, include:

- **Problem**: What's the problem this solves?
- **Solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Angular Concept**: Which Angular concept would it teach?

### Issue Labels

- `🐛 bug` - Something isn't working
- `✨ enhancement` - New feature or improvement
- `📚 documentation` - Documentation updates
- `🧪 testing` - Test-related issues
- `🎨 ui/ux` - User interface improvements
- `🌐 i18n` - Internationalization

## Getting Help

- **Discussions**: Use [GitHub Discussions](../../discussions) for questions
- **Issues**: Report bugs or request features
- **Discord**: Join our community Discord for real-time help
- **Documentation**: Check the README and inline code comments

## Recognition

Contributors will be recognized in:
- Repository contributors list
- Changelog for significant contributions
- Workshop materials and presentations

Thank you for contributing to the Angular Arcade Lab! 🎉
