import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { SignalRService } from './signalR.service';
import { FocusTrap } from '@angular/cdk/a11y';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

path:any[]=[];
toStation="";
fromStation="";
stations = [];
recommendedPath  = [];
accessCode = "";
  constructor(private apiService: ApiService,private signalRService: SignalRService){

  }
  ngOnInit(){
    this.apiService.init().then(() => {
      this.stations = this.apiService.stations;
    });
    this.signalRService.newMessage.subscribe(data => {  
      console.log(data);
    });
  } 

  searchRecommendedPath(){ 
  this.recommendedPath = this.apiService.getRecommendedPath(this.toStation,this.fromStation);     
 }

  getStationDetail = function() {
    this.apiService.getStationDetail().subscribe(data => {
      this.stations = data;
    })
  }

  generateSharingLink = function() {
    let name = prompt("Enter your name"); 
    this.accessCode = Math.random().toString(36).substr(2, 9);  
    this.signalRService.setUserSharingInfo(name,this.accessCode);
    this.signalRService.init(this.accessCode);   
    setInterval(() => {
     this.startTracking();   
  },2000);
  }
  
  enterTrackingCode = function () {
    let sharedCode = prompt('Please enter the access code');
    this.signalRService.setUserTrackingInfo("U2",sharedCode);
  }

startTracking = function(){
      navigator.geolocation.getCurrentPosition(resp => {
       this.signalRService.shareTrackingInfo({lng: resp.coords.longitude, lat: resp.coords.latitude}).subscribe(data =>{
         
       } );
    });
}
}
