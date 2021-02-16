import { Component, OnInit, ChangeDetectorRef, HostListener, QueryList } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { ChatService } from '../services/chat.service';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Reports_service } from '../services/reports.service';
import { Emphasize_service } from '../services/emphasize.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Albums_service } from '../services/albums.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { AuthenticationService } from '../services/authentication.service';
import { Community_recommendation } from '../services/recommendations.service';
import { PopupSubscribingsComponent } from '../popup-subscribings/popup-subscribings.component';
import { PopupSubscribersComponent } from '../popup-subscribers/popup-subscribers.component';
import { PopupAddStoryComponent } from '../popup-add-story/popup-add-story.component';
import { PopupStoriesComponent } from '../popup-stories/popup-stories.component';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { Story_service } from '../services/story.service';
import { NotificationsService } from '../services/notifications.service';
import { Ads_service } from '../../app/services/ads.service'
import { trigger, transition, style, animate } from '@angular/animations';

import {LoginComponent} from '../login/login.component';


declare var $: any;


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
    public route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
    private Story_service:Story_service,
    public navbar: NavbarService, 
    private location: Location,
    private cd: ChangeDetectorRef,
    private Profile_Edition_Service: Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private BdOneShotService: BdOneShotService,
    private BdSerieService:BdSerieService,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Subscribing_service:Subscribing_service,
    private Albums_service:Albums_service,
    public dialog: MatDialog,
    private Emphasize_service:Emphasize_service,
    private Ads_service:Ads_service,
    private AuthenticationService:AuthenticationService,
    private Community_recommendation:Community_recommendation,
    ) {
    //this.pseudo = this.activatedRoute.snapshot.paramMap.get('pseudo');

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })

    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };

    this.navbar.setActiveSection(-1);
    this.navbar.show();
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
    console.log("resize")
    if(this.width!=this.main_container.nativeElement.offsetWidth*0.9){
      if(this.main_container.nativeElement.offsetWidth<570){
        this.show_selector_for_album=true;
      }
      else{
        this.show_selector_for_album=false;
      }
      this.width=this.main_container.nativeElement.offsetWidth*0.9;
      this.update_background_position(this.opened_section);
  
      this.update_number_of_comics_to_show();
      if(this.list_visibility_albums_drawings){
       
        console.log(this.width);
        this.prevent_shiny=true;
        this.update_number_of_drawings_to_show();
      }
      this.update_new_contents();
    }
   
  }

  width:number;
  new_contents_loading=false;
  number_of_ads_to_show=5;

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
      if(this.list_of_ads_added && this.opened_section==2 && this.number_of_ads_to_show<this.list_of_ads.length){
        this.number_of_ads_to_show+=5;
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
  mode_visiteur:boolean=true;
  mode_visiteur_added:boolean=false;
  pseudo:string;
  user_id:number=0;
  gender:string;
  author:any;
  author_name:string;
  firstName:string;
  lastName:string;
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

  //number of publications
  number_of_comics:number;
  number_of_drawings:number;
  number_of_writings:number;
  number_of_ads:number;



  user_blocked=false;
  user_who_blocked:string;
  user_blocked_retrieved=false;


  links_titles:any[]=[];
  links:any[]=[];
  links_retrieved=false;



  listOfCategories = ["Accueil","Œuvres ("+this.number_of_artpieces+")","Annonces ("+this.list_of_ads.length+")","Abonnés ("+this.subscribed_users_list.length+")",
  "Abonnements ("+this.users_subscribed_to_list.length+")","Qui suis-je","Archives","Mon compte","Publier"];
 
  primary_description_extended_privacy:string='';
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


  ngOnInit()  {
 
    let THIS=this;
   
    window.scroll(0,0);
    
    this.pseudo = this.activatedRoute.snapshot.paramMap.get('pseudo');
    this.user_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    if(!(this.user_id && this.user_id>0) || !( this.pseudo && this.pseudo.length>0)){
      console.log("1 not found")
      this.page_not_found=true;
      return
    }



    this.Profile_Edition_Service.retrieve_profile_data_links(this.user_id).subscribe(l=>{
      if(l[0].length>0){
        for(let i=0;i<l[0].length;i++){
          this.links_titles[i]=l[0][i].link_title;
          this.links[i]=l[0][i].link;
        }
      }
      this.links_retrieved=true;
      this.cd.detectChanges();
    })

    this.Profile_Edition_Service.get_information_privacy(this.user_id).subscribe(l=>{
    
      this.primary_description_extended_privacy=l[0].primary_description_extended;
      console.log( this.primary_description_extended_privacy)
    })

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      console.log(r)
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });

    this.Story_service.check_stories_for_account(this.user_id).subscribe(r=>{
      console.log(r[0]);
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

    this.Profile_Edition_Service.retrieve_cover_picture( this.user_id ).subscribe(r=> {
      console.log(r)
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.cover_picture = SafeURL;
    });

   

    this.Profile_Edition_Service.retrieve_profile_data_and_check_visitor( this.user_id ).subscribe( s => {
      console.log("data retrieved")
      console.log(s)
      let user=s[0].user;
      this.visitor_id=s[0].visitor.id
      this.visitor_name=s[0].visitor.nickname;
      this.type_of_profile=s[0].visitor.status;
      this.type_of_profile_retrieved=true;
      this.cd.detectChanges();
  

      if( user  && this.visitor_id==user.id){
        console.log("visitor data retrieved")
        this.mode_visiteur = false;
      }
      this.mode_visiteur_added = true;

      if( !user || user.status=="visitor") {
        console.log("3 not found")
        this.page_not_found=true;
        return
      }
      else if(user && ((user.status=='suspended' && this.visitor_id!=user.id) || user.status=="deleted") ){
        
        // if author suspended and visitor, if account doesn't exist or deleted
        this.profile_not_found=true;

        
        //this.update_background_position( this.opened_section );;

        this.author_name = user.firstname + ' ' + user.lastname;
        this.cd.detectChanges();
        if(user.status=="suspended"){
          this.gender=user.gender;
          this.firstName=user.firstname;
          this.lastName=user.lastname;
          this.primary_description=user.primary_description;
          this.type_of_account=user.type_of_account;
          this.certified_account=user.certified_account;
          this.user_location=user.location;
          this.profile_suspended=true;
         
        }
        else{
          //deleted
          this.navbar.delete_research_from_navbar("Account","unknown",this.user_id).subscribe(l=>{
            console.log(l);
          });
        }
        this.mode_visiteur_added = true;
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
        console.log("4 not found")
        this.page_not_found=true;
        return
      }
      
      else{
        // (not a visitor and account ok or suspended) or a visitor and account ok
        if(user && user.status=='suspended' && this.visitor_id==user.id){
          this.my_profile_is_suspended=true;

          this.cd.detectChanges();
          //this.update_background_position( this.opened_section );
          
        }
        console.log(this.user_id)

        this.author=user;
        this.author_name = user.firstname + ' ' + user.lastname;
        this.gender=user.gender;
        this.firstName=user.firstname;
        this.lastName=user.lastname;
        this.primary_description=user.primary_description;
        this.type_of_account=user.type_of_account;
        this.primary_description_extended=user.primary_description_extended;
        this.certified_account=user.certified_account;
        this.user_location=user.location;
        
        if (this.visitor_id==user.id){
          this.user_blocked=false;
          this.user_blocked_retrieved=true;
          this.cd.detectChanges();
          this.update_background_position( this.opened_section );
        }
        else{
          // check if the user author blocked the visitor
          this.Profile_Edition_Service.check_if_user_blocked(this.user_id).subscribe(r=>{
            console.log(r)
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

          })
                  
        };

        this.Profile_Edition_Service.retrieve_number_of_contents(this.user_id).subscribe(r=>{
          this.number_of_comics=r[0].number_of_comics;
          this.number_of_drawings=r[0].number_of_drawings;
          this.number_of_writings=r[0].number_of_writings;
          this.number_of_ads=r[0].number_of_ads;
          this.number_of_artpieces=this.number_of_comics+ this.number_of_drawings +  this.number_of_writings;
          this.cd.detectChanges();
          this.update_background_position(this.opened_section)
          if(!this.mode_visiteur){
            this.navbar.check_if_research_exists("Account","unknown",this.user_id,this.pseudo,"clicked").subscribe(p=>{
              if(!p[0].value){
                this.navbar.add_main_research_to_history("Account","unknown",this.user_id,this.pseudo,this.author_name,"clicked",this.number_of_comics,this.number_of_drawings,this.number_of_writings,this.number_of_ads,this.type_of_account,"unknown","unknown","unknown", this.type_of_profile).subscribe();
              }
            })
          }
          else{
            this.navbar.add_main_research_to_history("Account","unknown",this.user_id,this.pseudo,this.author_name,"clicked",this.number_of_comics,this.number_of_drawings,this.number_of_writings,this.number_of_ads,this.type_of_account,"unknown","unknown","unknown", this.type_of_profile).subscribe();
          } 
        })

        if(this.type_of_profile=="suspended"){
          let cat = this.route.snapshot.data['category']
          if(cat>=0){
            this.opened_category=cat;
            this.open_section( 7,false );
          }
          else{
            this.open_section( 7,true );
          }
          
        }
        else if(this.route.snapshot.data['section']>5){
          if(this.mode_visiteur){
            if(this.route.snapshot.data['section']==8){
              //après le click du lien envoyé par mail pour confirmer inscription
              let id = parseInt(this.route.snapshot.paramMap.get('id'));
              let password = this.route.snapshot.paramMap.get('password');
              console.log(id)
              console.log(password)
              
              this.Profile_Edition_Service.check_password_for_registration2(id,password).subscribe(r=>{
                console.log(r[0])
               
                if(r[0].user_found){
                  console.log("login ready")
                  console.log(r[0])
                  console.log(r[0].user_found.id)
                  console.log(r[0].pass)
                  this.open_section( 7,true );
                  const dialogRef = this.dialog.open(LoginComponent, {
                    data: {usage:"rest_pass",email:r[0].user_found.email,temp_pass:r[0].pass},
                    panelClass: "loginComponentClass",
                  });

                  
                }
                else{
                  this.open_section( 1,true );
                  this.cd.detectChanges();
                  this.update_background_position(this.opened_section)
                }
              })
            }
            else{
              this.open_section( 1,true );
              this.cd.detectChanges();
              this.update_background_position(this.opened_section)
            }
            
          }
          else{
            let cat = this.route.snapshot.data['category']
            if(cat>=0){
              this.opened_category=cat;
              this.open_section( this.route.snapshot.data['section'],false );
            }
            else{
              this.open_section( this.route.snapshot.data['section'],true );
            }
           
            this.cd.detectChanges();
            this.update_background_position(this.opened_section)
          }

        }
        else{
          let cat = this.route.snapshot.data['category']
          if(cat>=0){
            this.opened_category=cat;
            this.open_section( this.route.snapshot.data['section'],false );
          }
          else{
            this.open_section( this.route.snapshot.data['section'],true );
          }
          this.cd.detectChanges();
          this.update_background_position(this.opened_section)
        }

      }
    });

   
    /**************************************  CONTENTS  **********************************/
    /**************************************  CONTENTS  **********************************/

    this.Emphasize_service.get_emphasized_content(this.user_id).subscribe(r=>{
      console.log(r[0])
      if (r[0]!=null){
        this.emphasized_artwork=r[0];
        this.emphasized_artwork_added=true;
      }
      this.cd.detectChanges();
      this.update_background_position(this.opened_section)
    });

    this.Subscribing_service.get_new_comic_contents(this.user_id).subscribe(r=>{
      console.log(r)
      if (r[0].length>0){
        let compteur=0;
        for (let i=0;i<r[0].length;i++){
          if(r[0][i].format=="one-shot"){
            this.BdOneShotService.retrieve_bd_by_id(r[0][i].publication_id).subscribe(s=>{
              if(s[0].status=="public"){
                this.new_comic_contents[i]=s[0];
              }
              compteur++;
              if(compteur==r[0].length){
                console.log(  this.new_comic_contents)
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
            this.BdSerieService.retrieve_bd_by_id(r[0][i].publication_id).subscribe(s=>{
              
              if(s[0].status=="public"){
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

    this.Subscribing_service.get_new_drawing_contents(this.user_id).subscribe(r=>{
      if (r[0].length>0){
        let compteur=0;
        for (let i=0;i<r[0].length;i++){
          if(r[0][i].format=="one-shot"){
            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][i].publication_id).subscribe(s=>{
              if(s[0].status=="public"){
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
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][i].publication_id).subscribe(s=>{
              if(s[0].status=="public"){
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

    this.Subscribing_service.get_new_writing_contents(this.user_id).subscribe(r=>{
      if (r[0].length>0){
        let compteur=0;
        for (let i=0;i<r[0].length;i++){
          this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][i].publication_id).subscribe(s=>{
            if(s[0].status=="public"){
              this.new_writing_contents[i]=s[0];
            }
            compteur++;
            if(compteur==r[0].length){
              console.log(this.new_writing_contents)
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
    
    

    this.Ads_service.get_ads_by_user_id(this.user_id).subscribe(r=>{
      if (r[0].length>0){
        let compteur=0;
        for (let i=0;i<r[0].length;i++){
            this.list_of_ads[i]=(r[0][i]);
            compteur++;
            if(compteur==r[0].length){
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

    /**************************************  SUBSCRIBINGS  **********************************/
    /**************************************  SUBSCRIBINGS  **********************************/

    this.Subscribing_service.check_if_visitor_susbcribed(this.user_id).subscribe(information=>{
      if(information[0].value){
        this.already_subscribed=true;
        this.subscribtion_checked=true;
        
        this.cd.detectChanges();
        this.update_background_position(this.opened_section)
      }
    }); 

    this.Subscribing_service.get_all_subscribed_users(this.user_id).subscribe(information=>{
      if(Object.keys(information).length>0){
        this.subscribed_users_list=information[0];
      }
      this.cd.detectChanges();
      this.update_background_position(this.opened_section)
    });

    this.Subscribing_service.get_all_subscribings_by_user_id(this.user_id).subscribe(information=>{

      this.users_subscribed_to_list= information[0];
      this.cd.detectChanges();
      this.update_background_position(this.opened_section)
    });

    /*********************************ALBUMS  ******************************************/
    /*********************************ALBUMS  ******************************************/
    /*********************************ALBUMS  ******************************************/

  
      this.BdOneShotService.retrieve_bd_by_userid( this.user_id ).subscribe( r => {
        this.list_bd_oneshot = r[0];
        this.list_bd_oneshot_added=true;
        this.cd.detectChanges();
        this.update_background_position( this.opened_section );;
        this.get_comics_albums();
      });

      this.BdSerieService.retrieve_bd_by_userid( this.user_id ).subscribe( r => {
        this.list_bd_series = r[0];
        this.list_bd_series_added=true;   
        this.cd.detectChanges();
        this.update_background_position( this.opened_section );;
        this.get_comics_albums()
      });

     /*********************************** DRAWINGS *************************************/

    this.Drawings_Onepage_Service.retrieve_drawing_onepage_info_user_id( this.user_id ).subscribe( r => {
      this.list_drawings_onepage = r[0];
      this.list_drawings_onepage_added=true;
      this.cd.detectChanges();
      this.update_background_position( this.opened_section );;
      this.get_drawings_albums()
    });
    
    this.Drawings_Artbook_Service.retrieve_drawing_artbook_info_by_userid( this.user_id ).subscribe( r => {
      this.list_drawings_artbook = r[0];
      this.list_drawings_artbook_added=true;
      this.cd.detectChanges();
      this.update_background_position( this.opened_section );;
      this.get_drawings_albums()
    });

   


    /*********************************** WRITINGS *************************************/

    
    this.Writing_Upload_Service.retrieve_writings_information_by_user_id( this.user_id ).subscribe( r => {
      this.list_writings = r[0];
      this.list_writings_added=true;
      this.cd.detectChanges();
      this.update_background_position( this.opened_section );
      this.Albums_service.get_albums_writings(this.user_id).subscribe(information=>{
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
                  console.log(this.list_titles_albums_writings_added)
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
          console.log(this.route.snapshot.data['category'] )
          this.open_category( this.route.snapshot.data['category'],true );
        }
      })
    });

    

      
  }


  new_contents_added=false;
  display_new_comic_contents=false;
  display_new_writing_contents=false;
  display_new_drawing_contents=false;
  no_new_contents=false;
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
      this.Albums_service.get_albums_comics(this.user_id).subscribe(info=>{

        this.list_bd_albums_status[0]=info[0].standard_albums[0].status;        
        this.list_bd_albums_status[1]=info[0].standard_albums[1].status;

        let information=info[0].albums;
        if((information).length!=0){
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
              console.log( this.list_albums_bd)
            }
          }
        }
        else{
          this.list_albums_bd_added = true;
          this.get_number_of_comics_to_show()
        }
        if( this.opened_section == 1 && this.route.snapshot.data['category']==0) {
          console.log(this.route.snapshot.data['category'] )
          this.open_category( this.route.snapshot.data['category'],true );
        }
      });
    }
  }

  get_drawings_albums(){

    if(this.list_drawings_artbook_added && this.list_drawings_onepage_added){
      this.Albums_service.get_albums_drawings(this.user_id).subscribe(info=>{

        this.list_drawing_albums_status[0]=info[0].standard_albums[0].status;        
        this.list_drawing_albums_status[1]=info[0].standard_albums[1].status;
  
        console.log( this.list_drawing_albums_status)
        let information =info[0].albums;
        console.log(information)
        if(information.length!=0){   
          for (let i=0; i <(information).length;i++){
              this.list_titles_albums_drawings_added.push(information[i].album_name);
              this.list_titles_albums_drawings.push(information[i].album_name);
              console.log(information[i].album_name)
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
                  console.log(album)
                  this.list_albums_drawings.push(album);
                  if(i==(information).length-1){
                    console.log("list_albums_drawings_added")
                    this.list_albums_drawings_added = true;
                    this.get_number_of_drawings_to_show();
                  }
                }
                
              } 
          }
        }
        else{
          console.log("list_albums_drawings_added")
          this.list_albums_drawings_added = true;
          this.get_number_of_drawings_to_show();
        }
        if( this.opened_section == 1 && this.route.snapshot.data['category']==1) {
          console.log(this.route.snapshot.data['category'] )
          this.open_category( this.route.snapshot.data['category'],true);
        }
      });
    }
    
  }

















  /******************************************* END ON INIT ********************************************/
  /******************************************* END ON INIT ********************************************/
  /******************************************* END ON INIT ********************************************/




  stop_event(e:any) {
    e.stopPropagation();
  }




 
  onCategoryChange(e:any) {
    console.log(e.value)
    console.log(this.opened_section)
    
    if( e.value == 3 ) {
      this.see_subscribers();
    }
    else if ( e.value == 4 ) {
      this.see_subscribings();
    }
    else if ( e.value == 8 ) {
      this.router.navigateByUrl('/add-artwork');
    }
    else {
      if(e.value==this.opened_section){
        return
      }
      this.open_section(e.value,true);
    }
  }

  update_new_contents() {
    console.log("main_container")
    console.log(this.main_container.nativeElement.offsetWidth*0.9)
    let width = this.main_container.nativeElement.offsetWidth*0.9;
    console.log(width)
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

    console.log(this.number_of_new_contents_to_show)



  }



  see_subscribers(){


    if(this.subscribed_users_list.length == 0) {
      return;
    }
    this.dialog.open(PopupSubscribersComponent, {
      data: {
        subscribers:this.subscribed_users_list,
        type_of_profile:this.type_of_profile,
        visitor_name:this.visitor_name,
        visitor_id:this.visitor_id
      }, 
      panelClass: 'popupViewUsersClass',
    });
  }
  see_subscribings() {
    
    if(this.users_subscribed_to_list.length == 0) {
      return;
    }
    this.dialog.open(PopupSubscribingsComponent, {
      data: {
        subscribings:this.users_subscribed_to_list,
        type_of_profile:this.type_of_profile,
        visitor_name:this.visitor_name,
        visitor_id:this.visitor_id
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
  ngAfterViewInit() {
    
    
    this.update_background_position( this.opened_section );
    if(this.main_container.nativeElement.offsetWidth<570){
      this.show_selector_for_album=true;
    }
    else{
      this.show_selector_for_album=false;
    }
    this.width=this.main_container.nativeElement.offsetWidth*0.9;
    this.update_new_contents();
    this.profileHovered.nativeElement.addEventListener('mouseenter', e => {
      this.showEditCoverPic = false;
    });
    this.profileHovered.nativeElement.addEventListener('mouseleave', e => {

      this.showEditCoverPic = true;
    });

  }


  @ViewChild("absoluteBackgroundColor", {read: ElementRef}) absoluteBackgroundColor:ElementRef;


  @ViewChildren("buttonSection", {read: ElementRef}) buttonSection:QueryList<ElementRef>;
  update_background_position(i:number) {
    console.log("update background position")
    if( this.absoluteBackgroundColor && this.buttonSection.toArray()[i] ) {
      this.rd.setStyle( this.absoluteBackgroundColor.nativeElement, "width", this.buttonSection.toArray()[i].nativeElement.offsetWidth +"px" );
      this.rd.setStyle( this.absoluteBackgroundColor.nativeElement, "transform", "translate("+ this.buttonSection.toArray()[i].nativeElement.offsetLeft +"px,-50%)" );
      this.cd.detectChanges()
    }
  }


  open_section(i : number,not_first) {
    if( this.opened_section == i ) {
      this.cd.detectChanges();
      this.update_background_position(i);
      return;
    }

    this.opened_section=i;
    this.opened_section_small=i;
    this.cd.detectChanges();
    this.update_background_position(i);
    if(not_first){
      if( (i == 0) ) { this.location.go(`/account/${this.pseudo}/${this.user_id}`); }
      else if( i == 1 ) { 
        this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks`); 
      }
      else if( i == 2 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/ads`); }
      else if( i == 5 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/about`); }
      else if( i == 6 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/archives`); }
      else if( i == 7 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/my_account`); }
    }
    
   
  }


  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop - 150;
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
  open_category(i : number,first) {
    console.log("open cat ")
    console.log(i)
    console.log(this.category_to_load)
    console.log(this.opened_category)
    if( !first && this.opened_category == i || (i==0 && this.number_of_comics==0) || (i==1 && this.number_of_drawings==0) || (i==2 && this.number_of_writings==0) ) {
      return;
    }
    this.contents_loading=false;
   
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
    if( this.opened_category==0 && this.opened_section==1) { this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks/comics`); }
    else if(this.opened_category==1 && this.opened_section==1 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks/drawings`); }
    else if( this.opened_category==2 && this.opened_section==1 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks/writings`); }
   
 
    console.log("category changed")
    this.add_album=-1;
    this.opened_album=-1;
   
    this.open_album( 0,true);
   
   
    console.log("end opened cat")
    console.log(this.opened_category)
    console.log(this.put_category_visible)
    
    
  }

  contents_loading=false;
  put_album_visible=[false]
  albums_to_show_comics=[false];
  albums_to_show_drawings=[false];
  albums_to_show_writings=[false];
  albums_with_masonry_loaded=[];
  open_album(i : number,from_category) {
    console.log("open album " + i)
    if( this.opened_album == i || this.add_album != -1 ) {
      if(this.add_album!=-1){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:true, text:'Voulez-vous quitter ce le mode création ?'},
          panelClass: "popupConfirmationClass",
        });
        dialogRef.afterClosed().subscribe(result => {
          if(result){
            this.start_add_album(this.add_album)
          }
        })
      }
      return;
    }

    if(this.opened_section==1){
      this.contents_loading=true;
    }
    
    if(!from_category && this.opened_category==1){
      this.list_visibility_albums_drawings=false;
      if($('.grid').masonry){
        $('.grid').masonry().masonry('destroy')
      }
    }
    
  
   
    this.compteur_visibility_drawings=0;
    this.compteur_drawings_thumbnails=0; 
    
    this.reset_number_of_comics_to_show();
    this.reset_number_of_writings_to_show();
    this.reset_number_of_drawings_to_show();
    this.opened_album=i;
    this.opened_album_selector=i;
   
    console.log("detect changes")
    this.cd.detectChanges();
   
   
  }


  opened_album_selector=-1;
  albumChange(event){
    console.log(this.opened_album)
    console.log(this.opened_album_selector)
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

  // number of grid/number of albums
  reload_masonry(){
    console.log("reaload masonry")
     var $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      //columnWidth: 200,
      gutter:10,
      //isInitLayout:true,
      initLayout:false,
      fitWidth: true,
      //horizontalOrder: true,
      
    });
    
  }
  compteur_visibility_drawings=0
  ini_masonry() {
    console.log("mansour")
    let THIS=this;
   
    var $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      //columnWidth: 200,
      gutter:10,
      //isInitLayout:true,
      initLayout:false,
      fitWidth: true,
      //horizontalOrder: true,
      
    });

    //console.log($grid)

    $grid.on( 'layoutComplete', function() {
      //console.log($grid)
      console.log("layout complete")
      
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
        console.log("put drawing v")
        THIS.contents_loading=false;
        THIS.list_visibility_albums_drawings=true;
        //THIS.albums_with_masonry_loaded[THIS.opened_album]=true;
        //THIS.put_album_visible[THIS.opened_album]=true;
      }
      
      THIS.prevent_see_more=false;
      THIS.cd.detectChanges();
      
      
    });

    $grid.masonry();

  }



  
 
  


  add_story(){
    const dialogRef = this.dialog.open(PopupAddStoryComponent, {
      data: {user_id:this.user_id},
      panelClass: 'popupAddStoryClass',
    });
  }


  change_cover_picture() {
    const dialogRef = this.dialog.open(PopupFormComponent, {
      data: {type:"edit_cover_picture"},
      panelClass: 'popupUploadPictureClass',
    });
  }

  change_profile_picture() {
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
        this.Subscribing_service.subscribe_to_a_user(this.user_id).subscribe(information=>{
          
          console.log(information)
          if(information[0].subscribtion){
           
            this.loading_subscribtion=false;
            this.cd.detectChanges();
          }
          else{
            this.NotificationsService.add_notification('subscribtion',this.visitor_id,this.visitor_name,this.user_id,this.user_id.toString(),'none','none',this.visitor_id,0,"add",false,0).subscribe(l=>{
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
        this.Subscribing_service.remove_subscribtion(this.user_id).subscribe(information=>{
         
          console.log(information)
          this.NotificationsService.remove_notification('subscribtion',this.user_id.toString(),'none',this.visitor_id,0,false,0).subscribe(l=>{
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
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.Albums_service.remove_drawing_album(this.list_titles_albums_drawings[i],this.list_drawing_albums_status[i-1]).subscribe(r=>{
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
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.Albums_service.remove_comic_album(this.list_titles_albums_bd[i],this.list_bd_albums_status[i-1]).subscribe(r=>{
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
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.Albums_service.remove_writing_album(this.list_titles_albums_writings_added[i],this.list_writings_albums_status[i]).subscribe(r=>{
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
    console.log("get number of comics to show by albums")
    let width=this.main_container.nativeElement.offsetWidth*0.9;
    console.log(width)
    console.log(this.list_titles_albums_bd)
    console.log(this.list_albums_bd_added)
    console.log(!this.got_number_of_comics_to_show)
    console.log(this.list_titles_albums_bd_added)
    if(this.list_albums_bd_added && !this.got_number_of_comics_to_show ){
      console.log("in it")
      let n=Math.floor(width/250);
      if(n>3){
        this.number_of_comics_variable = (n<6)?n:6;
      }
      else{
        this.number_of_comics_variable = 6;
      }
      
      this.got_number_of_comics_to_show=true;
      this.number_of_lines_comics=1;
    
      
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
      console.log(this.number_of_comics_to_show_by_album)
    }
  }

  update_number_of_comics_to_show(){
    if(this.got_number_of_comics_to_show){
      let width=this.main_container.nativeElement.offsetWidth*0.9;
      let variable;
      let n=Math.floor(width/250);
      if(n>3){
        variable = (n<6)?n:6;
      }
      else{
        variable= 6;
      }
      
      console.log(width)
      if(variable!=this.number_of_comics_variable && variable>0 ){
        for(let i=0;i<this.list_titles_albums_bd.length-1;i++){
          this.number_of_comics_to_show_by_album[i]/=this.number_of_comics_variable;
          this.number_of_comics_to_show_by_album[i]*=variable;
         
          if(i==this.list_titles_albums_bd.length-2){
            this.number_of_comics_variable=variable;
            console.log( this.number_of_comics_to_show_by_album)
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
    console.log("rest number of comics")
    console.log("main_container")
    console.log(this.main_container.nativeElement.offsetWidth*0.9)
    if(this.got_number_of_comics_to_show){
      if(this.opened_album>0){
        this.compteur_number_of_comics= this.number_of_comics_variable*2;
      }
      else{
        this.compteur_number_of_comics=this.number_of_comics_variable;
     
      }

      this.number_of_comics_to_show_by_album[0]=this.compteur_number_of_comics;
      this.number_of_comics_to_show_by_album[1]=this.compteur_number_of_comics;
      for(let i=0;i<this.list_titles_albums_bd_added.length;i++){
        this.number_of_comics_to_show_by_album[i+2]=this.compteur_number_of_comics;
      }
      console.log(this.number_of_comics_to_show_by_album)
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
    console.log("get_number_of_drawings_to_show")
    let width=this.main_container.nativeElement.offsetWidth*0.9;
    console.log(width)
    console.log(this.list_albums_drawings_added)
    console.log(this.got_number_of_drawings_to_show)
    if(this.list_albums_drawings_added && !this.got_number_of_drawings_to_show){
      console.log("in it")
      let n=Math.floor(width/210);
      if(n>3){
        this.number_of_drawings_variable = (n<6)?n:6;
      }
      else{
        this.number_of_drawings_variable = 6;
      }
      
      this.got_number_of_drawings_to_show=true;
      this.number_of_lines_drawings=1;
      
      
      this.compteur_number_of_drawings= this.number_of_drawings_variable*this.number_of_lines_drawings;
      this.number_of_drawings_to_show_by_album[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_album[1]=this.compteur_number_of_drawings;
      if(this.list_titles_albums_drawings_added.length>0){
        for(let i=0;i<this.list_titles_albums_drawings_added.length;i++){
          this.number_of_drawings_to_show_by_album[i+2]=this.compteur_number_of_drawings;
        }
      }
      
      console.log(this.number_of_drawings_variable)
      console.log(this.number_of_lines_drawings)
      console.log(this.list_albums_drawings)
      console.log(this.number_of_drawings_to_show_by_album)
    }
  }

  
  update_number_of_drawings_to_show(){
    if(this.got_number_of_drawings_to_show){
      console.log("update_number of drawings")
      console.log(this.got_number_of_drawings_to_show)
      console.log(this.main_container.nativeElement)
      
        let width=this.main_container.nativeElement.offsetWidth*0.9;
        console.log(width)
        let variable;
        let n=Math.floor(width/210);
        if(n>3){
          variable = (n<6)?n:6;
        }
        else{
          variable = 6;
        }
        console.log(this.number_of_drawings_variable)
        console.log(variable)
        if(variable!=this.number_of_drawings_variable && variable>0){
          console.log("prevent see more")
          this.prevent_see_more=true;
          this.detect_new_compteur_drawings=false;
          
          let total=0;
          let change=false;
          console.log(this.list_albums_drawings)
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
                console.log(this.number_of_drawings_to_show_by_album[i])
                console.log(this.list_drawings_onepage.length)
                console.log(old_value)
                if(this.number_of_drawings_to_show_by_album[i]>this.list_drawings_onepage.length){
                  total+=this.list_drawings_onepage.length-old_value;
                }
                else{
                  let res=this.number_of_drawings_to_show_by_album[i]-old_value;
                  console.log('+ ' +res)
                  total+=this.number_of_drawings_to_show_by_album[i]-old_value;
                }
              }
              else if(i==1){
                console.log(this.number_of_drawings_to_show_by_album[i])
                console.log(this.list_drawings_artbook.length)
                console.log(old_value)
                if(this.number_of_drawings_to_show_by_album[i]>this.list_drawings_artbook.length){
                  total+=this.list_drawings_artbook.length-old_value;
                }
                else{
                  let res=this.number_of_drawings_to_show_by_album[i]-old_value;
                  console.log('+ ' +res)
                  total+=this.number_of_drawings_to_show_by_album[i]-old_value;
                }
              }
              else{
                console.log(this.number_of_drawings_to_show_by_album[i])
                console.log(this.list_albums_drawings[i-2])
                console.log(old_value)
                if(this.number_of_drawings_to_show_by_album[i]>this.list_albums_drawings[i-2].length){
                  total+=this.list_albums_drawings[i-2].length-old_value;
                }
                else{
                  let res=this.number_of_drawings_to_show_by_album[i]-old_value;
                  console.log('+ ' +res)
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
                console.log("prevent see more false")
                this.prevent_see_more=false;
              }
              this.number_of_drawings_variable=variable;
              this.detect_new_compteur_drawings=true;
              this.cd.detectChanges();
              console.log(this.number_of_drawings_variable)
              console.log(this.number_of_lines_drawings)
              console.log(this.compteur_drawings_thumbnails)
              console.log(this.total_for_new_compteur)
              console.log( this.number_of_drawings_to_show_by_album)
              console.log("update number of drawing end")
              /*$('.grid').masonry('reloadItems');
              this.cd.detectChanges();
              this.reload_masonry();
              this.cd.detectChanges();*/
              
            }
          }
        }
    }
    else{
      this.get_number_of_drawings_to_show()
    }
    
   
  }

  reset_number_of_drawings_to_show(){
    console.log("rest number of drawings")
    this.detect_new_compteur_drawings=false;
    this.total_for_new_compteur=0;
    this.updating_drawings_for_zoom=false;
    console.log(this.number_of_drawings_variable)
    console.log(this.opened_album)
    if(this.got_number_of_drawings_to_show){
      if(this.opened_album>0){
        this.compteur_number_of_drawings= this.number_of_drawings_variable*2;
      }
      else{
        this.compteur_number_of_drawings=this.number_of_drawings_variable;
       
      }

      this.number_of_drawings_to_show_by_album[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_album[1]=this.compteur_number_of_drawings;
      for(let i=0;i<this.list_titles_albums_drawings_added.length;i++){
        this.number_of_drawings_to_show_by_album[i+2]=this.compteur_number_of_drawings;
        
       
        
      }
      console.log(this.number_of_drawings_to_show_by_album)
    }
    else{
      this.get_number_of_drawings_to_show()
    }
    this.cd.detectChanges();
  }

  
  sendLoaded(event){
    console.log("load")
    if(!this.updating_drawings_for_zoom){
      this.compteur_drawings_thumbnails++;
      if(this.detect_new_compteur_drawings){
        console.log("detect_new_compteur_drawings")
        console.log(this.compteur_drawings_thumbnails + '/ '+ this.total_for_new_compteur)
        $('.grid').masonry('reloadItems');
        this.cd.detectChanges;
        if(this.compteur_drawings_thumbnails==this.total_for_new_compteur){
          this.detect_new_compteur_drawings=false;
          
          this.total_for_new_compteur=0;
          this.compteur_drawings_thumbnails=0;
          console.log("start reload after count end")
          this.reload_masonry();
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
            console.log(this.number_of_drawings_variable)
            console.log(this.number_of_lines_drawings)
            console.log(this.compteur_drawings_thumbnails)
            console.log(this.total_for_new_compteur)
            console.log( this.number_of_drawings_to_show_by_album)
            this.ini_masonry();
          }
        }
        if(this.opened_album==1){
          let total=this.list_drawings_onepage.slice(0,this.number_of_drawings_to_show_by_album[0]).length
          if(this.compteur_drawings_thumbnails==total){
            this.compteur_drawings_thumbnails=0;
            console.log(this.number_of_drawings_variable)
            console.log(this.number_of_lines_drawings)
            console.log(this.compteur_drawings_thumbnails)
            console.log(this.total_for_new_compteur)
            console.log( this.number_of_drawings_to_show_by_album)
            this.ini_masonry();
          }
        }
        if(this.opened_album==2){
          let total=this.list_drawings_artbook.slice(0,this.number_of_drawings_to_show_by_album[1]).length
          if(this.compteur_drawings_thumbnails==total){
            this.compteur_drawings_thumbnails=0;
            console.log(this.number_of_drawings_variable)
            console.log(this.number_of_lines_drawings)
            console.log(this.compteur_drawings_thumbnails)
            console.log(this.total_for_new_compteur)
            console.log( this.number_of_drawings_to_show_by_album)
            this.ini_masonry();
          }
        }
        if(this.opened_album>2){
          let total=this.list_albums_drawings[this.opened_album-3].slice(0,this.number_of_drawings_to_show_by_album[this.opened_album-1]).length;
          if(this.compteur_drawings_thumbnails==total){
            this.compteur_drawings_thumbnails=0;
            console.log(this.number_of_drawings_variable)
            console.log(this.number_of_lines_drawings)
            console.log(this.compteur_drawings_thumbnails)
            console.log(this.total_for_new_compteur)
            console.log( this.number_of_drawings_to_show_by_album)
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
/**********************************************DISplay writings thumbnails******************** */
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
    console.log("get number of writings to _show")
    let width=this.main_container.nativeElement.offsetWidth*0.9;
    console.log(width)
    if(this.list_albums_writings_added && !this.got_number_of_writings_to_show){
      console.log("in it")
      let n=Math.floor(width/250);
      if(n>3){
        this.number_of_writings_variable = (n<6)?n:6;
      }
      else{
        this.number_of_writings_variable = 6;
      }
      this.got_number_of_writings_to_show=true;
      this.number_of_lines_writings=1;
      
      
      this.compteur_number_of_writings= this.number_of_writings_variable*this.number_of_lines_writings;
      this.number_of_writings_to_show_by_album[0]=this.compteur_number_of_writings;
      console.log(this.list_titles_albums_writings_added.length)
      if(this.list_titles_albums_writings_added.length>0){
        for(let i=0;i<this.list_titles_albums_writings_added.length;i++){
          this.number_of_writings_to_show_by_album[i+1]=this.compteur_number_of_writings;
        }
      }
      
      this.display_writings_thumbnails=true;
      this.cd.detectChanges()
      console.log(this.list_albums_writings)
      console.log(this.list_writings)
      console.log(this.number_of_writings_to_show_by_album)
    }
  }

  update_number_of_writings_to_show(){
    if(this.got_number_of_writings_to_show){
      let width=this.main_container.nativeElement.offsetWidth*0.9;
      console.log(width)
      let variable;
      let n=Math.floor(width/250);
      if(n>3){
        variable= (n<6)?n:6;
      }
      else{
        variable = 6;
      }
      console.log(variable)
      console.log(this.number_of_writings_variable)
      if(variable!=this.number_of_writings_variable && variable>0){
        console.log(this.number_of_writings_variable)
        console.log(variable);
        for(let i=0;i<this.list_titles_albums_writings.length;i++){
         
          this.number_of_writings_to_show_by_album[i]/=this.number_of_writings_variable;
          this.number_of_writings_to_show_by_album[i]*=variable;
          
        }
        this.number_of_writings_variable=variable;
        console.log( this.number_of_writings_to_show_by_album)
        this.cd.detectChanges();
      }
    }
      
    
  }

  reset_number_of_writings_to_show(){
    console.log("rest number of writings")
    if(this.got_number_of_writings_to_show){
      if(this.opened_album>0){
        this.compteur_number_of_writings= this.number_of_writings_variable*2;
      }
      else{
        this.compteur_number_of_writings=this.number_of_writings_variable;
        
      }

      this.number_of_writings_to_show_by_album[0]=this.compteur_number_of_writings;
      for(let i=0;i<this.list_titles_albums_writings_added.length;i++){
        this.number_of_writings_to_show_by_album[i+1]=this.compteur_number_of_writings;
        
       
        
      }
      console.log(this.number_of_writings_to_show_by_album)
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

  check_if_artbook_public(id){
    for(let i=0;i<this.list_drawings_artbook.length;i++){
      if(this.list_drawings_artbook[i].drawing_id==id){
        return true;
      }
      else if(i==this.list_drawings_artbook.length-1){
        return false;
      }
    }
  }

  check_if_onepage_public(id){
    for(let i=0;i<this.list_drawings_onepage.length;i++){
      if(this.list_drawings_onepage[i].drawing_id==id){
        return true;
      }
      else if(i==this.list_drawings_onepage.length-1){
        return false;
      }
    }
  }

  check_if_drawing_public(item){
    
    if(item.pagesnumber >=0){
      return this.check_if_artbook_public(item.drawing_id)
    }
    else{
      return this.check_if_onepage_public(item.drawing_id)
    }
  }



  check_if_oneshot_public(id){
    for(let i=0;i<this.list_bd_oneshot.length;i++){
      if(this.list_bd_oneshot[i].bd_id==id){
        return true;
      }
      else if(i==this.list_bd_oneshot.length-1){
        return false;
      }
    }
  }

  check_if_serie_public(id){
    for(let i=0;i<this.list_bd_series.length;i++){
      if(this.list_bd_series[i].bd_id==id){
        return true;
      }
      else if(i==this.list_bd_series.length-1){
        return false;
      }
    }
  }

  check_if_comic_public(item){
    
    if(item.chaptersnumber >=0){
      return this.check_if_serie_public(item.bd_id)
    }
    else{
      return this.check_if_oneshot_public(item.bd_id)
    }
  }

  check_if_writing_public(item){
    let writing_id=item.writing_id;
    for(let i=0;i<this.list_writings.length;i++){
      if(this.list_writings[i].writing_id==writing_id){
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
      console.log("see_more_comics")
      if(album_section_number==0){
        this.number_of_comics_to_show_by_album[album_number]+=this.number_of_comics_variable*2;
      }
      else{
        this.number_of_comics_to_show_by_album[album_number]+=this.number_of_comics_variable*4;
      }
  
    
      console.log( this.number_of_comics_to_show_by_album);
      
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
      console.log("in see more drawings")
      console.log(this.list_drawings_onepage)
      console.log(this.number_of_drawings_to_show_by_album)
      this.prevent_shiny=true;
      this.cd.detectChanges();
      this.new_contents_loading=true;
      console.log("see_more_drawings");
      console.log(album_section_number)
      let num=this.number_of_drawings_to_show_by_album[album_number];
      console.log(num)
      //if(album_section_number==0){
        this.number_of_drawings_to_show_by_album[album_number]+=this.number_of_drawings_variable*2;
      /*}
      else{
        this.number_of_drawings_to_show_by_album[album_number]+=this.number_of_drawings_variable*4;
      }*/
  
      console.log( this.number_of_drawings_to_show_by_album);
      
      this.detect_new_compteur_drawings=true;
      if(album_number==0){
        console.log(this.list_drawings_onepage)
        console.log(this.total_for_new_compteur)
        console.log(this.number_of_drawings_to_show_by_album[album_number])
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_drawings_onepage.length){
          this.total_for_new_compteur=this.list_drawings_onepage.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
        /*if(this.opened_album>0){
          this.total_for_new_compteur+= this.total_for_new_compteur;
        }*/
        
      }
      else if(album_number==1){
        console.log(this.list_drawings_artbook)
        console.log(this.number_of_drawings_to_show_by_album[album_number])
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_drawings_artbook.length){
          this.total_for_new_compteur=this.list_drawings_artbook.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
        /*if(this.opened_album>0){
          this.total_for_new_compteur+= this.total_for_new_compteur;
        }*/
      }
      else{
        console.log(this.list_albums_drawings[album_number-2])
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_albums_drawings[album_number-2].length){
          this.total_for_new_compteur=this.list_albums_drawings[album_number-2].length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
        /*if(this.opened_album>0){
          this.total_for_new_compteur+= this.total_for_new_compteur;
        }*/
      }
      console.log(this.compteur_drawings_thumbnails)
      console.log( this.total_for_new_compteur)
      console.log("fin see more drawings")
      this.prevent_see_more=true;
      this.new_contents_loading=false;
      this.cd.detectChanges();
    }
    
  }



    /***********************************************see more writings*************************** */
/***********************************************see more writings*************************** */
/***********************************************see more writings*************************** */

see_more_writings(album_number,album_section_number){
  console.log(album_section_number)
  console.log(album_number)
  if(album_number==0 && this.number_of_writings_to_show_by_album[album_number]>=this.list_writings.length){
    return
  }
  if(album_number>0 && this.number_of_writings_to_show_by_album[album_number]>=this.list_albums_writings[album_number-1].length){
     return
  } 
  else{
    this.new_contents_loading=true;
    console.log("see_more_writings");
    let num=this.number_of_writings_to_show_by_album[album_number]
    if(album_section_number==0){
      this.number_of_writings_to_show_by_album[album_number]+=this.number_of_writings_variable*2;
    }
    else{
      this.number_of_writings_to_show_by_album[album_number]+=this.number_of_writings_variable*4;
    }

    console.log( this.number_of_writings_to_show_by_album);
    this.cd.detectChanges();
  }
  
}


block_user(){
  console.log(this.user_id);
  if(this.user_id>3){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, 
        text:"Etes-vous sûr de vouloir bloquer cet utilisateur ? "},
        panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
          this.Subscribing_service.remove_all_subscribtions_both_sides(this.user_id).subscribe(s=>{
            console.log(s)
            this.chatService.remove_friend(this.user_id).subscribe(m=>{
              console.log(m);
              console.log(m[0].date)
              this.Profile_Edition_Service.block_user(this.user_id,(m[0].date)?(m[0].date):null).subscribe(r=>{
                console.log(r);
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
                console.log("send usr blocked")
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
  this.Profile_Edition_Service.unblock_user(this.user_id).subscribe(r=>{
    console.log(r[0]);
    if(r[0].date){
      console.log(r[0].date)
      this.chatService.add_chat_friend(this.user_id,r[0].date).subscribe(r=>{
        console.log(r[0])
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
  this.Reports_service.check_if_content_reported('account',this.user_id,"unknown",0).subscribe(r=>{
    console.log(r[0])
    if(r[0].nothing){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:true, text:'Vous ne pouvez pas signaler deux fois le même compte'},
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
    console.log([this.user_id]);
    console.log(this.list_of_stories)
    if(this.story_found){
      const dialogRef = this.dialog.open(PopupStoriesComponent, {
        data: { for_account:true, list_of_users: [this.user_id], index_id_of_user: 0, list_of_data:this.list_of_stories,current_user:this.visitor_id,current_user_name:this.visitor_name},
        panelClass: 'popupStoriesClass'
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log("closed");
        console.log(result.list_of_users_to_end);
        let list_to_end = result.list_of_users_to_end;
        if(list_to_end.length>0){
            this.story_state=false;
        }
        if(result.event=="end-swiper"){
          this.story_state=false;
        }
        console.log(this.story_state)
      })
    }
  }


}



