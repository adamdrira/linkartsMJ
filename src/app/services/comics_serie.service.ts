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
        console.log(information[0]) 
        this.CookieService.delete('current_bd_oneshot_id','/');
        this.CookieService.delete('current_bd_serie_id','/');
        this.CookieService.set('current_bd_serie_id', information[0].bd_id, undefined, '/','localhost',undefined,'Lax');
        return this.CookieService.get('current_bd_serie_id')
    }));
  }

  RemoveBdSerie(bd_id) {
    if(bd_id==0){
        bd_id=this.CookieService.get('current_bd_serie_id');
    }
    return this.httpClient.delete(`routes/remove_bd_serie/${bd_id}`, {withCredentials:true}).pipe(map(information=>{
      return this.Subscribing_service.remove_content('comics', 'serie', bd_id,information[0].chaptersnumber).subscribe(r=>{
          return information;
        });
    }));
  }
  add_chapter_bd_serie(chapter_number: number, Title:string){
    let bd_id = this.get_bdid_cookies();
    this.Subscribing_service.add_content('comics', 'serie', bd_id,chapter_number).subscribe(r=>{});
    return this.httpClient.post('routes/add_chapter_bd_serie', {Title: Title, chapter_number:chapter_number, bd_id:bd_id}, {withCredentials:true}).pipe(map((information)=>{
      return information
    }));

  }
  add_chapter_bd_serie2(bd_id,chapter_number: number, Title:string){
    this.CookieService.set('current_bd_serie_id', bd_id, undefined, '/','localhost',undefined,'Lax');
    this.Subscribing_service.add_content('comics', 'serie', bd_id,chapter_number).subscribe(r=>{});
    return this.httpClient.post('routes/add_chapter_bd_serie', {Title: Title, chapter_number:chapter_number, bd_id:bd_id}, {withCredentials:true}).pipe(map((information)=>{
      return information
    }));

  }

  modify_chapter_bd_serie(chapter_number: number, Title:string){
    console.log("ici modify chapter");
    let bd_id = this.get_bdid_cookies();
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

  delete_chapter_bd_serie(chapter_number: number){
    let bd_id = this.get_bdid_cookies();
    this.Subscribing_service.remove_content('comics', 'serie', bd_id,chapter_number).subscribe(r=>{});
    return this.httpClient.delete(`routes/delete_chapter_bd_serie/${chapter_number}/${bd_id}`, {withCredentials:true}).pipe(map((information)=>{
      return information
    }));
  }

  delete_chapter_bd_serie2(bd_id,chapter_number: number){
    console.log(bd_id);
    this.Subscribing_service.remove_content('comics', 'serie', bd_id,chapter_number).subscribe(r=>{});
    return this.httpClient.delete(`routes/delete_chapter_bd_serie/${chapter_number}/${bd_id}`, {withCredentials:true}).pipe(map((information)=>{
      return information
    }));
  }

  get_bdid_cookies(){
   return this.CookieService.get('current_bd_serie_id')
  }

  ModifyBdSerie(Title, Category, Tags:String[], highlight, monetization){
    let bd_id = this.CookieService.get('current_bd_serie_id')
    return this.httpClient.post('routes/modify_bd_serie', {Title: Title, Category:Category, Tags:Tags, bd_id:bd_id, highlight:highlight,monetization:monetization },{withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  ModifyBdSerie2(bd_id,Title, Category, Tags:String[], highlight){
    return this.httpClient.post('routes/modify_bd_serie', {Title: Title, Category:Category, Tags:Tags, bd_id:bd_id, highlight:highlight},{withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }



   //remove the page from postgresql
   remove_page_from_sql(page:number, chapternum:number){
    let bd_id = this.CookieService.get('current_bd_serie_id');
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

   validate_bd_chapter(number_of_pages, chapter_number){
    let bd_id = this.CookieService.get('current_bd_serie_id')
    return this.httpClient.post('routes/validation_chapter_upload_bd_serie/',{bd_id:bd_id, number_of_pages:number_of_pages, chapter_number:chapter_number}, {withCredentials:true}).pipe(map(information=>{
       return information;   
     }));
  }

  validate_bd_serie(number_of_chapters){
    let bd_id = this.CookieService.get('current_bd_serie_id')
    return this.httpClient.post('routes/validation_bd_upload_bd_serie/',{bd_id:bd_id, number_of_chapters:number_of_chapters}, {withCredentials:true}).pipe(map(information=>{
      this.CookieService.delete('current_bd_serie_id','/');
      this.CookieService.delete('name_cover_bd','/');
      return this.Subscribing_service.validate_content("comics","serie",bd_id,number_of_chapters).subscribe(l=>{
        return l
      });    
     }));
  }

  retrieve_bd_by_userid(user_id: number) {
    return this.httpClient.get(`routes/retrieve_bd_serie_by_user_id/${user_id}`).pipe(map(information=>{
      return information;   
    }));  
  }

  retrieve_bd_by_id(user_id: number) {
    return this.httpClient.get(`routes/retrieve_bd_serie_by_id/${user_id}`).pipe(map(information=>{
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
        console.log(information);
        return [information,bd_page];   
    }));
  }



  retrieve_thumbnail_picture(file_name:string) {
    return this.httpClient.get(`routes/retrieve_thumbnail_bd_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  


  
}
