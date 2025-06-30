import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-name-dialog',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './name-dialog.component.html',
  styleUrl: './name-dialog.component.css'
})
export class NameDialogComponent {
  name: string = '';

  constructor(public dialogRef: MatDialogRef<NameDialogComponent>) {}

  save() {
    this.dialogRef.close(this.name);
  }

}
