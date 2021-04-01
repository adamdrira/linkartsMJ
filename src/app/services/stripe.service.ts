import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})


export class StripeService {


  constructor(private httpClient: HttpClient) {
  }
  

  create_checkout_session(value){
    return this.httpClient.post('routes/create_checkout_session', {value:value}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }

}