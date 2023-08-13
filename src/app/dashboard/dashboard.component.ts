import { Component, AfterViewInit, OnInit ,ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  startDate: string | null = null; // Stores the start date for the date range
  endDate: string | null = null;   // Stores the end date for the date range
  totalEvents: number = 0;
  @ViewChild('eventDistributionChart') eventDistributionChartRef!: ElementRef;

 

  constructor() {} 
  async ngOnInit() {
    this.allData = await this.getDataFromServer();
    this.generateEventDistributionChart(this.allData.simulatorData);
  }
  arrSimulatorValues: any[] = [];
  allData: any ;
  filteredArrSimulatorValues: any[] = []; // Initialize filteredArrSimulatorValues as an empty array
  // Inside DashboardComponent class
  searchText: string = '';
  selectedColumn: string = 'All'; // Default to 'all' for searching in all columns

  async ngAfterViewInit() {
    this.filteredArrSimulatorValues = this.arrSimulatorValues;
    // Fetch data from the server and wait for the response
    const data = await this.getDataFromServer();
    this.generateEventDistributionChart(this.arrSimulatorValues);
  }

  async getDataFromServer() {
    try {
      const responseNasa = await axios.get("http://localhost:8000/app/get-nasa-details");
      const nasaDetailsValues = responseNasa.data;
      // console.log(nasaDetailsValues.value);

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
      this.arrSimulatorValues = arrSimulatorValues;
      this.filteredArrSimulatorValues = arrSimulatorValues;
      this.totalEvents = arrSimulatorValues.length;
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
  getTotalEvents(): number {
    return this.totalEvents;
  }
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toDateString();
  }

  generateEventDistributionChart(data: any[]) {
    const eventLabels = [];
    const eventCounts = [];
  
    // Count occurrences of each event
    const eventCountMap = new Map();
    for (const item of data) {
      const event = item.event;
      if (eventCountMap.has(event)) {
        eventCountMap.set(event, eventCountMap.get(event) + 1);
      } else {
        eventCountMap.set(event, 1);
      }
    }
  
    // Extract event labels and counts
    for (const [event, count] of eventCountMap) {
      eventLabels.push(event);
      eventCounts.push(count);
    }

    const colors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      // Add more colors as needed
    ];
  
    const ctx = this.eventDistributionChartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: eventLabels,
        datasets: [{
          label: 'Event Distribution',
          data: eventCounts,
          borderColor: 'rgba(54, 162, 235, 0.6)',
          fill: false,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  onStartDateChange(event: any) {
    // Check if the event's target is null before accessing its value
    if (event.target) {
      this.startDate = event.target.value;
      this.filterDataByDateRange();
    }
  }
  
  onEndDateChange(event: any) {
    // Check if the event's target is null before accessing its value
    if (event.target) {
      this.endDate = event.target.value;
      this.filterDataByDateRange();
    }
  }

  // Inside your DashboardComponent class
onSearchByDateRange() {
  if (this.startDate && this.endDate) {
    this.filterDataByDateRange();
  }
}

clearDateRange() {
  this.startDate = null;
  this.endDate = null;
  this.filteredArrSimulatorValues = this.arrSimulatorValues;
}

formatDate(date: string): string {
  const parsedDate = new Date(date);
  return parsedDate.toLocaleDateString();
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
    // this.filterDataByDateRange();
  }

  filterDataByDateRange() {
    // Filter the data based on the selected date range
    if (this.startDate && this.endDate) {
      this.filteredArrSimulatorValues = this.arrSimulatorValues.filter(item =>
        this.isItemInDateRange(item, this.startDate, this.endDate)
      );
    } else {
      // No date range selected, show all data
      this.filteredArrSimulatorValues = this.arrSimulatorValues;
    }
  }

  isItemInDateRange(item: any, startDate: string | null, endDate: string | null): boolean {
    // Convert start and end dates to Date objects
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Convert item date to a Date object
    const itemDate = new Date(item.date);

    // Check if the item's date is within the selected date range
    return (start === null || itemDate >= start) && (end === null || itemDate <= end);
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
        // case 'Priority':
        //   return item.priority.trim().toLowerCase() === searchTerm.trim();
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
        item.DEC.toLowerCase().includes(searchTerm) // ||
        // item.priority.trim().toLowerCase().includes(searchTerm)
      );
    }
  }
}
