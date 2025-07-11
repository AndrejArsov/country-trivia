import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'app-404',
  standalone: true,
  imports: [],
  templateUrl: './404.html',
})
export class FourOFourComponent {
    private _router = inject(Router)
    ngOnInit() {
        this._router.navigateByUrl('/')
    }
}