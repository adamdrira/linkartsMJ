import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError,map} from 'rxjs/operators';
@Injectable()
export class NavbarService {

    active_section: number;
    height: number;//in px
    visible: boolean;
    account: string;
    constructor(
        private httpClient: HttpClient,
    ) {
        this.visible=false;
    }

    setActiveSection(i: number) { this.active_section = i; }
    setHeight(i: number) { this.height=i; }
    getHeight() { return this.height; }
    hide() { this.visible = false; }
    show() { this.visible = true; }
    set_account_type(account){this.account=account}
    getAccount(){ return this.account; }


    

    get_most_researched_main_propositions(){
        return this.httpClient.get('http://localhost:4600/routes/get_most_researched_main_propositions', {withCredentials:true}).pipe(map((information)=>{
          return information;
        }));
      }

    add_main_research_to_history(publication_category,format,target_id,research_string){
        return this.httpClient.post(`http://localhost:4600/routes/add_main_research_to_history`,{publication_category:publication_category,format:format,target_id:target_id,research_string:research_string}, {withCredentials:true}).pipe(map((information)=>{
            return information;
        }));
        }

   


}