import { Component } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-sun-details',
  templateUrl: './sun-details.component.html',
  styleUrls: ['./sun-details.component.css']
})
export class SunDetailsComponent {
  sunspotImageUrl!: string | null;
  sunspotImageUrl1!: string | null;
  sunspotImageUrl2!: string | null;
  allData: any ;
  dataArray: any;
  tableData:any[] = [];
  SunValues:any[] = [];
   async ngOnInit() {
    this.allData = await this.getDataFromServer();
    this.getSunspotImage();

  }

    async ngAfterViewInit() {
    // this.RenderChart('bar', 'EVENTS');
    // this.RenderChart('scatter', 'ASTEROIDS');

    
    
    // Fetch data from the server and wait for the response
    const data = await this.getDataFromServer();
    if (data) {
      let array= []
       array = data.sunData.value.Sun_Physical_Data;
       array.shift();
      this.dataArray = data.sunData.value.Sun_15_Days;
      await this.parseData();
      this.SunValues =array 
    }
  }

   async parseData() {
    this.tableData = this.dataArray.map((data: { split: (arg0: string) => [any, any, any, any, any, any]; }) => {
      const [date, ra, dec, magnitude, diameter, constellation] = data.split('|');
      return {
        date,
        ra,
        dec,
        magnitude,
        diameter,
        constellation
      };
    });
  }

  async getSunspotImage() {
    try {
      // Fetch the sunspot image URL from the service
      // const response = await this.sunInfoService.getSunspotImage().toPromise();     
      const response = this.allData.sunData.value.images;
      this.sunspotImageUrl = response[0];
      this.sunspotImageUrl1 = response[1];
      this.sunspotImageUrl2 = response[2];
    } catch (error) {
      console.error('Error fetching sunspot image:', error);
      this.sunspotImageUrl = null;
    }
  }

  // async  parseData() {
  //   this.dataArray = this.dataArray.map(data => {
  //     const [date, ra, dec, magnitude, diameter, constellation] = data.split(',');
  //     return {
  //       date,
  //       ra,
  //       dec,
  //       magnitude,
  //       diameter,
  //       constellation
  //     };
  //   });
  // }


  

  async getDataFromServer() {
    try {
      const responseSun = await axios.get("http://localhost:8000/app/get-sun-details");
      const sunDetailsValues = responseSun.data;
      // console.log(sunDetailsValues);

     
      // Return the extracted data as an object
      return {
        sunData: sunDetailsValues,
      };
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null; // Return null in case of an error
    }
  }
  

}
