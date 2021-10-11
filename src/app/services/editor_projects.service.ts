import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { map} from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})


export class Edtior_Projects {

    // URL to web api
  constructor(private http: HttpClient, private CookieService: CookieService,) {
    http.options
  }
  

  submit_project_for_editor(data){
    return this.http.post('routes/submit_project_for_editor',data,{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  submit_response_for_artist(data){
    return this.http.post('routes/submit_response_for_artist',data,{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  set_payement_done_for_project(id_project,multiple){
    return this.http.post('routes/set_payement_done_for_project',{id_project:id_project,multiple:multiple},{withCredentials:true} ).pipe(map((information)=>{
        return information;
      }));
  }

  check_if_payement_done(id_project,password,is_multiple){
    return this.http.post('routes/check_if_payement_done',{id_project:id_project,password:password,is_multiple:is_multiple},{withCredentials:true} ).pipe(map((information)=>{
        return information;
      }));
  }

  get_last_emitted_project(visitor_id,user_id){
    return this.http.get(`routes/get_last_emitted_project/${visitor_id}/${user_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }

  get_all_last_emitted_project(visitor_id){
    return this.http.get(`routes/get_all_last_emitted_project/${visitor_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }

  get_project_response(project_id){
    return this.http.get(`routes/get_project_response/${project_id}`, {withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
  }
  
  get_sorted_applications(target,author,category,genres,sort_formula,sort_time,sort_pertinence,responded,offset_applications,compteur_applications){
    return this.http.post('routes/get_sorted_applications',{target:target,author:author,category:category,genres:genres,sort_formula:sort_formula,sort_time:sort_time,sort_pertinence:sort_pertinence,offset_applications:offset_applications,compteur_applications:compteur_applications,responded:responded},{withCredentials:true} ).pipe(map((information)=>{
      return [information,compteur_applications];  
    }));
  }


  set_project_read(id_project){
    return this.http.post('routes/set_project_read',{id_project:id_project},{withCredentials:true} ).pipe(map((information)=>{
      return information;  
    }));
  }
  
  get_editor_cover(file_name){
    return this.http.get(`routes/get_editor_cover/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  get_editor_pp(file_name){
    return this.http.get(`routes/get_editor_pp/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }

  retrieve_project_by_name(file_name){
    return this.http.get(`routes/retrieve_project_by_name/${file_name}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
  }


  get_all_editors_gains(date_format,compteur){
    return this.http.post('routes/get_all_editors_gains',{date_format:date_format},{withCredentials:true}).pipe(map((information)=>{
        return [information,compteur];
      }));
  }

  get_total_editors_gains(){
    return this.http.post('routes/get_total_editors_gains',{}, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
  }

  get_projects_stats(type_of_account,date_format,compteur){
    return this.http.post('routes/get_projects_stats', {type_of_account: type_of_account,date_format}, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_projects_submited(id_user){
    return this.http.get(`routes/get_number_of_projects_submited/${id_user}`).pipe(map(information=>{
      return information;   
    }));
  }

}