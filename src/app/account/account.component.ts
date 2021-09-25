import { Component, OnInit, ChangeDetectorRef, HostListener, QueryList, Inject } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { ChatService } from '../services/chat.service';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT, Location } from '@angular/common';
import { Reports_service } from '../services/reports.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Albums_service } from '../services/albums.service';
import { Ads_service } from '../services/ads.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { PopupSubscribingsComponent } from '../popup-subscribings/popup-subscribings.component';
import { PopupSubscribersComponent } from '../popup-subscribers/popup-subscribers.component';
import { PopupAddStoryComponent } from '../popup-add-story/popup-add-story.component';
import { PopupStoriesComponent } from '../popup-stories/popup-stories.component';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupApplyComponent } from '../popup-apply/popup-apply.component';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { PopupEditorArtworkComponent } from '../popup-editor-artwork/popup-editor-artwork.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { Story_service } from '../services/story.service';
import { Edtior_Projects } from '../services/editor_projects.service';
import { NotificationsService } from '../services/notifications.service';
import { trigger, transition, style, animate } from '@angular/animations';
import {LoginComponent} from '../login/login.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import {date_in_seconds} from '../helpers/dates';
import {get_date_to_show_for_ad} from '../helpers/dates';
import {get_date_to_show_navbar} from '../helpers/dates';
import { merge, fromEvent } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';
import {number_in_k_or_m} from '../helpers/fonctions_calculs';
import { pattern } from '../helpers/patterns';
import { NotationService } from '../services/notation.service';
import { normalize_to_nfc } from '../helpers/patterns';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faPinterest } from '@fortawesome/free-brands-svg-icons';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import {  first } from 'rxjs/operators';

declare var $: any;
declare var Swiper:any;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class AccountComponent implements OnInit {
  
  constructor(private rd: Renderer2, 
    private NotificationsService:NotificationsService,
    private Reports_service:Reports_service,
    private chatService:ChatService,
    private router: Router,
    private NotationService:NotationService,
    public route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
    private Story_service:Story_service,
    public navbar: NavbarService, 
    private deviceService: DeviceDetectorService,
    private location: Location,
    private cd: ChangeDetectorRef,
    private Profile_Edition_Service: Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private Edtior_Projects:Edtior_Projects,
    private BdOneShotService: BdOneShotService,
    private BdSerieService:BdSerieService,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Subscribing_service:Subscribing_service,
    private Albums_service:Albums_service,
    public dialog: MatDialog,
    private Ads_service:Ads_service,
    private formBuilder: FormBuilder,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    ) {

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })

    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };

    this.navbar.setActiveSection(-1);
    route.data.pipe( first() ).subscribe(resp => {
      let r=resp.user_data_by_pseudo;
      if(!r[0]){
        this.page_not_found=true;
        
        return;
      }
      this.user_id =r[0].id;
      this.user_data=r[0];
      
      this.title.setTitle('@'+r[0].nickname+' • LinkArts – Collaboration éditoriale');
      this.meta.updateTag({ name: 'description', content: "Découvrir le profil de "+r[0].firstname+", ses œuvres, annonces, et abonnements." });
      
      this.h1="Découvrir le profil de "+r[0].firstname+", ses œuvres, annonces, et abonnements.";
    })
    
    let section =  route.snapshot.data['section'];
    if(section==9 ){
      this.for_reset_password=true;
    }
    else{
      this.navbar.show();
      
    }
    this.navbar.hide_help();
  }

  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    if(this.opened_section){
      this.update_background_position(this.opened_section);
    }
    
  }

  @HostListener('window:blur', ['$event'])
  onBlur(event: any): void {
    if(this.opened_section){
      this.update_background_position(this.opened_section);
    }
  }
  
  show_selector_for_album=false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    let main_width=(window.innerWidth<600)?this.main_container.nativeElement.offsetWidth*0.95:(this.main_container.nativeElement.offsetWidth<1700)?this.main_container.nativeElement.offsetWidth*0.95*0.95:1700*0.95;
    if(this.width!=main_width){
      if(main_width<570){
        this.show_selector_for_album=true;
      }
      else{
        this.show_selector_for_album=false;
      }
      this.width=main_width;
      let account_bottom=this.main_container.nativeElement.offsetWidth*0.95;
      let account_d_f=(account_bottom*0.90)<1150?account_bottom*0.90:1150;
      let account_d_f_l=(window.innerWidth<1000)?(account_d_f):(window.innerWidth<1200)?(account_d_f-220):(account_d_f-300);
      let block_width=account_d_f_l- 20;
      this.width_for_news= block_width*0.95

      this.update_background_position(this.opened_section);
      this.update_number_of_comics_to_show();
      if(this.list_visibility_albums_drawings){
        this.prevent_shiny=true;
        this.update_number_of_drawings_to_show();
      }
      this.update_new_contents();
    }
   
  }

  h1:String="";

  for_reset_password=false;
  width:number;
  width_for_news:number;
  new_contents_loading=false;
  number_of_ads_to_show=10;
  number_of_ads_responses_to_show=10;
  loading_responses=false;
  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    let max = document.documentElement.scrollHeight;
    let sup=max*0.1;
    if(pos>= max - sup )   {
      if(this.opened_category==0 && this.opened_album>0 && this.opened_section==1){
        
        this.see_more_comics(this.opened_album-1,this.opened_album)
      }
      if(this.opened_category==1 && this.opened_album>0 && this.opened_section==1){
        this.see_more_drawings(this.opened_album-1,this.opened_album)
      }
      if(this.opened_category==2 && this.opened_album>0 && this.opened_section==1){
        this.see_more_writings(this.opened_album,this.opened_album)
      }
      if(this.list_of_ads_added && this.opened_section==2  && this.opened_category_ad==0 && this.number_of_ads_to_show<this.list_of_ads.length){
        this.number_of_ads_to_show+=10;
      }
      if(this.list_of_ads_added && !this.loading_responses && this.opened_section==2  && this.opened_category_ad==1 && this.number_of_ads_responses_to_show<this.list_of_ads_responses.length){
        this.loading_responses=true;
        this.number_of_ads_to_show+=10;
        this.Ads_service.get_all_my_responses(this.pseudo,10, this.number_of_ads_to_show).pipe( first() ).subscribe(r => {
          let len= this.list_of_ads_responses.length
          if (r[0].length>0){
            let compt=0
            for (let i=0;i<r[0].length;i++){
              this.list_of_ads_responses[i+ len]=r[0][i];
              this.list_of_ads_responses_dates[i + len]= get_date_to_show_for_ad(date_in_seconds(this.now_in_seconds,r[0][i].createdAt) );
                this.Ads_service.retrieve_ad_by_id(r[0][i].id_ad).pipe( first() ).subscribe(m=>{
                  if(m[0]){
                    this.list_of_ads_responses_data[i+ len]=m[0];
                  }
                  this.cd.detectChanges();
                  compt++;
                  if(compt==r[0].length){
                    this.loading_responses=false;
                  }
                })
              }
          }
          else{
            this.loading_responses=false;
          }
          
        })
    
      
      }
    }
    
    if( this.accountSelect ) {
      this.accountSelect.close();
    }

    if( this.albums_select ) {
      this.albums_select.close();
    }
  }
  
  @ViewChild("accountSelect") accountSelect;

  @ViewChild("albums_select") albums_select;


  @ViewChild('profileHovered', {static: false}) profileHovered:ElementRef;
  showEditCoverPic:boolean = true;


  openedMenu:string = "";
  menuClosed() {
    this.openedMenu="";
  }
  menuOpened(i:number, s:string) {
    this.openedMenu=i+s;
  }


  type_of_account:string;
  certified_account:boolean;  

  //NEW VARIABLES
  emphasized_artwork_added: boolean = false;
  emphasized_artwork:any;
  emphasized=true;
  pp_is_loaded=false;
  cover_is_loaded=false;
  
  /************* sections ************/
  //0 : artworks, 1 : posters, etc.
  opened_section:number=-1;
  opened_section_small:number=-1;
  //bd, dessins, écrits de l'auteur, etc.
  opened_category:number = -1;
  //-1 : no album add, 1 : add comic, 2 : add drawing, 3 : add writing
  add_album:number = -1;
  // gestion des abonnements
  already_subscribed:boolean=false;
  subscribtion_checked=false;
  opened_album:number = -1;
  profile_picture:SafeUrl;
  cover_picture:SafeUrl;

  visitor_id:number;
  visitor_name:string;
  visitor_certified:boolean;
  visitor_description:string;
  visitor_first_name:string;
  visitor_likes:number;
  visitor_loves:number;
  visitor_views:number;
  visitor_number_of_visits:number;
  visitor_subscribers_number:number;
  visitor_number_of_comics:number;
  visitor_number_of_drawings:number;
  visitor_number_of_writings:number;
  visitor_number_of_ads:number;
  visitor_number_of_artpieces:number;
  last_emitted_project:any;
  visitor_stats_retrieved=false;

  mode_visiteur:boolean=true;
  mode_visiteur_added:boolean=false;
  pseudo:string;
  user_id:number=0;
  user_data:any;
  gender:string;
  author:any;
  author_name:string;
  firstName:string;
  primary_description: string;
  occupation: string;
  education: string;
  user_location:string;
  now_in_seconds:number=Math.trunc( new Date().getTime()/1000);
  subscribed_users_list:any[]=[];
  users_subscribed_to_list:any[]=[];
  number_of_artpieces:number=0;
  artpieces_received=false;
  number_of_archives:number;
  gridAlbum:any;
  archives_ads:any[]=[];
  list_of_ads:any[]=[];
  list_of_ads_added:boolean=false;
  list_of_ads_responses:any[]=[];
  list_of_ads_responses_dates:any[]=[];
  list_of_ads_responses_data:any[]=[];
  list_of_ads_responses_added:boolean=false;
  /***************************************** */
  /****************    BD    *************** */
  /***************************************** */
  //List des BD oneshot
  list_bd_oneshot:any;
  list_bd_oneshot_added:boolean=false;
  //List des BD série
  list_bd_series:any;
  list_bd_series_added:boolean=false;
  //List des noms d'albums
  list_titles_albums_bd:any = ["Tout","One-shots","Séries"];
  list_titles_albums_bd_added:any[]=[];
  //List des albums
  list_albums_bd:any[]=[];
  list_albums_bd_added:boolean=false;
  list_bd_albums_status=["public","public"];




  //List des drawings oneshot 
  list_drawings_onepage:any;
  list_drawings_onepage_added:boolean=false;
  //List des artbooks
  list_drawings_artbook:any;
  list_drawings_artbook_added:boolean=false;
  //List des noms d'albums
  list_titles_albums_drawings:any = ["Tout","One-shots","Artbooks"];
  list_titles_albums_drawings_added:any[]=[];
   //visibility
   list_visibility_albums_drawings:boolean = false;
  //List des albums
  list_albums_drawings:any[]=[];
  list_albums_drawings_added:boolean=false;
  list_drawing_albums_status=["public","public"];
  //numéro de la cover
  cover_album_numbers:any[]=[];
  array_of_selected_safeurls:any[]=[];
  list_of_cover_index=[1,2,3,4,5,6]

  

  //list des writings
  list_writings:any;
  list_writings_added:boolean=false;
  // noms d'albums
  list_titles_albums_writings:any = ["Tout"];
  list_titles_albums_writings_added:any[]=[];
  //list des albums
  list_albums_writings:any[]=[];
  list_albums_writings_added:boolean=false;
  list_writings_albums_status:any[]=[];


  //new contents
  new_comic_contents:any[]=[];
  new_comic_contents_added=false;

  new_drawing_contents:any[]=[];
  new_drawing_contents_added=false;

  new_writing_contents:any[]=[];
  new_writing_contents_added=false;

  number_of_new_contents_to_show=6;

  //type of profile
  type_of_profile:string;
  type_of_profile_retrieved=false;
  visitor_type_of_account:string;

  //number of publications
  number_of_comics:number;
  number_of_drawings:number;
  number_of_writings:number;
  number_of_ads:number;



  user_blocked=false;
  user_who_blocked:string;
  user_blocked_retrieved=false;


  links:any;



  listOfCategories = ["Accueil","Œuvres ("+this.number_of_artpieces+")","Annonces ("+this.list_of_ads.length+")","Abonnés ("+this.subscribed_users_list.length+")",
  "Abonnements ("+this.users_subscribed_to_list.length+")","Qui suis-je","Archives","Mon compte","Publier"];
 
  primary_description_extended:string='';
  profile_not_found=false;
  profile_suspended=false;
  my_profile_is_suspended=false;
  page_not_found=false;
  story_retrieved=false;
  story_found=false;
  /******************************************* START ON INIT ********************************************/
  /******************************************* START ON INIT ********************************************/
  /******************************************* START ON INIT ********************************************/

  device_info='';
  //insta_link=`https://api.instagram.com/oauth/authorize?client_id=2949440818629576&redirect_uri=https://www.linkarts.fr/&scope=user_profile,user_media&response_type=code`;
  ngOnInit()  {

    
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
   
    window.scroll(0,0);
    this.pseudo = this.activatedRoute.snapshot.paramMap.get('pseudo');
    
    if( !( this.pseudo && this.pseudo.length>0)){
      this.page_not_found=true;
      return
    }


    
    this.route.data.pipe( first() ).subscribe(resp => {
      
      let user_news=resp.user_news;
      if(user_news[0]){
        this.list_of_news=user_news[0];
        if(this.list_of_news.length>0){
          for(let i=0;i<this.list_of_news.length;i++){
            let now=Math.trunc( new Date().getTime()/1000);
            let date=this.list_of_news[i].createdAt;
            date = date.replace("Z",'');
            date=date.slice(0,19)
            let deco_date=Math.trunc( new Date(date + '+00:00').getTime()/1000)
            this.list_of_news_date[i]=get_date_to_show_navbar(now-deco_date);
          }
          
        }
      }

      let public_user_stats=resp.public_user_stats;
      this.number_of_views=number_in_k_or_m(public_user_stats[0].views)
      this.number_of_likes=number_in_k_or_m(public_user_stats[0].likes)
      this.number_of_loves=number_in_k_or_m(public_user_stats[0].loves)


      let r=resp.user_pp_pseudo;
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;

   
      
    })

    this.Profile_Edition_Service.retrieve_cover_picture_by_pseudo(this.pseudo).pipe(first()).subscribe(cp=>{
      let url2 = (window.URL) ? window.URL.createObjectURL(cp) : (window as any).webkitURL.createObjectURL(cp);
      const SafeURL2 = this.sanitizer.bypassSecurityTrustUrl(url2);
      this.cover_picture = SafeURL2;
    })
   


    if(!this.for_reset_password){
      this.initialize_page_for_visitor()
      this.get_contents_infos();
      this.get_subscribings_infos();
      

    }
    else{
      this.location.go(`account/${this.pseudo}`)
      this.route.data.subscribe( resp => {
        let s = resp.user;
        let user=this.user_data;
        this.visitor_id=s[0].id
        this.visitor_name=s[0].nickname;
        this.visitor_certified=s[0].certified_account;
        this.visitor_description=s[0].primary_description;
        this.visitor_first_name=s[0].firstname;
        this.type_of_profile=s[0].status;
        this.visitor_type_of_account=s[0].type_of_account?s[0].type_of_account:"visitor";
        this.type_of_profile_retrieved=true;
       
        if( user  && this.visitor_id==user.id){
          this.mode_visiteur = false;
        }
        this.mode_visiteur_added = true;
  
        if( !user || user.status=="visitor") {
          this.page_not_found=true;
          return
        }
        else if(user && user.status=="deleted"){
          
          this.profile_not_found=true;
          this.author_name = user.society ? user.society : user.firstname;
          this.navbar.delete_research_from_navbar("Account","unknown",this.user_id).pipe( first() ).subscribe(l=>{
          });
          
          this.user_blocked=false;
          this.mode_visiteur_added = true;
          this.user_blocked_retrieved=true;
          this.list_writings_added=true; 
          this.list_drawings_artbook_added=true;
          this.list_drawings_onepage_added=true;
          this.list_bd_series_added=true;
          this.list_bd_oneshot_added=true;
          this.cd.detectChanges();
          this.update_background_position( this.opened_section );
          return
        }
        else if( this.pseudo != user.nickname ) {
          this.page_not_found=true;
          return
        }
        else{
          this.author=user;
          this.author_name = user.society ? user.society : user.firstname;
          this.gender=user.gender;
          this.firstName=user.firstname;
          this.primary_description=user.primary_description;
          this.type_of_account=user.type_of_account;
          this.primary_description_extended=user.primary_description_extended;
          this.certified_account=user.certified_account;
          this.user_location=user.location;

          if(this.type_of_account.includes("dit")){
            this.list_of_skills=this.author.editor_genres?this.author.editor_genres:[];
            this.list_of_categories=this.author.editor_categories?this.author.editor_categories:[];
            this.instructions=this.author.instructions;
            this.standard_price=this.author.standard_price?this.author.standard_price:0
            this.standard_delay=this.author.standard_delay?this.author.standard_delay:"4m";
            this.express_price=this.author.express_price?this.author.express_price:6;
            this.express_delay= this.author.express_delay?this.author.express_delay:"1m";
          }
          else{
            this.list_of_skills=this.author.skills?this.author.skills:[];
            this.list_of_categories=this.author.artist_categories?this.author.artist_categories:[];
          }
          this.user_blocked_retrieved=true;
          this.list_writings_added=true; 
          this.list_drawings_artbook_added=true;
          this.list_drawings_onepage_added=true;
          this.list_bd_series_added=true;
          this.list_bd_oneshot_added=true;

          this.navbar.add_page_visited_to_history(`/account/reset_password/${this.visitor_id}/${this.visitor_name}/for/${this.user_id}/${this.pseudo}`, this.device_info).pipe( first() ).subscribe();

          let id = parseInt(this.route.snapshot.paramMap.get('id'));
          let password = this.route.snapshot.paramMap.get('password');
          this.Profile_Edition_Service.check_password_for_registration2(id,password).pipe( first() ).subscribe(r=>{
            if(r[0].user_found){
              this.opened_section=9;//ok
              this.cd.detectChanges()
            }
            else{
              this.page_not_found=true;
              this.cd.detectChanges();
            }
          })
        }
      });
    }

   
  }




  initialize_page_for_visitor(){


    this.Story_service.check_stories_for_account(this.user_id).pipe( first() ).subscribe(r => {
      if(r[0] && r[0].story_found){
        this.list_of_stories[0]=r[0].stories_retrieved;
        this.story_state=r[0].status;
        this.story_found=true;
      }
      else{
        this.story_state=false;
        this.story_found=false;
      }
      this.story_retrieved=true;
    })

    this.route.data.pipe( first() ).subscribe( resp => {
      let s = resp.user;
      let user=this.user_data;
      this.visitor_id=s[0].id
      this.visitor_name=s[0].nickname;
      this.visitor_certified=s[0].certified_account;
      this.visitor_description=s[0].primary_description;
      this.visitor_type_of_account=s[0].type_of_account?s[0].type_of_account:"visitor";
      this.visitor_first_name=s[0].firstname;
      this.type_of_profile=s[0].status;
      this.type_of_profile_retrieved=true;
      this.cd.detectChanges();

      

     
      if(user.type_of_account.includes('dit')){
        this.get_list_of_artworks_for_editor()
      }
  
     
      if( user  && this.visitor_id==user.id){
        this.mode_visiteur = false;
      }
      else if (user && this.type_of_profile=='account'){
        let compteur_visitor_stats=0;
        this.NotationService.get_user_public_stats(this.visitor_name).pipe( first() ).subscribe(r=>{
          this.visitor_likes=r[0].likes;
          this.visitor_loves=r[0].loves;
          this.visitor_views=r[0].views;
          compteur_visitor_stats++;
          check_visitor_stats(this);
        })
  
        this.Subscribing_service.get_all_subscribers_by_pseudo(this.visitor_name).pipe( first() ).subscribe(r=>{
          this.visitor_subscribers_number=r[0].length;
          compteur_visitor_stats++;
          check_visitor_stats(this);
        })
        this.navbar.get_number_of_account_viewers(this.visitor_id).pipe( first() ).subscribe(r=>{
          this.visitor_number_of_visits=r[0].views;
          compteur_visitor_stats++;
          check_visitor_stats(this);
        });

        this.Edtior_Projects.get_last_emitted_project(this.visitor_id,this.user_id).pipe( first() ).subscribe(r=>{
          if(r[0] && r[0][0]){
            this.last_emitted_project=r[0][0]
          }
          compteur_visitor_stats++;
          check_visitor_stats(this);
        });
  
        this.Profile_Edition_Service.retrieve_number_of_contents_by_pseudo(this.visitor_name).pipe( first() ).subscribe(r=>{
          this.visitor_number_of_comics=r[0].number_of_comics;
          this.visitor_number_of_drawings=r[0].number_of_drawings;
          this.visitor_number_of_writings=r[0].number_of_writings;
          this.visitor_number_of_ads=r[0].number_of_ads;
          this.visitor_number_of_artpieces=this.visitor_number_of_comics+ this.visitor_number_of_drawings +  this.visitor_number_of_writings;
          compteur_visitor_stats++;
          check_visitor_stats(this);
        })

        //ajouter fonction pour vérifier quand il a envoyé son dernier projet

        function check_visitor_stats(THIS){
          if(compteur_visitor_stats==5){
            THIS.visitor_stats_retrieved=true;
          }
        }
      }
      this.mode_visiteur_added = true;

      if( !user || user.status=="visitor") {
        this.page_not_found=true;
        return
      }
      else if(user && ((user.status=='suspended' && this.visitor_id!=user.id) || user.status=="deleted") ){
        
        // if author suspended and visitor, if account doesn't exist or deleted
        this.profile_not_found=true;

        this.author_name = user.society ? user.society : user.firstname;
        this.cd.detectChanges();
        if(user.status=="suspended"){
          this.gender=user.gender;
          this.firstName=user.firstname;
          this.primary_description=user.primary_description;
          this.type_of_account=user.type_of_account;
          this.certified_account=user.certified_account;
          this.user_location=user.location;
          this.profile_suspended=true;
         
        }
        else{
          this.navbar.delete_research_from_navbar("Account","unknown",this.user_id).pipe( first() ).subscribe(l=>{
          });
        }
        this.user_blocked=false;
        this.user_blocked_retrieved=true;
        this.list_writings_added=true; 
        this.list_drawings_artbook_added=true;
        this.list_drawings_onepage_added=true;
        this.list_bd_series_added=true;
        this.list_bd_oneshot_added=true;
        this.cd.detectChanges();
        this.update_background_position( this.opened_section );;
        return
      }
      else if( this.pseudo != user.nickname ) {
        this.page_not_found=true;
        return
      }
      else{
        if(user && user.status=='suspended' && this.visitor_id==user.id){
          this.my_profile_is_suspended=true;
          this.cd.detectChanges();
          
        }
        this.author=user;
        this.author_name = user.society ? user.society : user.firstname;
        this.gender=user.gender;
        this.list_of_members=user.list_of_members;
        this.firstName=user.firstname;
        this.primary_description=user.primary_description;
        this.type_of_account=user.type_of_account;
        this.primary_description_extended=user.primary_description_extended;
        this.certified_account=user.certified_account;
        this.user_location=user.location;

        if(this.type_of_account.includes("dit")){
          this.list_of_skills=this.author.editor_genres?this.author.editor_genres:[];
          this.list_of_categories=this.author.editor_categories?this.author.editor_categories:[];
          this.instructions=this.author.editor_instructions;
          this.standard_price=this.author.standard_price?this.author.standard_price:0
          this.standard_delay=this.author.standard_delay?this.author.standard_delay:"4m";
          this.express_price=this.author.express_price?this.author.express_price:6;
          this.express_delay= this.author.express_delay?this.author.express_delay:"1m";
        }
        else{
          this.list_of_skills=this.author.skills?this.author.skills:[];
          this.list_of_categories=this.author.artist_categories?this.author.artist_categories:[];
        }

        this.email_about=this.author.email_about;
        this.phone_about=this.author.phone_about;

        this.links=this.author.links?this.author.links[0]:null;
        if(this.links){
          this.facebook=this.links.facebook;
          this.instagram=this.links.instagram;
          this.website=this.links.website;
          this.artstation=this.links.artstation;
          this.pinterest=this.links.pinterest;
          this.twitter=this.links.twitter;
          this.youtube=this.links.youtube;
          this.deviantart=this.links.deviantart;
          this.other_website=this.links.other_website;
          this.shopping=this.links.shopping;

          /*if(this.instagram){
            let insta=this.instagram.replace("://","/");
            let list_of_insta=insta.split("/");
            if(list_of_insta && list_of_insta[2]){
              this.Profile_Edition_Service.retrieve_instagram_data(list_of_insta[2]).pipe( first() ).subscribe(r=>{
                if(r[0]){
                  //this.number_of_instagram_followers=number_in_k_or_m(r[0].user.edge_followed_by.count);
                }
              })
            }
           
          }*/
        }


        this.cv_name=this.author.cv;
        if(this.cv_name){
          this.Profile_Edition_Service.retrieve_cv(this.pseudo).pipe( first() ).subscribe(r=>{
            this.cv=r;
          })
        }
        
        if(this.visitor_id<2){
          console.log("in visitor id")
          this.navbar.get_number_of_account_viewers(this.user_id).pipe( first() ).subscribe(r=>{
          
            let number_of_visits=number_in_k_or_m(r[0].views);
            let number_of_visits_after_research=number_in_k_or_m(r[0].views_after_research);
            console.log("number of visits :")
            console.log(number_of_visits)
            console.log(number_of_visits_after_research)
            this.cd.detectChanges()
          });

          this.navbar.get_number_of_flagship_clicks(this.user_id).pipe( first() ).subscribe(r=>{
            let number_of_flagship_clicks=number_in_k_or_m(r[0].number);
            console.log("number of flagships :")
            console.log(number_of_flagship_clicks)
          
            this.cd.detectChanges()
          });

        }
        if (this.visitor_id==user.id){

        
          this.navbar.get_number_of_account_viewers(this.user_id).pipe( first() ).subscribe(r=>{
          
            this.number_of_visits=number_in_k_or_m(r[0].views);
            this.number_of_visits_after_research=number_in_k_or_m(r[0].views_after_research);
            this.profil_vews_found=true;
            this.cd.detectChanges()
          });

          this.navbar.get_number_of_flagship_clicks(this.user_id).pipe( first() ).subscribe(r=>{
            this.number_of_flagship_clicks=number_in_k_or_m(r[0].number);
            this.number_of_flagship_clicks_retrieved=true;
            this.cd.detectChanges()
          });
          this.user_blocked=false;
          this.user_blocked_retrieved=true;
          this.cd.detectChanges();
          this.update_background_position( this.opened_section );
        }
        else{
          // check if the user author blocked the visitor
          this.Profile_Edition_Service.check_if_user_blocked(this.user_id).pipe( first() ).subscribe(r => {
            if(r[0].nothing){
              this.user_blocked=false;
            }
            else{
              if(r[0].id_user==this.user_id){
                this.user_who_blocked="user";
              }
              else{
                this.user_who_blocked="me";
              }
              this.user_blocked=true;
            }
            this.user_blocked_retrieved=true;
            this.cd.detectChanges();
            this.update_background_position( this.opened_section );
            this.initialize_swiper();
          })
                  
        };

        if(this.gender=="Groupe" && this.type_of_account.includes("Artiste")){
          this.get_list_of_members_data();
        }
       

        this.route.data.pipe( first() ).subscribe(resp => {
          let r=resp.number_of_contents;
          this.number_of_comics=r[0].number_of_comics;
          this.number_of_drawings=r[0].number_of_drawings;
          this.number_of_writings=r[0].number_of_writings;
          this.number_of_ads=r[0].number_of_ads;
          this.number_of_artpieces=this.number_of_comics+ this.number_of_drawings +  this.number_of_writings;
          this.cd.detectChanges();
          this.update_background_position(this.opened_section)
          if(!this.mode_visiteur){
            this.navbar.check_if_research_exists("Account","unknown",this.user_id,this.pseudo,"clicked").pipe( first() ).subscribe(p=>{
              if(!p[0].value){
                this.navbar.add_main_research_to_history("Account","unknown",this.user_id,this.pseudo,this.author_name,"clicked",this.number_of_comics,this.number_of_drawings,this.number_of_writings,this.number_of_ads,this.type_of_account,"unknown","unknown","unknown", this.type_of_profile).pipe( first() ).subscribe();
              }
            })
          }
          else{
            this.navbar.add_main_research_to_history("Account","unknown",this.user_id,this.pseudo,this.author_name,"clicked",this.number_of_comics,this.number_of_drawings,this.number_of_writings,this.number_of_ads,this.type_of_account,"unknown","unknown","unknown", this.type_of_profile).pipe( first() ).subscribe();
          } 
        })

        

        if(this.type_of_profile=="suspended"){
          let cat = this.route.snapshot.data['category']
          if(cat>=0){
            this.opened_category=cat;
            this.open_section( 8,false,0 );
          }
          else{
            this.open_section( 8,true,0 );
          }
          
        }
        else if(this.route.snapshot.data['section']>2){
          if(this.mode_visiteur){
            if(this.route.snapshot.data['section']==10){//ok
              this.open_section( 0,true ,0);
              this.cd.detectChanges();
              let id_friend = parseInt(this.route.snapshot.paramMap.get('id_friend'));
              let pseudo_friend = this.route.snapshot.paramMap.get('pseudo_friend');
              this.update_background_position(0)
              const dialogRef = this.dialog.open(LoginComponent, {
                data: {usage:"for_chat"},
                panelClass: "loginComponentClass",
              });
              dialogRef.afterClosed().pipe( first() ).subscribe(result => {
                if(result){
                  this.location.go("/chat/" + pseudo_friend + '/' + id_friend)
                  location.reload();
                  return
                }
                
              })
            }
            else if(this.route.snapshot.data['section']==11){
              this.open_section( 0,true,0 );
              this.cd.detectChanges();
              this.update_background_position(this.opened_section);
              let pseudo= this.route.snapshot.paramMap.get('pseudo');
              const dialogRef = this.dialog.open(LoginComponent, {
                data: {usage:"for_chat"},
                panelClass: "loginComponentClass",
              });
              dialogRef.afterClosed().pipe( first() ).subscribe(result => {
                if(result){
                  this.location.go("/account/" + pseudo + '/my_account')
                  location.reload();
                  return
                }
              })
            }
            else if(this.route.snapshot.data['section']==12){
              this.open_section( 0,true,0 );
              this.cd.detectChanges();
              this.update_background_position(this.opened_section);
              let id_project= parseInt(this.route.snapshot.paramMap.get('id_project'));
              let password =this.route.snapshot.paramMap.get('password')
              const dialogRef = this.dialog.open(LoginComponent, {
                data: {usage:"for_chat"},
                panelClass: "loginComponentClass",
              });
              dialogRef.afterClosed().pipe( first() ).subscribe(result => {
                if(result){
                  const dialogRef = this.dialog.open(PopupApplyComponent, {
                    data: {
                      multiple_submission:false,
                      after_payement:true,
                      id_project:id_project,
                      password:password,
                    },
                    panelClass: "popupLinkcollabApplyClass",
                  })
                }
              })
            }
            else{
              this.open_section( 0,true,0 );
              this.cd.detectChanges();
              this.update_background_position(this.opened_section)
            }
            
          }
          else if(this.route.snapshot.data['section']==1 && this.type_of_account.includes('dit')){
            this.open_section( 0,true,0 );
            this.cd.detectChanges();
            this.update_background_position(this.opened_section)
          }
          else if(this.route.snapshot.data['section']==6 ){//ok
            let num =this.route.snapshot.paramMap.get('form_number')
            this.open_section( this.route.snapshot.data['section'],true, num);
            this.cd.detectChanges();
            this.update_background_position(this.opened_section)
          }
          else{
            if(this.route.snapshot.data['section']==10){//ok
              let id_friend = parseInt(this.route.snapshot.paramMap.get('id_friend'));
              let pseudo_friend = this.route.snapshot.paramMap.get('pseudo_friend');
              this.location.go("/chat/" + pseudo_friend + '/' + id_friend)
              location.reload();
              return
            }
            else if(this.route.snapshot.data['section']==11){
              let section =9;//ok
              this.open_section( section,true,0 );
              this.cd.detectChanges();
              this.update_background_position(this.opened_section)
            }
            else if(this.route.snapshot.data['section']==12){
              let section =0;
              this.open_section( section,true,0 );
              this.cd.detectChanges();
              this.update_background_position(this.opened_section)

              let id_project= parseInt(this.route.snapshot.paramMap.get('id_project'));
              let password =this.route.snapshot.paramMap.get('password')
              
              
              const dialogRef = this.dialog.open(PopupApplyComponent, {
                data: {
                  multiple_submission:false,
                  after_payement:true,
                  id_project:id_project,
                  password:password,
                },
                panelClass: "popupLinkcollabApplyClass",
              })

            }
            
            
            else{
              let cat = this.route.snapshot.data['category']
              let section =this.route.snapshot.data['section'];
              if(cat>=0){
                this.opened_category=cat;
                this.open_section( section,false,0 );
              }
              else{
                this.open_section( section,true,0 );
              }
              this.cd.detectChanges();
              this.update_background_position(this.opened_section)
            }
            
          }

        }
        else{
          let cat = this.route.snapshot.data['category']
          if(cat>=0){
            this.opened_category=cat;
            this.open_section( this.route.snapshot.data['section'],false,0 );
          }
          else{
            this.open_section( this.route.snapshot.data['section'],true,0 );
          }
          this.cd.detectChanges();
          this.update_background_position(this.opened_section)
        }

      }
    });
  }

  /**************************************  SUBSCRIBINGS  **********************************/
  /**************************************  SUBSCRIBINGS  **********************************/
  get_subscribings_infos(){


    this.Subscribing_service.check_if_visitor_susbcribed(this.user_id).pipe( first() ).subscribe(information => {
      if(information[0].value){
        this.already_subscribed=true;
        this.subscribtion_checked=true;
        
        this.cd.detectChanges();
        this.update_background_position(this.opened_section)
      }
    }); 

    this.route.data.pipe( first() ).subscribe(resp => {
      let information=resp.subscribers;
      if(Object.keys(information).length>0){
        this.subscribed_users_list=information[0];
      }
      this.cd.detectChanges();
      this.update_background_position(this.opened_section)
    });

    this.route.data.pipe( first() ).subscribe(resp => {
      let information=resp.subscribings;
      this.users_subscribed_to_list= information[0];
      this.cd.detectChanges();
      this.update_background_position(this.opened_section)
    });
  }

  /****************************************** CONTENTS INFOS ****************************************/
  /****************************************** CONTENTS INFOS ****************************************/
  /****************************************** CONTENTS INFOS ****************************************/

  new_contents_added=false;
  display_new_comic_contents=false;
  display_new_writing_contents=false;
  display_new_drawing_contents=false;
  no_new_contents=false;
  get_contents_infos(){
    this.Profile_Edition_Service.get_emphasized_content(this.user_id).pipe( first() ).subscribe(r=>{
      if (r[0]!=null){
        this.emphasized_artwork=r[0];
        this.emphasized_artwork_added=true;
      }
      this.cd.detectChanges();
      this.update_background_position(this.opened_section)
    });

    this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.new_comics;
      if(!r[0]){
        this.page_not_found=true;
        return
      }
      if (r[0].length>0){
        let compteur=0;
        for (let i=0;i<r[0].length;i++){
          if(r[0][i].format=="one-shot"){
            this.BdOneShotService.retrieve_bd_by_id(r[0][i].publication_id).pipe( first() ).subscribe(s=>{
              if(s[0] && s[0].status=="public"){
                this.new_comic_contents[i]=s[0];
              }
              compteur++;
              if(compteur==r[0].length){
                this.delete_null_elements_of_a_list( this.new_comic_contents)
                this.new_comic_contents_added=true;
                this.display_new_comic_contents=true;
                this.check_new_contents();
                this.cd.detectChanges();
                this.update_background_position(this.opened_section)
              }
            })
          }
          else{
            this.BdSerieService.retrieve_bd_by_id(r[0][i].publication_id).pipe( first() ).subscribe(s=>{
              
              if(s[0] && s[0].status=="public"){
                this.new_comic_contents[i]=s[0];
              }
              compteur++;
              if(compteur==r[0].length){
                this.delete_null_elements_of_a_list( this.new_comic_contents)
                this.new_comic_contents_added=true;
                this.display_new_comic_contents=true;
                this.check_new_contents();
                this.cd.detectChanges();
                this.update_background_position(this.opened_section)
              }
            })
          }
        }
      }
      else{
        this.new_comic_contents_added=true;
        this.check_new_contents();
        this.cd.detectChanges();
        this.update_background_position(this.opened_section)
      }
    });

    this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.new_drawings;
      if(!r[0]){
        this.page_not_found=true;
        return
      }
      if (r[0].length>0){
        let compteur=0;
        for (let i=0;i<r[0].length;i++){
          if(r[0][i].format=="one-shot"){
            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][i].publication_id).pipe( first() ).subscribe(s=>{
              if(s[0] && s[0].status=="public"){
                this.new_drawing_contents[i]=s[0];
              }
              compteur++;
              if(compteur==r[0].length){
                this.delete_null_elements_of_a_list( this.new_drawing_contents)
                this.new_drawing_contents_added=true;
                this.display_new_drawing_contents=true;
                this.check_new_contents();
                this.cd.detectChanges();
                this.update_background_position(this.opened_section)
              }
            })
          }
          else{
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][i].publication_id).pipe( first() ).subscribe(s=>{
              if(s[0] && s[0].status=="public"){
                this.new_drawing_contents[i]=s[0];
              }
              compteur++;
              if(compteur==r[0].length){
                this.delete_null_elements_of_a_list( this.new_drawing_contents)
                this.new_drawing_contents_added=true;
                this.display_new_drawing_contents=true;
                this.check_new_contents();
                this.cd.detectChanges();
                this.update_background_position(this.opened_section)
              }
            })
          }
        }
      }
      else{
        this.new_drawing_contents_added=true;
        this.check_new_contents();
        this.cd.detectChanges();
        this.update_background_position(this.opened_section)
      }
    });

    this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.new_writings;
      if(!r[0]){
        this.page_not_found=true;
        return
      }
      if (r[0].length>0){
        let compteur=0;
        for (let i=0;i<r[0].length;i++){
          this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][i].publication_id).pipe( first() ).subscribe(s=>{
            if(s[0] && s[0].status=="public"){
              this.new_writing_contents[i]=s[0];
            }
            compteur++;
            if(compteur==r[0].length){
              this.delete_null_elements_of_a_list( this.new_writing_contents)
              this.new_writing_contents_added=true;
              this.display_new_writing_contents=true;
              this.check_new_contents();
              this.cd.detectChanges();
              this.update_background_position(this.opened_section)
            }
          })
        }
       
      }
      else{
        this.new_writing_contents_added=true;
        this.check_new_contents();
        this.cd.detectChanges();
        this.update_background_position(this.opened_section)
      }
    });
    
    

    this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.ads;
      if (r[0].length>0){
        for (let i=0;i<r[0].length;i++){
            this.list_of_ads[i]=r[0][i];
            if(i==r[0].length-1){
              this.list_of_ads_added=true;
            }
        }
      }
      else{
        this.list_of_ads_added=true;
      }
      this.cd.detectChanges();
      this.update_background_position(this.opened_section)
    })

    this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.ads_responses;
      if (r[0].length>0){
        let compt=0
        for (let i=0;i<r[0].length;i++){
          this.list_of_ads_responses[i]=r[0][i];
          this.list_of_ads_responses_dates[i]= get_date_to_show_for_ad(date_in_seconds(this.now_in_seconds,r[0][i].createdAt) ).replace("Envoyée","Réponse envoyée");
            this.Ads_service.retrieve_ad_by_id(r[0][i].id_ad).pipe( first() ).subscribe(m=>{
              if(m[0]){
                this.list_of_ads_responses_data[i]=m[0];
              }
              
              compt++;
              if(compt==r[0].length){
                this.list_of_ads_responses_added=true;
              }
            })
            
          }
      }
      else{
        this.list_of_ads_responses_added=true;
      }
      this.cd.detectChanges();
      this.update_background_position(this.opened_section)
    })


    /*********************************ALBUMS  ******************************************/
    /*********************************ALBUMS  ******************************************/

    /*********************************** COMICS *************************************/
  
    this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.comics_os;
        this.list_bd_oneshot = r[0];
        this.list_bd_oneshot_added=true;
        this.cd.detectChanges();
        this.update_background_position( this.opened_section );;
        this.get_comics_albums();
      });

      this.route.data.pipe( first() ).subscribe(resp => {
        let r=resp.comics_se;
        this.list_bd_series = r[0];
        this.list_bd_series_added=true;   
        this.cd.detectChanges();
        this.update_background_position( this.opened_section );;
        this.get_comics_albums()
      });

     /*********************************** DRAWINGS *************************************/

     this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.drawings_os;
      this.list_drawings_onepage = r[0];
      this.list_drawings_onepage_added=true;
      this.cd.detectChanges();
      this.update_background_position( this.opened_section );;
      this.get_drawings_albums()
    });
    
    this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.drawings_ar;
      this.list_drawings_artbook = r[0];
      this.list_drawings_artbook_added=true;
      this.cd.detectChanges();
      this.update_background_position( this.opened_section );;
      this.get_drawings_albums()
    });

   


    /*********************************** WRITINGS *************************************/

    
    this.route.data.pipe( first() ).subscribe(resp => {
      let r=resp.writings;
      this.list_writings = r[0];
      this.list_writings_added=true;
      this.cd.detectChanges();
      this.update_background_position( this.opened_section );
      this.Albums_service.get_albums_writings(this.user_id).pipe( first() ).subscribe(information => {
        if(Object.keys(information).length!=0){
          for (let i=0; i <Object.keys(information).length;i++){
            this.list_titles_albums_writings_added.push(information[i].album_name);
            this.list_titles_albums_writings.push(information[i].album_name);
            this.list_writings_albums_status.push(information[i].status);
            let album=information[i].album_content;
            let length =Object.keys(information[i].album_content).length
            for (let j=0;j<length;j++){   
              if(information[i].album_content[length-1-j]){
                if(!this.check_if_writing_public(information[i].album_content[length-1-j])){
                  album.splice(length-1-j,1);
                }
              } 
              if(j==length-1){
                this.list_albums_writings.push(album);
                if(i==Object.keys(information).length -1){
                  this.list_albums_writings_added = true;
                  this.get_number_of_writings_to_show();
                }
              }
              
            } 
  
          }
        }
        else{
          
          this.list_albums_writings_added = true;
          this.get_number_of_writings_to_show();
        }
        if( this.opened_section == 1 && this.route.snapshot.data['category']==2) {
          this.open_category( this.route.snapshot.data['category'],true );
        }
      })
    });
  }



  
  check_new_contents(){
    if(this.new_drawing_contents_added && this.new_writing_contents_added && this.new_comic_contents_added){
      if(!this.display_new_drawing_contents && !this.display_new_comic_contents && !this.display_new_writing_contents){
        this.no_new_contents=true;
      }
      this.new_contents_added=true;
      this.cd.detectChanges()
    }
  }

  get_comics_albums(){
    if(this.list_bd_series_added && this.list_bd_oneshot_added){
      this.Albums_service.get_albums_comics(this.user_id).pipe( first() ).subscribe(info => {
        let information=info[0].albums;
        if((information).length!=0){
          this.list_bd_albums_status[0]=info[0].standard_albums[0].status;        
          this.list_bd_albums_status[1]=info[0].standard_albums[1].status;
          for (let i=0; i <(information).length;i++){
            this.list_titles_albums_bd_added.push(information[i].album_name);
            this.list_titles_albums_bd.push(information[i].album_name);
            this.list_bd_albums_status.push(information[i].status);
            let album=information[i].album_content
            let length =(information[i].album_content).length
            for (let j=0;j<length;j++){   
              if(information[i].album_content[length-1-j]){
                if(!this.check_if_comic_public(information[i].album_content[length-1-j])){
                  album.splice(length-1-j,1);
                }
              } 
            } 
            this.list_albums_bd.push(album);
            if(i==(information).length -1){
              this.list_albums_bd_added = true;
              this.get_number_of_comics_to_show()
            }
          }
        }
        else{
          this.list_albums_bd_added = true;
          this.get_number_of_comics_to_show()
        }
        if( this.opened_section == 1 && this.route.snapshot.data['category']==0) {
          this.open_category( this.route.snapshot.data['category'],true );
        }
      });
    }
  }

  get_drawings_albums(){

    if(this.list_drawings_artbook_added && this.list_drawings_onepage_added){
      this.Albums_service.get_albums_drawings(this.user_id).pipe( first() ).subscribe(info => {
        let information =info[0].albums;
        if(information.length!=0){   
          this.list_drawing_albums_status[0]=info[0].standard_albums[0].status;        
          this.list_drawing_albums_status[1]=info[0].standard_albums[1].status;
          for (let i=0; i <(information).length;i++){
              this.list_titles_albums_drawings_added.push(information[i].album_name);
              this.list_titles_albums_drawings.push(information[i].album_name);
              let album=information[i].album_content;
              this.list_drawing_albums_status.push(information[i].status);
              let length =(information[i].album_content).length
              for (let j=0;j<length;j++){   
                if(information[i].album_content[length-1-j]){
                  if(!this.check_if_drawing_public(information[i].album_content[length-1-j])){
                    album.splice(length-1-j,1);
                  }
                } 
                if(j==length-1){
                  this.list_albums_drawings.push(album);
                  if(i==(information).length-1){
                    this.list_albums_drawings_added = true;
                    this.get_number_of_drawings_to_show();
                  }
                }
                
              } 
          }
        }
        else{
          this.list_albums_drawings_added = true;
          this.get_number_of_drawings_to_show();
        }
        if( this.opened_section == 1 && this.route.snapshot.data['category']==1) {
          this.open_category( this.route.snapshot.data['category'],true);
        }
      });
    }
    
  }



  /******************************************** GROUP DATA  *******************************************/
  /******************************************** GROUP DATA  *******************************************/

  list_of_members=[];
  list_of_members_names=[];
  list_of_members_pseudos=[];
  list_of_members_data_retrieved=false;
  list_of_profile_pictures=[];
  list_of_cover_pictures=[];
  list_of_pp_loaded=[];
  list_of_covers_loaded=[];

  load_cover_list(i){
    this.list_of_covers_loaded[i]=true;
  }

  load_pp_list(i){
    this.list_of_pp_loaded[i]=true;
  }

  get_member_url(i){
    this.router.navigateByUrl('/account/' + this.list_of_members_pseudos[i]);
  }

  get_list_of_members_data(){
    let compt=0;
    for(let i=0;i<this.list_of_members.length;i++){

      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_members[i]).pipe( first() ).subscribe(r=> {
        this.list_of_members_names[i] = r[0].firstname;
        this.list_of_members_pseudos[i] = r[0].nickname;
        compt++;
        if(compt==this.list_of_members.length){
          this.list_of_members_data_retrieved=true;
          this.initialize_swiper();
        }
      });

      this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_members[i]).pipe( first() ).subscribe(t=> {
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        this.list_of_profile_pictures[i]=url;
      });

      this.Profile_Edition_Service.retrieve_cover_picture_stories( this.list_of_members[i]).pipe( first() ).subscribe(v=> {
        let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
        this.list_of_cover_pictures[i]=url;
      });
    }
  }

  swiper:any;
  @ViewChild("swiperCategories") swiperCategories: ElementRef;
  initialize_swiper() {
    this.cd.detectChanges();
    if (!this.swiper && this.swiperCategories && this.list_of_members_data_retrieved) {
      this.swiper = new Swiper(this.swiperCategories.nativeElement, {
        speed: 500,
        slidesPerView: 1,
        preloadImages: false,
        lazy: {
          loadOnTransitionStart: true,
          checkInView:true,
        },
        watchSlidesVisibility:true,
        breakpoints: {
          0: {
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: 50,
            simulateTouch: true,
            allowTouchMove: true,
          },
          600: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 20,
            simulateTouch: true,
            allowTouchMove: true,
          },
          800: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            spaceBetween: 20,
            simulateTouch: false,
            allowTouchMove: false,
          },
        },
        scrollbar: {
          el: '.swiper-scrollbar',
          hide: true,
        },
        pagination: {
          el: '.swiper-pagination',
        },
        navigation: {
          nextEl: '.swiper-button-next.stories-button',
          prevEl: '.swiper-button-prev.stories-button',
        },
        keyboard: {
          enabled: false,
        },
        observer: true,
      });
    }
    
   
    this.cd.detectChanges();
  }

  /******************************************* END ON INIT ********************************************/
  /******************************************* END ON INIT ********************************************/
  /******************************************* END ON INIT ********************************************/




  stop_event(e:any) {
    e.stopPropagation();
  }




 
  onCategoryChange(e:any) {
    if( e.value == 4 ) {
      this.see_subscribers();
    }
    else if ( e.value == 5 ) {
      this.see_subscribings();
    }
    else if ( e.value == 9 ) {
      this.router.navigateByUrl('/add-artwork');
    }
    else {
      if(e.value==this.opened_section){
        return
      }
      this.open_section(e.value,true,0);
    }
  }

  update_new_contents() {
    let width=this.width_for_news;
    if(width>0){
      let n=Math.floor(width/250);
      if(n>3){
        this.number_of_new_contents_to_show = (n<6)?n:6;
      }
      else{
        this.number_of_new_contents_to_show = 6;
      }
      this.cd.detectChanges();
    }




  }



  see_subscribers(){


    if(this.subscribed_users_list.length == 0) {
      return;
    }
    this.navbar.add_page_visited_to_history(`/PopupSubscribersComponent`,this.device_info).pipe( first() ).subscribe();
    this.dialog.open(PopupSubscribersComponent, {
      data: {
        subscribers:this.subscribed_users_list,
        type_of_profile:this.type_of_profile,
        visitor_name:this.visitor_name,
        author_gender:this.gender,
        author_id:this.user_id,
        visitor_id:this.visitor_id,
      }, 
      panelClass: 'popupViewUsersClass',
    });
  }
  see_subscribings() {
    
    if(this.users_subscribed_to_list.length == 0) {
      return;
    }
    this.navbar.add_page_visited_to_history(`/PopupSubscribingsComponent`,this.device_info).pipe( first() ).subscribe();
    this.dialog.open(PopupSubscribingsComponent, {
      data: {
        subscribings:this.users_subscribed_to_list,
        type_of_profile:this.type_of_profile,
        visitor_name:this.visitor_name,
        visitor_id:this.visitor_id,
        author_id:this.user_id,
      },
      panelClass: 'popupViewUsersClass',
    });
  }


  open_chat_link() {
    if(this.type_of_profile!='visitor') {
      this.router.navigateByUrl('/chat/'+ this.pseudo +'/'+ this.user_id);
    }
    else {
      const dialogRef = this.dialog.open(LoginComponent, {
        data: {usage:"login"},
        panelClass:"loginComponentClass"
      });
    }
  }
  get_add_artwork_link() {
    return "/add-artwork";
  }

  delete_null_elements_of_a_list(list){
  
    let len=list.length;
    for(let i=0;i<len;i++){
      if(!list[len-i-1]){
        list.splice(len-i-1,1);
      }
    }
  }

  @ViewChildren('getwidth') getwidth: QueryList<any>;
  
  @ViewChild("main_container") main_container:ElementRef;

  
  show_icon=false;
  scrollobs:any;
  ngAfterViewInit() {
    this.initialize_swiper();
    this.scrollobs = merge(
      fromEvent(window, 'scroll'),
    );
    if(!this.for_reset_password){
      this.update_background_position( this.opened_section );
      let main_width=(window.innerWidth<600)?this.main_container.nativeElement.offsetWidth*0.95:(this.main_container.nativeElement.offsetWidth<1700)?this.main_container.nativeElement.offsetWidth*0.95*0.95:1700*0.95;
      if(main_width<570){
        this.show_selector_for_album=true;
      }
      else{
        this.show_selector_for_album=false;
      }
      this.width=main_width;

      let account_bottom=this.main_container.nativeElement.offsetWidth*0.95;
      let account_d_f=(account_bottom*0.90)<1150?account_bottom*0.90:1150;
      let account_d_f_l=(window.innerWidth<1000)?(account_d_f):(window.innerWidth<1200)?(account_d_f-220):(account_d_f-300);
      let block_width=account_d_f_l- 20;
      this.width_for_news= block_width*0.95

      this.update_new_contents();
      this.profileHovered.nativeElement.addEventListener('mouseenter', e => {
        this.showEditCoverPic = false;
      });
      this.profileHovered.nativeElement.addEventListener('mouseleave', e => {
  
        this.showEditCoverPic = true;
      });
    }
    

  }


  @ViewChild("absoluteBackgroundColor", {read: ElementRef}) absoluteBackgroundColor:ElementRef;


  @ViewChildren("buttonSection", {read: ElementRef}) buttonSection:QueryList<ElementRef>;
  update_background_position(i:number) {
    if( this.absoluteBackgroundColor && this.buttonSection.toArray()[i] ) {
      this.rd.setStyle( this.absoluteBackgroundColor.nativeElement, "width", this.buttonSection.toArray()[i].nativeElement.offsetWidth +"px" );
      this.rd.setStyle( this.absoluteBackgroundColor.nativeElement, "transform", "translate("+ this.buttonSection.toArray()[i].nativeElement.offsetLeft +"px,-50%)" );
      this.cd.detectChanges()
    }
  }

  opened_subcategory=0;
  open_section(i : number,not_first,form_number) {
    if( this.opened_section == i ) {
      this.cd.detectChanges();
      this.update_background_position(i);
      return;
    }

    this.opened_section=i;
    this.opened_section_small=i;
    this.cd.detectChanges();
    this.update_background_position(i);
    if(this.opened_section==0 && this.list_of_members_data_retrieved){
      this.initialize_swiper()
    }
    if(not_first){
      if(this.opened_category<0 && this.opened_section==1){
        let interval = setInterval(() => {
          if(this.number_of_comics>=this.number_of_drawings && this.number_of_comics>=this.number_of_writings && this.number_of_comics>0){
            this.open_category(0,false)
          }
          else if(this.number_of_drawings>=this.number_of_comics && this.number_of_drawings>=this.number_of_writings && this.number_of_drawings>0){
            this.open_category(1,false)
          }
          else if(this.number_of_writings>=this.number_of_comics && this.number_of_writings>=this.number_of_drawings && this.number_of_writings>0){
            this.open_category(2,false)
          }
          clearInterval(interval)
        },500)
      }
      
      

      if( (i == 0) ) { 
        this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}`,this.device_info).pipe( first() ).subscribe();
        this.location.go(`/account/${this.pseudo}`); 
      }
      else if( i == 1 ) { 
        this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}/artworks`,this.device_info).pipe( first() ).subscribe();
        this.location.go(`/account/${this.pseudo}/artworks`); 
      }
      else if( i == 2 ) { 
        this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}/ads`,this.device_info).pipe( first() ).subscribe();
        this.location.go(`/account/${this.pseudo}/ads`); 
      }
      else if( i == 3 ) {
        this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/projects`,this.device_info).pipe( first() ).subscribe(); 
        this.location.go(`/account/${this.pseudo}/projects`); 
      }
      else if( i == 6 ) { 
        this.opened_subcategory=form_number
        this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}/about/${form_number}`,this.device_info).pipe( first() ).subscribe();
        this.location.go(`/account/${this.pseudo}/about/${form_number}`); 
      }
      else if( i == 7 ) { 
        this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}/archives`,this.device_info).pipe( first() ).subscribe();
        this.location.go(`/account/${this.pseudo}/archives`); 
      }
      else if( i == 8 ) {
        this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}/my_account`,this.device_info).pipe( first() ).subscribe(); 
        this.location.go(`/account/${this.pseudo}/my_account`); 
      }
    }
    
   
  }


  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop + 600;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

  scrollDown() {
    window.scrollBy({
      top: 300,
      behavior : "smooth"
    })
  }

  //For section 0 : Artworks
  put_category_visible:boolean[]=[];
  category_to_load:boolean[]=[];
  add_album_to_load=[];
  open_category(i : number,first_time) {
    if( !first_time && this.opened_category == i || (i==0 && this.number_of_comics==0) || (i==1 && this.number_of_drawings==0) || (i==2 && this.number_of_writings==0) ) {
      return;
    }
   
    if(this.opened_section==1){

      if((this.mode_visiteur && this.number_of_comics==0 && i==0) || (!this.mode_visiteur && this.number_of_comics==0 && i==0)){
        this.opened_category=i;
        return;
      }
      if((this.mode_visiteur && this.number_of_drawings==0 && i==1) || (!this.mode_visiteur && this.number_of_drawings==0 && i==1)){
        this.opened_category=i;
        return;
      }
      if((this.mode_visiteur && this.number_of_writings==0 && i==2) || (!this.mode_visiteur && this.number_of_writings==0 && i==2)){
        this.opened_category=i;
        return;
      }
    }

    
    

    this.category_to_load[i]=true;
    this.add_album_to_load[0]=true;
    this.opened_category=i;
    if( this.opened_category==0 && this.opened_section==1) { 
      this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}/artworks/comics`,this.device_info).pipe( first() ).subscribe();
      this.location.go(`/account/${this.pseudo}/artworks/comics`); 
    }
    else if(this.opened_category==1 && this.opened_section==1 ) { 
      this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}/artworks/drawings`,this.device_info).pipe( first() ).subscribe();
      this.location.go(`/account/${this.pseudo}/artworks/drawings`); 
    }
    else if( this.opened_category==2 && this.opened_section==1 ) { 
      this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.user_id}/artworks/writings`,this.device_info).pipe( first() ).subscribe();
      this.location.go(`/account/${this.pseudo}/artworks/writings`); 
    }
    this.add_album=-1;
    this.opened_album=-1;
    this.open_album( 0,true);
    
  }

  put_album_visible=[false]
  albums_to_show_comics=[false];
  albums_to_show_drawings=[false];
  albums_to_show_writings=[false];
  albums_with_masonry_loaded=[];
  open_album(i : number,from_category) {
    if( this.opened_album == i || this.add_album != -1 ) {
      if(this.add_album!=-1){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:true, text:'Voulez-vous quitter ce le mode création ?'},
          panelClass: "popupConfirmationClass",
        });
        dialogRef.afterClosed().pipe( first() ).subscribe(result => {
          if(result){
            this.start_add_album(this.add_album)
          }
        })
      }
      return;
    }

    
    if(!from_category && this.opened_category==1){
      this.list_visibility_albums_drawings=false;
      if($('.grid').masonry){
        $('.grid').masonry().masonry('destroy')
      };

      
    }
    
    
    this.compteur_visibility_drawings=0;
    this.compteur_drawings_thumbnails=0; 
    
    
    this.opened_album=i;
    this.opened_album_selector=i;

    this.reset_number_of_comics_to_show();
    this.reset_number_of_writings_to_show();
    this.reset_number_of_drawings_to_show();
    this.cd.detectChanges();
   
   
  }


  opened_album_selector=-1;
  albumChange(event){
    if(this.opened_album_selector==this.opened_album){
      return
    }
    this.open_album(this.opened_album_selector,false)
  }

  current_opened_album=-1;
  start_add_album(i : number) {
    if(this.opened_category==0 && this.list_titles_albums_bd_added.length==10){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous ne pouvez pas créer plus de 10 sections'},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    else if(this.opened_category==1 && this.list_titles_albums_drawings_added.length==10){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous ne pouvez pas créer plus de 10 sections'},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    else if(this.opened_category==2 && this.list_titles_albums_writings_added.length==10){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous ne pouvez pas créer plus de 10 sections'},
        panelClass: "popupConfirmationClass",
      });
      return;
    }

    if( this.add_album != -1 ) {
      this.add_album = -1;
      this.cd.detectChanges();
      if(this.opened_category==1){
        this.list_visibility_albums_drawings=false;
      }
      this.open_album( this.current_opened_album,true );
      return;
    }
    
    this.current_opened_album=this.opened_album;
    this.opened_album=-1;
    this.add_album_to_load[i]=true;
    this.add_album = i;
  }

  reload_masonry(){
     var $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      gutter:10,
      initLayout:false,
      fitWidth: true,
    });
    
  }
  compteur_visibility_drawings=0
  ini_masonry() {
    let THIS=this;
   
    var $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      gutter:10,
      initLayout:false,
      fitWidth: true,
    });
    $grid.on( 'layoutComplete', function() {
      $grid.masonry('reloadItems');
      THIS.compteur_visibility_drawings+=1;
      let total=0;
      if(THIS.opened_album==0){
        total+=THIS.list_titles_albums_drawings.length-1;
        if(!(THIS.list_drawings_artbook.length>0)){
          total-=1;
        }
        if(!(THIS.list_drawings_onepage.length>0)){
          total-=1;
        }
      }
      if(THIS.opened_album!=0){
        total+=1;
      }
      if(THIS.compteur_visibility_drawings==total){
        THIS.list_visibility_albums_drawings=true;
      }
      
      THIS.prevent_see_more=false;
      THIS.cd.detectChanges();
      
      
    });

    $grid.masonry();

  }



  
 
  


  add_story(){
    this.navbar.add_page_visited_to_history(`/PopupAddStoryComponent`,this.device_info).pipe( first() ).subscribe();
    const dialogRef = this.dialog.open(PopupAddStoryComponent, {
      data: {user_id:this.user_id},
      panelClass: 'popupAddStoryClass',
    });
  }


  change_cover_picture() {
    this.navbar.add_page_visited_to_history(`/PopupFormComponent/edit_cover_picture`,this.device_info).pipe( first() ).subscribe();
    const dialogRef = this.dialog.open(PopupFormComponent, {
      data: {type:"edit_cover_picture"},
      panelClass: 'popupUploadPictureClass',
    });
  }

  change_profile_picture() {
    this.navbar.add_page_visited_to_history(`/PopupFormComponent/edit_profile_picture`,this.device_info).pipe( first() ).subscribe();
    const dialogRef = this.dialog.open(PopupFormComponent, {
      data: {type:"edit_profile_picture"},
      panelClass: 'popupUploadPictureClass',
    });
  }
  
  loading_subscribtion=false;
  subscribtion(){
    
    if(this.type_of_profile=='account' ){
      if(this.loading_subscribtion){
        return
      }
      this.loading_subscribtion=true;
      if(!this.already_subscribed){
        this.already_subscribed=true;
        this.Subscribing_service.subscribe_to_a_user(this.user_id).pipe( first() ).subscribe(information=>{
          if(information[0].subscribtion){
            this.loading_subscribtion=false;
            this.cd.detectChanges();
          }
          else{
            this.NotificationsService.add_notification('subscribtion',this.visitor_id,this.visitor_name,this.user_id,this.user_id.toString(),'none','none',this.visitor_id,0,"add",false,0).pipe( first() ).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"subscribtion",
                id_user_name:this.visitor_name,
                id_user:this.visitor_id, 
                id_receiver:this.user_id,
                publication_category:this.user_id.toString(),
                publication_name:'none',
                format:'none',
                publication_id:this.visitor_id,
                chapter_number:0,
                information:"add",
                status:"unchecked",
                is_comment_answer:false,
                comment_id:0,
              }
              this.loading_subscribtion=false;
              this.chatService.messages.next(message_to_send);
              this.cd.detectChanges();
            })
          }
         
        });
      }
      else{
        this.already_subscribed=false;
        this.Subscribing_service.remove_subscribtion(this.user_id).pipe( first() ).subscribe(information=>{
          this.NotificationsService.remove_notification('subscribtion',this.user_id.toString(),'none',this.visitor_id,0,false,0).pipe( first() ).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"subscribtion",
              id_user_name:this.visitor_name,
              id_user:this.visitor_id, 
              id_receiver:this.user_id,
              publication_category:this.user_id.toString(),
              publication_name:'none',
              format:'none',
              publication_id:this.visitor_id,
              chapter_number:0,
              information:"remove",
              status:"unchecked",
              is_comment_answer:false,
              comment_id:0,
            }
            
            this.loading_subscribtion=false;
            this.chatService.messages.next(message_to_send);
            this.cd.detectChanges();
          })
        });
      }
    }
    else{
      const dialogRef = this.dialog.open(LoginComponent, {
        data: {usage:"login"},
        panelClass:"loginComponentClass"
      });
    }
  }

  /************************************************ */
  /************************************************ */
  /**************ALBUMS FUNCTIONS****************** */
  /************************************************ */
  /************************************************ */

  
    
  remove_drawing_album(i){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, 
        text:"Etes-vous sûr de vouloir supprimer cette section ? "},
        panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().pipe( first() ).subscribe(result => {
      if(result){
        this.Albums_service.remove_drawing_album(this.list_titles_albums_drawings[i],this.list_drawing_albums_status[i-1]).pipe( first() ).subscribe(r=>{
          location.reload();
        })
      }
    })
    
  }



  remove_bd_album(i){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, 
        text:"Etes-vous sûr de vouloir supprimer cette section ? "},
        panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().pipe( first() ).subscribe(result => {
      if(result){
        this.Albums_service.remove_comic_album(this.list_titles_albums_bd[i],this.list_bd_albums_status[i-1]).pipe( first() ).subscribe(r=>{
          location.reload();
        })
      }
    })
    
  }

  remove_writing_album(i){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, 
        text:"Etes-vous sûr de vouloir supprimer cette section ? "},
        panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().pipe( first() ).subscribe(result => {
      if(result){
        this.Albums_service.remove_writing_album(this.list_titles_albums_writings[i],this.list_writings_albums_status[i-1]).pipe( first() ).subscribe(r=>{
          location.reload();
        })
      }
    })
    
  }


  pp_loaded(){
    this.pp_is_loaded=true;
  }

  cover_loaded(){
    this.cover_is_loaded=true;
  }



  /************************************* display thumbnails managment *********************/
  /************************************* display thumbnails managment *********************/
  /************************************* display thumbnails managment *********************/
  /************************************* display thumbnails managment *********************/
  /************************************* display thumbnails managment *********************/
  compteur_drawings_thumbnails=0;
  display_writings_thumbnails=false;
  display_comics_thumbnails=false;

  number_of_comics_to_show_by_album=[];
  compteur_number_of_comics=0;
  number_of_comics_variable:number;
  got_number_of_comics_to_show=false;
  number_of_lines_comics:number;
  get_number_of_comics_to_show(){
    let width=(window.innerWidth<600)?this.main_container.nativeElement.offsetWidth*0.95:(this.main_container.nativeElement.offsetWidth<1700)?this.main_container.nativeElement.offsetWidth*0.95*0.95:1700*0.95;
    if(this.list_albums_bd_added && !this.got_number_of_comics_to_show ){
      let n=Math.floor(width/250);
      if(n>3){
        this.number_of_comics_variable = (n<6)?n:6;
      }
      else{
        this.number_of_comics_variable = 6;
      }

      if(this.list_titles_albums_bd_added.length>3){
        this.number_of_lines_comics=1;
      }
      else{
        this.number_of_lines_comics=2;
      };
      this.got_number_of_comics_to_show=true;
      this.compteur_number_of_comics= this.number_of_comics_variable*this.number_of_lines_comics;
      this.number_of_comics_to_show_by_album[0]=this.compteur_number_of_comics;
      this.number_of_comics_to_show_by_album[1]=this.compteur_number_of_comics;
      if(this.list_titles_albums_bd_added.length>0){
        for(let i=0;i<this.list_titles_albums_bd_added.length;i++){
          this.number_of_comics_to_show_by_album[i+2]=this.compteur_number_of_comics;
        }
      }
      this.display_comics_thumbnails=true;
      this.cd.detectChanges();
    }
  }

  update_number_of_comics_to_show(){
    if(this.got_number_of_comics_to_show){
      let width=(window.innerWidth<600)?this.main_container.nativeElement.offsetWidth*0.95:(this.main_container.nativeElement.offsetWidth<1700)?this.main_container.nativeElement.offsetWidth*0.95*0.95:1700*0.95;
      let variable;
      let n=Math.floor(width/250);
      if(n>3){
        variable = (n<6)?n:6;
      }
      else{
        variable= 6;
      }
      if(variable!=this.number_of_comics_variable && variable>0 ){
        for(let i=0;i<this.list_titles_albums_bd.length-1;i++){
          this.number_of_comics_to_show_by_album[i]/=this.number_of_comics_variable;
          this.number_of_comics_to_show_by_album[i]*=variable;
         
          if(i==this.list_titles_albums_bd.length-2){
            this.number_of_comics_variable=variable;
            this.cd.detectChanges();
          }
        }
      }
    }
    else{
      this.get_number_of_comics_to_show()
    }
    
  }

  reset_number_of_comics_to_show(){
    if(this.got_number_of_comics_to_show){
      if(this.opened_album>0){
        this.compteur_number_of_comics= this.number_of_comics_variable*4;
      }
      else{
        this.compteur_number_of_comics=this.number_of_comics_variable;
     
      }
      this.number_of_comics_to_show_by_album[0]=this.compteur_number_of_comics*this.number_of_lines_comics;
      this.number_of_comics_to_show_by_album[1]=this.compteur_number_of_comics*this.number_of_lines_comics;
      for(let i=0;i<this.list_titles_albums_bd_added.length;i++){
        this.number_of_comics_to_show_by_album[i+2]=this.compteur_number_of_comics*this.number_of_lines_comics;
      }
    }
    else{
      this.get_number_of_comics_to_show()
    }
    this.cd.detectChanges();
  }

 


/**********************************************DISplay drawings thumbnails******************** */
/**********************************************DISplay drawings thumbnails******************** */
/**********************************************DISplay drawings thumbnails******************** */
/**********************************************DISplay drawings thumbnails******************** */
/**********************************************DISplay drawings thumbnails******************** */
/**********************************************DISplay drawings thumbnails******************** */
/**********************************************DISplay drawings thumbnails******************** */
/**********************************************DISplay drawings thumbnails******************** */
/**********************************************DISplay drawings thumbnails******************** */

  number_of_drawings_to_show_by_album=[];
  compteur_number_of_drawings=0;
  number_of_drawings_variable:number;
  got_number_of_drawings_to_show=false;
  number_of_lines_drawings:number;
  detect_new_compteur_drawings=false;
  total_for_new_compteur=0;
  updating_drawings_for_zoom=false;
  prevent_see_more=false;
  get_number_of_drawings_to_show(){
    let width=(window.innerWidth<600)?this.main_container.nativeElement.offsetWidth*0.95:(this.main_container.nativeElement.offsetWidth<1700)?this.main_container.nativeElement.offsetWidth*0.95*0.95:1700*0.95;
    if(this.list_albums_drawings_added && !this.got_number_of_drawings_to_show){
      let n=Math.floor(width/210);
      if(n>3){
        this.number_of_drawings_variable = (n<6)?n:6;
      }
      else{
        this.number_of_drawings_variable = 6;
      }

      if(this.list_titles_albums_drawings_added.length>3){
        this.number_of_lines_drawings=1;
      }
      else{
        this.number_of_lines_drawings=1;
      };
      this.got_number_of_drawings_to_show=true;
      this.compteur_number_of_drawings= this.number_of_drawings_variable*this.number_of_lines_drawings;
      this.number_of_drawings_to_show_by_album[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_album[1]=this.compteur_number_of_drawings;
      if(this.list_titles_albums_drawings_added.length>0){
        for(let i=0;i<this.list_titles_albums_drawings_added.length;i++){
          this.number_of_drawings_to_show_by_album[i+2]=this.compteur_number_of_drawings;
        }
      };
    }
  }

  
  update_number_of_drawings_to_show(){
    if(this.got_number_of_drawings_to_show){
      let width=(window.innerWidth<600)?this.main_container.nativeElement.offsetWidth*0.95:(this.main_container.nativeElement.offsetWidth<1700)?this.main_container.nativeElement.offsetWidth*0.95*0.95:1700*0.95;
      let variable;
        let n=Math.floor(width/210);
        if(n>3){
          variable = (n<6)?n:6;
        }
        else{
          variable = 6;
        };
        if(variable!=this.number_of_drawings_variable && variable>0){
          this.prevent_see_more=true;
          this.detect_new_compteur_drawings=false;
          let total=0;
          let change=false;
          for(let i=0;i<this.list_titles_albums_drawings.length-1;i++){
            let old_value=this.number_of_drawings_to_show_by_album[i];
            this.number_of_drawings_to_show_by_album[i]/=this.number_of_drawings_variable;
            this.number_of_drawings_to_show_by_album[i]*=variable;
            if(this.number_of_drawings_to_show_by_album[i]>old_value){
              this.updating_drawings_for_zoom=false;
              this.compteur_drawings_thumbnails=0;
              this.total_for_new_compteur=0;
              change=true;
              if(i==0 ){
                if(this.number_of_drawings_to_show_by_album[i]>this.list_drawings_onepage.length){
                  total+=this.list_drawings_onepage.length-old_value;
                }
                else{
                  let res=this.number_of_drawings_to_show_by_album[i]-old_value;
                  total+=this.number_of_drawings_to_show_by_album[i]-old_value;
                }
              }
              else if(i==1){
                if(this.number_of_drawings_to_show_by_album[i]>this.list_drawings_artbook.length){
                  total+=this.list_drawings_artbook.length-old_value;
                }
                else{
                  let res=this.number_of_drawings_to_show_by_album[i]-old_value;
                  total+=this.number_of_drawings_to_show_by_album[i]-old_value;
                }
              }
              else{
                if(this.number_of_drawings_to_show_by_album[i]>this.list_albums_drawings[i-2].length){
                  total+=this.list_albums_drawings[i-2].length-old_value;
                }
                else{
                  let res=this.number_of_drawings_to_show_by_album[i]-old_value;
                  total+=this.number_of_drawings_to_show_by_album[i]-old_value;
                }
              }
            }
            else if(i==0){
              this.updating_drawings_for_zoom=true;
            }
            
           
            if(i==this.list_titles_albums_drawings.length-2){
              if(change){
                this.total_for_new_compteur=total;
              }
              if(this.updating_drawings_for_zoom){
                this.prevent_see_more=false;
              }
              this.number_of_drawings_variable=variable;
              this.detect_new_compteur_drawings=true;
              this.cd.detectChanges();
            }
          }
        }
    }
    else{
      this.get_number_of_drawings_to_show()
    }
    
   
  }

  reset_number_of_drawings_to_show(){
    this.detect_new_compteur_drawings=false;
    this.total_for_new_compteur=0;
    this.updating_drawings_for_zoom=false;
    if(this.got_number_of_drawings_to_show){
      if(this.opened_album>0){
        this.compteur_number_of_drawings= this.number_of_drawings_variable*4;
      }
      else{
        this.compteur_number_of_drawings=this.number_of_drawings_variable;
       
      }
      this.number_of_drawings_to_show_by_album[0]=this.compteur_number_of_drawings*this.number_of_lines_drawings;
      this.number_of_drawings_to_show_by_album[1]=this.compteur_number_of_drawings*this.number_of_lines_drawings;
      for(let i=0;i<this.list_titles_albums_drawings_added.length;i++){
        this.number_of_drawings_to_show_by_album[i+2]=this.compteur_number_of_drawings*this.number_of_lines_drawings;
      }
    }
    else{
      this.get_number_of_drawings_to_show()
    }
    this.cd.detectChanges();
  }

  
  sendLoaded(event){
    if(!this.updating_drawings_for_zoom){
      this.compteur_drawings_thumbnails++;
      if(this.detect_new_compteur_drawings){
        $('.grid').masonry('reloadItems');
        this.cd.detectChanges;
        this.reload_masonry();
        this.cd.detectChanges();
        if(this.compteur_drawings_thumbnails==this.total_for_new_compteur){
          this.detect_new_compteur_drawings=false;
          this.total_for_new_compteur=0;
          this.compteur_drawings_thumbnails=0;
          this.reload_masonry();
          this.prevent_shiny=false;
          this.cd.detectChanges();
        }
      }
      else{
        
        if(this.opened_album==0){
          let total = this.list_drawings_onepage.slice(0,this.number_of_drawings_to_show_by_album[0]).length 
          + this.list_drawings_artbook.slice(0,this.number_of_drawings_to_show_by_album[1]).length
          for(let i=0;i<this.list_albums_drawings.length;i++){
            total+=this.list_albums_drawings[i].slice(0,this.number_of_drawings_to_show_by_album[i+2]).length;
          }
          if(this.compteur_drawings_thumbnails==total){
            this.compteur_drawings_thumbnails=0;
            this.ini_masonry();
          }
        }
        if(this.opened_album==1){
          let total=this.list_drawings_onepage.slice(0,this.number_of_drawings_to_show_by_album[0]).length
          if(this.compteur_drawings_thumbnails==total){
            this.compteur_drawings_thumbnails=0;
            this.ini_masonry();
          }
        }
        if(this.opened_album==2){
          let total=this.list_drawings_artbook.slice(0,this.number_of_drawings_to_show_by_album[1]).length
          if(this.compteur_drawings_thumbnails==total){
            this.compteur_drawings_thumbnails=0;
            this.ini_masonry();
          }
        }
        if(this.opened_album>2){
          let total=this.list_albums_drawings[this.opened_album-3].slice(0,this.number_of_drawings_to_show_by_album[this.opened_album-1]).length;
          if(this.compteur_drawings_thumbnails==total){
            this.compteur_drawings_thumbnails=0;
            this.ini_masonry();
          }
        }
        
      }
    
    }
    
    
    
  }
/**********************************************DISplay writings thumbnails******************** */
/**********************************************DISplay writings thumbnails******************** */
/**********************************************DISplay writings thumbnails******************** */
/**********************************************DISplay writings thumbnails******************** */

  number_of_writings_to_show_by_album=[];
  compteur_number_of_writings=0;
  number_of_writings_variable:number;
  got_number_of_writings_to_show=false;
  number_of_lines_writings:number;
  get_number_of_writings_to_show(){
    let width=(window.innerWidth<600)?this.main_container.nativeElement.offsetWidth*0.95:(this.main_container.nativeElement.offsetWidth<1700)?this.main_container.nativeElement.offsetWidth*0.95*0.95:1700*0.95;
    if(this.list_albums_writings_added && !this.got_number_of_writings_to_show){
      let n=Math.floor(width/250);
      if(n>3){
        this.number_of_writings_variable = (n<6)?n:6;
      }
      else{
        this.number_of_writings_variable = 6;
      }

      if(this.list_titles_albums_writings_added.length>3){
        this.number_of_lines_writings=1;
      }
      else{
        this.number_of_lines_writings=2;
      }
      this.got_number_of_writings_to_show=true;
      this.compteur_number_of_writings= this.number_of_writings_variable*this.number_of_lines_writings;
      this.number_of_writings_to_show_by_album[0]=this.compteur_number_of_writings;
      if(this.list_titles_albums_writings_added.length>0){
        for(let i=0;i<this.list_titles_albums_writings_added.length;i++){
          this.number_of_writings_to_show_by_album[i+1]=this.compteur_number_of_writings;
        }
      }
      this.display_writings_thumbnails=true;
      this.cd.detectChanges();
    }
  }

  update_number_of_writings_to_show(){
    if(this.got_number_of_writings_to_show){
      let width=(window.innerWidth<600)?this.main_container.nativeElement.offsetWidth*0.95:(this.main_container.nativeElement.offsetWidth<1700)?this.main_container.nativeElement.offsetWidth*0.95*0.95:1700*0.95;
      let variable;
      let n=Math.floor(width/250);
      if(n>3){
        variable= (n<6)?n:6;
      }
      else{
        variable = 6;
      }
      if(variable!=this.number_of_writings_variable && variable>0){
        for(let i=0;i<this.list_titles_albums_writings.length;i++){
          this.number_of_writings_to_show_by_album[i]/=this.number_of_writings_variable;
          this.number_of_writings_to_show_by_album[i]*=variable;
        }
        this.number_of_writings_variable=variable;
        this.cd.detectChanges();
      }
    }
      
    
  }

  reset_number_of_writings_to_show(){
    if(this.got_number_of_writings_to_show){
      if(this.opened_album>0){
        this.compteur_number_of_writings= this.number_of_writings_variable*4;
      }
      else{
        this.compteur_number_of_writings=this.number_of_writings_variable;
      }

      this.number_of_writings_to_show_by_album[0]=this.compteur_number_of_writings*this.number_of_lines_writings;
      for(let i=0;i<this.list_titles_albums_writings_added.length;i++){
        this.number_of_writings_to_show_by_album[i+1]=this.compteur_number_of_writings*this.number_of_lines_writings;
      }
    }
    else{
      this.get_number_of_writings_to_show();
    }
    this.cd.detectChanges();
  }




 

  /*************************************check if content public *****************************/
  /*************************************check if content public *****************************/
  /*************************************check if content public *****************************/
  /*************************************check if content public *****************************/

  check_if_artbook_public(item){
    for(let i=0;i<this.list_drawings_artbook.length;i++){
      if(this.list_drawings_artbook[i].drawing_id==item.drawing_id){
        item.title=this.list_drawings_artbook[i].title;
        return true;
      }
      else if(i==this.list_drawings_artbook.length-1){
        return false;
      }
    }
  }

  check_if_onepage_public(item){
    for(let i=0;i<this.list_drawings_onepage.length;i++){
      if(this.list_drawings_onepage[i].drawing_id==item.drawing_id){
        item.title=this.list_drawings_onepage[i].title;
        return true;
      }
      else if(i==this.list_drawings_onepage.length-1){
        return false;
      }
    }
  }

  check_if_drawing_public(item){
    
    if(item.pagesnumber >=0){
      return this.check_if_artbook_public(item)
    }
    else{
      return this.check_if_onepage_public(item)
    }
  }



  check_if_oneshot_public(item){
    for(let i=0;i<this.list_bd_oneshot.length;i++){
      if(this.list_bd_oneshot[i].bd_id==item.bd_id){
        item.title=this.list_bd_oneshot[i].title;
        return true;
      }
      else if(i==this.list_bd_oneshot.length-1){
        return false;
      }
    }
  }

  check_if_serie_public(item){
    for(let i=0;i<this.list_bd_series.length;i++){
      if(this.list_bd_series[i].bd_id==item.bd_id){
        item.title=this.list_bd_series[i].title;
        return true;
      }
      else if(i==this.list_bd_series.length-1){
        return false;
      }
    }
  }

  check_if_comic_public(item){
    
    if(item.chaptersnumber >=0){
      return this.check_if_serie_public(item)
    }
    else{
      return this.check_if_oneshot_public(item)
    }
  }

  check_if_writing_public(item){
    let writing_id=item.writing_id;
    for(let i=0;i<this.list_writings.length;i++){
      if(this.list_writings[i].writing_id==writing_id){
        item.title=this.list_writings[i].title;
        return true;
      }
      else if(i==this.list_writings.length-1){
        return false;
      }
    }
  }



  /*************************************see more *****************************/
 /*************************************see more *****************************/
  /*************************************see more *****************************/
   /*************************************see more *****************************/
    /*************************************see more *****************************/
     /*************************************see more *****************************/
  see_more_comics(album_number,album_section_number){
    if(album_number==0 && this.number_of_comics_to_show_by_album[album_number]>=this.list_bd_oneshot.length){
      return
    }
    if(album_number==1 && this.number_of_comics_to_show_by_album[album_number]>=this.list_bd_series.length){
      return
    }
    if(album_number>1 && this.number_of_comics_to_show_by_album[album_number]>=this.list_albums_bd[album_number-2].length){
       return
    } 
    else{
      this.new_contents_loading=true;
      if(album_section_number==0){
        this.number_of_comics_to_show_by_album[album_number]+=this.number_of_comics_variable*2;
      }
      else{
        this.number_of_comics_to_show_by_album[album_number]+=this.number_of_comics_variable*4;
      }
      this.new_contents_loading=false;
      this.cd.detectChanges();
    }
    
  }

  /***********************************************see more ddrawings*************************** */
  /***********************************************see more ddrawings*************************** */
  /***********************************************see more ddrawings*************************** */

  prevent_shiny=false;
  see_more_drawings(album_number,album_section_number){
  
    this.updating_drawings_for_zoom=false;
    
    if(this.prevent_see_more){
      return;
    }
    if(album_number==0 && this.number_of_drawings_to_show_by_album[album_number]>=this.list_drawings_onepage.length){
      return
    }
    if(album_number==1 && this.number_of_drawings_to_show_by_album[album_number]>=this.list_drawings_artbook.length){
      return
    }
    if(album_number>1 && this.number_of_drawings_to_show_by_album[album_number]>=this.list_albums_drawings[album_number-2].length){
       return
    } 
    else{
      this.prevent_shiny=true;
      this.cd.detectChanges();
      this.new_contents_loading=true;
      let num=this.number_of_drawings_to_show_by_album[album_number];
      this.number_of_drawings_to_show_by_album[album_number]+=this.number_of_drawings_variable*2;
      this.detect_new_compteur_drawings=true;
      if(album_number==0){
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_drawings_onepage.length){
          this.total_for_new_compteur=this.list_drawings_onepage.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
        
      }
      else if(album_number==1){
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_drawings_artbook.length){
          this.total_for_new_compteur=this.list_drawings_artbook.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
      }
      else{
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_albums_drawings[album_number-2].length){
          this.total_for_new_compteur=this.list_albums_drawings[album_number-2].length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
      }
      this.prevent_see_more=true;
      this.new_contents_loading=false;
      this.cd.detectChanges();
    }
    
  }

/***********************************************see more writings*************************** */
/***********************************************see more writings*************************** */
/***********************************************see more writings*************************** */

see_more_writings(album_number,album_section_number){
  if(album_number==0 && this.number_of_writings_to_show_by_album[album_number]>=this.list_writings.length){
    return
  }
  if(album_number>0 && this.number_of_writings_to_show_by_album[album_number]>=this.list_albums_writings[album_number-1].length){
     return
  } 
  else{
    this.new_contents_loading=true;
    let num=this.number_of_writings_to_show_by_album[album_number]
    if(album_section_number==0){
      this.number_of_writings_to_show_by_album[album_number]+=this.number_of_writings_variable*2;
    }
    else{
      this.number_of_writings_to_show_by_album[album_number]+=this.number_of_writings_variable*4;
    }
    this.cd.detectChanges();
  }
  
}


block_user(){
  if(this.user_id>3){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, 
        text:"Etes-vous sûr de vouloir bloquer cet utilisateur ? "},
        panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().pipe( first() ).subscribe(result => {
      if(result){
          this.Subscribing_service.remove_all_subscribtions_both_sides(this.user_id).pipe( first() ).subscribe(s=>{
            this.chatService.remove_friend(this.user_id).pipe( first() ).subscribe(m=>{
              this.Profile_Edition_Service.block_user(this.user_id,(m[0].date)?(m[0].date):null).pipe( first() ).subscribe(r=>{
                let message_to_send ={
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id,   
                  id_receiver:this.user_id, 
                  message:"block",
                  is_from_server:true,
                  status:'block',
                  id_chat_section:1,
                  attachment_name:"none",
                  is_an_attachment:false,
                  attachment_type:"none",
                  is_a_group_chat:false,
                  is_a_response:false,
                }
                this.chatService.messages.next(message_to_send);
                this.user_blocked=true;
                this.user_who_blocked="me";
                this.cd.detectChanges();
                this.update_background_position( this.opened_section );;
              })
            })
          });

        
      }
    })
  }
  else{
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, 
        text:"Vous ne pouvez pas bloquer cet utilisateur"},
        panelClass: "popupConfirmationClass",
    });
  }
 
}

unblock_user(){
  this.Profile_Edition_Service.unblock_user(this.user_id).pipe( first() ).subscribe(r=>{
    if(r[0].date){
      this.chatService.add_chat_friend(this.user_id,r[0].date).pipe( first() ).subscribe(r=>{
        location.reload()
      })
    }
    else{
      location.reload()
    }


    this.cd.detectChanges();
    //this.update_background_position( this.opened_section );;
    
    
  })
}

report_loading=false;
report(){

  if(this.report_loading){
    return
  }

  this.report_loading=true;
  this.Reports_service.check_if_content_reported('account',this.user_id,"unknown",0).pipe( first() ).subscribe(r=>{
    if(r[0].nothing){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois le même compte'},
        panelClass: "popupConfirmationClass",
      });
    }
    else{
      const dialogRef = this.dialog.open(PopupReportComponent, {
        data: {from_account:true,id_receiver:this.user_id,publication_category:'account',publication_id:this.user_id,format:"unknown",chapter_number:0},
        panelClass:"popupReportClass"
      });
    }
    this.report_loading=false;
  })
  
}




  categories_array = Array(3);
  skeleton_array = Array(6);
  number_of_skeletons_per_line = 1;
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }


  list_of_stories=[]
  story_state=false;
  watch_story(){
    if(this.story_found){
      this.navbar.add_page_visited_to_history(`/PopupStoriesComponent/watch_stories`,this.device_info).pipe( first() ).subscribe();
      const dialogRef = this.dialog.open(PopupStoriesComponent, {
        data: { for_account:true, list_of_users: [this.user_id], index_id_of_user: 0, list_of_data:this.list_of_stories,current_user:this.visitor_id,current_user_name:this.visitor_name},
        panelClass: 'popupStoriesClass'
      });
      dialogRef.afterClosed().pipe( first() ).subscribe(result => {
        let list_to_end = result.list_of_users_to_end;
        if(list_to_end.length>0){
            this.story_state=false;
        }
        if(result.event=="end-swiper"){
          this.story_state=false;
        }
      })
    }
  }

  opened_category_ad=0;
  open_category_ad(i){
    if(this.opened_category_ad==i){
      return
    }
    this.opened_category_ad=i;
  }

  

  click_absolute_arrow1(e:any,s:string) {

    var n = Math.floor( ($('.container-comics.container-small-screen-news.new-comics').scrollLeft()+1) / (this.width_for_news / Math.floor(this.width_for_news/250)) );
    if(s=='right') {
      $('.container-comics.container-small-screen-news.new-comics').animate({
        scrollLeft: (n+1) * this.width_for_news / Math.floor(this.width_for_news/250)
      }, 300, 'swing');
    }
    else if(s=='left') {
      $('.container-comics.container-small-screen-news.new-comics').animate({
        scrollLeft: (n-1) * this.width_for_news / Math.floor(this.width_for_news/250)
      }, 300, 'swing');
    }

  }

  click_absolute_arrow2(e:any,s:string) {

    var n = Math.floor( ($('.container-account.container-drawings.newDrawings.container-small-screen-news').scrollLeft()+1) / (this.width_for_news / Math.floor(this.width_for_news/250)) );
    if(s=='right') {
      $('.container-account.container-drawings.newDrawings.container-small-screen-news').animate({
        scrollLeft: (n+1) * this.width_for_news / Math.floor(this.width_for_news/250)
      }, 300, 'swing');
    }
    else if(s=='left') {
      $('.container-account.container-drawings.newDrawings.container-small-screen-news').animate({
        scrollLeft: (n-1) * this.width_for_news / Math.floor(this.width_for_news/250)
      }, 300, 'swing');
    }
  }

  click_absolute_arrow3(e:any,s:string) {
    var n = Math.floor( ($('.container-account.container-writings.newWritings.container-small-screen-news').scrollLeft()+1) / (this.width_for_news / Math.floor(this.width_for_news/250)) );

    if(s=='right') {
      $('.container-account.container-writings.newWritings.container-small-screen-news').animate({
        scrollLeft: (n+1) * this.width_for_news / Math.floor(this.width_for_news/250)
      }, 300, 'swing');
    }
    else if(s=='left') {
      $('.container-account.container-writings.newWritings.container-small-screen-news').animate({
        scrollLeft: (n-1) * this.width_for_news / Math.floor(this.width_for_news/250)
      }, 300, 'swing');
    }
  }

  open_from_news(i){
    this.open_section(1,false,0);
    this.open_category(i,false)
  }

  ngOnDestroy(): void {

    this.title.setTitle('LinkArts – Collaboration éditoriale');
    this.meta.updateTag({ name: 'description', content: "Une galerie pour exposer vos œuvres et promouvoir votre talent." });
  }


  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }


  


 
  list_of_news=[];
  list_of_news_date=[];
  add_news_input=false;
  add_news() {
    this.add_news_input = true;
  }
  cancel_add_news() {
    this.add_news_input = false;
    this.newsForm.reset();
  }
  newsForm: FormGroup = this.formBuilder.group({
    news: ['', 
      Validators.compose([
        Validators.required,
        Validators.pattern(pattern("text_title")),
        Validators.maxLength(200),
      ]),
    ],
  });

  adding_news=false;
  send_news() {
    if( this.newsForm.valid ) {
      if(this.adding_news){
        return false
      }
      this.adding_news=true;

      this.Profile_Edition_Service.add_user_news(this.newsForm.value.news).pipe( first() ).subscribe(r=>{
        this.add_news_input=false;
        this.adding_news=false;
        this.list_of_news.splice(0,0,r[0])
       
        let now=Math.trunc( new Date().getTime()/1000);
        let date=r[0].createdAt;
        date = date.replace("Z",'');
        date=date.slice(0,19)
        let deco_date=Math.trunc( new Date(date + '+00:00').getTime()/1000)
        this.list_of_news_date.splice(0,0,get_date_to_show_navbar(now-deco_date))

        this.newsForm.reset();

      })
      
    }
  }

  remove_user_news(i){

    if(this.adding_news){
      return false
    }
    this.adding_news=true;

    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir supprimer cette actualité ?'},
      panelClass: "popupConfirmationClass",
    });
    dialogRef.afterClosed().pipe( first() ).subscribe(result => {
      if(result){
        let id=this.list_of_news[i].id
        this.Profile_Edition_Service.remove_user_news(id).pipe( first() ).subscribe(r=>{
          this.add_news_input=false;
          this.adding_news=false;
          this.list_of_news.splice(i,1)
          this.list_of_news_date.splice(i,1)
          this.newsForm.reset();
        })
      }
      else{
        this.adding_news=false;

      }
    })
    
  }

  number_of_news_limit=4;
  show_more_news() {
    this.number_of_news_limit+=4;
  }


  
  
  faPinterest = faPinterest;
  faFacebookSquare = faFacebookSquare;
  faInstagram = faInstagram;

  facebook: string;
  instagram: string;
  number_of_instagram_followers:string;
  pinterest: string;
  twitter: string;
  youtube:string;
  deviantart: string;
  artstation: string;
  website: string;
  other_website: string;
  shopping:string;
  email_about:string;
  phone_about:string;


  /* VARIABLES ARTISTES */
  //chiffres clés pour un artiste
  profil_vews_found=false;
  number_of_flagship_clicks=number_in_k_or_m(0);
  number_of_flagship_clicks_retrieved=false;
  number_of_visits=number_in_k_or_m(0);
  number_of_visits_after_research=number_in_k_or_m(0);
  number_of_views=number_in_k_or_m(0);
  number_of_likes=number_in_k_or_m(0);
  number_of_loves=number_in_k_or_m(0);
  number_of_comments=number_in_k_or_m(0);
  //compétences pour un artiste
  list_of_skills=[];
  list_of_categories=[];
  //cv pour un artiste
  cv_name:string;
  cv:any;


  /* VARIABLES EDITEURS */
  //chiffres clés pour un éditeur
  number_of_forms=number_in_k_or_m(0);
  //catégories pour un éditeur
  instructions:any;
  //oeuvres phares pour un éditeur
  list_of_editor_artworks=[]
  editor_pictures_loaded={}
  editor_pictures_by_name={};
  load_editor_picture(name){
    this.editor_pictures_loaded[name]=true;
  }

  list_of_artworks_retrieved=false;
  get_list_of_artworks_for_editor(){
      this.Profile_Edition_Service.get_editor_artworks(this.pseudo).pipe( first() ).subscribe(r=>{
        this.list_of_artworks=r[0];
        this.list_of_artworks_retrieved=true;

        if(this.list_of_artworks.length>0){
          for (let i=0;i<r[0].length;i++){
            this.Profile_Edition_Service.retrieve_editor_artwork_picture(r[0][i].picture_name).pipe( first() ).subscribe(t=>{
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              this.editor_pictures_by_name[r[0][i].picture_name] = url;
              this.cd.detectChanges()
            })
            
          }
        }
      })
  }

  remove_editor_artwork(i){
    this.Profile_Edition_Service.remove_editor_artwork(this.list_of_artworks[i].id).pipe( first() ).subscribe(r=>{
      this.list_of_artworks.splice(i,1);
    })
  }

  list_of_artworks=[];

  list_of_real_delays={"1s":"1 semaine","2s":"2 semaines","3s":"3 semaines",
  "1m":"1 mois","6s":"6 semaines","7s":"7 semaines","2m":"2 mois",
  "3m":"3 mois","4m":"4 mois","5m":"5 mois","6m":"6 mois"};
  standard_price=0;
  standard_delay="4m";
  express_price=6;
  express_delay="1m";



  read_cv(){

    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.cv},
      panelClass: "popupDocumentClass",
    }).afterClosed().pipe( first() ).subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
    });
  }

  
  loading_editor_artworks=false;
  open_add_editor_artwork(){

    const dialogRef = this.dialog.open(PopupEditorArtworkComponent, {
      data: {id_user:this.user_id},
      panelClass: "popupEditorArtworkClass",
    }).afterClosed().pipe( first() ).subscribe(result => {
      if(result){
        this.loading_editor_artworks=true;
        this.Profile_Edition_Service.retrieve_editor_artwork_picture(result.picture_name).pipe( first() ).subscribe(t=>{
  
          let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
          this.editor_pictures_by_name[result.picture_name] = url;
          this.list_of_artworks.splice(0,0,result)
          this.loading_editor_artworks=false;
          this.cd.detectChanges()
          this.scrollobs = merge(
            fromEvent(window, 'scroll'),
          );
        })
      }
     
    });
  }


  submit_project(i){
    if(this.last_emitted_project){
      let s=date_in_seconds(this.now_in_seconds,this.last_emitted_project.createdAt);
      let time_left;
      if( Math.trunc(s/86400)<=1 ) {
        time_left= "1 mois";
      }
      else {
        time_left= 30-Math.trunc(s/86400) + " jours";
      }
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:true, 
          text:`Vous avez déjà soumis un projet auprès de cet éditeur, il y a moins de 30 jours. Vous pourrez à nouveau soumettre un projet dans ${time_left}.`},
          panelClass: "popupConfirmationClass",
      });
      
    }
    else{
      this.submit_project_end(i)
    }

    
  }


  submit_project_end(i){
    
    let formula=""
    let delay=""
    let price=0
    if(i==0){
      formula="standard";
      price=this.standard_price;
      delay=this.standard_delay;
    }
    else if(i==1){
      formula="express";
      price=this.express_price;
      delay=this.express_delay;
    }
    else if(i==2){
      const dialogRef = this.dialog.open(LoginComponent, {
        data: {usage:"login"},
        panelClass:"loginComponentClass"
      });
      return
    }


    let list_of_editors_ids=[this.user_id];
    let editor_pictures={};
    editor_pictures[this.user_id]=this.profile_picture;
    let editor_nicknames={};
    editor_nicknames[this.user_id]=this.pseudo;
    let editor_names={};
    editor_names[this.user_id]=this.author_name;
    let formulas={};
    formulas[this.user_id]=formula;
    let prices={};
    prices[this.user_id]=price;
    let delays={};
    delays[this.user_id]=delay;
    
    // number of trendings,
    const dialogRef = this.dialog.open(PopupApplyComponent, {
      data: {
        multiple_submission:false,
        //editor
        list_of_editors_ids:list_of_editors_ids,
        editor_pictures:editor_pictures,
        editor_names:editor_names,
        editor_nicknames:editor_nicknames,
        formulas:formulas,
        prices:prices,
        delays:delays,

        //visitor

        visitor_id:this.visitor_id,
        visitor_certified:this.visitor_certified,
        visitor_name: this.visitor_first_name,
        visitor_nickname:this.visitor_name,
        visitor_description:this.visitor_description,
        visitor_likes:this.visitor_likes,
        visitor_loves:this.visitor_loves,
        visitor_views:this.visitor_views,
        visitor_subscribers_number:this.visitor_subscribers_number,
        visitor_number_of_visits:this.visitor_number_of_visits,
        visitor_number_of_comics:this.visitor_number_of_comics,
        visitor_number_of_drawings:this.visitor_number_of_drawings,
        visitor_number_of_writings:this.visitor_number_of_writings,
        visitor_number_of_ads:this.visitor_number_of_ads,
        visitor_number_of_artpieces:this.visitor_number_of_artpieces,
      },
      panelClass: "popupLinkcollabApplyClass",
    })
    dialogRef.afterClosed().pipe( first() ).subscribe(result => {
      if(result){
        this.router.navigateByUrl('/account/' + this.visitor_name + "/projects" );
      }
    })
  }


  add_flagship_click(){
    if(this.mode_visiteur){
      this.navbar.add_main_research_to_history("Flagship","unknown",this.user_id,this.pseudo,this.author_name,"clicked",this.number_of_comics,this.number_of_drawings,this.number_of_writings,this.number_of_ads,this.type_of_account,"unknown","unknown","unknown", this.type_of_profile).pipe( first() ).subscribe();
    }
    
  }


}



