import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})


export class Emphasize_service {
 

  constructor(private httpClient: HttpClient) {
    httpClient.options
  }
  


 
    emphasize_content(category:string,format:string,publication_id:number){
        return this.httpClient.post('routes/emphasize_content', {category:category,format:format,publication_id:publication_id}, {withCredentials:true}).pipe(map((information)=>{
            return information;
        }));
    }

  
  get_emphasized_content(id_user){
    return this.httpClient.get(`routes/get_emphasized_content/${id_user}`).pipe(map(information=>{
        return information;
      }));
  };

   remove_emphasizing(category:string,format:string,publication_id:number) {
    return this.httpClient.post('routes/remove_emphasizing', {category:category,format:format,publication_id:publication_id}, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };



  
}
