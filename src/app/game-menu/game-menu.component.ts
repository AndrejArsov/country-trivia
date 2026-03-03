import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders,  } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { ShortNumberPipe } from '../shortNumber.pipe';
import { answer } from '../models';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { CountryCodeService } from '../country-code.service';
import { MatDialog } from '@angular/material/dialog';
import { HighScorePopupComponent } from '../high-score-popup/high-score-popup.component';

@Component({ 
  selector: 'app-game-menu',
  standalone: true,
  imports: [HttpClientModule, CommonModule, ShortNumberPipe],
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss', '../../bootstrap.css'],
})
export class GameMenuComponent {
  private lastClickTime = 0;
  private MIN_CLICK_INTERVAL = 500;

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

  difficulty: string | null = null;
  mode: string | null = null;
  region: string | null = null;
  type: string | null = null;
  
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef)
  private _router = inject(Router);
  private _user = inject(UserService)
  private countryCodeService = inject(CountryCodeService)

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {}

  countryList = <any>[]
  countryName!: string;
  numOfCountries!: number
  correctAnswer! : string

  questions = [
    {
      type: "capital",
      question: "What is the capital of",
      difficulty: "hard",
      questionCategory: "capital"
    },
    {
      type: "populationDensity", 
      question: "Which has higher population density",
      difficulty: "hard",
      questionCategory: "population"
    },
    {
      type: "region",
      question: "In what region is",
      difficulty: "easy",
      questionCategory: "region"
    },
    {
      type: "currency",
      question: "What currency is used in",
      difficulty: "both",
      questionCategory: "currency"
    },
    {
      type: "flag",
      question: "What is the flag of",
      difficulty: "both",
      questionCategory: "flag"
    },
    {
      type: "population",
      question: "What is the population of",
      difficulty: "hard",
      questionCategory: "population"
    },
    {
      type: "border",
      question: "How many countries border",
      difficulty: "hard",
      questionCategory: "borders"
    },
    {
      type: "areaComparison",
      question: "Which country is closest in size to",
      difficulty: "hard",
      questionCategory: "area"
    },
    {
      type: "borderingCountry",
      question: "Which of these countries border",
      difficulty: "easy",
      questionCategory: "borders"
    },
    {
      type: "drivingSide",
      question: "What is the driving side in",
      difficulty: "easy",
      questionCategory: "none"
    },
    {
      type: "sameRegion",
      question: "Which of these is in the same region as",
      difficulty: "easy",
      questionCategory: "region"
    },
    {
      type: "landlocked",
      question: "Is this country landlocked",
      difficulty: "easy",
      questionCategory: "borders"
    },
    {
      type: "largerPopulation",
      question: "Which has larger population",
      difficulty: "both",
      questionCategory: "population"
    },
    {
      type: "largerArea",
      question: "Which has larger area",
      difficulty: "both",
      questionCategory: "area"
    },
    {
      type: "moreBorders", 
      question: "Which has more bordering countries",
      difficulty: "both",
      questionCategory: "borders"
    },
    {
      type: "gdp", 
      question: "Which has higher GDP",
      difficulty: "hard",
      questionCategory: "none"
    }
  ]

  question!: string;
  possibleAnswers = <any>[]

  randomCategory: any

  isGameActive = true
  highScore: any;
  name!: string;

  responsiveHeight = "80"
  
  historyHolder: any;

  prevVal!: boolean
  prevI!: number
  prevChosenAnswer!: string | number
  prevQuestion!: string;
  prevCountryName!: string;
  prevCorrectAnswer!: string;

  historyQuestionIndex = 0

  loading!: boolean;
  answerLocked!: boolean;

  isChoiceQuestion!: boolean;

  isFirstTime!: boolean;

  selectedType: 'population' | 'area' | 'region' | 'borders' | 'capital' | 'flag' | 'currency' | 'none' | null = null;

  async ngOnInit() {
    this.isFirstTime = true
    this.loading = true

     this.route.queryParams.subscribe((params) => {
      this.difficulty = params['difficulty'];
      this.mode = params['mode'];
      this.region = params['region'];
      this.type = params['type'];
    });
    
    this.getToken()
    
  } 

  async updateTime() {
    this.time --
    if (this.time > 40) {
      this.dynamicBg = 'linear-gradient(135deg, #32cd32 0%, #00fa9a 100%)';
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
    if (this.time == 0) {
      clearInterval(this.interval);
      this.score = this.points * this.percentage * 10
      this.isGameActive = false
      this.responsiveHeight = "75"
      this.countryName = "GAME OVER"
      this.question = ""
      
      if(this.mode != 'custom') {
        this._user.incrementGamesPlayed()
        if(this.score > this.highScore) {
          this.dialog.open(HighScorePopupComponent, {
            width: '400px',
            disableClose: true,
            data: { score: this.score, name: this.name },
          });
          if(this.difficulty == 'easy') {
            await this._user.deleteEasyScoresByName(this.name)
            await this._user.updateEasyHighScore(this.score)
            this._user.saveEasyScore(this.name, this.score);
          }
          else if(this.difficulty == 'hard') {
            await this._user.deleteHardScoresByName(this.name)
            await this._user.updateHardHighScore(this.score)
            this._user.saveHardScore(this.name, this.score);
          }
          
        }
      }
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
    if(!this.isFirstTime) {
      const now = performance.now();
      if (now - this.lastClickTime < this.MIN_CLICK_INTERVAL) {
        console.warn('Too fast click ignored');
        return;
      }
      this.lastClickTime = now;
      this.isFirstTime = false
    }
    if(this.difficulty == 'easy') {
      this.highScore = await this._user.getEasyHighScore()
    }
    else if(this.difficulty == 'hard') {
      this.highScore = await this._user.getHardHighScore()
    }

    this.name = await this._user.getUserName()
    
    this.interval = setInterval(() => {
      this.updateTime()
    }, 1000)

    this.loading = false

    this.getCountry()
    this.percentage = 0
    this.points = 0
    this.optionsAttempted = 0
    this.isGameActive = true
    this.responsiveHeight = "80"
    this.time = 60
    this.dynamicBg = 'rgba(26, 255, 0, 0.55)';
    this.historyQuestionIndex = 0
    if(this.historyHolder) {
      this.historyHolder.innerHTML = ''
    }
    
  }
  
  getToken() {
    var apiCallingPoint

    if(this.region == undefined || this.region == 'world') {
      apiCallingPoint = 'independent?status=true'
    }
    else {
      apiCallingPoint = 'region/' + this.region
    }

    const headers = new HttpHeaders({
      accept: '*/*',
      Platform: 'Web',
      'Content-Type': 'application/json',
    });
    const subscription = this.httpClient.get<any[]>("https://restcountries.com/v4/" + apiCallingPoint,  { headers : headers }).subscribe({
      next: (result: any[]) => {
        this.countryList = result.filter((country) => country.independent === true)
        this.numOfCountries = this.countryList.length
        console.log(this.countryList)
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

    var randomCategoryId = Math.floor(Math.random() * this.questions.length);
    if(this.type == 'mixed' || this.type == null) {
      while (this.questions[randomCategoryId].difficulty != this.difficulty && this.questions[randomCategoryId].difficulty != 'both') {
        randomCategoryId = Math.floor(Math.random() * this.questions.length);
      }
    }
    else {
      while (this.questions[randomCategoryId].questionCategory != this.type) {
        randomCategoryId = Math.floor(Math.random() * this.questions.length);
      }
    }

    this.randomCategory = this.questions[randomCategoryId].type
    this.question = this.questions[randomCategoryId].question

    if(this.randomCategory == 'borderingCountry') {
      var randomCountry = this.countryList[randomIndex];
      var randomCountryBorders = randomCountry.borders || [];

      while (randomCountryBorders.length === 0 || randomCountryBorders.length === undefined) {
        randomIndex = Math.floor(Math.random() * this.numOfCountries)
        randomCountry = this.countryList[randomIndex];
        randomCountryBorders = randomCountry.borders || [];
      }
    }
    else {
      var randomCountry = this.countryList[randomIndex];
    }

    var randomCountry = this.countryList[randomIndex];
    this.countryName = randomCountry.name.common

    if(this.randomCategory == 'moreBorders' || this.randomCategory == 'largerArea' || this.randomCategory == 'largerPopulation' || this.randomCategory == 'populationDensity' || this.randomCategory == 'gdp') {
      this.isChoiceQuestion = true
    }
    else {
      this.isChoiceQuestion = false
    }

    this.possibleAnswers = []

    if(this.randomCategory == 'areaComparison') {
      const randomCountryName = randomCountry.name.common;
      const primaryCountryArea = randomCountry.area;

      const randomCountries: any[] = [];
      for (let index = 0; index < 4; index++) {
        let randomIndex = Math.floor(Math.random() * this.numOfCountries);
        let randomCountry = this.countryList[randomIndex];

        while (randomCountries.some((c) => c.area === randomCountry.area || c.name === randomCountryName.name)) {
          randomIndex = Math.floor(Math.random() * this.numOfCountries);
          randomCountry = this.countryList[randomIndex];
        }

        randomCountries.push(randomCountry);
      }

      const wrongAnswers: answer[] = [];
      for (let i = 0; i < randomCountries.length; i++) {
        const wrongAnswer: answer = {
          answer: String(randomCountries[i].name.common),
          calculation: randomCountries[i].area,
          correct: false,
        };
        wrongAnswers.push(wrongAnswer);
      }

      let closestAnswer = wrongAnswers[0];
      let smallestDifference = Math.abs(
        
        Number(wrongAnswers[0].calculation) - primaryCountryArea
      );

      for (let i = 1; i < wrongAnswers.length; i++) {
        const difference = Math.abs(Number(wrongAnswers[i].calculation) - primaryCountryArea);
        if (difference < smallestDifference) {
          smallestDifference = difference;
          closestAnswer = wrongAnswers[i];
        }
      }

      closestAnswer.correct = true;
      this.correctAnswer = String(closestAnswer.answer);

      this.possibleAnswers.push(...wrongAnswers);

      this.possibleAnswers = this.shuffle(this.possibleAnswers);
      
    }
    else if(this.randomCategory == 'capital') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.capital[0]
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)
      this.correctAnswer = correctAnswer

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
      
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'population') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.population
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)
      this.correctAnswer = correctAnswer

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
      this.correctAnswer = correctAnswer

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
      
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'region') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.region
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)
      this.correctAnswer = correctAnswer

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
      
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'currency') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const currencyObject = randomCountry.currencies;
      const currencyKey = Object.keys(currencyObject)[0];
      const correctAnswer = currencyObject[currencyKey].name;
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer)
      this.correctAnswer = correctAnswer

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
      
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'flag') {
      let possibleAnswer: answer = { answer: '', correct: true };

      const correctAnswer = randomCountry.flag.png
      possibleAnswer.answer = correctAnswer
      this.possibleAnswers.push(possibleAnswer!)
      this.correctAnswer = correctAnswer

      for (let index = 0; index < 3; index++) {
        var possibleWrongAnswer: answer = { answer: '', correct: false };

        var randomIndex = Math.floor(Math.random() * this.numOfCountries)
        const randomCountryForWrongAnswer = this.countryList[randomIndex];
        
        var wrongAnswer = randomCountryForWrongAnswer.flag.png
        possibleWrongAnswer.answer = wrongAnswer

        while (this.possibleAnswers.some((a: { answer: string; }) => a.answer === possibleWrongAnswer.answer)) {
          var randomIndex = Math.floor(Math.random() * this.numOfCountries)
          const randomCountryForWrongAnswer = this.countryList[randomIndex];
          
          wrongAnswer = randomCountryForWrongAnswer.flag.png
          possibleWrongAnswer.answer = wrongAnswer
        }
        this.possibleAnswers.push(possibleWrongAnswer)

      }
      this.possibleAnswers = this.shuffle(this.possibleAnswers)
    }
    else if(this.randomCategory == 'drivingSide') {

      const drivingSide = randomCountry.car.side

      if(drivingSide == 'right') {
        this.correctAnswer = 'right'
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: 'left', correct: false })
      }
      else {
        this.correctAnswer = 'left'
        this.possibleAnswers.push({ answer: 'right', correct: false })
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
      }

    }
    else if(this.randomCategory == 'landlocked') {

      const landlocked = randomCountry.landlocked
      if(landlocked == true) {
        this.correctAnswer = 'Yes'
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: 'No', correct: false })
      }
      else {
        this.correctAnswer = 'No'
        this.possibleAnswers.push({ answer: 'Yes', correct: false })
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
      }

    }
    else if(this.randomCategory == 'sameRegion') {
      const primaryCountryRegion = randomCountry.region;

      const differentRegionCountries: any[] = [];
      for (let index = 0; index < 3; index++) {
        let randomIndex = Math.floor(Math.random() * this.numOfCountries);
        let randomCountry = this.countryList[randomIndex];

        while (
          differentRegionCountries.some((c) => c.name === randomCountry.name) ||
          randomCountry.region === primaryCountryRegion
        ) {
          randomIndex = Math.floor(Math.random() * this.numOfCountries);
          randomCountry = this.countryList[randomIndex];
        }

        differentRegionCountries.push(randomCountry);
      }

      let sameRegionCountry = this.countryList[0];
      let foundSameRegion = false;

      while (!foundSameRegion) {
        let randomIndex = Math.floor(Math.random() * this.numOfCountries);
        let randomFoundCountry = this.countryList[randomIndex];

        if (
          randomFoundCountry.region === primaryCountryRegion &&
          randomFoundCountry.name !== randomCountry.name
        ) {
          sameRegionCountry = randomFoundCountry;
          foundSameRegion = true;
        }
      }

      const wrongAnswers: answer[] = [];
      for (let i = 0; i < differentRegionCountries.length; i++) {
        const wrongAnswer: answer = {
          answer: differentRegionCountries[i].name.common,
          correct: false,
        };
        wrongAnswers.push(wrongAnswer);
      }

      const correctAnswer: answer = {
        answer: sameRegionCountry.name.common,
        correct: true,
      };
      this.correctAnswer = correctAnswer.answer;

      this.possibleAnswers.push(correctAnswer, ...wrongAnswers);

      this.possibleAnswers = this.shuffle(this.possibleAnswers);

    }
    else if(this.randomCategory == 'borderingCountry') {
      const primaryCountryName = randomCountry.name;
      const primaryCountryBorders = randomCountry.borders || [];

      const correctCountryName =
        primaryCountryBorders[
          Math.floor(Math.random() * primaryCountryBorders.length)
        ];

      const wrongCountries: any[] = [];
      for (let index = 0; index < 3; index++) {
        let randomIndex = Math.floor(Math.random() * this.numOfCountries);
        let randomCountry = this.countryList[randomIndex];

        while (
          wrongCountries.some((c) => c.name === randomCountry.name) ||
          primaryCountryBorders.includes(randomCountry.cca3) ||
          randomCountry.name === primaryCountryName
        ) {
          randomIndex = Math.floor(Math.random() * this.numOfCountries);
          randomCountry = this.countryList[randomIndex];
        }

        wrongCountries.push(randomCountry);
      }

      const wrongAnswers: answer[] = [];
      for (let i = 0; i < wrongCountries.length; i++) {
        const wrongAnswer: answer = {
          answer: wrongCountries[i].name.common,
          correct: false,
        };
        wrongAnswers.push(wrongAnswer);
      }

      
      this.countryCodeService
      .getCountryNameByCode(correctCountryName)
      .subscribe((correctCountryName: string) => {
        const correctAnswer: answer = {
          answer: correctCountryName,
          correct: true,
        };
        this.correctAnswer = correctAnswer.answer;
      this.possibleAnswers.push(correctAnswer, ...wrongAnswers);

      this.possibleAnswers = this.shuffle(this.possibleAnswers);

    })
    }
    else if(this.randomCategory == 'largerPopulation') {

      let randomIndex = Math.floor(Math.random() * this.numOfCountries);
      let anotherRandomCountry = this.countryList[randomIndex];

      if(randomCountry.population > anotherRandomCountry.population) {
        this.correctAnswer = randomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: anotherRandomCountry.name.common, correct: false })
      }
      else {
        this.correctAnswer = anotherRandomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: randomCountry.name.common, correct: false })
      }

    }
    else if(this.randomCategory == 'largerArea') {

      let randomIndex = Math.floor(Math.random() * this.numOfCountries);
      let anotherRandomCountry = this.countryList[randomIndex];

      if(randomCountry.area > anotherRandomCountry.area) {
        this.correctAnswer = randomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: anotherRandomCountry.name.common, correct: false })
      }
      else {
        this.correctAnswer = anotherRandomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: randomCountry.name.common, correct: false })
      }

    }
    else if(this.randomCategory == 'moreBorders') {

      let randomIndex = Math.floor(Math.random() * this.numOfCountries);
      let anotherRandomCountry = this.countryList[randomIndex];

      const randomCountryBorders = randomCountry.borders || [];
      var anotherRandomCountryBorders = anotherRandomCountry.borders || [];

      while(randomCountryBorders.length == anotherRandomCountryBorders.length) {
        let randomIndex = Math.floor(Math.random() * this.numOfCountries);
        anotherRandomCountry = this.countryList[randomIndex];
        anotherRandomCountryBorders = anotherRandomCountry.borders || [];
      }

      if(randomCountryBorders.length > anotherRandomCountryBorders.length) {
        this.correctAnswer = randomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: anotherRandomCountry.name.common, correct: false })
      }
      else {
        this.correctAnswer = anotherRandomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: randomCountry.name.common, correct: false })
      }

    }
    else if(this.randomCategory == 'populationDensity') {

      let randomIndex = Math.floor(Math.random() * this.numOfCountries);
      let anotherRandomCountry = this.countryList[randomIndex];

      const randomCountryDensity = randomCountry.density
      const anotherRandomCountryDensity = anotherRandomCountry.density

      if(randomCountryDensity > anotherRandomCountryDensity) {
        this.correctAnswer = randomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: anotherRandomCountry.name.common, correct: false })
      }
      else {
        this.correctAnswer = anotherRandomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: randomCountry.name.common, correct: false })
      }
    }
    else if(this.randomCategory == 'gdp') {

      let randomIndex = Math.floor(Math.random() * this.numOfCountries);
      let anotherRandomCountry = this.countryList[randomIndex];
      
      var randomCountryGDP = randomCountry.gdp?.total || null;
      var anotherRandomCountryDGP = anotherRandomCountry.gdp?.total || null

      while(randomCountryGDP == null || anotherRandomCountryDGP == null) {
        randomIndex = Math.floor(Math.random() * this.numOfCountries);
        randomCountry = this.countryList[randomIndex];
        randomCountryGDP = randomCountry.gdp?.total || null

        randomIndex = Math.floor(Math.random() * this.numOfCountries);
        anotherRandomCountry = this.countryList[randomIndex];
        anotherRandomCountryDGP = anotherRandomCountry.gdp?.total || null
      }

      
      if(randomCountryGDP > anotherRandomCountryDGP) {
        this.correctAnswer = randomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: anotherRandomCountry.name.common, correct: false })
      }
      else {
        this.correctAnswer = anotherRandomCountry.name.common
        this.possibleAnswers.push({ answer: this.correctAnswer, correct: true })
        this.possibleAnswers.push({ answer: randomCountry.name.common, correct: false })
      }
    }

    const randomDelay = 300 + Math.random() * 300;
    setTimeout(() => {
      this.answerLocked = false;
          
      }, randomDelay);
    
  }


  checkAnswer(val : boolean, i : number, chosenAnswer : string | number) {
    const now = performance.now();
    if (now - this.lastClickTime < this.MIN_CLICK_INTERVAL) {
      console.warn('Too fast click ignored');
      return;
    }
    this.lastClickTime = now;
  
    if (this.answerLocked) return;
    this.answerLocked = true;
    
    this.historyHolder = document.getElementById("historyDiv")
    
      if((this.prevVal == val) && (this.prevI == i) && (this.prevChosenAnswer == chosenAnswer) && (this.prevQuestion == this.question) && (this.prevCountryName == this.countryName) && (this.prevCorrectAnswer == this.correctAnswer)) {
        

      }
      else {
        this.prevVal = val
        this.prevI = i
        this.prevChosenAnswer = chosenAnswer
        this.prevQuestion = this.question
        this.prevCountryName = this.countryName
        this.prevCorrectAnswer = this.correctAnswer

        let selectedOption = document.getElementById("answer_" + val + "_" + i)

        if(val == true) {
          selectedOption!.style.backgroundColor = 'lime'
          this.points++
        }
        else if(val == false) {
          selectedOption!.style.backgroundColor = 'red'
        }
        this.addToHistory(val, chosenAnswer, this.question, this.countryName, this.correctAnswer)
        setTimeout(() => {
          if(this.time != 0) {
            this.getCountry();
          }
        }, 200);
      }
      
    
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

  addToHistory(wasCorrect: boolean,  chosenAnswer: string | number, question: string, name: string, correctAnswer : string | number) {
    
    this.historyQuestionIndex++
    const div = document.createElement('div');
    const formattedChosenAnswer = typeof chosenAnswer === 'number' ? this.transformNumber(chosenAnswer) : chosenAnswer;
    const formattedCorrectAnswer = typeof correctAnswer === 'number' ? this.transformNumber(correctAnswer) : correctAnswer;

    div.classList.add('historyOption', 'col-12', wasCorrect ? 'bg-correct' : 'bg-wrong', 'flex-xl-row', 'flex-lg-row', 'flex-md-column', 'flex-sm-column', 'flex-column', 'd-flex', 'fs-xs-5' , 'fs-sm-1', 'fs-md-1', 'fs-lg-2', 'fs-xl-custom', 'fs-xxl-custom'
    );
    if(wasCorrect == true) {
      if(question == this.questions[4].question) {
        div.innerHTML += `

              <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-md-start align-items-sm-start align-items-lg-center align-items-xl-center align-items-start pe-1">
                    <div class="col-1 pe-2 d-flex justify-content-center align-items-center">
                        #${this.historyQuestionIndex}
                    </div>
                    <div class="col-11 ps-2 d-flex justify-content-start align-items-center">
                        ${question} ${name}
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-start ps-1">
                    <div class="col-12 d-flex flex-column justify-content-center align-items-start p-1">
                        <p class="p-0 m-0">Chosen: </p> <img class="historyFlag" loading="lazy" src="${chosenAnswer}" alt="">
                    </div>
                </div>
        `
      }
      else if (question == this.questions[1].question || question == this.questions[12].question || question == this.questions[13].question || question == this.questions[14].question) {
        
        div.innerHTML += `
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-md-start align-items-sm-start align-items-lg-center align-items-xl-center align-items-start pe-1">
                    <div class="col-1 pe-2 d-flex justify-content-center align-items-center">
                        #${this.historyQuestionIndex}
                    </div>
                    <div class="col-11 ps-2 d-flex justify-content-start align-items-center">
                        ${question}
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-start ps-1">
                    <div class="col-12 d-flex flex-column justify-content-center align-items-start p-1">
                        <p class="p-0 m-0">Chosen: </p> ${formattedChosenAnswer}
                    </div>
                </div>
        `
      }
      else {
        div.innerHTML += `
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-md-start align-items-sm-start align-items-lg-center align-items-xl-center align-items-start pe-1">
                    <div class="col-1 pe-2 d-flex justify-content-center align-items-center">
                        #${this.historyQuestionIndex}
                    </div>
                    <div class="col-11 ps-2 d-flex justify-content-start align-items-center">
                        ${question} ${name}
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-start ps-1">
                    <div class="col-12 d-flex flex-column justify-content-center align-items-start p-1">
                        <p class="p-0 m-0">Chosen: </p> ${formattedChosenAnswer}
                    </div>
                </div>
        `
      }
    }
    else {
      if(question == this.questions[4].question) {
        div.innerHTML += `
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-md-start align-items-sm-start align-items-lg-center align-items-xl-center align-items-start pe-1">
                    <div class="col-1 pe-2 d-flex justify-content-center align-items-center">
                        #${this.historyQuestionIndex}
                    </div>
                    <div class="col-11 ps-2 d-flex justify-content-start align-items-center">
                        ${question} ${name}
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-start ps-1">
                    <div class="col-6 d-flex flex-column justify-content-center align-items-start p-1">
                        <p class="p-0 m-0">Chosen: </p> <img class="historyFlag" loading="lazy" src="${chosenAnswer}" alt="">
                    </div>
                    <div class="col-6 d-flex flex-column justify-content-center align-items-start p-1">
                        <p class="p-0 m-0">Correct: </p> <img class="historyFlag" loading="lazy" src="${correctAnswer}" alt="">
                    </div>
                </div>
        `
      }
      else if (question == this.questions[1].question || question == this.questions[12].question || question == this.questions[13].question || question == this.questions[14].question) {
        
        div.innerHTML += `
            <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-md-start align-items-sm-start align-items-lg-center align-items-xl-center align-items-start pe-1">
                    <div class="col-1 pe-2 d-flex justify-content-center align-items-center">
                        #${this.historyQuestionIndex}
                    </div>
                    <div class="col-11 ps-2 d-flex justify-content-start align-items-center">
                        ${question}
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-start ps-1">
                    <div class="col-6 d-flex flex-column justify-content-center align-items-start p-1">
                        <p class="p-0 m-0">Chosen: </p> ${formattedChosenAnswer}
                    </div>
                    <div class="col-6 d-flex flex-column justify-content-center align-items-start p-1">
                            <p class="p-0 m-0">Correct: </p> ${formattedCorrectAnswer}
                    </div>
            </div>
            
        `
      }
      else {
        div.innerHTML += `
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-md-start align-items-sm-start align-items-lg-center align-items-xl-center align-items-start pe-1">
                    <div class="col-1 pe-2 d-flex justify-content-center align-items-center">
                        #${this.historyQuestionIndex}
                    </div>
                    <div class="col-11 ps-2 d-flex justify-content-start align-items-center">
                        ${question} ${name}
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-start ps-1">
                    <div class="col-6 d-flex flex-column justify-content-center align-items-start p-1">
                        <p class="p-0 m-0">Chosen: </p> ${formattedChosenAnswer}
                    </div>
                    <div class="col-6 d-flex flex-column justify-content-center align-items-start p-1">
                        <p class="p-0 m-0">Correct: </p> ${formattedCorrectAnswer}
                    </div>
                </div>
        `
      }
    }
    this.historyHolder!.appendChild(div);
  }

  transformNumber (value: number): string {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
    return value.toString();
  }

  goToLeaderboard() {
    this._router.navigateByUrl('/leaderboard')
  }
  
}

