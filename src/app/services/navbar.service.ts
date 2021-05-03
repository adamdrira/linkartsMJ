import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError,map} from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
@Injectable()
export class NavbarService {

   
    active_section: number=-1;
    height: number;//in px
    public visible: boolean=false;

    public visible_help: boolean=true;

    account: string;
    component_visible=false;
    using_chat=false;
    show_font=false;
    connexion_status=true;

    private notificationSubject: BehaviorSubject<object>;
    public notification: Observable<object>;

    private connexionSubject: BehaviorSubject<boolean>;
    public connexion: Observable<boolean>;

    private visibilitySubject: BehaviorSubject<boolean>;
    public visibility_observer: Observable<boolean>;

    private visibilityHelp: BehaviorSubject<boolean>;
    public visibility_observer_help: Observable<boolean>;

    private visibilitySubjectFont: BehaviorSubject<boolean>;
    public visibility_observer_font: Observable<boolean>;
    

    private chatSubject: BehaviorSubject<boolean>;
    public check_using_chat: Observable<boolean>;

    constructor(
        private httpClient: HttpClient,
    ) {
        this.notificationSubject = new BehaviorSubject<object>(null);
        this.notification = this.notificationSubject.asObservable();

        this.connexionSubject = new BehaviorSubject<boolean>(true);
        this.connexion = this.connexionSubject.asObservable();

        this.visibilitySubject = new BehaviorSubject<boolean>(false);
        this.visibility_observer = this.visibilitySubject.asObservable();

        this.visibilityHelp = new BehaviorSubject<boolean>(false);
        this.visibility_observer_help = this.visibilityHelp.asObservable();

        this.visibilitySubjectFont = new BehaviorSubject<boolean>(this.show_font);
        this.visibility_observer_font = this.visibilitySubjectFont.asObservable();

        this.chatSubject = new BehaviorSubject<boolean>(false);
        this.check_using_chat = this.chatSubject.asObservable();
    }

    setActiveSection(i: number) { this.active_section = i; }
    setHeight(i: number) { this.height=i;}
    set_component_visible(){this.component_visible=true;}
    get_component_visibility(){return this.component_visible}
    getHeight() { return this.height; }

    hide() { 
      this.visibilitySubject.next(false);
      this.visible = false; 
    }
    show() {
      this.visibilitySubject.next(true);
      this.visible = true;
    }

    show_help() {
      this.visibilityHelp.next(true);
      this.visible_help = true;
    }
    hide_help() {
      this.visibilityHelp.next(false);
      this.visible_help = false;
    }
    
    showfont(){
      this.show_font=true;
      this.visibilitySubjectFont.next(true);
    }
     
    set_account_type(account){this.account=account}
    getAccount(){ return this.account; }
    

    set_using_chat(){
      this.active_section=-1;
      this.using_chat=true;
      this.chatSubject.next( this.using_chat)
    }
    set_not_using_chat(){
      this.using_chat=false;
      this.chatSubject.next( this.using_chat)
    }
    get_using_chat(){ return this.using_chat}

    send_connextion_status(status){
      this.connexion_status=status;
      this.connexionSubject.next(status);
      
    }

    
    
    /********************************************* NOTIFICATIONS **************************************/
    /********************************************* NOTIFICATIONS **************************************/
    /********************************************* NOTIFICATIONS **************************************/

    add_notification_from_chat(object){
      this.notificationSubject.next(object);
    }
    

    /********************************************* SEARCHBAR **************************************/
    /********************************************* SEARCHBAR **************************************/
    /********************************************* SEARCHBAR **************************************/
    /********************************************* SEARCHBAR **************************************/
    /********************************************* SEARCHBAR **************************************/
    /********************************************* SEARCHBAR **************************************/


    get_most_researched_navbar(category,compteur,status){
        return this.httpClient.get(`routes/get_most_researched_navbar/${category}/${status}`, {withCredentials:true}).pipe(map((information)=>{
          return [information,compteur];
        }));
      }

    get_last_researched_navbar(category,compteur){
      return this.httpClient.post(`routes/get_last_researched_navbar/${category}`, {withCredentials:true}).pipe(map((information)=>{
        return [information,compteur];
      }));
    }

    get_top_artists(category){
      return this.httpClient.get(`routes/get_top_artists/${category}`).pipe(map(information=>{
        return information;
      }));
    }


   

    get_history_recommendations():Observable<any>{
      return this.httpClient.post(`routes/get_history_recommendations`, {withCredentials:true}).pipe(map(information=>{
          return information;
        }));
    };
    
    check_if_contents_clicked(){
      return this.httpClient.post(`routes/check_if_contents_clicked`, {withCredentials:true}).pipe(map(information=>{
          return information;
        }));
    };

    get_specific_propositions_navbar(category,text,compteur){
        return this.httpClient.get(`routes/get_specific_propositions_navbar/${category}/${text}`, {withCredentials:true}).pipe(map((information)=>{
          return [information,compteur];
        }));
    }

    get_global_propositions_navbar(category,text,limit,compteur){
        return this.httpClient.get(`routes/get_global_propositions_navbar/${category}/${text}/${limit}`, {withCredentials:true}).pipe(map((information)=>{
          return [information,compteur];
        }));
    }

    get_global_tags_propositions_navbar(category,text,limit,compteur){
      return this.httpClient.get(`routes/get_global_tags_propositions_navbar/${category}/${text}/${limit}`, {withCredentials:true}).pipe(map((information)=>{
        return [information,compteur];
      }));
    }

    //gestion
    add_main_research_to_history(publication_category,format,target_id,research_string,research_string1,status,number_of_comics,number_of_drawings, number_of_writings,number_of_ads,style, firsttag,secondtag,thirdtag,user_status){
        return this.httpClient.post(`routes/add_main_research_to_history`,{research_string1:research_string1,publication_category:publication_category,format:format,target_id:target_id,research_string:research_string,status:status,number_of_comics:number_of_comics, number_of_drawings:number_of_drawings, number_of_writings:number_of_writings,number_of_ads:number_of_ads,firsttag:firsttag,secondtag:secondtag,thirdtag:thirdtag,style:style,user_status:user_status}, {withCredentials:true}).pipe(map((information)=>{
            return information;
        }));
    }

    delete_research_from_navbar(publication_category,format,target_id){
        return this.httpClient.post(`routes/delete_research_from_navbar`,{publication_category:publication_category,format:format,target_id:target_id}, {withCredentials:true}).pipe(map((information)=>{
          return information;
      }));
    }
    
    check_if_research_exists(publication_category,format,target_id,research_string,status){
      return this.httpClient.post(`routes/check_if_research_exists`,{publication_category:publication_category,format:format,target_id:target_id,research_string:research_string,status:status}, {withCredentials:true}).pipe(map((information)=>{
          return information;
      }));
    }

    delete_click_after_ressearch_from_history(text){
      return this.httpClient.delete(`routes/delete_click_after_ressearch_from_history/${text}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

    delete_publication_from_research(publication_category,format,target_id){
      return this.httpClient.delete(`routes/delete_publication_from_research/${publication_category}/${format}/${target_id}`, {withCredentials:true}).pipe(map((information)=>{
        return information;
      }));
    }

  //after research
  
  get_number_of_results_for_categories(text:string):Observable<any>{
    return this.httpClient.get(`routes/get_number_of_results_for_categories/${text}`, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  get_styles_and_tags(text:string):Observable<any>{
    return this.httpClient.get(`routes/get_styles_and_tags/${text}`, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  get_number_of_results_by_category_sg(category:string,first_filter:string,compteur):Observable<any>{
    return this.httpClient.get(`routes/get_number_of_results_by_category_sg/${category}/${first_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_results_by_category_sg1(category:string,first_filter:string,second_filter,compteur,type_of_target):Observable<any>{
    return this.httpClient.get(`routes/get_number_of_results_by_category_sg1/${category}/${first_filter}/${second_filter}/${type_of_target}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_results_by_category(category:string,text:string,compteur):Observable<any>{
    return this.httpClient.get(`routes/get_number_of_results_by_category/${category}/${text}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_results_by_category1(category:string,text:string,first_filter,compteur):Observable<any>{
    return this.httpClient.get(`routes/get_number_of_results_by_category1/${category}/${text}/${first_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_results_by_category2(category:string,text:string,second_filter,compteur,type_of_target):Observable<any>{
    return this.httpClient.get(`routes/get_number_of_results_by_category2/${category}/${text}/${second_filter}/${type_of_target}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }
  get_number_of_results_by_category3(category:string,text:string,first_filter,second_filter,compteur,type_of_target):Observable<any>{
    return this.httpClient.get(`routes/get_number_of_results_by_category3/${category}/${text}/${first_filter}/${second_filter}/${type_of_target}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_propositions_after_research_navbar_sg(category:string,first_filter:string,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`routes/get_propositions_after_research_navbar_sg/${category}/${first_filter}/${limit}/${offset}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_propositions_after_research_navbar_sg1(category:string,first_filter:string,second_filter,limit,offset,compteur:number,type_of_target):Observable<any>{
    return this.httpClient.get(`routes/get_propositions_after_research_navbar_sg1/${category}/${first_filter}/${second_filter}/${limit}/${offset}/${type_of_target}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_propositions_after_research_navbar(category:string,text:string,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`routes/get_propositions_after_research_navbar/${category}/${text}/${limit}/${offset}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_propositions_after_research_navbar1(category:string,first_filter,text:string,limit,offset,compteur:number):Observable<any>{
    return this.httpClient.get(`routes/get_propositions_after_research_navbar1/${category}/${text}/${limit}/${offset}/${first_filter}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }
  get_propositions_after_research_navbar2(category:string,second_filter,text:string,limit,offset,compteur:number,type_of_target):Observable<any>{
    return this.httpClient.get(`routes/get_propositions_after_research_navbar2/${category}/${text}/${limit}/${offset}/${second_filter}/${type_of_target}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }
  get_propositions_after_research_navbar3(category:string,first_filter,second_filter,text:string,limit,offset,compteur:number,type_of_target):Observable<any>{
    return this.httpClient.get(`routes/get_propositions_after_research_navbar3/${category}/${text}/${limit}/${offset}/${first_filter}/${second_filter}/${type_of_target}`, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }


  
  get_number_of_clicked(publication_category,target_id){
    return this.httpClient.post(`routes/get_number_of_clicked`,{publication_category:publication_category,target_id:target_id}, {withCredentials:true}).pipe(map((information)=>{
        return information;
    }));
  }



  get_number_of_clicked_on_ads(list_of_ads_ids,id_user){
    return this.httpClient.post(`routes/get_number_of_clicked_on_ads`,{list_of_ads_ids:list_of_ads_ids,id_user:id_user}, {withCredentials:true}).pipe(map((information)=>{
        return information;
    }));
  }
 
  get_number_of_viewers_by_profile(id_user,date_format,compteur){
    return this.httpClient.post('routes/get_number_of_viewers_by_profile',{id_user:id_user,date_format:date_format}, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_number_of_viewers_by_ad(target_id,id_user,date_format,compteur){
    return this.httpClient.post('routes/get_number_of_viewers_by_ad',{target_id:target_id,id_user:id_user,date_format:date_format}, {withCredentials:true}).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  get_last_100_viewers(id_user){
    return this.httpClient.post('routes/get_last_100_viewers',{id_user:id_user}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  get_last_100_account_viewers(id_user):Observable<any>{
    return this.httpClient.post('routes/get_last_100_account_viewers',{id_user:id_user}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  add_page_visited_to_history(page,device_info):Observable<any>{
    return this.httpClient.post('routes/add_page_visited_to_history',{page:page,device_info:device_info}, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }
}