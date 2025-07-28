import { Component, inject, OnInit, OnDestroy } from '@angular/core'; // Ajout de OnDestroy
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
// import { StateService } from '../../services/state.service'; // Non utilisé, peut être supprimé
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { UserProfile } from '../../models/family-tree.models';
import { Subscription } from 'rxjs'; // Import correct de Subscription
import { User } from '@angular/fire/auth';
import { FamilyTreeService } from '../../services/family-tree.service';
import{CommonModule} from '@angular/common'; // Import de CommonModule pour les directives Angular de base

@Component({
  selector: 'app-tool-bar',
  standalone: true, // Assurez-vous que le composant est standalone
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule,CommonModule],
  templateUrl: './tool-bar.component.html',
  styleUrl: './tool-bar.component.scss'
})
export class ToolBarComponent implements OnInit, OnDestroy { // Implémenter OnDestroy

  auth = inject(AuthService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  familyTreeService = inject(FamilyTreeService); // Injecter FamilyTreeService

  currentUser: User | null = null;
  userDisplayName: string = 'Invité'; // Propriété pour le nom d'affichage de l'utilisateur
  private userSubscription: Subscription | undefined; // Pour gérer l'abonnement

  ngOnInit(): void {
    // S'abonner à l'état de l'utilisateur
    this.userSubscription = this.auth.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Si un utilisateur est connecté, récupérer son profil pour le nom d'affichage
        this.familyTreeService.getUserProfile(user.uid).subscribe(profile => {
          this.userDisplayName = profile?.displayName || user.email || 'Utilisateur';
        });
      } else {
        this.userDisplayName = 'Invité'; // Réinitialiser si déconnecté
      }
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    this.userSubscription?.unsubscribe();
  }

  async logOut() {
    try {
      await this.auth.signOut();
      this.router.navigate(['']);
      // this.snackBar.open('Déconnexion réussie !', 'Fermer', { duration: 3000 });
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion :", error);
      this.snackBar.open(`Erreur de déconnexion : ${error.message}`, 'Fermer', { duration: 5000 });
    }
  }
}