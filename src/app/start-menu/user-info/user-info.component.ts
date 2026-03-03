import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css', '../../../bootstrap.css']
})
export class UserInfoComponent implements OnChanges {
  @Input() name!: string | '-'; 

  constructor(private _user: UserService) {}

  easyHighScore = 0;
  hardHighScore = 0;
  loading = true;

  ngOnChanges(changes: SimpleChanges) {
  this.loading = true;
    if (changes['name'] && this.name && this.name !== '-') {
      this.reloadUser();
    }
  }

  async ngOnInit() {
    const user = await this._user.loadUserProfile()
    this.loading = false
    if(user != null) {
      this.name = user.name
      this.easyHighScore = user.easyHighScore
      this.hardHighScore = user.hardHighScore
    }
    else {
      this.name = '-'
    }
  }

  async reloadUser() {
    const user = await this._user.loadUserProfile();
    this.loading = false
    this.name = user.name;
    this.easyHighScore = user.easyHighScore;
    this.hardHighScore = user.hardHighScore;
  }
}
