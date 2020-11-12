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


export class Favorites_service {


  constructor(private httpClient: HttpClient) {
    httpClient.options
  }
  
 

  generate_or_get_favorites(){
    console.log("generate favorite")
    return this.httpClient.post('routes/generate_or_get_favorites', {}).pipe(map((information)=>{
            return information;
        
      }));
  }

  get_all_favorites_by_user(date_format,id_user,compteur){
    return this.httpClient.post('routes/get_all_favorites_by_user',{date_format:date_format,id_user:id_user}).pipe(map((information)=>{
        return [information,compteur];
      }));
  }


}