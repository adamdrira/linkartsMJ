import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})


export class Albums_service {


  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }
  

  add_album_comics(title,album){
    return this.httpClient.post('routes/add_album_comics', {title:title, album:album}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }

  add_album_drawings(title,album){
    return this.httpClient.post('routes/add_album_drawings', {title:title, album:album}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }

  add_album_writings(title,album){
    return this.httpClient.post('routes/add_album_writings', {title:title, album:album}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }




 get_albums_comics(id_user){
    return this.httpClient.get(`routes/get_albums_comics/${id_user}`, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };

  
 get_albums_drawings(id_user){
  return this.httpClient.get(`routes/get_albums_drawings/${id_user}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};

get_albums_writings(id_user){
  return this.httpClient.get(`routes/get_albums_writings/${id_user}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};


get_standard_albums_drawings(id_user){
  return this.httpClient.get(`routes/standard_albums_drawings/${id_user}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};

change_drawing_album_status(album_name,current_status,new_status){
  return this.httpClient.post('routes/change_drawing_album_status', {album_name:album_name,current_status:current_status, new_status:new_status}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
}

remove_drawing_album(album_name,current_status){
  return this.httpClient.delete(`routes/remove_drawing_album/${album_name}/${current_status}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
}


get_standard_albums_comics(id_user){
  return this.httpClient.get(`routes/get_standard_albums_comics/${id_user}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};

change_comic_album_status(album_name,current_status,new_status){
  return this.httpClient.post('routes/change_comic_album_status', {album_name:album_name,current_status:current_status, new_status:new_status}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
}

remove_comic_album(album_name,current_status){
  return this.httpClient.delete(`routes/remove_comic_album/${album_name}/${current_status}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
}


change_writing_album_status(album_name,current_status,new_status){
  return this.httpClient.post('routes/change_writing_album_status', {album_name:album_name,current_status:current_status, new_status:new_status}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
}

remove_writing_album(album_name,current_status){
  return this.httpClient.delete(`routes/remove_writing_album/${album_name}/${current_status}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
}





}