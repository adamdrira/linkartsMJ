import { Component, OnInit, Input, HostListener, ChangeDetectorRef } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import {MatMenuModule} from '@angular/material/menu';
import { delay } from 'rxjs/operators';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Emphasize_service } from '../services/emphasize.service';
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

import { PopupCommentsComponent } from '../popup-comments/popup-comments.component';
import { PopupArtworkDataComponent } from '../popup-artwork-data/popup-artwork-data.component';

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
      'enterFromLeft', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    )
  ],
})
export class ArtworkComicComponent implements OnInit {


  constructor(
    private Reports_service:Reports_service,
    private rd: Renderer2,
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
    private AuthenticationService:AuthenticationService,
    private Subscribing_service:Subscribing_service,
    public dialog: MatDialog,
    private Community_recommendation:Community_recommendation,
    private Emphasize_service:Emphasize_service,
    private NotificationsService:NotificationsService,
    private chatService:ChatService,
    ) { 

      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      };

    /*this.AuthenticationService.currentUserType.subscribe(r=>{
      console.log(r);
      if(r!=''){
        this.type_of_account=r;
        this.type_of_account_retrieved=true;
        if(this.pp_loaded){
          this.display_right_container=true;
        }
      }
    })*/
    
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



  
  @ViewChild('leftContainer') leftContainer:ElementRef;
  @ViewChild('swiperWrapper') swiperWrapperRef:ElementRef;
  @ViewChild('swiperContainer') swiperContainerRef:ElementRef;
  @ViewChildren('swiperSlide') swiperSlides:QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailsRef:QueryList<ElementRef>;

 
  //display component
  sumo_ready=false
  display_right_container=false;
  pp_loaded=false;
  display_pages=false;
  display_writings_recommendations=false;
  display_comics_recommendations=false;
  display_drawings_recommendations=false;
  display_comics_pages:any[]=[];
  display_comics_recommendations_others=false;
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
  //0 : description, 1 : comments
  category_index: number = 0;

  recommendation_index: number = 0;

  //Liked or/and loved contents
  liked: boolean=false;
  like_in_progress=false;
  loved:boolean=false;
  love_in_progress=false;
  type:string;

  now_in_seconds= Math.trunc( new Date().getTime()/1000);
  
  //for list of loves and likes
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
  list_bd_pages:SafeUrl[]=[];
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
  list_of_author_recommendations_drawings:any[]=[];
  list_of_author_recommendations_drawings_retrieved=false;
  list_of_author_recommendations_writings:any[]=[];
  list_of_author_recommendations_writings_retrieved=false;
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

  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {
    window.scroll(0,0);
    setInterval(() => {

      if( this.commentariesnumber && this.myScrollContainer && this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.7){
        if(this.number_of_comments_to_show<this.commentariesnumber){
          this.number_of_comments_to_show+=10;
          console.log(this.number_of_comments_to_show)
        }
      }
    },3000)

    this.type = this.activatedRoute.snapshot.paramMap.get('format');
    this.type_of_comic_retrieved=true;
    if( this.type != "one-shot" && this.type != "serie") {
      this.page_not_found=true;
      return 
    }

    this.bd_id = parseInt(this.activatedRoute.snapshot.paramMap.get('bd_id'));
    if(!(this.bd_id>0)){
      this.page_not_found=true;
      return 
      //this.router.navigateByUrl('/page_not_found');
    }

    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
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
      
     
      this.active_section = this.route.snapshot.data['section'];
      console.log(this.active_section)
      if(this.active_section==2){
        this.current_chapter= parseInt(this.activatedRoute.snapshot.paramMap.get('chapter_number')) -1;
        console.log(this.current_chapter);
      }
      this.BdSerieService.retrieve_bd_by_id2(this.bd_id).subscribe(m => { 
        
        if(m[0]){
          let r=m[0].data;
          console.log(r[0]);
          if(!r[0] || r[0].chaptersnumber<this.current_chapter+1 || this.type!='serie' || r[0].status=="deleted" || r[0].status=="suspended" || (r[0].authorid!=m[0].current_user && r[0].status!="public")){
            if(r[0] && r[0].status=="deleted"){
              this.navbar.delete_research_from_navbar("Comic",this.type,this.bd_id).subscribe(r=>{
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
            
            let title =this.activatedRoute.snapshot.paramMap.get('title');
            if(r[0].title !=title || typeof(title)!='string'){
              this.page_not_found=true;
              return
            }
            else{
              this.location.go(`/artwork-comic/${this.type}/${title}/${this.bd_id}/${this.current_chapter + 1}`);
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


              this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).subscribe(r=>{
                this.pseudo = r[0].nickname;
                this.certified_account=r[0].certified_account;
                this.user_name = r[0].firstname + ' ' + r[0].lastname;
                this.primary_description=r[0].primary_description;
                this.profile_data_retrieved=true;
              });

              this.Emphasize_service.get_emphasized_content(r[0].authorid).subscribe(l=>{
                if (l[0]!=null && l[0]!=undefined){
                  if (l[0].publication_id==this.bd_id && l[0].publication_category== "comic" && l[0].format==this.type){
                    this.content_emphasized=true;
                  }
                }
                this.emphasized_contend_retrieved=true;
              });
              
              console.log( this.monetization)
              this.bd_serie_calls();

              this.get_author_recommendations();
              this.get_recommendations_by_tag();
              
              

              
            }
          }
        }
        
        
      });
    }
    
  }

  

  /********************************************** RECOMMENDATIONS **************************************/
  /********************************************** RECOMMENDATIONS **************************************/
  /********************************************** RECOMMENDATIONS **************************************/

  get_author_recommendations(){
    this.Community_recommendation.get_comics_recommendations_by_author(this.authorid,this.bd_id).subscribe(e=>{
      console.log(e[0].list_to_send)
      if(e[0].list_to_send.length>0){
        for(let j=0;j<e[0].list_to_send.length;j++){
          if(e[0].list_to_send[j].length>0){
            this.list_of_author_recommendations_comics.push(e[0].list_to_send[j])
          }
        } 
      }
      
      this.list_of_author_recommendations_comics_retrieved=true;

      this.check_author_recommendations();
    })

    this.Community_recommendation.get_drawings_recommendations_by_author(this.authorid,0).subscribe(e=>{
      if(e[0].list_to_send.length >0){
        for(let j=0;j<e[0].list_to_send.length;j++){
          if(e[0].list_to_send[j].length>0){
            this.list_of_author_recommendations_drawings.push(e[0].list_to_send[j])
          }
        }
        
      }
      this.list_of_author_recommendations_drawings_retrieved=true;

      this.check_author_recommendations();
    })
    this.Community_recommendation.get_writings_recommendations_by_author(this.authorid,0).subscribe(e=>{
      if(e[0].list_to_send.length >0){
        for(let j=0;j<e[0].list_to_send.length;j++){
          if(e[0].list_to_send[j].length>0){
            this.list_of_author_recommendations_writings.push(e[0].list_to_send[j])
          }
        }
      
      }
      this.list_of_author_recommendations_writings_retrieved=true;
      
      this.check_author_recommendations();
    })
  }

  first_propositions_retrieved=false;
  second_propositions_retrieved=false;
  second_propositions=[];
  first_propositions=[];


  check_author_recommendations(){
    if(  this.list_of_author_recommendations_writings_retrieved && this.list_of_author_recommendations_drawings_retrieved && this.list_of_author_recommendations_comics_retrieved){
      console.log( this.list_of_author_recommendations_comics)
      console.log( this.list_of_author_recommendations_drawings)
      console.log( this.list_of_author_recommendations_writings)

      this.list_of_author_recommendations_retrieved=true;
    }
  }

  get_recommendations_by_tag(){

    
    this.Community_recommendation.get_artwork_recommendations_by_tag('Comic',this.type,this.bd_id,this.style,this.firsttag,6).subscribe(u=>{
      if(u[0].length>0){
        console.log(u[0])
        let list_of_first_propositions=u[0];
        this.first_propositions=u[0];
        console.log(list_of_first_propositions)
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

    this.Community_recommendation.get_artwork_recommendations_by_tag('Comic',this.type,this.bd_id,this.style,this.secondtag,6).subscribe(r=>{
      
      this.second_propositions_retrieved=true;
      this.second_propositions=r[0];
      console.log(this.second_propositions)
      check_all(this)
    
    })


    function check_all(THIS){
      
      if(THIS.second_propositions_retrieved && THIS.first_propositions_retrieved){
        if(THIS.second_propositions.length>0){
         
          let len=THIS.first_propositions.length;
          for(let j=0;j<THIS.second_propositions.length;j++){
            let ok=true;
            console.log(j)
            for(let k=0;k<len;k++){
              if(THIS.first_propositions[k].format==THIS.second_propositions[j].format && THIS.first_propositions[k].target_id==THIS.second_propositions[j].target_id){
                ok=false;
              }
            }
            if(ok){
              console.log("push")
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
    console.log(list_of_first_propositions)
    console.log(this.type)
    console.log(this.bd_id)
    for(let i=0;i<len;i++){
      if(list_of_first_propositions[len-i-1].format==this.type && list_of_first_propositions[len-i-1].target_id==this.bd_id){
        list_of_first_propositions.splice(len-i-1,1);
      }
    }

    let compteur_propositions=0;
    if(list_of_first_propositions.length>0){
      for(let i=0;i<list_of_first_propositions.length;i++){
        if(list_of_first_propositions[i].format=="serie"){
          this.BdSerieService.retrieve_bd_by_id(list_of_first_propositions[i].target_id).subscribe(comic=>{
            if(comic[0].status=="public"){
              this.list_of_recommendations_by_tag.push(comic[0]);
            }
            compteur_propositions++;
            if(compteur_propositions==list_of_first_propositions.length){
              console.log(this.list_of_recommendations_by_tag)
              this.list_of_recommendations_by_tag_retrieved=true;
            }
          })
        }
        else{
          this.BdOneShotService.retrieve_bd_by_id(list_of_first_propositions[i].target_id).subscribe(comic=>{
            if(comic[0].status=="public"){
              this.list_of_recommendations_by_tag.push(comic[0]);
            }
            compteur_propositions++;
            if(compteur_propositions==list_of_first_propositions.length){
              console.log(this.list_of_recommendations_by_tag)
              this.list_of_recommendations_by_tag_retrieved=true;
            }
          })
        }
        
      }
    }
    else{
      console.log(this.list_of_recommendations_by_tag)
      this.list_of_recommendations_by_tag_retrieved=true;
    }
  }

  check_archive(){
    this.Subscribing_service.check_if_publication_archived( "comic",this.type ,this.bd_id).subscribe(r=>{
      console.log(r[0]);
      if(r[0].value){
        this.content_archived=true;
      }
      this.archive_retrieved=true;
    })
  }

  bd_one_shot_calls(){
   
    this.BdOneShotService.retrieve_bd_by_id2(this.bd_id).subscribe(m => {
      if(m[0]){
        let r=m[0].data;
        console.log(r[0]);
        if(!r[0] || r[0].status=="deleted" || r[0].status=="suspended" || (r[0].authorid!=m[0].current_user && r[0].status!="public")){
          if(r[0] && r[0].status=="deleted"){
            this.navbar.delete_research_from_navbar("Comic",this.type,this.bd_id).subscribe(r=>{
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
          let title =this.activatedRoute.snapshot.paramMap.get('title');
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
            this.date_upload_to_show = get_date_to_show( date_in_seconds(this.now_in_seconds,r[0].createdAt) )
            
            this.get_comic_oneshot_pages(this.bd_id,r[0].pagesnumber);
  
            this.check_archive();
  
            this.Profile_Edition_Service.retrieve_profile_picture( r[0].authorid).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.profile_picture = SafeURL;
            });
            
            this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).subscribe(r=>{
              this.pseudo = r[0].nickname;
              this.user_name = r[0].firstname + ' ' + r[0].lastname;
              this.primary_description=r[0].primary_description;
              
              this.certified_account=r[0].certified_account;
              this.profile_data_retrieved=true;
            });
  
            this.Emphasize_service.get_emphasized_content(r[0].authorid).subscribe(l=>{
              if (l[0]!=null && l[0]!=undefined){
                if (l[0].publication_id==this.bd_id && l[0].publication_category== "comic" && l[0].format==this.type){
                  this.content_emphasized=true;
                }
              }
              this.emphasized_contend_retrieved=true;
            });
            
            this.Subscribing_service.check_if_visitor_susbcribed(this.authorid).subscribe(information=>{
              if(information[0].value){
                this.already_subscribed=true;
              }
              this.subscribtion_retrieved = true;
              
            });
  
            
  
            this.NotationService.get_content_marks("comic", 'one-shot', this.bd_id,0).subscribe(r=>{
  
              //views and comments
              console.log(r[0])
              this.commentariesnumber=r[0].list_of_comments.length;
              this.viewsnumber= r[0].list_of_views.length;
              //loves
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
  
              //likes
              //let list_of_likes= r[0].list_of_likes;
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
            
  
       
          }
        }
      }
      
      
    });
  }


  get_comic_oneshot_pages(bd_id,total_pages) {
    
    for( var i=0; i< total_pages; i++ ) {
      this.BdOneShotService.retrieve_bd_page(bd_id,i).subscribe(r=>{
        console.log(r[0])
        let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
        let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        if(this.style=="Manga"){
          this.list_bd_pages[total_pages-1-r[1]]=(SafeURL);
        }
        else{
          this.list_bd_pages[r[1]]=(SafeURL);
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
       
        this.navbar.check_if_research_exists("Comic",this.type,this.bd_id,this.title,"clicked").subscribe(p=>{
          if(!p[0].value){
            this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag,this.visitor_status).subscribe();
          }
        })
      }
      else{
        this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag,this.visitor_status).subscribe();
        this.NotationService.add_view("comic", 'one-shot',  this.style, this.bd_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
          console.log("view added")
          console.log(r[0])
          this.id_view_created = r[0].id;
          if(r[0].id>0){
            this.Community_recommendation.delete_recommendations_cookies();
            this.Community_recommendation.generate_recommendations().subscribe(r=>{})
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
    
    this.BdSerieService.retrieve_chapters_by_id(this.bd_id).subscribe(r => {
      this.current_chapter_title=r[0][this.current_chapter].title;
      this.chapterList=r[0];
      console.log( this.chapterList)
      if(this.chapterList.length/2<(this.current_chapter+1)){
        this.chapter_filter_bottom_to_top=false;
      }
      else{
        this.chapter_filter_bottom_to_top=true;
      }
      this.chapter_name_to_show=`Chapitre ${this.chapterList[this.current_chapter].chapter_number} : ${this.chapterList[this.current_chapter].title}`
      console.log( this.chapter_name_to_show)
      $('.chapterSelector').attr("placeholder",this.chapter_name_to_show);
      this.initialize_chapter_selector();

      this.Profile_Edition_Service.retrieve_profile_picture( r[0][this.current_chapter].author_id).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.Subscribing_service.check_if_visitor_susbcribed(this.authorid).subscribe(information=>{
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
      console.log("getting pages by chapter")
      console.log(r[0])

     
      this.get_comic_serie_chapter_pages(this.bd_id,this.current_chapter+1,r[0][this.current_chapter].pagesnumber);
      this.item_retrieved=true;
    

    });
  }


  get_comic_serie_chapter_pages(bd_id,chapter_number,total_pages) {
    this.pagesnumber=total_pages;
    console.log("get_comic_serie_chapter_pages")
    console.log(chapter_number);
    console.log(total_pages);
    this.list_of_users_ids_loves_retrieved=false;
    this.list_of_users_ids_likes_retrieved=false;
    this.chapter_to_check_for_view=chapter_number;
    this.NotationService.get_content_marks("comic", 'serie', this.bd_id,chapter_number).subscribe(r=>{

      //views and comments
      console.log(r[0])
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
      this.BdSerieService.retrieve_bd_page(bd_id,chapter_number,k).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
        let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        if(this.style=="Manga"){
          this.list_of_pages_by_chapter[chapter_number-1][total_pages-r[1]-1]=(SafeURL);
          console.log(this.list_of_pages_by_chapter[chapter_number-1])
        }
        else{
          this.list_of_pages_by_chapter[chapter_number-1][r[1]]=(SafeURL);
        }
       
        compteur++;
        if(compteur==total_pages){
          this.initialize_thumbnails();
          this.show_pages[chapter_number-1]=true;
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
      console.log(this.list_of_users_ids_likes)
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
        this.navbar.check_if_research_exists("Comic",this.type,this.bd_id,this.title,"clicked").subscribe(p=>{
          if(!p[0].value){
            this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag, this.visitor_status).subscribe(l=>{
            });
          }
        })
        
      }
      else{
        this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag, this.visitor_status).subscribe(l=>{});
        this.NotationService.add_view("comic", 'serie',  this.style, this.bd_id,1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
          this.id_view_created = r[0].id;
          console.log("view added")
          console.log(r[0])
          if(r[0].id>0){
            this.Community_recommendation.delete_recommendations_cookies();
            this.Community_recommendation.generate_recommendations().subscribe(r=>{})
          }
          
        });
                
      };
      this.mode_visiteur_added = true;


    }
  }



  /******************** *********************AFTER VIEW INIT***************** ****************** */

  
  show_icon=false;
  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
    this.open_category(0);
  }



  /**************************************************************************************************/
  /****************************             OPTIONS                   *******************************/
  /**************************************************************************************************/


 
  
    
  

  
  certified_account:boolean;  

  optionOpened:number = -1;
  openOption(i: number) {
    this.optionOpened = i;
  }

  open_account() {
    return "/account/"+this.pseudo+"/"+this.authorid;
    //this.router.navigate([`/account/${this.pseudo}/${this.item.id_user}`]);
  };
  get_link() {
    return "/main-research-style-and-tag/1/Comic/" + this.style + "/all";
  };
  get_style_link(i: number) {
    if( i == 0 ) {
      return "/main-research-style-and-tag/1/Comic/" + this.style + "/" + this.firsttag;
    }
    if( i == 1 ) {
      return "/main-research-style-and-tag/1/Comic/" + this.style + "/" + this.secondtag;
    }
    if( i == 2 ) {
      return "/main-research-style-and-tag/1/Comic/" + this.style + "/" + this.thirdtag;
    }
  }

  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.openOption(-1);
    if(this.full_compt==1){
      this.full_compt=2;
    }
    else if(this.full_compt==2){
      this.full_compt=0;
      this.fullscreen_mode = false;
    }
  }

  see_description() {
    
    this.dialog.open(PopupArtworkDataComponent, {
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

  }

  see_comments() {
    
    this.dialog.open(PopupCommentsComponent, {
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

    console.log(this.pagesnumber-1)
    this.swiper = new Swiper( this.swiperContainerRef.nativeElement, {
      speed: 500,
      spaceBetween: 100,
      simulateTouch: true,
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
          window.dispatchEvent(new Event("resize"));
        },
        slideChange: function () {
          THIS.refresh_swiper_pagination();
        }
      },
    });
    
    console.log(this.swiper)
    
    this.refresh_swiper_pagination();
    $(".top-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSlide( $(".top-container .pages-controller-container input").val() );
      }
    });
    //this.cd.detectChanges();
    //this.swiper.slideTo(3, false,false);
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
        
        //$(".top-container .pages-controller-container .total-pages span").html( "/ " + this.swiper.slides.length );
      }
    }
  }

  setSlide(i : any) {
    console.log("set slide")
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
    if(i==1){
      this.display_drawings_recommendations=false;
      this.display_comics_recommendations=false;
      this.display_writings_recommendations=false;
    }
    else{
      this.display_comics_recommendations_others=false;
    }
    this.left_container_category_index=i;
  }

  


  initialize_thumbnails() {
    console.log("initialize_thumbnails")
    this.thumbnails_links=[];
    if( this.type =='one-shot' ) {
      for( var i=0; i< this.list_bd_pages.length; i++ ) {
        this.thumbnails_links[i]=( this.list_bd_pages[i] );
      }
    }
    else if( this.type=='serie' ) {
      console.log(this.list_of_pages_by_chapter[this.current_chapter])
      for( var i=0; i< this.list_of_pages_by_chapter[this.current_chapter].length; i++ ) {
        this.thumbnails_links[i]=( this.list_of_pages_by_chapter[this.current_chapter][i] );
        if(i==this.list_of_pages_by_chapter[this.current_chapter].length-1){
          this.cd.detectChanges();
        }
      }
    }

  }

  
  s

  
  
  click_thumbnails() {
    if( !this.thumbnails_links.length ) {
      this.initialize_thumbnails();
    }

    if( !this.thumbnails ) {
      (async () => { 
        const getCurrentCity = () => {
        this.rd.setStyle( this.swiperContainerRef.nativeElement, "width", "calc( 100% - 190px )");
        return Promise.resolve('Lyon');
        };
        await getCurrentCity();
        this.swiper.update();
      })();
      this.thumbnails=true;
    }
    else {
      (async () => { 
        const getCurrentCity = () => {
        this.rd.setStyle( this.swiperContainerRef.nativeElement, "width", "calc( 100% )");
        return Promise.resolve('Lyon');
      };
        await getCurrentCity();
        this.swiper.update();

      })();
      this.thumbnails=false;
    }
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

  change_chapter_filter_bottom_to_top(direction){
    let THIS=this;

    if(direction=='up' && this.current_chapter==this.chapterList.length-1){
      return
    }
    if(direction=='down' && this.current_chapter==0){
      return
    }
    
    if(direction=='up'){
      this.chapter_filter_bottom_to_top=false;
    }
    if(direction=='down'){
      this.chapter_filter_bottom_to_top=true;
    }
    
    THIS.display_comics_pages=[];
    THIS.display_pages=false;
    

    let chapter_number =(this.chapter_filter_bottom_to_top)?0:this.chapterList.length-1;
    let last_chapter = THIS.current_chapter;
    let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - THIS.begining_time_of_view;
    

    
    THIS.current_chapter= chapter_number;// le chapitre 1 vaut 0 
    
    THIS.current_chapter_title=THIS.chapterList[chapter_number].title;
    THIS.chapter_name_to_show=`Chapitre ${THIS.chapterList[THIS.current_chapter].chapter_number} : ${ THIS.current_chapter_title}`;
    this.chapter_name_control.reset();
    this.cd.detectChanges();
    $('.chapterSelector').attr("placeholder",this.chapter_name_to_show);
    $('.chapterSelector')[0].sumo.reload();
    this.cd.detectChanges();
    
    

    if (THIS.mode_visiteur){
      THIS.NotationService.add_view_time(ending_time_of_view, THIS.id_view_created).subscribe();
      THIS.NotationService.add_view("comic", 'serie',THIS.style, THIS.bd_id,(chapter_number + 1),THIS.firsttag,THIS.secondtag,THIS.thirdtag,THIS.authorid).subscribe(r=>{
        THIS.id_view_created = r[0].id;
        if(r[0].id>0){
          THIS.Community_recommendation.delete_recommendations_cookies();
          THIS.Community_recommendation.generate_recommendations().subscribe(r=>{})
        }
        THIS.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
      });
    }
    
    THIS.liked = false;
    THIS.loved = false;
    if( THIS.list_of_pages_by_chapter[chapter_number][0]==''){
      console.log("chargement des nouvelles pages");
      console.log(THIS.list_of_pages_by_chapter[chapter_number]);
      THIS.list_of_pages_by_chapter[chapter_number].pop();
      THIS.get_comic_serie_chapter_pages(THIS.bd_id,(chapter_number + 1),THIS.chapterList[chapter_number].pagesnumber);
    }
    else{
      for (let i=0;i<THIS.list_of_users_ids_likes[THIS.current_chapter].length;i++){
        if (THIS.list_of_users_ids_likes[THIS.current_chapter][i].author_id_who_likes == THIS.visitor_id){
          THIS.liked = true;
        }
      }
      for (let i=0;i<THIS.list_of_users_ids_loves[THIS.current_chapter].length;i++){
        if (THIS.list_of_users_ids_loves[THIS.current_chapter][i].author_id_who_loves == THIS.visitor_id){
          THIS.loved = true;
        }
      }
      THIS.viewsnumber=THIS.chapterList[chapter_number].viewnumber;
      THIS.commentariesnumber = THIS.chapterList[chapter_number].commentarynumbers;
      THIS.likesnumber =THIS.chapterList[chapter_number].likesnumber ;
      THIS.lovesnumber =THIS.chapterList[chapter_number].lovesnumber ;
      console.log("pages déjà existantes")
      THIS.initialize_thumbnails();
    }
    THIS.location.go(`/artwork-comic/${THIS.type}/${THIS.title}/${THIS.bd_id}/${chapter_number + 1}`);
  }


  change_chapter(direction){
    let THIS=this;

    if(direction=='next' && this.current_chapter==this.chapterList.length-1){
      return
    }
    if(direction=='before' && this.current_chapter==0){
      return
    }
    
    
    
    THIS.display_comics_pages=[];
    THIS.display_pages=false;
    

    let chapter_number =(direction=='next')?(this.current_chapter+1):(this.current_chapter-1);
    let last_chapter = THIS.current_chapter;
    let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - THIS.begining_time_of_view;
    

    
    THIS.current_chapter= chapter_number;// le chapitre 1 vaut 0 
    
    THIS.current_chapter_title=THIS.chapterList[chapter_number].title;
    THIS.chapter_name_to_show=`Chapitre ${THIS.chapterList[THIS.current_chapter].chapter_number} : ${ THIS.current_chapter_title}`;
    this.chapter_name_control.reset();
    this.cd.detectChanges();
    $('.chapterSelector').attr("placeholder",this.chapter_name_to_show);
    if((THIS.current_chapter+1)>THIS.chapterList.length/2){
      THIS.chapter_filter_bottom_to_top=false;
    }
    else{
      THIS.chapter_filter_bottom_to_top=true;
    }
    $('.chapterSelector')[0].sumo.reload();
    this.cd.detectChanges();
    
    

    if (THIS.mode_visiteur){
      THIS.NotationService.add_view_time(ending_time_of_view, THIS.id_view_created).subscribe();
      THIS.NotationService.add_view("comic", 'serie',THIS.style, THIS.bd_id,(chapter_number + 1),THIS.firsttag,THIS.secondtag,THIS.thirdtag,THIS.authorid).subscribe(r=>{
        THIS.id_view_created = r[0].id;
        if(r[0].id>0){
          THIS.Community_recommendation.delete_recommendations_cookies();
          THIS.Community_recommendation.generate_recommendations().subscribe(r=>{})
        }
        THIS.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
      });
    }
    
    THIS.liked = false;
    THIS.loved = false;
    if( THIS.list_of_pages_by_chapter[chapter_number][0]==''){
      console.log("chargement des nouvelles pages");
      console.log(THIS.list_of_pages_by_chapter[chapter_number]);
      THIS.list_of_pages_by_chapter[chapter_number].pop();
      THIS.get_comic_serie_chapter_pages(THIS.bd_id,(chapter_number + 1),THIS.chapterList[chapter_number].pagesnumber);
    }
    else{
      for (let i=0;i<THIS.list_of_users_ids_likes[THIS.current_chapter].length;i++){
        if (THIS.list_of_users_ids_likes[THIS.current_chapter][i].author_id_who_likes == THIS.visitor_id){
          THIS.liked = true;
        }
      }
      for (let i=0;i<THIS.list_of_users_ids_loves[THIS.current_chapter].length;i++){
        if (THIS.list_of_users_ids_loves[THIS.current_chapter][i].author_id_who_loves == THIS.visitor_id){
          THIS.loved = true;
        }
      }
      THIS.viewsnumber=THIS.chapterList[chapter_number].viewnumber;
      THIS.commentariesnumber = THIS.chapterList[chapter_number].commentarynumbers;
      THIS.likesnumber =THIS.chapterList[chapter_number].likesnumber ;
      THIS.lovesnumber =THIS.chapterList[chapter_number].lovesnumber ;
      console.log("pages déjà existantes")
      THIS.initialize_thumbnails();
    }
    THIS.location.go(`/artwork-comic/${THIS.type}/${THIS.title}/${THIS.bd_id}/${chapter_number + 1}`);
  }


  initialize_chapter_selector(){
    let THIS = this;

   console.log("initializing chapter selectors")

    $(document).ready(function () {
      $('.chapterSelector').SumoSelect({});
      console.log("sumo ready")
      THIS.sumo_ready=true;
    });

    $('.chapterSelector').change(function(){

      if(parseInt($(".chapterSelector").val())==THIS.current_chapter){
        return
      }
      THIS.display_comics_pages=[];
      THIS.display_pages=false;
      

      let chapter_number = $(".chapterSelector").val();
      let last_chapter = THIS.current_chapter;
      let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - THIS.begining_time_of_view;
      

      console.log(parseInt(chapter_number))
      THIS.current_chapter= parseInt(chapter_number);// le chapitre 1 vaut 0 
      if((THIS.current_chapter+1)>THIS.chapterList.length/2){
        THIS.chapter_filter_bottom_to_top=false;
      }
      else{
        THIS.chapter_filter_bottom_to_top=true;
      }
      
      THIS.cd.detectChanges();
      $('.chapterSelector')[0].sumo.reload();

      THIS.current_chapter_title=THIS.chapterList[chapter_number].title;
      THIS.chapter_name_to_show=`Chapitre ${THIS.chapterList[THIS.current_chapter].chapter_number} : ${ THIS.current_chapter_title}`;


      if (THIS.mode_visiteur){
        THIS.NotationService.add_view_time(ending_time_of_view, THIS.id_view_created).subscribe();
        THIS.NotationService.add_view("comic", 'serie',THIS.style, THIS.bd_id,(parseInt(chapter_number) + 1),THIS.firsttag,THIS.secondtag,THIS.thirdtag,THIS.authorid).subscribe(r=>{
          THIS.id_view_created = r[0].id;
          if(r[0].id>0){
            THIS.Community_recommendation.delete_recommendations_cookies();
            THIS.Community_recommendation.generate_recommendations().subscribe(r=>{})
          }
          THIS.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
        });
      }

      THIS.liked = false;
      THIS.loved = false;
      if( THIS.list_of_pages_by_chapter[parseInt(chapter_number)][0]==''){
        console.log("chargement des nouvelles pages");
        console.log(THIS.list_of_pages_by_chapter[parseInt(chapter_number)]);
        THIS.list_of_pages_by_chapter[parseInt(chapter_number)].pop();
        THIS.get_comic_serie_chapter_pages(THIS.bd_id,(parseInt(chapter_number) + 1),THIS.chapterList[parseInt(chapter_number)].pagesnumber);
      }
      else{
        
        console.log("pages déjà existantes");
        for (let i=0;i<THIS.list_of_users_ids_likes[THIS.current_chapter].length;i++){
          if (THIS.list_of_users_ids_likes[THIS.current_chapter][i].author_id_who_likes == THIS.visitor_id){
            THIS.liked = true;
          }
        }
        for (let i=0;i<THIS.list_of_users_ids_loves[THIS.current_chapter].length;i++){
          if (THIS.list_of_users_ids_loves[THIS.current_chapter][i].author_id_who_loves == THIS.visitor_id){
            THIS.loved = true;
          }
        }
        THIS.viewsnumber=THIS.chapterList[chapter_number].viewnumber;
        THIS.commentariesnumber = THIS.chapterList[chapter_number].commentarynumbers;
        THIS.likesnumber =THIS.chapterList[chapter_number].likesnumber ;
        THIS.lovesnumber =THIS.chapterList[chapter_number].lovesnumber ;
        THIS.initialize_thumbnails();
      }
     
      THIS.location.go(`/artwork-comic/${THIS.type}/${THIS.title}/${THIS.bd_id}/${parseInt(chapter_number) + 1}`);
    });

  }

  

  /******************************************************* */
  /******************************************************* */
  /****************** RIGHT CONTROLLER ******************* */
  /******************************************************* */
  /******************************************************* */
  
  click_like() {
    console.log("click like")
    if(this.type_of_account=="account"){
      if(this.like_in_progress){
        return
      }
      if(this.list_of_users_ids_likes_retrieved){
        console.log("list_of_users_ids_likes_retrieved")
        this.like_in_progress=true;
        if(this.liked) {    
          this.liked=false;
          this.likesnumber-=1;
          if(this.type=='one-shot'){
            this.NotationService.remove_like("comic", 'one-shot', this.style, this.bd_id,0).subscribe(r=>{

              let index=this.list_of_users_ids_likes[0].indexOf(this.visitor_id);
              this.list_of_users_ids_likes[0].splice(index,1);
              if(this.authorid==this.visitor_id){
                this.like_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_like','comic','one-shot',this.bd_id,0,false,0).subscribe(l=>{
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
            this.NotationService.remove_like("comic", 'serie', this.style, this.bd_id,this.current_chapter + 1).subscribe(r=>{      

              let index=this.list_of_users_ids_likes[this.current_chapter].indexOf(this.visitor_id);
              this.list_of_users_ids_likes[this.current_chapter].splice(index,1);
              
              if(this.authorid==this.visitor_id){
                this.like_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_like','comic','serie',this.bd_id,this.current_chapter + 1,false,0).subscribe(l=>{
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
            
            this.NotationService.add_like('comic', 'one-shot', this.style, this.bd_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{        

              this.list_of_users_ids_likes[this.current_chapter].splice(0,0,this.visitor_id);
              if(this.authorid==this.visitor_id){
                
                this.like_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.add_notification('publication_like',this.visitor_id,this.visitor_name,this.authorid,'comic',this.title,'one-shot',this.bd_id,0,"add",false,0).subscribe(l=>{
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
                 
            });
          }
          else if(this.type=='serie'){
          
            this.NotationService.add_like("comic", 'serie', this.style, this.bd_id,this.current_chapter + 1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
              this.list_of_users_ids_likes[this.current_chapter].splice(0,0,this.visitor_id);
              
              if(this.authorid==this.visitor_id){
                this.like_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.add_notification('publication_like',this.visitor_id,this.visitor_name,this.authorid,'comic',this.title,'serie',this.bd_id,this.current_chapter + 1,"add",false,0).subscribe(l=>{
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
                
            });
          }
        }
      }
      
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir réagir à la publication'},
        panelClass: "popupConfirmationClass",
      });
    }
  }

  click_love() {
    if(this.type_of_account=="account"){
      if(this.love_in_progress){
        return
      }
      if(this.list_of_users_ids_loves_retrieved){
        this.love_in_progress=true;
        if(this.loved) {   
          this.loved=false;  
          this.lovesnumber+=1;
          if(this.type=='one-shot'){
            this.NotationService.remove_love("comic", 'one-shot', this.style, this.bd_id,0).subscribe(r=>{
              let index=this.list_of_users_ids_loves[0].indexOf(this.visitor_id);
              this.list_of_users_ids_loves[0].splice(index,1);
              //his.list_of_users_ids_loves.splice(index,1);
              
              if(this.authorid==this.visitor_id){
                this.love_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_love','comic','one-shot',this.bd_id,0,false,0).subscribe(l=>{
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
            this.NotationService.remove_love("comic", 'serie', this.style, this.bd_id,this.current_chapter + 1).subscribe(r=>{      

              let index=this.list_of_users_ids_loves[this.current_chapter].indexOf(this.visitor_id);
              this.list_of_users_ids_loves[this.current_chapter].splice(index,1);;
              if(this.authorid==this.visitor_id){
                this.love_in_progress=false;
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.remove_notification('publication_love','comic','serie',this.bd_id,this.current_chapter + 1,false,0).subscribe(l=>{
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
            this.NotationService.add_love("comic", 'one-shot', this.style, this.bd_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{        

              this.list_of_users_ids_loves[this.current_chapter].splice(0,0,this.visitor_id);
                 
                 
                  if(this.authorid==this.visitor_id){
                    this.love_in_progress=false;
                    this.cd.detectChanges();
                  }
                  else{
                    this.NotificationsService.add_notification('publication_love',this.visitor_id,this.visitor_name,this.authorid,'comic',this.title,'one-shot',this.bd_id,0,"add",false,0).subscribe(l=>{
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
              
            });
          }
          else if(this.type=='serie'){
          
            this.NotationService.add_love("comic", 'serie', this.style, this.bd_id,this.current_chapter + 1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{

              this.list_of_users_ids_loves[this.current_chapter].splice(0,0,this.visitor_id);
                             
              if(this.authorid==this.visitor_id){
                this.love_in_progress=false; 
                this.cd.detectChanges();
              }
              else{
                this.NotificationsService.add_notification('publication_love',this.visitor_id,this.visitor_name,this.authorid,'comic',this.title,'serie',this.bd_id,this.current_chapter + 1,"add",false,0).subscribe(l=>{
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
                
            });
          }
        }
      }
      
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir réagir à la publication'},
        panelClass: "popupConfirmationClass",
      });
    }
    
  }

  show_likes(){
    console.log(this.current_chapter)
    console.log(this.list_of_users_ids_likes)
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"likes", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_likes[this.current_chapter],visitor_name:this.visitor_name,visitor_id:this.visitor_id},
      panelClass: 'popupLikesAndLovesClass',
    });

  }

  show_loves(){
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"loves", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_loves[this.current_chapter],visitor_name:this.visitor_name,visitor_id:this.visitor_id},
      panelClass: 'popupLikesAndLovesClass',
    });

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
      if(this.type=='one-shot' && ending_time_of_view>3){
        this.NotationService.add_view_time(ending_time_of_view, this.id_view_created).subscribe();
      }
      if(this.type=='serie' && ending_time_of_view>3){
        this.NotationService.add_view_time(ending_time_of_view, this.id_view_created).subscribe();
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
        this.Subscribing_service.subscribe_to_a_user(this.authorid).subscribe(information=>{
          
          console.log(information)
          if(information[0].subscribtion){
            this.loading_subscribtion=false;
            this.cd.detectChanges();
          }
          else{
            this.NotificationsService.add_notification('subscribtion',this.visitor_id,this.visitor_name,this.authorid,this.authorid.toString(),'none','none',this.visitor_id,0,"add",false,0).subscribe(l=>{
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
        this.Subscribing_service.remove_subscribtion(this.authorid).subscribe(information=>{
         
          console.log(information)
          this.NotificationsService.remove_notification('subscribtion',this.authorid.toString(),'none',this.visitor_id,0,false,0).subscribe(l=>{
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
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir vous abonner'},
        panelClass: "popupConfirmationClass",
      });
    }
  
  }

  archive(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    this.Subscribing_service.archive( "comic",this.type,this.bd_id).subscribe(r=>{
      this.content_archived=true;
      this.archive_loading=false;
    });
  }

  unarchive(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    this.Subscribing_service.unarchive( "comic",this.type,this.bd_id).subscribe(r=>{
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
    this.Reports_service.check_if_content_reported('comic',this.bd_id,this.type,(this.type=='serie')?(this.current_chapter+1):0).subscribe(r=>{
      console.log(r[0])
      if(r[0]){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
        });
      }
      else{
        const dialogRef = this.dialog.open(PopupReportComponent, {
          data: {from_account:false,id_receiver:this.authorid,publication_category:'comic',publication_id:this.bd_id,format:this.type,chapter_number:(this.type=='serie')?(this.current_chapter+1):0},
          panelClass:'popupReportClass'
        });
      }
      this.checking_report=false;
    })
    
  }

  cancel_report(){

    let id=this.bd_id
    this.Reports_service.cancel_report("comic",id,this.type).subscribe(r=>{
      console.log(r)
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
      this.Emphasize_service.emphasize_content( "comic",this.type,this.bd_id,this.current_chapter + 1).subscribe(t=>{
        console.log(t[0])
        this.content_emphasized=true;
        this.archive_loading=false;
      });
    }
    else{
      this.Emphasize_service.emphasize_content( "comic",this.type,this.bd_id,0).subscribe(r=>{
        console.log(r[0])
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
      this.Emphasize_service.remove_emphasizing( "comic",this.type,this.bd_id,this.current_chapter + 1).subscribe(t=>{
        this.content_emphasized=false;
        this.archive_loading=false;
      });
    }
    else{
      this.Emphasize_service.remove_emphasizing( "comic",this.type,this.bd_id,0).subscribe(t=>{
        this.content_emphasized=false;
        this.archive_loading=false;
      });
    }
  }

  /******************************************DISPLAY IMAGES ****************************************/

  profile_picture_loaded(){
    this.pp_loaded=true;
  }



  compteur_recom_others_comics=0
  sendLoadedComicsOthers(event){
    this.compteur_recom_others_comics+=1;
    if( this.compteur_recom_others_comics==this.list_of_recommendations_by_tag.length){
      this.display_comics_recommendations_others=true;
      this.compteur_recom_others_comics=0;
      console.log("display recom comics others")
    }
  }


  a_drawing_is_loaded(i){
    this.display_comics_pages[i]=true;
    
    let compt=0;
    if(this.type=='serie'){
      console.log(this.list_of_pages_by_chapter[this.current_chapter].length)
      console.log(this.display_comics_pages)
      for(let j=0;j<this.list_of_pages_by_chapter[this.current_chapter].length;j++){
        if(this.display_comics_pages[i]){
          compt+=1;
        }
        if(compt==this.list_of_pages_by_chapter[this.current_chapter].length){
          this.initialize_swiper();
          if(this.style=="Manga"){
            this.swiper.slideTo(this.pagesnumber,false,false);
          }
          else{
            this.swiper.slideTo(0,false,false);
          }
          this.display_pages=true;
        }
      }
    }
    else{
      for(let j=0;j<this.list_bd_pages.length;j++){
        if(this.display_comics_pages[i]){
          compt+=1;
        }
        if(compt==this.list_bd_pages.length){
          this.initialize_swiper();
          if(this.style=="Manga"){
            this.swiper.slideTo(this.pagesnumber,false,false);
          }
          else{
            this.swiper.slideTo(0,false,false);
          }
          this.display_pages=true;
        }
      }
    }
    
  }



   /******************************************************************** */
  /****VARIABLES ET FONCTIONS D'EDITION******************************** */
  /******************************************************************** */

  edit_information() {
    const dialogRef = this.dialog.open(PopupFormComicComponent, {
      data: {
        format:this.type, 
        bd_id: this.bd_id, 
        title: this.title, 
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
        current_chapter:this.current_chapter
      },
      panelClass: 'popupFormComicClass',
    });
  }
  edit_thumbnail() {
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
  }

  edit_chapters(){
    this.router.navigateByUrl( `handle-comics-chapter/${this.bd_id}`);
    return;
  }
  
  archive_loading=false;
  set_private() {

    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de passer cette œuvre en privé ? Elle ne sera visible que par vous dans les archives'},
      panelClass: "popupConfirmationClass",
    });

    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        if(this.type=="one-shot"){
          this.Subscribing_service.change_content_status( "comic",this.type,this.bd_id,0,"private").subscribe(r=>{
            console.log(r)
            this.BdOneShotService.change_oneshot_comic_status(this.bd_id,"private").subscribe(r=>{
              this.status="private";
              this.archive_loading=false;
            });
          })
        }
        else{
          this.Subscribing_service.change_content_status( "comic",this.type,this.bd_id,this.chapterList.length,"private").subscribe(r=>{
            this.BdSerieService.change_serie_comic_status(this.bd_id,"private").subscribe(r=>{
              this.status="private";
              this.archive_loading=false;
            });
          })
        }

      }
      else{
        this.archive_loading=false;
      }
    });
  }
  set_public() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de passer cette œuvre en public ? Elle sera visible par tous les utilisateurs'},
      panelClass: "popupConfirmationClass",
    });
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        if(this.type=="one-shot"){
          this.Subscribing_service.change_content_status( "comic",this.type,this.bd_id,0,"ok").subscribe(r=>{
            this.BdOneShotService.change_oneshot_comic_status(this.bd_id,"public").subscribe(r=>{
              this.status="public";
              this.archive_loading=false;
            });
          })
          
        }
        else{
          this.Subscribing_service.change_content_status( "comic",this.type,this.bd_id,this.chapterList.length,"ok").subscribe(r=>{
            this.BdSerieService.change_serie_comic_status(this.bd_id,"public").subscribe(r=>{
              this.status="public";
              this.archive_loading=false;
            });
          })
          
        }
          
      }
      else{
        this.archive_loading=false;
      }
    });
  }

  
  remove_artwork() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer cette œuvre ? Toutes les données associées seront définitivement supprimées'},
      panelClass: "popupConfirmationClass",
    });
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        if(this.type=="one-shot"){
          this.navbar.delete_publication_from_research("Comic",this.type,this.bd_id).subscribe(r=>{
           
            this.BdOneShotService.RemoveBdOneshot(this.bd_id).subscribe(r=>{
              this.NotificationsService.remove_notification('add_publication','comic','one-shot',this.bd_id,0,false,0).subscribe(l=>{
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
                this.router.navigateByUrl( `/account/${this.pseudo}/${this.authorid}`);
                return;
              })
            
            });
          })
         
        }
        else{
         

          this.navbar.delete_publication_from_research("Comic",this.type,this.bd_id).subscribe(r=>{
            this.BdSerieService.RemoveBdSerie(this.bd_id).subscribe(r=>{
              this.NotificationsService.remove_notification('add_publication','comic','serie',this.bd_id,0,false,0).subscribe(l=>{
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
                this.router.navigateByUrl( `/account/${this.pseudo}/${this.authorid}`);
                return;
              })
            });
            
          })
        }

      }
      else{
        this.archive_loading=false;
      }
    });
  }



  first_comment_received(e){
    console.log(e);
    this.first_comment=e.comment.commentary;
    this.Profile_Edition_Service.retrieve_profile_picture(e.comment.author_id_who_comments).subscribe(p=> {
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

}


