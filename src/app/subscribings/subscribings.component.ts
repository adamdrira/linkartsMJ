import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Writing_Upload_Service } from '../services/writing.service';

import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { ConstantsService } from '../services/constants.service';

declare var $: any

@Component({
  selector: 'app-subscribings',
  templateUrl: './subscribings.component.html',
  styleUrls: ['./subscribings.component.scss']
})
export class SubscribingsComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private _constants: ConstantsService,
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private Subscribing_service:Subscribing_service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,

    ) { }

  subcategory: number = 0; 
  user_id:number=0;

  list_of_users:any[]=[];
  list_of_contents:any[]=[];
  list_of_contents_sorted:boolean=false;
  show_more:boolean=false;

  list_of_new_users:any[]=[];
  list_of_new_contents:any[]=[];
  list_of_new_contents_sorted:boolean=false;

  now_in_seconds:number;
  last_timestamp:string;

  ngOnInit() {
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      this.get_all_users_subscribed_to_today(this.get_all_users_subscribed_to_before_today);
    });
  }

  sort_list_of_contents(list,period,callback){
    if(list.length>1){
      for (let i=1; i<list.length; i++){
        let time = this.convert_timestamp_to_number(list[i].createdAt);
        for (let j=0; j<i;j++){
          if(time > this.convert_timestamp_to_number(list[j].createdAt)){
            list.splice(j, 0, list.splice(i, 1)[0]);
            
          }
          if(j==list.length -2 && period=='old'){
            this.list_of_contents_sorted=true;
            this.last_timestamp=list[list.length-1].createdAt;
          }
          if(j==list.length -2 && period=='new'){
            this.list_of_new_contents_sorted=true;
            callback(this);
          }
        }
      }
    }
    else{
      if(period=='old'){
        this.list_of_contents_sorted=true;
        this.last_timestamp=list[0].createdAt;
      }
      if(period=='new'){
        this.list_of_new_contents_sorted=true;
        callback(this);
      }

    }

  }

  


  convert_timestamp_to_number(timestamp){
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number;
  }

  get_all_users_subscribed_to_before_today(THIS){
    THIS.Subscribing_service.get_all_users_subscribed_to_before_today(THIS.user_id).subscribe(info=>{
      for (let i=0; i< info[0].length;i++){         
        THIS.list_of_users.push(info[0][i].id_user_subscribed_to);         
        if(i==info[0].length-1 && THIS.list_of_users.length>0){
          THIS.Subscribing_service.get_all_subscribings_contents(THIS.list_of_users).subscribe(r=>{          
            for (let j=0; j< r[0].length;j++){
              if(r[0][j].publication_category=="comics"){
                if(r[0][j].format=="one-shot"){
                  THIS.BdOneShotService.retrieve_bd_by_id(r[0][j].publication_id).subscribe(info=>{
                    if(info[0].status="public"){
                      THIS.list_of_contents.push(info[0]);
                      if(THIS.list_of_contents.length == r[0].length){
                        THIS.sort_list_of_contents(THIS.list_of_contents,'old',()=>{});
                      }
                    }
                  })
                }
                if(r[0][j].format=="serie"){
                  THIS.BdSerieService.retrieve_bd_by_id(r[0][j].publication_id).subscribe(info=>{
                    if(info[0].status="public"){
                      THIS.list_of_contents.push(info[0]);
                      if(THIS.list_of_contents.length == r[0].length){
                        THIS.sort_list_of_contents(THIS.list_of_contents,'old',()=>{});
                      }
                    }
                  })
                }
              }

              if(r[0][j].publication_category=="drawing"){
                if(r[0][j].format=="one-shot"){
                  THIS.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][j].publication_id).subscribe(info=>{
                    if(info[0].status="public"){
                      THIS.list_of_contents.push(info[0]);
                      if(THIS.list_of_contents.length == r[0].length){
                        THIS.sort_list_of_contents(THIS.list_of_contents,'old',()=>{});
                      }
                    }
                  })
                }
                if(r[0][j].format=="artbook"){
                  THIS.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][j].publication_id).subscribe(info=>{
                    if(info[0].status="public"){
                      THIS.list_of_contents.push(info[0]);
                      if(THIS.list_of_contents.length == r[0].length){
                        THIS.sort_list_of_contents(THIS.list_of_contents,'old',()=>{});
                      }
                    }
                  })
                }
              }

              if(r[0][j].publication_category=="writing"){
                THIS.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][j].publication_id).subscribe(info=>{
                  if(info[0].status="public"){
                    THIS.list_of_contents.push(info[0]);
                    if(THIS.list_of_contents.length == r[0].length){
                      THIS.sort_list_of_contents(THIS.list_of_contents,'old',()=>{});
                    }
                }
                  })
              }           
            }

          });
        }
      }
      
    })
  }

  get_all_users_subscribed_to_today(callback){
    this.Subscribing_service.get_all_users_subscribed_to_today(this.user_id).subscribe(info=>{
      if(info[0].length>0){
        for (let i=0; i< info[0].length;i++){         
          this.list_of_new_users.push(info[0][i].id_user_subscribed_to);        
          if(i==info[0].length-1){
            for (let k=0;k<this.list_of_new_users.length;k++){
              this.Subscribing_service.get_last_contents_of_a_subscribing(this.list_of_new_users[k])
                .subscribe(r=>{
                  let new_contents=[];
                  if(r[0].length>0){
                    for (let j=0; j< r[0].length;j++){                  
                      if(r[0][j].publication_category=="comics"){
                        if(r[0][j].format=="one-shot"){
                          this.BdOneShotService.retrieve_bd_by_id(r[0][j].publication_id).subscribe(info=>{
                            new_contents.push(info[0]);
                            if(new_contents.length == r[0].length){
                              this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                              if(k==this.list_of_new_users.length-1){
                                console.log(this.list_of_new_contents);
                                this.sort_list_of_contents(this.list_of_new_contents,'new',callback);
                              }
                            }
                          })
                        }
                        if(r[0][j].format=="serie"){
                          this.BdSerieService.retrieve_bd_by_id(r[0][j].publication_id).subscribe(info=>{
                            new_contents.push(info[0]);                         
                            if(new_contents.length  == r[0].length){
                              this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                              if(k==this.list_of_new_users.length-1){
                                this.sort_list_of_contents(this.list_of_new_contents,'new',callback);
                              }
                            }
                          })
                        }
                      }
      
                      if(r[0][j].publication_category=="drawing"){
                        if(r[0][j].format=="one-shot"){
                          this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][j].publication_id).subscribe(info=>{
                            new_contents.push(info[0]);
                            if(new_contents.length  == r[0].length){
                              this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                              if(k==this.list_of_new_users.length-1){
                                this.sort_list_of_contents(this.list_of_new_contents,'new',callback);
                              }
                            }
                          })
                        }
                        if(r[0][j].format=="artbook"){
                          this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][j].publication_id).subscribe(info=>{
                            new_contents.push(info[0]);
                            if(new_contents.length  == r[0].length){
                              this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                              if(k==this.list_of_new_users.length-1){
                                this.sort_list_of_contents(this.list_of_new_contents,'new',callback);
                              }
                            }
                          })
                        }
                      }
      
                      if(r[0][j].publication_category=="writing"){
                          this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][j].publication_id).subscribe(info=>{
                            new_contents.push(info[0]);
                            if(new_contents.length == r[0].length){
                              this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                              if(k==this.list_of_new_users.length-1){
                                this.sort_list_of_contents(this.list_of_new_contents,'new',callback);
                              }
                            }
                          })
                      }           
                    }
                  }
                  else{
                    callback(this);
                  }
                })
            }


          }        
        }
        
      }
      else{
        callback(this);
      }
    })
  }
 


  see_more(){
    this.show_more=true;
  }

}