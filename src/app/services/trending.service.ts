import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})


export class Trending_service {


  constructor(private httpClient: HttpClient) {
    httpClient.options
  }

  comics_trendings:any;
  
  today = new Date();
  dd = String(this.today.getDate()).padStart(2, '0');
  mm = String(this.today.getMonth() + 1).padStart(2, '0'); 
  yyyy:number = this.today.getFullYear();
  date = this.yyyy.toString() + '-' +  this.mm + '-' + this.dd;

  send_rankings_and_get_trendings_comics(){
    return this.httpClient.post('http://localhost:4600/routes/send_rankings_and_get_trendings_comics', {}).pipe(map((information)=>{
        if (information[0].data=='sent'){
           return 'get_comics_trendings'
         }       
        else{
            return information;
        }
        
      }));
  }

  get_comics_trendings(){
    return this.httpClient.get(`http://localhost:4600/python/get_comics_trendings/${this.date}`).pipe(map((information)=>{
        return information;
      }));
  }


  get_drawings_trendings(){
    return this.httpClient.get(`http://localhost:4600/routes/get_drawings_trendings/${this.date}`).pipe(map((information)=>{
        return information;
      }));
  }

  get_writings_trendings(){
    return this.httpClient.get(`http://localhost:4600/routes/get_writings_trendings/${this.date}`).pipe(map((information)=>{
        return information;
      }));
  }




  

  
}
