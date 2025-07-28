import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

// Interface pour les données du dialogue (si vous en passez)
export interface AddPersonDialogData {
  initialLabel: string;
  // Vous pouvez ajouter d'autres champs ici si vous voulez les initialiser
}

@Component({
  selector: 'app-add-person-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, // Pour que le dialogue fonctionne
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,        // Pour les formulaires basés sur des templates
    ReactiveFormsModule, // Pour les formulaires réactifs (recommandé pour plus de complexité)
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './add-person-dialog.component.html',
  styleUrl: './add-person-dialog.component.scss'
})
export class AddPersonDialogComponent {
  // Propriétés pour le formulaire
  personLabel: string;
  personShape: string = 'box'; // Valeur par défaut
  personColor: string | null = null; // Valeur par défaut

  // Options de forme pour Vis.js
  shapeOptions: { value: string, viewValue: string }[] = [
    { value: 'box', viewValue: 'Boîte' },
    { value: 'circle', viewValue: 'Cercle' },
    { value: 'ellipse', viewValue: 'Ellipse' },
    { value: 'database', viewValue: 'Base de données' },
    { value: 'diamond', viewValue: 'Diamant' },
    { value: 'dot', viewValue: 'Point' },
    { value: 'star', viewValue: 'Étoile' },
    { value: 'triangle', viewValue: 'Triangle' },
    { value: 'triangleDown', viewValue: 'Triangle inversé' },
    { value: 'text', viewValue: 'Texte' },
  ];

  // Options de couleur (vous pouvez étendre cela)
  colorOptions: { value: string | null, viewValue: string }[] = [
    { value: null, viewValue: 'Par défaut' }, // null pour laisser Vis.js choisir ou utiliser le style CSS
    { value: '#FFC0CB', viewValue: 'Rose' },
    { value: '#ADD8E6', viewValue: 'Bleu clair' },
    { value: '#90EE90', viewValue: 'Vert clair' },
    { value: '#FFD700', viewValue: 'Or' },
    { value: '#D3D3D3', viewValue: 'Gris clair' }
  ];

  constructor(
    public dialogRef: MatDialogRef<AddPersonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPersonDialogData
  ) {
    this.personLabel = data.initialLabel;
  }

  onNoClick(): void {
    this.dialogRef.close(); // Ferme le dialogue sans renvoyer de données
  }

  // Méthode appelée lorsque le formulaire est soumis et valide
  onAddPerson(): void {
    if (this.personLabel.trim()) { // Vérifie que le label n'est pas vide
      this.dialogRef.close({
        label: this.personLabel.trim(),
        shape: this.personShape,
        color: this.personColor
      });
    }
  }
}