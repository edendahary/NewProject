import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SunInfoService } from '../sun-info.service';
import axios, { all } from 'axios';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  sunspotImageUrl!: string | null;
  sunspotImageUrl1!: string | null;
  sunspotImageUrl2!: string | null;

  constructor(private sunInfoService: SunInfoService) {} // Inject the SunInfoService
  async ngOnInit() {
    this.allData = await this.getDataFromServer();
    this.getSunspotImage();
  }
  arrSimulatorValues: any[] = [];
  allData: any ;
  filteredArrSimulatorValues: any[] = []; // Initialize filteredArrSimulatorValues as an empty array
  // Inside DashboardComponent class
  searchText: string = '';
  selectedColumn: string = 'All'; // Default to 'all' for searching in all columns


  

  async ngAfterViewInit() {
    // this.RenderChart('bar', 'EVENTS');
    // this.RenderChart('scatter', 'ASTEROIDS');
    this.filteredArrSimulatorValues = this.arrSimulatorValues;

    
    
    // Fetch data from the server and wait for the response
    const data = await this.getDataFromServer();
    if (data) {
      // Assuming you have extracted the relevant data from the getDataFromServer() response
      const sunData = data.sunData;
      const sunLabels = ['1 hour ago', '1.5 hours ago', '1 hour ago', '0.5 hours ago', '30 mins ago', 'Current'];
      // this.RenderChartSun(sunData, sunLabels);

      const nasaData = data.nasaData;
      const nasaLabels = ['0-4 hours', '4-8 hours', '8-12 hours', '12-16 hours', '16-20 hours', '20-24 hours'];
      // this.RenderChartNEO(nasaData, nasaLabels);
    }
  }

  async getSunspotImage() {
    try {
      // Fetch the sunspot image URL from the service
      // const response = await this.sunInfoService.getSunspotImage().toPromise();    
      console.log(this.allData) 
      const response = this.allData.sunData.value.images;
      this.sunspotImageUrl = response[0];
      this.sunspotImageUrl1 = response[1];
      this.sunspotImageUrl2 = response[2];
    } catch (error) {
      console.error('Error fetching sunspot image:', error);
      this.sunspotImageUrl = null;
    }
  }

  

  async getDataFromServer() {
    try {
      const responseNasa = await axios.get("http://localhost:8000/app/get-nasa-details");
      const nasaDetailsValues = responseNasa.data;
      // console.log(nasaDetailsValues.value);

      const responseSun = await axios.get("http://localhost:8000/app/get-sun-details");
      const sunDetailsValues = responseSun.data;
      // console.log(sunDetailsValues);

      let arrSimulatorValues = [];
      const responseSimulator = await axios.get("http://localhost:8000/app/getsimulator");
      const simulatorDetailsValues = responseSimulator.data.value;
      if(simulatorDetailsValues && simulatorDetailsValues.hits && simulatorDetailsValues.hits.hits){
        for (const item of simulatorDetailsValues.hits.hits) {
          arrSimulatorValues.push(item._source);
        }
      }
      this.arrSimulatorValues = arrSimulatorValues;
      this.filteredArrSimulatorValues = arrSimulatorValues;
      console.log(arrSimulatorValues);
      // Return the extracted data as an object
      return {
        nasaData: nasaDetailsValues.value,
        sunData: sunDetailsValues,
      };
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null; // Return null in case of an error
    }
  }
  

  


  

  RenderChartSun(sunData: number[], sunLabels: string[]) {
    // Replace this example data with your actual data for Sun radiation (Last 2 hours)
    // const sunData = [0.5, 0.8, 1.2, 0.9, 1.5, 1.7]; // Example data for radiation levels
    // const sunLabels = ['1 hour ago', '1.5 hours ago', '1 hour ago', '0.5 hours ago', '30 mins ago', 'Current']; // Example labels for time intervals
  
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

  RenderChartNEO(neoData: number[], neoLabels: string[]) {
    // Replace this example data with your actual data for NEOs in the last 24 hours
    // const neoData = [3, 2, 6, 1, 4, 5]; // Example data for NEO occurrences
    // const neoLabels = ['0-4 hours', '4-8 hours', '8-12 hours', '12-16 hours', '16-20 hours', '20-24 hours']; // Example labels for time intervals
  
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

  onSearch() {
    // Filter the arrSimulatorValues based on the search text and selected column
    const searchTerm = this.searchText.toLowerCase();
    if (this.selectedColumn === 'All') {
      this.filteredArrSimulatorValues = this.arrSimulatorValues.filter(item =>
        this.doesItemMatchSearch(item, searchTerm)
      );
    } else {
      this.filteredArrSimulatorValues = this.arrSimulatorValues.filter(item =>
        this.doesItemMatchSearch(item, searchTerm, this.selectedColumn)
      );
    }
  }
  
  doesItemMatchSearch(item: any, searchTerm: string, column?: string): boolean | undefined {
    // Check if the item matches the search term based on the selected column
    if (column) {
      switch (column) {
        case 'Name':
          return item.Title_HD.toLowerCase().includes(searchTerm);
        case 'Date':
          return item.date.toLowerCase().includes(searchTerm);
        case 'Event':
          return item.event.toLowerCase().includes(searchTerm);
        case 'Telescope':
          return item.telescope.toLowerCase().includes(searchTerm);
        case 'RA':
          return item.RA.toLowerCase().includes(searchTerm);
        case 'DEC':
          return item.DEC.toLowerCase().includes(searchTerm);
        case 'Priority':
          return item.priority.toLowerCase().includes(searchTerm);
        default:
          return undefined; // Return undefined when the column is not recognized
      }
    } else {
      // If no column is selected, search in all columns
      return (
        item.Title_HD.toLowerCase().includes(searchTerm) ||
        item.date.toLowerCase().includes(searchTerm) ||
        item.event.toString().includes(searchTerm) ||
        item.telescope.toLowerCase().includes(searchTerm) ||
        item.RA.toLowerCase().includes(searchTerm) ||
        item.DEC.toLowerCase().includes(searchTerm) ||
        item.priority.toString().includes(searchTerm)
      );
    }
  }
  
  }