import { ChatService} from '../services/chat.service';
import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import {ElementRef,Renderer2, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
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
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import {NotificationsService} from '../services/notifications.service';
import { Ads_service } from '../services/ads.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupNavbarComponent } from '../popup-navbar/popup-navbar.component';
import { SignupComponent } from '../signup/signup.component';
import {get_date_to_show_chat} from '../helpers/dates';
import {get_date_to_show_navbar} from '../helpers/dates';
import {Community_recommendation} from '../services/recommendations.service';
import { MatMenuTrigger } from '@angular/material/menu';
import * as WebFont from 'webfontloader';

declare var $: any;
declare var Swiper: any;


@Component({
  selector: 'app-navbar-linkarts',
  templateUrl: './navbar-linkarts.component.html',
  styleUrls: ['./navbar-linkarts.component.scss'],  
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('150ms', style({opacity: 1}))
        ])
      ],
    )
  ]
})

export class NavbarLinkartsComponent implements OnInit {
  
  
  constructor(
    private Community_recommendation:Community_recommendation,
    private location: Location,
    private CookieService:CookieService,
    private cd: ChangeDetectorRef,
    private rd:Renderer2,
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
    private Ads_service:Ads_service,
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    
    ) {
      navbar.connexion.subscribe(r=>{
        if(r!=this.connexion_status){
          this.connexion_status=r
          
          if(r){
            //console.log("connected")
            if(this.chatService.messages && !this.using_chat && this.navbar_visible && this.using_chat_retrieved){

              this.check_chat_service=true;
              this.check_chat_service_func();
              this.cd.detectChanges();
            }
          }
        }
        
      })



      navbar.visibility_observer.subscribe(navbar_visibility=>{
        //console.log(navbar_visibility)
        if( navbar_visibility) {
          this.navbar_visible=true;
          this.rd.setStyle(this.navbarMargin.nativeElement, "height", "54px");
          this.initialize_selectors();
          navbar.check_using_chat.subscribe(using_chat=>{
            //console.log(this.chatService)
            this.using_chat=using_chat;
            this.using_chat_retrieved=true
            let chat_messages_interval = setInterval(() => {
              //console.log(this.chatService.messages)
              if(this.chatService.messages){
                clearInterval(chat_messages_interval)
                //console.log("ok")
                this.using_chat=using_chat;
                this.using_chat_retrieved=true;
                if( !using_chat){
                  //console.log("if not using chat")
                  
                  this.check_chat_service=true;
                  this.check_chat_service_func();
                  //clearInterval(chatinterval);
                  this.cd.detectChanges();
                }
              }
            }, 100);
            
            
          })
        }
        else{
          this.navbar_visible=false;
        }
      })

      

      
    
  }

  navbar_visible=false;
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.chatService.close();
  }

  reload_page(){
    location.reload();
  }

  not_using_chat(){
    if( this.navbar.get_using_chat()){
      this.navbar.set_not_using_chat();
    }
    
  }

  visibility_navbar:boolean;
  connexion_status=true;
  activated_search:boolean = false;
  activate_search() {
    this.activated_search = true;
    this.cd.detectChanges();
  }
 

  scrolled=false;
  navbarBoxShadow = false;
  profile_picture:SafeUrl;
  user_id:number;
  author_first_name:string;
  author_name:string;
  author_certification:any;
  pseudo:string;
  data_retrieved=false;
  type_of_profile:string;
  type_of_profile_retrieved=false;
  focus_activated=false;
  show_researches_propositions=false;
  show_selector=false;

  check_chat_service=false;
  check_notifications_from_service=false;
  list_of_notifications_profile_pictures=[];
  notifications_pictures_retrieved=false;
  list_of_notifications=[];
  
  number_of_unchecked_notifications=100;
  index_of_notifications_to_show=15;
  show_notifications=false;


  using_chat=false;
  using_chat_retrieved=false;
  show_chat_messages=false;
  list_of_messages=[];
  number_of_unseen_messages:number;
  @ViewChild('chat') chat:ElementRef;

  @ViewChild('input') input:ElementRef;
  @ViewChild('searchicon') searchicon:ElementRef;
  @ViewChild('notifications') notifications:ElementRef;
  @ViewChild('propositions') propositions:ElementRef;
  @ViewChild('navbarLogo') navbarLogo:ElementRef;

  list_of_real_categories=["Account","Ad","Comic","Drawing","Writing"];
  first_filters_artists=["Auteur de B.D.", "Dessinateur", "Ecrivain"];
  first_filters_ads=["B.D.","BD euro.","Comics","Manga","Webtoon","Dessin","Dessin dig.","Dessin trad.","Ecrit","Article","Poésie","Roman","Roman il."];
  first_filters_comics=["Comics", "BD", "Manga","Webtoon"];
  first_filters_drawings=["Traditionnel", "Digital"];
  first_filters_writings=["Article","Poésie", "Roman", "Roman illustré", "Scénario"];
  first_filters=[this.first_filters_artists,this.first_filters_ads,this.first_filters_comics,this.first_filters_drawings,this.first_filters_writings];

   //check presence
   user_present=true;

  //notificaitons 
  display_new_messages=false;
  logo_is_loaded=false;
  logo_is_loaded2=false;
  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    if(!this.user_present && (this.type_of_profile=='account' || this.type_of_profile=='suspended') && !this.show_chat_messages){
       this.list_of_friends_retrieved=false;
       this.user_present=true;
       this.sort_friends_list();
    }

  }


  @HostListener('document:click', ['$event'])
  clickout(event) {
    if(!this.user_present && !this.show_notifications && (this.type_of_profile=='account' || this.type_of_profile=='suspended')){
      this.user_present=true;
      this.list_of_friends_retrieved=false;
      this.sort_friends_list();
    }
    if(this.focus_activated){
      if(!this.input.nativeElement.contains(event.target) && !this.searchicon.nativeElement.contains(event.target) && !this.propositions.nativeElement.contains(event.target) ) {
        
        this.cancel_research();
      } 
    }
    if(this.show_notifications){
      if(this.notifications && !this.notifications.nativeElement.contains(event.target) ) {
        this.show_notifications=false;
        this.change_notifications_status_to_checked();
      } 
    }
    if(this.show_chat_messages){
      if(this.chat &&!this.chat.nativeElement.contains(event.target) ) {
        //console.log("reset chat")
        //this.list_of_chat_friends_ids=[]; 
        this.show_chat_messages=false;
        this.number_of_unseen_messages=0;
        this.cd.detectChanges();
      } 
    }
  }

  
  get_connection_interval:any;
  margin_is_not_set:boolean = true;
  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  @ViewChild('myScrollContainer_chat') private myScrollContainer_chat: ElementRef;

  @ViewChild('navbarMargin', { read: ElementRef }) navbarMargin:ElementRef;
    
  list_of_conditions=[];
  conditions_retrieved=false;
  current_user_type='';
  change_number=0;
  ngOnInit() {
    let THIS=this;
    WebFont.load({ google: { families: [ 'Material+Icons' ] } , active: function () {
      console.log("m")
      THIS.navbar.showfont();
      THIS.show_icon=true;
    }});
    
    window.addEventListener('scroll', this.scroll, true);
    
    //this.setHeight();
    //this.define_margin_top();
    let compteur_conditions=0;
    for(let i=0;i<5;i++){
      this.Writing_Upload_Service.retrieve_writing_for_options(i).subscribe(r=>{
        this.list_of_conditions[i]=r;
        compteur_conditions++;
        if(compteur_conditions==5){
          this.conditions_retrieved=true;
        }
      })
    }

    this.AuthenticationService.tokenCheck().subscribe(r=>{
      //console.log(r)

      if(r!=this.current_user_type &&  this.change_number<1){
        this.Profile_Edition_Service.get_current_user_and_cookies().subscribe(r=>{

          //console.log(r[0])
          if(r[0]){
            let user =r[0].user
            let cookies =r[0].cookies;
            if(!cookies){
              this.show_cookies=true;
            }
            //console.log(user);
            //console.log(cookies)
            if(user[0] && (user[0].status=="account" || user[0].status=="suspended")){
              this.type_of_profile=user[0].status;
              ////console.log(this.type_of_profile)
              this.retrieve_profile(user);
            }
            else{
              //console.log("in false")
              this.data_retrieved=true;
              this.using_chat_retrieved=true;
              this.type_of_profile="visitor";
            }
            ////console.log("in constructor")
            this.type_of_profile_retrieved=true;
            this.initialize_selectors();
          }
         
          
        });
        this.current_user_type=r;
        this.change_number++;
      }
    })

   

    

    //connexion to chat service interval

    this.get_connection_interval = setInterval(() => {
      //console.log(this.list_of_friends_retrieved)
      //console.log(!this.navbar.get_using_chat())
      if(this.list_of_friends_retrieved && !this.navbar.get_using_chat() && !this.popup_opened){
        //console.log("getting connections status")
        this.get_connections_status();
      }
    }, 60000);

 

    ////console.log("check_notifications_from_service_func");
    this.navbar.notification.subscribe(msg=>{
      if(msg && msg[0].for_notifications){
        ////console.log(msg[0])
        this.sort_notifications(msg);
      }
    })  



    //scroll managment interval

    setInterval(() => {
      // après avoir cliqué sur "voir tous les résultats" dans la liste des propositions classique
      if(this.show_notifications){
        if((this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.8)){
          if(this.index_of_notifications_to_show<this.final_list_of_notifications_to_show.length){

            let number_of_notifs=0;
            let index_fin=-1;
            for(let i=this.index_of_notifications_to_show;i<this.final_list_of_notifications_to_show.length;i++){
              if(this.final_list_of_notifications_to_show[i]){
                number_of_notifs+=1;
              }
              if(number_of_notifs==10){
                index_fin=i;
              }
            }

            if(index_fin>0){
              this.index_of_notifications_to_show=index_fin;
            }
            else{
              this.index_of_notifications_to_show=this.final_list_of_notifications_to_show.length;
            }
          }
          
        }
      }
      if(this.show_chat_messages){
        if(this.myScrollContainer_chat && (this.myScrollContainer_chat.nativeElement.scrollTop + this.myScrollContainer_chat.nativeElement.offsetHeight >= this.myScrollContainer_chat.nativeElement.scrollHeight*0.8)){
          if(this.number_of_friends_to_show<this.list_of_friends_ids.length){
            this.number_of_friends_to_show+=10;
          }
        }
      }
    }, 500);

    

  }

 
 

  check_chat_service_func(){
    this.chatService.messages.subscribe(msg=>{
      //console.log(msg)
      if(msg[0].for_notifications){
        ////console.log(msg[0])
        this.sort_notifications(msg);
      }
      else{
        this.chat_service_managment_function(msg);
        
      }
    })
  }

  

  retrieve_profile(r){
    ////console.log("retrieve profile")
      this.user_id=r[0].id;
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.author_certification=r[0].certified_account;
      this.pseudo=r[0].nickname;
      this.author_first_name=r[0].firstname ;
      this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.chatService.get_number_of_unseen_messages().subscribe(a=>{
        ////console.log(a);
        if(a[0]){
          this.number_of_unseen_messages=a[0].number_of_unseen_messages;
        }
        else{
          this.number_of_unseen_messages=0
        }
        this.sort_friends_list();
      })

      this.NotificationsService.get_list_of_notifications().subscribe(r=>{
        ////console.log(r[0])
        if(r[0].length>0){
          for(let i=0;i<r[0].length;i++){
            this.list_of_notifications[i]=r[0][i];
            if(i==r[0].length-1){
              ////console.log("end retrieve profile")
              this.get_final_list_of_notifications_to_show("initialize");
            
            }
          }
        }
        else{
          this.data_retrieved=true;
          this.number_of_unchecked_notifications=0;
        }
      });
  }

  pp_loaded(){
    this.pp_is_loaded=true;
  }

  load_notification_pp(i){
    this.notification_loaded[i]=true;
  }
 
  sort_notifications(msg){
    ////console.log("sorting notif")
    if(msg[0].for_notifications){
      //console.log(msg[0].information)
      //console.log(this.list_of_notifications[0])
      if(msg[0].information!='remove'){
        this.list_of_notifications.splice(0,0,msg[0])
      }
      else if(msg[0].information=='remove'){
        let index=-1;
        for(let i=0;i<this.list_of_notifications.length;i++){
          if(this.list_of_notifications[i].id_user==msg[0].id_user &&
            this.list_of_notifications[i].publication_category==msg[0].publication_category && 
            this.list_of_notifications[i].publication_id==msg[0].publication_id && 
            this.list_of_notifications[i].type==msg[0].type && 
            this.list_of_notifications[i].is_comment_answer==msg[0].is_comment_answer && 
            this.list_of_notifications[i].comment_id==msg[0].comment_id && 
            this.list_of_notifications[i].format==msg[0].format && 
            this.list_of_notifications[i].chapter_number==msg[0].chapter_number){
              index=i;
            }
        }
        ////console.log(this.list_of_notifications[index])
        if(index>=0){
          this.list_of_notifications.splice(index,1)
        }
        
      }
      this.get_final_list_of_notifications_to_show("add");
      ////console.log(this.list_of_notifications)
    }
    else{
      this.list_of_messages.splice(0,0,msg[0]);

    }
  }


  
  change_notifications_status_to_checked(){
    ////console.log("change_notifications_status_to_checked")
    ////console.log( this.list_of_notifications)
    ////console.log(this.final_list_of_notifications_to_show)
    let modify=false;
    for(let i=0;i<this.list_of_notifications.length;i++){
      if(this.list_of_notifications[i].status=="unchecked"){
        modify=true;
        this.list_of_notifications[i].status="checked";
        if(this.final_list_of_notifications_to_show[i]){
          this.final_list_of_notifications_to_show[i].status="checked"
        }
      }
    }
    if(modify){
      this.NotificationsService.change_all_notifications_status_to_checked(this.user_id).subscribe(r=>{  
      })
    }
    this.number_of_unchecked_notifications=0;
  }

  dictionnary_of_similar_notifications={};
  list_of_notifications_dates=[];
  final_list_of_notifications_to_show=[];
  compteur_get_final_list=0;
  number_of_empties=0;
  get_final_list_of_notifications_to_show(status){
    if(status=="add"){
      this.list_of_notifications_profile_pictures.splice(0,0,null);
    }
    this.compteur_get_final_list++;
    let compteur=this.compteur_get_final_list;
    ////console.log("Az get fi list of notifs r c " + this.compteur_get_final_list)
    this.final_list_of_notifications_to_show=[];
    this.dictionnary_of_similar_notifications={};
    this.dictionnary_of_similar_notifications[0]=[];
    this.final_list_of_notifications_to_show[0]=this.list_of_notifications[0];
    this.number_of_empties=0;
    if(this.list_of_notifications.length>1){
      for(let i=1;i<this.list_of_notifications.length;i++){
        this.dictionnary_of_similar_notifications[i]=[];
        let similar_found=false;
        for(let j=0;j<i;j++){
          if(this.list_of_notifications[i].type=='comment_like' || this.list_of_notifications[i].type=='comment_answer_like' || this.list_of_notifications[i].type=='comment_answer'){
            if(this.list_of_notifications[i].publication_category==this.list_of_notifications[j].publication_category && 
              this.list_of_notifications[i].publication_id==this.list_of_notifications[j].publication_id && 
              this.list_of_notifications[i].type==this.list_of_notifications[j].type && 
              this.list_of_notifications[i].is_comment_answer==this.list_of_notifications[j].is_comment_answer && 
              this.list_of_notifications[i].comment_id==this.list_of_notifications[j].comment_id && 
              this.list_of_notifications[i].format==this.list_of_notifications[j].format && 
              this.list_of_notifications[i].chapter_number==this.list_of_notifications[j].chapter_number){
                if(!similar_found && this.list_of_notifications[i].id_user!=this.list_of_notifications[j].id_user){
                  this.dictionnary_of_similar_notifications[j].push(this.list_of_notifications[i]);
                  similar_found=true;
                }
                if(!similar_found && this.list_of_notifications[i].id_user==this.list_of_notifications[j].id_user){
                  ////console.log("similar user notif " + i + ' et ' + j)
                  similar_found=true;
                }
                
              }
          }
          else if( 
            this.list_of_notifications[i].publication_category==this.list_of_notifications[j].publication_category && 
            this.list_of_notifications[i].publication_id==this.list_of_notifications[j].publication_id && 
            this.list_of_notifications[i].type==this.list_of_notifications[j].type && 
            this.list_of_notifications[i].format==this.list_of_notifications[j].format && 
            this.list_of_notifications[i].chapter_number==this.list_of_notifications[j].chapter_number){
              if(!similar_found && this.list_of_notifications[i].id_user!=this.list_of_notifications[j].id_user){
                this.dictionnary_of_similar_notifications[j].push(this.list_of_notifications[i]);
                similar_found=true;
              }
              if(!similar_found && this.list_of_notifications[i].id_user==this.list_of_notifications[j].id_user){
                ////console.log("similar user notif " + i + ' et ' + j)
                similar_found=true;
              }
          }
        }
        if(!similar_found ){
            this.final_list_of_notifications_to_show[i]=this.list_of_notifications[i];
        }
        else if(i<20){
          this.number_of_empties+=1
        }
      }
    }
    this.index_of_notifications_to_show=15+ this.number_of_empties;
    this.data_retrieved=true;
    this.display_number_of_unchecked_notifications();
    let compteur_pp=0;
    ////console.log("Az r to go list for l" + this.list_of_notifications.length + " and c " +  compteur + " and r c " +  this.compteur_get_final_list)
    for(let i=0;i<this.list_of_notifications.length;i++){
     // //console.log("Az index " + i + "/" + this.list_of_notifications.length + " and c " +  compteur + " and r c " +  this.compteur_get_final_list)
      this.list_of_notifications_dates[i]=this.get_date(this.list_of_notifications[i].createdAt,i);

      if(status=="initialize"){
        this.Profile_Edition_Service.retrieve_profile_picture_for_notifs(this.list_of_notifications[i].id_user,compteur).subscribe(t=> {
          if(this.compteur_get_final_list==t[1]){
           // //console.log("Az pp ret i " + i + "/" + this.list_of_notifications.length + " and c " +  compteur + " and r c " +  this.compteur_get_final_list)
            let url = (window.URL) ? window.URL.createObjectURL(t[0]) : (window as any).webkitURL.createObjectURL(t[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_notifications_profile_pictures[i] = SafeURL;
              compteur_pp++;
              if(compteur_pp==this.list_of_notifications.length){
                ////console.log(" Az End pp for c " + compteur + " and r c " +  this.compteur_get_final_list)
                this.index_of_notifications_to_show=15+ this.number_of_empties;
                this.notifications_pictures_retrieved=true;
                this.display_number_of_unchecked_notifications();
              }
            
          }
         
        })
      }
      if(status=="add" ){
        if( this.list_of_notifications_profile_pictures[i]){
          compteur_pp++;
          if(compteur_pp==this.list_of_notifications.length){
            ////console.log(" Az End pp for c " + compteur + " and r c " +  this.compteur_get_final_list)
            this.index_of_notifications_to_show=15+ this.number_of_empties;
            this.notifications_pictures_retrieved=true;
            this.display_number_of_unchecked_notifications();
          }
        }
        else{
          this.Profile_Edition_Service.retrieve_profile_picture_for_notifs(this.list_of_notifications[i].id_user,compteur).subscribe(t=> {
            if(this.compteur_get_final_list==t[1]){
              ////console.log("Az pp ret i " + i + "/" + this.list_of_notifications.length + " and c " +  compteur + " and r c " +  this.compteur_get_final_list)
              let url = (window.URL) ? window.URL.createObjectURL(t[0]) : (window as any).webkitURL.createObjectURL(t[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_notifications_profile_pictures[i] = SafeURL;
                compteur_pp++;
                if(compteur_pp==this.list_of_notifications.length){
                 // //console.log(" Az End pp for c " + compteur + " and r c " +  this.compteur_get_final_list)
                  this.index_of_notifications_to_show=15+ this.number_of_empties;
                  this.notifications_pictures_retrieved=true;
                  this.display_number_of_unchecked_notifications();
                }
              
            }
           
          })
        }

      }
      
    }
    
    
    
    
    ////console.log(this.final_list_of_notifications_to_show)
    ////console.log(this.dictionnary_of_similar_notifications)
    ////console.log(this.list_of_notifications)
  }

 
  display_number_of_unchecked_notifications(){
    let number=0;
    for(let i=0;i<this.list_of_notifications.length;i++){
      if(this.list_of_notifications[i].status=="unchecked"){
        number+=1;
      }
    }
    this.number_of_unchecked_notifications=number;
    ////console.log(.log("number_of_unchecked_notifications")
    ////console.log(.log(number)
  }

  indice=0
  get_date(created,i){
    if(created){
      let now=Math.trunc( new Date().getTime()/1000);
      let date=created
      date = date.replace("T",' ');
      date = date.replace("-",'/').replace("-",'/');
      let deco_date=Math.trunc( new Date(date + ' GMT').getTime()/1000)
      return get_date_to_show_navbar(now-deco_date);
    }
    else{
      return "A l'instant"
    }
    
  }

  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */

  list_of_first_propositions:any[]=[];
  list_of_last_propositions:any[]=[];
  list_of_thumbnails:SafeUrl[]=[];
  show_other_propositions=false;
  show_first_propositions=false;
  compteur_other_propositions=0;
  compteur_research=0;
  pp_thumb_is_loaded:any[]=[];
  loading_other=false;

  publication_category="All";
  format="unknown"
  target_id=0;
  pp_is_loaded=false;
  notification_loaded=[];
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
  first_propositions_retrieved=false;
  activateFocus() {
    //console.log("activateFocus")
    if(this.focus_activated){
      return
    };
    if(!this.display_first_propositions_triggered){
      //console.log("else if")
      //console.log(this.first_propositions_retrieved)
      //console.log(this.list_of_first_propositions_history)
      this.get_trendings_and_first_propositions();
    }
    else{
      //console.log("autre")
      this.focus_activated=true;
      this.researches_propositions()
    }
  }

  get_trendings_and_first_propositions(){
    //console.log("get_trendings_and_first_propositions")
    //console.log(this.publication_category)
    //console.log(this.first_propositions_retrieved)
    this.first_propositions_retrieved=false;
    this.compteur_recent+=1;
    this.loading_other=false;
    this.pp_thumb_hist_is_loaded=[];
    this.most_researched_propositions=[];
    this.list_of_first_propositions_history=[];
    this.list_of_last_propositions_history=[];
    this.list_of_thumbnails_history=[];
    this.compteur_first_propositions=0;
    this.focus_activated=true;
    this.show_researches_propositions=false;
    this.show_other_propositions=false;
    this.show_first_propositions=false;
    this.input.nativeElement.focus();
    this.loading_recent=true;
    this.cd.detectChanges();
    this.navbar.get_most_researched_navbar(this.publication_category,this.compteur_recent,"researched").subscribe(r=>{
      //console.log(r[0][0])
      if(r[1]==this.compteur_recent){
        this.most_researched_propositions=r[0][0];
        this.show_researches_propositions=true;
        this.show_most_researched_propositions=true;

        this.cd.detectChanges();
        this.initialize_swiper();
        this.initialize_swiper2();
        //this.swiper.update();
        //this.swiper2.update();
        this.cd.detectChanges();
        
        
      }
      
    });

    let last_research_retrieved=false;
    this.navbar.get_last_researched_navbar(this.publication_category,this.compteur_recent).subscribe(m=>{
      //console.log(m[0][0]);
      if(m[1]==this.compteur_recent){
        //console.log(m[0][0]);
        this.list_of_first_propositions_history=m[0][0];
       
        if(m[0][0].length>0){
          this.first_option=true;
          //console.log("list_of_first_propositions_history")
          //console.log(this.list_of_first_propositions_history)
          for(let i=0;i<m[0][0].length;i++){
            this.get_first_propositions(i,m[1])
          }
          this.first_propositions_retrieved=true;
          last_research_retrieved=true;
        }
        else{
          this.first_option=false;
          last_research_retrieved=true;
          check_other_propositions(this);
        }
        
      }
    })

    let most_researched_results;
    let most_researched_retrieved=false;
    this.navbar.get_most_researched_navbar(this.publication_category,this.compteur_recent,"clicked").subscribe(n=>{
      most_researched_results=n[0][0];
      //console.log(most_researched_results)
      if(n[1]==this.compteur_recent){
        most_researched_retrieved=true;
        check_other_propositions(this)
        
        
      }
    })

    function check_other_propositions(THIS){
      //console.log(last_research_retrieved)
      //console.log(THIS.first_propositions_retrieved)
      //console.log(most_researched_retrieved)
      if(last_research_retrieved && !THIS.first_propositions_retrieved && most_researched_retrieved){
        //console.log(most_researched_results);
        THIS.list_of_first_propositions_history=most_researched_results;
        if(most_researched_results.length>0){
          //console.log("list_of_first_propositions_history")
          //console.log(THIS.list_of_first_propositions_history)
          for(let i=0;i<most_researched_results.length;i++){
            THIS.get_first_propositions(i,THIS.compteur_recent)
          }
          THIS.first_propositions_retrieved=true;
        }
        else{
          THIS.loading_recent=false;
          THIS.first_propositions_retrieved=true;
        }
      }
      
    }
  }
  pp_thumb_hist_load(i){
    this.pp_thumb_hist_is_loaded[i]=true;
  }

  pp_thumb_load(i){
    this.pp_thumb_is_loaded[i]=true;
  }
  

  cancel_research(){
    //console.log("cancel research")
    this.compteur_research+=1;
    this.compteur_recent+=1;
    this.focus_activated=false;
    this.show_researches_propositions=false;
    this.show_first_propositions=false;
    this.loading_other=false;
    this.input.nativeElement.blur();
    
  }

  //for navbar extension
  cancel_search(){
    this.logo_is_loaded2=false;
    this.activated_search=false;
  }
  
  /*************************************** RESEARCH AFTER TYPING A WORD ************************************/
  /*************************************** RESEARCH AFTER TYPING A WORD ************************************/
  /*************************************** RESEARCH AFTER TYPING A WORD ************************************/


  researches_propositions(){
    ////console.log(this.input.nativeElement.value);
    this.compteur_research+=1;
    this.compteur_recent+=1;
    //this.show_other_propositions=false;
    this.show_first_propositions=false;
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.compteur_other_propositions=0;
    this.pp_thumb_is_loaded=[];
    this.loading_other=true;
    this.loading_recent=false;
    //vérifier que ca ne commence pas par un espace aussi
    this.cd.detectChanges();
    //console.log(this.input.nativeElement.value)
    if(this.input.nativeElement.value!=''){
      //console.log("if")
      if(this.input.nativeElement.value.replace(/\s/g, '').length>0){
        //console.log(" if if ")
        this.show_most_researched_propositions=false;
        let specific_retrieved=false;
        let global_retrieved=false;
        let tags_retrieved=false;
        let run_tags=false;
        this.navbar.get_specific_propositions_navbar(this.publication_category,this.input.nativeElement.value,this.compteur_research).subscribe(m=>{
          //console.log(m[0][0]);
          if(m[1]==this.compteur_research){
            this.show_researches_propositions=true;
            this.list_of_first_propositions=m[0][0];
            
            this.cd.detectChanges();
            this.initialize_swiper();
            this.initialize_swiper2();
            //this.swiper.update();
            //this.swiper2.update();
            
            this.cd.detectChanges();

            if(m[0][0].length<10){
              specific_retrieved=true;
              check_with_global(this)
            }
            else{
              for(let i=0;i<this.list_of_first_propositions.length;i++){
                this.get_other_propositions(i,m[1]);
              }
            }
          }
          
         
        })

        let global_result:any;
        this.navbar.get_global_propositions_navbar(this.publication_category,this.input.nativeElement.value,10,this.compteur_research).subscribe(r=>{
          ////console.log(r[0][0]);
          global_result=r[0][0]
          global_retrieved=true;
          if(r[1]==this.compteur_research && specific_retrieved){
            check_with_global(this)
            
          }
        })

        let tags_result:any;
        this.navbar.get_global_tags_propositions_navbar(this.publication_category,this.input.nativeElement.value,5,this.compteur_research).subscribe(u=>{
          //console.log(u[0][0]);
          tags_result=u[0][0];
          tags_retrieved=true;
          if(u[1]==this.compteur_research){
            check_with_tags(this)
           
          }
        })

        
        function check_with_global(THIS){
          if(global_retrieved && specific_retrieved){
            if(global_result.length>0){
              THIS.list_of_first_propositions=THIS.list_of_first_propositions.concat(global_result);
            }
            if(THIS.list_of_first_propositions.length<10){
              //console.log(THIS.list_of_first_propositions.length)
              run_tags=true;
              check_with_tags(THIS)
            }
            else{
              for(let i=0;i<THIS.list_of_first_propositions.length;i++){
                THIS.get_other_propositions(i,THIS.compteur_research);
              }
            }
          }
        }

        function check_with_tags(THIS){
          if(global_retrieved && specific_retrieved && tags_retrieved && run_tags){
            if(tags_result.length>0){
              let len=THIS.list_of_first_propositions.length;
              if(len>0){
                for(let j=0;j<tags_result.length;j++){
                  let ok=true;
                  for(let k=0;k<len;k++){
                    if( THIS.list_of_first_propositions[k].publication_category==tags_result[j].publication_category && THIS.list_of_first_propositions[k].format==tags_result[j].format && THIS.list_of_first_propositions[k].target_id==tags_result[j].target_id){
                      ok=false;
                    }
                    if(k==len-1){
                      if(ok){
                        THIS.list_of_first_propositions.push(tags_result[j])
                      }
                    }
                  }
                }
              }
              else{
                THIS.list_of_first_propositions=THIS.list_of_first_propositions.concat(tags_result);
              }
            }
            if(THIS.list_of_first_propositions.length>0){
              //console.log("this.list_of_first_propositions")
              //console.log(THIS.list_of_first_propositions)
              for(let i=0;i<THIS.list_of_first_propositions.length;i++){
                THIS.get_other_propositions(i,THIS.compteur_research);
              }
            }
            else{
              THIS.loading_other=false;
              THIS.show_other_propositions=true;
              THIS.cd.detectChanges();
            }
          }
        }
      }
      
    }
    else{
      //console.log("else")
      if(!this.display_first_propositions_triggered){
        //console.log("else if")
        //console.log(this.first_propositions_retrieved)
        //console.log(this.list_of_first_propositions_history)
        this.get_trendings_and_first_propositions();
      }
      else{
        //console.log("else else")
        this.show_researches_propositions=true;
        this.loading_other=false;
        this.show_other_propositions=false;
        this.show_first_propositions=true;
        this.show_most_researched_propositions=true;

        this.cd.detectChanges();
        this.initialize_swiper()
        this.initialize_swiper2();
        //this.swiper.update();
        //this.swiper2.update();
        this.cd.detectChanges();
      }
      
      
    }
    
  }

  display_first_propositions_triggered=false;
  display_first_propositions(category){
    //console.log("display firt propositions")
    //console.log(category)
    //console.log(this.list_of_first_propositions_history);
    //console.log(this.list_of_last_propositions_history)
    this.display_first_propositions_triggered=true;
    this.show_first_propositions=true;
    this.loading_recent=false;
    this.cd.detectChanges();
  }
  get_first_propositions(i,compteur){
    this.list_of_thumbnails_history[i]=null;
    if(this.list_of_first_propositions_history[i].publication_category=="Account"){
      ////console.log("Account");
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_first_propositions_history[i].target_id).subscribe(profile=>{
        if(compteur==this.compteur_recent){
          this.list_of_last_propositions_history[i]=profile[0];
          
          this.Profile_Edition_Service.retrieve_profile_picture(profile[0].id ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_recent){
              this.list_of_thumbnails_history[i] = SafeURL;
              
            }
           
          });
          this.compteur_first_propositions++;
          if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
            this.display_first_propositions("Account")
          }
        }
        
      })
    }

    if(this.list_of_first_propositions_history[i].publication_category=="Ad"){
      ////console.log("artist");
      this.Ads_service.retrieve_ad_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(ad=>{
        if(compteur==this.compteur_recent){
          this.list_of_last_propositions_history[i]=ad[0];
          this.Ads_service.retrieve_ad_thumbnail_picture(ad[0].thumbnail_name ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_recent){
              this.list_of_thumbnails_history[i] = SafeURL;
              
            }
           
          })
          this.compteur_first_propositions++;
          if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
            this.display_first_propositions("Ad")
          }
        }
      })
    }

    if(this.list_of_first_propositions_history[i].publication_category=="Comic"){
      ////console.log("comic");
      if(this.list_of_first_propositions_history[i].format=="one-shot"){
        this.BdOneShotService.retrieve_bd_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            ////console.log(this.list_of_first_propositions_history[i].target_id);
            this.BdOneShotService.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = SafeURL;
                  
                }
                
            })
            this.compteur_first_propositions++;
            if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
              this.display_first_propositions("Comic one-shot")
            }
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
                 
                }
            })
            this.compteur_first_propositions++;
            if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
              this.display_first_propositions("Comic serie")
            }
          }
        })
      }
    }

    if(this.list_of_first_propositions_history[i].publication_category=="Drawing"){
      ////console.log("drawing");
      if(this.list_of_first_propositions_history[i].format=="one-shot"){
        this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            this.Drawings_Onepage_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = SafeURL;
                  
                }
            })
            this.compteur_first_propositions++;
                  if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
                    this.display_first_propositions("Drawing one-shot")
                  }
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
                  
                }
            })
            this.compteur_first_propositions++;
                  if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
                    this.display_first_propositions("Drawing artbook")
                  }
          }
          
        })
      }
    }

    if(this.list_of_first_propositions_history[i].publication_category=="Writing"){
      ////console.log("writing");
      this.Writing_Upload_Service.retrieve_writing_information_by_id(this.list_of_first_propositions_history[i].target_id).subscribe(comic=>{
        if(compteur==this.compteur_recent){
          this.list_of_last_propositions_history[i]=comic[0];
          this.Writing_Upload_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(compteur==this.compteur_recent){
                this.list_of_thumbnails_history[i] = SafeURL;
               
              }
              
          })
          this.compteur_first_propositions++;
          if(this.compteur_first_propositions==this.list_of_first_propositions_history.length){
            this.display_first_propositions("writing")
          }
        }
       
      })
    }
  }

  /**************************************** DISPLAY OTHER PROPOSITIONS  ********************************/
  /**************************************** DISPLAY OTHER PROPOSITIONS  ********************************/
  /**************************************** DISPLAY OTHER PROPOSITIONS  ********************************/

  display_other_propositions(category){
    //console.log("display_other_propositions")
    //console.log(category)
    //console.log(this.list_of_first_propositions);
    //console.log(this.list_of_last_propositions)
    this.show_other_propositions=true;
    this.loading_other=false;
    this.cd.detectChanges();
  }
  get_other_propositions(i,compteur){
    //console.log("get_other_propositions")
    //console.log(this.compteur_research)
    //console.log(this.list_of_first_propositions)
    //console.log(this.list_of_first_propositions.length)
    //console.log(i)
    //console.log(this.list_of_first_propositions[i])
    this.list_of_thumbnails[i]=null;
    if(this.list_of_first_propositions[i].publication_category=="Account"){
      
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_first_propositions[i].target_id).subscribe(profile=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=profile[0];
          this.list_of_thumbnails[i]=null;
          this.Profile_Edition_Service.retrieve_profile_picture(profile[0].id ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_research){
              this.list_of_thumbnails[i] = SafeURL;
             
            }
           
          });
          this.compteur_other_propositions++;
          //console.log("Account");
          //console.log(i)
          //console.log(this.compteur_other_propositions)
          if(this.compteur_other_propositions==this.list_of_first_propositions.length){
           this.display_other_propositions("account")
          }
        }
        
      })
    }

    if(this.list_of_first_propositions[i].publication_category=="Ad"){
      ////console.log("artist");
      this.Ads_service.retrieve_ad_by_id(this.list_of_first_propositions[i].target_id).subscribe(profile=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=profile[0];
          this.Ads_service.retrieve_ad_thumbnail_picture(profile[0].thumbnail_name ).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_research){
              this.list_of_thumbnails[i] = SafeURL;
             
            }
           
          });
          this.compteur_other_propositions++;
          //console.log("ad")
          //console.log(i)
          //console.log(this.compteur_other_propositions)
          if(this.compteur_other_propositions==this.list_of_first_propositions.length){
            this.display_other_propositions("ad")
          }
        }
        
      })
    }

    if(this.list_of_first_propositions[i].publication_category=="Comic"){
      ////console.log("comic");
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.BdOneShotService.retrieve_bd_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.BdOneShotService.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = SafeURL;
                 
                }
                
            })
            this.compteur_other_propositions++;
            //console.log("com os")
            //console.log(i)
            //console.log(this.compteur_other_propositions)
            if(this.compteur_other_propositions==this.list_of_first_propositions.length){
              this.display_other_propositions("comic osh")
            }
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
                  
                }
            })
            this.compteur_other_propositions++;
            //console.log("com s")
            //console.log(i)
            //console.log(this.compteur_other_propositions)
            if(this.compteur_other_propositions==this.list_of_first_propositions.length){
              this.display_other_propositions("comic serie")
            }
          }
        })
      }
    }

    if(this.list_of_first_propositions[i].publication_category=="Drawing"){
      ////console.log("drawing");
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.Drawings_Onepage_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = SafeURL;
                  
                }
            })
            this.compteur_other_propositions++;
            //console.log("draw os")
            //console.log(i)
            //console.log(this.compteur_other_propositions)
            if(this.compteur_other_propositions==this.list_of_first_propositions.length){
              this.display_other_propositions("drawing os")
            }
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
                  
                }
            })
            this.compteur_other_propositions++;
            //console.log("draw a")
            //console.log(i)
            //console.log(this.compteur_other_propositions)
            if(this.compteur_other_propositions==this.list_of_first_propositions.length){
              this.display_other_propositions("drawing art")
            }
          }
          
        })
      }
    }

    if(this.list_of_first_propositions[i].publication_category=="Writing"){
      ////console.log("writing");
      this.Writing_Upload_Service.retrieve_writing_information_by_id(this.list_of_first_propositions[i].target_id).subscribe(comic=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=comic[0];
          this.Writing_Upload_Service.retrieve_thumbnail_picture(comic[0].name_coverpage).subscribe(t=>{
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(compteur==this.compteur_research){
                this.list_of_thumbnails[i] = SafeURL;
               
              }
              
          })
          this.compteur_other_propositions++;
          //console.log("writing")
          //console.log(i)
          //console.log(this.compteur_other_propositions)
          if(this.compteur_other_propositions==this.list_of_first_propositions.length){
            this.display_other_propositions("writing")
          }
        }
       
      })
    }
  }

  /**************************************** ACCOUNT NAVIGATION  ***********************************/
  /**************************************** ACCOUNT NAVIGATION  ***********************************/
  /**************************************** ACCOUNT NAVIGATION  ***********************************/
  get_my_profile() {
    return "/account/" + this.pseudo + "/" + this.user_id;
  }

  go_to_home(){

    this.not_using_chat();
    this.router.navigate(['/']);
  }
  
  go_to_linkcollab(){
    this.not_using_chat();
    this.router.navigate(['/linkcollab']);
  }

  /**************************************** SEARCHBAR NAVIGATION  ***********************************/
  /**************************************** SEARCHBAR NAVIGATION  ***********************************/
  /**************************************** SEARCHBAR NAVIGATION  ***********************************/


  go_to_section(i:number) {
    if(i==0) {
      this.router.navigate(["/"]);
    }
    else if(i==1) {
      this.router.navigate(["/linkcollab"]);
    }
    else {
      this.router.navigate(["/"]);
    }
  }

  go_to_page(s:string) {
    this.router.navigate([s]);
  }


  //WORDS
  open_research_style_and_tags(i: number) {
    return "/main-research-style-and-tag/1/"+ this.first_filters[this.indice_title_selected][i] + "/item/all";
  }
  open_main_research(s: string) {
    this.router.navigate([`/main-research/1/${s}/All`]);
  }

  //ACCOUNTS
  open_account(i: number) {
    //console.log("open_account")
    this.cancel_research()
    this.not_using_chat();
    this.loading_research=true;
    let user =this.list_of_last_propositions[i]
    this.navbar.add_main_research_to_history("Account","unknown",user.id,user.nickname,user.firstname + ' ' + user.lastname,"clicked_after_research",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).subscribe(r=>{
      this.loading_research=false;
      return
    })
  }
  get_account(i:number) {
    return "/account/" + this.list_of_last_propositions[i].nickname +"/"+ this.list_of_last_propositions[i].id;
  }

  open_history_account(i: number) {
    //console.log("open_history_account")
    this.cancel_research();
    this.not_using_chat();
    this.loading_research=true;
    let user =this.list_of_last_propositions_history[i];
    this.navbar.add_main_research_to_history("Account","unknown",user.id,user.nickname,user.firstname + ' ' + user.lastname,"clicked_after_research",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).subscribe(r=>{
      this.loading_research=false;
      return
    })
  }
  get_history_account(i: number) {
    return "/account/" + this.list_of_last_propositions_history[i].nickname + "/" + this.list_of_last_propositions_history[i].id;
  }

  //ANNONCES
  open_ad_last_propositions(i: number) {
    this.cancel_research()
    this.loading_research=true;
    this.not_using_chat();
    let ad =this.list_of_last_propositions[i];
    this.navbar.add_main_research_to_history("Ad",null,ad.id,ad.title, null,"clicked_after_research",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).subscribe(r=>{
      this.loading_research=false;
      return
    })
  }

  get_ad_last_propositions(i:number) {
    return "/ad-page/"+this.list_of_last_propositions[i].title +"/"+ this.list_of_last_propositions[i].id;
  }

  open_ad_last_propositions_history(i: number) {
    this.cancel_research()
    this.loading_research=true;
    this.not_using_chat();
    let ad =this.list_of_last_propositions_history[i];
    this.navbar.add_main_research_to_history("Ad",null,ad.id,ad.title, null,"clicked_after_research",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).subscribe(r=>{
      this.router.navigate([`/ad-page/${this.list_of_last_propositions_history[i].title}/${this.list_of_last_propositions_history[i].id}`]);
      this.loading_research=false;
      return
    })
  }
  get_ad_last_propositions_history(i: number) {
    return "/ad-page/" + this.list_of_last_propositions_history[i].title + "/" + this.list_of_last_propositions_history[i].id;
  }


  //ARTWORKS
  open_artwork_last_proposition(s:any, i:number) {
    this.cancel_research()
    this.loading_research=true;
    let artwork=this.list_of_last_propositions[i];
    this.not_using_chat();
    //console.log(s)
    if(s.publication_category=="Writing") {
      this.navbar.add_main_research_to_history(s.publication_category,"unknown",s.target_id,artwork.title, null,"clicked_after_research",0,0,0,0,artwork.style,artwork.firsttag,artwork.secondtag,artwork.thirdtag,this.type_of_profile).subscribe(r=>{
        this.loading_research=false;
        return
      })
      
    }
    else {
      //console.log(s.format)
      this.navbar.add_main_research_to_history(s.publication_category,s.format,s.target_id,artwork.title, null,"clicked_after_research",0,0,0,0,artwork.style,artwork.firsttag,artwork.secondtag,artwork.thirdtag,this.type_of_profile).subscribe(r=>{
        this.router.navigate([`/artwork-${s.publication_category.toLowerCase()}/${s.format}/${this.list_of_last_propositions[i].title}/${s.target_id}`]);
        this.loading_research=false;
        return
      })
     
    }
  }
  get_artwork_last_proposition(s:any, i:number) {
    if(s.publication_category=="Writing") {
      return "/artwork-" + s.publication_category.toLowerCase() + "/" + this.list_of_last_propositions[i].title + "/" + s.target_id;
    }
    else {
      return "/artwork-" + s.publication_category.toLowerCase() + "/" + s.format + "/" + this.list_of_last_propositions[i].title + "/" + s.target_id;
    }

  }

  open_artwork_last_proposition_history(s:any, i:number) {
    this.cancel_research()
    this.loading_research=true;
    let artwork=this.list_of_last_propositions_history[i];
    this.not_using_chat();
    //console.log(s)
    if(s.publication_category=="Writing") {
      this.navbar.add_main_research_to_history(s.publication_category,"unknown",s.target_id,artwork.title, null,"clicked_after_research",0,0,0,0,artwork.style,artwork.firsttag,artwork.secondtag,artwork.thirdtag,this.type_of_profile).subscribe(r=>{
        this.router.navigate([`/artwork-${s.publication_category.toLowerCase()}/${this.list_of_last_propositions_history[i].title}/${s.target_id}`]);
        this.loading_research=false;
        return
      })
     
    }
    else {
      this.navbar.add_main_research_to_history(s.publication_category,s.format,s.target_id,artwork.title, null,"clicked_after_research",0,0,0,0,artwork.style,artwork.firsttag,artwork.secondtag,artwork.thirdtag,this.type_of_profile).subscribe(r=>{
        this.router.navigate([`/artwork-${s.publication_category.toLowerCase()}/${s.format}/${this.list_of_last_propositions_history[i].title}/${s.target_id}`]);
        this.loading_research=false;
        return
      })
     
    }
  }

  get_artwork_last_proposition_history(s:any, i:number) {
    if(s.publication_category=="Writing") {
      return "/artwork-" + s.publication_category.toLowerCase() + "/" + this.list_of_last_propositions_history[i].title + "/" + s.target_id;
    }
    else {
      return "/artwork-" + s.publication_category.toLowerCase() + "/" + s.format + "/" + this.list_of_last_propositions_history[i].title + "/" + s.target_id;
    }
  }


  /******************************************** CHAT NAVIGATION  *************************************/
  /******************************************** CHAT NAVIGATION  *************************************/
  /******************************************** CHAT NAVIGATION  *************************************/


  open_chat_2() {
    this.show_chat_messages=false;
  }
  get_chat_2(i:number) {
    return "/chat/" + this.get_chat_url(i);
  }


  open_chat_main() {
    this.show_chat_messages=false;
    this.router.navigate([`/chat`]);
  }
  



  /*************************************** NOTIFICATIONS NAVIGATION *********************************/
  /*************************************** NOTIFICATIONS NAVIGATION *********************************/
  /*************************************** NOTIFICATIONS NAVIGATION *********************************/

  close_notifications(){
    this.show_notifications=false;
    this.change_notifications_status_to_checked();
    this.cd.detectChanges();
  }


  open_my_account() {
    this.not_using_chat();
    if(this.show_notifications){
      this.close_notifications();
    }
  }
  get_my_account() {
    return "/account/" + this.pseudo + "/" + this.user_id + "/my_account";
  }

  really_open_my_profile() {
    this.not_using_chat();
    this.router.navigate([`/account/${this.pseudo}/${this.user_id}`]);
  }
  really_open_my_account() {
    this.not_using_chat();
    this.router.navigate([`/account/${this.pseudo}/${this.user_id}/my_account`]);
  }

  open_my_trending(){
    this.not_using_chat();
    this.close_notifications();
  }
  get_my_trending(category) {
    this.not_using_chat();
    if(category=='comic'){
      return "/trendings/comics"
    }
    if(category=='drawing'){
      return "/trendings/drawings"
    }
    if(category=='writing'){
      return "/trendings/writings"
    }
  }

 
  get_my_favorite() {
      return "/favorites"
  }
  
  get_account_for_notification(notif:any) {
    return "/account/" + notif.id_user_name + "/" + notif.id_user;
  }
  open_comic(notif:any) {
    this.not_using_chat();
    this.close_notifications();
  }
  get_comic(notif:any) {
    return "/artwork-comic/" + notif.format + "/" + notif.publication_name + "/" + notif.publication_id;
  }

  open_comic_chapter(notif:any) {
    this.not_using_chat();
    this.close_notifications();
  }
  get_comic_chapter(notif:any) {
    return "/artwork-comic/" + notif.format + "/" + notif.publication_name + "/" + notif.publication_id + "/" + notif.chapter_number;
  }
  open_drawing(notif:any) {
    this.not_using_chat();
    this.close_notifications();
  }
  get_drawing(notif:any) {
    return "/artwork-drawing/" + notif.format + "/" + notif.publication_name + "/" + notif.publication_id;
  }
  open_writing(notif:any) {
    this.not_using_chat();
    this.close_notifications();
  }
  get_writing(notif:any) {
    return "/artwork-writing/" + notif.publication_name + "/" + notif.publication_id;
  }
  open_ad(notif:any) {
    this.not_using_chat();
    this.close_notifications();
  }
  get_ad(notif:any) {
    return "/ad-page/" + notif.publication_name + "/" + notif.publication_id;
  }


  keydown_researches_propositions(event){
    if(event.key=="Enter") {
      this.click_on_research();
      //get_more_propositions (add to history)
    }
  }

  loading_research=false;
  click_on_research(){
    if( this.input.nativeElement.value.trim().length == 0 ) {
      return;
    }
    this.cancel_research();
    this.not_using_chat();
    this.loading_research=true;
    this.navbar.add_main_research_to_history(this.publication_category,this.format,this.target_id,this.input.nativeElement.value,null,"researched",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).subscribe(r=>{
      ////console.log(r);
      this.router.navigate([`/main-research/1/${this.input.nativeElement.value}/${this.publication_category}`]);
      this.loading_research=false;
      this.activated_search=false;
      return;
    })
  }

  click_on_trending_message(i){
    this.cancel_research();
    this.not_using_chat();
    this.loading_research=true;
    let str=this.most_researched_propositions[i].research_string;
    this.navbar.add_main_research_to_history(this.publication_category,this.format,this.target_id,str,null,"researched",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).subscribe(r=>{
      this.loading_research=false;
      this.activated_search=false;
      return;
    })
  }

  get_trending_message(i) {
    let str=this.most_researched_propositions[i].research_string;
    return "/main-research/1/" + str + "/All";
  }

  add_clicked_after_research(i){
    let lst=this.list_of_first_propositions[i];
    let lst2=this.list_of_last_propositions[i];
    this.navbar.add_main_research_to_history(lst.publication_category,lst.format,lst.target_id,lst.research_string,lst.research_string1,"clicked_after_research",lst2.number_of_comics,lst2.number_of_drawings,lst2.number_of_writings,lst2.number_of_ads,lst2.category,lst2.firsttag,lst2.secondtag,lst2.thirdtag,this.type_of_profile).subscribe()
  }

  add_clicked_after_research_recent(i){
    let lst=this.list_of_first_propositions_history[i];
    let lst2=this.list_of_last_propositions_history[i];
    this.navbar.add_main_research_to_history(lst.publication_category,lst.format,lst.target_id,lst.research_string,lst.research_string1,"clicked_after_research",lst2.number_of_comics,lst2.number_of_drawings,lst2.number_of_writings,lst2.number_of_ads,lst2.category,lst2.firsttag,lst2.secondtag,lst2.thirdtag,this.type_of_profile).subscribe()
  }

  delete_from_history(i,event:any){
    
    event.stopPropagation();
    let str=this.list_of_first_propositions_history[i].research_string
    ////console.log(str);
    this.navbar.delete_click_after_ressearch_from_history(str).subscribe(r=>{
      ////console.log(r);
      this.list_of_first_propositions_history.splice(i,1);
      this.list_of_last_propositions_history.splice(i,1);
    })
  }
/***************************************login  **********************************/
/***************************************logout  **********************************/
  disconnecting = false;

  logout() {
    console.log("logout")
    if (this.disconnecting) {
      return
    }
    this.disconnecting = true;
    clearInterval(this.get_connection_interval)

    this.AuthenticationService.logout().subscribe(r => {
      let recommendations_string = this.CookieService.get('recommendations');
      //console.log(recommendations_string)
      if (recommendations_string) {
        this.disconnecting = false;
        this.location.go('/')
        location.reload();

      }
      else {
        this.Community_recommendation.generate_recommendations().subscribe(r => {
          this.disconnecting = false;
          this.cd.detectChanges();
          this.location.go('/')
          location.reload();
        })
      }
    });
  }

  login(){
    const dialogRef = this.dialog.open(LoginComponent, {
      data: {usage:"login"},
      panelClass:"loginComponentClass"
    });
  }

  signup(){
    const dialogRef = this.dialog.open(SignupComponent, {
      data:{for_group_creation:false},
      panelClass:"signupComponentClass"
    });
  }

  /***************************************Style navbar **********************************/
/***************************************Style  **********************************/
/***************************************Style  **********************************/
/***************************************Style  **********************************/



  
  ngAfterViewChecked() {
    
    this.setHeight();
  }
  show_icon=false;
  ngAfterViewInit(){
 
    //console.log(this.navbar.visible)
    if( this.navbar.visible ) {
      this.rd.setStyle(this.navbarMargin.nativeElement, "height", "54px");
        this.initialize_selectors();
    }
    else {
      this.rd.setStyle(this.navbarMargin.nativeElement, "height", "0px");
    }
  }

  setHeight() {
    this.navbar.setHeight( $(".fixed-top").height() );
  }
  
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


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
  if(this.type_of_profile_retrieved){
    this.show_selector=true;
    this.cd.detectChanges();
    
  }
    

}



@ViewChild('navbarSelect') navbarSelect;
@ViewChild('navbarSelect2') navbarSelect2;

@ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

@HostListener('window:resize', ['$event'])
onResize(event) {
  if( this.navbarSelect ) {
    this.navbarSelect.close();
  }
  if( this.navbarSelect2 ) {
    this.navbarSelect2.close();
  }
  if(this.trigger){
    this.trigger.closeMenu();
  }


}

sectionChange(e:any) {
  this.input.nativeElement.value="";
  
  this.publication_category=e;
  if(this.publication_category=="Comic" || this.publication_category=="Drawing" || this.publication_category=="Writing"){
    this.display_style_and_tag_research=true;
    this.indice_title_selected=this.list_of_real_categories.indexOf(this.publication_category);
  }
  else{
    this.display_style_and_tag_research=false;
    this.indice_title_selected=-1
  }
}
sectionChange2(e:any) {
  if(e>=0){
    this.not_using_chat();
    this.go_to_section( e );
  }

}

/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/
/********************************************* CHAT MESSAGES NOTIFICATIONS ****************************/

//chat_friends and groups
list_of_chat_friends_ids:number[]=[]; // id de la liste list_of_chat_friends
number_of_friends_to_show:number=10;
list_of_friends_types:any[]=[];
list_of_friends_profile_pictures:any[]=[];
list_of_friends_pseudos:any[]=[];
list_of_friends_names:any[]=[];
list_of_friends_certifications:any[]=[];
list_of_friends_ids:any[]=[];
list_of_friends_last_message:any[]=[];
list_of_friends_retrieved=false;
list_of_friends_date=[]
list_of_friends_users_only=[];

list_of_last_connection_dates=[];
list_of_friends_connected=[];
connections_status_retrieved=false;
list_of_groups_retrieved=false;
list_of_groups_ids=[];

open_messages_notifs(event: any) {
  event.stopPropagation();
  this.open_messages();
}
open_messages(){
  
  if(this.show_chat_messages){
    this.show_chat_messages=false;
    return;
  }
  else if(this.navbar.get_using_chat()){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:'Vous êtes déjà dans la messagerie'},
      panelClass: "popupConfirmationClass",
    });
  }
  else{
    //console.log("open message")
    this.show_chat_messages=true;
    //console.log(this.data_retrieved)
    //console.log(this.using_chat_retrieved)
    //console.log(this.data_retrieved)
    //console.log(this.list_of_friends_retrieved)
  }
 
}

open_notifications_notifs(event: any){
  event.stopPropagation();
  this.open_notifications();
}

open_notifications(){
  if(this.show_notifications){
    this.show_notifications=false;
    this.change_notifications_status_to_checked();
    return
  }
  
  else{
    for(let i=0;i<this.list_of_notifications.length;i++){
      this.list_of_notifications_dates[i]=this.get_date(this.list_of_notifications[i].createdAt,i);
    }
    this.show_notifications=true;
  }
}


sort_friends_list() {
  this.list_of_chat_friends_ids=[]; 
  this.number_of_friends_to_show=10;
  this.list_of_friends_types=[];
  this.list_of_friends_profile_pictures=[];
  this.list_of_friends_pseudos=[];
  this.list_of_friends_names=[];
  this.list_of_friends_certifications=[];
  this.list_of_friends_ids=[];
  this.list_of_friends_last_message=[];
  this.list_of_friends_retrieved=false;
  this.list_of_friends_date=[]
  this.list_of_friends_users_only=[];

  this.list_of_last_connection_dates=[];
  this.list_of_friends_connected=[];
  this.connections_status_retrieved=false;
  this.list_of_groups_retrieved=false;
  this.list_of_groups_ids=[];

  ////console.log("first sort friends list")
  this.chatService.get_list_of_users_I_talk_to().subscribe(r=>{

    let friends=r[0].friends;
    if(friends.length>0){
      let compt=0;
      let compt_pp=0;
      ////console.log(friends)
      for(let i=0;i<friends.length;i++){
        this.list_of_chat_friends_ids[i]=friends[i].id;
        let data_retrieved=false;
        if(friends[i].id_user==this.user_id){
            
            this.list_of_friends_types[i]='user';
            this.list_of_friends_users_only[i]=friends[i].id_receiver;
            this.list_of_friends_ids[i]=friends[i].id_receiver;
            this.list_of_friends_date[i]=new Date(friends[i].date).getTime()/1000;
            this.Profile_Edition_Service.retrieve_profile_data(friends[i].id_receiver).subscribe(s=>{
              this.list_of_friends_pseudos[i]=s[0].nickname;
              this.list_of_friends_names[i]=s[0].firstname + ' ' + s[0].lastname;
              this.list_of_friends_certifications[i]=s[0].certified_account;
              data_retrieved=true;
              all_retrieved(this);
            });

            this.Profile_Edition_Service.retrieve_profile_picture( friends[i].id_receiver ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures_by_ids_users[friends[i].id_receiver] = SafeURL;
              //console.log( this.list_of_pictures_by_ids_users)
              compt_pp++;
              //console.log(compt_pp)
              //console.log(friends.length)
              if(compt_pp==friends.length){
                this.sort_list_of_profile_pictures()
              }
            });
           
            
            function all_retrieved(THIS){
              if(data_retrieved ){
                compt ++;
                if(compt==friends.length){
                  ////console.log(this.list_of_friends_ids)
                  THIS.chatService.get_last_friends_message(THIS.list_of_friends_ids).subscribe(u=>{
                    THIS.list_of_friends_last_message=u[0].list_of_friends_messages;
                    THIS.sort_friends_groups_chats_list();
                  });
                }
              }
            }
        }
        else{
            this.list_of_friends_types[i]='user';
            this.list_of_friends_ids[i]=friends[i].id_user;
            this.list_of_friends_users_only[i]=friends[i].id_user;
            this.list_of_friends_date[i]=new Date(friends[i].date).getTime()/1000;
            this.Profile_Edition_Service.retrieve_profile_data(friends[i].id_user).subscribe(s=>{
              this.list_of_friends_pseudos[i]=s[0].nickname;
              this.list_of_friends_names[i]=s[0].firstname + ' ' + s[0].lastname;
              this.list_of_friends_certifications[i]=s[0].certified_account;
              data_retrieved=true;
              all_retrieved(this);
            });

            this.Profile_Edition_Service.retrieve_profile_picture(  friends[i].id_user ).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures_by_ids_users[friends[i].id_user] = SafeURL;
              //console.log( this.list_of_pictures_by_ids_users)
              compt_pp++
              //console.log(compt_pp)
              //console.log(friends.length)
              if(compt_pp==friends.length){
                this.sort_list_of_profile_pictures()
              }
            });

            
            function all_retrieved(THIS){
              if(data_retrieved ){
                compt ++;
                if(compt==friends.length){
                  ////console.log(this.list_of_friends_ids)
                  THIS.chatService.get_last_friends_message(THIS.list_of_friends_ids).subscribe(u=>{
                    THIS.list_of_friends_last_message=u[0].list_of_friends_messages;
                    ////console.log(this.list_of_friends_last_message)
                    THIS.sort_friends_groups_chats_list();
                  });
                }
              }
            }
        }
      }
    }
    else{
      ////console.log("régler le cas 0 ...")
    }
    
  })
};


sort_friends_groups_chats_list(){
  let len =this.list_of_friends_ids.length;
  this.chatService.get_my_list_of_groups().subscribe(l=>{
    let list_of_names=[]
    if(l[0].length>0){
      for(let k=0;k<l[0].length;k++){
        
        list_of_names.push(l[0][k].name)
        this.list_of_friends_names[len+k]=l[0][k].name;
        this.list_of_friends_certifications[len+k]=null;
        this.list_of_friends_pseudos[len+k]=l[0][k].name
        this.list_of_groups_ids[k]=l[0][k].id;
        if(k==l[0].length-1){
          // get_list_of_groups_I_am_in sans les spams
          this.chatService.get_list_of_groups_I_am_in( this.list_of_groups_ids).subscribe(r=>{
           
            let compt=0;
            let list_of_ids=[]
            for(let i=0;i<r[0].friends.length;i++){
              list_of_ids.push(r[0].friends[i].id_receiver);
              this.list_of_chat_friends_ids[len+i]=r[0].friends[i].id;
              this.list_of_friends_ids[len+i]=r[0].friends[i].id_receiver;
              this.list_of_friends_date[len+i]=new Date(r[0].friends[i].date).getTime()/1000;
              this.list_of_friends_types[len+i]='group';
              
              this.chatService.retrieve_chat_profile_picture(r[0].friends[i].chat_profile_pic_name,r[0].friends[i].profile_pic_origin).subscribe(t=> {
               
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                
                this.list_of_pictures_by_ids_groups[r[0].friends[i].id_receiver] = SafeURL;
                //console.log( this.list_of_pictures_by_ids_groups)
                compt ++;
                if(compt==r[0].friends.length){
                  this.sort_list_of_profile_pictures();
                }
              });

            }
            this.chatService.get_last_friends_groups_message(list_of_ids).subscribe(u=>{    
              this.list_of_friends_last_message=this.list_of_friends_last_message.concat(u[0].list_of_friends_messages);
              this.sort_list_of_groups_and_friends();
            });
          })
        }
      }
      
    }
    else{
      this.can_sort_list_of_profile_pictures=true;
      if(this.list_of_pp_sorted_tried){
        this.sort_list_of_profile_pictures()
      }
      this.get_connections_status();
      this.list_of_friends_retrieved=true;
    }
    
    
    
  })
}

sort_list_of_groups_and_friends(){
  let length=this.list_of_friends_ids.length
  for(let i=1;i<length;i++){
    for(let j=0;j<i;j++){
      if(this.list_of_friends_date[i]>this.list_of_friends_date[j]){
        this.list_of_chat_friends_ids.splice(j,0,this.list_of_chat_friends_ids.splice(i,1)[0]);
        this.list_of_friends_last_message.splice(j,0,this.list_of_friends_last_message.splice(i,1)[0]);
        this.list_of_friends_date.splice(j,0,this.list_of_friends_date.splice(i,1)[0]);
        this.list_of_friends_ids.splice(j,0,this.list_of_friends_ids.splice(i,1)[0]);
        this.list_of_friends_types.splice(j,0,this.list_of_friends_types.splice(i,1)[0]);
        this.list_of_friends_names.splice(j,0,this.list_of_friends_names.splice(i,1)[0]);
        this.list_of_friends_certifications.splice(j,0,this.list_of_friends_certifications.splice(i,1)[0]);
        
        this.list_of_friends_pseudos.splice(j,0,this.list_of_friends_pseudos.splice(i,1)[0]);
      }
    }
  }
  this.can_sort_list_of_profile_pictures=true;
  if(this.list_of_pp_sorted_tried){
    this.sort_list_of_profile_pictures()
  }
  this.get_connections_status();
  this.list_of_friends_retrieved=true;
}

list_of_pp_sorted=false;
list_of_pp_sorted_tried=false;
can_sort_list_of_profile_pictures=false;
list_of_pictures_by_ids_users={};
list_of_pictures_by_ids_groups={};
sort_list_of_profile_pictures(){
  //console.log("try pp")
  if(this.can_sort_list_of_profile_pictures){
    //console.log("sort_listpp")
    //console.log( this.list_of_pictures_by_ids_users)
    //console.log(this.list_of_pictures_by_ids_groups)
    let length=this.list_of_friends_ids.length;
    for(let i=0;i<length;i++){
      if(this.list_of_friends_types[i]=='user'){
        this.list_of_friends_profile_pictures[i]=this.list_of_pictures_by_ids_users[this.list_of_friends_ids[i]]
      }
      else{
        this.list_of_friends_profile_pictures[i]=this.list_of_pictures_by_ids_groups[this.list_of_friends_ids[i]]
      }
     
    }
    //console.log(this.list_of_friends_ids)
    //console.log(this.list_of_friends_profile_pictures)
    this.list_of_pp_sorted=true;
  }
  else{
    this.list_of_pp_sorted_tried=true;
  }
  
}

friends_pp_loaded=[]
load_friends_pp(i){
  this.friends_pp_loaded[i]=true;
}

get_connections_status(){
  ////console.log(this.list_of_friends_users_only)
  this.chatService.get_users_connected_in_the_chat(this.list_of_friends_users_only).subscribe(r=>{
    ////console.log(r)
    //console.log(r[0].list_of_users_connected);
    ////console.log(this.list_of_friends_types)
    let compt=0
    for(let i=0;i<this.list_of_friends_types.length;i++){
      
      if(this.list_of_friends_types[i]=='user'){
        let id=this.list_of_friends_ids[i]
        let index=this.list_of_friends_users_only.indexOf(id);
        this.list_of_friends_connected[i]=r[0].list_of_users_connected[index];
        if(r[0].date_of_webSockets_last_connection[id]){
          let now=Math.trunc( new Date().getTime()/1000);
          let date=r[0].date_of_webSockets_last_connection[id];
          date = date.replace("T",' ');
          date = date.replace("-",'/').replace("-",'/');
          let deco_date=Math.trunc( new Date(date + ' GMT').getTime()/1000)
          this.list_of_last_connection_dates[i]=get_date_to_show_chat(now-deco_date);
        }
        compt++;
        //console.log(this.list_of_friends_types.length)
        if(compt==this.list_of_friends_types.length){
          this.connections_status_retrieved=true;
          this.cd.detectChanges()
        }
      }
      else{
        this.chatService.get_group_chat_information(this.list_of_friends_ids[i]).subscribe(l=>{
          let list=l[0].list_of_receivers_ids;
          let value=false;
          for(let j=0;j<list.length;j++){
            if(list[j]!=this.user_id){
              let index=this.list_of_friends_users_only.indexOf(list[j])
              if(r[0].list_of_users_connected[index]){
                value=true;
              }
            }
          }
          this.list_of_friends_connected[i]=value;
          compt++;
          if(compt==this.list_of_friends_types.length){
            this.connections_status_retrieved=true;
            this.cd.detectChanges()
          }
        })
      }
    }
  })
}

//un utilisateur a quitté le groupe
display_exit(event){
  let index=-1;
  for(let i=0;i<this.list_of_friends_ids.length;i++){
    if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]=='group'){
      index=i;
    }
  }
  this.list_of_friends_types.splice(0,0,this.list_of_friends_types.splice(index,1)[0]);
  this.list_of_friends_ids.splice(0,0,this.list_of_friends_ids.splice(index,1)[0]);
  this.list_of_friends_last_message[index]=event.message;
  this.list_of_friends_last_message.splice(0,0,this.list_of_friends_last_message.splice(index,1)[0]);
  this.list_of_friends_certifications.splice(0,0,this.list_of_friends_certifications.splice(index,1)[0]);
  
  this.list_of_friends_names.splice(0,0,this.list_of_friends_names.splice(index,1)[0]);
  this.list_of_chat_friends_ids.splice(0,0,this.list_of_chat_friends_ids.splice(index,1)[0]);
  this.list_of_friends_profile_pictures.splice(0,0,this.list_of_friends_profile_pictures.splice(index,1)[0]);
  this.list_of_friends_pseudos.splice(0,0,this.list_of_friends_pseudos.splice(index,1)[0]);
  this.cd.detectChanges()
}

change_message_status(event){
  //console.log(event)
  if(!event.spam){
    
    let index_friend=-1;
    for(let i=0;i<this.list_of_friends_ids.length;i++){
      if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]==event.friend_type){
        index_friend=i;
      }
    }
    //console.log(index_friend)
    
    if(index_friend>=0){
      //console.log( this.list_of_friends_last_message[index_friend])
      //console.log(event.status=="delete")
      //console.log(this.list_of_friends_last_message[index_friend].id_chat_section==event.id_chat_section)
      //console.log(this.list_of_friends_last_message[index_friend].id==event.id_message)
      if(event.status=="delete" && this.list_of_friends_last_message[index_friend].id_chat_section==event.id_chat_section && this.list_of_friends_last_message[index_friend].id==event.id_message){
        this.list_of_friends_last_message[index_friend].status="deleted";
      } 
      if(event.status=="seen" &&  this.list_of_friends_last_message[index_friend].id_chat_section==event.id_chat_section){
        if(event.friend_type=='group'){
           if( (this.list_of_friends_last_message[index_friend].id_user==this.user_id && this.user_id!=event.real_friend_id)
             || this.list_of_friends_last_message[index_friend].id_user!=this.user_id ){
               ////console.log("putting messages group to seen")
              if( this.list_of_friends_last_message[index_friend].list_of_users_who_saw.indexOf(event.real_friend_id)<0){
                this.list_of_friends_last_message[index_friend].list_of_users_who_saw.push(event.real_friend_id);
              }
           }
        }
        else if((this.list_of_friends_last_message[index_friend].id_user==this.user_id && this.user_id!=event.real_friend_id)
        || this.list_of_friends_last_message[index_friend].id_user!=this.user_id){
          this.list_of_friends_last_message[index_friend].status="seen";
        }
        
        
      } 
      
      
    }
    else{
      ////console.log("error friend not retrieved")
    }
    
  }
  this.cd.detectChanges()
}

  new_sort_friends_list(event){
    //console.log("getting message from chat")
    //console.log(event);
    //console.log(this.list_of_friends_ids)
    //console.log(this.list_of_friends_types)
    //console.log(this.list_of_pp_sorted)
    if(this.list_of_pp_sorted){
      //console.log("firt if")
      let index=-1;
      for(let i=0;i<this.list_of_friends_ids.length;i++){
        if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]==event.friend_type ){
          index=i;
        }
      }
      ////console.log(index)
      if(index>=0){
        //console.log("a friend message")
        //fait partie de la liste des contacts
        ////console.log(event.message);
        this.list_of_friends_last_message[index]=event.message;
        this.cd.detectChanges();
        //put message to received
        this.list_of_friends_last_message[index].status="received";
        ////console.log("received");
        this.cd.detectChanges();
        
        this.list_of_friends_types.splice(0,0,this.list_of_friends_types.splice(index,1)[0]);
        this.list_of_friends_ids.splice(0,0,this.list_of_friends_ids.splice(index,1)[0]);
        this.list_of_friends_last_message.splice(0,0,this.list_of_friends_last_message.splice(index,1)[0]);
        this.list_of_friends_names.splice(0,0,this.list_of_friends_names.splice(index,1)[0]);
        this.list_of_friends_certifications.splice(0,0,this.list_of_friends_certifications.splice(index,1)[0]);
        
        this.list_of_chat_friends_ids.splice(0,0,this.list_of_chat_friends_ids.splice(index,1)[0]);
        this.list_of_friends_profile_pictures.splice(0,0,this.list_of_friends_profile_pictures.splice(index,1)[0]);
        this.list_of_friends_pseudos.splice(0,0,this.list_of_friends_pseudos.splice(index,1)[0]);
        ////console.log(this.list_of_friends_last_message)
        this.cd.detectChanges();

      }
      else{
        if(event.friend_type=='group'){
          this.get_group_chat_name(event.friend_id,event.message);
        }
        else{
          this.chatService.check_if_is_related(event.friend_id).subscribe(r=>{
            if(r[0].value){
              if(event.friend_id==this.user_id){
                //console.log("it s me")
                this.list_of_friends_types.splice(0,0,'user');
                this.list_of_friends_ids.splice(0,0,event.friend_id);
                  this.list_of_friends_last_message.splice(0,0,event.message);
                  this.list_of_friends_last_message[0].status="received";
                  this.list_of_friends_names.splice(0,0,this.author_name);
                  this.list_of_friends_certifications.splice(0,0,this.author_certification);
                  this.list_of_chat_friends_ids.splice(0,0,event.message.chat_id);
                  this.list_of_friends_profile_pictures.splice(0,0,this.profile_picture);
                  this.list_of_friends_pseudos.splice(0,0,this.pseudo);
                  this.cd.detectChanges();
              }
              else{
                //console.log("related but not me")
                let name;
                let pseudo;
                let picture;
                let data_retrieved=false;
                let pp_retrieved=false;
                let certification=false;
                this.Profile_Edition_Service.retrieve_profile_data(event.friend_id).subscribe(s=>{
                  //console.log(s);
                  pseudo = s[0].nickname;
                  name =s[0].firstname + ' ' + s[0].lastname;
                  certification=s[0].certified_account;
                  data_retrieved=true;
                  check_all(this)
                });
    
                this.Profile_Edition_Service.retrieve_profile_picture( event.friend_id).subscribe(t=> {
                  //console.log(t);
                  let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  picture = SafeURL;
                  pp_retrieved=true;
                  check_all(this)
                })
                
                function check_all(THIS){
                  if(data_retrieved && pp_retrieved){
                    THIS.list_of_friends_types.splice(0,0,'user');
                    THIS.list_of_friends_ids.splice(0,0,event.friend_id);
                    THIS.list_of_friends_last_message.splice(0,0,event.message);
                    THIS.list_of_friends_last_message[0].status="received";
                    THIS.list_of_friends_names.splice(0,0,name);
                    THIS.list_of_friends_certifications.splice(0,0,certification);
                    
                    THIS.list_of_chat_friends_ids.splice(0,0,event.message.chat_id);
                    THIS.list_of_friends_profile_pictures.splice(0,0,picture);
                    THIS.list_of_friends_pseudos.splice(0,0,pseudo);
                    THIS.cd.detectChanges();
                  }
                
                }
              }
            }
          })
        }

      
        
      }
    }
    
  }


  add_group_to_contacts(event){
    ////console.log("adding group to contacts")
    ////console.log(event);
    this.get_group_chat_name(event.friend_id,event.message)
  }
  

  get_group_chat_name(id,message){
    ////console.log("get_group_chat_name")
    ////console.log(id);
    ////console.log(message)
    let pseudo = message.group_name;
    let name =message.group_name;
    this.chatService.get_group_chat_as_friend(id).subscribe(s=>{
      ////console.log(s[0])
      
      this.chatService.retrieve_chat_profile_picture(s[0].chat_profile_pic_name,s[0].profile_pic_origin).subscribe(t=> {
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        let picture = SafeURL;
        this.list_of_chat_friends_ids.splice(0,0,s[0].id)
        this.list_of_friends_types.splice(0,0,'group');
        this.list_of_friends_ids.splice(0,0,id);
        this.list_of_friends_last_message.splice(0,0,message);
        this.list_of_friends_last_message[0].status="received";
        this.list_of_friends_names.splice(0,0,name);
        this.list_of_friends_certifications.splice(0,0,null);
        this.list_of_friends_profile_pictures.splice(0,0,picture);
        this.list_of_friends_pseudos.splice(0,0,pseudo);
        ////console.log(this.list_of_friends_last_message);
        ////console.log(this.list_of_friends_types)
        ////console.log(this.list_of_friends_names)
        this.cd.detectChanges();
      })
      
    })
  }
  
  
  show_date_of_timestamp(item,i){
    let timestamp=item.createdAt;
    
    let date=new Date(timestamp)
    let day=String(date.getDate()).padStart(2, '0')
    let dat_today=new Date();
    let today=String(dat_today.getDate()).padStart(2, '0')
    let time=new Date(timestamp).getTime()/1000;
    let time_now= new Date().getTime()/1000;
    if(!item.createdAt ){
        let hour =String(dat_today.getHours()).padStart(2, '0');
        let min =String(dat_today.getMinutes()).padStart(2, '0');
        this.list_of_friends_last_message[i].date=hour+':'+min;
        return (hour+':'+min)
    }

    if(time_now-time>604800){
      let month=String(date.getMonth() + 1).padStart(2, '0');
      let year = date.getFullYear();
      return day+'/'+month+'/'+year;
    }
    else if(time_now-time>86400){
      let date=new Date(timestamp);
      let day=String(date).substring(0,3);
      if(day=="Mon"){
        return("Lun");
      }
      if(day=='Tue'){
        return"Mar";
      }
      if(day=='Wed'){
        return"Mer";
      }
      if(day=='Thu'){
        return"Jeu";
      }
      if(day=="Fri"){
        return"Ven";
      }
      if(day=='Thu'){
        return"Sam";
      }
      if(day=='Thu'){
        return"Dim";
      }
      else{
        return day
      } 
    }
    else if(day!=today){
      return ("Hier")
    }
    else if(day==today){
      let hour =String(date.getHours()).padStart(2, '0');
      let min =String(date.getMinutes()).padStart(2, '0');
      return (hour+':'+min)
    }
   
  }

  blocking_managment(event){
    let index=-1;
    for(let i=0;i<this.list_of_friends_ids.length;i++){
      if(this.list_of_friends_ids[i]==event.friend_id && this.list_of_friends_types[i]=='user'){
        index=i;
      }
    }
    ////console.log(index)
    if(index>=0){
      this.list_of_friends_types.splice(index,1);
      this.list_of_friends_ids.splice(index,1);
      this.list_of_friends_last_message.splice(index,1);
      this.list_of_friends_names.splice(index,1);
      this.list_of_friends_certifications.splice(index,1);
      this.list_of_chat_friends_ids.splice(index,1);
      this.list_of_friends_profile_pictures.splice(index,1);
      this.list_of_friends_pseudos.splice(index,1);
      this.cd.detectChanges()
    }
  }
  
  /*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
  /*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
  /*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
  /*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/

  chat_service_managment_function(msg){
   
    if(!msg[0].for_notifications){
      ////console.log(msg[0])
      ////console.log(this.list_of_messages)
      //a person sends a message
      if(msg[0].id_user!="server" && !msg[0].is_from_server){
        ////console.log("it's not from server");
        ////console.log(msg[0].status)
        if(msg[0].is_a_group_chat){
          ////console.log("is from a group");
          if( msg[0].status=="seen"){
            ////console.log("in the else if seen")
            ////console.log("change message status 2")
            this.change_message_status({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_receiver,friend_type:'group',spam:false,real_friend_id:msg[0].id_user});
          }
          else{
            ////console.log(msg[0].status)
            ////console.log("in the else ");
            this.new_sort_friends_list({friend_id:msg[0].id_user,message:msg[0],friend_type:'group'});
            if(!this.show_chat_messages){
              this.number_of_unseen_messages+=1;
            }
            this.cd.detectChanges;
          }
        }
        else{
          ////console.log("is from a user ");
          
          // not the friend I am talking to but seen
          if(msg[0].status=="seen"){
            ////console.log("in the else if seen")
            ////console.log("change message status 3")
            this.change_message_status({id_chat_section:msg[0].id_chat_section,status:"seen",friend_id:msg[0].id_user,friend_type:'user'});
          }
          // not the friend I am talking to and not seen
          else{
            //console.log("start new saw")
            this.new_sort_friends_list({friend_id:msg[0].id_user,message:msg[0],friend_type:'user'});
            if(!this.show_chat_messages){
              this.number_of_unseen_messages+=1;
            }
            this.cd.detectChanges;
          }
        }
        
      }
      else if(msg[0].server_message=="received_new"){
        ////console.log("received new but not here")
        this.new_sort_friends_list({friend_id:msg[0].message.id_receiver,message:msg[0].message,friend_type:'user'});
        if(!this.show_chat_messages){
          this.number_of_unseen_messages+=1;
        }
        this.cd.detectChanges;
      }
      else if(msg[0].server_message=="delete_message" ){
        //console.log(" delete_message message")
        let friend_id=-1;
        let friend_type="user";
        if(msg[0].group_chat_id ){
          friend_id=msg[0].group_chat_id;
          friend_type="group";
        }
        else{
          friend_id=msg[0].id_user_writing;
        }
        this.change_message_status({id_chat_section:msg[0].message.id_chat_section,status:"delete",friend_id:friend_id,friend_type:friend_type,spam:false,id_message:msg[0].id_message});
        
        this.cd.detectChanges
      }
      else if(msg[0].server_message=="block" ){
        ////console.log("block")
        this.blocking_managment({friend_id:msg[0].id_user_blocking})
      }
      //a message from the server to tell that the message has been sent
      else if(msg[0].message=="New"){
        ////console.log("new");
        if(msg[0].is_a_group_chat){
          ////console.log("adding new group to contacts")
          this.add_group_to_contacts({friend_id:msg[0].id_receiver,message:msg[0]});
          this.cd.detectChanges;
        }
        else{
            this.new_sort_friends_list({friend_id:msg[0].id_user,message:msg[0],friend_type:'user'});
            if(!this.show_chat_messages){
              this.number_of_unseen_messages+=1;
            }
            this.cd.detectChanges;
        }
      }
      else if(msg[0].message=="New_friend_in_the_group"){
        ////console.log("New_friend_in_the_group");
        this.new_sort_friends_list({friend_id:msg[0].id_user,message:msg[0],friend_type:'group',value:false});
        if(!this.show_chat_messages){
          this.number_of_unseen_messages+=1;
        }
        this.cd.detectChanges;
        
      }
      else if(msg[0].message=="Exit"){
        ////console.log("Exit");
        if(msg[0].is_a_group_chat){
          this.display_exit({friend_id:msg[0].id_user,message:msg[0]});
          if(!this.show_chat_messages){
            this.number_of_unseen_messages+=1;
          }
          this.cd.detectChanges;
        }
      }
    }
  }

  open_chat(i){
    ////console.log(this.list_of_friends_ids[i]);
    ////console.log(this.list_of_friends_types[i]);
  }

  get_chat_url(i){
    if(this.list_of_friends_types[i]=='group'){

      this.number_of_unseen_messages=0;
      return `group/${this.list_of_friends_pseudos[i]}/${this.list_of_friends_ids[i]}`
    }
    else{
      this.number_of_unseen_messages=0;
      return `${this.list_of_friends_pseudos[i]}/${this.list_of_friends_ids[i]}`
    }
  }

  logo_loaded(){
    this.logo_is_loaded=true;
  }

  logo2_loaded(){
    this.logo_is_loaded2=true;
  }

  /****************************************** SWIPER  SWIPER ********************************************/
  /****************************************** SWIPER  SWIPER ********************************************/
  /****************************************** SWIPER  SWIPER ********************************************/
  /****************************************** SWIPER  SWIPER ********************************************/
  
  swiper:any;
  @ViewChild("swiperCategories") swiperCategories:ElementRef;
  initialize_swiper() {

    if( this.swiper ) {
      this.swiper.destroy(true,true);
    }
    if( this.swiperCategories ) {
      this.swiper = new Swiper( this.swiperCategories.nativeElement, {
        speed: 300,
        initialSlide:0,

        slidesPerView: 'auto',

        breakpoints: {
          // when window width is >= 320px
          320: {
            slidesPerGroup: 2,
          },
          // when window width is >= 480px
          500: {
            slidesPerGroup: 3,
          },
          // when window width is >= 640px
          700: {
            slidesPerGroup: 4,
          },
          // when window width is >= 640px
          900: {
            slidesPerGroup: 5,
          }
        },

        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        observer:'true',
      })
    }
  }
  
  
  
  swiper2:any;
  @ViewChild("swiperCategories2") swiperCategories2:ElementRef;
  initialize_swiper2() {
    
    if( this.swiper2 ) {
      this.swiper2.destroy(true,true);
    }
    if( this.swiperCategories2 ) {
      this.swiper2 = new Swiper( this.swiperCategories2.nativeElement, {
        speed: 300,
        initialSlide:0,

        slidesPerView: 'auto',

        breakpoints: {
          // when window width is >= 320px
          320: {
            slidesPerGroup: 2,
          },
          // when window width is >= 480px
          500: {
            slidesPerGroup: 3,
          },
          // when window width is >= 640px
          700: {
            slidesPerGroup: 4,
          },
          // when window width is >= 640px
          900: {
            slidesPerGroup: 5,
          }
        },

        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        observer:'true',
      })
    }
  }



  /*open_options(i){
    //console.log(i)
    if(!this.conditions_retrieved){
      return
    }
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.list_of_conditions[i]},
      panelClass:"popupDocumentClass",
    });
   
  }*/


  show_cookies=false;
  agree_on_cookies(){
    //console.log("agree")
    this.show_cookies=false;
    this.Profile_Edition_Service.agree_on_cookies().subscribe(r=>{
     console.log(r[0])
    })
  }

  
  /****************************************** POPUP NAVBAR  ********************************************/
  /****************************************** POPUP NAVBAR  ********************************************/
  /****************************************** POPUP NAVBAR  ********************************************/
  /****************************************** POPUP NAVBAR  ********************************************/


  popup_opened=false;
  open_menu_for_phone(){
    if(this.data_retrieved && this.using_chat_retrieved && this.conditions_retrieved){
      this.popup_opened=true;
      const dialogRef = this.dialog.open(PopupNavbarComponent, {
        data: {
          list_of_conditions:this.list_of_conditions,
          profile_picture:this.profile_picture,
          user_id:this.user_id,
          author_first_name:this.author_first_name,
          pseudo:this.pseudo,
          author_name:this.author_name,
          author_certification:this.author_certification,
          data_retrieved:this.data_retrieved,
          number_of_unchecked_notifications:this.number_of_unchecked_notifications,
          index_of_notifications_to_show:this.index_of_notifications_to_show,
          show_notifications:this.show_notifications,
          check_chat_service:this.check_chat_service,
          check_notifications_from_service:this.check_notifications_from_service,
          list_of_notifications_profile_pictures:this.list_of_notifications_profile_pictures,
          notifications_pictures_retrieved:this.notifications_pictures_retrieved,
          list_of_notifications:this.list_of_notifications,
          notification_loaded:this.notification_loaded,
          dictionnary_of_similar_notifications:this.dictionnary_of_similar_notifications,
          list_of_notifications_dates:this.list_of_notifications_dates,
          final_list_of_notifications_to_show:this.final_list_of_notifications_to_show,
          compteur_get_final_list:this.compteur_get_final_list,


          show_chat_messages:this.show_chat_messages,
          list_of_messages:this.list_of_messages,
          number_of_unseen_messages:this.number_of_unseen_messages,
          using_chat:this.using_chat,
          using_chat_retrieved:this.using_chat_retrieved,
          list_of_chat_friends_ids:this.list_of_chat_friends_ids, // id de la liste list_of_chat_friends
          number_of_friends_to_show:this.number_of_friends_to_show,
          list_of_friends_types:this.list_of_friends_types,
          list_of_friends_profile_pictures:this.list_of_friends_profile_pictures,
          list_of_friends_pseudos:this.list_of_friends_pseudos,
          list_of_friends_names:this.list_of_friends_names,
          list_of_friends_certifications:this.list_of_friends_certifications,
          list_of_friends_ids:this.list_of_friends_ids,
          list_of_friends_last_message:this.list_of_friends_last_message,
          list_of_friends_retrieved:this.list_of_friends_retrieved,
          list_of_friends_date:this.list_of_friends_date,
          list_of_friends_users_only:this.list_of_friends_users_only,
          list_of_last_connection_dates:this.list_of_last_connection_dates,
          list_of_friends_connected:this.list_of_friends_connected,
          connections_status_retrieved:this.connections_status_retrieved,
          list_of_groups_retrieved:this.list_of_groups_retrieved,
          list_of_groups_ids:this.list_of_groups_ids,
          number_of_empties:this.number_of_empties,
          list_of_pp_sorted:this.list_of_pp_sorted,
          can_sort_list_of_profile_pictures:this.can_sort_list_of_profile_pictures,
          list_of_pictures_by_ids_users:this.list_of_pictures_by_ids_users,
          list_of_pictures_by_ids_groups:this.list_of_pictures_by_ids_groups,
        },
        panelClass: 'popupMenuNavbar',
      });

      dialogRef.afterClosed().subscribe(result => {
        this.popup_opened=false;
      })
    }
    
  }


  
  
}