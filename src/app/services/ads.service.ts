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
  }
  


  add_primary_information_ad(title,type_of_project,description,location,my_description,targets,remuneration,price_value){
    console.log(description);  
    return this.httpClient.post('http://localhost:4600/routes/add_primary_information_ad', {description: description, title: title,type_of_project:type_of_project,my_description:my_description,targets:targets,location:location,remuneration,price_value}, {withCredentials:true}).pipe(map((information)=>{
         return information;
       }));
   }

   //thumbnail

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
  };

  get_thumbnail_confirmation(){
      return this.thumbnail_confirmation
  };

  add_thumbnail_ad_to_database(id){
      return this.httpClient.post('http://localhost:4600/routes/add_thumbnail_ad_to_database', {name: this.name_thumbnail_ad, id: id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  };

   remove_thumbnail_ad_from_folder() {
    this.CookieService.delete('name_thumbnail_ad','/');
    if(this.name_thumbnail_ad!=''){
        return this.httpClient.delete(`http://localhost:4600/routes/remove_thumbnail_ad_from_folder/${this.name_thumbnail_ad}`, {withCredentials:true}).pipe(map(information=>{
            return information;
          }));
    }
    return new Observable<true>();
   };

   //récupération des ads
   get_ads_by_user_id(user_id: number) {
      return this.httpClient.get(`http://localhost:4600/routes/get_ads_by_user_id/${user_id}`).pipe(map(information=>{
        return information;   
      }));
    }

    get_all_my_ads() {
      return this.httpClient.get('http://localhost:4600/routes/get_ads_by_user_id',{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
    }

    get_sorted_ads(remuneration,type_of_project,author,target,sorting):Observable<Object> {
      return this.httpClient.get(`http://localhost:4600/routes/get_sorted_ads/${remuneration}/${type_of_project}/${author}/${target}/${sorting}`,{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
    }

    retrieve_ad_by_id(id: number): Observable<Object> {
      return this.httpClient.get(`http://localhost:4600/routes/retrieve_ad_by_id/${id}`).pipe(map(information=>{
        return information;   
      }));
    }

    retrieve_ad_thumbnail_picture(file_name:string) {
      return this.httpClient.get(`http://localhost:4600/routes/retrieve_ad_thumbnail_bd_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
        return information;   
      }));
    }

    retrieve_picture(file_name,index) {
      return this.httpClient.get(`http://localhost:4600/routes/retrieve_ad_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
        return [information,index];   
      }));
    }

    retrieve_attachment(file_name,index) {
      return this.httpClient.get(`http://localhost:4600/routes/retrieve_ad_attachment/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
        return [information,index];   
      }));
    }

    // interactions avec les annonces

    delete_attachment(id) {
      return this.httpClient.delete(`http://localhost:4600/routes/delete_attachment/${id}`, {withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
    }

    add_ad_response(id_ad,description){
      return this.httpClient.post('http://localhost:4600/routes/add_ad_response', {id_ad: id_ad, description: description}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_all_responses(id_ad): Observable<Object>{
      return this.httpClient.get(`http://localhost:4600/routes/get_all_responses/${id_ad}`).pipe(map(information=>{
        return information;   
      }));
    }

  
}
