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

  generate_recommendations(){
    return this.httpClient.post('routes/generate_recommendations', {}, {withCredentials:true}).pipe(map((information)=>{ 
      this.CookieService.set('recommendations', JSON.stringify(information), 365*10, '/','linkarts.fr',undefined,'Lax');
      return information;
      }));
  }

  delete_recommendations_cookies(){
    this.CookieService.delete('recommendations','/');
  }

  see_more_recommendations_bd(style){
    return this.httpClient.post(`routes/see_more_recommendations_bd`, {style:style}, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };

  see_more_recommendations_writings(style){
    return this.httpClient.post(`routes/see_more_recommendations_writings`, {style:style}, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };

  see_more_recommendations_drawings(style){
    return this.httpClient.post(`routes/see_more_recommendations_drawings`, {style:style}, {withCredentials:true}).pipe(map(information=>{
        return information;
      }));
  };




  send_rankings(){
    return this.httpClient.post('routes/send_rankings', {},).pipe(map((information)=>{
      return information;
      }));
  }


 sorted_favourite_type_list(){
  return this.httpClient.get('python/sorted_favourite_type_list', {withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};



get_first_recommendation_bd_os_for_user(index_bd){
  return this.httpClient.post('routes/get_first_recommendation_bd_os_for_user', {index_bd:index_bd},{withCredentials:true}).pipe(map(information=>{  
    return information;
    }));
};
get_first_recommendation_bd_serie_for_user(index_bd){
  return this.httpClient.post('routes/get_first_recommendation_bd_serie_for_user', {index_bd:index_bd},{withCredentials:true}).pipe(map(information=>{
    return information;
    }));
};
get_first_recommendation_drawing_os_for_user(index_drawing){
  return this.httpClient.post('routes/get_first_recommendation_drawing_os_for_user',{index_drawing:index_drawing},{withCredentials:true}).pipe(map(information=>{
    
    return information;
    }));
};
get_first_recommendation_drawing_artbook_for_user(index_drawing){
  
  return this.httpClient.post('routes/get_first_recommendation_drawing_artbook_for_user', {index_drawing:index_drawing},{withCredentials:true}).pipe(map(information=>{
     
    return information;
    }));
};
get_first_recommendation_writings_for_user(index_writing){
  return this.httpClient.post('routes/get_first_recommendation_writings_for_user', {index_writing:index_writing},{withCredentials:true}).pipe(map(information=>{
      return information;
    }));
};

complete_recommendation_by_category(number,style:string,category){
  return this.httpClient.post('routes/complete_recommendation_by_category', {number:number,style:style,category:category},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
};

get_comics_recommendations_by_author(id_user,publication_id){
  return this.httpClient.post('routes/get_comics_recommendations_by_author', {id_user:id_user,publication_id:publication_id},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}

get_drawings_recommendations_by_author(id_user,publication_id){
  return this.httpClient.post('routes/get_drawings_recommendations_by_author', {id_user:id_user,publication_id:publication_id},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}

get_writings_recommendations_by_author(id_user,publication_id){
  return this.httpClient.post('routes/get_writings_recommendations_by_author', {id_user:id_user,publication_id:publication_id},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}

get_recommendations_by_tag(id_user,publication_category,publication_id,format,style,firsttag){
  return this.httpClient.post('routes/get_recommendations_by_tag', {id_user:id_user,publication_id:publication_id,format:format,publication_category:publication_category,style:style,firsttag:firsttag},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}

get_artwork_recommendations_by_tag(category,format,target_id,first_filter,second_filter,limit){
  return this.httpClient.post('routes/get_artwork_recommendations_by_tag', {category:category,format:format,target_id:target_id,first_filter:first_filter,second_filter:second_filter,limit:limit},{withCredentials:true}).pipe(map(information=>{
     return information;
    }));
}
 
 




  


  
}
