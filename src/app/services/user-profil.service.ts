// src/app/services/user-profile.service.ts

import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collectionData,
  docData,            // <-- Utilisé pour l'Observable
  serverTimestamp,
  Timestamp,
  query,
  where,
  limit
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user-profile.models';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private firestore: Firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');

  constructor() { }

  async createUserProfile(userProfile: UserProfile): Promise<void> {
    if (!userProfile.uid) {
      throw new Error("L'UID de l'utilisateur est manquant dans l'objet UserProfile.");
    }
    const userDocRef = doc(this.usersCollection, userProfile.uid);
    const dataToSave = {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    return setDoc(userDocRef, dataToSave);
  }

  /**
   * Récupère le profil d'un utilisateur spécifique par son UID sous forme d'Observable.
   * Cet Observable émettra le profil à chaque fois qu'il est mis à jour dans Firestore.
   * C'est la méthode que votre ToolbarComponent utilisera pour obtenir les données de profil en temps réel.
   *
   * @param uid L'UID de l'utilisateur dont le profil doit être récupéré.
   * @returns Un Observable qui émet l'objet UserProfile, ou `undefined` si le document n'existe pas.
   */
  getUserProfileObservable(uid: string): Observable<UserProfile | undefined> { // <-- RENOMMÉE ICI
    const userDocRef = doc(this.usersCollection, uid);
    return docData(userDocRef) as Observable<UserProfile | undefined>;
  }

  // L'ancienne méthode getUserProfile a été renommée ou vous pouvez la garder si vous voulez les deux.
  // Voici l'implémentation de getUserProfileOnce qui retourne une Promise:
  async getUserProfileOnce(uid: string): Promise<UserProfile | null> {
    const userDocRef = doc(this.usersCollection, uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log(`Aucun profil trouvé pour l'UID: ${uid}`);
      return null;
    }
  }

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userDocRef = doc(this.usersCollection, uid);
    const dataToUpdate = {
      ...data,
      updatedAt: serverTimestamp()
    };
    return updateDoc(userDocRef, dataToUpdate);
  }

  async deleteUserProfile(uid: string): Promise<void> {
    const userDocRef = doc(this.usersCollection, uid);
    return deleteDoc(userDocRef);
  }

  getAllUserProfiles(): Observable<UserProfile[]> {
    const usersQuery = query(this.usersCollection);
    return collectionData(usersQuery, { idField: 'uid' }) as Observable<UserProfile[]>;
  }

  async profileExists(uid: string): Promise<boolean> {
    const userDocRef = doc(this.usersCollection, uid);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists();
  }
}