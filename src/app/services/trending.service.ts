import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import {  map } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class Trending_service {


  constructor(private httpClient: HttpClient) {
    httpClient.options
  }
  
  get_trendings_for_tomorrow(){
    return new Observable<[{true:"true"}]>();
  }

  send_rankings_and_get_trendings_comics(){
    return this.httpClient.post('routes/send_rankings_and_get_trendings_comics', {}).pipe(map((information)=>{
            return information;
        
      }));
  }

  get_comics_trendings(){
    return this.httpClient.get(`python/get_comics_trendings`).pipe(map((information)=>{
        return information;
      }));
  }


  get_drawings_trendings(){
    return this.httpClient.get(`routes/get_drawings_trendings`).pipe(map((information)=>{
        return information;
      }));
  }

  get_writings_trendings(){
    return this.httpClient.get(`routes/get_writings_trendings`).pipe(map((information)=>{
        return information;
      }));
  }


  
  check_if_user_has_trendings(id_user){
    return this.httpClient.post('routes/check_if_user_has_trendings',{id_user:id_user}).pipe(map((information)=>{
        return information;
      }));
  }

  get_all_trendings_by_user(date_format,id_user,compteur){
    return this.httpClient.post('routes/get_all_trendings_by_user',{date_format:date_format,id_user:id_user}).pipe(map((information)=>{
        return [information,compteur];
      }));
  }


  get_date_of_trendings(){
    return this.httpClient.post('routes/get_date_of_trendings',{}).pipe(map((information)=>{
        return information;
      }));
  }

  
  get_total_trendings_gains_by_user(){
    return this.httpClient.post('routes/get_total_trendings_gains_by_user',{}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }
  
  get_total_trendings_gains_by_users_group(list_of_ids){
    return this.httpClient.post('routes/get_total_trendings_gains_by_users_group',{list_of_ids:list_of_ids}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }
}
