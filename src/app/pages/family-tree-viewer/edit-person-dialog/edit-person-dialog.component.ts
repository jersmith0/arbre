// src/app/components/edit-person-dialog/edit-person-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

export interface EditPersonDialogData {
  id: string;
  label: string;
  shape: string;
  color: string | null;
}

@Component({
  selector: 'app-edit-person-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './edit-person-dialog.component.html',
  styleUrl: './edit-person-dialog.component.scss'
})
export class EditPersonDialogComponent {
  editedLabel: string;
  editedShape: string;
  editedColor: string | null;

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

  colorOptions: { value: string | null, viewValue: string }[] = [
    { value: null, viewValue: 'Par défaut' },
    { value: '#FFC0CB', viewValue: 'Rose' },
    { value: '#ADD8E6', viewValue: 'Bleu clair' },
    { value: '#90EE90', viewValue: 'Vert clair' },
    { value: '#FFD700', viewValue: 'Or' },
    { value: '#D3D3D3', viewValue: 'Gris clair' }
  ];

  constructor(
    public dialogRef: MatDialogRef<EditPersonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditPersonDialogData
  ) {
    this.editedLabel = data.label;
    this.editedShape = data.shape;
    this.editedColor = data.color;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editedLabel.trim()) {
      this.dialogRef.close({
        id: this.data.id,
        label: this.editedLabel.trim(),
        shape: this.editedShape,
        color: this.editedColor
      });
    }
  }
}