import { Routes } from '@angular/router';
import { APP_NAME } from './app.constants';

export const routes: Routes = [

    {
        path: '',
        title: `${APP_NAME }`,
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'session',
        title: `session- ${APP_NAME }`,
        loadComponent: () => import('./session/session.component').then(m => m.SessionComponent)
    },
     {
        path: 'tree-viewer',
        title: `tree-viewer- ${APP_NAME }`,
        loadComponent: () => import('./pages/family-tree-viewer/family-tree-viewer.component').then(m => m.FamilyTreeViewerComponent)
    },
   
];
