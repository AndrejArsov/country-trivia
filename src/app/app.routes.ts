import { Routes } from '@angular/router';
import { StartMenuComponent } from './start-menu/start-menu.component';

export const routes: Routes = [
  {
    path: '',
    component: StartMenuComponent
  },
  {
    path: 'game',
    loadComponent: () =>
      import('./game-menu/game-menu.component').then(m => m.GameMenuComponent)
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  }
];