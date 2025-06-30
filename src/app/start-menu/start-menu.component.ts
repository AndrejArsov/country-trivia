
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { NameDialogComponent } from './name-dialog/name-dialog.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-start-menu',
  imports: [],
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.css', '../../bootstrap.css'],
})
export class StartMenuComponent {
  private _router = inject(Router);
  loading = true;
  userProfile: any = null;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    // Wait a bit to let auth state initialize
    setTimeout(async () => {
      // Load profile
      const profile = await this.userService.loadUserProfile();

      if (profile !== undefined && profile !== null) {
        this.userProfile = profile;
        this.loading = false;
      } else {
        // Show the name entry dialog
        const dialogRef = this.dialog.open(NameDialogComponent, {
          width: '300px',
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(async (name: string) => {
          if (name && name.trim().length > 0) {
            await this.userService.createUserProfile(name.trim());
            this.userProfile = await this.userService.loadUserProfile();
          }
          this.loading = false;
        });
      }
    }, 500);

    
  }


  startGame() {
    this._router.navigateByUrl('/game')
  }

  
}
