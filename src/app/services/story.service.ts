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


export class Story_service {


  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }
  

  get_stories_by_user_id(id_user){
   return this.httpClient.get(`http://localhost:4600/routes/get_stories_by_user_id/${id_user}`, {withCredentials:true
  }).pipe(map(information=>{
       return information
  }));
 };

 retrieve_story(file_name){
    return this.httpClient.get(`http://localhost:4600/routes/retrieve_story/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
        return information
    }));
};

check_if_story_already_seen(id){
    return this.httpClient.post('http://localhost:4600/routes/check_if_story_already_seen', {id: id}, {withCredentials:true}).pipe(map(information=>{
    return information;
  }));
}
  





  
}
