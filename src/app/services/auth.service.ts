import { inject, Injectable } from '@angular/core';
import {
  Auth,                               // Le service d'authentification Firebase principal
  authState,                          // Observable de l'état d'authentification
  user,                               // Observable de l'objet utilisateur
  createUserWithEmailAndPassword,     // Pour l'inscription avec e-mail et mot de passe
  signInWithEmailAndPassword,         // Pour la connexion avec e-mail et mot de passe
  signOut,                            // Pour la déconnexion
  UserCredential,                     // Le type de retour pour inscription/connexion
  User                                // Le type de l'objet utilisateur Firebase
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Injecte l'instance de Firebase Auth.
  // L'instance 'Auth' est fournie par AngularFire une fois que vous configurez
  // `provideAuth(() => getAuth())` dans votre `app.module.ts`.
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

  /**
   * Inscrit un nouvel utilisateur avec une adresse e-mail et un mot de passe.
   *
   * @param email L'adresse e-mail du nouvel utilisateur.
   * @param password Le mot de passe du nouvel utilisateur (doit être d'au moins 6 caractères).
   * @returns Une Promise qui résout avec un UserCredential si l'inscription est réussie.
   * @throws Gère et propage les erreurs Firebase (ex: email déjà utilisé, mot de passe trop faible).
   */
  async registerWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Inscription réussie pour:', userCredential.user?.email);
      return userCredential;
    } catch (error: any) {
      console.error("Erreur lors de l'inscription :", error.code, error.message);
      // Vous pouvez ajouter une logique de mapping d'erreurs ici si vous voulez
      // transformer les codes d'erreur Firebase en messages plus conviviaux.
      throw error; // Propage l'erreur au composant appelant
    }
  }

  /**
   * Connecte un utilisateur existant avec son adresse e-mail et son mot de passe.
   *
   * @param email L'adresse e-mail de l'utilisateur.
   * @param password Le mot de passe de l'utilisateur.
   * @returns Une Promise qui résout avec un UserCredential si la connexion est réussie.
   * @throws Gère et propage les erreurs Firebase (ex: mauvais mot de passe, utilisateur non trouvé).
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Connexion réussie pour:', userCredential.user?.email);
      return userCredential;
    } catch (error: any) {
      console.error("Erreur lors de la connexion :", error.code, error.message);
      throw error; // Propage l'erreur
    }
  }

  /**
   * Déconnecte l'utilisateur actuellement authentifié.
   * @returns Une Promise qui résout une fois la déconnexion terminée.
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('Déconnexion réussie.');
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion :", error.code, error.message);
      throw error;
    }
  }

  /**
   * Récupère l'utilisateur Firebase actuellement connecté (snapshot unique).
   * Utile si vous avez besoin de l'utilisateur à un instant précis sans observer les changements.
   * @returns L'objet User ou null.
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}