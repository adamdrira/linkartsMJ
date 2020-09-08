import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import {Subject,Observable, Observer} from 'rxjs';


const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})


export class WebSocketService {


  constructor(private httpClient: HttpClient, private CookieService: CookieService, ) {
  }

  subject:Subject<MessageEvent>;
  public ws: any;

  public close() {
    if (this.ws) {
        this.ws.close();
        this.subject = null;
    }
}

public check_state(){
  //console.log(this.ws.readyState);
}

  

  connect(url):Subject<MessageEvent>{
      if(!this.subject){
          this.subject=this.create(url);
          console.log("connected to " + url);
      }
      return this.subject;

  }

  create(url):Subject<MessageEvent>{
      this.ws = new WebSocket(url);
      console.log(this.ws );
      let observable = Observable.create(
          (obs:Observer<MessageEvent>)=>{
             this.ws.onmessage=obs.next.bind(obs);
             this.ws.onerror=obs.error.bind(obs);
             this.ws.onclose=function(e) {  
              console.log('socket closed try again'); 
            }
              return ;
          }
      )

      let observer= {
          next:(data:Object)=>{
              if(this.ws.readyState===WebSocket.OPEN){
               this.ws.send(JSON.stringify(data));
              }
          },
          
      }

      return Subject.create(observer,observable)
  }

  
}
  






