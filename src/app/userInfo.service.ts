import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: "root"
})

export class UserInfoService {
  constructor() { }

  name = new BehaviorSubject('-');

  setName(newName: string) {
    console.log("service fcking works")
    this.name.next(newName);
  }

  
}