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
    path: 'escape-room/escape',
    loadComponent: () =>
      import('./components/escape-room/escape-room').then(m => m.EscapeRoom),
  },
  { path: '**', redirectTo: '' },
];
