import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})


export class NotationService {


  constructor(
    private httpClient: HttpClient,
    ) {}
    add_commentary(category:string, format:string, style:string, publication_id:number,chapter_number:number,commentary:string){
      return this.httpClient.post('routes/add_commentary',{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,commentary:commentary}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    edit_commentary(commentary:string,id:number){
      return this.httpClient.post('routes/edit_commentary',{commentary:commentary,id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    modify_commentary(category:string, format:string, style:string, publication_id:number,chapter_number:number,commentary:string){
      return this.httpClient.post('routes/modify_commentary',{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,commentary:commentary}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    
    get_commentaries(category, format, publication_id,chapter_number){
      return this.httpClient.get(`routes/get_commentaries/${category}/${format}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_my_commentaries(category, format, publication_id,chapter_number){
      return this.httpClient.get(`routes/get_my_commentaries/${category}/${format}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    remove_commentary(category, format, style, publication_id,chapter_number,comment_id){
      return this.httpClient.delete(`routes/remove_commentary/${category}/${format}/${style}/${publication_id}/${chapter_number}/${comment_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    remove_commentary_answer(category, format, style, publication_id,chapter_number,comment_anwser_id){
      return this.httpClient.delete(`routes/remove_commentary_answer/${category}/${format}/${style}/${publication_id}/${chapter_number}/${comment_anwser_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
   
    add_like_on_commentary(category, format, style, publication_id,chapter_number,id){
     
      return this.httpClient.post('routes/add_like_on_commentary' ,{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    };

    add_answer_on_commentary(category:string, format:string, style:string, publication_id:number,chapter_number:number,commentary:string,id){
  
      return this.httpClient.post('routes/add_answer_on_commentary' ,{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,commentary:commentary,id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    };

    edit_answer_on_commentary(commentary:string,id:number){
  
      return this.httpClient.post('routes/edit_answer_on_commentary' ,{commentary:commentary,id:id}).pipe(map((information)=>{
        return information;
      }));
    };

    remove_like_on_commentary(category, format, style, publication_id,chapter_number,id){
      return this.httpClient.post('routes/remove_like_on_commentary' ,{category:category,format:format,style:style,publication_id:publication_id,chapter_number:chapter_number,id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    get_commentary_information_by_id(id,category, format, style, publication_id,chapter_number){
      return this.httpClient.get(`routes/get_commentary_information_by_id/${id}/${category}/${format}/${style}/${publication_id}/${chapter_number}`,{}).pipe(map((information)=>{
        return information;
      }));
    }

    get_commentary_likes_by_id(comment_id){
      return this.httpClient.get(`routes/get_commentary_likes_by_id/${comment_id}`,{}).pipe(map((information)=>{
        return information;
      }));
    }
    get_commentary_answers_by_id(comment_id){
      return this.httpClient.get(`routes/get_commentary_answers_by_id/${comment_id}`,{}).pipe(map((information)=>{
        return information;
      }));
    }

    get_commentary_answers_likes_by_id(comment_answer_id){
      return this.httpClient.get(`routes/get_commentary_answers_likes_by_id/${comment_answer_id}`,{}).pipe(map((information)=>{
        return information;
      }));
    }

    add_like_on_commentary_answer(comment_answer_id:number){
      return this.httpClient.post('routes/add_like_on_commentary_answer' ,{comment_answer_id:comment_answer_id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    remove_like_on_commentary_answer(comment_answer_id:number){
      return this.httpClient.delete(`routes/remove_like_on_commentary_answer/${comment_answer_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
    
  
    add_like(category, format, style, publication_id,chapter_number,firsttag,secondtag,thirdtag,author_id_liked){
      return this.httpClient.post(`routes/add_like/${category}/${format}/${style}/${publication_id}/${chapter_number}/${firsttag}/${secondtag}/${thirdtag}/${author_id_liked}`,{}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    add_love(category, format, style, publication_id,chapter_number,firsttag,secondtag,thirdtag,author_id_loved){
      return this.httpClient.post(`routes/add_love/${category}/${format}/${style}/${publication_id}/${chapter_number}/${firsttag}/${secondtag}/${thirdtag}/${author_id_loved}`,{}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    
    add_view(category, format, style, publication_id,chapter_number,firsttag,secondtag,thirdtag,author_id_viewed){
      return this.httpClient.post(`routes/add_view/${category}/${format}/${style}/${publication_id}/${chapter_number}/${firsttag}/${secondtag}/${thirdtag}/${author_id_viewed}`,{}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    add_view_time(view_time,id_view_created){
      return this.httpClient.post('routes/add_view_time',{view_time:view_time, id_view_created:id_view_created}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }


    remove_like(category, format, style, publication_id,chapter_number){
      return this.httpClient.delete(`routes/remove_like/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    remove_love(category, format, style, publication_id,chapter_number){
      return this.httpClient.delete(`routes/remove_love/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_likes(category, format, style, publication_id,chapter_number){
      
      return this.httpClient.get(`routes/get_likes/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_loves(category, format, style, publication_id,chapter_number){
      return this.httpClient.get(`routes/get_loves/${category}/${format}/${style}/${publication_id}/${chapter_number}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_number_of_likes_by_comment(comment_id){
      return this.httpClient.get(`routes/get_number_of_likes_by_comment/${comment_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_content_marks(category, format, publication_id,chapter_number){
      
      return this.httpClient.post(`routes/get_content_marks`, {category:category,format:format,publication_id:publication_id,chapter_number:chapter_number},{withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }


    get_number_of_ads_comments(list_of_ads_ids){
      return this.httpClient.post('routes/get_number_of_ads_comments',{list_of_ads_ids:list_of_ads_ids}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    get_number_of_notations(list_of_ids,publication_category,format){
      return this.httpClient.post('routes/get_number_of_notations',{list_of_ids:list_of_ids,publication_category:publication_category,format:format}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }


    get_notations_for_a_content(publication_id,publication_category,format,date_format,compteur){
      return this.httpClient.post('routes/get_notations_for_a_content',{publication_id:publication_id,publication_category:publication_category,format:format,date_format:date_format}, {withCredentials:true}).pipe(map((information)=>{
        return [information,compteur];
      }));
    }
    

    update_marks(id){
      return this.httpClient.post('routes/update_marks',{id:id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }
}
