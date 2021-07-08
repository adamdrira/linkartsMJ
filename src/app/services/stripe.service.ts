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

  
  create_checkout_project_submission(value,pseudo,id_project,title){
    return this.httpClient.post('routes/create_checkout_project_submission', {value:value,pseudo:pseudo,id_project:id_project,title:title}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }

}