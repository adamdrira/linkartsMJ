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
   return this.httpClient.post('routes/get_covername_writing', {withCredentials:true}).pipe(map(information=>{
       this.covername = information[0].covername;
       return information
  }));
 };

 get_cover_name2(){
  return this.covername
 }
  

  send_confirmation_for_addwriting(confirmation:boolean){
      this.confirmation = confirmation
  };

  get_confirmation(){
      return this.confirmation
  }



  add_covername_to_sql(writing_id){
      return this.httpClient.post('routes/add_cover_writing_todatabase', {name: this.covername, writing_id: writing_id},{withCredentials:true}).pipe(map((information)=>{
        this.CookieService.delete('name_cover_writing');
        return information;
      }));
    
  }
  

   //remove the page file from the folder associated
   remove_cover_from_folder() {
    
    if(this.covername!=''){
      console.log(this.covername);
      return this.httpClient.delete(`routes/remove_writing_cover_from_folder/${this.covername}`).pipe(map(information=>{
        this.covername='';
        this.CookieService.delete('name_cover_writing','/');
        return information;
      }));
    }
    else{
      return new Observable<true>();
    }
    
    
   };

   remove_last_cover_from_folder(file_name){
     if(file_name && file_name!=''){
      return this.httpClient.delete(`routes/remove_last_cover_from_folder/${file_name}`).pipe(map(information=>{
        return information;
       }));
     }
     else{
      return new Observable<true>();
     }
     
 };

  
}
