import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router'; // Pour la redirection et les liens de routage

// Importez les services et l'interface nécessaires
import { AuthService } from '../services/auth.service'; // Votre service d'authentification
import { UserProfileService } from '../services/user-profil.service';
import { UserProfile } from '../models/user-profile.models';
import { LogComponent } from '../log/log.component';
import { LogSkeletonComponent } from '../log/log-skeleton.component';

@Component({
  selector: 'app-login', // Renommez-le en 'app-register' pour plus de clarté si vous le souhaitez
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatRadioModule,
    MatSnackBarModule,
    RouterModule,
    LogSkeletonComponent 
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  loading = signal(false);

  registrationForm!: FormGroup; // Renommé de loginForm à registrationForm pour la clarté

  nationalities: string[] = [
    'Afghane', 'Albanaise', 'Allemande', 'Américaine', 'Andorrane', 'Angolaise', 'Argentine', 'Australienne', 'Autrichienne',
    'Bangladaise', 'Belge', 'Béninoise', 'Brésilienne', 'Britannique', 'Bulgare', 'Burkinabé', 'Burundaise',
    'Camerounaise', 'Canadienne', 'Chilienne', 'Chinoise', 'Colombienne', 'Congolaise', 'Coréenne du Sud', 'Costaricaine',
    'Croate', 'Cubaine', 'Danoise', 'Dominicaine', 'Égyptienne', 'Équatorienne', 'Espagnole', 'Estonienne',
    'Éthiopienne', 'Finlandaise', 'Française', 'Gabonaise', 'Ghanéenne', 'Grecque', 'Guatémaltèque', 'Guinéenne',
    'Haïtienne', 'Hondurienne', 'Hongroise', 'Indienne', 'Indonésienne', 'Irakienne', 'Iranienne', 'Irlandaise',
    'Israélienne', 'Italienne', 'Ivoirienne', 'Jamaïcaine', 'Japonaise', 'Jordanienne', 'Kazakhe', 'Kényane',
    'Koweïtienne', 'Laotienne', 'Libanaise', 'Libérienne', 'Libyenne', 'Lituanienne', 'Luxembourgeoise',
    'Malgache', 'Malienne', 'Maltaise', 'Marocaine', 'Mauricienne', 'Mexicaine', 'Moldave', 'Monégasque',
    'Mongole', 'Mozambicaine', 'Néerlandaise', 'Népalaise', 'Nigériane', 'Norvégienne', 'Néo-Zélandaise',
    'Omanaise', 'Ougandaise', 'Ouzbèke', 'Pakistanaise', 'Palestinienne', 'Panaméenne', 'Paraguayenne', 'Péruvienne',
    'Philippine', 'Polonaise', 'Portugaise', 'Qatarienne', 'Roumaine', 'Russe', 'Rwandaise', 'Saoudienne',
    'Sénégalaise', 'Serbe', 'Singapourienne', 'Slovaque', 'Slovène', 'Somalienne', 'Soudanaise', 'Sri-Lankaise',
    'Suédoise', 'Suisse', 'Syrienne', 'Tanzanienne', 'Tchadienne', 'Tchèque', 'Thaïlandaise', 'Togolaise',
    'Trinidadienne', 'Tunisienne', 'Turque', 'Ukrainienne', 'Uruguayenne', 'Vénézuélienne', 'Vietnamienne', 'Yéménite', 'Zambienne', 'Zimbabwéenne'
  ];

  constructor(
    private _snackBar: MatSnackBar,
    private authService: AuthService, // Injection du service d'authentification
    private userProfileService: UserProfileService // Injection du service de profil utilisateur
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire d'inscription avec tous les champs
    this.registrationForm = new FormGroup({
      // Champs d'authentification
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),

      // Champs du profil utilisateur
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      birthDate: new FormControl(null, Validators.required),
      birthPlace: new FormControl('', Validators.required),
      currentResidence: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      bioInfo: new FormControl(''),
      nationality: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\+?\d{6,15}$/)]),
      profession: new FormControl('', Validators.required)
    });
  }

  // Méthode appelée lors de la soumission du formulaire
  async onSubmit(): Promise<void> {
    if (this.registrationForm.invalid) {
      console.warn('Formulaire invalide ! Veuillez corriger les erreurs.');
      this._snackBar.open('Veuillez remplir tous les champs requis et corriger les erreurs.', 'Fermer', {
        duration: 5000,
        panelClass: ['snackbar-error']
      });
      this.registrationForm.markAllAsTouched();
      return;
    }

    // Récupérer les valeurs du formulaire
    // Destructuration pour séparer email et password des autres données de profil
    const { email, password, ...profileDataFromForm } = this.registrationForm.value;

    try {
      // 1. Inscrire l'utilisateur dans Firebase Authentication
      const userCredential = await this.authService.registerWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user; // L'objet User de Firebase, contient l'UID

      if (firebaseUser) {
        // 2. Préparer l'objet UserProfile en utilisant l'UID réel de Firebase
        const userProfile: UserProfile = {
          uid: firebaseUser.uid, // <== C'EST L'UID OBTENU DE L'AUTH DE FIREBASE
          firstName: profileDataFromForm.firstName,
          lastName: profileDataFromForm.lastName,
          birthDate: profileDataFromForm.birthDate,
          birthPlace: profileDataFromForm.birthPlace,
          currentResidence: profileDataFromForm.currentResidence,
          gender: profileDataFromForm.gender,
          bioInfo: profileDataFromForm.bioInfo,
          nationality: profileDataFromForm.nationality,
          phoneNumber: profileDataFromForm.phoneNumber,
          profession: profileDataFromForm.profession,
          // createdAt et updatedAt peuvent être ajoutés par le service ou ici avec de nouvelles Date()
        };

        // 3. Enregistrer les données du profil dans Firestore
        this.loading.set(false);

        await this.userProfileService.createUserProfile(userProfile);

        console.log('Compte créé et profil enregistré avec succès pour:', firebaseUser.email, 'UID:', firebaseUser.uid);
        this._snackBar.open('Votre compte a été créé avec succès !', 'Fermer', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      this.loading.set(true);

        this.registrationForm.reset(); // Réinitialise le formulaire

        // Rediriger l'utilisateur vers une page après une inscription réussie (ex: tableau de bord)
        // this.router.navigate(['/dashboard']); 
        this.close(); // Ferme la modale si le composant est utilisé dans un MatDialog

      } else {
        throw new Error("Erreur inattendue : L'utilisateur Firebase n'a pas été retourné après l'inscription.");
      }

    } catch (error: any) {
      console.error("Erreur lors de l'inscription ou de l'enregistrement du profil :", error);
      let errorMessage = "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";

      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Cet e-mail est déjà utilisé. Veuillez vous connecter ou utiliser un autre e-mail.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'L\'adresse e-mail fournie est invalide.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Le mot de passe est trop faible (6 caractères minimum requis).';
            break;
          case 'auth/operation-not-allowed':
              errorMessage = 'L\'authentification par e-mail/mot de passe n\'est pas activée dans votre projet Firebase.';
              break;
          default:
            errorMessage = `Erreur d'authentification: ${error.message}`;
        }
      }

      this._snackBar.open(errorMessage, 'Fermer', {
        duration: 7000,
        panelClass: ['snackbar-error']
      });
    }
  }

  // Helper pour accéder facilement aux contrôles du formulaire dans le template
  get f() { return this.registrationForm.controls; }

  close(): void {
    this.dialog.closeAll();
  }

   log(){
    this.dialog.closeAll();
    // dialog =inject(MatDialog);
         this.dialog.open(LogComponent, { 
         width: "35rem",
         disableClose: true,
      });
  }
}