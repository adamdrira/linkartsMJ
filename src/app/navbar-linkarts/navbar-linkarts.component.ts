import { ChatService} from '../services/chat.service';
import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import {ElementRef,Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {trigger, style, animate, transition} from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {BdOneShotService} from '../services/comics_one_shot.service';
import {BdSerieService} from '../services/comics_serie.service';
import {Drawings_Artbook_Service} from '../services/drawings_artbook.service';
import {Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import {Writing_Upload_Service} from '../services/writing.service';
import {AuthenticationService} from '../services/authentication.service';
import {LoginComponent} from '../login/login.component';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {NotificationsService} from '../services/notifications.service';
import { WebSocketService } from '../services/websocket.service';


declare var $: any;


@Component({
  selector: 'app-navbar-linkarts',
  templateUrl: './navbar-linkarts.component.html',
  styleUrls: ['./navbar-linkarts.component.scss'],  
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1})
        ])
      ]
    )
  ]
})

export class NavbarLinkartsComponent implements OnInit {
  
  
  constructor(
    private location: Location,
    private cd: ChangeDetectorRef,
    private router:Router,
    public navbar: NavbarService,
    private sanitizer:DomSanitizer,
    private AuthenticationService:AuthenticationService,
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialog: MatDialog,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    
    ) {
      
    }

  
  scrolled=false;
  navbarBoxShadow = false;
  profile_picture:SafeUrl;
  user_id:number;
  author_name:string;
  pseudo:string;
  data_retrieved=false;
  type_of_profile:string;
  type_of_profile_retrieved=false;
  focus_activated=false;
  show_researches_propositions=false;
  show_selector=false;

  check_chat_service=false;
  check_notifications_from_service=false;
  list_of_notifications=[];
  index_of_notifications_to_show=10;
  show_notifications=false;

  @ViewChild('input') input:ElementRef;
  @ViewChild('notifications') notifications:ElementRef;
  @ViewChild('propositions') propositions:ElementRef;
  @ViewChild('navbarLogo') navbarLogo:ElementRef;

  list_of_real_categories=["Artist","Ad","Comic","Drawing","Writing"];
  first_filters_artists=["Auteur de B.D.", "Dessinateur", "Ecrivain"];
  first_filters_ads=["B.D.","BD euro.","Comics","Manga","Webtoon","Dessin","Dessin dig.","Dessin trad.","Ecrit","Article","Poésie","Roman","Roman il."];
  first_filters_comics=["Comics", "BD", "Manga","Webtoon"];
  first_filters_drawings=["Traditionnel", "Digital"];
  first_filters_writings=["Article","Poésie", "Roman", "Roman illustré", "Scénario"];
  first_filters=[this.first_filters_artists,this.first_filters_ads,this.first_filters_comics,this.first_filters_drawings,this.first_filters_writings];

  //notificaitons 
  display_new_messages=false;
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if(this.focus_activated){
      if(!this.input.nativeElement.contains(event.target) && !this.propositions.nativeElement.contains(event.target) ) {
        this.focus_activated=false;
        this.show_researches_propositions=false;
        this.cancel_research();
      } 
    }
    if(this.show_notifications){
      if(!this.notifications.nativeElement.contains(event.target) ) {
        this.show_notifications=false;
      } 
    }
  }

  

  v:boolean = true;
  ngOnInit() {
    window.addEventListener('scroll', this.scroll, true);
    this.setHeight();
    this.define_margin_top();
    this.AuthenticationService.tokenCheck().subscribe(r=>{
      if(r=="account"){
        this.type_of_profile="account";
        console.log(this.type_of_profile)
        this.retrieve_profile();
      }
      else{
        this.type_of_profile="visitor";
      }
      //this.navbar.set_account_type(this.type_of_profile);
      console.log("in constructor")
      this.type_of_profile_retrieved=true;
      
      
    });

    

    let interval = setInterval( () => {

      if( this.v ) {
        this.setHeight();
        this.define_margin_top();
      }
      else {
        if(this.type_of_profile_retrieved){
          console.log("in else")
          this.initialize_selectors();
          clearInterval(interval);
        }
      }
    },50);

    let chatinterval = setInterval(()=>{
      if(this.chatService.messages && !this.navbar.get_using_chat()){
        this.check_chat_service=true;
        this.check_chat_service_func();
        clearInterval(chatinterval);
      }
      else if(this.chatService.messages && this.navbar.get_using_chat()){
        this.check_notifications_from_service=true;
        this.check_notifications_from_service_func();
        clearInterval(chatinterval);
      }
    },1000)


    

    

  }

 
  check_notifications_from_service_func(){
    this.navbar.notification.subscribe(msg=>{
      if(msg[0] && !msg[0].is_from_server && msg[0].id_user!="server"){
        console.log(msg[0])
        this.sort_notifications(msg);
      }
    })  
  }
  

  check_chat_service_func(){
    this.chatService.messages.subscribe(msg=>{
      if(msg[0] && !msg[0].is_from_server && msg[0].id_user!="server"){
        console.log(msg[0])
        this.sort_notifications(msg);
      }
    })
  }

  sort_notifications(msg){
    if(msg[0].for_notifications){
      console.log(msg[0].information)
      if(msg[0].information=='add'){
        this.list_of_notifications.splice(0,0,msg[0])
      }
      else if(msg[0].information=='remove'){
        let index=-1;
        for(let i=0;i<this.list_of_notifications.length;i++){
          if(this.list_of_notifications[i].id_user==msg[0].id_user &&
            this.list_of_notifications[i].publication_category==msg[0].publication_category && 
            this.list_of_notifications[i].publication_id==msg[0].publication_id && 
            this.list_of_notifications[i].type==msg[0].type && 
            this.list_of_notifications[i].information=='add' &&
            this.list_of_notifications[i].format==msg[0].format && 
            this.list_of_notifications[i].chapter_number==msg[0].chapter_number){
              index=i;
            }
        }
        console.log(this.list_of_notifications[index])
        if(index>=0){
          this.list_of_notifications.splice(index,1)
        }
        
      }
      
      console.log(this.list_of_notifications)
    }
  }

  retrieve_profile(){
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id=r[0].id;
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.pseudo=r[0].nickname;
      this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
        this.NotificationsService.get_list_of_notifications().subscribe(r=>{
          console.log(r[0])
          if(r[0].length>0){
            for(let i=0;i<r[0].length;i++){
              this.list_of_notifications[i]=r[0][i];
              if(i== r[0].length-1 || i==this.index_of_notifications_to_show){
                this.data_retrieved=true;
                console.log(this.list_of_notifications)
              }
            }
          }
          else{
            this.data_retrieved=true;
          }
          
        });
      });
    })
  }

  pp_loaded(){
    this.pp_is_loaded=true;
  }
 
  open_notifications(){
    if(this.show_notifications){
      this.show_notifications=false;
      return
    }
    let modify=false;
    for(let i=0;i<this.list_of_notifications.length;i++){
      if(this.list_of_notifications[i].status=="unchecked"){
        modify=true;
        this.list_of_notifications[i].status="checked";
      }
    }
    if(modify){
      this.NotificationsService.change_all_notifications_status_to_checked().subscribe(r=>{
        this.show_notifications=true;
      })
    }
    else{
      this.show_notifications=true;
    }
    
    
  }


  add_notification_seen(i){
    if(this.list_of_notifications[i].status!="seen"){
      this.list_of_notifications[i].status="seen";
      let elem=this.list_of_notifications[i]
      this.NotificationsService.change_notification_status_to_seen(elem.id_user,elem.type,elem.publication_category,elem.format,elem.publication_id,elem.chapter_number).subscribe(r=>{
        this.show_notifications=true;
      })
    }
    
  }

  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */

  publication_category="All";
  format="unknown"
  target_id=0;
  pp_is_loaded=false;
  most_researched_propositions:any[]=[];
  list_of_first_propositions_history:any[]=[];
  list_of_last_propositions_history:any[]=[];
  list_of_thumbnails_history:SafeUrl[]=[];
  compteur_first_propositions=0;
  compteur_recent=0;
  loading_recent=false;
  pp_thumb_hist_is_loaded:any[]=[];
  first_option:boolean;
  show_most_researched_propositions=false;
  activateFocus() {
    if(this.focus_activated){
      return
    };
    this.get_trendings()
  }

  get_trendings(){
    this.loading_other=false;
    this.pp_thumb_hist_is_loaded=[];
    this.most_researched_propositions=[];
    this.list_of_first_propositions_history=[];
    this.list_of_last_propositions_history=[];
    this.list_of_thumbnails_history=[];
    this.compteur_first_propositions=0;
    this.focus_activated=true;
    this.compteur_recent+=1;
    this.show_researches_propositions=false;
    this.show_other_propositions=false;
    this.show_first_propositions=false;
    this.input.nativeElement.focus();
    this.loading_recent=true;
    this.navbar.get_most_researched_navbar(this.publication_category,this.compteur_recent,"researched").subscribe(r=>{
      console.log(r[0][0]);
      this.show_researches_propositions=true;
      console.log(r[1]);
      console.log(this.compteur_recent)
      if(r[1]==this.compteur_recent){
        this.most_researched_propositions=r[0][0];
        this.show_most_researched_propositions=true;
        this.navbar.get_last_researched_navbar(this.publication_category,r[1]).subscribe(m=>{
          if(m[1]==this.compteur_recent){
            console.log(m[0][0]);
            this.list_of_first_propositions_history=m[0][0];
            if(m[0][0].length>0){
              this.first_option=true;
              for(let i=0;i<m[0][0].length;i++){
                this.get_first_propositions(i,m[1])
              }
            }
            else{
              this.first_option=false;
              this.navbar.get_most_researched_navbar(this.publication_category,r[1],"clicked").subscribe(n=>{
                if(n[1]==this.compteur_recent){
                  console.log(n[0][0]);
                  this.list_of_first_propositions_history=n[0][0];
                  for(let i=0;i<n[0][0].length;i++){
                    this.get_first_propositions(i,n[1])
                  }
                }
              })
            }
            
            
          }
        })
      }
      
    });
  }
  pp_thumb_hist_load(i){
    this.pp_thumb_hist_is_loaded[i]=true;
  }

  pp_thumb_load(i){
    this.pp_thumb_is_loaded[i]=true;
  }
  

  cancel_research(){
    this.input.nativeElement.value='';
  }

  list_of_first_propositions:any[]=[];
  list_of_last_propositions:any[]=[];
  list_of_thumbnails:SafeUrl[]=[];
  show_other_propositions=false;
  show_first_propositions=false;
  compteur_other_propositions=0;
  compteur_research=0;
  pp_thumb_is_loaded:any[]=[];
  loading_other=false;
  researches_propositions(event){
    console.log(this.input.nativeElement.value);
    this.compteur_research+=1;
    this.compteur_recent+=1;
    this.show_other_propositions=false;
    this.show_first_propositions=false;
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.compteur_other_propositions=0;
    this.pp_thumb_is_loaded=[];
    this.loading_other=true;
    this.loading_recent=false;
    //vérifier que ca ne commence pas par un espace aussi

    if(this.input.nativeElement.value!=''){
      /*équivalent aux propositions
      this.most_researched_propositions=[];
      this.navbar.get_main_searchbar_ideas(this.publication_category,this.input.nativeElement.value,this.compteur_research).subscribe(r=>{
        console.log(r[0][0])
        if(r[1]==this.compteur_research){
          this.most_researched_propositions=r[0][0]
        }
      })*/
      this.show_most_researched_propositions=false;

      /*if(this.publication_category=="All"){
        this.navbar.get_main_searchbar_propositions(this.input.nativeElement.value, this.compteur_research).subscribe(m=>{
          if(m[1]==this.compteur_research){
            this.list_of_first_propositions=m[0][0];
            if(this.list_of_first_propositions.length<10){
              this.navbar.get_most_researched_main_propositions_gen(this.input.nativeElement.value,10-this.list_of_first_propositions.length,m[1]).subscribe(r=>{
                if(r[1]==this.compteur_research){
                  if(r[0][0].length>0){
                    this.list_of_first_propositions=this.list_of_first_propositions.concat(r[0][0]);
                  }
                  for(let i=0;i<this.list_of_first_propositions.length;i++){
                    this.get_other_propositions(i,m[1]);
                  }
                }
                
              })
            }
            else{
              for(let i=0;i<this.list_of_first_propositions.length;i++){
                this.get_other_propositions(i,m[1]);
              }
            }
          }
         
        })
      }*/
        this.navbar.get_specific_propositions_navbar(this.publication_category,this.input.nativeElement.value,this.compteur_research).subscribe(m=>{
          console.log(m[0][0]);
          if(m[1]==this.compteur_research){
            this.list_of_first_propositions=m[0][0];
            if(m[0][0].length<10){
              this.navbar.get_global_propositions_navbar(this.publication_category,this.input.nativeElement.value,10-m[0].length,m[1]).subscribe(r=>{
                console.log(r[0][0]);
                if(r[1]==this.compteur_research){
                  if(r[0][0].length>0){
                    this.list_of_first_propositions=this.list_of_first_propositions.concat(r[0][0]);
                  }
                  if(this.list_of_first_propositions.length<10){
                    console.log(this.list_of_first_propositions.length)
                    this.navbar.get_global_tags_propositions_navbar(this.publication_category,this.input.nativeElement.value,10-this.list_of_first_propositions.length,r[1]).subscribe(u=>{
                      console.log(u[0][0]);
                      if(u[1]==this.compteur_research){
                        if(u[0][0].length>0){
                          let len=this.list_of_first_propositions.length;
                          if(len>0){
                            for(let j=0;j<u[0][0].length;j++){
                              let ok=true;
                              for(let k=0;k<len;k++){
                                if( this.list_of_first_propositions[k].publication_category==u[0][0][j].publication_category && this.list_of_first_propositions[k].format==u[0][0][j].format && this.list_of_first_propositions[k].target_id==u[0][0][j].target_id){
                                  ok=false;
                                }
                                if(k==len-1){
                                  if(ok){
                                    this.list_of_first_propositions.push(u[0][0][j])
                                  }
                                }
                              }
                            }
                          }
                          else{
                            this.list_of_first_propositions=this.list_of_first_propositions.concat(u[0][0]);
                          }
                        }
                        if(this.list_of_first_propositions.length>0){
                          console.log(this.list_of_first_propositions)
                          for(let i=0;i<this.list_of_first_propositions.length;i++){
                            this.get_other_propositions(i,u[1]);
                          }
                        }
                        else{
                          this.loading_other=false;
                          this.show_other_propositions=true;
                        }
                      }
                    })
                  }
                  else{
                    for(let i=0;i<this.list_of_first_propositions.length;i++){
                      this.get_other_propositions(i,r[1]);
                    }
                  }
                }
              })
            }
            else{
              for(let i=0;i<this.list_of_first_propositions.length;i++){
                this.get_other_propositions(i,m[1]);
              }
            }
          }
          
         
        })
    }
    else{
      //a executer si on lance la première fonction dans le if
      /*this.navbar.get_most_researched_main_propositions(this.publication_category,this.compteur_research,"researched").subscribe(r=>{
        console.log(r[0][0])
        if(r[1]==this.compteur_research){
          this.most_researched_propositions=r[0][0]
        }
      })*/
      
      if(this.most_researched_propositions.length==0 || this.list_of_first_propositions_history.length==0){
        this.get_trendings();
      }
      else{
        this.loading_other=false;
        this.show_other_propositions=false;
        this.show_first_propositions=true;
        this.show_most_researched_propositions=true;
      }
      
      
    }
    
  }

  get_first_propositions(i,compteur){
    if(this.list_of_first_propositions_history[i].publication_category=="Artist"){
      console.log("artist");
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_first_propositions_history[i].target_id).subscribe(profile=>{
        if(compteur==this.compteur_recent){
          this.list_of_last_propositions_history[i]=profile[0];
          this.Profile_Edition_Service.retrieve_profile_picture(profile[0].id ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_recent){
              this.list_of_thumbnails_history[i] = SafeURL;
              this.compteur_first_propositions++;
              if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
                console.log(this.list_of_last_propositions_history)
                this.show_first_propositions=true;
                this.loading_recent=false;
              }
            }
           
          });
        }
        
      })
    }

    if(this.list_of_first_propositions_history[i].publication_category=="Comic"){
      console.log("comic");
      if(this.list_of_first_propositions_history[i].format=="one-shot"){
        this.BdOneShotService.retrieve_bd_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            console.log(this.list_of_first_propositions_history[i].target_id);
            this.BdOneShotService.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = SafeURL;
                  this.compteur_first_propositions++;
                  if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
                    console.log(this.list_of_last_propositions_history);
                    this.show_first_propositions=true;
                    this.loading_recent=false;
                  }
                }
                
            })
          }
          
        })
      }
      if(this.list_of_first_propositions_history[i].format=="serie"){
        this.BdSerieService.retrieve_bd_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            this.BdSerieService.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = SafeURL;
                  this.compteur_first_propositions++;
                  if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
                    console.log(this.list_of_last_propositions_history);
                    this.show_first_propositions=true;
                    this.loading_recent=false;
                  }
                }
            })
          }
        })
      }
    }

    if(this.list_of_first_propositions_history[i].publication_category=="Drawing"){
      console.log("drawing");
      if(this.list_of_first_propositions_history[i].format=="one-shot"){
        this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            this.Drawings_Onepage_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = SafeURL;
                  this.compteur_first_propositions++;
                  if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
                    console.log(this.list_of_last_propositions_history);
                    this.show_first_propositions=true;
                    this.loading_recent=false;
                  }
                }
            })
          }
          
        })
      }
      if(this.list_of_first_propositions_history[i].format=="artbook"){
        this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            this.Drawings_Artbook_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = SafeURL;
                  this.compteur_first_propositions++;
                  if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
                    console.log(this.list_of_last_propositions_history);
                    this.show_first_propositions=true;
                    this.loading_recent=false;
                  }
                }
            })
          }
          
        })
      }
    }

    if(this.list_of_first_propositions_history[i].publication_category=="Writing"){
      console.log("writing");
      this.Writing_Upload_Service.retrieve_writing_information_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(comic=>{
        if(compteur==this.compteur_recent){
          this.list_of_last_propositions_history[i]=comic[0];
          this.Writing_Upload_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(compteur==this.compteur_recent){
                this.list_of_thumbnails_history[i] = SafeURL;
                this.compteur_first_propositions++;
                if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
                  console.log(this.list_of_last_propositions_history);
                  this.show_first_propositions=true;
                  this.loading_recent=false;
                }
              }
              
          })
        }
       
      })
    }
  }

  get_other_propositions(i,compteur){
    if(this.list_of_first_propositions[i].publication_category=="Artist"){
      console.log("artist");
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_first_propositions[i].target_id).subscribe(profile=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=profile[0];
          this.Profile_Edition_Service.retrieve_profile_picture(profile[0].id ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_research){
              this.list_of_thumbnails[i] = SafeURL;
              this.compteur_other_propositions++;
              console.log(this.compteur_other_propositions)
              console.log(this.list_of_first_propositions)
              if(this.compteur_other_propositions==this.list_of_first_propositions.length){
                console.log(this.list_of_last_propositions)
                this.show_other_propositions=true;
                this.loading_other=false;
              }
            }
           
          });
        }
        
      })
    }

    if(this.list_of_first_propositions[i].publication_category=="Comic"){
      console.log("comic");
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.BdOneShotService.retrieve_bd_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.BdOneShotService.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = SafeURL;
                  this.compteur_other_propositions++;
                  if(this.compteur_other_propositions==this.list_of_first_propositions.length){
                    console.log(this.list_of_last_propositions);
                    this.show_other_propositions=true;
                    this.loading_other=false;
                  }
                }
                
            })
          }
          
        })
      }
      if(this.list_of_first_propositions[i].format=="serie"){
        this.BdSerieService.retrieve_bd_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.BdSerieService.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = SafeURL;
                  this.compteur_other_propositions++;
                  if(this.compteur_other_propositions==this.list_of_first_propositions.length){
                    console.log(this.list_of_last_propositions);
                    console.log(this.list_of_thumbnails);
                    this.show_other_propositions=true;
                    this.loading_other=false;
                  }
                }
            })
          }
        })
      }
    }

    if(this.list_of_first_propositions[i].publication_category=="Drawing"){
      console.log("drawing");
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.Drawings_Onepage_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = SafeURL;
                  this.compteur_other_propositions++;
                  if(this.compteur_other_propositions==this.list_of_first_propositions.length){
                    console.log(this.list_of_last_propositions);
                    this.show_other_propositions=true;
                    this.loading_other=false;
                  }
                }
            })
          }
          
        })
      }
      if(this.list_of_first_propositions[i].format=="artbook"){
        this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.Drawings_Artbook_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = SafeURL;
                  this.compteur_other_propositions++;
                  if(this.compteur_other_propositions==this.list_of_first_propositions.length){
                    console.log(this.list_of_last_propositions);
                    console.log(this.list_of_thumbnails);
                    this.show_other_propositions=true;
                    this.loading_other=false;
                  }
                }
            })
          }
          
        })
      }
    }

    if(this.list_of_first_propositions[i].publication_category=="Writing"){
      console.log("writing");
      this.Writing_Upload_Service.retrieve_writing_information_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=comic[0];
          this.Writing_Upload_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(compteur==this.compteur_research){
                this.list_of_thumbnails[i] = SafeURL;
                this.compteur_other_propositions++;
                if(this.compteur_other_propositions==this.list_of_first_propositions.length){
                  console.log(this.list_of_last_propositions);
                  this.show_other_propositions=true;
                  this.loading_other=false;
                }
              }
              
          })
        }
       
      })
    }
  }

  keydown_researches_propositions(event){
    if(event.key=="Enter"){
      this.click_on_research();
      this.input.nativeElement.blur();
      //get_more_propositions (add to history)
      
    }
  }

  click_on_research(){
    this.navbar.add_main_research_to_history(this.publication_category,this.format,this.target_id,this.input.nativeElement.value,"researched",0,0,0,"unknown","unknown","unknown","unknown").subscribe(r=>{
      console.log(r);
      this.location.go(`/main-research/1/${this.input.nativeElement.value}/${this.publication_category}`);
      location.reload();
      return;
    })
  }

  click_on_trending_message(i){
    let str=this.most_researched_propositions[i].research_string;
    this.navbar.add_main_research_to_history(this.publication_category,this.format,this.target_id,str,"researched",0,0,0,"unknown","unknown","unknown","unknown").subscribe(r=>{
      console.log(r);
    })
  }

  add_clicked_after_research(i){
    let lst=this.list_of_first_propositions[i];
    let lst2=this.list_of_last_propositions[i];
    this.navbar.add_main_research_to_history(lst.publication_category,lst.format,lst.target_id,lst.research_string,"clicked_after_research",lst2.number_of_comics,lst2.number_of_drawings,lst2.number_of_writings,lst2.category,lst2.firsttag,lst2.secondtag,lst2.thirdtag).subscribe()
  }

  add_clicked_after_research_recent(i){
    let lst=this.list_of_first_propositions_history[i];
    let lst2=this.list_of_last_propositions_history[i];
    this.navbar.add_main_research_to_history(lst.publication_category,lst.format,lst.target_id,lst.research_string,"clicked_after_research",lst2.number_of_comics,lst2.number_of_drawings,lst2.number_of_writings,lst2.category,lst2.firsttag,lst2.secondtag,lst2.thirdtag).subscribe()
  }

  delete_from_history(i){
    let str=this.list_of_first_propositions_history[i].research_string
    console.log(str);
    this.navbar.delete_click_after_ressearch_from_history(str).subscribe(r=>{
      console.log(r);
      this.list_of_first_propositions_history.splice(i,1);
      this.list_of_last_propositions_history.splice(i,1);
    })
  }
/***************************************login  **********************************/
/***************************************logout  **********************************/
  logout(){
    this.AuthenticationService.logout();
    //this.type_of_profile="visitor";
    location.reload();
  }

  login(){
    const dialogRef = this.dialog.open(LoginComponent, {});
  }

  /***************************************Style navbar **********************************/
/***************************************Style  **********************************/
/***************************************Style  **********************************/
/***************************************Style  **********************************/

  define_margin_top() {
    
    
    if( this.navbar.visible ) {
      console.log("navbar visible set margin top")
      if( $(".fixed-top").css("position") == "fixed" ) {
        $(".navbar-margin").css("height", $(".fixed-top").height() + "px" );
      }
      else {
        $(".navbar-margin").css("height", "10px" );
      }

      this.v=false;
    }
    
  }

  setHeight() {
    this.navbar.setHeight( $(".fixed-top").height() );
  }
  
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

 

  /*ngAfterViewContent() {
    this.setHeight();
    this.define_margin_top();
  }*/
  


  //Scrolling managements
  scroll = (): void => {

    var lastScrollTop = 100;
    var scroll = document.documentElement.scrollTop;
    
    if (scroll>lastScrollTop) {
      this.navbarBoxShadow = true;
    }
    
    else {
      this.navbarBoxShadow = false;
    }
    lastScrollTop = scroll;
  }
  

/***************************************Sumo selector **********************************/
/***************************************Sumo selector **********************************/
/***************************************Sumo selector **********************************/
/***************************************Sumo selector **********************************/

display_style_and_tag_research=false;
indice_title_selected=-1;
initialize_selectors(){
  let THIS=this;
  $(document).ready(function () {
    $('.NavbarSelectBox').SumoSelect({});
    console.log("sumo done")
    THIS.cd.detectChanges();
    THIS.show_selector=true;
  });

  $(".NavbarSelectBox").change(function(){
    console.log($(this).val())
    
    THIS.input.nativeElement.value="";
    THIS.publication_category=$(this).val();
    if(THIS.publication_category=="Comic" || THIS.publication_category=="Drawing" || THIS.publication_category=="Writing"){
      THIS.display_style_and_tag_research=true;
      THIS.indice_title_selected=THIS.list_of_real_categories.indexOf(THIS.publication_category);
      console.log(THIS.first_filters[THIS.indice_title_selected])
    }
    else{
      THIS.display_style_and_tag_research=false;
      THIS.indice_title_selected=-1
    }
  })
}




}