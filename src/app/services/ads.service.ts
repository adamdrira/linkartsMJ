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


export class Ads_service {

 thumbnail_confirmation:Boolean = false;
 name_thumbnail_ad:string='';
 

  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }
  




  add_primary_information_ad(title,type_of_project,description,my_description,targets){
       return this.httpClient.post('http://localhost:4600/routes/add_primary_information_ad', {description: description, title: title,type_of_project:type_of_project,my_description:my_description,targets:targets}, {withCredentials:true}).pipe(map((information)=>{
         return information;
       }));
   }

   get_thumbnail_name(){
    console.log("get_thumbnail_name")
    return this.httpClient.get('http://localhost:4600/routes/get_cookies_thumbnail_ad', {withCredentials:true
        }).pipe(map(information=>{
                this.name_thumbnail_ad = information[0].name_thumbnail_ad;
                return this.name_thumbnail_ad
    }));
  };


  send_confirmation_for_add_ad(confirmation:boolean){
      this.thumbnail_confirmation = confirmation
  };//prévient component add-artwork si il peut passer à la prochaine étape ou non

  get_thumbnail_confirmation(){
      return this.thumbnail_confirmation
  }


  //lorsqu'il valide tout
  add_thumbnail_ad_to_database(id){
        
      return this.httpClient.post('http://localhost:4600/routes/add_thumbnail_ad_to_database', {name: this.name_thumbnail_ad, id: id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    
  }

  
   //remove the page file from the folder associated
   remove_thumbnail_ad_from_folder() {
    this.CookieService.delete('name_thumbnail_ad','/');
    if(this.name_thumbnail_ad!=''){
        return this.httpClient.delete(`http://localhost:4600/routes/remove_thumbnail_ad_from_folder/${this.name_thumbnail_ad}`, {withCredentials:true}).pipe(map(information=>{
            return information;
          }));
    }
    return new Observable<true>();
    
   };



  
}
