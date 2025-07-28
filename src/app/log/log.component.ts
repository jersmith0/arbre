import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour les directives Angular (ngIf, ngFor, etc.)
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // Pour la gestion des formulaires
import { MatInputModule } from '@angular/material/input'; // Pour les champs de saisie
import { MatFormFieldModule } from '@angular/material/form-field'; // Pour les conteneurs de champs de saisie
import { MatButtonModule } from '@angular/material/button'; // Pour les boutons
import { MatIconModule } from '@angular/material/icon'; // Pour les icônes Material
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Pour les messages de feedback
import { MatDialog } from '@angular/material/dialog'; // Si ce composant est utilisé dans une modale
import { Router, RouterModule } from '@angular/router'; // Pour la redirection et les liens de routage

// Importez votre service d'authentification
import { AuthService } from '../services/auth.service'; // <== ASSUREZ-VOUS DU BON CHEMIN
import { LoginComponent } from '../login/login.component';
import { LogSkeletonComponent } from './log-skeleton.component';

@Component({
  selector: 'app-log', // Le sélecteur HTML pour ce composant
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule ,
    LogSkeletonComponent
  ],
  templateUrl: './log.component.html',
  styleUrl: './log.component.scss'
})
export class LogComponent implements OnInit {
  private dialog = inject(MatDialog); // Utilisé si le formulaire est dans une modale
  private router = inject(Router); // Injectez Router pour la redirection
  loading = signal(false);

  loginForm!: FormGroup; // Déclaration du FormGroup pour le formulaire de connexion

  // Injectez le service d'authentification et le service de snackbar
  constructor(
    private _snackBar: MatSnackBar,
    private authService: AuthService // Injection du service d'authentification
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire réactif avec e-mail et mot de passe
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  // Méthode appelée lors de la soumission du formulaire
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this._snackBar.open('Veuillez entrer un e-mail et un mot de passe valides.', 'Fermer', {
        duration: 5000,
        panelClass: ['snackbar-error']
      });
      this.loginForm.markAllAsTouched(); // Marque tous les champs comme touchés pour afficher les erreurs
      return; // Arrête l'exécution si le formulaire est invalide
    }

    const { email, password } = this.loginForm.value;

    try {
      // Appelle la méthode de connexion du AuthService
      this.loading.set(false);

      const userCredential = await this.authService.signInWithEmailAndPassword(email, password);

      // Si la connexion réussit, userCredential.user contient l'objet User de Firebase
      // console.log('Connexion réussie ! Utilisateur:', userCredential.user.email);
      this._snackBar.open('Connexion réussie !', 'Fermer', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.loading.set(true);


      this.loginForm.reset(); // Réinitialise le formulaire

      // Rediriger l'utilisateur vers une page après connexion réussie (ex: tableau de bord)
      this.router.navigate(['session']); 
      this.close(); // Ferme la modale si ce composant est dans un MatDialog

    } catch (error: any) {
      console.error('Erreur de connexion :', error);
      let errorMessage = "Échec de la connexion. Veuillez vérifier vos identifiants.";

      // Gérer les erreurs spécifiques de Firebase Authentication
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential': // Pour les erreurs plus récentes qui englobent user-not-found et wrong-password
            errorMessage = 'E-mail ou mot de passe incorrect.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'L\'adresse e-mail est mal formatée.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Ce compte utilisateur a été désactivé.';
            break;
          // Ajoutez d'autres cas si vous souhaitez gérer plus d'erreurs spécifiques
          default:
            errorMessage = `Erreur: ${error.message}`;
        }
      }

      this._snackBar.open(errorMessage, 'Fermer', {
        duration: 7000,
        panelClass: ['snackbar-error']
      });
    }
  }

  // Helper pour accéder facilement aux contrôles du formulaire dans le template
  get f() { return this.loginForm.controls; }

  // Méthode pour fermer la modale (si ce composant est utilisé dans un MatDialog)
  close(): void {
    this.dialog.closeAll();
  }

  // Méthode pour envoyer un lien de réinitialisation de mot de passe (à implémenter si désiré)
  async forgotPassword(): Promise<void> {
    const email = prompt("Veuillez entrer votre adresse e-mail pour réinitialiser votre mot de passe:");
    if (email && email.trim() !== '') {
      try {
        // Appelez la méthode de votre AuthService pour envoyer le lien
        // ATTENTION: Vous devrez ajouter sendPasswordResetEmail à votre AuthService si ce n'est pas déjà fait
        // await this.authService.sendPasswordResetEmail(email.trim());
        this._snackBar.open('Si votre e-mail est enregistré, un lien de réinitialisation vous a été envoyé.', 'Fermer', {
          duration: 7000,
          panelClass: ['snackbar-success']
        });
      } catch (error: any) {
        console.error('Erreur lors de l\'envoi du lien de réinitialisation :', error);
        this._snackBar.open('Erreur lors de l\'envoi du lien de réinitialisation. Veuillez réessayer.', 'Fermer', {
          duration: 7000,
          panelClass: ['snackbar-error']
        });
      }
    } else if (email !== null) { // Si l'utilisateur clique sur Annuler, prompt renvoie null
      this._snackBar.open('La réinitialisation a été annulée.', 'Fermer', { duration: 3000 });
    }
  }

  register(){
    this.dialog.closeAll();
    // dialog =inject(MatDialog);
         this.dialog.open(LoginComponent, { 
         width: "35rem",
         disableClose: true,
      });
  }
}