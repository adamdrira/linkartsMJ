import { Component, OnInit, Renderer2, ViewChild, ElementRef, ViewChildren, QueryList, Sanitizer, ChangeDetectorRef, Input, HostListener } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { Writing_Upload_Service } from '../services/writing.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Community_recommendation } from '../services/recommendations.service';
import { NotationService } from '../services/notation.service';
import { Emphasize_service } from '../services/emphasize.service';
import { AuthenticationService } from '../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormWritingComponent } from '../popup-form-writing/popup-form-writing.component';
import { PopupEditCoverWritingComponent } from '../popup-edit-cover-writing/popup-edit-cover-writing.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupLikesAndLovesComponent } from '../popup-likes-and-loves/popup-likes-and-loves.component';

import {NotificationsService} from '../services/notifications.service';
import { ChatService} from '../services/chat.service';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { Location } from '@angular/common';

declare var Swiper: any;
declare var $: any;


@Component({
  selector: 'app-artwork-writing',
  templateUrl: './artwork-writing.component.html',
  styleUrls: ['./artwork-writing.component.scss']
})
export class ArtworkWritingComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.add_time_of_view();
  }



  constructor(
    public navbar: NavbarService,
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    public route :ActivatedRoute,
    private location:Location,
    private activatedRoute: ActivatedRoute,
    private sanitizer:DomSanitizer,
    private cd: ChangeDetectorRef,
    private AuthenticationService:AuthenticationService,
    private router:Router,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Profile_Edition_Service:Profile_Edition_Service,
    private Subscribing_service:Subscribing_service,
    private Community_recommendation:Community_recommendation,
    public dialog: MatDialog,
    private NotationService:NotationService,
    private Emphasize_service:Emphasize_service,
    ) { 
      this.AuthenticationService.currentUserType.subscribe(r=>{
        console.log(r);
        if(r!=''){
          this.type_of_account=r;
          this.type_of_account_retrieved=true;
          if(this.pp_loaded){
            this.display_right_container=true;
          }
        }
        
      })
    this.fullscreen_mode = false;
    this.navbar.setActiveSection(0);
    this.navbar.show();
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {

  }


  @ViewChildren('category') categories:QueryList<ElementRef>;
  @ViewChild('leftContainer') leftContainer:ElementRef;
  @ViewChild('swiperWrapper') swiperWrapperRef:ElementRef;
  @ViewChild('swiperContainer') swiperContainerRef:ElementRef;
  @ViewChildren('swiperSlide') swiperSlides:QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailsRef:QueryList<ElementRef>;


  //display component
  display_right_container=false;
  pp_loaded=false;
  display_pages=false;
  display_writings_recommendations=false;
  display_comics_recommendations=false;
  display_drawings_recommendations=false;
  display_writing=false;
  display_writings_recommendations_others=false;
  //if user doesn't have an account
  type_of_account:string;
  type_of_account_retrieved=false;
  //for list of loves and likes
  list_of_users_ids_loves:any[]=[];
  list_of_users_ids_likes:any[]=[];
  //archives
  content_archived=false;
  archive_retrieved=false;
  //Swiper
  swiper: any;
  swiperComics: any;
  swiperDrawings: any;
  swiperWritings: any;

  //Thumbnails
  thumbnails: boolean;
  thumbnails_links: string[] = [];
  //Zoom mode
  //zoom_mode: boolean;
  //Fullscreen mode
  fullscreen_mode: boolean;

  //0 : description, 1 : comments
  category_index: number = 0;
  //Liked or/and loved contents
  liked: boolean=false;
  like_in_progress=false;
  loved:boolean=false;
  love_in_progress=false;
  status:string;
  total_pages:number;
  pdfSrc:SafeUrl;
  
  zoom: number = 1.0;

  writing_id:number;
  viewnumber:number;
  commentariesnumber:number;
  highlight:string;
  title:string;
  style:string;
  firsttag:string;
  secondtag:string;
  thirdtag:string;
  pseudo:string='';
  authorid:any;
  user_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  lovesnumber:string;
  likesnumber:string;
  thumbnail_picture:string;

  date_upload_to_show:string;
  date_upload:string;

  begining_time_of_view:number=Math.trunc( new Date().getTime()/1000);
  id_view_created:number;
  already_subscribed:boolean=false;

  list_of_author_recommendations_comics:any[]=[];
  list_of_author_recommendations_comics_retrieved=false;
  list_of_author_recommendations_drawings:any[]=[];
  list_of_author_recommendations_drawings_retrieved=false;
  list_of_author_recommendations_writings:any[]=[];
  list_of_author_recommendations_writings_retrieved=false;
  list_of_author_recommendations_retrieved=false;

  list_of_recommendations_by_tag:any[]=[];
  list_of_recommendations_by_tag_retrieved=false;

  now_in_seconds= Math.trunc( new Date().getTime()/1000);

  arrayOne(n: number): any[] {
    return Array(n);
  }

  content_emphasized=false;


  visitor_id:number;
  visitor_name:string;
  mode_visiteur = true;
  mode_visiteur_added = false; 
  visible:boolean = false;





  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {

    
    this.writing_id  = parseInt(this.activatedRoute.snapshot.paramMap.get('writing_id'));
    if(!(this.writing_id>0)){
      this.router.navigateByUrl('/page_not_found');
        return
    }

    this.Writing_Upload_Service.retrieve_writing_information_by_id(this.writing_id).subscribe(r => {
      if(!r[0] || r[0].status=="deleted"){
        this.router.navigateByUrl("/page_not_found");
        return;
      }
      else{
        let title =this.activatedRoute.snapshot.paramMap.get('title');
        if(r[0].title !=title ){
          this.router.navigateByUrl("/page_not_found");
          return;
        }
        else{
          
          let file_name=r[0].file_name;
          this.authorid=r[0].authorid;
          this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).subscribe(r=>{
            this.pseudo = r[0].nickname;
          });
          this.Emphasize_service.get_emphasized_content(r[0].authorid).subscribe(l=>{
            if (l[0]!=null && l[0]!=undefined){
              if (l[0].publication_id==this.writing_id && l[0].publication_category=="writing"){
                this.content_emphasized=true;
              }
            }
          });
    
          this.viewnumber = r[0].viewnumber;
          this.commentariesnumber = r[0].commentarynumbers;
          this.highlight=r[0].highlight;
          this.title=r[0].title;
          this.style=r[0].category;
          this.firsttag=r[0].firsttag;
          this.secondtag=r[0].secondtag;
          this.thirdtag=r[0].thirdtag;
          this.likesnumber =r[0].likesnumber ;
          this.lovesnumber =r[0].lovesnumber ;
          this.status=r[0].status;
          this.thumbnail_picture=r[0].name_coverpage ;
          this.date_upload_to_show = get_date_to_show( date_in_seconds(this.now_in_seconds,r[0].createdAt) );
    
          this.Community_recommendation.get_comics_recommendations_by_author(r[0].authorid,0).subscribe(e=>{
            if(e[0].list_to_send.length>0){
              this.list_of_author_recommendations_comics=e[0].list_to_send;
              this.list_of_author_recommendations_comics_retrieved=true;
            }
            this.Community_recommendation.get_drawings_recommendations_by_author(this.authorid,0).subscribe(e=>{
              if(e[0].list_to_send.length >0){
                console.log(e);
                this.list_of_author_recommendations_drawings=e[0].list_to_send;
                this.list_of_author_recommendations_drawings_retrieved=true;
              }
              this.Community_recommendation.get_writings_recommendations_by_author(this.authorid,this.writing_id).subscribe(e=>{
                if(e[0].list_to_send.length >0){
                  this.list_of_author_recommendations_writings=e[0].list_to_send;
                  this.list_of_author_recommendations_writings_retrieved=true;
                }
                this.list_of_author_recommendations_retrieved=true;
                this.cd.detectChanges();
    
    
    
              });
            });
          });
    
          this.get_recommendations_by_tag();
          
          this.Community_recommendation.get_recommendations_by_tag(r[0].authorid,"writing",this.writing_id,"writing",r[0].category,r[0].firsttag).subscribe(e=>{
            if(e[0].list_to_send.length >0){
              this.list_of_recommendations_by_tag=e[0].list_to_send;
              this.list_of_recommendations_by_tag_retrieved=true;
            }
          });
    
          this.Subscribing_service.check_if_visitor_susbcribed(r[0].authorid).subscribe(information=>{
            if(information[0].value){
              this.already_subscribed=true;
            }
          });
          
          this.Profile_Edition_Service.get_current_user().subscribe(l=>{
            this.visitor_id=l[0].id;
            this.visitor_name=l[0].firstname + ' ' + l[0].lastname;
            if (this.authorid == l[0].id){
              this.mode_visiteur = false;
              this.mode_visiteur_added = true;
            }
            else{
              this.NotationService.add_view('writing',  "unknown", r[0].category, this.writing_id,0,r[0].firsttag,r[0].secondtag,r[0].thirdtag,this.authorid).subscribe(r=>{
                this.id_view_created = r[0].id;
              });
              this.Subscribing_service.check_if_visitor_susbcribed(this.authorid).subscribe(information=>{
                if(information[0].value){
                  this.already_subscribed=true;
                  this.mode_visiteur_added = true;
                }
                else{
                  this.mode_visiteur_added = true;
                }
              });         
            }  
            if(!this.mode_visiteur){
              this.navbar.check_if_research_exists("Writing","unknown",this.writing_id,title,"clicked").subscribe(p=>{
                if(!p[0].value){
                  this.navbar.add_main_research_to_history("Writing","unknown",this.writing_id,title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe();
                }
              })
            }
            else{
              this.navbar.add_main_research_to_history("Writing","unknown",this.writing_id,title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe();
            }this.check_archive();
          });
          
          this.NotationService.get_loves('writing',  "unknown", r[0].category, this.writing_id,0).subscribe(r=>{
            let list_of_loves= r[0];
            if (list_of_loves.length != 0){
            this.Profile_Edition_Service.get_current_user().subscribe(l=>{
              for (let i=0;i<list_of_loves.length;i++){
                this.list_of_users_ids_loves.push(list_of_loves[i].author_id_who_loves);
                if (list_of_loves[i].author_id_who_loves == l[0].id){
                  this.loved = true;
                }
              }
            });
          }
          });
          this.NotationService.get_likes('writing',  "unknown", r[0].category, this.writing_id,0).subscribe(r=>{
            let list_of_likes= r[0];
            if (list_of_likes.length != 0){
            this.Profile_Edition_Service.get_current_user().subscribe(l=>{
              for (let i=0;i<list_of_likes.length;i++){
                this.list_of_users_ids_likes.push(list_of_likes[i].author_id_who_likes);
                if (list_of_likes[i].author_id_who_likes == l[0].id){
                  this.liked = true;
                }
              }
            });
          }
          });
          
    
          this.Writing_Upload_Service.retrieve_writing_by_name(file_name).subscribe(r=>{
            let file = new Blob([r], {type: 'application/pdf'});
            this.pdfSrc = URL.createObjectURL(file);
          });
    
          this.Profile_Edition_Service.retrieve_profile_picture( r[0].authorid).subscribe(r=> {
            let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.profile_picture = SafeURL;
            
          });
    
          this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).subscribe(r=> {
            this.user_name = r[0].firstname + ' ' + r[0].lastname;
            this.primary_description=r[0].primary_description;
          });
        }
      }

      

    });


  }



  get_recommendations_by_tag(){
    this.Community_recommendation.get_artwork_recommendations_by_tag('Writing',"unknown",this.writing_id,this.style,this.firsttag,6).subscribe(u=>{
      if(u[0].length>0){
        console.log(u[0])
        let list_of_first_propositions=u[0];
        console.log(list_of_first_propositions)
        if(list_of_first_propositions.length<6 && this.secondtag){
          this.Community_recommendation.get_artwork_recommendations_by_tag('Writing',"unknown",this.writing_id,this.style,this.secondtag,6-list_of_first_propositions.length).subscribe(r=>{
            if(r[0].length>0){
              console.log(r[0])
              let len=list_of_first_propositions.length;
              for(let j=0;j<r[0].length;j++){
                let ok=true;
                for(let k=0;k<len;k++){
                  if(  list_of_first_propositions[k].format==r[0][j].format && list_of_first_propositions[k].target_id==r[0][j].target_id){
                    ok=false;
                  }
                  if(k==len-1){
                    if(ok){
                      list_of_first_propositions.push(r[0][j])
                    }
                  }
                }
              }
              console.log(list_of_first_propositions)
              this.get_recommendations_by_tags_contents(list_of_first_propositions)
            }
            else{
              this.get_recommendations_by_tags_contents(list_of_first_propositions)
            }
          })
        }
        else{
          this.get_recommendations_by_tags_contents(list_of_first_propositions)
        }
      }
      else{
        this.list_of_recommendations_by_tag_retrieved=true;
      }
      
    })
  }

  get_recommendations_by_tags_contents(list_of_first_propositions){
    let len=list_of_first_propositions.length;
    let indice=0;
    for(let k=0;k<len;k++){
      if( list_of_first_propositions[k].format=="unknown" && list_of_first_propositions[k].target_id==this.writing_id){
        indice=k;
      }
      if(k==len-1){
        list_of_first_propositions.splice(indice,1);
        console.log(list_of_first_propositions)
        let compteur_propositions=0;
        if(list_of_first_propositions.length>0){
          for(let i=0;i<list_of_first_propositions.length;i++){
              this.Writing_Upload_Service.retrieve_writing_information_by_id(list_of_first_propositions[i].target_id).subscribe(comic=>{
                this.list_of_recommendations_by_tag[i]=comic[0];
                compteur_propositions++;
                if(compteur_propositions==list_of_first_propositions.length){
                  console.log(this.list_of_recommendations_by_tag);
                  this.list_of_recommendations_by_tag_retrieved=true;
                }
              })
          }
        }
        else{
          this.list_of_recommendations_by_tag_retrieved=true;
        }
        
      }
    }
  }


  check_archive(){
    this.Subscribing_service.check_if_publication_archived("writing","unknown" ,this.writing_id).subscribe(r=>{
      if(r[0].value){
        this.content_archived=true;
      }
      this.archive_retrieved=true;
    })
  }

  


  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */
  ngAfterViewInit() {

    let THIS = this;
    this.open_category(0);
    $(".top-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSlide( $(".top-container .pages-controller-container input").val() );
      }
    });

    
  }

  
  /******************************************************* */
  /******************** AFTER VIEW CHECKED *************** */
  /******************************************************* */
  ngAfterViewChecked() {
    this.initialize_heights();
    
  }

  


  /******************************************************* */
  /******************************************************* */
  /******************* LEFT CONTROLLER ******************* */
  /******************************************************* */
  /******************************************************* */


  initialize_swiper() {
    
    let THIS = this;

    this.swiper = new Swiper('.swiper-container.artwork', {
      speed: 500,
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
      on: {
        slideChange: function () {
          THIS.refresh_controls_pagination();
        },
      },
    });
    
  }



  

  refresh_controls_pagination() {
    $(".top-container .pages-controller-container input").val( this.swiper.activeIndex + 1 );
    $(".top-container .pages-controller-container .total-pages span").html( "/ " + this.swiper.slides.length );
  }


  setSlide(i : any) {
    if( isNaN(i) ) {
      return;
    }
    else if ( (Number(i)<1) || (Number(i)> this.total_pages ) ) {
      this.refresh_controls_pagination();
      return;
    }
    else {
      this.swiper.slideTo( Number(i) - 1 );
    }
  }



  click_thumbnails() {
    this.thumbnails = !this.thumbnails;

    this.cd.detectChanges();
    window.dispatchEvent(new Event("resize"));
    this.cd.detectChanges();
  }

  zoom_button() {
    if( this.zoom == 1.3 ) {
      this.zoom = 1;
    }
    else {
      this.zoom = 1.3;
    }
  }


  fullscreen_button() {
 
    const elem = this.leftContainer.nativeElement;
    if( !this.fullscreen_mode ) {
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
      document.exitFullscreen();
      this.fullscreen_mode = false;
    }
  }

  

  open_category(i : number) {
    this.category_index=i;
    this.categories.toArray().forEach( (item, index) => {
      item.nativeElement.classList.remove("opened");
    })
    this.categories.toArray()[this.category_index].nativeElement.classList.add("opened");

  }
  

  left_container_category_index: number = 0;
  open_left_container_category(i : number) {
    if(i==1){
      this.display_drawings_recommendations=false;
      this.display_comics_recommendations=false;
      this.display_comics_recommendations=false;
    }
    else{
      this.display_writings_recommendations_others=false;
    }
    this.left_container_category_index=i;
  }

  /******************************************************* */
  /******************************************************* */
  /****************** RIGHT CONTROLLER ******************* */
  /******************************************************* */
  /******************************************************* */
 
  click_like() {
    if(this.type_of_account=="account"){
      this.like_in_progress=true;
      if(this.liked) {        
          this.NotationService.remove_like('writing', "unknown", this.style, this.writing_id,0).subscribe(r=>{      
              
            this.likesnumber=r[0].likesnumber;
            if(this.authorid==this.visitor_id){
              this.liked=false;
              this.like_in_progress=false;
              this.cd.detectChanges();
            }
            else{
              this.NotificationsService.remove_notification('publication_like','writing','unknown',this.writing_id,0,false,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"publication_like",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  id_receiver:this.authorid, 
                  publication_category:'writing',
                  format:'unknown',
                  publication_id:this.writing_id,
                  chapter_number:0,
                  information:"remove",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.chatService.messages.next(message_to_send);
                this.liked=false;
                this.like_in_progress=false;
                this.cd.detectChanges();
              })
            }
          
          });
      }
      else {
        
          this.NotationService.add_like('writing', "unknown", this.style, this.writing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
              
            this.likesnumber=r[0].likesnumber;
            if(this.authorid==this.visitor_id){
              this.liked=true;
              this.like_in_progress=false;
              this.cd.detectChanges();
            }
            else{
              this.NotificationsService.add_notification('publication_like',this.visitor_id,this.visitor_name,this.authorid,'writing',this.title,'unknown',this.writing_id,0,"add",false,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"publication_like",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  id_receiver:this.authorid,
                  publication_category:'writing',
                  publication_name:this.title,
                  format:'unknown',
                  publication_id:this.writing_id,
                  chapter_number:0,
                  information:"add",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.chatService.messages.next(message_to_send);
                this.liked=true;
                this.like_in_progress=false;
                this.cd.detectChanges();
              })
            } 
          });
      }
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir réagir à la publication'},
      });
    }
  }

  click_love() {
    if(this.type_of_account=="account"){
      this.love_in_progress=true;
      if(this.loved) {      
          this.NotationService.remove_love('writing', "unknown", this.style, this.writing_id,0).subscribe(r=>{      
            

            this.lovesnumber=r[0].lovesnumber;
            if(this.authorid==this.visitor_id){
              this.loved=false;
              this.love_in_progress=false;
              this.cd.detectChanges();
            }
            else{
              this.NotificationsService.remove_notification('publication_love','writing','unknown',this.writing_id,0,false,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"publication_love",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  id_receiver:this.authorid, 
                  publication_category:'writing',
                  format:'unknown',
                  publication_id:this.writing_id,
                  chapter_number:0,
                  information:"remove",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.chatService.messages.next(message_to_send);
                this.loved=false;
                this.love_in_progress=false;
                this.cd.detectChanges();
              })
            }
          
          });
        
      }
      else {      
          this.NotationService.add_love('writing', "unknown", this.style, this.writing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
            this.lovesnumber=r[0].lovesnumber;
                           
            if(this.authorid==this.visitor_id){
              this.loved=true;
              this.love_in_progress=false; 
              this.cd.detectChanges();
            }
            else{
              this.NotificationsService.add_notification('publication_love',this.visitor_id,this.visitor_name,this.authorid,'writing',this.title,'unknown',this.writing_id,0,"add",false,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"publication_love",
                  id_user_name:this.visitor_name,
                  id_user:this.visitor_id, 
                  id_receiver:this.authorid,
                  publication_category:'writing',
                  publication_name:this.title,
                  format:'unknown',
                  publication_id:this.writing_id,
                  chapter_number:0,
                  information:"add",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.chatService.messages.next(message_to_send);
                this.loved=true;
                this.love_in_progress=false; 
                this.cd.detectChanges();
              }) 
            }   
          });
      }
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir réagir à la publication'},
      });
    }

  }

  scroll_to_comments() {
    document.getElementById("scrollToComments").scrollIntoView();
    this.open_category(1);
  }

  
  new_comment() {
    this.commentariesnumber ++;
  }

  removed_comment() {
    this.commentariesnumber --;
  }
  

  initialize_heights() {
    //if( !this.fullscreen_mode ) {
      $('#left-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      $('#right-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
    //}
  }

  add_time_of_view(){
    if(this.mode_visiteur){
      let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - this.begining_time_of_view;
      if (ending_time_of_view>3){
        this.NotationService.add_view_time(ending_time_of_view,this.id_view_created).subscribe();
        }
      }
  }


  subscribtion(){
    if(this.type_of_account=="account"){
      if(!this.already_subscribed){
        this.Subscribing_service.subscribe_to_a_user(this.authorid).subscribe(information=>{
          this.already_subscribed=true;
        });
      }
      if(this.already_subscribed){
        this.Subscribing_service.remove_subscribtion(this.authorid).subscribe(information=>{
          this.already_subscribed=false;
        });
      }
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir vous abonner'},
      });
    }
  }

  archive(){
    this.Subscribing_service.archive("writings","unknown",this.writing_id).subscribe(r=>{
      this.content_archived=true;
    });
  }
  unarchive(){
    this.Subscribing_service.unarchive("writings","unknown",this.writing_id).subscribe(r=>{
      this.content_archived=false;
    });
  }

  emphasize(){
    this.Emphasize_service.emphasize_content("writing","unknown",this.writing_id,0).subscribe(r=>{
      this.content_emphasized=true;
    });
  }

  remove_emphasizing(){
      this.Emphasize_service.remove_emphasizing("writing","unknown",this.writing_id,0).subscribe(t=>{
        this.content_emphasized=false;
      });
  }

  show_likes(){
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"likes", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_likes},
    });

  }

  show_loves(){
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"loves", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_loves},
    });

  }


 /******************************************DISPLAY IMAGES ****************************************/

 profile_picture_loaded(){
  this.pp_loaded=true;
  if(this.type_of_account_retrieved){
    this.display_right_container=true;
  }
}

compteur_recom_writings=0;
sendLoadedWriting(event){
  this.compteur_recom_writings+=1;
  if( this.compteur_recom_writings==this.list_of_author_recommendations_writings.length){
    this.display_writings_recommendations=true;
    this.compteur_recom_writings=0;
    console.log("display recom writi")
  }
}

compteur_recom_comics=0;
sendLoadedComic(event){
  this.compteur_recom_comics+=1;
  if( this.compteur_recom_comics==this.list_of_author_recommendations_comics.length){
    this.display_comics_recommendations=true;
    this.compteur_recom_comics=0;
    console.log("display recom comics")
  }
}

compteur_recom_drawings=0;
sendLoadedDrawing(event){
  this.compteur_recom_drawings+=1;
  if( this.compteur_recom_drawings==this.list_of_author_recommendations_drawings.length){
    this.display_drawings_recommendations=true;
    this.compteur_recom_drawings=0;
    console.log("display recom draw")
  }
 
}
compteur_recom_others_writings=0
sendLoadedWritingsOthers(event){
  this.compteur_recom_others_writings+=1;
  if( this.compteur_recom_others_writings==this.list_of_recommendations_by_tag.length){
    this.display_writings_recommendations_others=true;
    this.compteur_recom_others_writings=0;
    console.log("display recom writings others")
  }
}

afterLoadComplete(pdf: PDFDocumentProxy, i: number) {
  this.total_pages = pdf.numPages;
  this.cd.detectChanges();
  
  if( (i+1) == this.total_pages ) {
    this.initialize_swiper();
    this.refresh_controls_pagination();
    this.display_writing=true;
    this.display_pages=true;
  };
  
}

pdf_is_loaded(){
  console.log("laod compelte")
  
 
}


 /******************************************************************** */
  /****FONCTIONS D'EDITION******************************** */
  /******************************************************************** */
  //visible : true ou privé : false
 
  edit_information() {
    const dialogRef = this.dialog.open(PopupFormWritingComponent, {
      data: { 
      writing_id: this.writing_id, 
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
    });
  }

  edit_thumbnail() {
    const dialogRef = this.dialog.open(PopupEditCoverWritingComponent, {
      data: {type:"edit_comic_thumbnail",
      writing_id: this.writing_id,
      title: this.title,
      style:this.style, 
      firsttag:this.firsttag,
      author_name: this.user_name,
      primary_description: this.primary_description, 
      profile_picture: this.profile_picture,
      thumbnail_picture:this.thumbnail_picture
    },
    });
  }

  

  set_private() {

    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de passer cette œuvre en privé ? Elle ne sera visible que par vous dans les archives'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        this.Subscribing_service.change_content_status("writing","unknown",this.writing_id,0,"private").subscribe(r=>{
          console.log(r);
          this.Writing_Upload_Service.change_writing_status(this.writing_id,"private").subscribe(r=>{
            this.status="private";
          });
        })
        
      }
    });
  }
  set_public() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de passer cette œuvre en public ? Elle sera visible par tous les utilisateurs'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        this.Subscribing_service.change_content_status("writing","unknown",this.writing_id,0,"ok").subscribe(r=>{
          console.log(r);
          this.Writing_Upload_Service.change_writing_status(this.writing_id,"public").subscribe(r=>{
            this.status="public";
          });
        })
       
      }
    });
  }

  remove_artwork() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer cette œuvre ? Toutes les données associées seront définitivement supprimées'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        console.log(this.writing_id);
        this.Writing_Upload_Service.Remove_writing(this.writing_id).subscribe(r=>{
          this.navbar.delete_publication_from_research("Writing","unknown",this.writing_id).subscribe(r=>{
            this.NotificationsService.remove_notification('add_publication','writing','unknown',this.writing_id,0,false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"add_publication",
                id_user_name:this.visitor_name,
                id_user:this.visitor_id, 
                id_receiver:this.authorid, 
                publication_category:'writing',
                format:'unknown',
                publication_id:this.writing_id,
                chapter_number:0,
                information:"remove",
                status:"unchecked",
                is_comment_answer:false,
                comment_id:0,
              }
              this.chatService.messages.next(message_to_send);
              this.router.navigateByUrl( `/account/${this.pseudo}/${this.authorid}`);
              return;
            })
          })
        });

      }
    });
  }


}


