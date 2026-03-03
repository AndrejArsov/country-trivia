import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from "../material.module";
import { MatSnackBar } from '@angular/material/snack-bar';

interface Difficulty {
  value: 'easy' | 'hard';
  label: string;
  description: string;
  icon: string;
}

interface GameMode {
  value: 'standard' | 'custom';
  label: string;
  description: string;
  icon: string;
}

interface Region {
  value: 'world' | 'europe' | 'asia' | 'americas' | 'oceania' | 'africa';
  label: string;
  icon: string;
}

interface QuestionType {
  value: 'mixed' | 'population' | 'area' | 'region' | 'borders' | 'capital' | 'flag' | 'currency';
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.css'],
  imports: [CommonModule, MaterialModule],
})
export class GameSetupComponent implements OnInit {
  selectedDifficulty: 'easy' | 'hard' | null = null;
  selectedMode: 'standard' | 'custom' | null = null;
  selectedRegion: 'world' | 'europe' | 'asia' | 'americas' | 'oceania' | 'africa' | null =
    null;
  selectedType: 'mixed' | 'population' | 'area' | 'region' | 'borders' | 'capital' | 'flag' | 'currency' | null = null;

   private practiceSnackBarRef: any = null;

  difficulties: Difficulty[] = [
    {
      value: 'easy',
      label: 'Easy',
      description: 'Great for beginners',
      icon: '😊',
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Challenge yourself!',
      icon: '😬',
    },
  ];

  gameModes: GameMode[] = [
    {
      value: 'standard',
      label: 'Standard',
      description: 'Play with all questions',
      icon: '🌍',
    },
    {
      value: 'custom',
      label: 'Practice',
      description: 'Create your own custom experience',
      icon: '⚙️',
    },
  ];

  regions: Region[] = [
    { value: 'world', label: 'World', icon: '🌎' },
    { value: 'europe', label: 'Europe', icon: '🗼' },
    { value: 'asia', label: 'Asia', icon: '🏯' },
    { value: 'americas', label: 'Americas', icon: '🗽' },
    { value: 'africa', label: 'Africa', icon: '🦁' },
    { value: 'oceania', label: 'Oceania', icon: '🏝️' },
  ];

  questionTypes: QuestionType[] = [
  {
    value: 'mixed',
    label: 'Mixed',
    description: 'A bit of everything',
    icon: '🧩',
  },
  {
    value: 'capital',
    label: 'Capitals',
    description: 'Identify capital cities',
    icon: '🏛️',
  },
  {
    value: 'flag',
    label: 'Flags',
    description: 'Recognize country flags',
    icon: '🚩',
  },
  {
    value: 'population',
    label: 'Population',
    description: 'Guess country populations',
    icon: '👥',
  },
  {
    value: 'area',
    label: 'Area',
    description: 'Compare country sizes',
    icon: '🏞️',
  },
  {
    value: 'region',
    label: 'Region',
    description: 'Find country regions',
    icon: '🗺️',
  },
  {
    value: 'borders',
    label: 'Borders',
    description: 'Guess country borders',
    icon: '🚧',
  },
  {
    value: 'currency',
    label: 'Currency',
    description: 'Identify country currencies',
    icon: '💱',
  },
  
];


  constructor(private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.selectedDifficulty = 'easy'
    this.selectedMode = 'standard'
  }

  selectDifficulty(difficulty: 'easy' | 'hard'): void {
    this.selectedDifficulty = difficulty;
  }

  selectMode(mode: 'standard' | 'custom'): void {
    this.selectedMode = mode;

    if (mode === 'custom') {
      this.practiceSnackBarRef = this.snackBar.open(
        '⚠️ Practice mode does not count for the leaderboard',
        'Close',
        {
          duration: 0,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['practice-snackbar'],
        }
      );
    } else {
      if (this.practiceSnackBarRef) {
        this.practiceSnackBarRef.dismiss();
        this.practiceSnackBarRef = null;
        this.selectedRegion = null;
        this.selectedType = null;
      }
    }
  }

  selectRegion(
    region: 'world' | 'europe' | 'asia' | 'americas' | 'oceania' | 'africa'
  ): void {
    this.selectedRegion = null;
    if(this.selectedType == 'region' && region != 'world') {
      this.snackBar.open('Region question type is only available for world region, please select another region', 'Close', {
        duration: 3000
      }) 
    }
    else {
      this.selectedRegion = region;
    }
  }

  selectType(type: 'mixed' | 'population' | 'area' | 'region' | 'borders' | 'capital' | 'flag' | 'currency'): void {
    if(type == 'region') {
      if(this.selectedRegion == null) {
        this.snackBar.open('Please select a region first', 'Close', {
          duration: 3000
        })
        return
      }
      else if(this.selectedRegion != 'world') {
        this.snackBar.open('Region question type is only available for world region, please select another type', 'Close', {
          duration: 3000
        })
        return
      }
      else {
        this.selectedType = type;
      }
    }
    else {
      this.selectedType = type;
    }
  }

  isFormValid(): boolean {
    const basesValid =
      this.selectedDifficulty !== null && this.selectedMode !== null;

    if (this.selectedMode === 'custom') {
      return (
        basesValid &&
        this.selectedRegion !== null &&
        this.selectedType !== null
      );
    }

    return basesValid;
  }

  startGame(): void {
    if (this.isFormValid()) {
      const gameSettings = {
        difficulty: this.selectedDifficulty,
        mode: this.selectedMode,
        ...(this.selectedMode === 'custom' && {
          region: this.selectedRegion,
          type: this.selectedType,
        }),
      };
      if (this.practiceSnackBarRef) {
        this.practiceSnackBarRef.dismiss();
        this.practiceSnackBarRef = null;
      }
      this.router.navigate(['/game'], {
        queryParams: gameSettings,
      });
    }
  }
  goBack(): void {
  this.router.navigate(['']);
}
}
