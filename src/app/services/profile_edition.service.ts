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


export class Profile_Edition_Service {


  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }
  

  send_profile_pic_todata(profile_pic:Blob){
    const formData = new FormData();
    formData.append('profile_pic', profile_pic, "profile_pic");
    return this.httpClient.post('routes/add_profile_pic', formData, {withCredentials: true} ).pipe(map((information)=>{
      return information;
    }));

  }

  

  edit_bio(bio,job,training,location){
    return this.httpClient.post('routes/modify_bio', {bio:bio, job:job, training:training, location:location},{withCredentials: true}  ).pipe(map((information)=>{
      return information;
    }));

  }

  send_cover_pic_todata(cover_pic:Blob){
    const formData = new FormData();
    formData.append('cover_pic', cover_pic, "cover_pic");
    return this.httpClient.post('routes/add_cover_pic', formData, {withCredentials: true} ).pipe(map((information)=>{
      return information;
    }));

  }

  retrieve_profile_picture(user_id: number){
    return this.httpClient.get(`routes/retrieve_profile_picture/${user_id}`, {responseType:'blob'} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_cover_picture(user_id: number){
    return this.httpClient.get(`routes/retrieve_cover_picture/${user_id}`, {responseType:'blob'} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_profile_data(user_id: number){
    return this.httpClient.get(`routes/retrieve_profile_data/${user_id}` ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_profile_data_links(id_user: number){
    return this.httpClient.get(`routes/retrieve_profile_data_links/${id_user}` ).pipe(map((information)=>{
      return information;
    }));
  }

 get_current_user(){
    return this.httpClient.get('http://localhost:4600/api/userid',{withCredentials:true} ).pipe(map((information)=>{   
      return information;
    }));
  }

  get_user_id_by_pseudo(pseudo){
    return this.httpClient.get(`routes/get_user_id_by_pseudo/${pseudo}`,{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  get_pseudo_by_user_id(user_id){
    return this.httpClient.get(`routes/get_pseudo_by_user_id/${user_id}`,{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }



}