import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { Subscribing_service } from './subscribing.service';


@Injectable({
  providedIn: 'root'
})


export class NotationService {


  constructor(
    private httpClient: HttpClient,
    ) {}
    add_commentary(category:string, format:string, style:string, publication_id:number,chapter_number:number,commentary:string){
      return this.httpClient.post('http://localhost:4600/routes/add_commentary',{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,commentary:commentary}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    edit_commentary(commentary:string,id:number){
      return this.httpClient.post('http://localhost:4600/routes/edit_commentary',{commentary:commentary,id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    modify_commentary(category:string, format:string, style:string, publication_id:number,chapter_number:number,commentary:string){
      return this.httpClient.post('http://localhost:4600/routes/modify_commentary',{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,commentary:commentary}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    
    get_commentaries(category, format, style, publication_id,chapter_number){
      return this.httpClient.get(`http://localhost:4600/routes/get_commentaries/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_my_commentaries(category, format, style, publication_id,chapter_number){
      return this.httpClient.get(`http://localhost:4600/routes/get_my_commentaries/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    remove_commentary(category, format, style, publication_id,chapter_number,comment_id){
      return this.httpClient.delete(`http://localhost:4600/routes/remove_commentary/${category}/${format}/${style}/${publication_id}/${chapter_number}/${comment_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    remove_commentary_answer(category, format, style, publication_id,chapter_number,comment_anwser_id){
      return this.httpClient.delete(`http://localhost:4600/routes/remove_commentary_answer/${category}/${format}/${style}/${publication_id}/${chapter_number}/${comment_anwser_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
   
    add_like_on_commentary(category, format, style, publication_id,chapter_number,id){
     
      return this.httpClient.post('http://localhost:4600/routes/add_like_on_commentary' ,{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    };

    add_answer_on_commentary(category:string, format:string, style:string, publication_id:number,chapter_number:number,commentary:string,id){
  
      return this.httpClient.post('http://localhost:4600/routes/add_answer_on_commentary' ,{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,commentary:commentary,id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    };

    edit_answer_on_commentary(commentary:string,id:number){
  
      return this.httpClient.post('http://localhost:4600/routes/edit_answer_on_commentary' ,{commentary:commentary,id:id}).pipe(map((information)=>{
        return information;
      }));
    };

    remove_like_on_commentary(category, format, style, publication_id,chapter_number,id){
      return this.httpClient.post('http://localhost:4600/routes/remove_like_on_commentary' ,{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    get_commentary_information_by_id(id,category, format, style, publication_id,chapter_number){
      return this.httpClient.get(`http://localhost:4600/routes/get_commentary_information_by_id/${id}/${category}/${format}/${style}/${publication_id}/${chapter_number}`,{}).pipe(map((information)=>{
        return information;
      }));
    }

    get_commentary_likes_by_id(comment_id){
      return this.httpClient.get(`http://localhost:4600/routes/get_commentary_likes_by_id/${comment_id}`,{}).pipe(map((information)=>{
        return information;
      }));
    }
    get_commentary_answers_by_id(comment_id){
      return this.httpClient.get(`http://localhost:4600/routes/get_commentary_answers_by_id/${comment_id}`,{}).pipe(map((information)=>{
        return information;
      }));
    }

    get_commentary_answers_likes_by_id(comment_answer_id){
      return this.httpClient.get(`http://localhost:4600/routes/get_commentary_answers_likes_by_id/${comment_answer_id}`,{}).pipe(map((information)=>{
        return information;
      }));
    }

    add_like_on_commentary_answer(comment_answer_id:number){
      return this.httpClient.post('http://localhost:4600/routes/add_like_on_commentary_answer' ,{comment_answer_id:comment_answer_id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    remove_like_on_commentary_answer(comment_answer_id:number){
      return this.httpClient.delete(`http://localhost:4600/routes/remove_like_on_commentary_answer/${comment_answer_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    
  
    add_like(category, format, style, publication_id,chapter_number,firsttag,secondtag,thirdtag){
      return this.httpClient.post(`http://localhost:4600/routes/add_like/${category}/${format}/${style}/${publication_id}/${chapter_number}/${firsttag}/${secondtag}/${thirdtag}`,{}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    add_love(category, format, style, publication_id,chapter_number,firsttag,secondtag,thirdtag){
      return this.httpClient.post(`http://localhost:4600/routes/add_love/${category}/${format}/${style}/${publication_id}/${chapter_number}/${firsttag}/${secondtag}/${thirdtag}`,{}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    
    add_view(category, format, style, publication_id,chapter_number,firsttag,secondtag,thirdtag){
      return this.httpClient.post(`http://localhost:4600/routes/add_view/${category}/${format}/${style}/${publication_id}/${chapter_number}/${firsttag}/${secondtag}/${thirdtag}`,{}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    add_view_time(category, format, style, publication_id,chapter_number,view_time,createdAt_view){
      return this.httpClient.post('http://localhost:4600/routes/add_view_time',{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,view_time:view_time, createdAt_view:createdAt_view}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }


    remove_like(category, format, style, publication_id,chapter_number){
      return this.httpClient.delete(`http://localhost:4600/routes/remove_like/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    remove_love(category, format, style, publication_id,chapter_number){
      return this.httpClient.delete(`http://localhost:4600/routes/remove_love/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_likes(category, format, style, publication_id,chapter_number){
      
      return this.httpClient.get(`http://localhost:4600/routes/get_likes/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_loves(category, format, style, publication_id,chapter_number){
      
      return this.httpClient.get(`http://localhost:4600/routes/get_loves/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }


}
