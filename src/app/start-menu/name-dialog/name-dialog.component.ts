import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-name-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './name-dialog.component.html',
  styleUrls: ['./name-dialog.component.css', '../../../bootstrap.css']
})
export class NameDialogComponent {
  name: string = '';
  subscription: any;

  constructor(public dialogRef: MatDialogRef<NameDialogComponent>, private userService: UserService,) {}

  
  async save() {
    var isTaken = false

    const emptyName = document.getElementById('emptyField')
    const takenName = document.getElementById('nameTaken')
    
    emptyName?.classList.add('d-none')
    takenName?.classList.add('d-none')
    
    if((this.name == '') || (this.name && this.name.trim().length == 0)) {
      emptyName?.classList.remove('d-none')
    }
    else {
      const users = await this.userService.getUsers()
      users.forEach(element => {
        if(element['name'].toLowerCase() == this.name.toLowerCase()) {
          takenName?.classList.remove('d-none')
          isTaken = true
        }
      });
      if(isTaken == false) {
        this.dialogRef.close(this.name);
      }
    }
  }

}
