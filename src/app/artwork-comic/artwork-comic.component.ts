import { Component, OnInit, Input, HostListener, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {Router, ActivatedRoute} from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Community_recommendation } from '../services/recommendations.service'
import { NotationService } from '../services/notation.service';
import { Reports_service } from '../services/reports.service';
import {NotificationsService} from '../services/notifications.service';
import { ChatService} from '../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import { PopupFormComicComponent } from '../popup-form-comic/popup-form-comic.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupLikesAndLovesComponent } from '../popup-likes-and-loves/popup-likes-and-loves.component';
import { FormControl, FormGroup } from '@angular/forms';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { Location } from '@angular/common';
import { PopupEditCoverComponent } from '../popup-edit-cover/popup-edit-cover.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { merge, fromEvent } from 'rxjs';
import { PopupCommentsComponent } from '../popup-comments/popup-comments.component';
import { PopupArtworkDataComponent } from '../popup-artwork-data/popup-artwork-data.component';
import { LoginComponent } from '../login/login.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Meta, Title } from '@angular/platform-browser';

import { first } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

declare var Swiper: any;
declare var $: any;




@Component({
  selector: 'app-artwork-comic',
  templateUrl: './artwork-comic.component.html',
  styleUrls: ['./artwork-comic.component.scss'],
  
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
export class ArtworkComicComponent implements OnInit {


  constructor(
    private Reports_service:Reports_service,
    private rd: Renderer2,
    private meta_title: Title,
    private meta: Meta,
    public navbar: NavbarService,
    public route :ActivatedRoute,
    private location:Location,
    private activatedRoute: ActivatedRoute,
    private NotationService:NotationService,
    private BdOneShotService:BdOneShotService,
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd: ChangeDetectorRef,
    private router:Router,
    private BdSerieService:BdSerieService,
    private Subscribing_service:Subscribing_service,
    private deviceService: DeviceDetectorService,
    public dialog: MatDialog,
    private Community_recommendation:Community_recommendation,
    private NotificationsService:NotificationsService,
    private chatService:ChatService,
    
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
  
    if(!this.bd_id_input){
      this.navbar.show_help();
    }
    this.meta_title.setTitle('LinkArts – Collaboration éditoriale');
    this.meta.updateTag({ name: 'description', content: "Bienvenue sur LinkArts, le site web dédié à la collaboration éditorale, pour les artistes et les éditeurs." });
  }
  
  @ViewChild('artwork') artwork:ElementRef;
  @ViewChild('close') close:ElementRef;

  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.bd_id_input && !this.in_other_popup){
      if (!(this.artwork.nativeElement.contains(btn)) && this.can_check_clickout && !(this.close.nativeElement.contains(btn))){
        if(this.bd_id_input && !btn.className.baseVal && btn.className.includes("cdk-overlay-dark-backdrop")){
          this.add_time_of_view();
          this.emit_close_click.emit(true);
        }
      }
      this.can_check_clickout=true;
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.add_time_of_view();
  }

  close_popup(){
    if(this.bd_id_input){
      this.emit_close.emit(true);
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if(this.bd_id_input){
      this.add_time_of_view();
      this.emit_close.emit(true);
    }
 
  }
  
  @ViewChild('leftContainer') leftContainer:ElementRef;
  @ViewChild('swiperWrapper') swiperWrapperRef:ElementRef;
  @ViewChild('swiperContainer') swiperContainerRef:ElementRef;
  @ViewChildren('swiperSlide') swiperSlide:QueryList<ElementRef>;
  @ViewChildren('Webtoons') webtoons:QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailsRef:QueryList<ElementRef>;

 
  //display component
  sumo_ready=false
  display_right_container=false;
  pp_loaded=false;
  display_pages=false;
  display_comics_recommendations=false;
  display_comics_pages:any[]=[];
  display_comics_recommendations_others=false;
  type_of_account:string;
  type_of_account_retrieved=false;
  content_archived=false;
  archive_retrieved=false;
  swiper: any;
  thumbnails: boolean;
  thumbnails_links: any[] = [];
  zoom_mode: boolean;
  fullscreen_mode: boolean;
  //0 : description, 1 : comments
  category_index: number = 0;
  recommendation_index: number = 0;
  liked: boolean=false;
  like_in_progress=false;
  loved:boolean=false;
  love_in_progress=false;
  type:string;
  now_in_seconds= Math.trunc( new Date().getTime()/1000);
  list_of_users_ids_loves:any[]=[];
  list_of_users_ids_likes:any[]=[];
  list_of_users_ids_likes_retrieved=false;
  list_of_users_ids_loves_retrieved=false;
  chapter_to_check_for_view:number;

  chapterList:any[]=[];
  list_of_pages_by_chapter:any[]=[['']];
  show_pages:any[]=[];
  current_chapter=0;
  current_chapter_title='';
  pseudo:string='';
  authorid:number=0;
  bd_id:number;
  viewsnumber:number;
  commentariesnumber:number;
  highlight:string;
  title:string;
  style:string;
  monetization:string;
  list_of_reporters:any;
  firsttag:string;
  secondtag:string;
  thirdtag:string;
  pagesnumber:number;
  list_bd_pages:any[]=[];
  status:string;
  user_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  lovesnumber:number;
  list_of_loves:any;
  likesnumber:number;
  list_of_likes:any;
  thumbnail_color:string;

  date_upload_to_show:string;
  date_upload:string;
  begining_time_of_view:number=Math.trunc( new Date().getTime()/1000);
  id_view_created:number;
  already_subscribed:boolean=false;
  visitor_id:number;
  visitor_name:string;
  visitor_status:string;
  mode_visiteur=true;
  mode_visiteur_added = false;
  subscribtion_retrieved=false;

  list_of_author_recommendations_comics:any[]=[];
  list_of_author_recommendations_comics_retrieved=false;
  list_of_author_recommendations_retrieved=false;

  list_of_recommendations_by_tag:any[]=[];
  list_of_recommendations_by_tag_retrieved=false;

  content_emphasized=false;
  type_of_comic_retrieved=false;

  active_section=1;
  chapter_name_group:FormGroup;
  chapter_name_control: FormControl;
  chapter_name_to_show:string;
  chapter_filter_bottom_to_top=true;

  thumbnail_picture_retrieved=false;
  thumbnail_picture:string;
  
  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  number_of_comments_to_show=10;

  page_not_found=false;
  profile_data_retrieved=false;
  emphasized_contend_retrieved=false;
  likes_retrieved_but_not_checked=false;
  ready_to_check_view=false;
  loves_retrieved_but_not_checked=false;
  current_user_retrieved=false;


  first_comment='';
  first_comment_retrieved=false;
  pp_first_comment:any;
  item_retrieved=false;


  //input popup
  can_check_clickout=false;
  @Input() bd_format_input: string;
  @Input() bd_id_input: number;
  @Input() bd_title_input: string;
  @Output() emit_close = new EventEmitter<boolean>();
  @Output() emit_close_click = new EventEmitter<boolean>();
  
  location_done=false;
  url='https://www.linkarts.fr';
  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  device_info='';
  ngOnInit() {
    this.navbar.hide_help();

    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    window.scroll(0,0);

    this.type = this.bd_format_input?this.bd_format_input:this.activatedRoute.snapshot.paramMap.get('format');
    this.type_of_comic_retrieved=true;
    if( this.type != "one-shot" && this.type != "serie") {
      this.page_not_found=true;
      return 
    }

    this.bd_id = this.bd_id_input?this.bd_id_input:parseInt(this.activatedRoute.snapshot.paramMap.get('bd_id'));
    if(!(this.bd_id>0)){
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
        this.check_loves_after_current_one_shot();
        this.check_likes_after_current_one_shot();
      }
      else{
        this.serie_check_view_after_current();
        this.check_loves_after_current_serie();
        this.check_likes_after_current_serie();
      }
    }) 
   
    if (this.type=="one-shot"){
      this.bd_one_shot_calls();
    }

    else if (this.type=="serie"){

      this.chapter_name_control = new FormControl('');
      this.chapter_name_group = new FormGroup({
        chapter_name_control: this.chapter_name_control,
      });
      
     
      this.active_section = this.bd_id_input?1:this.route.snapshot.data['section'];
      if(this.active_section==2){
        this.current_chapter=parseInt(this.activatedRoute.snapshot.paramMap.get('chapter_number')) -1;
      }
      this.BdSerieService.retrieve_bd_by_id2(this.bd_id).pipe(first() ).subscribe(m => { 
        
        if(m[0]){
          let r=m[0].data;
          if(!r[0] || r[0].chaptersnumber<this.current_chapter+1 || this.type!='serie' || r[0].status=="deleted" || r[0].status=="suspended" || (r[0].authorid!=m[0].current_user && r[0].status!="public")){
            if(r[0] && r[0].status=="deleted"){
              this.navbar.delete_research_from_navbar("Comic",this.type,this.bd_id).pipe(first() ).subscribe(r=>{
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
            
            let title =this.bd_title_input?this.bd_title_input:this.activatedRoute.snapshot.paramMap.get('title');
            if(r[0].title !=title || typeof(title)!='string'){
              this.page_not_found=true;
              return
            }
            else{
             
              this.check_archive();
              this.highlight=r[0].highlight;
              this.title=r[0].title;
              this.authorid=r[0].authorid;
              this.list_of_reporters=r[0].list_of_reporters
              this.style=r[0].category;
              this.firsttag=r[0].firsttag;
              this.secondtag=r[0].secondtag;
              this.thirdtag=r[0].thirdtag;
              this.thumbnail_color=r[0].thumbnail_color;
              this.status=r[0].status
              this.thumbnail_picture=r[0].name_coverpage;
              this.thumbnail_picture_retrieved=true;
              this.monetization=r[0].monetization;
              let title_url=this.title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
              this.navbar.add_page_visited_to_history(`/artwork-comic/${this.type}/${title}/${this.bd_id}/${this.current_chapter + 1}`,this.device_info).pipe(first() ).subscribe();
              this.location.go(`/artwork-comic/${this.type}/${title_url}/${this.bd_id}/${this.current_chapter + 1}`);
              this.url=`https://www.linkarts.fr/artwork-comic/${this.type}/${title_url}/${this.bd_id}/${this.current_chapter + 1}`;
              this.location_done=true;

              this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).pipe(first() ).subscribe(r=>{
                this.pseudo = r[0].nickname;
                this.type_of_account_checked=r[0].type_of_account_checked;
                this.certified_account=r[0].certified_account;
                this.user_name = r[0].firstname;
                this.primary_description=r[0].primary_description;
                this.profile_data_retrieved=true;

                this.meta_title.setTitle(`Œuvre LinkArts – ${this.title}`);
                this.meta.updateTag({ name: 'description', content: `Découvrer la bande dessinée, de la catégorie ${this.style}, de @${this.user_name}.` });
              });

              this.Profile_Edition_Service.get_emphasized_content(r[0].authorid).pipe(first() ).subscribe(l=>{
                if (l[0]!=null && l[0]!=undefined){
                  if (l[0].publication_id==this.bd_id && l[0].publication_category== "comic" && l[0].format==this.type){
                    this.content_emphasized=true;
                  }
                }
                this.emphasized_contend_retrieved=true;
              });
              this.bd_serie_calls();
              this.get_author_recommendations();
              this.get_recommendations_by_tag();
              
              

              
            }
          }
        }
        
        
      });
    }
    
  }

  onScrollComments(){
    if( this.commentariesnumber && this.number_of_comments_to_show<this.commentariesnumber && this.myScrollContainer && this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.7){
        this.number_of_comments_to_show+=10;
    }
  }

  /********************************************** RECOMMENDATIONS **************************************/
  /********************************************** RECOMMENDATIONS **************************************/
  /********************************************** RECOMMENDATIONS **************************************/

  get_author_recommendations(){
    this.Community_recommendation.get_comics_recommendations_by_author(this.authorid,this.bd_id).pipe(first() ).subscribe(e=>{
      if(e[0].list_to_send.length>0){
        for(let j=0;j<e[0].list_to_send.length;j++){
          if(e[0].list_to_send[j].length>0){
            this.list_of_author_recommendations_comics.push(e[0].list_to_send[j])
          }
        } 
      }
      else{
        this.left_container_category_index=1;
      }
      
      this.list_of_author_recommendations_comics_retrieved=true;
      this.list_of_author_recommendations_retrieved=true;
      
    })
  }

  first_propositions_retrieved=false;
  second_propositions_retrieved=false;
  second_propositions=[];
  first_propositions=[];




  get_recommendations_by_tag(){

    
    this.Community_recommendation.get_artwork_recommendations_by_tag('Comic',this.type,this.bd_id,this.style,this.firsttag,6).pipe(first() ).subscribe(u=>{
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

    this.Community_recommendation.get_artwork_recommendations_by_tag('Comic',this.type,this.bd_id,this.style,this.secondtag,6).pipe(first() ).subscribe(r=>{
      
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
      if(list_of_first_propositions[len-i-1].format==this.type && list_of_first_propositions[len-i-1].target_id==this.bd_id){
        list_of_first_propositions.splice(len-i-1,1);
      }
    }

    let compteur_propositions=0;
    if(list_of_first_propositions.length>0){
      for(let i=0;i<list_of_first_propositions.length;i++){
        if(list_of_first_propositions[i].format=="serie"){
          this.BdSerieService.retrieve_bd_by_id(list_of_first_propositions[i].target_id).pipe(first() ).subscribe(comic=>{
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
          this.BdOneShotService.retrieve_bd_by_id(list_of_first_propositions[i].target_id).pipe(first() ).subscribe(comic=>{
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

  check_archive(){
    this.Subscribing_service.check_if_publication_archived( "comic",this.type ,this.bd_id).pipe(first() ).subscribe(r=>{
      if(r[0].value){
        this.content_archived=true;
      }
      this.archive_retrieved=true;
    })
  }


  bd_one_shot_calls(){
   
    this.BdOneShotService.retrieve_bd_by_id2(this.bd_id).pipe(first() ).subscribe(m => {
      if(m[0]){
        let r=m[0].data;
        if(!r[0] || r[0].status=="deleted" || r[0].status=="suspended" || (r[0].authorid!=m[0].current_user && r[0].status!="public")){
          if(r[0] && r[0].status=="deleted"){
            this.navbar.delete_research_from_navbar("Comic",this.type,this.bd_id).pipe(first() ).subscribe(r=>{
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
          let title =this.bd_title_input?this.bd_title_input:this.activatedRoute.snapshot.paramMap.get('title');
          if(r[0].title !=title ){
            this.page_not_found=true;
            this.cd.detectChanges()
            return
          }
          else{
  
            this.list_of_reporters=r[0].list_of_reporters
            this.authorid=r[0].authorid;
            this.pseudo=r[0].nickname;
            this.highlight=r[0].highlight;
            this.title=r[0].title;
            this.style=r[0].category;
            this.monetization=r[0].monetization
            this.firsttag=r[0].firsttag;
            this.secondtag=r[0].secondtag;
            this.thirdtag=r[0].thirdtag;
            this.pagesnumber=r[0].pagesnumber;
            this.status=r[0].status;
            this.thumbnail_picture=r[0].name_coverpage;
            this.thumbnail_picture_retrieved=true;
            let title_url=this.title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
            this.navbar.add_page_visited_to_history(`/artwork-comic/one-shot/${this.title}/${this.bd_id}`,this.device_info).pipe(first() ).subscribe();
            this.location.go(`/artwork-comic/one-shot/${title_url}/${this.bd_id}`);
            this.url=`https://www.linkarts.fr/artwork-comic/one-shot/${title_url}/${this.bd_id}`;
            this.location_done=true;
            this.date_upload_to_show = get_date_to_show( date_in_seconds(this.now_in_seconds,r[0].createdAt) )
            
            this.get_comic_oneshot_pages(this.bd_id,r[0].pagesnumber);
  
            this.check_archive();
  
            this.Profile_Edition_Service.retrieve_profile_picture( r[0].authorid).pipe(first() ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.profile_picture = SafeURL;
            });
            
            this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).pipe(first() ).subscribe(r=>{
              this.pseudo = r[0].nickname;
              this.user_name = r[0].firstname;
              this.primary_description=r[0].primary_description;
              
              this.type_of_account_checked=r[0].type_of_account_checked;
              this.certified_account=r[0].certified_account;
              this.profile_data_retrieved=true;

              this.meta_title.setTitle(`Œuvre LinkArts – ${this.title}`);
              this.meta.updateTag({ name: 'description', content: `Découvrer la bande dessinée, de la catégorie ${this.style}, de @${this.user_name}.` });
            });
  
            this.Profile_Edition_Service.get_emphasized_content(r[0].authorid).pipe(first() ).subscribe(l=>{
              if (l[0]!=null && l[0]!=undefined){
                if (l[0].publication_id==this.bd_id && l[0].publication_category== "comic" && l[0].format==this.type){
                  this.content_emphasized=true;
                }
              }
              this.emphasized_contend_retrieved=true;
            });
            
            this.Subscribing_service.check_if_visitor_susbcribed(this.authorid).pipe(first() ).subscribe(information=>{
              if(information[0].value){
                this.already_subscribed=true;
              }
              this.subscribtion_retrieved = true;
              
            });
  
            
  
            this.NotationService.get_content_marks("comic", 'one-shot', this.bd_id,0).pipe(first() ).subscribe(r=>{
              this.commentariesnumber=r[0].list_of_comments.length;
              this.viewsnumber= r[0].list_of_views.length;
              this.list_of_loves= r[0].list_of_loves;
              this.lovesnumber=this.list_of_loves.length;
              this.list_of_users_ids_loves[0]=[]
              
              if (this.list_of_loves.length != 0){
                this.loves_retrieved_but_not_checked=true;
                this.check_loves_after_current_one_shot();
              }
              else{
                this.list_of_users_ids_loves_retrieved=true;
              }
              this.list_of_likes=r[0].list_of_likes;
              this.likesnumber=this.list_of_likes.length;
              this.list_of_users_ids_likes[0]=[];
              this.likes_retrieved_but_not_checked=true;
              if (this.list_of_likes.length != 0){
                this.check_likes_after_current_one_shot();
                
              }
              else{
                this.list_of_users_ids_likes_retrieved=true;
              }
            })
  
            this.ready_to_check_view=true;
            this.one_shot_check_view_after_current();
  
  
            this.get_author_recommendations();
            this.get_recommendations_by_tag();
            this.item_retrieved=true;
            this.cd.detectChanges();
            this.initialize_swiper();
            this.display_pages=true;
       
          }
        }
      }
      
      
    });
  }


  get_comic_oneshot_pages(bd_id,total_pages:number) {
      
      for( var i=0; i< total_pages; i++ ) {
        this.BdOneShotService.retrieve_bd_page_miniature(bd_id,i,window.innerWidth).pipe(first() ).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
            if(this.style=="Manga"){
              this.list_bd_pages[total_pages-1-r[1]]=url;
            }
            else{
              this.list_bd_pages[r[1]]=url;
            }
        });
      };
  }

 

  check_likes_after_current_one_shot(){
    if(this.current_user_retrieved && this.likes_retrieved_but_not_checked){
      for (let i=0;i<this.list_of_likes.length;i++){
        this.list_of_users_ids_likes[0].push(this.list_of_likes[i].author_id_who_likes);
        if (this.list_of_likes[i].author_id_who_likes == this.visitor_id){
          this.liked = true;
        }
      }
      this.list_of_users_ids_likes_retrieved=true;
    }
  }

  check_loves_after_current_one_shot(){
    if(this.current_user_retrieved && this.loves_retrieved_but_not_checked){
      for (let i=0;i<this.list_of_loves.length;i++){
        this.list_of_users_ids_loves[0].push(this.list_of_loves[i].author_id_who_loves);
        if (this.list_of_loves[i].author_id_who_loves == this.visitor_id){
          this.loved = true;
        }
      }
      this.list_of_users_ids_loves_retrieved=true;
    }
  }

 
  one_shot_check_view_after_current(){
    if(this.current_user_retrieved && this.ready_to_check_view){
      if (this.authorid == this.visitor_id){
        this.mode_visiteur = false;
        if(this.status=="public"){
          this.navbar.check_if_research_exists("Comic",this.type,this.bd_id,this.title,"clicked").pipe(first() ).subscribe(p=>{
            if(!p[0].value){
              this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag,this.visitor_status).pipe(first() ).subscribe();
            }
          })
        }
       
      }
      else{
        this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag,this.visitor_status).pipe(first() ).subscribe();
        this.NotationService.add_view("comic", 'one-shot',  this.style, this.bd_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
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

  


  /********************************************* BD SERIE ***************************************/
  /********************************************* BD SERIE ***************************************/
  /********************************************* BD SERIE ***************************************/
  /********************************************* BD SERIE ***************************************/




  bd_serie_calls(){
    
    this.BdSerieService.retrieve_chapters_by_id(this.bd_id).pipe(first() ).subscribe(r => {
      this.current_chapter_title=r[0][this.current_chapter].title;
      this.chapterList=r[0];
      if(this.chapterList.length/2<(this.current_chapter+1)){
        this.chapter_filter_bottom_to_top=false;
      }
      else{
        this.chapter_filter_bottom_to_top=true;
      }
      if(window.innerWidth>500){
        this.chapter_name_to_show=`Chap. ${this.chapterList[this.current_chapter].chapter_number} : ${this.chapterList[this.current_chapter].title}`
      }
      else{
        this.chapter_name_to_show=`Chapitre ${this.chapterList[this.current_chapter].chapter_number}`
      }
      
      this.sumo_ready=true;

      this.Profile_Edition_Service.retrieve_profile_picture( r[0][this.current_chapter].author_id).pipe(first() ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.Subscribing_service.check_if_visitor_susbcribed(this.authorid).pipe(first() ).subscribe(information=>{
        if(information[0].value){
          this.already_subscribed=true;
        }
        this.subscribtion_retrieved = true;
      });

   
      this.date_upload_to_show = get_date_to_show(date_in_seconds(this.now_in_seconds,r[0][0].createdAt) );
      this.ready_to_check_view=true;
      this.serie_check_view_after_current();
      

      for( var i=1; i< this.chapterList.length; i++ ) {
        this.list_of_pages_by_chapter.push(['']);
      };
      this.get_comic_serie_chapter_pages(this.bd_id,this.current_chapter+1,this.chapterList[this.current_chapter].pagesnumber);
      this.item_retrieved=true;
      this.cd.detectChanges();
      this.initialize_swiper();
      this.display_pages=true;
    });
  }


  get_comic_serie_chapter_pages(bd_id,chapter_number,total_pages) {
    this.pagesnumber=total_pages;
    this.list_of_users_ids_loves_retrieved=false;
    this.list_of_users_ids_likes_retrieved=false;
    this.chapter_to_check_for_view=chapter_number;
    this.NotationService.get_content_marks("comic", 'serie', this.bd_id,chapter_number).pipe(first() ).subscribe(r=>{
      this.commentariesnumber=r[0].list_of_comments.length;
      this.viewsnumber= r[0].list_of_views.length;
      this.chapterList[chapter_number-1].viewnumber= this.viewsnumber;
      this.chapterList[chapter_number-1].commentariesnumber= this.commentariesnumber;
      //loves
      this.list_of_loves= r[0].list_of_loves;
      this.lovesnumber=this.list_of_loves.length;
      this.chapterList[chapter_number-1].lovesnumber= this.lovesnumber;
      this.list_of_users_ids_loves[chapter_number-1]=[];
      if (this.list_of_loves.length != 0){
        this.loves_retrieved_but_not_checked=true;
        this.check_loves_after_current_serie();
      }
      else{
        this.list_of_users_ids_loves_retrieved=true;
      }

      //likes
      this.list_of_likes= r[0].list_of_likes;
      this.likesnumber= this.list_of_likes.length;
      this.list_of_users_ids_likes[chapter_number-1]=[];
      this.chapterList[chapter_number-1].likesnumber= this.likesnumber;
      if ( this.list_of_likes.length != 0){
        this.likes_retrieved_but_not_checked=true;
        this.check_likes_after_current_serie();
      }
      else{
        this.list_of_users_ids_likes_retrieved=true;
      }
    })

    let compteur=0;
    for( let k=0; k< total_pages; k++ ) {
      this.BdSerieService.retrieve_bd_chapter_page_miniature(bd_id,chapter_number,k).pipe(first() ).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
        
        if(this.style=="Manga"){
          this.list_of_pages_by_chapter[chapter_number-1][total_pages-r[1]-1]=url;
        }
        else{
          this.list_of_pages_by_chapter[chapter_number-1][r[1]]=url;
        }
       
        compteur++;
        if(compteur==total_pages){
          this.initialize_thumbnails();
          this.show_pages[chapter_number-1]=true;
          this.cd.detectChanges();
        }
      });
    };

  }



  check_likes_after_current_serie(){
    if(this.current_user_retrieved && this.likes_retrieved_but_not_checked){
      for (let i=0;i< this.list_of_likes.length;i++){
        this.list_of_users_ids_likes[this.chapter_to_check_for_view-1].push( this.list_of_likes[i].author_id_who_likes);
        if ( this.list_of_likes[i].author_id_who_likes == this.visitor_id){
          this.liked = true;
        }
      }
      this.list_of_users_ids_likes_retrieved=true;
    }
  }

  check_loves_after_current_serie(){
    if(this.current_user_retrieved && this.loves_retrieved_but_not_checked){
      for (let i=0;i<this.list_of_loves.length;i++){
        this.list_of_users_ids_loves[this.chapter_to_check_for_view-1].push(this.list_of_loves[i].author_id_who_loves);
        if (this.list_of_loves[i].author_id_who_loves == this.visitor_id){
          this.loved = true;
        }
      }
      this.list_of_users_ids_loves_retrieved=true;
    }
  }

  serie_check_view_after_current(){
    if(this.current_user_retrieved && this.ready_to_check_view){
      if (this.authorid == this.visitor_id){
        this.mode_visiteur = false;
        if(this.status=="public"){
          this.navbar.check_if_research_exists("Comic",this.type,this.bd_id,this.title,"clicked").pipe(first() ).subscribe(p=>{
            if(!p[0].value){
              this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag, this.visitor_status).pipe(first() ).subscribe(l=>{
              });
            }
          })
        }
        
        
      }
      else{
        this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag, this.visitor_status).pipe(first() ).subscribe(l=>{});
        this.NotationService.add_view("comic", 'serie',  this.style, this.bd_id,1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
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



  /******************** *********************AFTER VIEW INIT***************** ****************** */

  
  show_icon=false;
  show_all_chapter=true;
  ngAfterViewInit(){
    if(window.innerWidth<=500){
      this.show_all_chapter=false;
    }
    this.open_category(0);
  }



  /**************************************************************************************************/
  /****************************             OPTIONS                   *******************************/
  /**************************************************************************************************/


 
  
    
  

  
  type_of_account_checked:boolean;
  certified_account:boolean;  

  optionOpened:number = -1;
  serie_clicked=false;
  video_clicked=false;
  openOption(i: number) {
    if(window.innerWidth<500){
      if(i==1){
        this.serie_clicked=true;
        this.video_clicked=false;
      }
      else if(i==0){
        this.serie_clicked=false;
        this.video_clicked=true;
      }
      else{
        this.serie_clicked=false;
        this.video_clicked=false;
      }
    }
    
    this.optionOpened = i;
  }

  open_account() {
    return "/account/"+this.pseudo;
  };
  get_link() {
    return "/main-research/styles/tags/1/Comic/" + this.style + "/all";
  };
  get_style_link(i: number) {
    if( i == 0 ) {
      return "/main-research/styles/tags/1/Comic/" + this.style + "/" + this.firsttag;
    }
    if( i == 1 ) {
      return "/main-research/styles/tags/1/Comic/" + this.style + "/" + this.secondtag;
    }
    if( i == 2 ) {
      return "/main-research/styles/tags/1/Comic/" + this.style + "/" + this.thirdtag;
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

    if(window.innerWidth<=500){
      this.show_all_chapter=false;
    }
    else{
      this.show_all_chapter=true;
      this.serie_clicked=false;
      this.video_clicked=false;
    }

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
        category:'Comic',
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
        category:'comic',
        format:this.type,
        style:this.style,
        publication_id:this.bd_id,
        chapter_number:this.current_chapter,
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

  open_chat_link() {
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
      preloadImages: false,
      lazy: {
        loadOnTransitionStart: true,
        checkInView:true,
      },
      watchSlidesVisibility:true,
      simulateTouch: true,
      direction:(this.style=="Webtoon")?'vertical':'horizontal',
      initialSlide:(this.style=="Manga")?this.pagesnumber-1:0,
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
          THIS.slide_to_initial();
          window.dispatchEvent(new Event("resize"));
        },
        slideChange: function () {
          //THIS.get_new_page(THIS.swiper.activeIndex)
          THIS.refresh_swiper_pagination();
        }
      },
    });
    
    
    this.refresh_swiper_pagination();
    $(".top-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSlide( $(".top-container .pages-controller-container input").val() );
      }
    });

   
      if(this.style=="Manga"){
        this.swiper.slideTo(this.pagesnumber,false,false);
      }
      else{
        this.swiper.slideTo(0,false,false);
      }

  }

  list_of_real_pages_retrieved=[]
  get_new_page(swiper_page){
    if(this.type=="serie"){
      let chapter=this.current_chapter+1;
      let total_pages=this.chapterList[this.current_chapter].pagesnumber;
      let page=(this.style=="Manga")?total_pages-1-swiper_page:swiper_page;
      if(!this.list_of_real_pages_retrieved[swiper_page] && page>=0){
        this.list_of_real_pages_retrieved[swiper_page]=true;
        this.BdSerieService.retrieve_bd_page(this.bd_id,chapter,swiper_page,window.innerWidth).pipe(first() ).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
          
          if(this.style=="Manga"){
            this.list_of_pages_by_chapter[chapter-1][total_pages-r[1]-1]=url;
          }
          else{
            this.list_of_pages_by_chapter[chapter-1][r[1]]=url;
          }
          
        });
      }
      
    }

    else{
      
      let page=(this.style=="Manga")?this.pagesnumber-1-swiper_page:swiper_page;
      if(!this.list_of_real_pages_retrieved[swiper_page] && page>=0 ){
        this.list_of_real_pages_retrieved[swiper_page]=true;
        this.BdOneShotService.retrieve_bd_page(this.bd_id,page,window.innerWidth).pipe(first() ).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
          this.list_bd_pages[swiper_page]=url;
        });
      }
    }
   
    
  }

  slide_to_initial(){
    if(this.style=="Manga" &&  !this.display_comics_pages[this.pagesnumber-1]){
      this.swiper.slideTo(this.pagesnumber,false,false);
    }
  }

  refresh_swiper_pagination() {
    if( this.swiper ) {
      if( this.swiper.slides ) {
        if(this.style=="Manga"){
          $(".top-container .pages-controller-container input").val( this.pagesnumber-this.swiper.activeIndex );
        }
        else{
          $(".top-container .pages-controller-container input").val( this.swiper.activeIndex + 1 );
        }
      }
    }
    this.cd.detectChanges();
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
      if(this.style=="Manga"){
        this.swiper.slideTo( this.pagesnumber-Number(i)  );
      }
      else{
        this.swiper.slideTo( Number(i) - 1 );
      }
      
    }
  }

  open_category(i : number) {
    this.category_index=i;
  }


  left_container_category_index: number = 0;
  open_left_container_category(i : number) {
    this.left_container_category_index=i;
  }

  


  initialize_thumbnails() {
    this.thumbnails_links=[];
    if( this.type =='one-shot' ) {
      for( var i=0; i< this.list_bd_pages.length; i++ ) {
        this.thumbnails_links[i]=( this.list_bd_pages[i] );
      }
    }
    else if( this.type=='serie' ) {
      for( var i=0; i< this.list_of_pages_by_chapter[this.current_chapter].length; i++ ) {
        this.thumbnails_links[i]=( this.list_of_pages_by_chapter[this.current_chapter][i] );
        if(i==this.list_of_pages_by_chapter[this.current_chapter].length-1){
          this.cd.detectChanges();
        }
      }
    }

  }

  thumbnails_loaded=[];
  load_thumbnails(i){
    this.thumbnails_loaded[i]=true;
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
  /******************** OPTION CONTAINER SELECTOR PART ****************** */
  /******************************************************* */
  @ViewChild('chapterselect') chapterselect:MatSelect;
  select_change_chapter(event){
    this.chapterselect.close()
    this.list_of_real_pages_retrieved=[]
    this.display_comics_pages=[];
      this.display_pages=false;
      this.thumbnails_loaded=[];
      let chapter_number = event.value;
      this.current_chapter= parseInt(chapter_number);// le chapitre 1 vaut 0 
      if((this.current_chapter+1)>this.chapterList.length/2){
        this.chapter_filter_bottom_to_top=false;
      }
      else{
        this.chapter_filter_bottom_to_top=true;
      }
      this.current_chapter_title=this.chapterList[chapter_number].title;
      if(window.innerWidth>500){
        this.chapter_name_to_show=`Chap. ${this.chapterList[this.current_chapter].chapter_number} : ${ this.current_chapter_title}`;
      }
      else{
        this.chapter_name_to_show=`Chapitre ${this.chapterList[this.current_chapter].chapter_number}`
      }
      
  
      if (this.mode_visiteur){
        this.add_time_of_view();
        this.NotationService.add_view("comic", 'serie',this.style, this.bd_id,(parseInt(chapter_number) + 1),this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
          this.id_view_created = r[0].id;
          this.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
        });
      }

      this.liked = false;
      this.loved = false;
      if( this.list_of_pages_by_chapter[parseInt(chapter_number)][0]==''){
        this.list_of_pages_by_chapter[parseInt(chapter_number)].pop();
        this.get_comic_serie_chapter_pages(this.bd_id,(parseInt(chapter_number) + 1),this.chapterList[parseInt(chapter_number)].pagesnumber);
        this.cd.detectChanges();
        this.initialize_swiper();
      }
      else{
        if(!this.list_of_users_ids_likes_retrieved){
          this.check_likes_after_current_serie()
        }
        else{
          for (let i=0;i<this.list_of_users_ids_likes[this.current_chapter].length;i++){
            if (this.list_of_users_ids_likes[this.current_chapter][i] == this.visitor_id){
              this.liked = true;
            }
          }
        }
        if(!this.list_of_users_ids_loves_retrieved){
          this.check_loves_after_current_serie()
        }
        else{
          for (let i=0;i<this.list_of_users_ids_loves[this.current_chapter].length;i++){
            if (this.list_of_users_ids_loves[this.current_chapter][i] == this.visitor_id){
              this.loved = true;
            }
          }
        }
        
        
        this.viewsnumber=this.chapterList[chapter_number].viewnumber;
        this.commentariesnumber = this.chapterList[chapter_number].commentarynumbers;
        this.likesnumber =this.chapterList[chapter_number].likesnumber ;
        this.lovesnumber =this.chapterList[chapter_number].lovesnumber ;
        this.initialize_thumbnails();
      }

      this.pagesnumber=this.chapterList[chapter_number].pagesnumber;
      this.cd.detectChanges;
      this.initialize_swiper();
      if(this.style=="Manga"){
        this.swiper.slideTo(this.chapterList[chapter_number].pagesnumber,false,false);
      }
      else{
        this.swiper.slideTo(0,false,false);
      }
      this.refresh_swiper_pagination();
      this.display_pages=true;
      let title_url=this.title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
      this.navbar.add_page_visited_to_history(`/artwork-comic/${this.type}/${this.title}/${this.bd_id}/${chapter_number + 1}`,this.device_info).pipe(first() ).subscribe();
      this.location.go(`/artwork-comic/${this.type}/${title_url}/${this.bd_id}/${parseInt(chapter_number) + 1}`);
      this.url=`https://www.linkarts.fr/artwork-comic/${this.type}/${title_url}/${this.bd_id}/${chapter_number + 1}`;
    
  }

  change_chapter_filter_bottom_to_top(direction){
    let THIS=this;

    if(direction=='up' && THIS.current_chapter==THIS.chapterList.length-1){
      return
    }
    if(direction=='down' && THIS.current_chapter==0){
      return
    }
    
    if(direction=='up'){
      THIS.chapter_filter_bottom_to_top=false;
    }
    if(direction=='down'){
      THIS.chapter_filter_bottom_to_top=true;
    }
    
    THIS.display_comics_pages=[];
    THIS.display_pages=false;
    
    THIS.thumbnails_loaded=[];
    let chapter_number =(THIS.chapter_filter_bottom_to_top)?0:THIS.chapterList.length-1;
    THIS.current_chapter= chapter_number;// le chapitre 1 vaut 0 
    THIS.current_chapter_title=THIS.chapterList[chapter_number].title;
    if(window.innerWidth>500){
      THIS.chapter_name_to_show=`Chap. ${THIS.chapterList[THIS.current_chapter].chapter_number} : ${ THIS.current_chapter_title}`;
    }
    else{
      this.chapter_name_to_show=`Chapire ${this.chapterList[this.current_chapter].chapter_number}`
    }
    

    if (THIS.mode_visiteur){
      this.add_time_of_view();
      THIS.NotationService.add_view("comic", 'serie',THIS.style, THIS.bd_id,(chapter_number + 1),THIS.firsttag,THIS.secondtag,THIS.thirdtag,THIS.authorid).pipe(first() ).subscribe(r=>{
        THIS.id_view_created = r[0].id;
        if(r[0].id>0){
          THIS.Community_recommendation.delete_recommendations_cookies();
          THIS.Community_recommendation.generate_recommendations().pipe(first() ).subscribe(r=>{})
        }
        THIS.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
      });
    }
    
    THIS.liked = false;
    THIS.loved = false;
    if( THIS.list_of_pages_by_chapter[chapter_number][0]==''){
      THIS.list_of_pages_by_chapter[chapter_number].pop();
      THIS.get_comic_serie_chapter_pages(THIS.bd_id,(chapter_number + 1),THIS.chapterList[chapter_number].pagesnumber);
    }
    else{
      if(!THIS.list_of_users_ids_likes_retrieved){
        THIS.check_likes_after_current_serie()
      }
      else{
        for (let i=0;i<THIS.list_of_users_ids_likes[THIS.current_chapter].length;i++){
          if (THIS.list_of_users_ids_likes[THIS.current_chapter][i] == THIS.visitor_id){
            THIS.liked = true;
          }
        }
      }

      if(!THIS.list_of_users_ids_loves_retrieved){
        THIS.check_loves_after_current_serie()
      }
      else{
        for (let i=0;i<THIS.list_of_users_ids_loves[THIS.current_chapter].length;i++){
          if (THIS.list_of_users_ids_loves[THIS.current_chapter][i] == THIS.visitor_id){
            THIS.loved = true;
          }
        }
      }
      THIS.viewsnumber=THIS.chapterList[chapter_number].viewnumber;
      THIS.commentariesnumber = THIS.chapterList[chapter_number].commentarynumbers;
      THIS.likesnumber =THIS.chapterList[chapter_number].likesnumber ;
      THIS.lovesnumber =THIS.chapterList[chapter_number].lovesnumber ;
      THIS.initialize_thumbnails();
    }
    THIS.pagesnumber=THIS.chapterList[chapter_number].pagesnumber;
    if(THIS.style=="Manga"){
      THIS.swiper.slideTo(THIS.chapterList[chapter_number].pagesnumber,false,false);
    }
    else{
      THIS.swiper.slideTo(0,false,false);
    }
    THIS.refresh_swiper_pagination();
    THIS.display_pages=true;
    let title_url=THIS.title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    THIS.navbar.add_page_visited_to_history(`/artwork-comic/${THIS.type}/${THIS.title}/${THIS.bd_id}/${chapter_number + 1}`,THIS.device_info).pipe(first() ).subscribe();
    THIS.location.go(`/artwork-comic/${THIS.type}/${title_url}/${THIS.bd_id}/${chapter_number + 1}`);
    THIS.url=`https://www.linkarts.fr/artwork-comic/${THIS.type}/${title_url}/${THIS.bd_id}/${chapter_number + 1}`;
    
  }


  change_chapter(direction){
    let THIS=this;
    if(direction=='next' && THIS.current_chapter==THIS.chapterList.length-1){
      return
    }
    if(direction=='before' && THIS.current_chapter==0){
      return
    }
    THIS.display_comics_pages=[];
    THIS.display_pages=false;
    THIS.thumbnails_loaded=[];

    let chapter_number =(direction=='next')?(THIS.current_chapter+1):(THIS.current_chapter-1);
    THIS.current_chapter= chapter_number;// le chapitre 1 vaut 0 
    THIS.current_chapter_title=THIS.chapterList[chapter_number].title;
    THIS.chapter_name_to_show=`Chap. ${THIS.chapterList[THIS.current_chapter].chapter_number} : ${ THIS.current_chapter_title}`;

    if((THIS.current_chapter+1)>THIS.chapterList.length/2){
      THIS.chapter_filter_bottom_to_top=false;
    }
    else{
      THIS.chapter_filter_bottom_to_top=true;
    }
    

    if (THIS.mode_visiteur){
      this.add_time_of_view();
      THIS.NotationService.add_view("comic", 'serie',THIS.style, THIS.bd_id,(chapter_number + 1),THIS.firsttag,THIS.secondtag,THIS.thirdtag,THIS.authorid).pipe(first() ).subscribe(r=>{
        THIS.id_view_created = r[0].id;
        if(r[0].id>0){
          THIS.Community_recommendation.delete_recommendations_cookies();
          THIS.Community_recommendation.generate_recommendations().pipe(first() ).subscribe(r=>{})
        }
        THIS.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
      });
    }
    
    THIS.liked = false;
    THIS.loved = false;
    if( THIS.list_of_pages_by_chapter[chapter_number][0]==''){
      THIS.list_of_pages_by_chapter[chapter_number].pop();
      THIS.get_comic_serie_chapter_pages(THIS.bd_id,(chapter_number + 1),THIS.chapterList[chapter_number].pagesnumber);
    }
    else{

      if(!THIS.list_of_users_ids_likes_retrieved){
        THIS.check_likes_after_current_serie()
      }
      else{
        for (let i=0;i<THIS.list_of_users_ids_likes[THIS.current_chapter].length;i++){
          if (THIS.list_of_users_ids_likes[THIS.current_chapter][i] == THIS.visitor_id){
            THIS.liked = true;
          }
        }
      }

      if(!THIS.list_of_users_ids_loves_retrieved){
        THIS.check_loves_after_current_serie()
      }
      else{
        for (let i=0;i<THIS.list_of_users_ids_loves[THIS.current_chapter].length;i++){
          if (THIS.list_of_users_ids_loves[THIS.current_chapter][i] == THIS.visitor_id){
            THIS.loved = true;
          }
        }
      }
      
      THIS.viewsnumber=THIS.chapterList[chapter_number].viewnumber;
      THIS.commentariesnumber = THIS.chapterList[chapter_number].commentarynumbers;
      THIS.likesnumber =THIS.chapterList[chapter_number].likesnumber ;
      THIS.lovesnumber =THIS.chapterList[chapter_number].lovesnumber ;
      THIS.initialize_thumbnails();
    }
    THIS.pagesnumber=THIS.chapterList[chapter_number].pagesnumber;
    if(THIS.style=="Manga"){
      THIS.swiper.slideTo(THIS.chapterList[chapter_number].pagesnumber,false,false);
    }
    else{
      THIS.swiper.slideTo(0,false,false);
    }
    THIS.refresh_swiper_pagination();
    THIS.display_pages=true;
    let title_url=THIS.title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
    THIS.navbar.add_page_visited_to_history(`/artwork-comic/${THIS.type}/${THIS.title}/${THIS.bd_id}/${chapter_number + 1}`,THIS.device_info).pipe(first() ).subscribe();
    THIS.location.go(`/artwork-comic/${THIS.type}/${title_url}/${THIS.bd_id}/${chapter_number + 1}`);
    THIS.url=`https://www.linkarts.fr/artwork-comic/${THIS.type}/${title_url}/${THIS.bd_id}/${chapter_number + 1}`;
  
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
      if(this.like_in_progress  ||this.love_in_progress){
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
            this.NotationService.remove_like("comic", 'one-shot', this.style, this.bd_id,0).pipe(first() ).subscribe(r=>{

              let index=this.list_of_users_ids_likes[0].indexOf(this.visitor_id);
              this.list_of_users_ids_likes[0].splice(index,1);
              if(this.authorid==this.visitor_id){
                this.like_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_like','comic','one-shot',this.bd_id,0,false,0).pipe(first() ).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"publication_like",
                    id_user_name:this.visitor_name,
                    id_user:this.visitor_id, 
                    id_receiver:this.authorid, 
                    publication_category:'comic',
                    format:'one-shot',
                    publication_id:this.bd_id,
                    chapter_number:0,
                    information:"remove",
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
          else if(this.type=='serie'){      
            this.NotationService.remove_like("comic", 'serie', this.style, this.bd_id,this.current_chapter + 1).pipe(first() ).subscribe(r=>{      

              let index=this.list_of_users_ids_likes[this.current_chapter].indexOf(this.visitor_id);
              this.list_of_users_ids_likes[this.current_chapter].splice(index,1);
              
              if(this.authorid==this.visitor_id){
                this.like_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_like','comic','serie',this.bd_id,this.current_chapter + 1,false,0).pipe(first() ).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"publication_like",
                    id_user_name:this.visitor_name,
                    id_user:this.visitor_id, 
                    id_receiver:this.authorid,
                    publication_category:'comic',
                    format:'serie',
                    publication_id:this.bd_id,
                    chapter_number:this.current_chapter + 1,
                    information:"remove",
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
            
            this.NotationService.add_like('comic', 'one-shot', this.style, this.bd_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{        

              if(!r[0].error){
                this.list_of_users_ids_likes[this.current_chapter].splice(0,0,this.visitor_id);
                if(this.authorid==this.visitor_id){
                  
                  this.like_in_progress=false;
                  this.cd.detectChanges();
                }
                else{
                  this.NotificationsService.add_notification('publication_like',this.visitor_id,this.visitor_name,this.authorid,'comic',this.title,'one-shot',this.bd_id,0,"add",false,0).pipe(first() ).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"publication_like",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:'comic',
                      publication_name:this.title,
                      format:'one-shot',
                      publication_id:this.bd_id,
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
          else if(this.type=='serie'){
          
            this.NotationService.add_like("comic", 'serie', this.style, this.bd_id,this.current_chapter + 1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
              if(!r[0].error){
                this.list_of_users_ids_likes[this.current_chapter].splice(0,0,this.visitor_id);
              
                if(this.authorid==this.visitor_id){
                  this.like_in_progress=false;
                  this.cd.detectChanges();
                }
                else{
                  this.NotificationsService.add_notification('publication_like',this.visitor_id,this.visitor_name,this.authorid,'comic',this.title,'serie',this.bd_id,this.current_chapter + 1,"add",false,0).pipe(first() ).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"publication_like",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:'comic',
                      publication_name:this.title,
                      format:'serie',
                      publication_id:this.bd_id,
                      chapter_number:this.current_chapter + 1,
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
      if(this.love_in_progress   || this.like_in_progress){
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
            this.NotationService.remove_love("comic", 'one-shot', this.style, this.bd_id,0).pipe(first() ).subscribe(r=>{
              let index=this.list_of_users_ids_loves[0].indexOf(this.visitor_id);
              this.list_of_users_ids_loves[0].splice(index,1);
              //his.list_of_users_ids_loves.splice(index,1);
              
              if(this.authorid==this.visitor_id){
                this.love_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_love','comic','one-shot',this.bd_id,0,false,0).pipe(first() ).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"publication_love",
                    id_user_name:this.visitor_name,
                    id_user:this.visitor_id, 
                    id_receiver:this.authorid, 
                    publication_category:'comic',
                    format:'one-shot',
                    publication_id:this.bd_id,
                    chapter_number:0,
                    information:"remove",
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
          else if(this.type=='serie'){      
            this.NotationService.remove_love("comic", 'serie', this.style, this.bd_id,this.current_chapter + 1).pipe(first() ).subscribe(r=>{      

              let index=this.list_of_users_ids_loves[this.current_chapter].indexOf(this.visitor_id);
              this.list_of_users_ids_loves[this.current_chapter].splice(index,1);;
              if(this.authorid==this.visitor_id){
                this.love_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_love','comic','serie',this.bd_id,this.current_chapter + 1,false,0).pipe(first() ).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"publication_love",
                    id_user_name:this.visitor_name,
                    id_user:this.visitor_id, 
                    id_receiver:this.authorid,
                    publication_category:'comic',
                    format:'serie',
                    publication_id:this.bd_id,
                    chapter_number:this.current_chapter + 1,
                    information:"remove",
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
            this.NotationService.add_love("comic", 'one-shot', this.style, this.bd_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{        
              if(!r[0].error){
                this.list_of_users_ids_loves[this.current_chapter].splice(0,0,this.visitor_id);
                if(this.authorid==this.visitor_id){
                  this.love_in_progress=false;
                  this.cd.detectChanges();
                }
                else{
                  this.NotificationsService.add_notification('publication_love',this.visitor_id,this.visitor_name,this.authorid,'comic',this.title,'one-shot',this.bd_id,0,"add",false,0).pipe(first() ).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"publication_love",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:'comic',
                      publication_name:this.title,
                      format:'one-shot',
                      publication_id:this.bd_id,
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
                this.love_in_progress=false;
              }
              
              
            });
          }
          else if(this.type=='serie'){
          
            this.NotationService.add_love("comic", 'serie', this.style, this.bd_id,this.current_chapter + 1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).pipe(first() ).subscribe(r=>{
              if(!r[0].error){
                this.list_of_users_ids_loves[this.current_chapter].splice(0,0,this.visitor_id);
                              
                if(this.authorid==this.visitor_id){
                  this.love_in_progress=false; 
                  this.cd.detectChanges();
                }
                else{
                  this.NotificationsService.add_notification('publication_love',this.visitor_id,this.visitor_name,this.authorid,'comic',this.title,'serie',this.bd_id,this.current_chapter + 1,"add",false,0).pipe(first() ).subscribe(l=>{
                    let message_to_send ={
                      for_notifications:true,
                      type:"publication_love",
                      id_user_name:this.visitor_name,
                      id_user:this.visitor_id, 
                      id_receiver:this.authorid,
                      publication_category:'comic',
                      publication_name:this.title,
                      format:'serie',
                      publication_id:this.bd_id,
                      chapter_number:this.current_chapter + 1,
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
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous ne pouvez pas aimer et adorer la même œuvre"},
                  });
                }
                else if(r[0].error="already_loved"){
                  const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                    data: {showChoice:false, text:"Vous avez déjà adoré cette œuvre"},
                  });
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

  in_other_popup=false;
  show_likes(){
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"likes", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_likes[this.current_chapter],visitor_name:this.visitor_name,visitor_id:this.visitor_id},
      panelClass: 'popupLikesAndLovesClass',
    })
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
      data: {title:"loves", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_loves[this.current_chapter],visitor_name:this.visitor_name,visitor_id:this.visitor_id},
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
    this.commentariesnumber++;
    this.cd.detectChanges();
  }

  removed_comment() {
    this.commentariesnumber--;
  }

  
  add_time_of_view(){
    if(this.mode_visiteur){
      let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - this.begining_time_of_view;
      if(this.type=='one-shot' && this.id_view_created>0 && ending_time_of_view>5){
        this.NotationService.add_view_time(ending_time_of_view, this.id_view_created).pipe(first() ).subscribe();
      }
      if(this.type=='serie' && this.id_view_created>0 &&  ending_time_of_view>5){
        this.NotationService.add_view_time(ending_time_of_view, this.id_view_created).pipe(first() ).subscribe();
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
    this.Subscribing_service.archive( "comic",this.type,this.bd_id).pipe(first() ).subscribe(r=>{
      this.content_archived=true;
      this.archive_loading=false;
    });
  }

  unarchive(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    this.Subscribing_service.unarchive( "comic",this.type,this.bd_id).pipe(first() ).subscribe(r=>{
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
    this.Reports_service.check_if_content_reported('comic',this.bd_id,this.type,(this.type=='serie')?(this.current_chapter+1):0).pipe(first() ).subscribe(r=>{
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
          data: {from_account:false,id_receiver:this.authorid,publication_category:'comic',publication_id:this.bd_id,format:this.type,chapter_number:(this.type=='serie')?(this.current_chapter+1):0},
          panelClass:"popupReportClass"
        });
        dialogRef.afterClosed().pipe(first() ).subscribe(result => {
          this.in_other_popup=false;
        })
      }
      this.checking_report=false;
    })
    
  }

  cancel_report(){

    let id=this.bd_id
    this.Reports_service.cancel_report("comic",id,this.type).pipe(first() ).subscribe(r=>{
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
    if(this.type=="serie"){
      this.Profile_Edition_Service.emphasize_content( "comic",this.type,this.bd_id).pipe(first() ).subscribe(t=>{
        this.content_emphasized=true;
        this.archive_loading=false;
      });
    }
    else{
      this.Profile_Edition_Service.emphasize_content( "comic",this.type,this.bd_id).pipe(first() ).subscribe(r=>{
        this.content_emphasized=true;
        this.archive_loading=false;
      });
    }
  }

  remove_emphasizing(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    if(this.type=="serie"){
      this.Profile_Edition_Service.remove_emphasizing( "comic",this.type,this.bd_id).pipe(first() ).subscribe(t=>{
        this.content_emphasized=false;
        this.archive_loading=false;
      });
    }
    else{
      this.Profile_Edition_Service.remove_emphasizing( "comic",this.type,this.bd_id).pipe(first() ).subscribe(t=>{
        this.content_emphasized=false;
        this.archive_loading=false;
      });
    }
  }

  /******************************************DISPLAY IMAGES ****************************************/

  profile_picture_loaded(){
    this.pp_loaded=true;
  }




  a_drawing_is_loaded(i){
    this.display_comics_pages[i]=true;
    this.initialize_swiper();

    if(this.style=="Manga"){
      if(i==this.pagesnumber-1){
        this.get_new_page(this.swiper.activeIndex)
        this.pre_load_other_pages("Manga")
      }
    }
    else{
      if(i==0){
        this.get_new_page(this.swiper.activeIndex);

        this.pre_load_other_pages("other")
      }
    }
   
  }

  pre_load_other_pages(style){
    if(this.pagesnumber>1){
      let interval = setInterval(() => {
        if(style=="Manga"){
          for(let i=0;i<this.pagesnumber-1;i++){
            this.get_new_page(i)
          }
        }
        else{
          for(let i=1;i<this.pagesnumber;i++){
            this.get_new_page(i)
          }
        }
        clearInterval(interval)
      },1000)
    }
   
  }


   /******************************************************************** */
  /****VARIABLES ET FONCTIONS D'EDITION******************************** */
  /******************************************************************** */

  edit_information() {
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupFormComicComponent, {
      data: {
        format:this.type, 
        bd_id: this.bd_id, 
        title: this.title, 
        chapter:this.current_chapter,
        highlight:this.highlight, 
        style:this.style, 
        firsttag:this.firsttag,
        secondtag:this.secondtag, 
        thirdtag:this.thirdtag,
        author_name: this.user_name,
        primary_description: this.primary_description, 
        profile_picture: this.profile_picture,
        chapterList: this.chapterList,
        thumbnail_color:this.thumbnail_color,
        current_chapter:this.current_chapter+1,
      },
      panelClass: 'popupFormComicClass',
    });
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      this.in_other_popup=false;
    })
  }
  edit_thumbnail() {
    this.in_other_popup=true;
      const dialogRef = this.dialog.open(PopupEditCoverComponent, {
        data: {
        format:this.type,
        bd_id: this.bd_id,
        title: this.title,
        style:this.style, 
        firsttag:this.firsttag,
        secondtag:this.secondtag,
        thirdtag:this.thirdtag,
        author_name: this.user_name,
        primary_description: this.primary_description, 
        profile_picture: this.profile_picture,
        thumbnail_picture:this.thumbnail_picture,
        category:"comic",
      },
      panelClass: 'popupEditCoverClass',
    });  
    dialogRef.afterClosed().pipe(first() ).subscribe(result => {
      this.in_other_popup=false;
    })   
  }

  edit_chapters(){
    this.location.go(`/add-artwork/handle-comics-chapter/${this.bd_id}`);
    location.reload()
    return;
  }

  edit_chapters_url(){
    return `/add-artwork/handle-comics-chapter/${this.bd_id}`
  }

  add_pages_one_shot(){
    return `/add-artwork/add-content/comic/one-shot/${this.bd_id}`
  }
  
  archive_loading=false;
  set_private() {
    this.in_other_popup=true;
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
        if(this.type=="one-shot"){
          this.Subscribing_service.change_content_status( "comic",this.type,this.bd_id,"private").pipe(first() ).subscribe(r=>{
            this.BdOneShotService.change_oneshot_comic_status(this.bd_id,"private").pipe(first() ).subscribe(r=>{
              this.status="private";
              this.archive_loading=false;
            });
          })
        }
        else{
          this.Subscribing_service.change_content_status( "comic",this.type,this.bd_id,"private").pipe(first() ).subscribe(r=>{
            this.BdSerieService.change_serie_comic_status(this.bd_id,"private").pipe(first() ).subscribe(r=>{
              this.status="private";
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
          this.Subscribing_service.change_content_status( "comic",this.type,this.bd_id,"ok").pipe(first() ).subscribe(r=>{
            this.BdOneShotService.change_oneshot_comic_status(this.bd_id,"public").pipe(first() ).subscribe(r=>{
              this.status="public";
              this.archive_loading=false;
            });
          })
          
        }
        else{
          this.Subscribing_service.change_content_status( "comic",this.type,this.bd_id,"ok").pipe(first() ).subscribe(r=>{
            this.BdSerieService.change_serie_comic_status(this.bd_id,"public").pipe(first() ).subscribe(r=>{
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
          this.navbar.delete_publication_from_research("Comic",this.type,this.bd_id).pipe(first() ).subscribe(r=>{
           
            this.BdOneShotService.RemoveBdOneshot(this.bd_id).pipe(first() ).subscribe(r=>{
              this.NotificationsService.remove_notification('add_publication','comic','one-shot',this.bd_id,0,false,0).pipe(first() ).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"add_publication",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  publication_category:'comic',
                  format:'one-shot',
                  publication_id:this.bd_id,
                  chapter_number:0,
                  information:"remove",
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
         

          this.navbar.delete_publication_from_research("Comic",this.type,this.bd_id).pipe(first() ).subscribe(r=>{
            this.BdSerieService.RemoveBdSerie(this.bd_id).pipe(first() ).subscribe(r=>{
              this.NotificationsService.remove_notification('add_publication','comic','serie',this.bd_id,0,false,0).pipe(first() ).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"add_publication",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  publication_category:'comic',
                  format:'serie',
                  publication_id:this.bd_id,
                  chapter_number:0,
                  information:"remove",
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


  after_click_comment(event){
    this.add_time_of_view()
    this.close_popup();
  }

  add_share_history(category){
    this.navbar.add_page_visited_to_history(`/artwork-comic-share/${this.type}/${this.title}/${this.bd_id}/${this.current_chapter + 1}/${category}`,this.device_info).pipe(first() ).subscribe();
  }

  scroll_value:number=0;
  onScrollImage(event){
    if(this.webtoons && this.webtoons.toArray()[this.swiper.activeIndex].nativeElement.scrollTop + this.webtoons.toArray()[this.swiper.activeIndex].nativeElement.offsetHeight >= this.webtoons.toArray()[this.swiper.activeIndex].nativeElement.scrollHeight){
      this.swiper.slideTo(this.swiper.activeIndex +1,500,false);
    }
    else if(this.webtoons && (this.webtoons.toArray()[this.swiper.activeIndex].nativeElement.scrollTop + this.webtoons.toArray()[this.swiper.activeIndex].nativeElement.offsetHeight)==this.webtoons.toArray()[this.swiper.activeIndex].nativeElement.offsetHeight){
      this.swiper.slideTo(this.swiper.activeIndex -1,500,false);
     
    }
  }

  
}


