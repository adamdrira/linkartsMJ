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


export class Reports_service {



  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
  }
  


  add_primary_information_report(type_of_report,id_receiver,publication_category,publication_id,format,chapter_number,message){
 
    return this.httpClient.post('routes/add_primary_information_report', {type_of_report:type_of_report,id_receiver: id_receiver, publication_category: publication_category,publication_id:publication_id,format:format,chapter_number:chapter_number,message:message}, {withCredentials:true}).pipe(map((information)=>{
         return information;
       }));
   }


   check_if_content_reported(publication_category,publication_id,format,chapter_number){
 
    return this.httpClient.post('routes/check_if_content_reported', {publication_category: publication_category,publication_id:publication_id,format:format,chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
         return information;
       }));
   }

   cancel_report(publication_category,publication_id,format){
    return this.httpClient.post('routes/cancel_report', {publication_category: publication_category,publication_id:publication_id,format:format}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
   }




    // interactions avec les annonces

    delete_attachment(id) {
        return this.httpClient.delete(`routes/delete_ad_attachment/${id}`, {withCredentials:true}).pipe(map(information=>{
        return information;   
        }));
    }

    

  
}
