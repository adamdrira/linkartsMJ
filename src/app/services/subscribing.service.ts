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


export class Subscribing_service {


  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }
  

  subscribe_to_a_user(id_user_to_subscribe){
    return this.httpClient.post('http://localhost:4600/routes/subscribe_to_a_user', {id_user_to_subscribe:id_user_to_subscribe}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }

  remove_subscribtion(id_user_subscribed_to){
   return this.httpClient.delete(`http://localhost:4600/routes/remove_subscribtion/${id_user_subscribed_to}`, {withCredentials:true}).pipe(map(information=>{
       return information;
     }));
 };

 check_if_publication_archived(publication_category,format,publication_id){
  return this.httpClient.get(`http://localhost:4600/routes/check_if_publication_archived/${publication_category}/${format}/${publication_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};

 get_all_users_subscribed_to_before_today(id_user){
    return this.httpClient.get(`http://localhost:4600/routes/get_all_users_subscribed_to/${id_user}`, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };

  get_all_users_subscribed_to_today(id_user){
    return this.httpClient.get(`http://localhost:4600/routes/get_all_users_subscribed_to_today/${id_user}`, {withCredentials:true}).pipe(map(information=>{
        console.log(information)
        return information;
      }));
  };

  

  get_all_subscribed_users(id_user){
    return this.httpClient.get(`http://localhost:4600/routes/get_all_subscribed_users/${id_user}`, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };
 
  check_if_visitor_susbcribed(id_user_to_check){
    return this.httpClient.get(`http://localhost:4600/routes/check_if_visitor_susbcribed/${id_user_to_check}`, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };
 
  add_content(category, format, publication_id,chapter_number){
    return this.httpClient.post(`http://localhost:4600/routes/add_content`,{category:category, format:format, publication_id:publication_id, chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  validate_content(category, format, publication_id,chapter_number){
    return this.httpClient.post(`http://localhost:4600/routes/validate_content`,{category:category, format:format, publication_id:publication_id, chapter_number:chapter_number}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  remove_content(category, format, publication_id,chapter_number){
    return this.httpClient.delete(`http://localhost:4600/routes/remove_content/${category}/${format}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  get_all_subscribings_contents(formdata){
    return this.httpClient.post(`http://localhost:4600/routes/get_all_subscribings_contents`, {formData: formdata}).pipe(map(information=>{
        return information;
      }));
  };

  get_last_contents_of_a_subscribing(id_user){
    return this.httpClient.get(`http://localhost:4600/routes/get_last_contents_of_a_subscribing/${id_user}`).pipe(map(information=>{
        return information;
      }));
  };


  see_more_contents(formdata,last_timestamp){
    return this.httpClient.post(`http://localhost:4600/routes/see_more_contents`, {formData: formdata, last_timestamp:last_timestamp}).pipe(map(information=>{
        console.log(information);
        return information;
      }));
  };

  archive(publication_category,format,publication_id){
    return this.httpClient.post('http://localhost:4600/routes/add_to_archive', {publication_category: publication_category, format:format,publication_id:publication_id}, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  }

  unarchive(publication_category,format,publication_id){
    return this.httpClient.post('http://localhost:4600/routes/unarchive', {publication_category: publication_category, format:format,publication_id:publication_id}, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  }


  get_archives_comics(){
    return this.httpClient.get('http://localhost:4600/routes/list_of_archives_comics', {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  }

  get_archives_drawings(){
    return this.httpClient.get('http://localhost:4600/routes/list_of_archives_drawings', {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  }

  get_archives_writings(){
    return this.httpClient.get('http://localhost:4600/routes/list_of_archives_drawings', {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  }

  get_archives_ads(): Observable<Object>{
    return this.httpClient.get('http://localhost:4600/routes/list_of_archives_ads', {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  }

  

  get_new_drawing_contents(id_user){
    return this.httpClient.get(`http://localhost:4600/routes/get_new_drawing_contents/${id_user}`).pipe(map(information=>{
        return information;
      }));
  };

  get_new_writing_contents(id_user){
    return this.httpClient.get(`http://localhost:4600/routes/get_new_writing_contents/${id_user}`).pipe(map(information=>{
        return information;
      }));
  };

  get_new_comic_contents(id_user){
    return this.httpClient.get(`http://localhost:4600/routes/get_new_comic_contents/${id_user}`).pipe(map(information=>{
        return information;
      }));
  };
  
 



  


  
}
