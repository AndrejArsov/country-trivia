import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MaterialModule } from '../material.module';

@Component({
  selector: 'app-leaderboard',
  imports: [MaterialModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {

  
  private _router = inject(Router)
  private _user = inject(UserService)

  displayedColumns: string[] = [
    'rank',
    'name',
    'score',
    'date'
  ];
  dataSource = <any>[]
  dataSourceActive = <any>[]

  displayedColumnsGames: string[] = [
    'rank',
    'name',
    'gamesPlayed',
    'createdAt'
  ];
  dataSourceGames = <any>[]
  dataSourceActiveGames = <any>[]

  activeUser: any;
  activeUserGames: any;
  userScoreRow : any;
  userGamesRow: any;
  userScore : any;
  userName : any
  userScoreDate: any;
  userScoreRank: any;
  userGames: any;

  foundUser = false;
  foundUserGames = false;

  loading = true;

  isEasyScores = true;

  async ngOnInit() {
    const currentUser = await this._user.loadUserProfile()
    var rank = 0
    var rankGames = 0
    if(this.isEasyScores == true) {
      var scores = await this._user.getEasyScores()
    }
    else {
      var scores = await this._user.getHardScores()
    }
    scores.forEach(element => {
      rank++
      element['date'] = this.formatDate(element['date'])

      if(rank == 1) {
        const firstPlace = '🏆'
        element['rank'] = firstPlace
      }
      else if (rank == 2) {
        const secondPlace = '🥈'
        element['rank'] = secondPlace
      }
      else if (rank == 3) {
        const thirdPlace = '🥉'
        element['rank'] = thirdPlace
      }
      else {
        element['rank'] = rank
      }

      if((currentUser.name == element['name']) && ((currentUser.easyHighScore == element['score']) || (currentUser.hardHighScore == element['score'])) ) {
        this.userName = currentUser.name
        if(this.isEasyScores == true) {
          this.userScore = currentUser.easyHighScore
          this.activeUser = {
            rank: element['rank'],
            date: element['date'],
            score: currentUser.easyHighScore,
            name: currentUser.name
          }
        }
        else {
          this.userScore = currentUser.hardHighScore
          this.activeUser = {
            rank: element['rank'],
            date: element['date'],
            score: currentUser.hardHighScore,
            name: currentUser.name
          }
        }
        
        this.dataSourceActive.push(this.activeUser)
        this.foundUser = true
      }
      

    });
    this.dataSource = scores

    var users = await this._user.getUsers()
    users = users.filter(element => element['gamesPlayed'] !== 0);
    users.forEach(element => {
        rankGames++
        element['createdAt'] = this.formatDate(element['createdAt'])

        if(rankGames == 1) {
          const firstPlace = '🏆'
          element['rank'] = firstPlace
        }
        else if (rankGames == 2) {
          const secondPlace = '🥈'
          element['rank'] = secondPlace
        }
        else if (rankGames == 3) {
          const thirdPlace = '🥉'
          element['rank'] = thirdPlace
        }
        else {
          element['rank'] = rankGames
        }

        if((currentUser.name == element['name']) && (currentUser.gamesPlayed == element['gamesPlayed'])) {
          
          this.userName = currentUser.name
          this.userGames = currentUser.gamesPlayed
          
          this.activeUserGames = {
            rank: element['rank'],
            createdAt: element['createdAt'],
            gamesPlayed: element['gamesPlayed'],
            name: currentUser.name
          }
          this.dataSourceActiveGames.push(this.activeUserGames)
          this.foundUserGames = true
        }
    });
    this.dataSourceGames = users
    this.loading = false
  }

  ngAfterViewChecked() {
    this.userScoreRow = document.getElementById('row_' + this.userName + '_' + this.userScore)
    if(this.userScoreRow != null) {
      this.userScoreRow.classList.add("selectedUserBg")
    }
    this.userGamesRow = document.getElementById('row_' + this.userName + '_' + this.userGames + '_games')
    if(this.userGamesRow != null) {
      this.userGamesRow.classList.add("selectedUserBg")
    }

  }
  
  goBack() {
    this._router.navigateByUrl('/')
  }

  formatDate(timestamp: any): string {
    const dateObj = timestamp.toDate();
    return dateObj;
  }
  
}
