
import { Timestamp } from '@angular/fire/firestore'; // Importez Timestamp si vous l'utilisez pour les dates Firestore

export interface UserProfile {
    uid: string; // L'UID unique de l'utilisateur fourni par Firebase Authentication
    firstName: string;
    lastName: string;
    birthDate: Date | Timestamp; // Peut être un objet Date en JS, converti en Timestamp par Firestore
    birthPlace: string;
    currentResidence: string;
    gender: 'Masculin' | 'Féminin' ;
    nationality: string;
    phoneNumber: string;
    profession: string;
    bioInfo?: string; // Facultatif
    createdAt?: Timestamp; // Horodatage de création, facultatif mais utile
    updatedAt?: Timestamp; // Horodatage de dernière mise à jour, facultatif mais utile
}
