import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.css']
})
export class AnalyzeComponent implements OnInit {
  asteroidData: any[] = [];
  filteredAsteroidData: any[] = []; // Initialize filteredAsteroidData as an empty array
  searchText: string = '';
  selectedColumn: string = 'All'; // Default to 'all' for searching in all columns


  ngOnInit() {
    this.getDataFromServer();
  }

  async getDataFromServer() {
    try {
      const responseNasa = await axios.get("http://localhost:8000/app/get-nasa-details");
      const nasaDetailsValues = responseNasa.data;

      // Create an empty array to hold all the asteroids
      const allAsteroids: any[] = [];

      const dates = Object.keys(nasaDetailsValues.value);

      // Loop through the dates and access the corresponding array of asteroids
      for (const date of dates) {
        const asteroids: any[] = nasaDetailsValues.value[date]; // Specify the type for asteroids
        // console.log('Date:', date); // The date for the group of asteroids
        // console.log('Asteroids:', asteroids); // The array of asteroids for that date

        // Add the year information to each asteroid object
        const asteroidsWithYear = asteroids.map((asteroid: any) => ({ // Specify the type for asteroid
          ...asteroid,
          year: date
        }));

        // Concatenate the asteroids for the current date to the allAsteroids array
        allAsteroids.push(...asteroidsWithYear);
      }

      this.asteroidData = allAsteroids;
      // console.log(this.asteroidData);

      // Call the function to render the chart after fetching the data
      this.renderAsteroidsChart(allAsteroids);

    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    }
  }

  renderAsteroidsChart(asteroidsData: any[]) {
    const labels = asteroidsData.map((asteroid) => asteroid.name);
    const data = asteroidsData.map((asteroid) => asteroid.absolute_magnitude_h);

    const asteroidsChart = new Chart('ASTEROIDS', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Distribution of asteroids (Last month)',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Absolute Magnitude (H)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Asteroid name'
            }
          }
        }
      }
    });
  }
  onSearch() {
    // Filter the asteroidData based on the search text and selected column
    const searchTerm = this.searchText.toLowerCase();

    if (this.selectedColumn === 'All') {
      this.filteredAsteroidData = this.asteroidData.filter(item =>
        this.doesItemMatchSearch(item, searchTerm)
      );
    } else {
      this.filteredAsteroidData = this.asteroidData.filter(item =>
        this.doesItemMatchSearch(item, searchTerm, this.selectedColumn)
      );
    }

    // Call the function to re-render the chart after filtering the data
    this.renderAsteroidsChart(this.filteredAsteroidData);
  }

  doesItemMatchSearch(item: any, searchTerm: string, column?: string): boolean {
    // Check if the item matches the search term based on the selected column
    if (column) {
      switch (column) {
        case 'name':
          return item.name.toLowerCase().includes(searchTerm);
        case 'year':
          return item.year.toLowerCase().includes(searchTerm);
        case 'absolute_magnitude_h':
          return item.absolute_magnitude_h.toString().includes(searchTerm);
        // Add cases for other columns if needed
        default:
          return false; // Return false when the column is not recognized
      }
    } else {
      // If no column is selected, search in all columns
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.year.toLowerCase().includes(searchTerm) ||
        item.absolute_magnitude_h.toString().includes(searchTerm)
        // Add other columns here
      );
    }
  }
  
}
