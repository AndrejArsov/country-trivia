
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { NameDialogComponent } from './name-dialog/name-dialog.component';
import { UserInfoComponent } from "./user-info/user-info.component";

@Component({
  selector: 'app-start-menu',
  standalone: true,
  imports: [UserInfoComponent],
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.css', '../../bootstrap.css'],
})
export class StartMenuComponent {
  private _router = inject(Router);
  loading = true;
  userProfile: any = null;

  name: any;

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
        this.loading = false;
        // Show the name entry dialog
        const dialogRef = this.dialog.open(NameDialogComponent, {
          width: '600px',
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(async (name: string) => {
          if (name && name.trim().length > 0) {
            await this.userService.createUserProfile(name.trim());
            this.userProfile = await this.userService.loadUserProfile();

            this.name = name;
          }
        });
      }
    }, 200);
  }

  startGame() {
    this._router.navigateByUrl('/game')
  }

  goToLeaderboard() {
    this._router.navigateByUrl('/leaderboard')
  }
  
}
