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
  rise:string | undefined;
  set:string | undefined;
  currentState:string | undefined;
  transit:string | undefined;
  transit_altitudeValue:string | undefined;

  SunValues:any[] = [];
  rise_azimuthValue: any;
  set_azimuthValue: any;
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
      this.SunValues =array 
    }
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

  

  async getDataFromServer() {
    try {
      const responseSun = await axios.get("http://localhost:8000/app/get-sun-details");
      const sunDetailsValues = responseSun.data;


      const azimuthMatch = responseSun.data.value.rise.match(/Azimuth:\s*([\d.]+)°/);
      const riseMatch = responseSun.data.value.rise.match(/RISE\s*([\d:]+)/);
      const azimuthValue = azimuthMatch ? azimuthMatch[1] : null;
      const riseValue = riseMatch ? riseMatch[1] : null;
      this.rise = riseValue;
      this.rise_azimuthValue = azimuthValue

      
      const setMatch = responseSun.data.value.set.match(/SET\s*([\d:]+)/);
      const azimuthMatch_set = responseSun.data.value.set.match(/Azimuth:\s*([\d.]+)°/);
      const azimuthValue_set = azimuthMatch_set ? azimuthMatch_set[1] : null;
      const Value_set = setMatch ? setMatch[1] : null;
      this.set = Value_set;
      this.set_azimuthValue = azimuthValue_set;

      const parts = responseSun.data.value.currentState.split('\n');
      parts.pop()
      parts.shift();
      parts.shift();

      const currentState_1 = parts[0].split(',');
      var currState_final = currentState_1[0] +" " + parts[1];
      this.currentState = currState_final;

      const altitudeMatch = responseSun.data.value.transit.match(/Max altitude:\s*([\d.]+)°/);
      const transitMatch = responseSun.data.value.transit.match(/TRANSIT\s*([\d:]+)/);
      const altitudeValue = altitudeMatch ? altitudeMatch[1] : null;
      const transitMatchValue = transitMatch ? transitMatch[1] : null;
       this.transit = transitMatchValue;
       this.transit_altitudeValue = altitudeValue;

      // const valuesToExtract = [this.rise, this.set, this.currentState, this.transit];
      // for (const inputString of valuesToExtract) {
      //   if (inputString) {


       
      //     const setMatch = inputString.match(/SET\s*([\d:]+)/);
      //     const altitudeMatch = inputString.match(/Max altitude:\s*([\d.]+)°/);
      //     const transitMatch = inputString.match(/TRANSIT\s*([\d:]+)/);

      //     const matches = inputString.match(/[^\n\t]+(?=[\n\t])/g);
      //     if (matches) {
      //       for (const match of matches) {
      //         console.log(match.trim());
      //       }
      //     }
      //   }
      // }
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
