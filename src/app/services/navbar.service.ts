import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError,map} from 'rxjs/operators';
import { Observable } from 'rxjs';
@Injectable()
export class NavbarService {

    active_section: number;
    height: number;//in px
    visible: boolean;
    account: string;
    component_visible=false;
    constructor(
        private httpClient: HttpClient,
    ) {
        this.visible=false;
    }

    setActiveSection(i: number) { this.active_section = i; }
    setHeight(i: number) { this.height=i; }
    set_component_visible(){this.component_visible=true;}
    get_component_visibility(){return this.component_visible}
    getHeight() { return this.height; }
    hide() { this.visible = false; }
    show() { this.visible = true; }
    set_account_type(account){this.account=account}
    getAccount(){ return this.account; }


    

    get_most_researched_navbar(category,compteur,status){
      console.log(compteur);
      console.log(status)
        return this.httpClient.get(`http://localhost:4600/routes/get_most_researched_navbar/${category}/${status}`, {withCredentials:true}).pipe(map((information)=>{
          return [information,compteur];
        }));
      }

    get_last_researched_navbar(category,compteur){
      return this.httpClient.get(`http://localhost:4600/routes/get_last_researched_navbar/${category}`, {withCredentials:true}).pipe(map((information)=>{
        return [information,compteur];
      }));
    }

    

    /*get_main_searchbar_propositions(text,compteur){
        return this.httpClient.get(`http://localhost:4600/routes/get_main_searchbar_propositions/${text}`, {withCredentials:true}).pipe(map((information)=>{
          return [information,compteur];
        }));
    }

    get_most_researched_main_propositions_gen(text,limit,compteur){
        return this.httpClient.get(`http://localhost:4600/routes/get_most_researched_main_propositions_gen/${text}/${limit}`, {withCredentials:true}).pipe(map((information)=>{
          return [information,compteur];
        }));
    }


    get_main_searchbar_ideas(category,text,compteur){
      return this.httpClient.get(`http://localhost:4600/routes/get_main_searchbar_ideas/${category}/${text}`, {withCredentials:true}).pipe(map((information)=>{
        return [information,compteur];
      }));
    }*/

    get_specific_propositions_navbar(category,text,compteur){
        return this.httpClient.get(`http://localhost:4600/routes/get_specific_propositions_navbar/${category}/${text}`, {withCredentials:true}).pipe(map((information)=>{
          return [information,compteur];
        }));
    }

    get_global_propositions_navbar(category,text,limit,compteur){
        return this.httpClient.get(`http://localhost:4600/routes/get_global_propositions_navbar/${category}/${text}/${limit}`, {withCredentials:true}).pipe(map((information)=>{
          return [information,compteur];
        }));
    }

    get_global_tags_propositions_navbar(category,text,limit,compteur){
      return this.httpClient.get(`http://localhost:4600/routes/get_global_tags_propositions_navbar/${category}/${text}/${limit}`, {withCredentials:true}).pipe(map((information)=>{
        return [information,compteur];
      }));
    }

    //gestion
    add_main_research_to_history(publication_category,format,target_id,research_string,status,number_of_comics,numbar_of_drawings, number_of_writings,style, firsttag,secondtag,thirdtag){
        return this.httpClient.post(`http://localhost:4600/routes/add_main_research_to_history`,{publication_category:publication_category,format:format,target_id:target_id,research_string:research_string,status:status,number_of_comics:number_of_comics, numbar_of_drawings:numbar_of_drawings, number_of_writings:number_of_writings,firsttag:firsttag,secondtag:secondtag,thirdtag:thirdtag,style:style}, {withCredentials:true}).pipe(map((information)=>{
            return information;
        }));
    }

    check_if_research_exists(publication_category,format,target_id,research_string,status){
      return this.httpClient.post(`http://localhost:4600/routes/check_if_research_exists`,{publication_category:publication_category,format:format,target_id:target_id,research_string:research_string,status:status}, {withCredentials:true}).pipe(map((information)=>{
          return information;
      }));
    }

    delete_click_after_ressearch_from_history(text){
      return this.httpClient.delete(`http://localhost:4600/routes/delete_click_after_ressearch_from_history/${text}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    delete_publication_from_research(publication_category,format,target_id){
      return this.httpClient.delete(`http://localhost:4600/routes/delete_publication_from_research/${publication_category}/${format}/${target_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

  //after research
  
  get_number_of_results_for_categories(text:string):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_number_of_results_for_categories/${text}`, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  get_number_of_results_by_category_sg(category:string,first_filter:string,compteur):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_number_of_results_by_category_sg/${category}/${first_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_results_by_category_sg1(category:string,first_filter:string,second_filter,compteur):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_number_of_results_by_category_sg1/${category}/${first_filter}/${second_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_results_by_category(category:string,text:string,compteur):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_number_of_results_by_category/${category}/${text}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_results_by_category1(category:string,text:string,first_filter,compteur):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_number_of_results_by_category1/${category}/${text}/${first_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_results_by_category2(category:string,text:string,second_filter,compteur):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_number_of_results_by_category2/${category}/${text}/${second_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }
  get_number_of_results_by_category3(category:string,text:string,first_filter,second_filter,compteur):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_number_of_results_by_category3/${category}/${text}/${first_filter}/${second_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_propositions_after_research_navbar_sg(category:string,first_filter:string,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_propositions_after_research_navbar_sg/${category}/${first_filter}/${limit}/${offset}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_propositions_after_research_navbar_sg1(category:string,first_filter:string,second_filter,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_propositions_after_research_navbar_sg1/${category}/${first_filter}/${second_filter}/${limit}/${offset}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_propositions_after_research_navbar(category:string,text:string,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_propositions_after_research_navbar/${category}/${text}/${limit}/${offset}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_propositions_after_research_navbar1(category:string,first_filter,text:string,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_propositions_after_research_navbar1/${category}/${text}/${limit}/${offset}/${first_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }
  get_propositions_after_research_navbar2(category:string,second_filter,text:string,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_propositions_after_research_navbar2/${category}/${text}/${limit}/${offset}/${second_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }
  get_propositions_after_research_navbar3(category:string,first_filter,second_filter,text:string,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_propositions_after_research_navbar3/${category}/${text}/${limit}/${offset}/${first_filter}/${second_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }
 

}