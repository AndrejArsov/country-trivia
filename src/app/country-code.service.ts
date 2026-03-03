import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountryCodeService {
  private httpClient = inject(HttpClient);

  getCountryNameByCode(code: string): Observable<string> {
    const headers = new HttpHeaders({
      accept: '*/*',
      Platform: 'Web',
      'Content-Type': 'application/json',
    });

    return this.httpClient
      .get<any[]>('https://restcountries.com/v3.1/alpha/' + code, {
        headers: headers,
      })
      .pipe(
        map((result: any[]) => {
          if (result && result.length > 0) {
            return result[0].name.common;
          }
          return code;
        }),
        catchError(() => {
          console.error(`Failed to fetch country for code: ${code}`);
          return of(code);
        })
      );
  }
}
