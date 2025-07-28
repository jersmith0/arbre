

// src/app/components/card/card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngIf
import { RouterModule } from '@angular/router';   // Pour [routerLink]
import { MatCardModule } from '@angular/material/card'; // Pour le style de carte Material
import { MatButtonModule } from '@angular/material/button'; // Pour les boutons Material
import { MatIconModule } from '@angular/material/icon';     // Pour les icônes Material
import { CardData } from '../../../models/card.models';

@Component({
  selector: 'app-card', // Le sélecteur HTML pour utiliser ce composant
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Nécessaire pour [routerLink]
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
 template: `
   <mat-card class="app-card-item">
  <img mat-card-image *ngIf="cardData.imageUrl" [src]="cardData.imageUrl" alt="Image pour {{ cardData.title }}">

  <mat-card-header>
    <mat-icon mat-card-avatar *ngIf="cardData.icon">{{ cardData.icon }}</mat-icon>
    <mat-card-title>{{ cardData.title }}</mat-card-title>
  </mat-card-header>

  <mat-card-content>
    <p>{{ cardData.description }}</p>
  </mat-card-content>

  <mat-card-actions *ngIf="cardData.link">
    <button mat-button [routerLink]="cardData.link">EN SAVOIR PLUS</button>
  </mat-card-actions>
</mat-card>
  `,
  styles: `/* src/app/components/card/card.component.scss */

.app-card-item {
  width: 100%; /* Prendra toute la largeur disponible dans sa colonne de grille */
  height: auto; /* Hauteur ajustée au contenu */
  display: flex; /* Utilisation de flexbox pour l'agencement interne */
  flex-direction: column;
  justify-content: space-between; /* Pour pousser les actions vers le bas si le contenu est court */
  box-sizing: border-box; /* Assure que padding et border sont inclus dans la taille */
  
  .mat-mdc-card-header {
    padding: 16px;
    .mat-mdc-card-avatar {
      background-color: var(--mdc-theme-primary); // Utilise la couleur primaire de Material Design
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%; /* Icône circulaire */
    }
  }

  .mat-mdc-card-content {
    flex-grow: 1; /* Permet au contenu de prendre l'espace restant */
    padding: 0 16px 16px;
  }

  .mat-mdc-card-actions {
    padding: 8px 16px 16px;
    display: flex;
    justify-content: flex-end; /* Aligner le bouton "EN SAVOIR PLUS" à droite */
  }

  img.mat-mdc-card-image {
    max-height: 180px;
    object-fit: cover;
    width: 100%;
  }
}`
})
export class CardComponent {
  // Cette propriété recevra les données d'une carte spécifique du composant parent
  @Input() cardData!: CardData; // Le '!' indique qu'elle sera initialisée
}