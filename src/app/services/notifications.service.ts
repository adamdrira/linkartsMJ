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
      return this.httpClient.get('routes/get_list_of_notifications', {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_notifications_information(type,id_user,id_user_name,id_receiver,publication_category,format,publication_id,chapter_number){
      return this.httpClient.post('routes/get_notifications_information',{id_user:id_user,id_user_name:id_user_name,id_receiver:id_receiver,type:type,publication_category:publication_category,format:format,publication_id:publication_id,chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    add_notification(type,id_user,id_user_name,id_receiver,publication_category,publication_name,format,publication_id,chapter_number,information,is_comment_answer,comment_id){
      console.log(publication_name)
      return this.httpClient.post('routes/add_notification',{is_comment_answer:is_comment_answer,comment_id:comment_id,publication_name:publication_name,id_user:id_user,id_user_name:id_user_name,id_receiver:id_receiver,type:type,publication_category:publication_category,format:format,publication_id:publication_id,chapter_number:chapter_number,information:information}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }


    remove_notification(type,publication_category,format,publication_id,chapter_number,is_comment_answer,comment_id){
      return this.httpClient.post('routes/remove_notification',{is_comment_answer:is_comment_answer,comment_id:comment_id,type:type,publication_category:publication_category,format:format,publication_id:publication_id,chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    change_all_notifications_status_to_checked(user_id):Observable<any>{
      return this.httpClient.post('routes/change_all_notifications_status_to_checked',{user_id:user_id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    change_notification_status_to_seen(id_user,type,publication_category,format,publication_id,chapter_number):Observable<any>{
      return this.httpClient.post('routes/change_notification_status_to_seen',{id_user:id_user,type:type,publication_category:publication_category,format:format,publication_id:publication_id,chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }



}
