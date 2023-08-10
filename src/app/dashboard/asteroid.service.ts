import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chart, registerables } from 'node_modules/chart.js'
Chart.register(...registerables);


@Injectable()
export class AsteroidService {
  private apiUrl = 'http://localhost:4200/asteroids'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  getAsteroidData(): Observable<number[]> {
    // Make an HTTP GET request to your API to fetch the asteroid data
    return this.http.get<number[]>(this.apiUrl);
  }
}
