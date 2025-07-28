
// src/app/components/card-list/card-list.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngFor
import { CardComponent } from '../card-content.component';
import { CardData } from '../../../../models/card.models';


@Component({
  selector: 'app-card-list', // Sélecteur HTML pour la liste de cartes
  standalone: true,
  imports: [
    CommonModule,
    CardComponent // Ajoutez CardComponent aux imports pour l'utiliser dans le template
  ],
 template: `
 <div class="card-list-container">
  <app-card *ngFor="let card of cards" [cardData]="card"></app-card>
</div>
  `,
  styles: `/* src/app/components/card-list/card-list.component.scss */

.card-list-container {
  display: grid; /* Utilise CSS Grid pour organiser les cartes en colonnes */
  gap: 20px;     /* Espacement entre les cartes */

  /* Responsive : crée des colonnes qui s'adaptent, avec une largeur minimale de 280px */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr; /* Une seule colonne sur les très petits écrans */
  }
}`
})
export class CardListComponent {
  // Cette propriété recevra le tableau de données de cartes du composant parent
  @Input() cards: CardData[] = [];
}
