import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders,  } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { ShortNumberPipe } from '../shortNumber.pipe';
import { answer } from '../models';
import { Router } from '@angular/router';
import { UserService } from '../user.service';


@Component({
  selector: 'app-game-menu',
  imports: [HttpClientModule, CommonModule, ShortNumberPipe],
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss', '../../bootstrap.css'],
  
})
export class GameMenuComponent {
  time = 60
  maxTime = 60

  radius = 40;
  circumference = 2 * Math.PI * this.radius;

  interval: any;

  points = 0
  percentage = 0
  optionsAttempted = 0
  score = 0

  dynamicBg = 'rgba(26, 255, 0, 0.55)';
  
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef)
  private _router = inject(Router);
  private _user = inject(UserService)

  countryList = <any>[]
  countryName!: string;
  numOfCountries!: number

  questions = [
    {
      type: "capital",
      question: "What is the capital of"
    },
    {
      type: "area",
      question: "What is the land area of"
    },
    {
      type: "region",
      question: "In what region is"
    },
    {
      type: "currency",
      question: "What currency is used in"
    },
    {
      type: "flag",
      question: "What is the flag of"
    },
    {
      type: "population",
      question: "What is the population of"
    },
    {
      type: "border",
      question: "How many countries border"
    },
  ]
  question!: string;
  possibleAnswers = <any>[]

  randomCategory: any

  isGameActive = true
  highScore: any;
  name!: string;


  async ngOnInit() {
    this.getToken()
    
  } 

  updateTime() {
    this.time --
    if (this.time > 40) {
      this.dynamicBg = 'rgba(26, 255, 0, 0.55)';
    }
    else if (this.time > 25) {
      this.dynamicBg = 'rgba(255, 217, 0, 0.55)';
    }
    else if (this.time > 10) {
      this.dynamicBg = 'rgba(231, 110, 24, 0.74)';
    }
    else if (this.time == 4) {
      this.dynamicBg = 'rgba(255, 0, 0, 0.86)';
    }
    else if (this.time == 2) {
      this.dynamicBg = 'rgba(255, 0, 0, 0.91)';
    }
    else {
      this.dynamicBg = 'rgba(255, 0, 0, 0.63)';
    }
    if (this.time < 1) {
      this.score = this.points * this.percentage * 10
      this.isGameActive = false
      this.countryName = "GAME OVER"
      this.question = ""
      this._user.incrementGamesPlayed()
      if(this.score > this.highScore) {
        this._user.deleteScoresByName(this.name)
        setTimeout(() => {
          this._user.updateHighScore(this.score)
          this._user.saveScore(this.name, this.score);
        }, 300);
      }
      clearInterval(this.interval)
    }
  }

  get circleOffset(): number {
    return this.circumference * (1 - this.time / this.maxTime);
  }

  get strokeColor(): string {
    if (this.time > 40) return 'rgba(26, 255, 0, 0.55)'; 
    if (this.time > 25) return 'rgba(255, 217, 0, 0.55)'; 
    if (this.time > 10) return 'rgba(231, 110, 24, 0.74)'; 
    return 'rgba(255, 0, 0, 0.63)'; 
  }

  async startGame() {
    
    this.highScore = await this._user.getHighScore()
    this.name = await this._user.getUserName()
    
    this.interval = setInterval(() => {
      this.updateTime()
    }, 1000)

    this.getCountry()
    this.percentage = 0
    this.points = 0
    this.optionsAttempted = 0
    this.isGameActive = true
    this.time = 60
    this.dynamicBg = 'rgba(26, 255, 0, 0.55)';
  }
  getToken() {
    const headers = new HttpHeaders({
      accept: '*/*',
      Platform: 'Web',
      'Content-Type': 'application/json',
    });
    const subscription = this.httpClient.get<any[]>("https://restcountries.com/v3.1/independent?status=true",  { headers : headers }).subscribe({
      next: (result: any[]) => {
        this.countryList = result
        this.numOfCountries = result.length

        this.startGame()
      }
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })   
  }

  getCountry() {
    this.optionsAttempted ++
    this.percentage = this.points / this.optionsAttempted

    var randomIndex = Math.floor(Math.random() * this.numOfCountries)
    while ((randomIndex == 8) || (randomIndex == 30) || (randomIndex == 40) || (randomIndex == 131) || (randomIndex == 153)) {
      randomIndex = Math.floor(Math.random() * this.numOfCountries)
    }
    
    var randomCountry = this.countryList[randomIndex];
    this.countryName = randomCountry.name.common
    
    const randomCategoryId = Math.floor(Math.random() * this.questions.length);
    this.randomCategory = this.questions[randomCategoryId].type
    this.question = this.questions[randomCategoryId].question

     this.possibleAnswers = []
    
    if(this.randomCategory == 'area') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.area
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)
      
      for (let index = 0; index < 3; index++) {
        var possibleWrongAnswer: answer = { answer: '', correct: false };

        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        const randomCountryForWrongAnswer = this.countryList[randomIndex];
        
        var wrongAnswer = randomCountryForWrongAnswer.area
        possibleWrongAnswer.answer = wrongAnswer

        while (this.possibleAnswers.some((a: { answer: string; }) => a.answer === possibleWrongAnswer.answer)) {
          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          const randomCountryForWrongAnswer = this.countryList[randomIndex];
          
          wrongAnswer = randomCountryForWrongAnswer.area
          possibleWrongAnswer.answer = wrongAnswer
        }
        this.possibleAnswers.push(possibleWrongAnswer)

      }
      console.log(this.possibleAnswers)
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
      
    }
    else if(this.randomCategory == 'capital') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.capital[0]
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)

      for (let index = 0; index < 3; index++) {
        var possibleWrongAnswer: answer = { answer: '', correct: false };

        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        const randomCountryForWrongAnswer = this.countryList[randomIndex];
        
        var wrongAnswer = randomCountryForWrongAnswer.capital[0]
        possibleWrongAnswer.answer = wrongAnswer

        while (this.possibleAnswers.some((a: { answer: string; }) => a.answer === possibleWrongAnswer.answer)) {
          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          const randomCountryForWrongAnswer = this.countryList[randomIndex];
          
          wrongAnswer = randomCountryForWrongAnswer.capital[0]
          possibleWrongAnswer.answer = wrongAnswer
        }
        this.possibleAnswers.push(possibleWrongAnswer)

      }
      console.log(this.possibleAnswers)
      
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'population') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.population
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)

      for (let index = 0; index < 3; index++) {
        var possibleWrongAnswer: answer = { answer: '', correct: false };
        
        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        const randomCountryForWrongAnswer = this.countryList[randomIndex];
        
        var wrongAnswer = randomCountryForWrongAnswer.population
        possibleWrongAnswer.answer = wrongAnswer

        while (this.possibleAnswers.some((a: { answer: string; }) => a.answer === possibleWrongAnswer.answer)) {
          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          const randomCountryForWrongAnswer = this.countryList[randomIndex];
          
          wrongAnswer = randomCountryForWrongAnswer.population
          possibleWrongAnswer.answer = wrongAnswer
        }
        this.possibleAnswers.push(possibleWrongAnswer)

      }
      console.log(this.possibleAnswers)
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'border') {
      let possibleAnswer: answer = { answer: '', correct: true };

      var isBordersAdded = randomCountry.borders
      while (isBordersAdded == undefined) {
        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        while ((randomIndex == 8) || (randomIndex == 30) || (randomIndex == 40) || (randomIndex == 131) || (randomIndex == 153)) {
          randomIndex = Math.floor(Math.random() * this.numOfCountries)
        }
        
        randomCountry = this.countryList[randomIndex];
        this.countryName = randomCountry.name.common
        isBordersAdded = randomCountry.borders
      }

      const correctAnswer = randomCountry.borders.length
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)

      for (let index = 0; index < 3; index++) {
        var possibleWrongAnswer: answer = { answer: '', correct: false };

        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        var randomCountryForWrongAnswer = this.countryList[randomIndex];
        
        var isBordersAdded = randomCountryForWrongAnswer.borders

        while (isBordersAdded == undefined) {
          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          
          randomCountryForWrongAnswer = this.countryList[randomIndex];
          isBordersAdded = randomCountryForWrongAnswer.borders
        }

        var wrongAnswer = randomCountryForWrongAnswer.borders.length
        possibleWrongAnswer.answer = wrongAnswer

        while (this.possibleAnswers.some((a: { answer: string; }) => a.answer === possibleWrongAnswer.answer)) {
          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          var randomCountryForWrongAnswer = this.countryList[randomIndex];
          
          var isBordersAdded = randomCountryForWrongAnswer.borders

          while (isBordersAdded == undefined) {
            var randomIndex = Math.floor(Math.random() * this.numOfCountries)
            
            randomCountryForWrongAnswer = this.countryList[randomIndex];
            isBordersAdded = randomCountryForWrongAnswer.borders
          }
          wrongAnswer = randomCountryForWrongAnswer.borders.length
          possibleWrongAnswer.answer = wrongAnswer
        }
        this.possibleAnswers.push(possibleWrongAnswer)

      }
      console.log(this.possibleAnswers)
      
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'region') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.region
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)

      for (let index = 0; index < 3; index++) {
        var possibleWrongAnswer: answer = { answer: '', correct: false };

        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        const randomCountryForWrongAnswer = this.countryList[randomIndex];
        
        var wrongAnswer = randomCountryForWrongAnswer.region
        possibleWrongAnswer.answer = wrongAnswer

        while (this.possibleAnswers.some((a: { answer: string; }) => a.answer === possibleWrongAnswer.answer)) {

          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          const randomCountryForWrongAnswer = this.countryList[randomIndex];
          
          wrongAnswer = randomCountryForWrongAnswer.region
          possibleWrongAnswer.answer = wrongAnswer
        }
        this.possibleAnswers.push(possibleWrongAnswer)

      }
      console.log(this.possibleAnswers)
      
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'currency') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const currencyObject = randomCountry.currencies;
      const currencyKey = Object.keys(currencyObject)[0];
      const correctAnswer = currencyObject[currencyKey].name;
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)

      for (let index = 0; index < 3; index++) {
        var possibleWrongAnswer: answer = { answer: '', correct: false };

        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        const randomCountryForWrongAnswer = this.countryList[randomIndex];
        
        const currencyObject = randomCountryForWrongAnswer.currencies;
        const currencyKey = Object.keys(currencyObject)[0];
        var wrongAnswer = currencyObject[currencyKey].name;
        possibleWrongAnswer.answer = wrongAnswer

        while (this.possibleAnswers.some((a: { answer: string; }) => a.answer === possibleWrongAnswer.answer)) {
          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          const randomCountryForWrongAnswer = this.countryList[randomIndex];
          
          const currencyObject = randomCountryForWrongAnswer.currencies;
          const currencyKey = Object.keys(currencyObject)[0];
          var wrongAnswer = currencyObject[currencyKey].name;
          possibleWrongAnswer.answer = wrongAnswer
        }
        this.possibleAnswers.push(possibleWrongAnswer)

      }
      console.log(this.possibleAnswers)
      
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'flag') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.flags.png
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer!)

      for (let index = 0; index < 3; index++) {
        var possibleWrongAnswer: answer = { answer: '', correct: false };

        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        const randomCountryForWrongAnswer = this.countryList[randomIndex];
        
        var wrongAnswer = randomCountryForWrongAnswer.flags.png
        possibleWrongAnswer.answer = wrongAnswer

        while (this.possibleAnswers.some((a: { answer: string; }) => a.answer === possibleWrongAnswer.answer)) {
          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          const randomCountryForWrongAnswer = this.countryList[randomIndex];
          
          wrongAnswer = randomCountryForWrongAnswer.flags.png
          possibleWrongAnswer.answer = wrongAnswer
        }
        this.possibleAnswers.push(possibleWrongAnswer)

      }
      console.log(this.possibleAnswers)
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    
  }

  checkAnswer(val : boolean, i : number) {
      console.log(val)
      let selectedOption = document.getElementById("answer_" + val + "_" + i)

      if(val == true) {
        selectedOption!.style.backgroundColor = 'lime'
        this.points++
      }
      else if(val == false) {
        selectedOption!.style.backgroundColor = 'red'
      }
      setTimeout(() => {
        if(this.time != 0) {
          this.getCountry();
        }
      }, 200);
    
  }

  shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
  }
  goBack() {
    this._router.navigateByUrl('/')
  }
  
  
}

