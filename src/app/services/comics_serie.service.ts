import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Subscribing_service } from '../services/subscribing.service';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})


export class BdSerieService {

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  constructor(
    private httpClient: HttpClient, 
    private CookieService: CookieService,
    private Subscribing_service:Subscribing_service
    ) {}
  
   //création ligne dans table "list-bd_oneshot" après étape 1 formulaire
  CreateBdSerie(Title, Category, Tags:String[], highlight, monetization){
    return this.httpClient.post('routes/add_bd_serie', {Title: Title, Category:Category, Tags:Tags, highlight:highlight,monetization:monetization}, {withCredentials:true}).pipe(map((information)=>{
        return information
    }));
  }

  RemoveBdSerie(bd_id) {
    return this.httpClient.delete(`routes/remove_bd_serie/${bd_id}`, {withCredentials:true}).pipe(map(information=>{
          return information;
    }));
  }
  add_chapter_bd_serie(bd_id,chapter_number: number, Title:string){
    return this.httpClient.post('routes/add_chapter_bd_serie', {Title: Title, chapter_number:chapter_number, bd_id:bd_id}, {withCredentials:true}).pipe(map((information)=>{
      return information
    }));

  }
  add_chapter_bd_serie2(bd_id,chapter_number: number, Title:string){
    return this.httpClient.post('routes/add_chapter_bd_serie', {Title: Title, chapter_number:chapter_number, bd_id:bd_id}, {withCredentials:true}).pipe(map((information)=>{
      return information
    }));

  }

  modify_chapter_bd_serie(bd_id,chapter_number: number, Title:string){
    return this.httpClient.post('routes/modify_chapter_bd_serie', {Title: Title, chapter_number:chapter_number, bd_id:bd_id}, {withCredentials:true}).pipe(map((information)=>{
      return information
  }));
  }

  modify_chapter_bd_serie2(bd_id,chapter_number: number, Title:string){
    return this.httpClient.post('routes/modify_chapter_bd_serie', {Title: Title, chapter_number:chapter_number, bd_id:bd_id}, {withCredentials:true}).pipe(map((information)=>{
      return information
  }));
  }

  change_serie_comic_status(bd_id,status){
    return this.httpClient.post('routes/change_serie_comic_status', {status: status, bd_id:bd_id,  }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_private_serie_bd(){
    return this.httpClient.get('routes/retrieve_private_serie_bd', {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }

  delete_chapter_bd_serie(bd_id,chapter_number: number){
    
      return this.httpClient.delete(`routes/delete_chapter_bd_serie/${chapter_number}/${bd_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information
      }));
   
  }

  delete_chapter_bd_serie2(bd_id,chapter_number: number){
      return this.httpClient.delete(`routes/delete_chapter_bd_serie/${chapter_number}/${bd_id}`, {withCredentials:true}).pipe(map(information=>{
        return information
    }));
    
  }



  ModifyBdSerie(bd_id,Title, Category, Tags:String[], highlight, monetization){
    return this.httpClient.post('routes/modify_bd_serie', {Title: Title, Category:Category, Tags:Tags, bd_id:bd_id, highlight:highlight,monetization:monetization },{withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  ModifyBdSerie2(bd_id,Title, Category, Tags:String[], highlight){
    return this.httpClient.post('routes/modify_bd_serie2', {Title: Title, Category:Category, Tags:Tags, bd_id:bd_id, highlight:highlight},{withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }



   //remove the page from postgresql
   remove_page_from_sql(bd_id,page:number, chapternum:number){
    return this.httpClient.delete(`routes/remove_page_bdserie_from_data/${page}/${chapternum}/${bd_id}`,{withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };
   

   //remove the page file from the folder associated
   remove_page_from_folder(filename) {
    return this.httpClient.delete(`routes/remove_page_bdserie_from_folder/${filename}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };

   validate_bd_chapter(bd_id,number_of_pages, chapter_number){
    return this.httpClient.post('routes/validation_chapter_upload_bd_serie/',{bd_id:bd_id, number_of_pages:number_of_pages, chapter_number:chapter_number}, {withCredentials:true}).pipe(map(information=>{
       return information;   
     }));
  }

  validate_bd_serie(bd_id,number_of_chapters){
    return this.httpClient.post('routes/validation_bd_upload_bd_serie/',{bd_id:bd_id, number_of_chapters:number_of_chapters}, {withCredentials:true}).pipe(map(information=>{
      return [bd_id,number_of_chapters]   
     }));
  }

  retrieve_bd_by_pseudo(pseudo: string) {
    return this.httpClient.get(`routes/retrieve_bd_serie_by_pseudo/${pseudo}`).pipe(map(information=>{
      return information;   
    }));  
  }

  retrieve_bd_by_id(user_id: number) {
    return this.httpClient.get(`routes/retrieve_bd_serie_by_id/${user_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));  
  }

  retrieve_bd_by_id2(user_id: number) {
    return this.httpClient.get(`routes/retrieve_bd_serie_by_id2/${user_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));  
  }


  retrieve_chapters_by_id(bd_id: number) {
    return this.httpClient.get(`routes/retrieve_chapters_by_id/${bd_id}`).pipe(map(information=>{
      return information;   
    }));
    
  }

  retrieve_chapter_by_number(bd_id: number,chapter_number) {
    return this.httpClient.get(`routes/retrieve_chapter_by_number/${bd_id}/${chapter_number}`).pipe(map(information=>{
      return information;   
    }));
    
  }

  retrieve_bd_page(bd_id,chapter_number,bd_page){
    return this.httpClient.get(`routes/retrieve_bd_chapter_page/${bd_id}/${chapter_number}/${bd_page}`,{responseType:'blob'}).pipe(map(information=>{
        return [information,bd_page];   
    }));
  }



  retrieve_thumbnail_picture(file_name:string) {
    return this.httpClient.get(`routes/retrieve_thumbnail_bd_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  

  get_number_of_bd_series(id_user,date_format,compteur){
    return this.httpClient.post('routes/get_number_of_bd_series',{id_user:id_user,date_format:date_format}, {withCredentials:true}).pipe(map(information=>{
    return [information,compteur]
   }));
  }
  
}
