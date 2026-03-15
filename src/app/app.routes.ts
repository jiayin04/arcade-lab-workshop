import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/landing/landing').then(m => m.Landing),
  },
  {
    path: 'desktop',
    loadComponent: () =>
      import('./components/desktop/desktop').then(m => m.Desktop),
  },
  {
    path: 'game/snake',
    loadComponent: () =>
      import('./components/games/snake/snake').then(m => m.Snake),
  },
  {
    path: 'game/memory',
    loadComponent: () =>
      import('./components/games/memory/memory').then(m => m.Memory),
  },
  {
    path: 'game/quiz',
    loadComponent: () =>
      import('./components/games/quiz/quiz').then(m => m.Quiz),
  },
  {
    path: 'game/jumper',
    loadComponent: () =>
      import('./components/games/jumper/jumper').then(m => m.Jumper),
  },
  { path: '**', redirectTo: '' },
];
