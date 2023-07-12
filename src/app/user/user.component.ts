import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  name: string = "";
  address: string = "";
  phone: string = "";
  constructor(private http: HttpClient){
  }

  register(){
    console.log("here")
    let bodyData = {
      "name": this.name,
      "address": this.address,
      "phone": this.phone,
    }
    this.http.post("http://localhost:8000/app/createuser",bodyData).subscribe((resultData: any)=>{
      console.log(resultData)
    })
  }



}
