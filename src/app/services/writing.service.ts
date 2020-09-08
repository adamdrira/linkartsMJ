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

 confirmation:Boolean = false;
 writing_id:number;
 name_writing:string ='';

  constructor(
    private httpClient: HttpClient, 
    private CookieService: CookieService,
    private Subscribing_service:Subscribing_service) {
    httpClient.options
  }

  CreateWriting(Title, Category, Tags:String[], highlight,monetization ){
    return this.httpClient.post('http://localhost:4600/routes/add_writing', {Title: Title, Category:Category, Tags:Tags, highlight:highlight, writing_name: this.name_writing, monetization:monetization},{withCredentials:true}).pipe(map((information)=>{
        console.log(information[0].writing_id) ;
        this.writing_id = information[0].writing_id;
        this.CookieService.delete('name_writing','/');
        this.Subscribing_service.add_content('writing', 'writing', information[0].writing_id,0).subscribe(r=>{});
        return information
    }));
  }

  Remove_writing(writing_id) {
    if(writing_id==0){
      writing_id=this.writing_id;
    }
    return this.httpClient.delete(`http://localhost:4600/routes/remove_writing/${writing_id}`, {withCredentials:true}).pipe(map(information=>{
      this.Subscribing_service.remove_content('writing', 'writing', writing_id,0).subscribe(r=>{
        this.remove_writing_from_folder().subscribe(l=>{return information})})
      }));
      
  }



  Modify_writing(writing_id,Title, Category, Tags:String[], highlight){
    return this.httpClient.post('http://localhost:4600/routes/modify_writing', {Title: Title, Category:Category, Tags:Tags, highlight:highlight, writing_id:writing_id,},{withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  change_writing_status(writing_id,status){
    return this.httpClient.post('http://localhost:4600/routes/change_writing_status', {status: status, writing_id:writing_id,  }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_private_writings(){
    return this.httpClient.get('http://localhost:4600/routes/retrieve_private_writings', {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }


  get_writing_name(){
    return this.httpClient.get('http://localhost:4600/routes/get_cookies_writing', {withCredentials:true
      }).pipe(map(information=>{
          this.name_writing = information[0].name_writing;
          return this.name_writing
    }));
 };
  
 
  send_confirmation_for_addwriting(confirmation:boolean){
      this.confirmation = confirmation
  };//prévient component add-artwork si il peut passer à la prochaine étape ou non

  get_confirmation(){
      return this.confirmation
  }

  retrieve_thumbnail_picture(file_name:string) {
    return this.httpClient.get(`http://localhost:4600/routes/retrieve_thumbnail_writing_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }


  

   //remove the page file from the folder associated
   remove_writing_from_folder() {
     if(this.name_writing != ''){
        return this.httpClient.delete(`http://localhost:4600/routes/remove_writing_from_folder/${this.name_writing}`).pipe(map(information=>{
          return information;
        }));
     }
     return new Observable<true>();
   };

   validate_writing(){
     return this.httpClient.post('http://localhost:4600/routes/validation_upload_writing/',{writing_id:this.writing_id}, {withCredentials:true}).pipe(map(information=>{

      return this.Subscribing_service.validate_content("writing","unknown",this.writing_id,0).subscribe(l=>{
        return information;
      }); 
    }));
   }

   
  retrieve_writings_information_by_user_id(user_id){
    return this.httpClient.get(`http://localhost:4600/routes/retrieve_writings_information_by_user_id/${user_id}`).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_writing_information_by_id(writing_id){
    return this.httpClient.get(`http://localhost:4600/routes/retrieve_writing_information_by_id/${writing_id}`).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_writing_by_name(file_name){
    return this.httpClient.get(`http://localhost:4600/routes/retrieve_writing_by_name/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  
}
