// src/app/models/card.model.ts

export interface CardData {
  id: string;        // Identifiant unique de la carte
  title: string;     // Titre de la carte
  description: string; // Description ou bref contenu
  imageUrl?: string; // URL d'une image (optionnel)
  link?: string;     // Lien vers une page associée (optionnel, ex: '/tree/main')
  icon?: string;     // Nom d'une icône Material (optionnel, ex: 'account_tree')
}