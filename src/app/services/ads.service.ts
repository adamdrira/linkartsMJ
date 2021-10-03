import { Injectable } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})


export class Ads_service {

 thumbnail_confirmation:Boolean = false;
 name_thumbnail_ad:string='';
 

  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
  }
  


  add_primary_information_ad(title,type_of_project,description,location,my_description,targets,remuneration,price_value,price_type,service,price_value_service,price_type_service,offer_or_demand){  
    return this.httpClient.post('routes/add_primary_information_ad', {description: description, title: title,type_of_project:type_of_project,service:service,offer_or_demand:offer_or_demand,price_value_service:price_value_service,price_type_service:price_type_service,my_description:my_description,targets:targets,location:location,remuneration:remuneration,price_value:price_value,price_type:price_type}, {withCredentials:true}).pipe(map((information)=>{
         return information;
       }));
   }

  edit_primary_information_ad(ad_id,title,description,location,remuneration,price_value,price_type,service,price_value_service,price_type_service,offer_or_demand){
    return this.httpClient.post('routes/edit_primary_information_ad', {description: description, title: title,ad_id:ad_id,service:service,offer_or_demand:offer_or_demand,price_value_service:price_value_service,price_type_service:price_type_service,location:location,remuneration:remuneration,price_value:price_value,price_type:price_type}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));         
  }

   check_if_ad_is_ok(type_of_project,my_description,targets){
    return this.httpClient.post('routes/check_if_ad_is_ok', {type_of_project:type_of_project,my_description:my_description,targets:targets}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
   }

   check_if_ad_answered(ad_id){
    return this.httpClient.post('routes/check_if_ad_answered', {ad_id:ad_id}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
   }

   //thumbnail

   send_thumbnail_name(name){
       this.name_thumbnail_ad = name;
  };

   get_thumbnail_name(){
    return this.httpClient.get('routes/get_thumbnail_ad_name', {withCredentials:true}).pipe(map(information=>{
        this.name_thumbnail_ad = information[0].name_thumbnail_ad;
        return information
    }));
  };

  get_thumbnail_name2(){
    return this.name_thumbnail_ad;
  }

  send_confirmation_for_add_ad(confirmation:boolean){
      this.thumbnail_confirmation = confirmation
  };



  get_thumbnail_confirmation(){
      return this.thumbnail_confirmation
  };

  add_thumbnail_ad_to_database(id){
      return this.httpClient.post('routes/add_thumbnail_ad_to_database', {name: this.name_thumbnail_ad, id: id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  };


   remove_thumbnail_ad_from_folder() {
    
    if(this.name_thumbnail_ad!=''){
        return this.httpClient.delete(`routes/remove_thumbnail_ad_from_folder/${this.name_thumbnail_ad}`, {withCredentials:true}).pipe(map(information=>{ 
          return information;
          }));
    }
    else{
      return new Observable<true>();
    }
    
   };

   remove_thumbnail_ad_from_folder2(name):Observable<any> {
     if(name && name!=''){
      return this.httpClient.delete(`routes/remove_thumbnail_ad_from_folder/${name}`, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
     }
     else{
      return new Observable<true>();
    }
    
   };

   //récupération des ads
   get_ads_by_user_id(user_id: number) {
      return this.httpClient.get(`routes/get_ads_by_user_id/${user_id}`).pipe(map(information=>{
        return information;   
      }));
    }

    get_ads_by_pseudo(pseudo: string) {
      return this.httpClient.post(`routes/get_ads_by_pseudo/${pseudo}`,{}).pipe(map(information=>{
        return information;   
      }));
    }



    get_sorted_ads(remuneration,type_of_project,author,target,sorting):Observable<Object> {
      return this.httpClient.get(`routes/get_sorted_ads/${remuneration}/${type_of_project}/${author}/${target}/${sorting}`,{withCredentials:true}).pipe(map(information=>{
        return information ;  
      }));
    }

    get_sorted_ads_linkcollab(type_of_project,author,target,remuneration,service,type_of_remuneration,type_of_service,offer_or_demand, sorting,offset,compteur):Observable<Object> {
      return this.httpClient.post('routes/get_sorted_ads_linkcollab', {remuneration:remuneration,service:service,offer_or_demand:offer_or_demand,type_of_remuneration:type_of_remuneration,type_of_service:type_of_service,type_of_project:type_of_project,author:author,target:target,sorting:sorting,offset:offset},{withCredentials:true}).pipe(map(information=>{
        return [information,compteur];   
      }));
    }

    retrieve_ad_by_id(id: number): Observable<Object> {
      return this.httpClient.get(`routes/retrieve_ad_by_id/${id}`).pipe(map(information=>{
        return information;   
      }));
    }

    retrieve_ad_thumbnail_picture(file_name:string) {
      return this.httpClient.get(`routes/retrieve_ad_thumbnail_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
        return information;   
      }));
    }

    retrieve_picture(file_name,index) {
      return this.httpClient.get(`routes/retrieve_ad_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
        return [information,index];   
      }));
    }

    retrieve_attachment(file_name,index,width) {
      return this.httpClient.get(`routes/retrieve_ad_attachment/${file_name}/${width}`,{responseType:'blob'}).pipe(map(information=>{
        return [information,index];   
      }));
    }

    // interactions avec les annonces

    delete_ad(id,id_user) {
      return this.httpClient.post(`routes/delete_ad`,{id:id,id_user:id_user}, {withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
    }

    add_ad_response(id_ad,description){
      return this.httpClient.post('routes/add_ad_response', {id_ad: id_ad, description: description}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_all_responses(id_ad): Observable<Object>{
      return this.httpClient.post(`routes/get_all_responses/${id_ad}`,{}).pipe(map(information=>{
        return information;   
      }));
    }

  
    get_number_of_ads_and_responses(id_user,date_format,compteur){
      return this.httpClient.post('routes/get_number_of_ads_and_responses', {id_user: id_user,date_format}, {withCredentials:true}).pipe(map((information)=>{
        return [information,compteur];
      }));
    }

    send_email_for_ad_answer(user_name,ad_id,author_id,title){
      return this.httpClient.post('routes/send_email_for_ad_answer', {user_name:user_name,ad_id:ad_id,author_id:author_id,title:title}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    check_if_response_sent(id_ad){
      return this.httpClient.post('routes/check_if_response_sent', {id_ad:id_ad}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    set_all_responses_to_seen(id_ad){
      return this.httpClient.post('routes/set_all_responses_to_seen', {id_ad:id_ad}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_all_my_responses(pseudo,limit,offset): Observable<Object>{
      return this.httpClient.get(`routes/get_all_my_responses/${pseudo}/${limit}/${offset}`).pipe(map(information=>{
        return information;   
      }));
    }
    
}
