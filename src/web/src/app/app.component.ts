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
displaySharedDestination = "";
isCodeGenerated = false;
  constructor(private apiService: ApiService,private signalRService: SignalRService){

  }
  ngOnInit(){
    this.apiService.init().then(() => {
      this.stations = this.apiService.stations;
    });
    this.signalRService.newMessage.subscribe(data => {  
     // console.log(data);
     this.displaySharedDestination = data['station'];
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
    this.isCodeGenerated=true;
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
       let nearestStation =  this.getNearestStation( resp.coords.longitude, resp.coords.latitude);
       this.signalRService.shareTrackingInfo(nearestStation).subscribe(data =>{

       });
    });
}

getNearestStation = function(longitude,latitude){
let distances = [];
let latitudeDistances = [];
for(let index=0;index<this.stations.length;index++){
  let long = parseFloat(this.stations[index].long) - parseFloat(longitude);
  let lat = parseFloat(this.stations[index].lat) - parseFloat(latitude);
  let sum = Math.sqrt(long*long + lat*lat)
  distances.push(sum);  
}
let oldDist = [...distances];
 distances.sort();
 const nearestStn = oldDist.indexOf(distances[0])
 return this.stations[nearestStn].name;
}
}
