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


export class Bd_CoverService {

 confirmation:Boolean = false;
 covername:string ="";

  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }
  

  get_cover_name(){
   return this.httpClient.post('routes/get_covername_comic',{}, {withCredentials:true}).pipe(map(information=>{
      this.covername = information[0].covername;
      console.log(this.covername) 
      return information 
  }));
 };

 get_cover_name2(){
  return this.covername
 }
  

  send_confirmation_for_addartwork(confirmation:boolean){
      this.confirmation = confirmation
  };//prévient component add-artwork si il peut passer à la prochaine étape ou non

  get_confirmation(){
      return this.confirmation
  }



  add_covername_to_sql(bd_id,format:string){
    this.CookieService.delete('name_cover_bd','/');
    if(format==="One-shot"){
      return this.httpClient.post('routes/add_cover_bd_oneshot_todatabase', {name: this.covername, bd_id: bd_id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    else if(format==="Série"){
      return this.httpClient.post('routes/add_cover_bd_serie_todatabase', {name: this.covername, bd_id: bd_id},{withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
  }

  add_covername_to_sql2(format,bd_id){
    
    if(format==="One-shot"){
      return this.httpClient.post('routes/add_cover_bd_oneshot_todatabase', {name: this.covername, bd_id: bd_id}, {withCredentials:true}).pipe(map((information)=>{
        this.CookieService.delete('name_cover_bd','/');
        return information;
      }));
    }
    else if(format==="Série"){
      return this.httpClient.post('routes/add_cover_bd_serie_todatabase', {name: this.covername, bd_id: bd_id},{withCredentials:true}).pipe(map((information)=>{
        this.CookieService.delete('name_cover_bd','/');
        return information;
      }));
    }
  }
  

   //remove the page file from the folder associated
   remove_cover_from_folder() {
    
    if(this.covername != ''){
      return this.httpClient.delete(`routes/remove_cover_bd_from_folder/${this.covername}`, {withCredentials:true}).pipe(map(information=>{
        this.covername = '';
        this.CookieService.delete('name_cover_bd','/');
        return information;
      }));
    }
    else{
      return new Observable<true>();
    }
    
   };

   remove_last_cover_from_folder(name){
    
     if(name && name!=''){
      return this.httpClient.delete(`routes/remove_cover_bd_from_folder/${name}`, {withCredentials:true}).pipe(map(information=>{
        this.CookieService.delete('name_cover_bd','/');
        return information;
      }))
     }
     else{
      return new Observable<true>();
    }
  };


  compress_all_comics_thumbnails(){
    return this.httpClient.post(`routes/compress_all_comics_thumbnails`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }))
  }
  
}
