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


export class Drawings_Onepage_Service {


  constructor(
    private httpClient: HttpClient, 
    private CookieService: CookieService,
    private Subscribing_service:Subscribing_service) {}
  
   //création ligne dans table "list-bd_oneshot" après étape 1 formulaire
  CreateDrawingOnepage(Title, Category, Tags:String[],highlight,monetization){

    return this.httpClient.post('routes/add_drawing_one_page', {Title: Title, Category:Category, Tags:Tags,highlight:highlight,monetization:monetization }, {withCredentials:true}).pipe(map((information)=>{
        console.log(information[0]) 
        this.CookieService.delete('current_drawing_onepage_id');
        this.CookieService.delete('current_drawing_artbook_id');
        this.CookieService.set('current_drawing_onepage_id', information[0].drawing_id, undefined, '/','localhost',undefined,'Lax');  
        return information
    }));
  }


  get_drawing_id_cookies(){
   return this.CookieService.get('current_drawing_onepage_id');
  }

  ModifyDrawingOnePage(Title, Category, Tags:String[],highlight,monetization){
    let drawing_id = this.CookieService.get('current_drawing_onepage_id')
    return this.httpClient.post('routes/modify_drawing_one_page', {Title: Title, Category:Category, Tags:Tags, drawing_id:drawing_id, highlight:highlight,monetization:monetization }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  ModifyDrawingOnePage2(drawing_id,Title, Category, Tags:String[],highlight){
    return this.httpClient.post('routes/modify_drawing_one_page', {Title: Title, Category:Category, Tags:Tags, drawing_id:drawing_id,highlight:highlight }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }



   //remove the page from postgresql
   remove_drawing_from_sql(drawing_id){
     if (drawing_id==0){
      drawing_id = this.CookieService.get('current_drawing_onepage_id');
     }
    return this.httpClient.delete(`routes/remove_drawing_from_data/${drawing_id}`, {withCredentials:true}).pipe(map(information=>{
      this.Subscribing_service.remove_content('drawing', 'one-shot', drawing_id,0).subscribe(r=>{
        this.remove_drawing_from_folder(information[0].drawing_name).subscribe(l=>{
          return information;
        })
      });
        
    }));
   };
   
  

   //remove the page file from the folder associated
   remove_drawing_from_folder(filename) {
    return this.httpClient.delete(`routes/remove_drawing_onepage_from_folder/${filename}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };

   validate_drawing(){
    let drawing_id = this.CookieService.get('current_drawing_onepage_id')
    return this.httpClient.post('routes/validation_upload_drawing_onepage/',{drawing_id:drawing_id}, {withCredentials:true}).pipe(map(information=>{
      this.CookieService.delete('current_drawing_onepage_id');
      return this.Subscribing_service.validate_content("drawing","one-shot",drawing_id,0).subscribe(l=>{
        return l
      });   
     }));
  }

  update_filter(color){
    let drawing_id = this.CookieService.get('current_drawing_onepage_id')
    return this.httpClient.post('routes/update_filter_color_drawing_onepage',{color:color,drawing_id:drawing_id}, {withCredentials:true}).pipe(map(information=>{
       return information;   
     }));
  }

  change_oneshot_drawing_status(drawing_id,status){
    return this.httpClient.post('routes/change_oneshot_drawing_status', {status: status, drawing_id:drawing_id}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_private_oneshot_drawings(){
    return this.httpClient.get('routes/retrieve_private_oneshot_drawings', {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }

  
  retrieve_drawings_information_by_userid(user_id: number) {

    return this.httpClient.get(`routes/retrieve_drawing_onepage_info_user_id/${user_id}`).pipe(map(information=>{
      return information;   
    }));
    
  }

  retrieve_drawing_information_by_id(drawing_id: number) {
    return this.httpClient.get(`routes/retrieve_drawing_info_onepage_by_id/${drawing_id}`).pipe(map(information=>{
      return information;   
    }));
    
  }

  retrieve_drawing_page(file_name:string){
    return this.httpClient.get(`routes/retrieve_drawing_onepage_by_name/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }


  retrieve_thumbnail_picture(file_name:string) {
    return this.httpClient.get(`routes/retrieve_drawing_thumbnail_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  get_number_of_drawings_oneshot(id_user,date_format,compteur){
    return this.httpClient.post('routes/get_number_of_drawings_oneshot',{id_user:id_user,date_format:date_format}, {withCredentials:true}).pipe(map(information=>{
    return [information,compteur]
   }));
  }

}
