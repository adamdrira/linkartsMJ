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
  

  get_stories_and_list_of_users(){
    return this.httpClient.post(`routes/get_stories_and_list_of_users`,{}, {withCredentials:true}).pipe(map(information=>{
          return information
      }));
  };

  check_stories_for_account(user_id){
    return this.httpClient.post(`routes/check_stories_for_account`,{user_id:user_id}, {withCredentials:true}).pipe(map(information=>{
      return information
  }));
  }

  get_stories_by_user_id(id_user){
    return this.httpClient.post(`routes/get_stories_by_user_id/${id_user}`, {withCredentials:true}).pipe(map(information=>{
          return information
      }));
  };

  get_all_my_stories(): Observable<Object>{
    return this.httpClient.get(`routes/get_all_my_stories`, {withCredentials:true}).pipe(map(information=>{
          return information
      }));
  };

  hide_story(id:number): Observable<Object>{
    return this.httpClient.post('routes/hide_story', {id:id},{withCredentials:true}).pipe(map(information=>{
          return information
      }));
  };

 retrieve_story(file_name,width){
    return this.httpClient.get(`routes/retrieve_story/${file_name}/${width}`,{responseType:'blob'}).pipe(map(information=>{
        return information
    }));
};

check_if_story_already_seen(id_story){
    return this.httpClient.post('routes/check_if_story_already_seen', {id_story: id_story}, {withCredentials:true}).pipe(map(information=>{
    return information;
  }));
}

check_if_all_stories_seen(id_user){
  return this.httpClient.post(`routes/check_if_all_stories_seen/${id_user}`, {withCredentials:true}).pipe(map(information=>{
        return information
    }));
};

get_total_number_of_views(authorid){
  return this.httpClient.post(`routes/get_total_number_of_views/${authorid}`, {withCredentials:true}).pipe(map(information=>{
        return information
    }));
};

get_last_seen_story(authorid){
  return this.httpClient.post('routes/get_last_seen_story', {authorid: authorid}, {withCredentials:true}).pipe(map(information=>{
    return information;
  }));
}

add_view(authorid,id_story,bool){
  return this.httpClient.post('routes/add_view', {authorid: authorid, id_story:id_story, bool:bool}, {withCredentials:true}).pipe(map(information=>{
    return information;
  }));
}

delete_story(id:number){
  return this.httpClient.delete(`routes/delete_story/${id}`, {withCredentials:true}).pipe(map(information=>{
        return information
    }));
}
  

upload_story(story:Blob){
  const formData = new FormData();
  formData.append('story', story, "story");
  return this.httpClient.post('routes/upload_story', formData, {withCredentials: true} ).pipe(map((information)=>{
    return information;
  }));

}


get_list_of_viewers_for_story(id_story){
  return this.httpClient.post(`routes/get_list_of_viewers_for_story`,{id_story:id_story}, {withCredentials:true}).pipe(map(information=>{
        return information
    }));
}
  

  
}
