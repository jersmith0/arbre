// src/app/components/edit-relationship-dialog/edit-relationship-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

export interface EditRelationshipDialogData {
  id: string;
  label: string;
  type: string;
}

@Component({
  selector: 'app-edit-relationship-dialog',
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
  templateUrl: './edit-relationship-dialog.component.html',
  styleUrl: './edit-relationship-dialog.component.scss'
})
export class EditRelationshipDialogComponent {
  editedLabel: string;
  editedType: string;

  relationshipTypes: { value: string, viewValue: string }[] = [
    { value: 'parent-child', viewValue: 'Parent-Enfant' },
    { value: 'child-parent', viewValue: 'Enfant-Parent' },
    { value: 'marriage', viewValue: 'Mariage' },
    { value: 'sibling', viewValue: 'Frère/Sœur' },
    { value: 'other', viewValue: 'Autre' }
  ];

  constructor(
    public dialogRef: MatDialogRef<EditRelationshipDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditRelationshipDialogData
  ) {
    this.editedLabel = data.label;
    this.editedType = data.type;
  }

  onTypeChange(): void {
    // Si le label est identique au type, le mettre à jour automatiquement
    // Sinon, laisser l'utilisateur choisir son propre label
    if (this.editedLabel === this.data.type) {
      this.editedLabel = this.editedType;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editedLabel.trim()) {
      this.dialogRef.close({
        id: this.data.id,
        label: this.editedLabel.trim(),
        type: this.editedType
      });
    }
  }
}