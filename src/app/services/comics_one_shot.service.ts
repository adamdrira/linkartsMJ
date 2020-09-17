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


export class BdOneShotService {

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  constructor(
    private httpClient: HttpClient,
    private CookieService: CookieService,
    private Subscribing_service:Subscribing_service
    ) {}
  
   //création ligne dans table "list-bd_oneshot" après étape 1 formulaire
  CreateBdOneShot(Title, Category, Tags:String[], highlight, monetization){
    return this.httpClient.post('routes/add_bd_oneshot', {Title: Title, Category:Category, Tags:Tags, highlight:highlight, monetization:monetization}, {withCredentials:true}).pipe(map((information)=>{
        this.CookieService.delete('current_bd_oneshot_id','/');
        this.CookieService.delete('current_bd_serie_id','/');
        this.CookieService.set('current_bd_oneshot_id', information[0].bd_id, undefined, '/','localhost',undefined,'Lax');
        this.Subscribing_service.add_content('comics', 'one-shot', information[0].bd_id,0).subscribe(r=>{})
        return information[0].bd_id;
    }));
  }

  RemoveBdOneshot(bd_id) {
    if(bd_id==0){
      console.log("ca vaut 0");
      bd_id=this.CookieService.get('current_bd_oneshot_id');
    }
    return this.httpClient.delete(`routes/remove_bd_oneshot/${bd_id}`, {withCredentials:true}).pipe(map(information=>{
        this.Subscribing_service.remove_content('comics', 'one-shot', bd_id,0).subscribe(r=>{
          return information;
        });
    }));
  }

  get_bdid_cookies(){
   return this.CookieService.get('current_bd_oneshot_id');
  }

  ModifyBdOneShot(Title, Category, Tags:String[], highlight, monetization){
    let bd_id = this.CookieService.get('current_bd_oneshot_id')
    return this.httpClient.post('routes/modify_bd_oneshot', {Title: Title, Category:Category, Tags:Tags, bd_id:bd_id, highlight:highlight, monetization:monetization}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  ModifyBdOneShot2(bd_id,Title, Category, Tags:String[], highlight){
    return this.httpClient.post('routes/modify_bd_oneshot2', {Title: Title, Category:Category, Tags:Tags, bd_id:bd_id, highlight:highlight}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  change_oneshot_comic_status(bd_id,status){
    return this.httpClient.post('routes/change_oneshot_comic_status', {status: status, bd_id:bd_id,  }, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_private_oneshot_bd(){
    return this.httpClient.get('routes/retrieve_private_oneshot_bd', {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }



   //remove the page from postgresql
   remove_page_from_sql(page:number){
    let bd_id = this.CookieService.get('current_bd_oneshot_id')
    this.CookieService.delete('current_bd_oneshot_id','/');
    return this.httpClient.delete(`routes/remove_page_from_data/${page}/${bd_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };
   
  

   //remove the page file from the folder associated
   remove_page_from_folder(filename) {
    return this.httpClient.delete(`routes/remove_page_from_folder/${filename}`, {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
   };

   validate_bd(page_number){
    let bd_id = this.CookieService.get('current_bd_oneshot_id')
    return this.httpClient.post('routes/validation_upload_bd_oneshot/',{bd_id:bd_id, page_number:page_number},{withCredentials:true}).pipe(map(information=>{
      this.CookieService.delete('current_bd_oneshot_id','/');
      this.CookieService.delete('name_cover_bd','/');
      return this.Subscribing_service.validate_content("comics","one-shot",bd_id,0).subscribe(l=>{
        return l
      }); 
     }));
    }

    retrieve_bd_by_userid(user_id: number) {
      return this.httpClient.get(`routes/retrieve_bd_by_user_id/${user_id}`).pipe(map(information=>{
        return information;   
      }));
    }

    retrieve_bd_by_id(bd_id: number) {
      return this.httpClient.get(`routes/retrieve_bd_by_id/${bd_id}`).pipe(map(information=>{
        return information;   
      }));
      
    }

    retrieve_bd_page(bd_id,bd_page){
      return this.httpClient.get(`routes/retrieve_bd_oneshot_page/${bd_id}/${bd_page}`,{responseType:'blob'}).pipe(map(information=>{
         return [information,bd_page];   
      }));
    }


    retrieve_thumbnail_picture(file_name:string) {
      return this.httpClient.get(`routes/retrieve_thumbnail_bd_picture/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
        return information;   
      }));
    }

  
}
