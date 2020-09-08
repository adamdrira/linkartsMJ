import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class NotificationsService {


  constructor(
    private httpClient: HttpClient,
    ) {}
   
    
    get_list_of_notifications(){
      return this.httpClient.get('http://localhost:4600/routes/get_list_of_notifications', {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_notifications_information(type,id_user,id_user_name,id_receiver,publication_category,format,publication_id,chapter_number){
      return this.httpClient.post('http://localhost:4600/routes/get_notifications_information',{id_user:id_user,id_user_name:id_user_name,id_receiver:id_receiver,type:type,publication_category:publication_category,format:format,publication_id:publication_id,chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    add_notification(type,id_user,id_user_name,id_receiver,publication_category,publication_name,format,publication_id,chapter_number){
      console.log(publication_name)
      return this.httpClient.post('http://localhost:4600/routes/add_notification',{publication_name:publication_name,id_user:id_user,id_user_name:id_user_name,id_receiver:id_receiver,type:type,publication_category:publication_category,format:format,publication_id:publication_id,chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }


    remove_notification(type,publication_category,format,publication_id,chapter_number){
      return this.httpClient.post('http://localhost:4600/routes/remove_notification',{type:type,publication_category:publication_category,format:format,publication_id:publication_id,chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    change_all_notifications_status_to_checked():Observable<any>{
      return this.httpClient.post('http://localhost:4600/routes/change_all_notifications_status_to_checked', {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    change_notification_status_to_seen(id_user,type,publication_category,format,publication_id,chapter_number):Observable<any>{
      return this.httpClient.post('http://localhost:4600/routes/change_notification_status_to_seen',{id_user:id_user,type:type,publication_category:publication_category,format:format,publication_id:publication_id,chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }



}
