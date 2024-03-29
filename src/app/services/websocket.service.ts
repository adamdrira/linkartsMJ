import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay, retryWhen, delayWhen } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import {Subject,Observable, Observer,EMPTY, timer} from 'rxjs';
import { webSocket,WebSocketSubject } from 'rxjs/webSocket';
import { NavbarService } from './navbar.service';
import { AnonymousSubject } from 'rxjs/internal/Subject';
const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})


export class WebSocketService {


  constructor(private httpClient: HttpClient, private CookieService: CookieService,private NavbarService:NavbarService) {
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
  return this.ws.readyState
}





  connect(url):Subject<MessageEvent>{
      if(!this.subject){
          this.subject=this.create(url);
      }
      return this.subject;

  }

  
  
  create(url):Subject<MessageEvent>{
      let THIS=this;
      
      this.ws = new WebSocket(url);
      let observable = new Observable(
          (obs:Observer<MessageEvent>)=>{
              this.ws.onmessage=obs.next.bind(obs);
              this.ws.onerror=obs.error.bind(obs);
              
              this.ws.onclose=function(e) {  
                if(!e.wasClean){
                    let retry= setInterval(() => {
                        if(THIS.ws.readyState==2 || THIS.ws.readyState==3 ){
                          THIS.subject = null;
                          THIS.NavbarService.send_connextion_status(false)
                          return THIS.connect(url)
                        }
                        else{
                          clearInterval(retry)
                          THIS.subject = null;
                          THIS.NavbarService.send_connextion_status(true)
                        }
                    
                      },1000);
                }
              }
              return this.ws.close.bind(this.ws); ;
          }
      )

      let observer= {
          next:(data:Object)=>{
              if(this.ws.readyState===WebSocket.OPEN){
                this.NavbarService.send_connextion_status(true)
                this.ws.send(JSON.stringify(data));
              }
              else{
                  if(THIS.ws.readyState==2 || THIS.ws.readyState==3){
                    THIS.subject = null;
                    THIS.NavbarService.send_connextion_status(false)
                    THIS.connect(url)
                  }
                  else{
                    THIS.subject = null;
                    THIS.NavbarService.send_connextion_status(true);
                  }
              }
          },
          error: (err: any) => {console.log(err)},
          complete: () => { 
            this.ws.complete();
            this.subject = null;},
          
      }

      return new AnonymousSubject<any>(observer,observable)
  }



}
  






