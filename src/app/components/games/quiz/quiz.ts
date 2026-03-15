import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject, signal,
} from '@angular/core';
import { QuizQuestion } from '../../../models/models';
import { ThemeService } from '../../../services/theme';
import { Games } from "../games";

const QUESTIONS: QuizQuestion[] = [
  {
    question: 'Which decorator marks a class as an Angular component?',
    options: ['@NgModule', '@Component', '@Injectable', '@Directive'],
    answer: 1,
    explanation: '@Component declares the metadata: selector, template, styles.',
  },
  {
    question: 'What CLI command generates a new standalone component?',
    options: ['ng make component', 'ng new component', 'ng generate component', 'ng add component'],
    answer: 2,
    explanation: '"ng generate component" (alias: ng g c) scaffolds a new component.',
  },
  {
    question: 'What syntax enables Angular two-way data binding?',
    options: ['(value)', '[value]', '[(ngModel)]', '{{ngModel}}'],
    answer: 2,
    explanation: 'Banana-in-a-box [(ngModel)] combines property [binding] and event (binding).',
  },
  {
    question: 'ARIA stands for…?',
    options: ['Angular Rich Interface API', 'Accessible Rich Internet Applications', 'App Resource Index API', 'Automated Rendering Interface'],
    answer: 1,
    explanation: 'ARIA attributes expose semantic meaning to assistive technologies like screen readers.',
  },
  {
    question: 'Which Angular feature handles dependency injection?',
    options: ['Pipes', 'Directives', 'Services', 'Guards'],
    answer: 2,
    explanation: 'Services decorated with @Injectable are injected via Angular\'s DI system.',
  },
  {
    question: 'In Angular 21, what replaces NgZone as the default change detection?',
    options: ['RxJS Observables', 'Zone.js v2', 'Zoneless with Signals', 'Ivy renderer v3'],
    answer: 2,
    explanation: 'Angular 21 defaults to zoneless change detection powered by Signals.',
  },
  {
    question: 'Which @for block replaces *ngFor in Angular 17+?',
    options: ['@for … track', '@loop … by', '@each … track', '@repeat … of'],
    answer: 0,
    explanation: 'The new @for control flow block requires a track expression for diffing.',
  },
  {
    question: 'What does the OnPush change detection strategy do?',
    options: [
      'Checks every cycle',
      'Only checks when inputs change or signals emit',
      'Disables change detection',
      'Runs outside NgZone',
    ],
    answer: 1,
    explanation: 'OnPush skips subtrees unless an @Input reference changes or a Signal emits.',
  },
];

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [Games],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  protected themeService = inject(ThemeService);

  readonly TOTAL = QUESTIONS.length;

  qIndex = signal(0);
  score = signal(0);
  answered = signal<number | null>(null);
  finished = signal(false);

  current = computed(() => QUESTIONS[this.qIndex()]);

  gradeMessage = computed(() => {
    const pct = this.score() / this.TOTAL;
    if (pct === 1) return '🌟 Perfect score! You are an Angular master.';
    if (pct >= 0.75) return '🎉 Great job! Almost there.';
    if (pct >= 0.5) return '👍 Good effort — keep learning!';
    return '📚 Study the Angular docs and try again!';
  });

  answer(idx: number): void {
    if (this.answered() !== null) return;
    this.answered.set(idx);
    if (idx === this.current().answer) this.score.update(s => s + 1);

    setTimeout(() => {
      this.answered.set(null);
      if (this.qIndex() + 1 >= this.TOTAL) {
        this.finished.set(true);
      } else {
        this.qIndex.update(i => i + 1);
      }
    }, 1200);
  }

  restart(): void {
    this.qIndex.set(0);
    this.score.set(0);
    this.answered.set(null);
    this.finished.set(false);
  }
}
