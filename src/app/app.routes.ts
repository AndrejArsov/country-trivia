import { Routes } from '@angular/router';
import { StartMenuComponent } from './start-menu/start-menu.component';
import { GameMenuComponent } from './game-menu/game-menu.component';

export const routes: Routes = [
    {path: "", component: StartMenuComponent},
    {path: "game", component: GameMenuComponent}

];
