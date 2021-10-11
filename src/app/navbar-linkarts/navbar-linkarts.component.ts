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
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {NotificationsService} from '../services/notifications.service';
import { Ads_service } from '../services/ads.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupNavbarComponent } from '../popup-navbar/popup-navbar.component';
import { PopupNavbarDisconnectedComponent } from '../popup-navbar-disconnected/popup-navbar-disconnected.component';
import {Community_recommendation} from '../services/recommendations.service';
import { MatMenuTrigger } from '@angular/material/menu';
import * as WebFont from 'webfontloader';
import { filter } from 'rxjs/operators';
import { merge, fromEvent } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PopupContactComponent } from '../popup-contact/popup-contact.component';
import { PopupShareComponent } from '../popup-share/popup-share.component';
import { first } from 'rxjs/operators';

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
    ),
    trigger(
      'enterFromBottomAnimation', [
        transition(':enter', [
          style({transform: 'translateY(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
  ]
})

export class NavbarLinkartsComponent implements OnInit {
  
  
  constructor(
    private Community_recommendation:Community_recommendation,
    private route: ActivatedRoute, 
    private location: Location,
    private CookieService:CookieService,
    private cd: ChangeDetectorRef,
    private rd:Renderer2,
    private router:Router,
    private deviceService: DeviceDetectorService,
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


      router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl.push(event.url);
        this.navbar.setPreviousUrls(this.previousUrl)
        if(event.url.includes("chat") || event.url.includes("signup")){
          this.show_menu_phone=false;
        }
        else{
          this.show_menu_phone=true;
        }
        this.show_profile_spinner=false;
        let device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
        this.navbar.add_page_visited_to_history(event.url,device_info).pipe( first()).subscribe()
      });
      
      AuthenticationService.tokenCheck().subscribe(r=>{
        if(r!=this.current_user_type &&  this.change_number<1){
          this.Profile_Edition_Service.get_current_user().pipe( first()).subscribe(r=>{
            if(r[0]){
              this.current_user=r;
              if(r[0].status=="account" || r[0].status=="suspended"){
                this.type_of_profile=r[0].status;
                this.retrieve_profile(r);
              }
              else{
                this.data_retrieved=true;
                this.using_chat_retrieved=true;
                this.type_of_profile="visitor";
              }
              this.type_of_profile_retrieved=true;
              this.initialize_selectors();
            }
            
          });
          this.current_user_type=r;
          this.change_number++;
        }
      })

      navbar.connexion.subscribe(r=>{
        if(r!=this.connexion_status){
          this.connexion_status=r
          
          if(r){
            if(this.chatService.messages && !this.using_chat && this.navbar_visible && this.using_chat_retrieved){
              this.check_chat_service_func();
              this.cd.detectChanges();
            }
          }
        }
        
      })



      navbar.visibility_observer.subscribe(navbar_visibility=>{
        if( navbar_visibility) {
          this.navbar_visible=true;
          this.rd.setStyle(this.navbarMargin.nativeElement, "height", "54px");
          this.initialize_selectors();
          navbar.check_using_chat.subscribe(using_chat=>{
            this.using_chat=using_chat;
            this.using_chat_retrieved=true
            let chat_messages_interval = setInterval(() => {
              if(this.chatService.messages){
                clearInterval(chat_messages_interval)
                this.using_chat=using_chat;
                this.using_chat_retrieved=true;
                if( !using_chat){
                  this.check_chat_service_func();
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

  show_menu_phone=true;
  previousUrl=[];
  navbar_visible=false;
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.chatService.close();
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    if(  window.scrollY>=200 && this.current_user && !this.dont_open_tuto && !this.Profile_Edition_Service.get_tuto_cookies() && !this.tuto_opened){
      this.open_tuto()
    }
   
  }
  reload_page(){
    location.reload();
  }

  check_chat_service_func(){
    this.chatService.messages.subscribe(msg=>{
      if(msg[0].for_notifications){
        this.sort_notifications(msg);
      }
      else{
        this.chat_service_managment_function(msg);
        
      }
    })
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
  profile_picture_unsafe:any;
  user_id:number;
  author_first_name:string;
  author_name:string;
  author_certification:any;
  pseudo:string;
  gender:string;
  data_retrieved=false;
  type_of_profile:string;
  type_of_profile_retrieved=false;
  focus_activated=false;
  show_researches_propositions=false;
  show_selector=false;

  check_notifications_from_service=false;
  list_of_notifications_profile_pictures=[];
  list_of_notifications=[];
  
  number_of_unchecked_notifications=100;
  index_of_notifications_to_show=15;
  show_notifications=false;


  using_chat=false;
  using_chat_retrieved=false;
  show_chat_messages=false;
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


  //notificaitons 
  display_new_messages=false;
  logo_is_loaded=false;
  logo_is_loaded2=false;


  
  get_connection_interval:any;
  margin_is_not_set:boolean = true;
  @ViewChild('navbarMargin', { read: ElementRef }) navbarMargin:ElementRef;
    

  current_user_type='';
  change_number=0;

  device_info='';
  current_user:any;

  tuto_cookies:string;
  dont_open_tuto=false;
  ngOnInit() {
    let cookies = this.Profile_Edition_Service.get_cookies();
    this.tuto_cookies =this.Profile_Edition_Service.get_tuto_cookies();
    if(this.tuto_cookies){
      this.dont_open_tuto=true;
    }
    if(!cookies){
      this.show_cookies=true;
    }

    let THIS=this;
    WebFont.load({ google: { families: [ 'Material+Icons' ] } , active: function () {
      THIS.navbar.showfont();
      THIS.show_icon=true;
    }});

    let get_font = setInterval(() => {
      if(!THIS.show_icon){
        THIS.show_icon=true;
        THIS.navbar.showfont();
      }
      clearInterval(get_font);
    }, 8000);
    
    window.addEventListener('scroll', this.scroll, true);
    
   

    this.navbar.notification.subscribe(msg=>{
      if(msg && msg[0].for_notifications){
        this.sort_notifications(msg);
      }
    })  


  }

 

 

  
  check_group_done=false;
  list_of_account_groups_names=[];
  list_of_account_groups_ids=[];
  list_of_account_groups_status=[];
  list_of_account_groups_pp=[];
  pp_group_loaded=[]
  user_is_in_a_group=false;
  load_pp_group(k){
    this.pp_group_loaded[k]=true;
  }
  loading_connexion_unit=false;
  open_group(i){
   if(this.loading_connexion_unit){
     return
   }
   if(!this.list_of_account_groups_status[i]){
     const dialogRef = this.dialog.open(PopupConfirmationComponent, {
       data: {showChoice:false, text:"Connexion impossible. La création de ce groupe n'a pas encore été validée par tous ses membres."},
       panelClass: "popupConfirmationClass",
     });
     return
   }
   this.loading_connexion_unit=true;
   this.disconnecting=true;
   this.navbar.add_page_visited_to_history(`/navbar/${this.pseudo}/${this.user_id}/switch_to_group/${this.list_of_account_groups_names[i]}/${this.list_of_account_groups_ids[i]}`, this.device_info).pipe( first()).subscribe();
   this.AuthenticationService.login_group_as_member(this.list_of_account_groups_ids[i],this.user_id).pipe( first()).subscribe( data => {
     if(data.token){
       this.Community_recommendation.delete_recommendations_cookies();
       this.Community_recommendation.generate_recommendations().pipe( first()).subscribe(r=>{
         this.loading_connexion_unit=false;
         this.disconnecting=false;
         this.location.go("/account/" + this.list_of_account_groups_names[i])
         location.reload();
       })
     }
     else{
       const dialogRef = this.dialog.open(PopupConfirmationComponent, {
         data: {showChoice:false, text:"Une erreur est survenue. Veuillez réessayer ultérieurement."},
         panelClass: "popupConfirmationClass",
       });
       this.loading_connexion_unit=false;
       this.disconnecting=false;
     }
   })
  }

  retrieve_profile(r){
      this.user_id=r[0].id;
      this.author_name = r[0].firstname;
      this.author_certification=r[0].certified_account;
      this.pseudo=r[0].nickname;
      this.gender=r[0].gender;
      this.author_first_name=r[0].firstname ;

      this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).pipe( first()).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
        this.profile_picture_unsafe=url;
      });

      if(this.gender!="Groupe"){
        this.Profile_Edition_Service.get_my_list_of_groups_from_users(this.user_id).pipe( first()).subscribe(r=>{
          if(r[0].length>0){
            for(let i=0;i<r[0].length;i++){
              this.list_of_account_groups_names[i]=(r[0][i].nickname)
              this.list_of_account_groups_ids[i]=(r[0][i].id)
              if(!r[0][i].list_of_members_validations || (r[0][i].list_of_members_validations && r[0][i].list_of_members_validations.length!=r[0][i].list_of_members.length)){
                this.list_of_account_groups_status[i]=false
              }
              else{
                this.list_of_account_groups_status[i]=true
              }
              this.Profile_Edition_Service.retrieve_profile_picture(r[0][i].id).pipe( first()).subscribe(t=> {
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_account_groups_pp[i] = SafeURL;
              });
            }
            this.user_is_in_a_group=true;
          }
          this.check_group_done=true;
        })
      }
      else{
        this.check_group_done=true;
      }

      let chat_re=false;
      let notif_re=false;
      this.chatService.get_number_of_unseen_messages().pipe( first()).subscribe(a=>{
        if(a[0]){
          this.number_of_unseen_messages=a[0].number_of_unseen_messages;
        }
        else{
          this.number_of_unseen_messages=0
        }
        chat_re=true;
        check_all(this);
      })

      this.NotificationsService.get_list_of_notifications().pipe( first()).subscribe(r=>{
        if(r[0].length>0){
          this.list_of_notifications=r[0]
          this.display_number_of_unchecked_notifications();
        }
        else{
          this.number_of_unchecked_notifications=0;
        }
        notif_re=true;
        check_all(this)
      });


      function check_all(THIS){
        if(chat_re && notif_re){
          THIS.data_retrieved=true;
        }
        
      }
  }

  pp_loaded(){
    this.pp_is_loaded=true;
  }

  load_notification_pp(i){
    this.notification_loaded[i]=true;
  }
 
  sort_notifications(msg){
    if(msg[0].for_notifications){
      
      if(msg[0].information!='remove'){
        this.list_of_notifications.splice(0,0,msg[0]);
       
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
        if(index>=0){
          this.list_of_notifications.splice(index,1)
        }
        
      }
      this.display_number_of_unchecked_notifications();
    }
  }


  
  change_notifications_status_to_checked(){
    let index=this.list_of_notifications.findIndex(x => x.status==="unchecked");
    if(index>=0){
      this.NotificationsService.change_all_notifications_status_to_checked(this.user_id).pipe( first()).subscribe(r=>{  
      })
    }
    this.number_of_unchecked_notifications=0;
  }


 
  display_number_of_unchecked_notifications(){
    let number=0;
    for(let i=0;i<this.list_of_notifications.length;i++){
      if(this.list_of_notifications[i].status=="unchecked"){
        number+=1;
      }
    }
    this.number_of_unchecked_notifications=number;
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
    if(this.focus_activated){
      return
    };
    if(!this.display_first_propositions_triggered){
      this.get_trendings_and_first_propositions();
    }
    else{
      this.focus_activated=true;
      this.researches_propositions()
    }
  }

  get_trendings_and_first_propositions(){
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
    this.navbar.get_most_researched_navbar(this.publication_category,this.compteur_recent,"researched").pipe( first()).subscribe(r=>{
      if(r[1]==this.compteur_recent){
        this.most_researched_propositions=r[0][0];
        this.show_researches_propositions=true;
        this.show_most_researched_propositions=true;
        this.cd.detectChanges();
        this.initialize_swiper();
        this.initialize_swiper2();
        this.cd.detectChanges();
        
        
      }
      
    });

    let last_research_retrieved=false;
    this.navbar.get_last_researched_navbar(this.publication_category,this.compteur_recent).pipe( first()).subscribe(m=>{
      if(m[1]==this.compteur_recent){
        this.list_of_first_propositions_history=m[0][0];
       
        if(m[0][0].length>0){
          this.first_option=true;
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
    this.navbar.get_most_researched_navbar(this.publication_category,this.compteur_recent,"clicked").pipe( first()).subscribe(n=>{
      most_researched_results=n[0][0];
      if(n[1]==this.compteur_recent){
        most_researched_retrieved=true;
        check_other_propositions(this)
        
        
      }
    })

    function check_other_propositions(THIS){
      if(last_research_retrieved && !THIS.first_propositions_retrieved && most_researched_retrieved){
        THIS.list_of_first_propositions_history=most_researched_results;
        if(most_researched_results.length>0){
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
    this.compteur_research+=1;
    this.compteur_recent+=1;
    this.show_first_propositions=false;
    this.list_of_first_propositions=[];
    this.list_of_last_propositions=[];
    this.list_of_thumbnails=[];
    this.compteur_other_propositions=0;
    this.pp_thumb_is_loaded=[];
    this.loading_other=true;
    this.loading_recent=false;
    this.cd.detectChanges();
    if(this.input.nativeElement.value!=''){
      if(this.input.nativeElement.value.replace(/\s/g, '').length>0){
        this.show_most_researched_propositions=false;
        let specific_retrieved=false;
        let global_retrieved=false;
        let tags_retrieved=false;
        let run_tags=false;
        this.navbar.get_specific_propositions_navbar(this.publication_category,this.input.nativeElement.value,this.compteur_research).pipe( first()).subscribe(m=>{
          if(m[1]==this.compteur_research){
            this.show_researches_propositions=true;
            this.list_of_first_propositions=m[0][0];
            this.cd.detectChanges();
            this.initialize_swiper();
            this.initialize_swiper2();
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
        this.navbar.get_global_propositions_navbar(this.publication_category,this.input.nativeElement.value,10,this.compteur_research).pipe( first()).subscribe(r=>{
          global_result=r[0][0]
          global_retrieved=true;
          if(r[1]==this.compteur_research && specific_retrieved){
            check_with_global(this)
            
          }
        })

        let tags_result:any;
        this.navbar.get_global_tags_propositions_navbar(this.publication_category,this.input.nativeElement.value,5,this.compteur_research).pipe( first()).subscribe(u=>{
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
              for(let i=0;i<THIS.list_of_first_propositions.length;i++){
                THIS.get_other_propositions(i,THIS.compteur_research);
              }
            }
            else{
              THIS.loading_other=false;
              THIS.show_other_propositions=true;
              THIS.cd.detectChanges();
              if(THIS.propositions){
                THIS.scroll_propositions= merge(
                  fromEvent(window, 'scroll'),
                  fromEvent(THIS.propositions.nativeElement, 'scroll')
                );
              }
            }
          }
        }
      }
      
    }
    else{
      if(!this.display_first_propositions_triggered){
        this.get_trendings_and_first_propositions();
      }
      else{
        this.show_researches_propositions=true;
        this.loading_other=false;
        this.show_other_propositions=false;
        this.show_first_propositions=true;
        this.show_most_researched_propositions=true;

        this.cd.detectChanges();
        this.initialize_swiper()
        this.initialize_swiper2();
        this.cd.detectChanges();

        if(this.propositions){
          this.scroll_propositions= merge(
            fromEvent(window, 'scroll'),
            fromEvent(this.propositions.nativeElement, 'scroll')
          );
        }
      }
      
      
    }
    
  }

  scroll_propositions:any;

  display_first_propositions_triggered=false;
  display_first_propositions(category){
    this.display_first_propositions_triggered=true;
    this.show_first_propositions=true;
    this.loading_recent=false;
    this.cd.detectChanges();
    if(this.propositions){
      this.scroll_propositions= merge(
        fromEvent(window, 'scroll'),
        fromEvent(this.propositions.nativeElement, 'scroll')
      );
    }
  }
  get_first_propositions(i,compteur){
    this.list_of_thumbnails_history[i]=null;
    if(this.list_of_first_propositions_history[i].publication_category=="Account"){
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_first_propositions_history[i].target_id).pipe( first()).subscribe(profile=>{
        if(compteur==this.compteur_recent){
          this.list_of_last_propositions_history[i]=profile[0];
          
          this.Profile_Edition_Service.retrieve_profile_picture(profile[0].id ).pipe( first()).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_recent){
              this.list_of_thumbnails_history[i] = url;
              
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
      this.Ads_service.retrieve_ad_by_id(this.list_of_first_propositions_history[i].target_id).pipe( first()).subscribe(ad=>{
        if(compteur==this.compteur_recent){
          this.list_of_last_propositions_history[i]=ad[0];
          this.Ads_service.retrieve_ad_thumbnail_picture(ad[0].thumbnail_name ).pipe( first()).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_recent){
              this.list_of_thumbnails_history[i] = url;
              
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
      if(this.list_of_first_propositions_history[i].format=="one-shot"){
        this.BdOneShotService.retrieve_bd_by_id(this.list_of_first_propositions_history[i].target_id).pipe( first()).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            this.BdOneShotService.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = url;
                  
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
        this.BdSerieService.retrieve_bd_by_id(this.list_of_first_propositions_history[i].target_id).pipe( first()).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            this.BdOneShotService.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = url;
                 
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
      if(this.list_of_first_propositions_history[i].format=="one-shot"){
        this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.list_of_first_propositions_history[i].target_id).pipe( first()).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            this.Drawings_Onepage_Service.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = url;
                  
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
        this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.list_of_first_propositions_history[i].target_id).pipe( first()).subscribe(comic=>{
          if(compteur==this.compteur_recent){
            this.list_of_last_propositions_history[i]=comic[0];
            this.Drawings_Onepage_Service.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_recent){
                  this.list_of_thumbnails_history[i] = url;
                  
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
      this.Writing_Upload_Service.retrieve_writing_information_by_id(this.list_of_first_propositions_history[i].target_id).pipe( first()).subscribe(comic=>{
        if(compteur==this.compteur_recent){
          this.list_of_last_propositions_history[i]=comic[0];
          this.Writing_Upload_Service.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(compteur==this.compteur_recent){
                this.list_of_thumbnails_history[i] = url;
               
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
    this.show_other_propositions=true;
    this.loading_other=false;
    this.cd.detectChanges();
    if(this.propositions){
      this.scroll_propositions= merge(
        fromEvent(window, 'scroll'),
        fromEvent(this.propositions.nativeElement, 'scroll')
      );
    }
  }
  get_other_propositions(i,compteur){
    this.list_of_thumbnails[i]=null;
    if(this.list_of_first_propositions[i].publication_category=="Account"){
      
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_first_propositions[i].target_id).pipe( first()).subscribe(profile=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=profile[0];
          this.list_of_thumbnails[i]=null;
          this.Profile_Edition_Service.retrieve_profile_picture(profile[0].id ).pipe( first()).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_research){
              this.list_of_thumbnails[i] = url;
             
            }
           
          });
          this.compteur_other_propositions++;
          if(this.compteur_other_propositions==this.list_of_first_propositions.length){
           this.display_other_propositions("account")
          }
        }
        
      })
    }

    else if(this.list_of_first_propositions[i].publication_category=="Ad"){
      this.Ads_service.retrieve_ad_by_id(this.list_of_first_propositions[i].target_id).pipe( first()).subscribe(profile=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=profile[0];
          this.Ads_service.retrieve_ad_thumbnail_picture(profile[0].thumbnail_name ).pipe( first()).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            if(compteur==this.compteur_research){
              this.list_of_thumbnails[i] = url;
             
            }
           
          });
          this.compteur_other_propositions++;
          if(this.compteur_other_propositions==this.list_of_first_propositions.length){
            this.display_other_propositions("ad")
          }
        }
        
      })
    }

    else if(this.list_of_first_propositions[i].publication_category=="Comic"){
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.BdOneShotService.retrieve_bd_by_id(this.list_of_first_propositions[i].target_id).pipe( first()).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.BdOneShotService.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = url;
                 
                }
                
            })
            this.compteur_other_propositions++;
            if(this.compteur_other_propositions==this.list_of_first_propositions.length){
              this.display_other_propositions("comic osh")
            }
          }
          
        })
      }
      if(this.list_of_first_propositions[i].format=="serie"){
        this.BdSerieService.retrieve_bd_by_id(this.list_of_first_propositions[i].target_id).pipe( first()).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.BdOneShotService.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = url;
                  
                }
            })
            this.compteur_other_propositions++;
            if(this.compteur_other_propositions==this.list_of_first_propositions.length){
              this.display_other_propositions("comic serie")
            }
          }
        })
      }
    }

    else if(this.list_of_first_propositions[i].publication_category=="Drawing"){
      if(this.list_of_first_propositions[i].format=="one-shot"){
        this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.list_of_first_propositions[i].target_id).pipe( first()).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.Drawings_Onepage_Service.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = url;
                  
                }
            })
            this.compteur_other_propositions++;
            if(this.compteur_other_propositions==this.list_of_first_propositions.length){
              this.display_other_propositions("drawing os")
            }
          }
          
        })
      }
      if(this.list_of_first_propositions[i].format=="artbook"){
        this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.list_of_first_propositions[i].target_id).pipe( first()).subscribe(comic=>{
          if(compteur==this.compteur_research){
            this.list_of_last_propositions[i]=comic[0];
            this.Drawings_Onepage_Service.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
                let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                if(compteur==this.compteur_research){
                  this.list_of_thumbnails[i] = url;
                  
                }
            })
            this.compteur_other_propositions++;
            if(this.compteur_other_propositions==this.list_of_first_propositions.length){
              this.display_other_propositions("drawing art")
            }
          }
          
        })
      }
    }

    else if(this.list_of_first_propositions[i].publication_category=="Writing"){
      this.Writing_Upload_Service.retrieve_writing_information_by_id(this.list_of_first_propositions[i].target_id).pipe( first()).subscribe(comic=>{
        if(compteur==this.compteur_research){
          this.list_of_last_propositions[i]=comic[0];
          this.Writing_Upload_Service.retrieve_thumbnail_picture_navbar(comic[0].name_coverpage).pipe( first()).subscribe(t=>{
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              if(compteur==this.compteur_research){
                this.list_of_thumbnails[i] = url;
               
              }
              
          })
          this.compteur_other_propositions++;
          if(this.compteur_other_propositions==this.list_of_first_propositions.length){
            this.display_other_propositions("writing")
          }
        }
       
      })
    }
    else{
      this.compteur_other_propositions++;
      if(this.compteur_other_propositions==this.list_of_first_propositions.length){
        if(this.list_of_last_propositions.length>0){
          this.display_other_propositions("account")
        }
        else{
          this.loading_other=false;
          this.show_other_propositions=true;
          this.cd.detectChanges();
          if(this.propositions){
            this.scroll_propositions= merge(
              fromEvent(window, 'scroll'),
              fromEvent(this.propositions.nativeElement, 'scroll')
            );
          }
        }
        
      }
    }
  }

  /**************************************** ACCOUNT NAVIGATION  ***********************************/
  /**************************************** ACCOUNT NAVIGATION  ***********************************/
  /**************************************** ACCOUNT NAVIGATION  ***********************************/
  show_profile_spinner=false;
  get_my_profile() {
    return "/account/" + this.pseudo ;
  }

  go_to_profile(){
    if(this.previousUrl.length>0 && this.previousUrl[this.previousUrl.length-1].includes("account")){
      return
    }
    this.show_profile_spinner=true;
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

 

  //WORDS
  open_research_style_and_tags(i: number) {
    return "/main-research/styles/tags/1/" + this.list_of_real_categories[this.indice_title_selected] + "/" + this.first_filters[this.indice_title_selected][i] + "/all";
    
  }

  //ACCOUNTS
  open_account(i: number) {
    this.cancel_research()
    this.not_using_chat();
    this.loading_research=true;
    let user =this.list_of_last_propositions[i]
    this.navbar.add_main_research_to_history("Account","unknown",user.id,user.nickname,user.firstname,"clicked_after_research",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).pipe( first()).subscribe(r=>{
      this.loading_research=false;
      return
    })
  }
  get_account(i:number) {
    return "/account/" + this.list_of_last_propositions[i].nickname ;
  }

  open_history_account(i: number) {
    this.cancel_research();
    this.not_using_chat();
    this.loading_research=true;
    let user =this.list_of_last_propositions_history[i];
    this.navbar.add_main_research_to_history("Account","unknown",user.id,user.nickname,user.firstname,"clicked_after_research",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).pipe( first()).subscribe(r=>{
      this.loading_research=false;
      return
    })
  }
  get_history_account(i: number) {
    return "/account/" + this.list_of_last_propositions_history[i].nickname ;
  }

  //ANNONCES
  open_ad_last_propositions(i: number,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_ad_last_propositions(i));
    this.cancel_research()
    this.loading_research=true;
    this.not_using_chat();
    let ad =this.list_of_last_propositions[i];
    this.navbar.add_main_research_to_history("Ad",null,ad.id,ad.title, null,"clicked_after_research",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).pipe( first()).subscribe(r=>{
      this.loading_research=false;
      return
    })
  }

  get_ad_last_propositions(i:number) {
    let title_url=this.list_of_last_propositions[i].title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/ad-page/"+title_url +"/"+ this.list_of_last_propositions[i].id;
  }

  open_ad_last_propositions_history(i: number,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_ad_last_propositions_history(i));
    this.cancel_research()
    this.loading_research=true;
    this.not_using_chat();
    let ad =this.list_of_last_propositions_history[i];
    this.navbar.add_main_research_to_history("Ad",null,ad.id,ad.title, null,"clicked_after_research",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).pipe( first()).subscribe(r=>{
      this.loading_research=false;
      return
    })
  }
  get_ad_last_propositions_history(i: number) {
    let title_url=this.list_of_last_propositions_history[i].title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/ad-page/" + title_url + "/" + this.list_of_last_propositions_history[i].id;
  }


  //ARTWORKS
  open_artwork_last_proposition(s:any, i:number,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_artwork_last_proposition(s,i));
    this.cancel_research()
    this.loading_research=true;
    let artwork=this.list_of_last_propositions[i];
    this.not_using_chat();
    let title_url=this.list_of_last_propositions[i].title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    if(s.publication_category=="Writing") {
      this.navbar.add_main_research_to_history(s.publication_category,"unknown",s.target_id,artwork.title, null,"clicked_after_research",0,0,0,0,artwork.style,artwork.firsttag,artwork.secondtag,artwork.thirdtag,this.type_of_profile).pipe( first()).subscribe(r=>{
        this.loading_research=false;
        return
      })
      
    }
    else {
      this.navbar.add_main_research_to_history(s.publication_category,s.format,s.target_id,artwork.title, null,"clicked_after_research",0,0,0,0,artwork.style,artwork.firsttag,artwork.secondtag,artwork.thirdtag,this.type_of_profile).pipe( first()).subscribe(r=>{
        this.loading_research=false;
        return
      })
     
    }
  }
  get_artwork_last_proposition(s:any, i:number) {
    let title_url=this.list_of_last_propositions[i].title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    if(s.publication_category=="Writing") {
      return "/artwork-" + s.publication_category.toLowerCase() + "/" + title_url+ "/" + s.target_id;
    }
    else {
      return "/artwork-" + s.publication_category.toLowerCase() + "/" + s.format + "/" + title_url + "/" + s.target_id;
    }

  }

  open_artwork_last_proposition_history(s:any, i:number,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_artwork_last_proposition_history(s,i));
    this.cancel_research()
    this.loading_research=true;
    let artwork=this.list_of_last_propositions_history[i];
    this.not_using_chat();
    let title_url=this.list_of_last_propositions_history[i].title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    if(s.publication_category=="Writing") {
      this.navbar.add_main_research_to_history(s.publication_category,"unknown",s.target_id,artwork.title, null,"clicked_after_research",0,0,0,0,artwork.style,artwork.firsttag,artwork.secondtag,artwork.thirdtag,this.type_of_profile).pipe( first()).subscribe(r=>{
        this.loading_research=false;
        return
      })
     
    }
    else {
      this.navbar.add_main_research_to_history(s.publication_category,s.format,s.target_id,artwork.title, null,"clicked_after_research",0,0,0,0,artwork.style,artwork.firsttag,artwork.secondtag,artwork.thirdtag,this.type_of_profile).pipe( first()).subscribe(r=>{
        this.loading_research=false;
        return
      })
     
    }
  }

  get_artwork_last_proposition_history(s:any, i:number) {
    let title_url=this.list_of_last_propositions_history[i].title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    if(s.publication_category=="Writing") {
      return "/artwork-" + s.publication_category.toLowerCase() + "/" + title_url + "/" + s.target_id;
    }
    else {
      return "/artwork-" + s.publication_category.toLowerCase() + "/" + s.format + "/" + title_url + "/" + s.target_id;
    }
  }




  /*************************************** NOTIFICATIONS NAVIGATION *********************************/
  /*************************************** NOTIFICATIONS NAVIGATION *********************************/
  /*************************************** NOTIFICATIONS NAVIGATION *********************************/

 


  open_my_account() {
    this.not_using_chat();
  }
  get_my_account() {
    return "/account/" + this.pseudo + "/my_account";
  }

  really_open_my_profile() {
    this.not_using_chat();
    this.router.navigate([`/account/${this.pseudo}`]);
  }
  really_open_my_account() {
    this.not_using_chat();
    this.router.navigate([`/account/${this.pseudo}/my_account`]);
  }

  open_my_trending(){
    this.not_using_chat();
    
  }
  get_my_trending(category) {
    this.not_using_chat();
    if(category=='comic'){
      return "/home/trendings/comics"
    }
    if(category=='drawing'){
      return "/home/trendings/drawings"
    }
    if(category=='writing'){
      return "/home/trendings/writings"
    }
  }

 
  get_my_favorite() {
      return "/home/favorites"
  }
  
  get_account_for_notification(notif:any) {
    return "/account/" + notif.id_user_name ;
  }
  open_comic(notif:any,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_comic(notif));
    this.not_using_chat();
    
  }
  get_comic(notif:any) {
    let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/artwork-comic/" + notif.format + "/" + title_url+ "/" + notif.publication_id;
  }

  open_comic_chapter(notif:any,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_comic_chapter(notif));
    this.not_using_chat();
    
  }
  get_comic_chapter(notif:any) {
    let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/artwork-comic/" + notif.format + "/" + title_url + "/" + notif.publication_id + "/" + notif.chapter_number;
  }
  open_drawing(notif:any,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_drawing(notif));
    this.not_using_chat();
    
  }
  get_drawing(notif:any) {
    let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/artwork-drawing/" + notif.format + "/" + title_url+ "/" + notif.publication_id;
  }
  open_writing(notif:any,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_writing(notif));
    this.not_using_chat();
    
  }
  get_writing(notif:any) {
    if(notif.publication_name){
      let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
      return "/artwork-writing/" + title_url + "/" + notif.publication_id;
    }
 
  }
  open_ad(notif:any,event) {
    event.preventDefault();
    this.router.navigateByUrl(this.get_ad(notif));
    this.not_using_chat();
    
  }
  get_ad(notif:any) {
    let title_url=notif.publication_name.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/ad-page/" + title_url + "/" + notif.publication_id;
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
    let value=this.input.nativeElement.value.replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F')
    this.navbar.add_main_research_to_history(this.publication_category,this.format,this.target_id,this.input.nativeElement.value,null,"researched",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).pipe( first()).subscribe(r=>{
      this.router.navigate([`/main-research/1/${value}/${this.publication_category}`]);
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
    this.navbar.add_main_research_to_history(this.publication_category,this.format,this.target_id,str,null,"researched",0,0,0,0,"unknown","unknown","unknown","unknown",this.type_of_profile).pipe( first()).subscribe(r=>{
      this.loading_research=false;
      this.activated_search=false;
      return;
    })
  }

  get_trending_message(i) {
    let str=this.most_researched_propositions[i].research_string;
    let value=str.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    return "/main-research/1/" + value + "/All";
  }

  add_clicked_after_research(i){
    let lst=this.list_of_first_propositions[i];
    let lst2=this.list_of_last_propositions[i];
    this.navbar.add_main_research_to_history(lst.publication_category,lst.format,lst.target_id,lst.research_string,lst.research_string1,"clicked_after_research",lst2.number_of_comics,lst2.number_of_drawings,lst2.number_of_writings,lst2.number_of_ads,lst2.category,lst2.firsttag,lst2.secondtag,lst2.thirdtag,this.type_of_profile).pipe( first()).subscribe()
  }

  add_clicked_after_research_recent(i){
    let lst=this.list_of_first_propositions_history[i];
    let lst2=this.list_of_last_propositions_history[i];
    this.navbar.add_main_research_to_history(lst.publication_category,lst.format,lst.target_id,lst.research_string,lst.research_string1,"clicked_after_research",lst2.number_of_comics,lst2.number_of_drawings,lst2.number_of_writings,lst2.number_of_ads,lst2.category,lst2.firsttag,lst2.secondtag,lst2.thirdtag,this.type_of_profile).pipe( first()).subscribe()
  }

  delete_from_history(i,event:any){
    
    event.stopPropagation();
    let category =this.list_of_first_propositions_history[i].publication_category;
    let format =this.list_of_first_propositions_history[i].format;
    let target_id =this.list_of_first_propositions_history[i].target_id;
    this.navbar.delete_click_after_ressearch_from_history(category,format,target_id).pipe( first()).subscribe(r=>{
      this.list_of_first_propositions_history.splice(i,1);
      this.list_of_last_propositions_history.splice(i,1);
      this.list_of_thumbnails_history.splice(i,1)
    })
  }
/***************************************login  **********************************/
/***************************************logout  **********************************/
  disconnecting = false;

  logout() {
    if (this.disconnecting) {
      return
    }
    this.disconnecting = true;
    clearInterval(this.get_connection_interval)

    this.AuthenticationService.logout().pipe( first()).subscribe(r => {
      let recommendations_string = this.CookieService.get('recommendations');
      if(r[0].ok){
        if (recommendations_string) {
          this.disconnecting = false;
          this.location.go('/')
          location.reload();
  
        }
        else {
          this.Community_recommendation.generate_recommendations().pipe( first()).subscribe(r => {
            this.disconnecting = false;
            this.cd.detectChanges();
            this.location.go('/')
            location.reload();
          })
        }
      }
      else{
        this.AuthenticationService.create_visitor().pipe( first()).subscribe(r=>{
          this.Community_recommendation.generate_recommendations().pipe( first()).subscribe(r => {
            this.disconnecting = false;
            this.cd.detectChanges();
            this.location.go('/')
            location.reload();
          })
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

 

  /***************************************Style navbar **********************************/
/***************************************Style  **********************************/
/***************************************Style  **********************************/
/***************************************Style  **********************************/



  
  ngAfterViewChecked() {
    
    this.setHeight();
  }
  show_icon=false;
  ngAfterViewInit(){
    if( this.navbar.visible ) {
      this.rd.setStyle(this.navbarMargin.nativeElement, "height", "54px");
        this.initialize_selectors();
    }
    else {
      this.rd.setStyle(this.navbarMargin.nativeElement, "height", "0px");
    }
  }

  @ViewChild('fixedtop')  private fixedtop: ElementRef;
  setHeight() {
    if(this.fixedtop){
      this.navbar.setHeight(this.fixedtop.nativeElement.offsetHeight);
    }
    
  
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


@HostListener('document:click', ['$event'])
  clickout(event) {
  
    if(this.focus_activated && this.input.nativeElement &&  this.searchicon && this.propositions){
      if(!this.input.nativeElement.contains(event.target) && !this.searchicon.nativeElement.contains(event.target) && !this.propositions.nativeElement.contains(event.target) ) {
        
        this.cancel_research();
      } 
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


open_messages_notifs(event: any) {
  event.stopPropagation();
  this.open_messages();
}

scroll_notifs:any;
open_messages(){
  this.number_of_unseen_messages=0;
  if(this.navbar.get_using_chat()){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:'Vous êtes déjà dans la messagerie.'},
      panelClass: "popupConfirmationClass",
    });
  }
  else if(this.data_retrieved && this.using_chat_retrieved ){
    this.popup_opened=true;
    const dialogRef = this.dialog.open(PopupNavbarComponent, {
      data: {
        only_for_notifs:true,
        for_chat:true,
        for_notifs:false,

        current_user:this.current_user,
        profile_picture:this.profile_picture,
        profile_picture_unsafe:this.profile_picture_unsafe,
        user_id:this.user_id,
        author_first_name:this.author_first_name,
        pseudo:this.pseudo,
        author_name:this.author_name,
        author_certification:this.author_certification,
        data_retrieved:this.data_retrieved,
        
        using_chat:this.using_chat,

        list_of_account_groups_names:this.list_of_account_groups_names,
        list_of_account_groups_ids:this.list_of_account_groups_ids,
        list_of_account_groups_status:this.list_of_account_groups_status,
        list_of_account_groups_pp:this.list_of_account_groups_pp,
        pp_group_loaded:this.pp_group_loaded,
        user_is_in_a_group:this.user_is_in_a_group,
      },
      panelClass: 'popupMenuNavbarNotifs',
    });

    dialogRef.afterClosed().pipe( first()).subscribe(result => {
      this.popup_opened=false;
    })
  }
 
}

open_notifications_notifs(event){
  event.stopPropagation();
  this.open_notifications();
}

open_notifications(){
  this.change_notifications_status_to_checked();
  if(this.data_retrieved && this.using_chat_retrieved){
    this.popup_opened=true;
    const dialogRef = this.dialog.open(PopupNavbarComponent, {
      data: {
        only_for_notifs:true,
        for_chat:false,
        for_notifs:true,

        current_user:this.current_user,
        profile_picture:this.profile_picture,
        profile_picture_unsafe:this.profile_picture_unsafe,
        user_id:this.user_id,
        author_first_name:this.author_first_name,
        pseudo:this.pseudo,
        author_name:this.author_name,
        author_certification:this.author_certification,
        data_retrieved:this.data_retrieved,
        
        using_chat:this.using_chat,

        list_of_account_groups_names:this.list_of_account_groups_names,
        list_of_account_groups_ids:this.list_of_account_groups_ids,
        list_of_account_groups_status:this.list_of_account_groups_status,
        list_of_account_groups_pp:this.list_of_account_groups_pp,
        pp_group_loaded:this.pp_group_loaded,
        user_is_in_a_group:this.user_is_in_a_group,
      },
      panelClass: 'popupMenuNavbarNotifs',
    });

    dialogRef.afterClosed().pipe( first()).subscribe(result => {
      this.popup_opened=false;
    })
  }
}







  
  /*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
  /*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
  /*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/
  /*********************************************  CHAT CONSTRUCTOR FUNCTION ******************************/

  chat_service_managment_function(msg){
    if(!msg[0].for_notifications){
      if(msg[0].id_user!="server" && !msg[0].is_from_server){
        if(msg[0].is_a_group_chat){
          if(msg[0].status!="seen"){
            if(!this.show_chat_messages){
              this.number_of_unseen_messages+=1;
            }
            this.cd.detectChanges;
          }
        }
        else{
          if(msg[0].status!="seen"){
            if(!this.show_chat_messages){
              this.number_of_unseen_messages+=1;
            }
            this.cd.detectChanges;
          }
        }
        
      }
      else if(msg[0].server_message=="received_new"){
        if(!this.show_chat_messages){
          this.number_of_unseen_messages+=1;
        }
        this.cd.detectChanges;
      }
      else if(msg[0].message=="New"){
        if(!this.show_chat_messages){
          this.number_of_unseen_messages+=1;
        }
        this.cd.detectChanges;
      }
      else if(msg[0].message=="New_friend_in_the_group"){
        if(!this.show_chat_messages){
          this.number_of_unseen_messages+=1;
        }
        this.cd.detectChanges;
        
      }
      else if(msg[0].message=="Exit"){
        if(msg[0].is_a_group_chat){
          if(!this.show_chat_messages){
            this.number_of_unseen_messages+=1;
          }
          this.cd.detectChanges;
        }
      }
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

  show_cookies=false;
  agree_on_cookies(){
    this.show_cookies=false;
    this.Profile_Edition_Service.agree_on_cookies().pipe( first()).subscribe(r=>{
    })
  }

  
  /****************************************** POPUP NAVBAR  ********************************************/
  /****************************************** POPUP NAVBAR  ********************************************/
  /****************************************** POPUP NAVBAR  ********************************************/
  /****************************************** POPUP NAVBAR  ********************************************/
  open_menu_for_phone_disconnected() {
    const dialogRef = this.dialog.open(PopupNavbarDisconnectedComponent, {
      panelClass: 'popupMenuNavbar',
    });
  }

  popup_opened=false;
  open_menu_for_phone(){
    if(this.data_retrieved && this.using_chat_retrieved && this.check_group_done){
      this.popup_opened=true;
      const dialogRef = this.dialog.open(PopupNavbarComponent, {
        data: {
          only_for_notifs:false,

          current_user:this.current_user,
          profile_picture:this.profile_picture,
          profile_picture_unsafe:this.profile_picture_unsafe,
          user_id:this.user_id,
          author_first_name:this.author_first_name,
          pseudo:this.pseudo,
          author_name:this.author_name,
          author_certification:this.author_certification,
          data_retrieved:this.data_retrieved,
          
          using_chat:this.using_chat,

          list_of_account_groups_names:this.list_of_account_groups_names,
          list_of_account_groups_ids:this.list_of_account_groups_ids,
          list_of_account_groups_status:this.list_of_account_groups_status,
          list_of_account_groups_pp:this.list_of_account_groups_pp,
          pp_group_loaded:this.pp_group_loaded,
          user_is_in_a_group:this.user_is_in_a_group,
        },
        panelClass: 'popupMenuNavbar',
      });

      dialogRef.afterClosed().pipe( first()).subscribe(result => {
        this.popup_opened=false;
      })
    }
    
  }


  
  
  open_share() {
    
    const dialogRef = this.dialog.open(PopupShareComponent, {
      data:{type_of_profile:this.type_of_profile},
      panelClass:"popupShareClass"
    });
    this.navbar.add_page_visited_to_history(`/open-share-maile/${this.type_of_profile}/${this.user_id}/`,this.device_info ).pipe( first()).subscribe();
  }
  open_contact() {
    const dialogRef = this.dialog.open(PopupContactComponent, {
      data:{current_user:this.current_user},
      panelClass:"popupContactComponentClass"
    });
    this.navbar.add_page_visited_to_history(`/contact-us`,this.device_info ).pipe( first()).subscribe();
  }
  open_donation() {
    this.location.go("/donation/")
    location.reload();
  }
  tuto_opened=false;
  open_tuto() {
    this.tuto_opened=true;
    this.navbar.add_page_visited_to_history(`/open_tuto`,'' ).pipe( first()).subscribe();
    const dialogRef = this.dialog.open(PopupShareComponent, {
      data:{type_of_profile:this.type_of_profile, tutorial:true,current_user:this.current_user},
      panelClass:"popupTutoClass"
    });
    dialogRef.afterClosed().pipe( first()).subscribe(result => {
      if(result){
        this.open_share()
      }
    })
  }


}