import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-high-score-popup',
  imports: [CommonModule],
  templateUrl: './high-score-popup.component.html',
  styleUrls: ['./high-score-popup.component.css'],
})
export class HighScorePopupComponent {
  constructor(
    public dialogRef: MatDialogRef<HighScorePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { score: number; name: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
