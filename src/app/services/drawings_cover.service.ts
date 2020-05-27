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


export class Drawings_CoverService {

 confirmation:Boolean = false;
 covername:string='';
 

  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }
  


  send_confirmation_for_add_drawing(confirmation:boolean){
      this.confirmation = confirmation
  };//prévient component add-artwork si il peut passer à la prochaine étape ou non

  get_confirmation(){
      return this.confirmation
  }

  send_cover_todata(cover:Blob){
    const formData = new FormData();
    formData.append('cover', cover, "image");
    console.log(formData.getAll('cover'));
    return this.httpClient.post('http://localhost:4600/routes/add_cover_drawing_onepage_tofolder', formData, {withCredentials: true} ).pipe(map((information)=>{
      this.covername= information[0].cover_name
      return information;
    }));

  }


  //lorsqu'il valide tout
  add_covername_to_sql(format:string){
   console.log(format);
    if(format==="Œuvre unique"){
      let drawing_id = this.CookieService.get('current_drawing_onepage_id');
      return this.httpClient.post('http://localhost:4600/routes/add_cover_drawing_onepage_todatabase', {name: this.covername, drawing_id: drawing_id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    else if(format==="Artbook"){
      let drawing_id = this.CookieService.get('current_drawing_artbook_id');
      return this.httpClient.post('http://localhost:4600/routes/add_cover_drawing_artbook_todatabase', {name: this.covername, drawing_id: drawing_id}, {withCredentials:true}).pipe(map((information)=>{
        console.log("ajout de la cover artbook")
        return information;
      }));
    }
  }

  add_covername_to_sql2(format:string,drawing_id){
    console.log(format);
     if(format==="Œuvre unique"){
       return this.httpClient.post('http://localhost:4600/routes/add_cover_drawing_onepage_todatabase', {name: this.covername, drawing_id: drawing_id}, {withCredentials:true}).pipe(map((information)=>{
         return information;
       }));
     }
     else if(format==="Artbook"){
       return this.httpClient.post('http://localhost:4600/routes/add_cover_drawing_artbook_todatabase', {name: this.covername, drawing_id: drawing_id}, {withCredentials:true}).pipe(map((information)=>{
         console.log("ajout de la cover artbook")
         return information;
       }));
     }
   }
  

   //remove the page file from the folder associated
   remove_cover_from_folder() {
    return this.httpClient.delete(`http://localhost:4600/routes/remove_cover_drawing_from_folder/${this.covername}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };



  
}
