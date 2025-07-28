// src/app/models/family-tree.models.ts

// --- Vis.js Node/Edge Models (Your custom types) ---

export interface Person {
  id?: string; // Optional ID for Firestore document ID
  label: string;
  shape?: string;
  // Allow string, null, or undefined for color to match Firestore's capability
  color?: string | null;
  // Add other properties relevant to a person (e.g., dob, dod, gender, profession)
  dob?: string | null; // Date of Birth
  gender?: 'male' | 'female' | 'other' | null;
  // ... any other properties
}

export interface Relationship {
  id?: string; // Optional ID for Firestore document ID
  from: string; // ID of the source person
  to: string;   // ID of the target person
  type: 'marié'|'mariée' | 'père' | 'mère' | 'frère'|'soeur'|'cousin'|'cousine'; // Type of relationship
  label?: string; // Label for the edge (e.g., "Parent", "Spouse")
  arrows?: string; // Vis.js arrow configuration (e.g., 'to', 'from', 'to;from')
  dashes?: boolean; // For dashed lines
  // Allow string, null, or undefined for color to match Firestore's capability
  color?: string | null;
}

// --- Invitation Model ---

export interface Invitation {
  id?: string; // ID du document Firestore pour l'invitation elle-même
  ownerUid: string; // UID de l'utilisateur qui a envoyé l'invitation (propriétaire de l'arbre)
  ownerEmail: string; // Email de l'utilisateur qui a envoyé l'invitation
  invitedEmail: string; // Email de l'utilisateur invité
  // C'EST LA CLÉ : cela DOIT être `string | null | undefined`
  // Si vous voulez que ce soit toujours null si non fourni, alors `string | null` est mieux.
  personIdInTree?: string | null; // Ce champ est optionnel et peut être null (pour Firestore) ou undefined (si omis de l'objet)
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: any; // Utiliser `any` pour le type Firebase Timestamp par simplicité ou `FieldValue`
}

// --- Shared Tree Model (for managing accessible trees) ---

export interface SharedTree {
  id?: string;
  ownerUid: string;
  ownerEmail: string;
  treeName?: string | null;
  accessLevel: 'viewer' | 'editor';
  linkedPersonId?: string | null;
  isSelected?: boolean;
}

// --- User Profile Model ---

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  defaultViewingTreeUid: string;
}