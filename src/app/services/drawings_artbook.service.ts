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


export class Drawings_Artbook_Service {


  constructor(
    private httpClient: HttpClient, 
    private CookieService: CookieService,
    private Subscribing_service:Subscribing_service) {}
  

  CreateDrawingArtbook(Title, Category, Tags:String[],highlight,monetization){
    return this.httpClient.post('routes/add_drawings_artbook', {Title: Title, Category:Category, Tags:Tags, highlight:highlight, monetization:monetization}, {withCredentials:true}).pipe(map((information)=>{
        console.log(information[0]) 
        this.CookieService.delete('current_drawing_artbook_id');
        this.CookieService.delete('current_drawing_onepage_id');
        this.CookieService.set('current_drawing_artbook_id', information[0].drawing_id, undefined, '/','localhost',undefined,'Lax');
        this.Subscribing_service.add_content('drawing', 'artbook', information[0].drawing_id,0).subscribe(r=>{});
        return information[0].drawing_id
    }));
  }
  
  update_filter(color){
    let drawing_id = this.CookieService.get('current_drawing_artbook_id')
    return this.httpClient.post('routes/update_filter_color_drawing_artbook',{color:color,drawing_id:drawing_id}, {withCredentials:true}).pipe(map(information=>{
       return information;   
     }));
  }

  change_artbook_drawing_status(drawing_id,status){
    return this.httpClient.post('routes/change_artbook_drawing_status', {status: status, drawing_id:drawing_id,  }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_private_artbook_drawings(){
    return this.httpClient.get('routes/retrieve_private_artbook_drawings', {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }

  RemoveDrawingArtbook(drawing_id) {
    if(drawing_id==0){
       drawing_id = this.CookieService.get('current_drawing_artbook_id');
    }
    return this.httpClient.delete(`routes/remove_drawings_artbook/${drawing_id}`, {withCredentials:true}).pipe(map(information=>{
      this.Subscribing_service.remove_content('drawing', 'artbook', drawing_id,0).subscribe(r=>{return information;});
      }));
  }

  get_artbookid_cookies(){
   return this.CookieService.get('current_drawing_artbook_id');
  }

  ModifyArtbook(Title, Category, Tags:String[],highlight, monetization){
    let drawing_id = this.CookieService.get('current_drawing_artbook_id');
    console.log(drawing_id);
    return this.httpClient.post('routes/modify_drawings_artbook', {Title: Title, Category:Category, Tags:Tags, drawing_id:drawing_id,highlight:highlight,monetization:monetization }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  ModifyArtbook2(drawing_id,Title, Category, Tags:String[],highlight){
    console.log(drawing_id);
    return this.httpClient.post('routes/modify_drawings_artbook', {Title: Title, Category:Category, Tags:Tags, drawing_id:drawing_id,highlight:highlight }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }


   //remove the page from postgresql
   remove_page_from_sql(page:number){
    let drawing_id = this.CookieService.get('current_drawing_artbook_id')
    this.CookieService.delete('current_drawing_artbook_id');
    return this.httpClient.delete(`routes/remove_artbook_page_from_data/${page}/${drawing_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };

   
  

   //remove the page file from the folder associated
   remove_page_from_folder(filename) {
    return this.httpClient.delete(`routes/remove_artbook_page_from_folder/${filename}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };

   validate_drawing(page_number){
    console.log(page_number);
    let drawing_id = this.CookieService.get('current_drawing_artbook_id')
    return this.httpClient.post('routes/validation_upload_drawing_artbook/',{drawing_id:drawing_id, page_number:page_number}, {withCredentials:true}).pipe(map(information=>{
      this.CookieService.delete('current_drawing_artbook_id');
      return this.Subscribing_service.validate_content("drawing","artbook",drawing_id,0).subscribe(l=>{
        return l
      }); 
       
     }));
  }

  
  retrieve_drawing_artbook_info_by_userid(user_id: number) {

    return this.httpClient.get(`routes/retrieve_drawing_artbook_info_by_userid/${user_id}`).pipe(map(information=>{
      return information;   
    }));
    
  }

  retrieve_drawing_artbook_by_id(drawing_id: number) {
    return this.httpClient.get(`routes/retrieve_drawing_artbook_by_id/${drawing_id}`).pipe(map(information=>{
      return information;   
    }));
    
  }

  retrieve_drawing_page_ofartbook(drawing_id,drawing_page){
    return this.httpClient.get(`routes/retrieve_drawing_page_ofartbook/${drawing_id}/${drawing_page}`,{responseType:'blob'}).pipe(map(information=>{
      return [information,drawing_page];   
    }));
  }


  retrieve_thumbnail_picture(file_name:string) {
    return this.httpClient.get(`routes/retrieve_drawing_thumbnail_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }




  
}
