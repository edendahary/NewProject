import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  OldAsteroidData: any[] = [];
  filteredAsteroidData: any[] = []; // Initialize filteredAsteroidData as an empty array
  searchText: string = '';
  selectedColumn: string = 'All'; // Default to 'all' for searching in all columns
  totalAsteroid: number = 0;
  isLoading: boolean = true; 
  loadingProgress: number = 0; 

  @ViewChild('asteroidChartCanvas', { static: true }) asteroidChartCanvas!: ElementRef;


  async ngOnInit() {
    await this.getDataFromServer();
    this.loadingProgress = 100; 
    this.isLoading = false; 
  }


      // Create an empty array to hold all the asteroids


      // Loop through the dates and access the corresponding array of asteroids




  async getDataFromServer() {
    try {
      const responseNasa = await axios.get("http://localhost:8000/app/get-nasa-details");
      const nasaDetailsValues = responseNasa.data;
      const nasaAsteroidsMonthAgo = nasaDetailsValues.value.asteroidMonthBefore; // כל האסטרודים חודש אחורה 

  
      // Create an empty array to hold all the asteroids
      const allAsteroids: any[] = [];
      const dates = Object.keys(nasaDetailsValues.value.asteroids);


      // Loop through the dates and access the corresponding array of asteroids
      for (const date of dates) {
        const asteroids: any[] = nasaDetailsValues.value.asteroids[date]; 
        // console.log('Date:', date); // The date for the group of asteroids
        // console.log('Asteroids:', asteroids); // The array of asteroids for that date

        // Add the year information to each asteroid object
        const asteroidsWithYear = asteroids.map((asteroid: any) => ({ // Specify the type for asteroid
          ...asteroid,
          year: date
        }));

        // Concatenate the asteroids for the current date to the allAsteroids array
        allAsteroids.push(...asteroidsWithYear);
        this.totalAsteroid = allAsteroids.length;
      }

      this.asteroidData = allAsteroids;
      this.OldAsteroidData = nasaAsteroidsMonthAgo;
      // console.log(this.OldAsteroidData);

      // Call the function to render the chart after fetching the data
      this.renderAsteroidsChart(this.OldAsteroidData);

    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    }
  }

  getTotalAsteroids(): number {
    return this.totalAsteroid;
  }
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toDateString();
  }
//    const ctx = document.getElementById('ASTEROIDS') as HTMLCanvasElement;

renderAsteroidsChart(asteroidsData: any[]) {
    // Extract relevant data from the provided asteroidData
    const formattedDates = asteroidsData.map((asteroid: any) => new Date(asteroid[3]));

    // Create a scatter plot using Chart.js
    const ctx = document.getElementById('ASTEROIDS') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Asteroids',
            data: formattedDates.map(date => ({ x: date, y: 0 })), // Y values can be set as 0 for scatter plots
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'll', // Display date in a readable format
            },
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Y Axis Label', // Customize the y-axis label
            },
          },
        },
      },
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
    this.renderAsteroidsChart(this.OldAsteroidData);
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