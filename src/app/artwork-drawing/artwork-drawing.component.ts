import { Component, OnInit, Input, HostListener, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Community_recommendation } from '../services/recommendations.service';
import { Reports_service } from '../services/reports.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { NotationService } from '../services/notation.service';
import { Subscribing_service } from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import { PopupFormDrawingComponent } from '../popup-form-drawing/popup-form-drawing.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupLikesAndLovesComponent } from '../popup-likes-and-loves/popup-likes-and-loves.component';
import { Meta, Title } from '@angular/platform-browser';
import {NotificationsService} from '../services/notifications.service';
import { ChatService} from '../services/chat.service';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { Location } from '@angular/common';

import { PopupEditCoverComponent } from '../popup-edit-cover/popup-edit-cover.component';
import { PopupCommentsComponent } from '../popup-comments/popup-comments.component';
import { PopupArtworkDataComponent } from '../popup-artwork-data/popup-artwork-data.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { merge, fromEvent } from 'rxjs';
import { LoginComponent } from '../login/login.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { first } from 'rxjs/operators';

declare var Swiper: any;
declare var $: any;


@Component({
  selector: 'app-artwork-drawing',
  templateUrl: './artwork-drawing.component.html',
  styleUrls: ['./artwork-drawing.component.scss'],
  animations: [
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({transform: 'translateY(0)', opacity: 1}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 0}))
        ])
      ],
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
    trigger(
      'enterFromLeftAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromRightAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ],
    ),
  ],
})
export class ArtworkDrawingComponent implements OnInit {


  constructor(
    private Reports_service:Reports_service,
    private rd: Renderer2,
    private meta_title: Title,
    private meta: Meta,
    public navbar: NavbarService,
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    public route :ActivatedRoute,
    private location:Location,
    private activatedRoute: ActivatedRoute,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd: ChangeDetectorRef,
    private router:Router,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private deviceService: DeviceDetectorService,
    private Subscribing_service:Subscribing_service,
    private Community_recommendation:Community_recommendation,
    public dialog: MatDialog,
    private NotationService:NotationService,

    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      };
      
  
    this.thumbnails = false;
    this.zoom_mode = false;
    this.fullscreen_mode = false;
    this.navbar.setActiveSection(-1);
    this.navbar.show();

  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.add_time_of_view();
  }

  ngOnDestroy(): void {
    if(!this.drawing_id_input){
      this.navbar.show_help();
    }
    this.meta_title.setTitle('LinkArts – Collaboration éditoriale');
    this.meta.updateTag({ name: 'description', content: "Bienvenue sur LinkArts, le site web dédié à la collaboration éditorale, pour les artistes et les éditeurs." });
  }
  
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.add_time_of_view();
  }
 

  @ViewChild('artwork') artwork:ElementRef;
  @ViewChild('close') close:ElementRef;

  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.drawing_id_input && !this.in_other_popup){
      if (!(this.artwork.nativeElement.contains(btn)) && this.can_check_clickout && !(this.close.nativeElement.contains(btn))){
        if(this.drawing_id_input  && !btn.className.baseVal && btn.className.includes("cdk-overlay-dark-backdrop")){
          this.add_time_of_view();
          this.emit_close_click.emit(true);
        }
         
      }
      this.can_check_clickout=true;
    }
      
  }



  close_popup(){
    if(this.drawing_id_input){
      this.emit_close.emit(true);
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if(this.drawing_id_input){
      this.add_time_of_view();
      this.emit_close.emit(true);
    }
  }

  @ViewChild('leftContainer') leftContainer:ElementRef;
  @ViewChild('swiperWrapper') swiperWrapperRef:ElementRef;
  @ViewChild('swiperContainer') swiperContainerRef:ElementRef;
  @ViewChildren('swiperSlide') swiperSlides:QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailsRef:QueryList<ElementRef>;



  //display component
  pp_loaded=false;
  display_pages=false;
  display_writings_recommendations=false;
  display_comics_recommendations=false;
  display_drawings_recommendations=false;
  display_drawings:any[]=[];
  display_drawings_recommendations_others=false;
  //if user doesn't have an account
  type_of_account:string;
  type_of_account_retrieved=false;
   //archives
   content_archived=false;
   archive_retrieved=false;
  //Swiper
  swiper: any;
  //Thumbnails
  thumbnails: boolean;
  thumbnails_links: any[] = [];
  //Zoom mode
  zoom_mode: boolean;
  //Fullscreen mode
  fullscreen_mode: boolean;
  
  recommendation_index:number;


  //0 : description, 1 : comments
  category_index: number = 0;
  //Liked or/and loved contents
  liked: boolean=false;
  like_in_progress=false;
  loved:boolean=false;
  love_in_progress=false;
  type:string;

 
  drawing_id:number;
  viewsnumber:number;
  commentariesnumber:number;
  highlight:string;
  title:string;
  style:string;
  monetization:string;
  firsttag:string;
  secondtag:string;
  thirdtag:string;
  pagesnumber:number;

  list_drawing_pages:any[]=[];
  drawing_one_shot:SafeUrl;
  pseudo:string='';
  authorid:number=0;
  user_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  lovesnumber:number;
  list_of_loves:any;
  likesnumber:number;
  list_of_likes:any;
  status:string;
  date_upload_to_show:string;
  date_upload:string;

  begining_time_of_view:number=Math.trunc( new Date().getTime()/1000);
  id_view_created:number;
  already_subscribed:boolean=false;
  visitor_id:number;
  visitor_name:string;
  visitor_status:string;
  mode_visiteur=true;
  mode_visiteur_added=false;

  list_of_author_recommendations_drawings:any[]=[];
  list_of_author_recommendations_drawings_retrieved=false;
  list_of_author_recommendations_retrieved=false;

  list_of_recommendations_by_tag:any[]=[];
  list_of_recommendations_by_tag_retrieved=false;
  
  now_in_seconds= Math.trunc( new Date().getTime()/1000);

  content_emphasized=false;

  //for list of loves and likes
  list_of_users_ids_loves:any[]=[];
  list_of_users_ids_likes:any[]=[];
  
  list_of_users_ids_loves_retrieved=false;
  list_of_users_ids_likes_retrieved=false;

  visible:boolean = false;

  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  number_of_comments_to_show:number=10;
  page_not_found=false;
  profile_data_retrieved=false;
  emphasized_contend_retrieved=false;
  subscribtion_retrieved=false;
  likes_retrieved_but_not_checked=false;
  ready_to_check_view=false;
  loves_retrieved_but_not_checked=false;
  current_user_retrieved=false;

  first_comment='';
  first_comment_retrieved=false;
  pp_first_comment:any;

  item_retrieved=false;
  url='https://www.linkarts.fr';
  can_check_clickout=false;
  @Input() drawing_format_input: string;
  @Input() drawing_id_input: number;
  @Input() drawing_title_input: string;
  @Output() emit_close = new EventEmitter<boolean>();
  @Output() emit_close_click = new EventEmitter<boolean>();
  
  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  device_info='';
  in_other_popup=false;
  ngOnInit() {
    
    this.navbar.hide_help();

    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    window.scroll(0,0);

    this.type = this.drawing_format_input?this.drawing_format_input:this.activatedRoute.snapshot.paramMap.get('format');
    if( this.type != "one-shot" && this.type != "artbook" ) {
      this.page_not_found=true;
      return
    }
    this.drawing_id = this.drawing_id_input?this.drawing_id_input:parseInt(this.activatedRoute.snapshot.paramMap.get('drawing_id'));
    if(!(this.drawing_id>0)){
      this.page_not_found=true;
      return
    }
    
    this.Profile_Edition_Service.get_current_user().pipe(first() ).subscribe(l=>{
      this.visitor_id = l[0].id;
      this.visitor_name=l[0].nickname;
      this.visitor_status=l[0].status;
      this.type_of_account=l[0].status;
      this.type_of_account_retrieved=true;
      this.current_user_retrieved=true;
      
      if (this.type=="one-shot"){
        this.one_shot_check_view_after_current();
        this.check_loves_after_current();
        this.check_likes_after_current();
      }
      else{
        this.artbook_check_view_after_current();
        this.check_loves_after_current();
        this.check_likes_after_current();
      }
    }) 
    
    if (this.type =="one-shot"){
      
      this.Drawings_Onepage_Service.retrieve_drawing_information_by_id2(this.drawing_id).pipe(first() ).subscribe(m => {
        if(m[0]){
          let r=m[0].data;
          if(!r[0] || r[0].status=="deleted" || r[0].status=="suspended" || (r[0].authorid!=m[0].current_user && r[0].status!="public")){
            if(r[0] && r[0].status=="deleted"){
              this.navbar.delete_research_from_navbar("Drawing",this.type,this.drawing_id).pipe(first() ).subscribe(r=>{
                this.page_not_found=true;
                this.cd.detectChanges()
                return
              });
            }
            else{
              this.page_not_found=true;
              this.cd.detectChanges()
              return
            }
          }
          else{
            let title =this.drawing_title_input?this.drawing_title_input:this.activatedRoute.snapshot.paramMap.get('title');
            if(r[0].title !=title ){
              this.page_not_found=true;
              return;
            }
            else{
              
              this.check_archive();
              this.drawing_one_shot_calls(r);
            }
          }
        }
       
      })
    }

    else if (this.type =="artbook"){
      
      this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id2(this.drawing_id).pipe(first() ).subscribe(m => {
        if(m[0]){
          let r=m[0].data;
          if(!r[0] || r[0].status=="deleted" || r[0].status=="suspended" || (r[0].authorid!=m[0].current_user && r[0].status!="public")){
            if(r[0] && r[0].status=="deleted"){
              this.navbar.delete_research_from_navbar("Drawing",this.type,this.drawing_id).pipe(first() ).subscribe(r=>{
                this.page_not_found=true;
                this.cd.detectChanges()
                return
              });
            }
            else{
              this.page_not_found=true;
              this.cd.detectChanges()
              return
            }
           
          }
          else{
            let title =this.drawing_title_input?this.drawing_title_input:this.activatedRoute.snapshot.paramMap.get('title');
            if(r[0].title !=title ){
              this.page_not_found=true;
              return
            }
            else{
              this.check_archive();
              this.drawing_artbook_calls(r);
            }
          }
        }
        
      })
    }
    
  }

  onScrollComments(){
    if( this.commentariesnumber && this.number_of_comments_to_show<this.commentariesnumber && this.myScrollContainer && this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.7){
        this.number_of_comments_to_show+=10;
    }
  }

  check_archive(){
    this.Subscribing_service.check_if_publication_archived("drawings",this.type ,this.drawing_id).pipe(first() ).subscribe(r=>{
      if(r[0].value){
        this.content_archived=true;
      }
      this.archive_retrieved=true;
    })
  }

  drawing_one_shot_calls(r){
      let drawing_name=r[0].drawing_name;
      this.authorid= r[0].authorid;
      this.list_of_reporters=r[0].list_of_reporters;
      this.highlight=r[0].highlight;
      this.title=r[0].title;
      this.style=r[0].category;
      this.monetization=r[0].monetization
      this.firsttag=r[0].firsttag;
      this.secondtag=r[0].secondtag;
      this.likesnumber =r[0].likesnumber ;
      this.lovesnumber =r[0].lovesnumber ;
      this.thirdtag=r[0].thirdtag;
      this.pagesnumber=r[0].pagesnumber;
      this.status=r[0].status;
      let title_url=this.title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
      this.navbar.add_page_visited_to_history(`/artwork-drawing/one-shot/${this.title}/${this.drawing_id}`,this.device_info).pipe(first() ).subscribe();
      this.location.go(`/artwork-drawing/one-shot/${title_url}/${this.drawing_id}`);
      this.url=`https://www.linkarts.fr/artwork-drawing/one-shot/${title_url}/${this.drawing_id}`;
      this.location_done=true;
      this.date_upload_to_show =get_date_to_show( date_in_seconds(this.now_in_seconds,r[0].createdAt) );


      this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).pipe(first() ).subscribe(r=>{
        this.pseudo = r[0].nickname;
        this.user_name = r[0].firstname;
        this.primary_description=r[0].primary_description;
        this.meta_title.setTitle(`Œuvre LinkArts – ${this.title}`);
        this.meta.updateTag({ name: 'description', content: `Découvrer le dessins de @${this.user_name}.` });
        this.type_of_account_checked=r[0].type_of_account_checked;
        this.certified_account=r[0].certified_account;
        this.profile_data_retrieved=true;
      });

      this.Profile_Edition_Service.get_emphasized_content(r[0].authorid).pipe(first() ).subscribe(l=>{
        if (l[0]!=null && l[0]!=undefined){
          if (l[0].publication_id==this.drawing_id && l[0].publication_category=="drawing" && l[0].format==this.type){
            this.content_emphasized=true;
          }
        }
        this.emphasized_contend_retrieved=true;
      });
      

      

      this.Subscribing_service.check_if_visitor_susbcribed(r[0].authorid).pipe(first() ).subscribe(information=>{
        if(information[0].value){
          this.already_subscribed=true;
        }
        this.subscribtion_retrieved=true;
      });

      

      this.NotationService.get_content_marks("drawing", 'one-shot', this.drawing_id,0).pipe(first() ).subscribe(r=>{
        //views and comments
        this.commentariesnumber=r[0].list_of_comments.length;
        this.viewsnumber= r[0].list_of_views.length;
        //loves
        this.list_of_loves= r[0].list_of_loves;
        this.lovesnumber=this.list_of_loves.length;
        if (this.list_of_loves.length != 0){
          this.loves_retrieved_but_not_checked=true;
          this.check_loves_after_current();
        }
        else{
          this.list_of_users_ids_loves_retrieved=true;
        }

        //likes
        this.list_of_likes= r[0].list_of_likes;
        this.likesnumber=this.list_of_likes.length;
        if (this.list_of_likes.length != 0){
          this.likes_retrieved_but_not_checked=true;
          this.check_likes_after_current();
        }
        else{
          this.list_of_users_ids_likes_retrieved=true;
        }
      })
   
      

      this.Drawings_Onepage_Service.retrieve_drawing_page(drawing_name,window.innerWidth).pipe(first() ).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.drawing_one_shot=SafeURL;
      });

      this.Profile_Edition_Service.retrieve_profile_picture( r[0].authorid).pipe(first() ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
        
      });

      this.Subscribing_service.check_if_visitor_susbcribed(this.authorid).pipe(first() ).subscribe(information=>{
        if(information[0].value){
          this.already_subscribed=true;
        }
      });  
      this.ready_to_check_view=true;
      this.one_shot_check_view_after_current()

      this.get_author_recommendations();
      this.get_recommendations_by_tag();
    
      this.item_retrieved=true;
  }


  one_shot_check_view_after_current(){
    if(this.current_user_retrieved && this.ready_to_check_view){
      if (this.authorid ==this.visitor_id){
        this.mode_visiteur = false;
        if(this.status=="public"){
          this.navbar.check_if_research_exists("Drawing",this.type,this.drawing_id,this.title,"clicked").pipe(first() ).subscribe(p=>{
            if(!p[0].value){
              this.navbar.add_main_research_to_history("Drawing",this.type,this.drawing_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag,this.visitor_status).pipe(first() ).subscribe();
            }
          })
        }
       
      }
      else{
        this.navbar.add_main_research_to_history("Drawing",this.type,this.drawing_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag,this.visitor_status).pipe(first() ).subscribe();
        this.NotationService.add_view('drawing', 'one-shot',this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
          this.id_view_created = r[0].id;
          if(r[0].id>0){
            this.Community_recommendation.delete_recommendations_cookies();
            this.Community_recommendation.generate_recommendations().pipe(first() ).subscribe(r=>{})
          }
        });
               
      };
      this.mode_visiteur_added = true;
    }
 
  }


  /******************************************* ARTBOOKS CALLS ******************************************/
  /******************************************* ARTBOOKS CALLS ******************************************/
  /******************************************* ARTBOOKS CALLS ******************************************/
  /******************************************* ARTBOOKS CALLS ******************************************/



  location_done=false;
  drawing_artbook_calls(r){
      this.authorid= r[0].authorid;
      this.list_of_reporters=r[0].list_of_reporters;
      this.highlight=r[0].highlight;
      this.title=r[0].title;
      this.style=r[0].category;
      this.monetization=r[0].monetization
      this.firsttag=r[0].firsttag;
      this.secondtag=r[0].secondtag;
      this.likesnumber =r[0].likesnumber ;
      this.lovesnumber =r[0].lovesnumber ;
      this.thirdtag=r[0].thirdtag;
      this.pagesnumber=r[0].pagesnumber;
      this.status=r[0].status;
      let title_url=this.title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
      this.navbar.add_page_visited_to_history(`/artwork-drawing/artbook/${this.title}/${this.drawing_id}`,this.device_info).pipe(first() ).subscribe();
      this.location.go(`/artwork-drawing/artbook/${title_url}/${this.drawing_id}`);
      this.url=`https://www.linkarts.fr/artwork-drawing/artbook/${title_url}/${this.drawing_id}`;
      this.location_done=true;
      this.date_upload_to_show = get_date_to_show( date_in_seconds(this.now_in_seconds,r[0].createdAt) );

      
      this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).pipe(first() ).subscribe(r=>{
        this.pseudo = r[0].nickname;
        this.user_name = r[0].firstname;
        this.primary_description=r[0].primary_description;
        
        this.type_of_account_checked=r[0].type_of_account_checked;
        this.certified_account=r[0].certified_account;
        this.meta_title.setTitle(`Œuvre LinkArts – ${this.title}`);
        this.meta.updateTag({ name: 'description', content: `Découvrer l'artbook de @${this.user_name}.` });
      });

      this.Subscribing_service.check_if_visitor_susbcribed(this.authorid).pipe(first() ).subscribe(information=>{
        if(information[0].value){
          this.already_subscribed=true;
        }
        this.subscribtion_retrieved=true;
      }); 

      this.Profile_Edition_Service.get_emphasized_content(r[0].authorid).pipe(first() ).subscribe(l=>{
        if (l[0]!=null && l[0]!=undefined){
          if (l[0].publication_id==this.drawing_id && l[0].publication_category=="drawing" && l[0].format==this.type){
            this.content_emphasized=true;
          }
        }
      });

      this.Profile_Edition_Service.retrieve_profile_picture( r[0].authorid).pipe(first() ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
        
      });

      this.get_author_recommendations()
      this.get_recommendations_by_tag();
      this.ready_to_check_view=true;
      this.artbook_check_view_after_current();
      
      
      this.NotationService.get_content_marks("drawing", 'artbook', this.drawing_id,0).pipe(first() ).subscribe(r=>{
        //views and comments
        this.commentariesnumber=r[0].list_of_comments.length;
        this.viewsnumber= r[0].list_of_views.length;
        //loves
        this.list_of_loves= r[0].list_of_loves;
        this.lovesnumber=this.list_of_loves.length;
        if (this.list_of_loves.length != 0){
          this.loves_retrieved_but_not_checked=true;
          this.check_loves_after_current();
        }
        else{
          this.list_of_users_ids_loves_retrieved=true;
        }

        //likes
        this.list_of_likes= r[0].list_of_likes;
        this.likesnumber=this.list_of_likes.length;
        if (this.list_of_likes.length != 0){
          this.likes_retrieved_but_not_checked=true;
          this.check_likes_after_current();
        }
        else{
          this.list_of_users_ids_likes_retrieved=true;
        }
      })
      

      this.get_drawing_artbook_pages(this.drawing_id,r[0].pagesnumber);

  }


  get_better_quality_drawing(drawing_id,page){
    this.Drawings_Artbook_Service.retrieve_drawing_page_ofartbook(drawing_id,page,window.innerWidth).pipe(first() ).subscribe(r=>{
      let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
      this.list_drawing_pages[page]=url;
    });
  }


  get_drawing_artbook_pages(drawing_id,total_pages) {
    
    for( var i=0; i< total_pages; i++ ) {
      this.Drawings_Artbook_Service.retrieve_drawing_page_ofartbook_miniature(drawing_id,i).pipe(first() ).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
        this.list_drawing_pages[r[1]]=url;
      });
    };

    this.item_retrieved=true;
    this.cd.detectChanges();
    this.initialize_swiper();
    this.display_pages=true;

  }


  check_likes_after_current(){
    if(this.current_user_retrieved && this.likes_retrieved_but_not_checked){
      for (let i=0;i<this.list_of_likes.length;i++){
        this.list_of_users_ids_likes.push(this.list_of_likes[i].author_id_who_likes);
        if (this.list_of_likes[i].author_id_who_likes == this.visitor_id){
          this.liked = true;
        }
      }
      this.list_of_users_ids_likes_retrieved=true;
    }
  }

  check_loves_after_current(){
    if(this.current_user_retrieved && this.loves_retrieved_but_not_checked){
      for (let i=0;i<this.list_of_loves.length;i++){
        this.list_of_users_ids_loves.push(this.list_of_loves[i].author_id_who_loves);
        if (this.list_of_loves[i].author_id_who_loves == this.visitor_id){
          this.loved = true;
        }
      }
      this.list_of_users_ids_loves_retrieved=true;
    }
  }

  artbook_check_view_after_current(){
    if(this.current_user_retrieved && this.ready_to_check_view){
        if (this.authorid == this.visitor_id){
          this.mode_visiteur = false;
          if(this.status=="public"){
            this.navbar.check_if_research_exists("Drawing",this.type,this.drawing_id,this.title,"clicked").pipe(first() ).subscribe(p=>{
              if(!p[0].value){
                this.navbar.add_main_research_to_history("Drawing",this.type,this.drawing_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag, this.visitor_status).pipe(first() ).subscribe();
              }
            })
          }
           
        }
        else{
          this.navbar.add_main_research_to_history("Drawing",this.type,this.drawing_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag,this.visitor_status).pipe(first() ).subscribe();
          this.NotationService.add_view('drawing', 'artbook',this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
            this.id_view_created = r[0].id;
            if(r[0].id>0){
              this.Community_recommendation.delete_recommendations_cookies();
              this.Community_recommendation.generate_recommendations().pipe(first() ).subscribe(r=>{})
            }
          });
                  
        };

        this.mode_visiteur_added=true;
    }
  }




  /********************************************** RECOMMENDATIONS **************************************/
  /********************************************** RECOMMENDATIONS **************************************/
  /********************************************** RECOMMENDATIONS **************************************/

  get_author_recommendations(){
 
    this.Community_recommendation.get_drawings_recommendations_by_author(this.authorid,this.drawing_id).pipe(first() ).subscribe(e=>{
      if(e[0].list_to_send.length >0){
        for(let j=0;j<e[0].list_to_send.length;j++){
          if(e[0].list_to_send[j].length>0){
            this.list_of_author_recommendations_drawings.push(e[0].list_to_send[j])
          }
        }
        
      }
      else{
        this.left_container_category_index=1;
      }
      this.list_of_author_recommendations_drawings_retrieved=true;

      this.list_of_author_recommendations_retrieved=true;
    })
  }


  first_propositions_retrieved=false;
  second_propositions_retrieved=false;
  second_propositions=[];
  first_propositions=[];
  get_recommendations_by_tag(){

    
    this.Community_recommendation.get_artwork_recommendations_by_tag('Drawing',this.type,this.drawing_id,this.style,this.firsttag,6).pipe(first() ).subscribe(u=>{
      if(u[0].length>0){
        let list_of_first_propositions=u[0];
        this.first_propositions=u[0];
        if(list_of_first_propositions.length<6 && this.secondtag){
          this.first_propositions_retrieved=true;
          check_all(this);
        }
        else{
          this.get_recommendations_by_tags_contents(list_of_first_propositions)
        }
      }
      else{
        this.list_of_recommendations_by_tag_retrieved=true;
      }
      
    })

    this.Community_recommendation.get_artwork_recommendations_by_tag('Drawing',this.type,this.drawing_id,this.style,this.secondtag,6).pipe(first() ).subscribe(r=>{
      
      this.second_propositions_retrieved=true;
      this.second_propositions=r[0];
      check_all(this)
    
    })


    function check_all(THIS){
      
      if(THIS.second_propositions_retrieved && THIS.first_propositions_retrieved){
        if(THIS.second_propositions.length>0){
         
          let len=THIS.first_propositions.length;
          for(let j=0;j<THIS.second_propositions.length;j++){
            let ok=true;
            for(let k=0;k<len;k++){
              if(THIS.first_propositions[k].format==THIS.second_propositions[j].format && THIS.first_propositions[k].target_id==THIS.second_propositions[j].target_id){
                ok=false;
              }
            }
            if(ok){
              THIS.first_propositions.push(THIS.second_propositions[j])
            }
          }
          THIS.get_recommendations_by_tags_contents( THIS.first_propositions)
        
        }
        else{
          THIS.get_recommendations_by_tags_contents( THIS.first_propositions)
        }

       
      }
    }
  }

  get_recommendations_by_tags_contents(list_of_first_propositions){
    let len=list_of_first_propositions.length;
    for(let i=0;i<len;i++){
      if(list_of_first_propositions[len-i-1].format==this.type && list_of_first_propositions[len-i-1].target_id==this.drawing_id){
        list_of_first_propositions.splice(len-i-1,1);
      }
    }
    let compteur_propositions=0;
    if(list_of_first_propositions.length>0){
      for(let i=0;i<list_of_first_propositions.length;i++){
        if(list_of_first_propositions[i].format=="artbook"){
          this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(list_of_first_propositions[i].target_id).pipe(first() ).subscribe(comic=>{
            
            if(comic[0].status=="public"){
              this.list_of_recommendations_by_tag.push(comic[0]);
            }
            compteur_propositions++;
            if(compteur_propositions==list_of_first_propositions.length){
              this.list_of_recommendations_by_tag_retrieved=true;
            }
          })
        }
        else{
          this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(list_of_first_propositions[i].target_id).pipe(first() ).subscribe(comic=>{
            if(comic[0].status=="public"){
              this.list_of_recommendations_by_tag.push(comic[0]);
            }
            compteur_propositions++;
            if(compteur_propositions==list_of_first_propositions.length){
              this.list_of_recommendations_by_tag_retrieved=true;
            }
          })
        }
        
      }
    }
    else{
      this.list_of_recommendations_by_tag_retrieved=true;
    }
        
      
  }

  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */

  

  show_icon=false;
  ngAfterViewInit(){
    
    this.open_category(0);
  }



  /******************************************************* */
  /******************* LEFT CONTROLLER ******************* */
  /******************************************************* */

 
  type_of_account_checked:boolean;
  certified_account:boolean;  

  optionOpened:number = -1;
  openOption(i: number) {
    this.optionOpened = i;
  }

  open_account() {
    return "/account/"+this.pseudo;
  };
  get_link() {
    return "/main-research/styles/tags/1/Drawing/" + this.style + "/all";
  };
  get_style_link(i: number) {
    if( i == 0 ) {
      return "/main-research/styles/tags/1/Drawing/" + this.style + "/" + this.firsttag;
    }
    if( i == 1 ) {
      return "/main-research/styles/tags/1/Drawing/" + this.style + "/" + this.secondtag;
    }
    if( i == 2 ) {
      return "/main-research/styles/tags/1/Drawing/" + this.style + "/" + this.thirdtag;
    }
  }

  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    
    if( event.target.innerWidth != this.actualWidth ) {
      this.openOption(-1);
    }
    this.actualHeight = event.target.innerHeight;
    this.actualWidth = event.target.innerWidth;

    if(this.full_compt==1){
      this.full_compt=2;
    }
    else if(this.full_compt==2){
      this.full_compt=0;
      this.fullscreen_mode = false;
    }
  }


  // Actual space available in navigator
  actualHeight = window.innerHeight;
  actualWidth = window.innerWidth;
  
  see_description() {
    this.in_other_popup=true;
    let dialogRef= this.dialog.open(PopupArtworkDataComponent, {
      data: {
        title:this.title,
        highlight:this.highlight,
        category:'Drawing',
        style:this.style,
        type:this.type,
        firsttag:this.firsttag,
        secondtag:this.secondtag,
        thirdtag:this.thirdtag,
      }, 
      panelClass: 'popupArtworkDataClass',
    });
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      this.in_other_popup=false;
      if(!result){
        this.add_time_of_view();
        this.emit_close_click.emit(true);
      }
    })

  }

  see_comments() {
    this.in_other_popup=true;
    let dialogRef= this.dialog.open(PopupCommentsComponent, {
      data: {
        visitor_id:this.visitor_id,
        visitor_name:this.visitor_name,
        visitor_mode:this.mode_visiteur,
        type_of_account:this.type_of_account,
        title:this.title,
        category:'drawing',
        format:this.type,
        style:this.style,
        publication_id:this.drawing_id,
        chapter_number:0,
        authorid:this.authorid,
        number_of_comments_to_show:this.number_of_comments_to_show
      }, 
      panelClass: 'popupCommentsClass',
    });
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      this.in_other_popup=false;
      if(!result){
        this.add_time_of_view();
        this.emit_close_click.emit(true);
      }
    })

  }

  after_click_comment(event){
    this.add_time_of_view()
    this.close_popup();
  }

  open_chat_link() {
    this.add_time_of_view()
    this.close_popup();
    this.router.navigateByUrl('/chat/'+ this.pseudo +'/'+ this.authorid);
  }

  initialize_swiper() {

    var THIS = this;

    if( this.swiper ) {
      this.swiper.update();
      return;
    }

    this.swiper = new Swiper( this.swiperContainerRef.nativeElement, {
      speed: 500,
      spaceBetween: 100,
      simulateTouch: true,
      preloadImages: false,
      lazy: {
        loadOnTransitionStart: true,
        checkInView:true,
      },
      watchSlidesVisibility:true,
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      pagination: {
        el: '.swiper-pagination',
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      keyboard: {
        enabled: true,
      },
      observer: true,
      on: {
        observerUpdate: function () {
          THIS.refresh_swiper_pagination();
          window.dispatchEvent(new Event("resize"));
        },
        slideChange: function () {
          THIS.refresh_swiper_pagination();
          THIS.cd.detectChanges();
        }
      },
    });
    
    this.refresh_swiper_pagination();
    $(".top-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSlide( $(".top-container .pages-controller-container input").val() );
      }
    });

    this.cd.detectChanges();
    
  }


  refresh_swiper_pagination() {
    if( this.swiper ) {
      if( this.swiper.slides ) {
        $(".top-container .pages-controller-container input").val( this.swiper.activeIndex + 1 );
      }
    }
  }

  
  open_category(i : number) {
    this.category_index=i;
  }


  left_container_category_index: number = 0;
  open_left_container_category(i : number) {
    if(i==1){
      this.display_drawings_recommendations=false;
      this.display_comics_recommendations=false;
      this.display_writings_recommendations=false;
    }
    else{
      this.display_drawings_recommendations_others=false;
    }
    this.left_container_category_index=i;
  }



  initialize_thumbnails() {

    if( this.type =='artbook' ) {
      for( var i=0; i< this.list_drawing_pages.length; i++ ) {
        this.thumbnails_links.push( this.list_drawing_pages[i] );
      }
    }

  }

  
  setSlide(i : any) {
    if( isNaN(i) ) {
      this.refresh_swiper_pagination();
      return;
    }
    else if ( (Number(i)<1) || (Number(i)> this.swiper.slides.length) ) {
      this.refresh_swiper_pagination();
      return;
    }
    else {
      this.swiper.slideTo( Number(i) - 1 );
    }
  }

  

  @ViewChild('ThumbnailContainer') private ThumbnailContainer: ElementRef;
  scroll:any;
  click_thumbnails() {


    if( !this.thumbnails_links.length ) {
      this.initialize_thumbnails();
    }

    if( !this.thumbnails ) {
      this.rd.setStyle( this.swiperContainerRef.nativeElement, "width", "calc( 100% - 190px )");
      this.cd.detectChanges();
      this.swiper.update();
      this.thumbnails=true;
    }
    else {
      this.rd.setStyle( this.swiperContainerRef.nativeElement, "width", "calc( 100% )");
      this.cd.detectChanges();
      this.swiper.update();
      this.thumbnails=false;
    }

    this.cd.detectChanges();
    setInterval(() => {
      if(this.ThumbnailContainer){
        this.scroll = merge(
          fromEvent(window, 'scroll'),
          fromEvent(this.ThumbnailContainer.nativeElement, 'scroll'),
        );
      }
    },1000)

  }

  thumbnails_loaded=[];
  load_thumbnails(i){
    this.thumbnails_loaded[i]=true;
  }
  
  onRightClick() {
    return false;
  }

  zoom_button() {
    this.zoom_mode = !this.zoom_mode;
    let THIS = this;
    
    if(this.zoom_mode) {
      document.querySelectorAll('img.slide-container-img').forEach( function(e) {
        THIS.rd.setStyle(e, "max-width", (e as HTMLImageElement).naturalWidth * 1.3 + "px");
      });
    }
    if(!this.zoom_mode) {
      document.querySelectorAll('img.slide-container-img').forEach( function(e) {
        THIS.rd.setStyle(e, "max-width", "100%");
      });
    }
  }



  full_compt=0;
  fullscreen_button() {
    window.dispatchEvent(new Event('resize'));

  

    const elem = this.leftContainer.nativeElement;
    if( !this.fullscreen_mode ) {
      this.full_compt=1;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
        this.fullscreen_mode = true;
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
        this.fullscreen_mode = true;
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
        this.fullscreen_mode = true;
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
        this.fullscreen_mode = true;
      }

    }
    else {
      this.full_compt=0;
      document.exitFullscreen();
      this.fullscreen_mode = false;
    }
  }





  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


  

  /******************************************************* */
  /******************************************************* */
  /****************** RIGHT CONTROLLER ******************* */
  /******************************************************* */
  /******************************************************* */
  from_like=false;
  from_love=false;
  click_like() {
    if(this.type_of_account=="account"){
      if(this.like_in_progress || this.love_in_progress){
        return
      }
      if(this.loved && !this.from_love){
        this.from_like=true;
        this.click_love();
        this.from_like=false;
        return;
      }
      if(this.list_of_users_ids_likes_retrieved){
        this.like_in_progress=true;
        if(this.liked) {     
          this.liked=false;
          this.likesnumber-=1;
          if(this.type=='one-shot'){
            this.NotationService.remove_like('drawing', 'one-shot', this.style, this.drawing_id,0).pipe(first() ).subscribe(r=>{
              let index=this.list_of_users_ids_likes.indexOf(this.visitor_id);
              this.list_of_users_ids_likes.splice(index,1);
              if(this.authorid==this.visitor_id){
              
                this.like_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_like','drawing','one-shot',this.drawing_id,0,false,0).pipe(first() ).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"publication_like",
                    id_user_name:this.visitor_name,
                    id_user:this.visitor_id, 
                    id_receiver:this.authorid, 
                    publication_category:'drawing',
                    format:'one-shot',
                    publication_id:this.drawing_id,
                    chapter_number:0,
                    information:"remove",
                    status:"unchecked",
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.chatService.messages.next(message_to_send);
                  this.like_in_progress=false;
                  this.cd.detectChanges();
                })
              }
            
            });
          }
          else if(this.type=='artbook'){      
            this.NotationService.remove_like('drawing', 'artbook', this.style, this.drawing_id,0).pipe(first() ).subscribe(r=>{      
              let index=this.list_of_users_ids_likes.indexOf(this.visitor_id);
              this.list_of_users_ids_likes.splice(index,1);
            
              if(this.authorid==this.visitor_id){
                this.like_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_like','drawing','artbook',this.drawing_id,0,false,0).pipe(first() ).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"publication_like",
                    id_user_name:this.visitor_name,
                    id_user:this.visitor_id, 
                    id_receiver:this.authorid, 
                    publication_category:'drawing',
                    format:'artbook',
                    publication_id:this.drawing_id,
                    chapter_number:0,
                    information:"remove",
                    status:"unchecked",
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.chatService.messages.next(message_to_send);
                  this.like_in_progress=false;
                  this.cd.detectChanges();
                })
              }
            
            });
          }
        }
        else {
          this.liked=true;
          this.likesnumber+=1;
          if(this.type=='one-shot'){  
            this.NotationService.add_like('drawing', 'one-shot', this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{        
              if(!r[0].error){
                this.list_of_users_ids_likes.splice(0,0,this.visitor_id)
              
                if(this.authorid==this.visitor_id){
                  
                  this.like_in_progress=false;
                  this.cd.detectChanges();
                }
                else{
                  this.NotificationsService.add_notification('publication_like',this.visitor_id,this.visitor_name,this.authorid,'drawing',this.title,'one-shot',this.drawing_id,0,"add",false,0).pipe(first() ).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"publication_like",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:'drawing',
                      publication_name:this.title,
                      format:'one-shot',
                      publication_id:this.drawing_id,
                      chapter_number:0,
                      information:"add",
                      status:"unchecked",
                      is_comment_answer:false,
                      comment_id:0,
                    }
                    this.chatService.messages.next(message_to_send);
                    this.like_in_progress=false;
                    this.cd.detectChanges();
                  })
                }
              }
              else{
                this.liked=false;
                this.likesnumber-=1;
                if(r[0].error="loved"){
                  this.in_other_popup=true;
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous ne pouvez pas aimer et adorer la même œuvre"},
                  });
                  dialogRef.afterClosed().pipe(first() ).subscribe(result => {
                    this.in_other_popup=false;
                  })
                }
                else if(r[0].error="already_liked"){
                  this.in_other_popup=true;
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous avez déjà aimé cette œuvre"},
                  });
                  dialogRef.afterClosed().pipe(first() ).subscribe(result => {
                    this.in_other_popup=false;
                  })
                }
                this.like_in_progress=false;
              }
             
              
            });
          }
          else if(this.type=='artbook'){
            
            this.NotationService.add_like('drawing', 'artbook', this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
              if(!r[0].error){
                this.list_of_users_ids_likes.splice(0,0,this.visitor_id)
                if(this.authorid==this.visitor_id){
                  this.like_in_progress=false;
                  this.cd.detectChanges();
                }
                else{
                  this.NotificationsService.add_notification('publication_like',this.visitor_id,this.visitor_name,this.authorid,'drawing',this.title,'artbook',this.drawing_id,0,"add",false,0).pipe(first() ).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"publication_like",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:'drawing',
                      publication_name:this.title,
                      format:'artbook',
                      publication_id:this.drawing_id,
                      chapter_number:0,
                      information:"add",
                      status:"unchecked",
                      is_comment_answer:false,
                      comment_id:0,
                    }
                    this.chatService.messages.next(message_to_send);
                    this.like_in_progress=false;
                    this.cd.detectChanges();
                  })
                }
              }
              else{
                this.liked=false;
                this.likesnumber-=1;
                if(r[0].error="loved"){
                  this.in_other_popup=true;
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous ne pouvez pas aimer et adorer la même œuvre"},
                  });
                  dialogRef.afterClosed().pipe(first() ).subscribe(result => {
                    this.in_other_popup=false;
                  })
                }
                else if(r[0].error="already_liked"){
                  this.in_other_popup=true;
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous avez déjà aimé cette œuvre"},
                  });
                  dialogRef.afterClosed().pipe(first() ).subscribe(result => {
                    this.in_other_popup=false;
                  })
                }
                this.like_in_progress=false;
              }
               
            });
          }
        }
      }
      
      

    }
    else{
      this.in_other_popup=true;
      const dialogRef = this.dialog.open(LoginComponent, {
        data: {usage:"login"},
        panelClass:"loginComponentClass"
      });
      dialogRef.afterClosed().pipe(first() ).subscribe(result => {
        this.in_other_popup=false;
      })
    }
    
  }

  click_love() {
    if(this.type_of_account=="account"){
      if(this.love_in_progress || this.like_in_progress){
        return
      }
      if(this.liked && !this.from_like){
        this.from_love=true;
        this.click_like();
        this.from_love=false;
        return
      }
      if(this.list_of_users_ids_loves_retrieved){
        this.love_in_progress=true;
        if(this.loved) {     
          this.loved=false;
          this.lovesnumber-=1;
          if(this.type=='one-shot'){
            this.NotationService.remove_love('drawing', 'one-shot', this.style, this.drawing_id,0).pipe(first() ).subscribe(r=>{
              let index=this.list_of_users_ids_loves.indexOf(this.visitor_id);
              this.list_of_users_ids_loves.splice(index,1);
            
              if(this.authorid==this.visitor_id){
                
                this.love_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_love','drawing','one-shot',this.drawing_id,0,false,0).pipe(first() ).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"publication_love",
                    id_user_name:this.visitor_name,
                    id_user:this.visitor_id, 
                    id_receiver:this.authorid, 
                    publication_category:'drawing',
                    format:'one-shot',
                    publication_id:this.drawing_id,
                    chapter_number:0,
                    information:"remove",
                    status:"unchecked",
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.chatService.messages.next(message_to_send);
                  this.love_in_progress=false;
                  this.cd.detectChanges();
                })
              }
            });
          }
          else if(this.type=='artbook'){      
            this.NotationService.remove_love('drawing', 'artbook', this.style, this.drawing_id,0).pipe(first() ).subscribe(r=>{      
              let index=this.list_of_users_ids_loves.indexOf(this.visitor_id);
              this.list_of_users_ids_loves.splice(index,1);
              if(this.authorid==this.visitor_id){
                this.love_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_love','drawing','artbook',this.drawing_id,0,false,0).pipe(first() ).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"publication_love",
                    id_user_name:this.visitor_name,
                    id_user:this.visitor_id, 
                    id_receiver:this.authorid, 
                    publication_category:'drawing',
                    format:'artbook',
                    publication_id:this.drawing_id,
                    chapter_number:0,
                    information:"remove",
                    status:"unchecked",
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.chatService.messages.next(message_to_send);
                  this.love_in_progress=false;
                  this.cd.detectChanges();
                })
              }
            
            });
          }
        }
        else {
          this.loved=true;
          this.lovesnumber+=1;
          if(this.type=='one-shot'){  
            this.NotationService.add_love('drawing', 'one-shot', this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{        
              if(!r[0].error){
                this.list_of_users_ids_loves.splice(0,0,this.visitor_id);
                if(this.authorid==this.visitor_id){
                  
                  this.love_in_progress=false; 
                  this.cd.detectChanges();
                }
                else{
                  this.NotificationsService.add_notification('publication_love',this.visitor_id,this.visitor_name,this.authorid,'drawing',this.title,'one-shot',this.drawing_id,0,"add",false,0).pipe(first() ).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"publication_love",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:'drawing',
                      publication_name:this.title,
                      format:'one-shot',
                      publication_id:this.drawing_id,
                      chapter_number:0,
                      information:"add",
                      status:"unchecked",
                      is_comment_answer:false,
                      comment_id:0,
                    }
                    this.chatService.messages.next(message_to_send);
                    this.love_in_progress=false; 
                    this.cd.detectChanges();
                  }) 
                }
              }
              else{
                this.loved=false;
                this.lovesnumber-=1;
                if(r[0].error="liked"){
                  this.in_other_popup=true;
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous ne pouvez pas aimer et adorer la même œuvre"},
                  });
                  dialogRef.afterClosed().pipe(first() ).subscribe(result => {
                    this.in_other_popup=false;
                  })
                }
                else if(r[0].error="already_loved"){
                  this.in_other_popup=true;
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous avez déjà adoré cette œuvre"},
                  });
                  dialogRef.afterClosed().pipe(first() ).subscribe(result => {
                    this.in_other_popup=false;
                  })
                }
                this.love_in_progress=false;
              }
              
              
              
            });
          }
          else if(this.type=='artbook'){
          
            this.NotationService.add_love('drawing', 'artbook', this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
              if(!r[0].error){
                this.list_of_users_ids_loves.splice(0,0,this.visitor_id)
                            
                if(this.authorid==this.visitor_id){
                  this.love_in_progress=false; 
                  this.cd.detectChanges();
                }
                else{
                  this.NotificationsService.add_notification('publication_love',this.visitor_id,this.visitor_name,this.authorid,'drawing',this.title,'artbook',this.drawing_id,0,"add",false,0).pipe(first() ).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"publication_love",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:'drawing',
                      publication_name:this.title,
                      format:'artbook',
                      publication_id:this.drawing_id,
                      chapter_number:0,
                      information:"add",
                      status:"unchecked",
                      is_comment_answer:false,
                      comment_id:0,
                    }
                    this.chatService.messages.next(message_to_send);
                    this.love_in_progress=false; 
                    this.cd.detectChanges();
                  }) 
                } 
              }
              else{
                this.loved=false;
                this.lovesnumber-=1;
                if(r[0].error="liked"){
                  this.in_other_popup=true;
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous ne pouvez pas aimer et adorer la même œuvre"},
                  });
                  dialogRef.afterClosed().pipe(first() ).subscribe(result => {
                    this.in_other_popup=false;
                  })
                }
                else if(r[0].error="already_loved"){
                  this.in_other_popup=true;
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous avez déjà adoré cette œuvre"},
                  });
                  dialogRef.afterClosed().pipe(first() ).subscribe(result => {
                    this.in_other_popup=false;
                  })
                }
                this.love_in_progress=false;
              }
              
              
              
            });
          }
        }
      }
      
    }
    else{
      this.in_other_popup=true;
      const dialogRef = this.dialog.open(LoginComponent, {
        data: {usage:"login"},
        panelClass:"loginComponentClass"
      });
      dialogRef.afterClosed().pipe(first() ).subscribe(result => {
        this.in_other_popup=false;
      })
    }

  }

  show_likes(){
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"likes", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_likes,visitor_name:this.visitor_name,visitor_id:this.visitor_id},
      panelClass: 'popupLikesAndLovesClass',
    });
  
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      this.in_other_popup=false;
      if(!result){
        this.add_time_of_view();
        this.emit_close_click.emit(true);
      }
    })
  }

  show_loves(){
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"loves", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_loves,visitor_name:this.visitor_name,visitor_id:this.visitor_id},
      panelClass: 'popupLikesAndLovesClass',
    });
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      this.in_other_popup=false;
      if(!result){
        this.add_time_of_view();
        this.emit_close_click.emit(true);
      }
    })
  }

  scroll_to_comments() {
    document.getElementById("scrollToComments").scrollIntoView();
    this.open_category(1);
  }

  new_comment() {
    this.commentariesnumber ++;
    this.cd.detectChanges();
  }

  removed_comment() {
    this.commentariesnumber --;
  }
  
  add_time_of_view(){
    if(this.mode_visiteur){
      let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - this.begining_time_of_view;
      if(this.type=='one-shot' && this.id_view_created>0 && ending_time_of_view>5){
        this.NotationService.add_view_time(ending_time_of_view, this.id_view_created).pipe(first() ).subscribe(r=>{
        });
      }
      if(this.type=='artbook' && this.id_view_created>0  && ending_time_of_view>5){
        this.NotationService.add_view_time(ending_time_of_view, this.id_view_created).pipe(first() ).subscribe(r=>{
        });
      }
    }

  }

  loading_subscribtion=false;
  subscribtion(){
    if(this.type_of_account=='account' ){
      if(this.loading_subscribtion){
        return
      }
      this.loading_subscribtion=true;
      if(!this.already_subscribed){
        this.already_subscribed=true;
        this.Subscribing_service.subscribe_to_a_user(this.authorid).pipe(first() ).subscribe(information=>{
          if(information[0].subscribtion){
            this.loading_subscribtion=false;
            this.cd.detectChanges();
          }
          else if(information[0].blocked){
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Impossible de s'abonner à cet utilisateur."},
              panelClass: "popupConfirmationClass",
            });
            this.already_subscribed=false;
            this.loading_subscribtion=false;
          }
          else{
            this.NotificationsService.add_notification('subscribtion',this.visitor_id,this.visitor_name,this.authorid,this.authorid.toString(),'none','none',this.visitor_id,0,"add",false,0).pipe(first() ).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"subscribtion",
                id_user_name:this.visitor_name,
                id_user:this.visitor_id, 
                id_receiver:this.authorid,
                publication_category:this.authorid.toString(),
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
        this.Subscribing_service.remove_subscribtion(this.authorid).pipe(first() ).subscribe(information=>{
          this.NotificationsService.remove_notification('subscribtion',this.authorid.toString(),'none',this.visitor_id,0,false,0).pipe(first() ).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"subscribtion",
              id_user_name:this.visitor_name,
              id_user:this.visitor_id, 
              id_receiver:this.authorid,
              publication_category:this.authorid.toString(),
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
      this.in_other_popup=true;
      const dialogRef = this.dialog.open(LoginComponent, {
        data: {usage:"login"},
        panelClass:"loginComponentClass"
      });
      dialogRef.afterClosed().pipe(first() ).subscribe(result => {
        this.in_other_popup=false;
      })
    }
  
  }

  archive(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    this.Subscribing_service.archive("drawings",this.type,this.drawing_id).pipe(first() ).subscribe(r=>{
      this.content_archived=true;
      this.archive_loading=false;
    });
  }

  unarchive(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    this.Subscribing_service.unarchive("drawings",this.type,this.drawing_id).pipe(first() ).subscribe(r=>{
      this.content_archived=false;
      this.archive_loading=false;
    });
  }

  checking_report=false;
  report(){
    if(this.checking_report){
      return
    }
    this.checking_report=true;
    this.Reports_service.check_if_content_reported('drawing',this.drawing_id,this.type,0).pipe(first() ).subscribe(r=>{
      if(r[0].nothing){
        this.in_other_popup=true;
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
        });
        dialogRef.afterClosed().pipe(first() ).subscribe(result => {
          this.in_other_popup=false;
        })
      }
      else{
        this.in_other_popup=true;
        const dialogRef = this.dialog.open(PopupReportComponent, {
          data: {from_account:false,id_receiver:this.authorid,publication_category:'drawing',publication_id:this.drawing_id,format:this.type,chapter_number:0},
          panelClass:"popupReportClass"
        });
        dialogRef.afterClosed().pipe(first() ).subscribe(result => {
          this.in_other_popup=false;
        })
      }
      this.checking_report=false;
    })
    
  }
  list_of_reporters:any;
  cancel_report(){

    let id=this.drawing_id
    this.Reports_service.cancel_report("drawing",id,this.type).pipe(first() ).subscribe(r=>{
      if(this.list_of_reporters && this.list_of_reporters.indexOf(this.visitor_id)>=0){
        let i=this.list_of_reporters.indexOf(this.visitor_id)
        this.list_of_reporters.splice(i,1)
        this.cd.detectChanges()
      }
    })
  }

  emphasize(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    this.Profile_Edition_Service.emphasize_content("drawing",this.type,this.drawing_id).pipe(first() ).subscribe(r=>{
      this.content_emphasized=true;
      this.archive_loading=false;
    });
  }

  remove_emphasizing(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    this.Profile_Edition_Service.remove_emphasizing("drawing",this.type,this.drawing_id).pipe(first() ).subscribe(t=>{
      this.content_emphasized=false;
      this.archive_loading=false;
    });
  }

  profile_picture_loaded(){
    this.pp_loaded=true;
  }

  a_drawing_is_loaded(i){
    this.display_drawings[i]=true;
    this.initialize_swiper();
    if(i==0){
      this.get_new_page(this.swiper.activeIndex);
      if(this.type!="one-shot"){
        this.pre_load_other_pages()
      }
     
    }
  }

  pre_load_other_pages(){
    if(this.pagesnumber>1){
      let interval = setInterval(() => {
        for(let i=1;i<this.pagesnumber;i++){
          //this.get_new_page(i)
          let interval2 = setInterval(() => {
            this.get_new_page(i)
            clearInterval(interval2)
          },100)
        }
        clearInterval(interval)
      },2000)
    }
    
    
   
  }

  list_of_real_pages_retrieved=[];
  get_new_page(swiper_page){
      if(!this.list_of_real_pages_retrieved[swiper_page] && swiper_page>=0 ){
        this.list_of_real_pages_retrieved[swiper_page]=true;
        this.Drawings_Artbook_Service.retrieve_drawing_page_ofartbook(this.drawing_id,swiper_page,window.innerWidth).pipe(first() ).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
          this.list_drawing_pages[swiper_page]=url;
        });
      }
  }

    /******************************************************************** */
  /****VARIABLES ET FONCTIONS D'EDITION******************************** */
  /******************************************************************** */
  //visible : true ou privé : false
 
  edit_information() {
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupFormDrawingComponent, {
      data: {
        format:this.type, 
        drawing_id: this.drawing_id, 
        title: this.title, 
        highlight:this.highlight, 
        style:this.style, 
        firsttag:this.firsttag,
        secondtag:this.secondtag, 
        thirdtag:this.thirdtag,
        author_name: this.user_name,
        primary_description: this.primary_description, 
        profile_picture: this.profile_picture
      },
      panelClass: 'popupFormDrawingClass',
    });
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      this.in_other_popup=false;
    })
  }



  archive_loading=false;
  set_private() {
    this.in_other_popup=true
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir archiver cette œuvre ? Elle ne sera visible que par vous dans les archives.'},
      panelClass: "popupConfirmationClass",
    });
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      if( result ) {
        if( result ) {
          if(this.type=="one-shot"){
            this.Subscribing_service.change_content_status("drawing",this.type,this.drawing_id,"private").pipe(first() ).subscribe(r=>{
              this.Drawings_Onepage_Service.change_oneshot_drawing_status(this.drawing_id,"private").pipe(first() ).subscribe(r=>{
                this.status="private";
                this.archive_loading=false;
              });
            })
           
          }
          else{
            this.Subscribing_service.change_content_status("drawing",this.type,this.drawing_id,"private").pipe(first() ).subscribe(r=>{
              this.Drawings_Artbook_Service.change_artbook_drawing_status(this.drawing_id,"private").pipe(first() ).subscribe(r=>{
                this.status="private";
                this.archive_loading=false;
              });
            })
            
          }
            
        }

      }
      else{
        this.archive_loading=false;
      }
      this.in_other_popup=false;
    });
  }
  set_public() {
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir désarchiver cette œuvre ? Elle sera visible par tous les utilisateurs.'},
      panelClass: "popupConfirmationClass",
    });
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      if( result ) {
        if(this.type=="one-shot"){
          this.Subscribing_service.change_content_status("drawing",this.type,this.drawing_id,"ok").pipe(first() ).subscribe(r=>{
            this.Drawings_Onepage_Service.change_oneshot_drawing_status(this.drawing_id,"public").pipe(first() ).subscribe(r=>{
              this.status="public";
              this.archive_loading=false;
            });
          })
          
        }
        else{
          this.Subscribing_service.change_content_status("drawing",this.type,this.drawing_id,"ok").pipe(first() ).subscribe(r=>{
            this.Drawings_Artbook_Service.change_artbook_drawing_status(this.drawing_id,"public").pipe(first() ).subscribe(r=>{
              this.status="public";
              this.archive_loading=false;
            });
          })
         
        }
          
      }
      else{
        this.archive_loading=false;
      }
      this.in_other_popup=false;
    });
  }

  remove_artwork() {
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer cette œuvre ? Toutes les données associées seront définitivement supprimées'},
      panelClass: "popupConfirmationClass",
    });
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      if( result ) {
        if(this.type=="one-shot"){
          this.navbar.delete_publication_from_research("Drawing",this.type,this.drawing_id).pipe(first() ).subscribe(r=>{
            this.Drawings_Onepage_Service.remove_drawing_from_sql(this.drawing_id).pipe(first() ).subscribe(r=>{
              this.NotificationsService.remove_notification('add_publication','drawing',this.type,this.drawing_id,0,false,0).pipe(first() ).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"add_publication",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  publication_category:'drawing',
                  format:this.type,
                  publication_id:this.drawing_id,
                  chapter_number:0,
                  information:"remove",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.archive_loading=false;
                this.chatService.messages.next(message_to_send);
                this.close_popup();
                this.location.go(`/account/${this.pseudo}`);
                location.reload()
                return;
              })
            });
            
          })
          
        }
        else{
          this.navbar.delete_publication_from_research("Drawing",this.type,this.drawing_id).pipe(first() ).subscribe(r=>{
            this.Drawings_Artbook_Service.RemoveDrawingArtbook(this.drawing_id).pipe(first() ).subscribe(r=>{
              this.NotificationsService.remove_notification('add_publication','drawing',this.type,this.drawing_id,0,false,0).pipe(first() ).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"add_publication",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  publication_category:'drawing',
                  format:this.type,
                  publication_id:this.drawing_id,
                  chapter_number:0,
                  information:"remove",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.archive_loading=false;
                this.chatService.messages.next(message_to_send);
                this.close_popup();
                this.location.go(`/account/${this.pseudo}`);
                location.reload()
                return;
              })
            });
            
          })
        }

      }
      else{
        this.archive_loading=false;
      }
      this.in_other_popup=false;
    });
  }


  
  first_comment_received(e){
    this.first_comment=e.comment.commentary;
    this.Profile_Edition_Service.retrieve_profile_picture(e.comment.author_id_who_comments).pipe(first() ).subscribe(p=> {
      let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.pp_first_comment= SafeURL;
    })
    this.first_comment_retrieved=true;
  }

  first_comment_pp_loaded=false;
  load_first_comment_pp(){
    this.first_comment_pp_loaded=true;
  }
  add_share_history(category){
    this.navbar.add_page_visited_to_history(`/artwork-drawing-share/${this.type}/${this.title}/${this.drawing_id}/${category}`,this.device_info).pipe(first() ).subscribe();
  }


  get_edit_thumbnail(){
    return 'add-artwork/edit-drawing-thumbnail/' + this.drawing_id + '/' + this.type;
  }

  edit_thumbnail() {
    this.navbar.add_page_visited_to_history(`add-artwork/edit-drawing-thumbnail/${this.drawing_id}/${this.type}`,this.device_info).pipe(first() ).subscribe();
  }


  add_pages_artbook(){
    return `/add-artwork/add-content/drawing/artbook/${this.drawing_id}`
  }
}


