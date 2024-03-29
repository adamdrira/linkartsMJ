import { Component, OnInit,HostListener, ChangeDetectorRef, Input } from '@angular/core';

import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Ads_service } from '../services/ads.service';
import { Subscribing_service } from '../services/subscribing.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-subscribings',
  templateUrl: './subscribings.component.html',
  styleUrls: ['./subscribings.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class SubscribingsComponent implements OnInit {

  constructor(
    private Ads_service:Ads_service,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Subscribing_service:Subscribing_service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private cd:ChangeDetectorRef,
    private navbar: NavbarService,
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })

    }

  skeleton_array = Array(15);
  skeleton:boolean=true;
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
  can_show_more=true;
  last_timestamp:string;

  
  @Input() current_user:any;
  @Input() allow_sub:any;
  
  number_of_new_contents_to_show=10;
  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if(this.can_show_more && ((this.list_of_new_contents_sorted && this.list_of_new_contents.length>0) || (this.list_of_contents_sorted && this.list_of_contents.length>0))){
      let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
      let max = document.documentElement.scrollHeight;
      let sup=max*0.1;
      if(pos>= max - sup )   {
        if(this.list_of_users.length==0){
          this.list_of_users=this.list_of_new_users;
          this.last_timestamp=this.list_of_new_contents[this.list_of_new_contents.length-1].createdAt;
        }
        this.show_more=true;
        this.cd.detectChanges();
      }
    }
    if(this.list_of_new_contents_sorted && this.list_of_new_contents.length>0 && this.number_of_new_contents_to_show<this.list_of_new_contents.length){
     
      let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
      let max = document.documentElement.scrollHeight;
      let sup=max*0.1;
      if(pos>= max - sup )   {
        this.number_of_new_contents_to_show+=10;
        this.cd.detectChanges();
      }
    }
    
  }

 
 

  show_icon=false;
  ngOnInit() {
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.user_id = this.current_user[0].id;
    this.get_all_users_subscribed_to_today();
    this.get_all_users_subscribed_to_before_today()
  }

 
  show_more_managed(event){
    this.can_show_more=false;
  }

  get_all_users_subscribed_to_today(){
    this.Subscribing_service.get_all_users_subscribed_to_today(this.user_id).pipe( first()).subscribe(info=>{
      if(info[0].length>0){
        for (let i=0; i< info[0].length;i++){         
          this.list_of_new_users.push(info[0][i].id_user_subscribed_to);        
          if(i==info[0].length-1){
            let compteur_user=0;
            for (let k=0;k<this.list_of_new_users.length;k++){
              this.Subscribing_service.get_last_contents_of_a_subscribing(this.list_of_new_users[k]).pipe( first()).subscribe(r=>{
                  let new_contents=[];
                  if(r[0].length>0){
                    let compt=0;
                    //if(r[0].length>0){
                      for (let j=0; j< r[0].length;j++){                  
                        if(r[0][j].publication_category=="comic"){
                          if(r[0][j].format=="one-shot"){
                            this.BdOneShotService.retrieve_bd_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                              if(info[0] && info[0].status=="public"){
                                new_contents.push(info[0]);
                                compt++;
                              }
                              else{
                                compt++;
                              }
                              if(compt == r[0].length){
                                compteur_user++;
                                if(new_contents.length>0){
                                  this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                                }
                                if(compteur_user==this.list_of_new_users.length){
                                  this.sort_list_of_contents(this.list_of_new_contents,'new');
                                }
                              }
  
                            })
                          }
                          if(r[0][j].format=="serie"){
                            this.BdSerieService.retrieve_bd_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                              if(info[0] && info[0].status=="public"){
                                new_contents.push(info[0]);
                                compt++;
                              }
                              else{
                                compt++;
                              }
                              if(compt == r[0].length){
                                compteur_user++;
                                if(new_contents.length>0){
                                  this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                                }
                                if(compteur_user==this.list_of_new_users.length){
                                  this.sort_list_of_contents(this.list_of_new_contents,'new');
                                }
                              }
                            })
                          }
                        }
        
                        if(r[0][j].publication_category=="drawing"){
                          if(r[0][j].format=="one-shot"){
                            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                              if(info[0] && info[0].status=="public"){
                                new_contents.push(info[0]);
                                compt++;
                              }
                              else{
                                compt++;
                              }
                              if(compt == r[0].length){
                                compteur_user++;
                                if(new_contents.length>0){
                                  this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                                }
                                if(compteur_user==this.list_of_new_users.length){
                                  this.sort_list_of_contents(this.list_of_new_contents,'new');
                                }
                              }
                            })
                          }
                          if(r[0][j].format=="artbook"){
                            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                              if(info[0] && info[0].status=="public"){
                                new_contents.push(info[0]);
                                compt++;
                              }
                              else{
                                compt++;
                              }
                              if(compt == r[0].length){
                                compteur_user++;
                                if(new_contents.length>0){
                                  this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                                }
                                if(compteur_user==this.list_of_new_users.length){
                                  this.sort_list_of_contents(this.list_of_new_contents,'new');
                                }
                              }
                            })
                          }
                        }
        
                        if(r[0][j].publication_category=="writing"){
                            this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                              if(info[0] && info[0].status=="public"){
                                new_contents.push(info[0]);
                                compt++;
                              }
                              else{
                                compt++;
                              }
                              if(compt == r[0].length){
                                compteur_user++;
                                if(new_contents.length>0){
                                  this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                                }
                                if(compteur_user==this.list_of_new_users.length){
                                  this.sort_list_of_contents(this.list_of_new_contents,'new');
                                }
                              }
                            })
                        }  
                        
                        if(r[0][j].publication_category=="ad"){
                          this.Ads_service.retrieve_ad_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                            if(info[0] && info[0].status=="public"){
                              new_contents.push(info[0]);
                              compt++;
                            }
                            else{
                              compt++;
                            }
                            if(compt == r[0].length){
                              compteur_user++;
                              if(new_contents.length>0){
                                this.list_of_new_contents = this.list_of_new_contents.concat(new_contents);
                              }
                              if(compteur_user==this.list_of_new_users.length){
                                this.sort_list_of_contents(this.list_of_new_contents,'new');
                              }
                            }
                          })
                        }   
                      }
                  }
                  else{
                    compteur_user++;
                    if(compteur_user==this.list_of_new_users.length){
                      this.sort_list_of_contents(this.list_of_new_contents,'new');
                    }
                  }
                })
            }
          }        
        }
        
      }
      else{
        this.sort_list_of_contents(this.list_of_new_contents,'new');
      }
    })
  }

  get_all_users_subscribed_to_before_today(){
    this.Subscribing_service.get_all_users_subscribed_to_before_today(this.user_id).pipe( first()).subscribe(info=>{
      this.list_of_users.push(this.user_id);
      if(info[0].length>0){
        for (let i=0; i< info[0].length;i++){         
          this.list_of_users.push(info[0][i].id_user_subscribed_to);        
        } 
      }
      if(this.list_of_users.length>0){
        this.Subscribing_service.get_all_subscribings_contents(this.list_of_users).pipe( first()).subscribe(r=>{  
          let compt=0; 
          if(r[0].length>0){
            for (let j=0; j< r[0].length;j++){
              if(r[0][j].publication_category=="comic"){
                if(r[0][j].format=="one-shot"){
                  this.BdOneShotService.retrieve_bd_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                    if(info[0] && info[0].status=="public"){
                      this.list_of_contents.push(info[0]);
                      compt++;
                    }
                    else{
                      compt++
                    }
                    if(compt == r[0].length){
                      this.sort_list_of_contents(this.list_of_contents,'old');
                    }
                  })
                }
                if(r[0][j].format=="serie"){
                  this.BdSerieService.retrieve_bd_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                    if(info[0] && info[0].status=="public"){
                      this.list_of_contents.push(info[0]);
                      compt++;
                    }
                    else{
                      compt++;
                    }
                    if(compt== r[0].length){
                      this.sort_list_of_contents(this.list_of_contents,'old');
                    }
                  })
                }
              }

              if(r[0][j].publication_category=="drawing"){
                if(r[0][j].format=="one-shot"){
                  this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                    if(info[0] && info[0].status=="public"){
                      this.list_of_contents.push(info[0]);
                      compt++;
                    }
                    else{
                      compt++
                    }
                    if(compt== r[0].length){
                      this.sort_list_of_contents(this.list_of_contents,'old');
                    }
                  })
                }
                if(r[0][j].format=="artbook"){
                  this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                    if(info[0] && info[0].status=="public"){
                      this.list_of_contents.push(info[0]);
                      compt++
                    }
                    else{
                      compt++
                    }
                    if(compt== r[0].length){
                      this.sort_list_of_contents(this.list_of_contents,'old');
                    }
                  })
                }
              }

              if(r[0][j].publication_category=="writing"){
                this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                  if(info[0] && info[0].status=="public"){
                    this.list_of_contents.push(info[0]);
                    compt++
                  }
                  else{
                    compt++
                  }
                  if(compt== r[0].length){
                    this.sort_list_of_contents(this.list_of_contents,'old');
                  }
                })
              }    
              
              if(r[0][j].publication_category=="ad"){
                this.Ads_service.retrieve_ad_by_id(r[0][j].publication_id).pipe( first()).subscribe(info=>{
                  if(info[0] && info[0].status=="public"){
                    this.list_of_contents.push(info[0]);
                    compt++
                  }
                  else{
                    compt++
                  }
                  if(compt== r[0].length){
                    this.sort_list_of_contents(this.list_of_contents,'old');
                  }
                })
              }   
            }
          }  
          else{
            this.sort_list_of_contents(this.list_of_contents,'old');
          }   
          

        });
      }
      
      
    })
  }

  display_contents=false;
  display_nothing_found=false;
  sort_list_of_contents(list,period){
    if(list.length>1){
      for (let i=1; i<list.length; i++){
        let time = this.convert_timestamp_to_number(list[i].createdAt);
        for (let j=0; j<i;j++){
          if(time > this.convert_timestamp_to_number(list[j].createdAt) && time==this.convert_timestamp_to_number(list[i].createdAt)){
            list.splice(j, 0, list.splice(i, 1)[0]);
            
          }
          
        }
      }
    }
    
    if(period=='old'){
      this.list_of_contents_sorted=true;
    }
    if(period=='new'){
      this.list_of_new_contents_sorted=true;
    }

    if(this.list_of_contents_sorted && this.list_of_new_contents_sorted){
      if(this.list_of_contents.length>0){
        this.last_timestamp=this.list_of_contents[this.list_of_contents.length-1].createdAt;
      }
      else if(this.list_of_new_contents.length>0){
        this.can_show_more=false;
      }
      else{
        this.can_show_more=false;
        this.display_nothing_found=true;
      }
      this.display_contents=true;
      this.cd.detectChanges();
    }

  }

  


  convert_timestamp_to_number(timestamp){
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number;
  }


 
}
