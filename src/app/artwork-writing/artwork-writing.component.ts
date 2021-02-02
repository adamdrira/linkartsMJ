import { Component, OnInit, Renderer2, ViewChild, ElementRef, ViewChildren, QueryList, Sanitizer, ChangeDetectorRef, Input, HostListener } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { Writing_Upload_Service } from '../services/writing.service';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute, Router, Scroll } from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Reports_service } from '../services/reports.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Community_recommendation } from '../services/recommendations.service';
import { NotationService } from '../services/notation.service';
import { Emphasize_service } from '../services/emphasize.service';
import { AuthenticationService } from '../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormWritingComponent } from '../popup-form-writing/popup-form-writing.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupLikesAndLovesComponent } from '../popup-likes-and-loves/popup-likes-and-loves.component';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import {NotificationsService} from '../services/notifications.service';
import { ChatService} from '../services/chat.service';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { Location } from '@angular/common';

import { PopupEditCoverComponent } from '../popup-edit-cover/popup-edit-cover.component';
import { PopupCommentsComponent } from '../popup-comments/popup-comments.component';
import { PopupArtworkDataComponent } from '../popup-artwork-data/popup-artwork-data.component';
import { trigger, transition, style, animate } from '@angular/animations';

declare var Swiper: any;
declare var $: any;


@Component({
  selector: 'app-artwork-writing',
  templateUrl: './artwork-writing.component.html',
  styleUrls: ['./artwork-writing.component.scss'],
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
export class ArtworkWritingComponent implements OnInit {




  constructor(
    private Reports_service:Reports_service,
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
    private rd:Renderer2,
    ) { 
      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      };
      this.fullscreen_mode = false;
      this.navbar.setActiveSection(-1);
      this.navbar.show();
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }


  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.add_time_of_view();
  }


  @ViewChild('leftContainer') leftContainer:ElementRef;
  @ViewChildren('swiperSlide') swiperSlides:QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailsRef:QueryList<ElementRef>;
  @ViewChild('slide') slide:ElementRef;


  thumbnail_picture_retrieved=false;
  //display component
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
  
  page_number=1;

  writing_id:number;
  viewsnumber:number;
  commentariesnumber:number;
  highlight:string;
  title:string;
  style:string;
  monetization:string;
  firsttag:string;
  secondtag:string;
  thirdtag:string;
  pseudo:string='';
  authorid:any;
  user_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  lovesnumber:number;
  list_of_loves:any;
  likesnumber:number;
  list_of_likes:any;
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

  list_of_users_ids_loves_retrieved=false;
  list_of_users_ids_likes_retrieved=false;

  arrayOne(n: number): any[] {
    return Array(n);
  }

  content_emphasized=false;


  visitor_id:number;
  visitor_name:string;
  visitor_status:string;
  mode_visiteur = true;
  mode_visiteur_added = false; 
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
  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {
    let THIS=this;
    window.scroll(0,0);
    setInterval(() => {

      if( this.commentariesnumber && this.myScrollContainer && this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.7){
        if(this.number_of_comments_to_show<this.commentariesnumber){
          this.number_of_comments_to_show+=10;
          console.log(this.number_of_comments_to_show)
        }
      }
    },3000)

    this.writing_id  = parseInt(this.activatedRoute.snapshot.paramMap.get('writing_id'));
    if(!(this.writing_id>0)){
      this.page_not_found=true;
      return
    }

    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
      this.visitor_id = l[0].id;
      this.visitor_name=l[0].nickname;
      this.visitor_status=l[0].status;
      this.type_of_account=l[0].status;
        this.type_of_account_retrieved=true;
      this.current_user_retrieved=true;
      this.check_view_after_current();
      this.check_loves_after_current();
      this.check_likes_after_current();
     
    }) 

    this.Writing_Upload_Service.retrieve_writing_information_by_id2(this.writing_id).subscribe(m => {
      if(m[0]){
        let r=m[0].data;
        console.log(r[0]);
        if(!r[0] || r[0].status=="deleted" || r[0].status=="suspended" || (r[0].authorid!=m[0].current_user && r[0].status!="public")){
          if(r[0] && r[0].status=="deleted"){
            this.navbar.delete_research_from_navbar("Writing","unknown",this.writing_id).subscribe(r=>{
              this.page_not_found=true;
              this.cd.detectChanges();
              return
            });
          }
          else{
            this.page_not_found=true;
            this.cd.detectChanges();
            return
          }
        }
        else{
          let title =this.activatedRoute.snapshot.paramMap.get('title');
          if(r[0].title !=title ){
            this.page_not_found=true;
            return;
          }
          else{
            let file_name=r[0].file_name;
            this.authorid=r[0].authorid;
            this.list_of_reporters=r[0].list_of_reporters;
            this.highlight=r[0].highlight;
            this.title=r[0].title;
            this.style=r[0].category;
            this.monetization=r[0].monetization
            this.firsttag=r[0].firsttag;
            this.secondtag=r[0].secondtag;
            this.thirdtag=r[0].thirdtag;
            this.likesnumber =r[0].likesnumber ;
            this.lovesnumber =r[0].lovesnumber ;
            this.status=r[0].status;
            this.thumbnail_picture=r[0].name_coverpage ;
            this.date_upload_to_show = get_date_to_show( date_in_seconds(this.now_in_seconds,r[0].createdAt) );
            this.thumbnail_picture_retrieved=true;
  
            this.check_archive();
  
            this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).subscribe(r=>{
              this.pseudo = r[0].nickname;
              this.user_name = r[0].firstname + ' ' + r[0].lastname;
              this.primary_description=r[0].primary_description;
              this.type_of_account_checked=r[0].type_of_account_checked;
              this.certified_account=r[0].certified_account;
              this.profile_data_retrieved=true;
            });
  
            this.Emphasize_service.get_emphasized_content(r[0].authorid).subscribe(l=>{
              if (l[0]!=null && l[0]!=undefined){
                if (l[0].publication_id==this.writing_id && l[0].publication_category=="writing"){
                  this.content_emphasized=true;
                }
              }
              this.emphasized_contend_retrieved=true;
            });
            
            this.Subscribing_service.check_if_visitor_susbcribed(this.authorid).subscribe(information=>{
              if(information[0].value){
                this.already_subscribed=true;
              }
            }); 
            
            this.get_author_recommendations();
            this.get_recommendations_by_tag();
            
         
            this.ready_to_check_view=true;
            this.check_view_after_current()
      
            this.Subscribing_service.check_if_visitor_susbcribed(r[0].authorid).subscribe(information=>{
              if(information[0].value){
                this.already_subscribed=true;
              }
              this.subscribtion_retrieved=true;
            });
            
           
  
            this.NotationService.get_content_marks('writing',  "unknown", this.writing_id,0).subscribe(r=>{
              //views and comments
              this.commentariesnumber=r[0].list_of_comments.length;
              this.viewsnumber= r[0].list_of_views.length;
              //loves
              this.list_of_loves= r[0].list_of_loves;
              this.lovesnumber=this.list_of_loves.length;
              if (this.list_of_loves.length != 0){
                this.loves_retrieved_but_not_checked=true;
                this.check_loves_after_current()
              }
              else{
                this.list_of_users_ids_loves_retrieved=true;
              }
      
              //likes
              this.list_of_likes= r[0].list_of_likes;
              this.likesnumber=this.list_of_likes.length;
              if (this.list_of_likes.length != 0){
                this.likes_retrieved_but_not_checked=true;
                this.check_likes_after_current()
              }
              else{
                this.list_of_users_ids_likes_retrieved=true;
              }
            })
            
      
            this.Writing_Upload_Service.retrieve_writing_by_name(file_name).subscribe(r=>{
              let file = new Blob([r], {type: 'application/pdf'});
              this.pdfSrc = URL.createObjectURL(file);
              this.item_retrieved=true;
            });
      
            this.Profile_Edition_Service.retrieve_profile_picture( r[0].authorid).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.profile_picture = SafeURL;
              
            });
      
           
          }
        }
  
      }
      
      

    });


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

  check_view_after_current(){
    if(this.current_user_retrieved && this.ready_to_check_view){
      if (this.authorid == this.visitor_id){
        this.mode_visiteur = false;
        
        this.navbar.check_if_research_exists("Writing","unknown",this.writing_id,this.title,"clicked").subscribe(p=>{
          if(!p[0].value){
            this.navbar.add_main_research_to_history("Writing","unknown",this.writing_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag, this.visitor_status).subscribe();
          }
        })
      }
      else{
        this.navbar.add_main_research_to_history("Writing","unknown",this.writing_id,this.title,null,"clicked",0,0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag, this.visitor_status).subscribe();
        this.NotationService.add_view('writing',  "unknown", this.style, this.writing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
          this.id_view_created = r[0].id;
          if(r[0].id>0){
            this.Community_recommendation.delete_recommendations_cookies();
            this.Community_recommendation.generate_recommendations().subscribe(r=>{})
          }
        });
                
      } 
      this.mode_visiteur_added = true;
    }
  }


  /********************************************** RECOMMENDATIONS **************************************/
  /********************************************** RECOMMENDATIONS **************************************/
  /********************************************** RECOMMENDATIONS **************************************/

  get_author_recommendations(){
    this.Community_recommendation.get_comics_recommendations_by_author(this.authorid,0).subscribe(e=>{
      console.log(e[0].list_to_send)
      if(e[0].list_to_send.length>0){
        for(let j=0;j<e[0].list_to_send.length;j++){
          if(e[0].list_to_send[j].length>0){
            this.list_of_author_recommendations_comics.push(e[0].list_to_send[j])
          }
        } 
      }
      this.list_of_author_recommendations_comics_retrieved=true;
      this.check_recommendations();
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
      this.check_recommendations();
    })
    this.Community_recommendation.get_writings_recommendations_by_author(this.authorid,this.writing_id).subscribe(e=>{
      if(e[0].list_to_send.length >0){
        for(let j=0;j<e[0].list_to_send.length;j++){
          if(e[0].list_to_send[j].length>0){
            this.list_of_author_recommendations_writings.push(e[0].list_to_send[j])
          }
        }
      
      }
      this.list_of_author_recommendations_writings_retrieved=true;
      
      this.check_recommendations();
    })
  }

  check_recommendations(){
    if(  this.list_of_author_recommendations_writings_retrieved && this.list_of_author_recommendations_drawings_retrieved && this.list_of_author_recommendations_comics_retrieved){
      console.log( this.list_of_author_recommendations_comics)
      console.log( this.list_of_author_recommendations_drawings)
      console.log( this.list_of_author_recommendations_writings)
      this.list_of_author_recommendations_retrieved=true;
    }
  }

  first_propositions_retrieved=false;
  second_propositions_retrieved=false;
  second_propositions=[];
  first_propositions=[];
  get_recommendations_by_tag(){

    
    this.Community_recommendation.get_artwork_recommendations_by_tag('Writing',"unknown",this.writing_id,this.style,this.firsttag,6).subscribe(u=>{
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

    this.Community_recommendation.get_artwork_recommendations_by_tag('Writing',"unknown",this.writing_id,this.style,this.secondtag,6).subscribe(r=>{
      
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
    for(let i=0;i<len;i++){
      if(list_of_first_propositions[len-i-1].format=="unknown" && list_of_first_propositions[len-i-1].target_id==this.writing_id){
        list_of_first_propositions.splice(len-i-1,1);
      }
    }
    console.log(list_of_first_propositions)
    let compteur_propositions=0;
    if(list_of_first_propositions.length>0){
      for(let i=0;i<list_of_first_propositions.length;i++){
          this.Writing_Upload_Service.retrieve_writing_information_by_id(list_of_first_propositions[i].target_id).subscribe(comic=>{
            if(comic[0].status=="public"){
              this.list_of_recommendations_by_tag.push(comic[0]);
            }
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

  show_icon=false;
  page_height=800;
  page_width;

  ngAfterViewInit(){
    
    this.open_category(0);
    $(".top-container .pages-controller-container input").val(1)
    
    document.getElementsByClassName('swiper-slide-writing')[0].addEventListener('scroll', e => {
      this.page_height = document.getElementsByClassName('page')[0].clientHeight;
      
      let page = Math.trunc(e.target['scrollTop']/(this.page_height+10) +1)
      this.page_number=page;
      $(".top-container .pages-controller-container input").val(page)
    });
  }

  /******************************************************* */
  /******************************************************* */
  /******************* LEFT CONTROLLER ******************* */
  /******************************************************* */
  /******************************************************* */

  type_of_account_checked:boolean;
  certified_account:boolean;  

  optionOpened:number = -1;
  openOption(i: number) {
    this.optionOpened = i;
  }

  open_account() {
    return "/account/"+this.pseudo+"/"+this.authorid;
    //this.router.navigate([`/account/${this.pseudo}/${this.item.id_user}`]);
  };

  
  get_french_style(s: string) {
    if(s=='Poetry') {
      return 'Poésie';
    }
    else if(s=='Illustrated novel') {
      return 'Roman illustré';
    }
    else if(s=='Scenario') {
      return 'Scénario';
    }
    else {
      return s;
    }
  }

  get_link() {
    return "/main-research-style-and-tag/1/Writing/" + this.get_french_style(this.style) + "/all";
  };

  get_style_link(i: number) {
    if( i == 0 ) {
      return "/main-research-style-and-tag/1/Writing/" + this.get_french_style(this.style) + "/" + this.firsttag;
    }
    if( i == 1 ) {
      return "/main-research-style-and-tag/1/Writing/" + this.get_french_style(this.style) + "/" + this.secondtag;
    }
    if( i == 2 ) {
      return "/main-research-style-and-tag/1/Writing/" + this.get_french_style(this.style) + "/" + this.thirdtag;
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

    if(this.slide ){
      console.log("enter resize")
      this.first_page_rendered = false;

      let width=this.slide.nativeElement.offsetWidth-10;
      this.page_height=Math.trunc(width*1.4135);
      this.rd.setStyle(  this.slide.nativeElement, "max-height", Math.trunc(width*1.4135)+"px" );
    }
  }

  

 

  onPageChange(page: number) {
    console.log('onPageChange');
    console.log(page);
  }

  see_description() {
    
    this.dialog.open(PopupArtworkDataComponent, {
      data: {
        title:this.title,
        highlight:this.highlight,
        category:'Writing',
        style:this.style,
        type:null,
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
        category:'Writing',
        format:null,
        style:this.style,
        publication_id:this.writing_id,
        chapter_number:0,
        authorid:this.authorid,
        number_of_comments_to_show:this.number_of_comments_to_show
      }, 
      panelClass: 'popupCommentsClass',
    });

  }

  open_chat_link() {
    this.router.navigateByUrl('/chat/'+ this.pseudo +'/'+ this.authorid);
  }




  @ViewChild('input') input:ElementRef;
  change_page(event){
    
    if(event.code.includes("Enter")){
      let page=Number(this.input.nativeElement.value)
      console.log(page)
      if(page && page>=1 && page<=this.total_pages){
        this.page_height = document.getElementsByClassName('page')[0].clientHeight;
        document.getElementsByClassName('swiper-slide-writing')[0].scrollTop=this.page_height*page-this.page_height + 10*page +1;
      }
    }
  }

  isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  open_category(i : number) {
    this.category_index=i;
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


  onRightClick() {
    return false;
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

  

  /******************************************************* */
  /******************************************************* */
  /****************** RIGHT CONTROLLER ******************* */
  /******************************************************* */
  /******************************************************* */
 
  click_like() {
    if(this.type_of_account=="account"){
      if(this.like_in_progress){
        return
      }
      if(this.list_of_users_ids_likes_retrieved){
        this.like_in_progress=true;
        if(this.liked) {      
          this.liked=false;  
          this.likesnumber-=1;
            this.NotationService.remove_like('writing', "unknown", this.style, this.writing_id,0).subscribe(r=>{      
              let index=this.list_of_users_ids_likes.indexOf(this.visitor_id);
              this.list_of_users_ids_likes.splice(index,1);
            
              if(this.authorid==this.visitor_id){
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
                 
                  this.like_in_progress=false;
                  this.cd.detectChanges();
                })
              }
            
            });
        }
        else {
          this.liked=true;
          this.likesnumber+=1;
            this.NotationService.add_like('writing', "unknown", this.style, this.writing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
              this.list_of_users_ids_likes.splice(0,0,this.visitor_id)
              
              if(this.authorid==this.visitor_id){
                
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
                  this.like_in_progress=false;
                  this.cd.detectChanges();
                })
              } 
            });
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
          this.lovesnumber-=1; 
            this.NotationService.remove_love('writing', "unknown", this.style, this.writing_id,0).subscribe(r=>{        
              let index=this.list_of_users_ids_loves.indexOf(this.visitor_id);
              this.list_of_users_ids_loves.splice(index,1);
             
              if(this.authorid==this.visitor_id){
               
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
                  this.love_in_progress=false;
                  this.cd.detectChanges();
                })
              }
            
            });
          
        }
        else {  
          this.loved=true;  
          this.lovesnumber+=1;    
            this.NotationService.add_love('writing', "unknown", this.style, this.writing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
              this.list_of_users_ids_loves.splice(0,0,this.visitor_id)
                
              if(this.authorid==this.visitor_id){
                
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
                  this.love_in_progress=false; 
                  this.cd.detectChanges();
                }) 
              }   
            });
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
    this.Subscribing_service.archive("writings","unknown",this.writing_id).subscribe(r=>{
      this.content_archived=true;
      this.archive_loading=false;
    });
  }
  unarchive(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    this.Subscribing_service.unarchive("writings","unknown",this.writing_id).subscribe(r=>{
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
    this.Reports_service.check_if_content_reported('writing',this.writing_id,"unknown",0).subscribe(r=>{
      console.log(r[0])
      if(r[0].nothing){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        const dialogRef = this.dialog.open(PopupReportComponent, {
          data: {from_account:false,id_receiver:this.authorid,publication_category:'writing',publication_id:this.writing_id,format:"unknown",chapter_number:0},
          panelClass:'popupReportClass'
        });
      }
      this.checking_report=false;
    })
    
  }

  list_of_reporters:any;
  cancel_report(){

    let id=this.writing_id
    this.Reports_service.cancel_report("writing",id,this.writing_id).subscribe(r=>{
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
    this.Emphasize_service.emphasize_content("writing","unknown",this.writing_id,0).subscribe(r=>{
      this.content_emphasized=true;
      this.archive_loading=false;
    });
  }

  remove_emphasizing(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
      this.Emphasize_service.remove_emphasizing("writing","unknown",this.writing_id,0).subscribe(t=>{
        this.content_emphasized=false;
        this.archive_loading=false;
      });
  }

  show_likes(){
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"likes", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_likes,visitor_name:this.visitor_name,visitor_id:this.visitor_id},
      panelClass: 'popupLikesAndLovesClass',
    });

  }

  show_loves(){
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"loves", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_loves,visitor_name:this.visitor_name,visitor_id:this.visitor_id},
      panelClass: 'popupLikesAndLovesClass',
    });

  }


 /******************************************DISPLAY IMAGES ****************************************/

 profile_picture_loaded(){
  this.pp_loaded=true;
}

writing_retrieved=false;
first_page_rendered=false;
afterLoadComplete(pdf: PDFDocumentProxy) {
  console.log(pdf)
  this.total_pages = pdf.numPages;
  this.cd.detectChanges();
 
}

pageRendered(e:any) {
 
  if( !this.first_page_rendered ) {
    if( e.source.canvas.width > e.source.canvas.height ) {
      this.page_width = 1080;
      this.rd.setStyle(  this.slide.nativeElement, "max-width", this.page_width+"px" );
      this.cd.detectChanges();
      this.writing_retrieved=true;
    }
    else {
      this.page_width = 760;
      this.rd.setStyle(  this.slide.nativeElement, "max-width", this.page_width+"px" );
      this.cd.detectChanges();
      this.writing_retrieved=true;
    }
    this.first_page_rendered = true;
  }
  window.dispatchEvent(new Event('resize'));


}

pdf_is_loaded(){
  console.log("laod compelte");
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
      style:this.get_french_style(this.style), 
      firsttag:this.firsttag,
      secondtag:this.secondtag, 
      thirdtag:this.thirdtag,
      author_name: this.user_name,
      primary_description: this.primary_description, 
      profile_picture: this.profile_picture
    },
    panelClass: 'popupFormWritingClass',
    });
  }

  edit_thumbnail() {

    const dialogRef = this.dialog.open(PopupEditCoverComponent, {
      data: {
      writing_id: this.writing_id,
      title: this.title,
      style:this.style, 
      firsttag:this.firsttag,
      secondtag:this.secondtag,
      thirdtag:this.thirdtag,
      author_name: this.user_name,
      primary_description: this.primary_description, 
      profile_picture: this.profile_picture,
      thumbnail_picture:this.thumbnail_picture,
      category:"writing"
    },
    panelClass: 'popupEditCoverClass',
    }); 

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
        this.Subscribing_service.change_content_status("writing","unknown",this.writing_id,0,"private").subscribe(r=>{
          console.log(r);
          this.Writing_Upload_Service.change_writing_status(this.writing_id,"private").subscribe(r=>{
            this.status="private";
            this.archive_loading=false;
          });
        })
        
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
        this.Subscribing_service.change_content_status("writing","unknown",this.writing_id,0,"ok").subscribe(r=>{
          console.log(r);
          this.Writing_Upload_Service.change_writing_status(this.writing_id,"public").subscribe(r=>{
            this.status="public";
            this.archive_loading=false;
          });
        })
       
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
        console.log(this.writing_id);
        

        this.navbar.delete_publication_from_research("Writing","unknown",this.writing_id).subscribe(r=>{
          this.Writing_Upload_Service.Remove_writing(this.writing_id).subscribe(r=>{
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
              this.archive_loading=false;
              this.chatService.messages.next(message_to_send);
              this.router.navigateByUrl( `/account/${this.pseudo}/${this.authorid}`);
              return;
            })
          });
          
        })

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


