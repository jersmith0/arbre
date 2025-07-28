// src/app/components/add-relationship-dialog/add-relationship-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

export interface AddRelationshipDialogData {
  fromNodeLabel: string;
  toNodeLabel: string;
}

@Component({
  selector: 'app-add-relationship-dialog',
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
  templateUrl: './add-relationship-dialog.component.html',
  styleUrl: './add-relationship-dialog.component.scss'
})
export class AddRelationshipDialogComponent {
  relationshipType: string = 'marié'; // Valeur par défaut
  relationshipLabel: string = 'marié'; // Initialise avec le type par défaut

  relationshipTypes: { value: string, viewValue: string }[] = [
    { value: 'marié', viewValue: 'marié' },
    { value: 'mariée', viewValue: 'mariée' },
    { value: 'fils', viewValue: 'fils' },
    { value: 'fille', viewValue: 'fille' },
    { value: 'père', viewValue: 'père' },
    { value: 'mère', viewValue: 'ùère' },
    { value: 'frère', viewValue: 'frère' },
    { value: 'soeur', viewValue: 'soeur' },
    { value: 'cousin', viewValue: 'cousin' },
    { value: 'cousine', viewValue: 'cousine' },

  ];

  constructor(
    public dialogRef: MatDialogRef<AddRelationshipDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRelationshipDialogData
  ) {
    // Le label par défaut est le type choisi
    this.relationshipLabel = this.relationshipType;
  }

  onTypeChange(): void {
    // Mettre à jour le label automatiquement lorsque le type change
    this.relationshipLabel = this.relationshipType;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onAddRelationship(): void {
    if (this.relationshipLabel.trim()) {
      this.dialogRef.close({
        type: this.relationshipType,
        label: this.relationshipLabel.trim()
      });
    }
  }
}