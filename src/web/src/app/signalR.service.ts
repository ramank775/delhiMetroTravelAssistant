import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as SignalR from '@aspnet/signalr';
@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  newMessage: Subject<string> = new Subject();
  private hubConnection: SignalR.HubConnection;
  userName = "";
  accessCode = "";
  trackingCode = "";
  private baseURL: string = "https://delhimetro.azurewebsites.net/api/";
constructor(private http: HttpClient) {
  }
private getSignalRConnection(): Observable<any> {
    return this.http.post<any>(this.baseURL+'negotiate',{});
  }

  private broadcastSignalRMessage(accessCode): Observable<any> {
    return this.http.post<any>(this.baseURL+'messages',{"sender":"Raman","text":accessCode});
  }

init(accessCode) {
    this.getSignalRConnection().subscribe(con => {
      const options = {
        accessTokenFactory: () => con.accessToken
      };
this.hubConnection = new SignalR.HubConnectionBuilder()
        .withUrl(con.url, options)
        .configureLogging(SignalR.LogLevel.Information)
        .build();
this.hubConnection.start().catch(error => console.error(error));
this.hubConnection.on('newMessage', data => {
    if(data.type == "trackingInfo" && data.text == this.accessCode){
        this.newMessage.next(data);
    }
      });
      this.broadcastSignalRMessage(accessCode).subscribe(data => {

      });
    });
  
  }

  shareTrackingInfo(info): Observable<any> {
    return this.http.post<any>(this.baseURL+'messages',{"sender":"","longitute":info.lng,"latitude":info.lat,"type":"trackingInfo","text":this.accessCode});
  }

  setUserSharingInfo = function (name,accessCode) {
    this.userName=name;    
    this.accessCode = accessCode;
  }

  setUserTrackingInfo = function (name,accessCode) {  
    this.userName=name;   
    this.trackingCode = accessCode;
  }

  
}
