import { Routes } from '@angular/router';

import { ContainerComponent } from './core/container.component';

export const appRoutes: Routes = [
    {path: ':codex', component: ContainerComponent},
    {path: '**', component: ContainerComponent}
];
