import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SunInfoService {
  private apiUrl = 'https://theskylive.com/sun-info'; // Replace this with the actual API URL

  constructor(private http: HttpClient) { }

  getSunspotImage(): Observable<any> {
    // Replace 'sunspot-image' with the actual endpoint for the sunspot image
    const endpoint = `${this.apiUrl}/sunspot-image`;

    return this.http.get<any>(endpoint);
  }
}
