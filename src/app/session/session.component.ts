import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profil.service';
import { Observable } from 'rxjs';
import { Auth, authState, user, User } from '@angular/fire/auth';
import { ToolBarComponent } from "./tool-bar/tool-bar.component";
import { FamilyTreeViewerComponent } from "../pages/family-tree-viewer/family-tree-viewer.component";
// import { SideBarComponent } from "./side-bar/side-bar.component";

@Component({
  selector: 'app-session',
  imports: [ToolBarComponent, FamilyTreeViewerComponent],
  template: `
    <app-tool-bar/>
    <app-family-tree-viewer/>
    <!-- <app-side-bar/> -->
  `,
  styles: `
       body{
          overflow: hidden; /* Empêche le défilement de la page */
       } 
  `
})
export class SessionComponent {

    private auth: Auth = inject(Auth);

  // Observable qui émet l'objet User (si connecté) ou null (si déconnecté)
  // à chaque changement d'état d'authentification.
  public authState$: Observable<User | null> = authState(this.auth);

  // Observable qui émet l'objet User (si connecté) et se complète si déconnecté.
  // 'authState$' est généralement plus flexible car il émet explicitement `null`.
  public user$: Observable<User | null> = user(this.auth);

  constructor() {
    // Vous pouvez souscrire ici pour des logiques globales,
    // ou laisser les composants souscrire à 'authState$' ou 'user$'.
    this.authState$.subscribe(user => {
      if (user) {
        console.log('Utilisateur connecté:', user.email, 'UID:', user.uid);
      } else {
        console.log('Utilisateur déconnecté.');
      }
    });
  }

}
