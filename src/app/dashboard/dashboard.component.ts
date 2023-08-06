import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.RenderChart('bar', 'EVENTS');
    this.RenderChart('scatter', 'ASTEROIDS');
    this.RenderChartSun(); // Call the function for Sun radiation chart
    this.RenderChartNEO(); // Call the function for NEO chart
    this.getDataFromServer(); // Call the function to fetch data from the server
  }

  async getDataFromServer() {
    try {
      const responseNasa = await axios.get("http://localhost:8000/app/get-nasa-details");
      const nasaDetailsValues = responseNasa.data;
      console.log(nasaDetailsValues.value);

      const responseSun = await axios.get("http://localhost:8000/app/get-sun-details");
      const sunDetailsValues = responseSun.data;
      console.log(sunDetailsValues);
      let arrSimulatorValues = [];
      const responseSimulator = await axios.get("http://localhost:8000/app/getsimulator");
      const simulatorDetailsValues = responseSimulator.data.value;
      if(simulatorDetailsValues && simulatorDetailsValues.hits && simulatorDetailsValues.hits.hits){
        for (const item of simulatorDetailsValues.hits.hits) {
          arrSimulatorValues.push(item._source);
        }
      }
      console.log(arrSimulatorValues);
    } catch (error: any) {
    console.error("Error fetching data:", error.message);
  }
  }

  


  

  RenderChartSun() {
    // Replace this example data with your actual data for Sun radiation (Last 2 hours)
    const sunData = [0.5, 0.8, 1.2, 0.9, 1.5, 1.7]; // Example data for radiation levels
    const sunLabels = ['1 hour ago', '1.5 hours ago', '1 hour ago', '0.5 hours ago', '30 mins ago', 'Current']; // Example labels for time intervals
  
    const sunChart = new Chart('SUN', {
      type: 'line', // Use line chart for Sun radiation data
      data: {
        labels: sunLabels,
        datasets: [{
          label: 'Sun Radiation Levels',
          data: sunData,
          borderColor: 'rgba(255, 206, 86, 1)', // Yellow color for line
          backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow color with opacity for the area under the line
          borderWidth: 1,
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Radiation Level'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time Interval'
            }
          }
        }
      }
    });
  }

  RenderChartNEO() {
    // Replace this example data with your actual data for NEOs in the last 24 hours
    const neoData = [3, 2, 6, 1, 4, 5]; // Example data for NEO occurrences
    const neoLabels = ['0-4 hours', '4-8 hours', '8-12 hours', '12-16 hours', '16-20 hours', '20-24 hours']; // Example labels for time intervals
  
    const neoChart = new Chart('NEO', {
      type: 'radar', // Use radar chart for NEO data
      data: {
        labels: neoLabels,
        datasets: [{
          label: 'NEO Occurrences',
          data: neoData,
          borderColor: 'rgba(153, 102, 255, 1)', // Purple color for the radar line
          backgroundColor: 'rgba(153, 102, 255, 0.2)', // Purple color with opacity for the radar area
          borderWidth: 1,
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            angleLines: {
              display: true
            },
            pointLabels: {
              display: true
            }
          }
        }
      }
    });
  }
  
  

  RenderChart(type: any, id: any) {
    const myChart = new Chart(id, {
      type: type,
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)', // Red
            'rgba(54, 162, 235, 0.2)', // Blue
            'rgba(255, 206, 86, 0.2)', // Yellow
            'rgba(75, 192, 192, 0.2)', // Green
            'rgba(153, 102, 255, 0.2)', // Purple
            'rgba(255, 159, 64, 0.2)', // Orange
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)', // Red
            'rgba(54, 162, 235, 1)', // Blue
            'rgba(255, 206, 86, 1)', // Yellow
            'rgba(75, 192, 192, 1)', // Green
            'rgba(153, 102, 255, 1)', // Purple
            'rgba(255, 159, 64, 1)', // Orange
          ],
          borderWidth: 1, 
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

  }
}