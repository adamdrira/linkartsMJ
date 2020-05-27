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


export class Writing_CoverService {

 confirmation:Boolean = false;
 covername:any;

  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }
  

  get_cover_name(){
   return this.httpClient.get('http://localhost:4600/routes/get_cookies_writing', {withCredentials:true
  }).pipe(map(information=>{
       this.covername = information[0].name_cover_writing;
       return this.covername
  }));
 };
  

  send_confirmation_for_addwriting(confirmation:boolean){
      this.confirmation = confirmation
  };

  get_confirmation(){
      return this.confirmation
  }



  add_covername_to_sql(writing_id){
      return this.httpClient.post('http://localhost:4600/routes/add_cover_writing_todatabase', {name: this.covername, writing_id: writing_id},{withCredentials:true}).pipe(map((information)=>{
        this.CookieService.delete('name_cover_writing');
        return information;
      }));
    
  }
  

   //remove the page file from the folder associated
   remove_cover_from_folder() {
    this.CookieService.delete('name_cover_bd_oneshot'); 
    return this.httpClient.delete(`http://localhost:4600/routes/remove_cover_bd_from_folder/${this.covername}`).pipe(map(information=>{
      return information;
    }));
   };

   remove_last_cover_from_folder(file_name){
     return this.httpClient.delete(`http://localhost:4600/routes/remove_last_cover_from_folder/${file_name}`).pipe(map(information=>{
         return information;
  }));
 };

  
}
