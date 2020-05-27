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


export class Community_recommendation {


  constructor(private httpClient: HttpClient, private CookieService: CookieService) {
    httpClient.options
  }

  send_list_view_to_python(){
    return this.httpClient.post('http://localhost:4600/routes/view_table_by_author_to_python', {}, {withCredentials:true}).pipe(map((information)=>{
      return parseInt(information[0].length);
      }));
  }

  see_more_recommendations_bd(style){
    return this.httpClient.post(`http://localhost:4600/routes/see_more_recommendations_bd`, {style:style}, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };

  see_more_recommendations_writings(style){
    return this.httpClient.post(`http://localhost:4600/routes/see_more_recommendations_writings`, {style:style}, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };

  see_more_recommendations_drawings(style){
    return this.httpClient.post(`http://localhost:4600/routes/see_more_recommendations_drawings`, {style:style}, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };




  send_rankings(){
    return this.httpClient.post('http://localhost:4600/routes/send_rankings', {},).pipe(map((information)=>{
      return information;
      }));
  }

  sorted_category_list(){
   return this.httpClient.get('http://localhost:4600/python/sorted_category_list', {withCredentials:true}).pipe(map(information=>{
       return information;
     }));
 };

 sorted_favourite_type_list(){
  return this.httpClient.get('http://localhost:4600/python/sorted_favourite_type_list', {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};

get_first_recommendation_bd_os_for_user(index_bd,index_drawing,index_writing){
  return this.httpClient.post('http://localhost:4600/routes/get_first_recommendation_bd_os_for_user', {index_bd:index_bd,index_drawing:index_drawing,index_writing:index_writing},{withCredentials:true}).pipe(map(information=>{  
    return information;
    }));
};
get_first_recommendation_bd_serie_for_user(index_bd,index_drawing,index_writing){
  return this.httpClient.post('http://localhost:4600/routes/get_first_recommendation_bd_serie_for_user', {index_bd:index_bd,index_drawing:index_drawing,index_writing:index_writing},{withCredentials:true}).pipe(map(information=>{

    return information;
    }));
};
get_first_recommendation_drawing_os_for_user(index_bd,index_drawing,index_writing){
  return this.httpClient.post('http://localhost:4600/routes/get_first_recommendation_drawing_os_for_user', {index_bd:index_bd,index_drawing:index_drawing,index_writing:index_writing},{withCredentials:true}).pipe(map(information=>{
    
    return information;
    }));
};
get_first_recommendation_drawing_artbook_for_user(index_bd,index_drawing,index_writing){
  
  return this.httpClient.post('http://localhost:4600/routes/get_first_recommendation_drawing_artbook_for_user', {index_bd:index_bd,index_drawing:index_drawing,index_writing:index_writing},{withCredentials:true}).pipe(map(information=>{
     
    return information;
    }));
};
get_first_recommendation_writings_for_user(index_bd,index_drawing,index_writing){
  return this.httpClient.post('http://localhost:4600/routes/get_first_recommendation_writings_for_user', {index_bd:index_bd,index_drawing:index_drawing,index_writing:index_writing},{withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};

complete_recommendation_by_category(number,style:string,category){
  return this.httpClient.post('http://localhost:4600/routes/complete_recommendation_by_category', {number:number,style:style,category:category},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
};

get_comics_recommendations_by_author(id_user,publication_id,format){
  return this.httpClient.post('http://localhost:4600/routes/get_comics_recommendations_by_author', {id_user:id_user,publication_id:publication_id,format:format},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}

get_drawings_recommendations_by_author(id_user,publication_id,format){
  return this.httpClient.post('http://localhost:4600/routes/get_drawings_recommendations_by_author', {id_user:id_user,publication_id:publication_id,format:format},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}

get_writings_recommendations_by_author(id_user,publication_id,format){
  return this.httpClient.post('http://localhost:4600/routes/get_writings_recommendations_by_author', {id_user:id_user,publication_id:publication_id,format:format},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}

get_recommendations_by_tag(id_user,publication_category,publication_id,format,style,firsttag){
  return this.httpClient.post('http://localhost:4600/routes/get_recommendations_by_tag', {id_user:id_user,publication_id:publication_id,format:format,publication_category:publication_category,style:style,firsttag:firsttag},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}
 
 




  


  
}
