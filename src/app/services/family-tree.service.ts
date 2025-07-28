// src/app/services/family-tree.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  query,
  where,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch // <-- N'oubliez pas d'importer writeBatch si vous l'utilisez
} from '@angular/fire/firestore';
import { Observable, switchMap, of, throwError, from, map } from 'rxjs';
import { Person, Relationship, Invitation, SharedTree, UserProfile } from '../models/family-tree.models';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FamilyTreeService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  // --- Helpers pour obtenir les références de collection/document ---

  private getTreeCollectionRef<T>(targetUid: string, collectionName: string): CollectionReference<T> {
    if (!targetUid) {
      throw new Error("Target UID is missing for tree collection reference.");
    }
    return collection(this.firestore, `users/${targetUid}/${collectionName}`) as CollectionReference<T>;
  }

  private getTreeDocumentRef<T>(targetUid: string, collectionName: string, docId: string): DocumentReference<T> {
    if (!targetUid) {
      throw new Error("Target UID is missing for tree document reference.");
    }
    return doc(this.firestore, `users/${targetUid}/${collectionName}/${docId}`) as DocumentReference<T>;
  }

  // --- Opérations pour le profil utilisateur ---

  getUserProfile(uid: string): Observable<UserProfile | undefined> {
    const userProfileDocRef = doc(this.firestore, `users/${uid}/profile/data`);
    return docData(userProfileDocRef, { idField: 'uid' }) as Observable<UserProfile>;
  }

  async setUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
    const userProfileDocRef = doc(this.firestore, `users/${uid}/profile/data`);
    return setDoc(userProfileDocRef, profile, { merge: true });
  }

  // --- Opérations pour les arbres (People & Relationships) basé sur l'arbre actif de l'utilisateur ---

  getActiveTreeUid(): Observable<string | null> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }
        return this.getUserProfile(user.uid).pipe(
          map(profile => profile?.defaultViewingTreeUid || user.uid)
        );
      })
    );
  }

  async setActiveTreeUid(targetUid: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error("Utilisateur non connecté.");
    return this.setUserProfile(currentUser.uid, { defaultViewingTreeUid: targetUid });
  }

  getPeople(): Observable<Person[]> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return of([]);
        }
        return this.getActiveTreeUid().pipe(
          switchMap(activeTreeUid => {
            if (!activeTreeUid) {
              return of([]);
            }
            return collectionData(this.getTreeCollectionRef<Person>(activeTreeUid, 'people'), { idField: 'id' });
          })
        );
      })
    ) as Observable<Person[]>;
  }

  getRelationships(): Observable<Relationship[]> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return of([]);
        }
        return this.getActiveTreeUid().pipe(
          switchMap(activeTreeUid => {
            if (!activeTreeUid) {
              return of([]);
            }
            return collectionData(this.getTreeCollectionRef<Relationship>(activeTreeUid, 'relationships'), { idField: 'id' });
          })
        );
      })
    ) as Observable<Relationship[]>;
  }

  // --- Opérations CRUD pour les personnes (Nœuds) de l'arbre ACTIF ---

  addPerson(person: Omit<Person, 'id'>): Observable<string> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Impossible d'ajouter une personne : utilisateur non connecté."));
        }
        return this.getActiveTreeUid().pipe(
          switchMap(activeTreeUid => {
            if (!activeTreeUid) {
              return throwError(() => new Error("Aucun arbre actif sélectionné."));
            }
            return from(addDoc(this.getTreeCollectionRef<Person>(activeTreeUid, 'people'), person)).pipe(
              map(docRef => docRef.id)
            );
          })
        );
      })
    );
  }

  updatePerson(id: string, person: Partial<Person>): Observable<void> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Impossible de modifier la personne : utilisateur non connecté."));
        }
        return this.getActiveTreeUid().pipe(
          switchMap(activeTreeUid => {
            if (!activeTreeUid) {
              return throwError(() => new Error("Aucun arbre actif sélectionné."));
            }
            return from(updateDoc(this.getTreeDocumentRef<Person>(activeTreeUid, 'people', id), person));
          })
        );
      })
    );
  }

  deletePerson(id: string): Observable<void> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Impossible de supprimer la personne : utilisateur non connecté."));
        }
        return this.getActiveTreeUid().pipe(
          switchMap(activeTreeUid => {
            if (!activeTreeUid) {
              return throwError(() => new Error("Aucun arbre actif sélectionné."));
            }
            return from(deleteDoc(this.getTreeDocumentRef<Person>(activeTreeUid, 'people', id)));
          })
        );
      })
    );
  }

  // --- Opérations CRUD pour les relations (Arêtes) de l'arbre ACTIF ---

  addRelationship(relationship: Omit<Relationship, 'id'>): Observable<string> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Impossible d'ajouter une relation : utilisateur non connecté."));
        }
        return this.getActiveTreeUid().pipe(
          switchMap(activeTreeUid => {
            if (!activeTreeUid) {
              return throwError(() => new Error("Aucun arbre actif sélectionné."));
            }
            return from(addDoc(this.getTreeCollectionRef<Relationship>(activeTreeUid, 'relationships'), relationship)).pipe(
              map(docRef => docRef.id)
            );
          })
        );
      })
    );
  }

  updateRelationship(id: string, relationship: Partial<Relationship>): Observable<void> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Impossible de modifier la relation : utilisateur non connecté."));
        }
        return this.getActiveTreeUid().pipe(
          switchMap(activeTreeUid => {
            if (!activeTreeUid) {
              return throwError(() => new Error("Aucun arbre actif sélectionné."));
            }
            return from(updateDoc(this.getTreeDocumentRef<Relationship>(activeTreeUid, 'relationships', id), relationship));
          })
        );
      })
    );
  }

  deleteRelationship(id: string): Observable<void> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Impossible de supprimer la relation : utilisateur non connecté."));
        }
        return this.getActiveTreeUid().pipe(
          switchMap(activeTreeUid => {
            if (!activeTreeUid) {
              return throwError(() => new Error("Aucun arbre actif sélectionné."));
            }
            return from(deleteDoc(this.getTreeDocumentRef<Relationship>(activeTreeUid, 'relationships', id)));
          })
        );
      })
    );
  }

  // --- Opérations pour les Invitations ---

  // Important: Permettre explicitement 'null' dans le type du paramètre
  sendInvitation(invitedEmail: string, personIdInTree?: string | null): Observable<string> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Veuillez vous connecter pour envoyer une invitation."));
        }
        if (currentUser.email === invitedEmail) {
          return throwError(() => new Error("Vous ne pouvez pas vous inviter vous-même."));
        }

        return from(getDocs(query(collection(this.firestore, 'invitations'),
          where('ownerUid', '==', currentUser.uid),
          where('invitedEmail', '==', invitedEmail),
          where('status', '==', 'pending')
        ))).pipe(
          switchMap(existingInvitations => {
            if (!existingInvitations.empty) {
              return throwError(() => new Error("Une invitation est déjà en attente pour cet utilisateur."));
            }

            const newInvitation: Omit<Invitation, 'id'> = {
              ownerUid: currentUser.uid,
              ownerEmail: currentUser.email || 'Inconnu',
              invitedEmail: invitedEmail,
              // Utiliser l'opérateur de coalescence nulle (??) pour s'assurer que c'est 'string' ou 'null', jamais 'undefined'
              personIdInTree: personIdInTree ?? null,
              status: 'pending',
              createdAt: serverTimestamp(),
            };
            return from(addDoc(collection(this.firestore, 'invitations'), newInvitation)).pipe(
              map(docRef => docRef.id)
            );
          })
        );
      })
    );
  }

  getPendingInvitations(): Observable<Invitation[]> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser || !currentUser.email) {
          return of([]);
        }
        const q = query(collection(this.firestore, 'invitations'),
          where('invitedEmail', '==', currentUser.email),
          where('status', '==', 'pending')
        );
        return collectionData(q, { idField: 'id' }) as Observable<Invitation[]>;
      })
    );
  }

  acceptInvitation(invitationId: string, invitation: Invitation): Observable<void> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Veuillez vous connecter pour accepter une invitation."));
        }

        const invitationDocRef = doc(this.firestore, `invitations/${invitationId}`);
        // Utiliser la référence basée sur l'UID de l'utilisateur qui ACCEPTE l'invitation
        const sharedTreeDocRef = doc(this.firestore, `users/${currentUser.uid}/sharedTrees/${invitation.ownerUid}`);
        
        const sharedTree: SharedTree = {
          ownerUid: invitation.ownerUid,
          ownerEmail: invitation.ownerEmail,
          treeName: `Arbre de ${invitation.ownerEmail}`, // Ou une valeur plus significative
          accessLevel: 'viewer',
          // Utiliser l'opérateur de coalescence nulle ici aussi
          linkedPersonId: invitation.personIdInTree ?? null, // Assurer que c'est 'string' ou 'null'
          isSelected: false
        };

        // Utiliser writeBatch pour les opérations atomiques
        const batch = writeBatch(this.firestore);
        batch.update(invitationDocRef, { status: 'accepted' });
        batch.set(sharedTreeDocRef, sharedTree);

        // Chaîner les opérations dans un observable
        return from(batch.commit()).pipe(
          switchMap(() => from(this.setActiveTreeUid(invitation.ownerUid))) // Mettre à jour l'arbre actif de l'utilisateur qui accepte
        );
      })
    );
  }

  declineInvitation(invitationId: string): Observable<void> {
    const invitationDocRef = doc(this.firestore, `invitations/${invitationId}`);
    return from(updateDoc(invitationDocRef, { status: 'declined' }));
  }

  // --- Opérations pour les arbres partagés (liste des arbres accessibles par l'utilisateur) ---

  getAccessibleTrees(): Observable<SharedTree[]> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return of([]);
        }
        const sharedTreesCollectionRef = collection(this.firestore, `users/${currentUser.uid}/sharedTrees`);

        // Obtenez l'arbre de l'utilisateur actuel comme un objet SharedTree
        const ownTree: SharedTree = {
            id: currentUser.uid,
            ownerUid: currentUser.uid,
            ownerEmail: currentUser.email || 'Mon Arbre',
            treeName: 'Mon propre arbre',
            accessLevel: 'editor',
            linkedPersonId: null, // L'arbre propre n'a pas de linkedPersonId pour l'utilisateur
            isSelected: false
        };

        return collectionData(sharedTreesCollectionRef, { idField: 'id' }).pipe(
            map(shared => {
                const allTrees = [ownTree, ...shared];
                return allTrees as SharedTree[];
            }),
            switchMap(allTrees =>
                this.getUserProfile(currentUser.uid).pipe(
                    map(profile => {
                        const updatedTrees = allTrees.map(tree => ({
                            ...tree,
                            isSelected: tree.ownerUid === (profile?.defaultViewingTreeUid || currentUser.uid)
                        }));
                        return updatedTrees as SharedTree[];
                    })
                )
            )
        );
      })
    );
  }

  removeSharedTree(ownerUidToRemove: string): Observable<void> {
    return this.authService.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error("Utilisateur non connecté."));
        }

        return from(this.getUserProfile(currentUser.uid)).pipe(
          switchMap(profile => {
            let updateActiveTree$: Observable<void> = of(undefined);
            if (profile?.defaultViewingTreeUid === ownerUidToRemove) {
                updateActiveTree$ = from(this.setActiveTreeUid(currentUser.uid));
            }

            const sharedTreeDocRef = doc(this.firestore, `users/${currentUser.uid}/sharedTrees/${ownerUidToRemove}`);
            return updateActiveTree$.pipe(
              switchMap(() => from(deleteDoc(sharedTreeDocRef)))
            );
          })
        );
      })
    );
  }
}