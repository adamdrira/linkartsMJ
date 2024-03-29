import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { Subscribing_service } from '../services/subscribing.service';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})


export class Writing_Upload_Service {

 confirmation=false;
 total_pages:number;
 name_writing:string ='';

  constructor(
    private httpClient: HttpClient, 
    private CookieService: CookieService,
    private Subscribing_service:Subscribing_service) {
    httpClient.options
  }

  CreateWriting(Title, Category, Tags:String[], highlight,monetization,total_pages ){
    return this.httpClient.post('routes/add_writing', {Title: Title, Category:Category, Tags:Tags, highlight:highlight, writing_name: this.name_writing, monetization:monetization,total_pages:total_pages},{withCredentials:true}).pipe(map((information)=>{
        return information
    }));
  }

  Remove_writing(writing_id) {
    return this.httpClient.delete(`routes/remove_writing/${writing_id}`, {withCredentials:true}).pipe(map(information=>{
      return information
    }));
      
  }



  Modify_writing(writing_id,Title, Category, Tags:String[], highlight){
    return this.httpClient.post('routes/modify_writing', {Title: Title, Category:Category, Tags:Tags, highlight:highlight, writing_id:writing_id,},{withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  change_writing_status(writing_id,status){
    return this.httpClient.post('routes/change_writing_status', {status: status, writing_id:writing_id,  }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_private_writings(){
    return this.httpClient.get('routes/retrieve_private_writings', {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }


  get_writing_name(){
    return this.httpClient.post('routes/get_writing_name', {withCredentials:true}).pipe(map(information=>{
          this.name_writing = information[0].name_writing;
          return this.name_writing
    }));
 };
  
 
  send_confirmation_for_addwriting(confirmation:boolean,total_pages){
      this.confirmation = confirmation;
      this.total_pages=total_pages;
  };//prévient component add-artwork si il peut passer à la prochaine étape ou non

  get_confirmation():any[]{
      return [this.confirmation,this.total_pages]
  }

  retrieve_thumbnail_picture(file_name:string) {
    return this.httpClient.get(`routes/retrieve_thumbnail_writing_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_thumbnail_picture_artwork(file_name:string) {
    return this.httpClient.get(`routes/retrieve_thumbnail_writing_picture_artwork/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_thumbnail_picture_navbar(file_name:string) {
    return this.httpClient.get(`routes/retrieve_thumbnail_writing_picture_navbar/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }
  

   //remove the page file from the folder associated
   remove_writing_from_folder() {
     if(this.name_writing != ''){
        return this.httpClient.delete(`routes/remove_writing_from_folder/${this.name_writing}`).pipe(map(information=>{
          return information;
        }));
     }
     return new Observable<true>();
   };

   remove_writing_from_folder2(name_writing) {
    if(name_writing && name_writing != ''){
       return this.httpClient.delete(`routes/remove_writing_from_folder/${name_writing}`).pipe(map(information=>{
         return information;
       }));
    }
    return new Observable<true>();
  };

   validate_writing(writing_id){
     return this.httpClient.post('routes/validation_upload_writing/',{writing_id:writing_id}, {withCredentials:true}).pipe(map(information=>{
     return information
    }));
   }

   
  retrieve_writings_information_by_pseudo(pseudo){
    return this.httpClient.get(`routes/retrieve_writings_information_by_pseudo/${pseudo}`, {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }

 

  retrieve_writing_information_by_id(writing_id){
    return this.httpClient.get(`routes/retrieve_writing_information_by_id/${writing_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_writing_information_by_id2(writing_id){
    return this.httpClient.get(`routes/retrieve_writing_information_by_id2/${writing_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_writing_by_name(file_name){
    return this.httpClient.get(`routes/retrieve_writing_by_name/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_writing_by_name_artwork(file_name){
    return this.httpClient.get(`routes/retrieve_writing_by_name_artwork/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_writing_for_options(i){
    return this.httpClient.get(`routes/retrieve_writing_for_options/${i}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }
  

  get_number_of_writings(id_user,date_format,compteur){
    return this.httpClient.post('routes/get_number_of_writings',{id_user:id_user,date_format:date_format}, {withCredentials:true}).pipe(map(information=>{
    return [information,compteur]
   }));
  }

  add_total_pages_for_writing(writing_id,total_pages){
    return this.httpClient.post('routes/add_total_pages_for_writing',{writing_id:writing_id,total_pages:total_pages}, {withCredentials:true}).pipe(map(information=>{
    return information
   }));
  }
}
