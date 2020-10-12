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
import { PopupEditCoverComicComponent } from '../popup-edit-cover-comic/popup-edit-cover-comic.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupLikesAndLovesComponent } from '../popup-likes-and-loves/popup-likes-and-loves.component';
import { FormControl, FormGroup } from '@angular/forms';
import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { Location } from '@angular/common';
declare var Swiper: any;
declare var $: any;




@Component({
  selector: 'app-artwork-comic',
  templateUrl: './artwork-comic.component.html',
  styleUrls: ['./artwork-comic.component.scss']
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
    
    this.thumbnails = false;
    this.zoom_mode = false;
    this.fullscreen_mode = false;
    this.navbar.setActiveSection(0);
    this.navbar.show();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.add_time_of_view();
  }


  @ViewChildren('category') categories:QueryList<ElementRef>;
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





  chapterList:any[]=[];
  list_of_pages_by_chapter:any[]=[['']];
  show_pages:any[]=[];
  current_chapter=0;
  current_chapter_title='';
  pseudo:string='';
  authorid:number=0;
  bd_id:number;
  viewnumber:number;
  commentariesnumber:number;
  highlight:string;
  title:string;
  style:string;
  firsttag:string;
  secondtag:string;
  thirdtag:string;
  pagesnumber:number;
  list_bd_pages:SafeUrl[]=[];
  status:string;
  user_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  lovesnumber:string;
  likesnumber:string;
  thumbnail_color:string;

  date_upload_to_show:string;
  date_upload:string;

  
  begining_time_of_view:number=Math.trunc( new Date().getTime()/1000);
  id_view_created:number;
  already_subscribed:boolean=false;
  visitor_id:number;
  visitor_name:string;
  mode_visiteur=true;
  mode_visiteur_added=false;

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
  
  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  number_of_comments_to_show=10;
  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {
    
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
      this.router.navigateByUrl("/page_not_found");
      return;
    }

    this.bd_id = parseInt(this.activatedRoute.snapshot.paramMap.get('bd_id'));
    if(!(this.bd_id>0)){
      this.router.navigateByUrl('/page_not_found');
        return
    }

    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
      this.visitor_id = l[0].id;
      this.visitor_name=l[0].firstname + ' ' + l[0].lastname;
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
      if(this.active_section==2){
        this.current_chapter= parseInt(this.activatedRoute.snapshot.paramMap.get('chapter_number')) -1;
        console.log(this.current_chapter);
      }
      this.BdSerieService.retrieve_bd_by_id(this.bd_id).subscribe(r => { 
        if(!r[0] || r[0].chaptersnumbe<this.current_chapter || this.type!='serie' || r[0].status=="deleted"){
          this.router.navigateByUrl("/page_not_found");
          return
        }
        else{
          let title =this.activatedRoute.snapshot.paramMap.get('title');
          if(r[0].title !=title || typeof(title)!='string'){
            this.router.navigateByUrl("/");
            return
          }
          else{
            this.location.go(`/artwork-comic/${this.type}/${title}/${this.bd_id}/${this.current_chapter + 1}`);
            this.check_archive();
            this.highlight=r[0].highlight;
            this.title=r[0].title;
            this.authorid=r[0].authorid;
            this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).subscribe(r=>{
              this.pseudo = r[0].nickname;
            });
            this.Emphasize_service.get_emphasized_content(r[0].authorid).subscribe(l=>{
              if (l[0]!=null && l[0]!=undefined){
                if (l[0].publication_id==this.bd_id && l[0].publication_category=="comics" && l[0].format==this.type){
                  this.content_emphasized=true;
                }
              }
            });
            this.style=r[0].category;
            this.firsttag=r[0].firsttag;
            this.secondtag=r[0].secondtag;
            this.thirdtag=r[0].thirdtag;
            this.thumbnail_color=r[0].thumbnail_color;
            this.status=r[0].status
            this.Community_recommendation.get_comics_recommendations_by_author(r[0].authorid,this.bd_id).subscribe(e=>{
              if(e[0].list_to_send.length>0){
                this.list_of_author_recommendations_comics=e[0].list_to_send;
                this.list_of_author_recommendations_comics_retrieved=true;
              }
              this.Community_recommendation.get_drawings_recommendations_by_author(this.authorid,0).subscribe(e=>{
                if(e[0].list_to_send.length >0){
                  this.list_of_author_recommendations_drawings=e[0].list_to_send;
                  this.list_of_author_recommendations_drawings_retrieved=true;
                }
                this.Community_recommendation.get_writings_recommendations_by_author(this.authorid,0).subscribe(e=>{
                  if(e[0].list_to_send.length >0){
                    this.list_of_author_recommendations_writings=e[0].list_to_send;
                    this.list_of_author_recommendations_writings_retrieved=true;
                  }
                  this.list_of_author_recommendations_retrieved=true;
                });
              });

              
            });
            
            this.get_recommendations_by_tag();
            
            

            this.bd_serie_calls();
          }
        }
        
      });
    }
    
  }


  get_recommendations_by_tag(){
    this.Community_recommendation.get_artwork_recommendations_by_tag('Comic',this.type,this.bd_id,this.style,this.firsttag,6).subscribe(u=>{
      if(u[0].length>0){
        console.log(u[0])
        let list_of_first_propositions=u[0];
        console.log(list_of_first_propositions)
        if(list_of_first_propositions.length<6 && this.secondtag){
          this.Community_recommendation.get_artwork_recommendations_by_tag('Comic',this.type,this.bd_id,this.style,this.secondtag,6-list_of_first_propositions.length).subscribe(r=>{
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
      if( list_of_first_propositions[k].format==this.type && list_of_first_propositions[k].target_id==this.bd_id){
        indice=k;
      }
      if(k==len-1){
        list_of_first_propositions.splice(indice,1);
        let compteur_propositions=0;
        if(list_of_first_propositions.length>0){
          for(let i=0;i<list_of_first_propositions.length;i++){
            if(list_of_first_propositions[i].format=="serie"){
              this.BdSerieService.retrieve_bd_by_id(list_of_first_propositions[i].target_id).subscribe(comic=>{
                this.list_of_recommendations_by_tag[i]=comic[0];
                compteur_propositions++;
                if(compteur_propositions==list_of_first_propositions.length){
                  this.list_of_recommendations_by_tag_retrieved=true;
                }
              })
            }
            else{
              this.BdOneShotService.retrieve_bd_by_id(list_of_first_propositions[i].target_id).subscribe(comic=>{
                this.list_of_recommendations_by_tag[i]=comic[0];
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
    }
  }

  check_archive(){
    this.Subscribing_service.check_if_publication_archived("comics",this.type ,this.bd_id).subscribe(r=>{
      console.log(r[0]);
      if(r[0].value){
        this.content_archived=true;
      }
      this.archive_retrieved=true;
    })
  }

  bd_one_shot_calls(){
   
    this.BdOneShotService.retrieve_bd_by_id(this.bd_id).subscribe(r => {
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
          
          this.check_archive();
          this.viewnumber = r[0].viewnumber;
          this.authorid=r[0].authorid;
          this.Profile_Edition_Service.get_pseudo_by_user_id(r[0].authorid).subscribe(r=>{
            this.pseudo = r[0].nickname;
          });
          this.Emphasize_service.get_emphasized_content(r[0].authorid).subscribe(l=>{
            if (l[0]!=null && l[0]!=undefined){
              if (l[0].publication_id==this.bd_id && l[0].publication_category=="comics" && l[0].format==this.type){
                this.content_emphasized=true;
              }
            }
          });
          this.pseudo=r[0].nickname;
          this.commentariesnumber = r[0].commentarynumbers;
          this.highlight=r[0].highlight;
          this.title=r[0].title;
          this.style=r[0].category;
          this.firsttag=r[0].firsttag;
          this.secondtag=r[0].secondtag;
          this.likesnumber =r[0].likesnumber ;
          this.lovesnumber =r[0].lovesnumber ;
          this.thirdtag=r[0].thirdtag;
          this.pagesnumber=r[0].pagesnumber;
          this.status=r[0].status
          this.date_upload_to_show = get_date_to_show( date_in_seconds(this.now_in_seconds,r[0].createdAt) );

          this.Community_recommendation.get_comics_recommendations_by_author(r[0].authorid,this.bd_id).subscribe(e=>{
            if(e[0].list_to_send.length>0){
              this.list_of_author_recommendations_comics=e[0].list_to_send;
              this.list_of_author_recommendations_comics_retrieved=true;
            }
            this.Community_recommendation.get_drawings_recommendations_by_author(this.authorid,0).subscribe(e=>{
              if(e[0].list_to_send.length >0){
                this.list_of_author_recommendations_drawings=e[0].list_to_send;
                this.list_of_author_recommendations_drawings_retrieved=true;
              }
              this.Community_recommendation.get_writings_recommendations_by_author(this.authorid,0).subscribe(e=>{
                if(e[0].list_to_send.length >0){
                  this.list_of_author_recommendations_writings=e[0].list_to_send;
                  this.list_of_author_recommendations_writings_retrieved=true;
                }
                this.list_of_author_recommendations_retrieved=true;
              });
            });
          });

          this.get_recommendations_by_tag();

          this.Profile_Edition_Service.get_current_user().subscribe(l=>{
            if (this.authorid == l[0].id){
              this.mode_visiteur = false;
              this.mode_visiteur_added = true;
            }
            else{
              this.NotationService.add_view('bd', 'one-shot',  r[0].category, this.bd_id,0,r[0].firsttag,r[0].secondtag,r[0].thirdtag,this.authorid).subscribe(r=>{
                this.id_view_created = r[0].id;
                console.log("id_view_created")
                console.log(this.id_view_created)
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
            };

            if(!this.mode_visiteur){
              this.navbar.check_if_research_exists("Comic",this.type,this.bd_id,title,"clicked").subscribe(p=>{
                if(!p[0].value){
                  this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe();
                }
              })
            }
            else{
              this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe();
            }
            
          });

          
          this.NotationService.get_loves('bd', 'one-shot', r[0].category, this.bd_id,0).subscribe(r=>{
            let list_of_loves= r[0];
            this.list_of_users_ids_loves[0]=[]
            if (list_of_loves.length != 0){
              this.Profile_Edition_Service.get_current_user().subscribe(l=>{
                for (let i=0;i<list_of_loves.length;i++){
                  this.list_of_users_ids_loves[0].push(list_of_loves[i].author_id_who_loves);
                  if (list_of_loves[i].author_id_who_loves == l[0].id){
                    this.loved = true;
                  }
                }
                this.list_of_users_ids_loves_retrieved=true;
              });
            }
            else{
              this.list_of_users_ids_loves_retrieved=true;
            }
          });
          this.NotationService.get_likes('bd', 'one-shot', r[0].category, this.bd_id,0).subscribe(r=>{
            let list_of_likes= r[0];
            this.list_of_users_ids_likes[0]=[]
            if (list_of_likes.length != 0){
              this.Profile_Edition_Service.get_current_user().subscribe(l=>{
                for (let i=0;i<list_of_likes.length;i++){
                  this.list_of_users_ids_likes[0].push(list_of_likes[i].author_id_who_likes);
                  if (list_of_likes[i].author_id_who_likes == l[0].id){
                    this.liked = true;
                  }
                }
                this.list_of_users_ids_likes_retrieved=true;
              });
            }
            else{
              this.list_of_users_ids_likes_retrieved=true;
            }
          });
          

          this.get_bd_oneshot_pages(this.bd_id,r[0].pagesnumber);

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


  bd_serie_calls(){
    
    this.BdSerieService.retrieve_chapters_by_id(this.bd_id).subscribe(r => {

      this.viewnumber=r[0][this.current_chapter].viewnumber;
      this.commentariesnumber = r[0][this.current_chapter].commentarynumbers;
      this.likesnumber =r[0][this.current_chapter].likesnumber ;
      this.current_chapter_title=r[0][this.current_chapter].title;
      this.lovesnumber =r[0][this.current_chapter].lovesnumber ;
      this.chapterList=r[0];
      if(this.chapterList.length/2<(this.current_chapter+1)){
        this.chapter_filter_bottom_to_top=false;
      }
      else{
        this.chapter_filter_bottom_to_top=true;
      }
      this.chapter_name_to_show=`chapitre ${this.chapterList[this.current_chapter].chapter_number} : ${this.chapterList[this.current_chapter].title}`
      console.log( this.chapter_name_to_show)
      $('.chapterSelector').attr("placeholder",this.chapter_name_to_show);
      this.initialize_chapter_selector();


      this.date_upload_to_show = get_date_to_show(date_in_seconds(this.now_in_seconds,r[0][0].createdAt) );

      this.Profile_Edition_Service.get_current_user().subscribe(l=>{
        if (this.authorid == l[0].id){
          this.mode_visiteur = false;
          this.mode_visiteur_added = true;
        }
        else{
          this.NotationService.add_view('bd', 'serie',  this.style, this.bd_id,1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
            this.id_view_created = r[0].id;
            console.log("id_view_created")
            console.log(this.id_view_created)
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
        };

        if(!this.mode_visiteur){
          this.navbar.check_if_research_exists("Comic",this.type,this.bd_id,this.title,"clicked").subscribe(p=>{
            if(!p[0].value){
              this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe(l=>{
              });
            }
          })
        }
        else{
          this.navbar.add_main_research_to_history("Comic",this.type,this.bd_id,this.title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe(l=>{
          });
        }
        
      });

     


      for( var i=1; i< this.chapterList.length; i++ ) {
        this.list_of_pages_by_chapter.push(['']);
      };
      console.log("getting pages by chapter")
      console.log(r[0])
      this.get_bd_serie_chapter_pages(this.bd_id,this.current_chapter+1,r[0][this.current_chapter].pagesnumber);

      this.Profile_Edition_Service.retrieve_profile_picture( r[0][this.current_chapter].author_id).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.Profile_Edition_Service.retrieve_profile_data(r[0][this.current_chapter].author_id).subscribe(r=> {
        this.user_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
      });

    });
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
    THIS.viewnumber=THIS.chapterList[chapter_number].viewnumber;
    THIS.current_chapter_title=THIS.chapterList[chapter_number].title;
    THIS.chapter_name_to_show=`chapitre ${THIS.chapterList[THIS.current_chapter].chapter_number} : ${ THIS.current_chapter_title}`;
    this.chapter_name_control.reset();
    this.cd.detectChanges();
    $('.chapterSelector').attr("placeholder",this.chapter_name_to_show);
    $('.chapterSelector')[0].sumo.reload();
    this.cd.detectChanges();
    
    
    THIS.commentariesnumber = THIS.chapterList[chapter_number].commentarynumbers;
    THIS.likesnumber =THIS.chapterList[chapter_number].likesnumber ;
    THIS.lovesnumber =THIS.chapterList[chapter_number].lovesnumber ;

    if (THIS.mode_visiteur){
      THIS.NotationService.add_view_time(ending_time_of_view, THIS.id_view_created).subscribe();
      THIS.NotationService.add_view('bd', 'serie',THIS.style, THIS.bd_id,(chapter_number + 1),THIS.firsttag,THIS.secondtag,THIS.thirdtag,THIS.authorid).subscribe(r=>{
        THIS.id_view_created = r[0].id;
        console.log("id_view_created")
        console.log(THIS.id_view_created)
        THIS.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
      });
    }
    
    THIS.liked = false;
      THIS.loved = false;
    if( THIS.list_of_pages_by_chapter[chapter_number][0]==''){
      console.log("chargement des nouvelles pages");
      console.log(THIS.list_of_pages_by_chapter[chapter_number]);
      THIS.list_of_pages_by_chapter[chapter_number].pop();
      THIS.get_bd_serie_chapter_pages(THIS.bd_id,(chapter_number + 1),THIS.chapterList[chapter_number].pagesnumber);
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
    THIS.viewnumber=THIS.chapterList[chapter_number].viewnumber;
    THIS.current_chapter_title=THIS.chapterList[chapter_number].title;
    THIS.chapter_name_to_show=`chapitre ${THIS.chapterList[THIS.current_chapter].chapter_number} : ${ THIS.current_chapter_title}`;
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
    
    
    THIS.commentariesnumber = THIS.chapterList[chapter_number].commentarynumbers;
    THIS.likesnumber =THIS.chapterList[chapter_number].likesnumber ;
    THIS.lovesnumber =THIS.chapterList[chapter_number].lovesnumber ;

    if (THIS.mode_visiteur){
      THIS.NotationService.add_view_time(ending_time_of_view, THIS.id_view_created).subscribe();
      THIS.NotationService.add_view('bd', 'serie',THIS.style, THIS.bd_id,(chapter_number + 1),THIS.firsttag,THIS.secondtag,THIS.thirdtag,THIS.authorid).subscribe(r=>{
        THIS.id_view_created = r[0].id;
        console.log("id_view_created")
        console.log(THIS.id_view_created)
        THIS.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
      });
    }
    
    THIS.liked = false;
      THIS.loved = false;
    if( THIS.list_of_pages_by_chapter[chapter_number][0]==''){
      console.log("chargement des nouvelles pages");
      console.log(THIS.list_of_pages_by_chapter[chapter_number]);
      THIS.list_of_pages_by_chapter[chapter_number].pop();
      THIS.get_bd_serie_chapter_pages(THIS.bd_id,(chapter_number + 1),THIS.chapterList[chapter_number].pagesnumber);
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
      THIS.viewnumber=THIS.chapterList[chapter_number].viewnumber;
      THIS.current_chapter_title=THIS.chapterList[chapter_number].title;
      THIS.chapter_name_to_show=`chapitre ${THIS.chapterList[THIS.current_chapter].chapter_number} : ${ THIS.current_chapter_title}`
      THIS.commentariesnumber = THIS.chapterList[chapter_number].commentarynumbers;
      THIS.likesnumber =THIS.chapterList[chapter_number].likesnumber ;
      
      THIS.lovesnumber =THIS.chapterList[chapter_number].lovesnumber ;

      if (THIS.mode_visiteur){
        THIS.NotationService.add_view_time(ending_time_of_view, THIS.id_view_created).subscribe();
        THIS.NotationService.add_view('bd', 'serie',THIS.style, THIS.bd_id,(parseInt(chapter_number) + 1),THIS.firsttag,THIS.secondtag,THIS.thirdtag,THIS.authorid).subscribe(r=>{
          THIS.id_view_created = r[0].id;
          console.log("id_view_created")
          console.log(THIS.id_view_created)
          THIS.begining_time_of_view =  Math.trunc(new Date().getTime()/1000);
        });
      }

      THIS.liked = false;
      THIS.loved = false;
      if( THIS.list_of_pages_by_chapter[parseInt(chapter_number)][0]==''){
        console.log("chargement des nouvelles pages");
        console.log(THIS.list_of_pages_by_chapter[parseInt(chapter_number)]);
        THIS.list_of_pages_by_chapter[parseInt(chapter_number)].pop();
        THIS.get_bd_serie_chapter_pages(THIS.bd_id,(parseInt(chapter_number) + 1),THIS.chapterList[parseInt(chapter_number)].pagesnumber);
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
        THIS.initialize_thumbnails();
      }
     
      THIS.location.go(`/artwork-comic/${THIS.type}/${THIS.title}/${THIS.bd_id}/${parseInt(chapter_number) + 1}`);
    });

  }


  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */

  
  

  ngAfterViewInit() {

    this.open_category(0);

    //this.open_recommendations(0);


  }



  /******************************************************* */
  /******************** AFTER VIEW CHECKED *************** */
  /******************************************************* */
  ngAfterViewChecked() {
    this.initialize_heights();
  }


  /******************************************************* */
  /******************** AJOUT ADAM : récupération des pages des bd ****************** */
  /******************************************************* */
  get_bd_oneshot_pages(bd_id,total_pages) {
    
      for( var i=0; i< total_pages; i++ ) {
        this.BdOneShotService.retrieve_bd_page(bd_id,i).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
          let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_bd_pages[r[1]]=(SafeURL);
        });
      };

  }

  get_bd_serie_chapter_pages(bd_id,chapter_number,total_pages) {
      console.log("get_bd_serie_chapter_pages")
      console.log(chapter_number);
      console.log(total_pages);
      this.list_of_users_ids_loves_retrieved=false;
      this.list_of_users_ids_likes_retrieved=false;

      this.NotationService.get_loves('bd', 'serie', this.style, this.bd_id,chapter_number).subscribe(r=>{
        let list_of_loves= r[0];
        this.list_of_users_ids_loves[chapter_number-1]=[];
        if (list_of_loves.length != 0){
          this.Profile_Edition_Service.get_current_user().subscribe(l=>{
            for (let i=0;i<list_of_loves.length;i++){
              this.list_of_users_ids_loves[chapter_number-1].push(list_of_loves[i].author_id_who_loves);
              if (list_of_loves[i].author_id_who_loves == l[0].id){
                this.loved = true;
              }
            }
            this.list_of_users_ids_loves_retrieved=true;
          });
        }
        else{
          this.list_of_users_ids_loves_retrieved=true;
        }
      });
      this.NotationService.get_likes('bd', 'serie', this.style, this.bd_id,chapter_number).subscribe(r=>{
        let list_of_likes= r[0];
        this.list_of_users_ids_likes[chapter_number-1]=[];
        if (list_of_likes.length != 0){
          this.Profile_Edition_Service.get_current_user().subscribe(l=>{
            for (let i=0;i<list_of_likes.length;i++){
              this.list_of_users_ids_likes[chapter_number-1].push(list_of_likes[i].author_id_who_likes);
              if (list_of_likes[i].author_id_who_likes == l[0].id){
                this.liked = true;
              }
            }
            this.list_of_users_ids_likes_retrieved=true;
            console.log(this.list_of_users_ids_likes)
          });
        }
        else{
          this.list_of_users_ids_likes_retrieved=true;
        }
      });

      
        for( let k=0; k< total_pages; k++ ) {
          this.BdSerieService.retrieve_bd_page(bd_id,chapter_number,k).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
            let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pages_by_chapter[chapter_number-1][r[1]]=(SafeURL);
            if(k==total_pages-1){
              this.initialize_thumbnails();
              this.show_pages[chapter_number-1]=true;
            }
          });
        };

  }
  
    
  



  /******************************************************* */
  /******************************************************* */
  /******************* LEFT CONTROLLER ******************* */
  /******************************************************* */
  /******************************************************* */


  initialize_heights() {
    //if( !this.fullscreen_mode ) {
      $('#left-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      $('#right-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");


    //}
  }

 
  initialize_swiper() {

    var THIS = this;
    
    this.swiper = new Swiper('.swiper-container.swiper-artwork-comic', {
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
      observer: true,
      on: {
        slideChange: function () {
          THIS.refresh_swiper_pagination();
        },
        observerUpdate: function () {
          THIS.refresh_swiper_pagination();
          window.dispatchEvent(new Event("resize"));
        }
      },
    });
    
    this.refresh_swiper_pagination();
    $(".top-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSlide( $(".top-container .pages-controller-container input").val() );
      }
    });
    
  }


  refresh_swiper_pagination() {
    if( this.swiper ) {
      if( this.swiper.slides ) {
        $(".top-container .pages-controller-container input").val( this.swiper.activeIndex + 1 );
        $(".top-container .pages-controller-container .total-pages span").html( "/ " + this.swiper.slides.length );
      }
    }
  }


  initialize_pages(){
    for( var i=0; i< this.swiperWrapperRef.nativeElement.children.length; i++ ) {
      $(".swiper-wrapper").html( "/ " );
      
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

  
  
  click_thumbnails() {


    if( !this.thumbnails_links.length ) {
      this.initialize_thumbnails();
    }

    if( !this.thumbnails ) {
      (async () => { 
        const getCurrentCity = () => {
        this.rd.setStyle( this.swiperContainerRef.nativeElement, "width", "calc( 100% - 310px )");
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


  zoom_button() {
    this.zoom_mode = !this.zoom_mode;
    $("img.slide-container-img").each(function() {
      $( this ).css("max-width",  $(this).prop("naturalWidth") * 1.3 + "px");
    });
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




  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


  

  /******************************************************* */
  /******************************************************* */
  /****************** RIGHT CONTROLLER ******************* */
  /******************************************************* */
  /******************************************************* */
  
  click_like() {
    console.log("click like")
    if(this.type_of_account=="account"){
      console.log("account")
      if(this.list_of_users_ids_likes_retrieved){
        console.log("list_of_users_ids_likes_retrieved")
        this.like_in_progress=true;
        if(this.liked) {    
          console.log("liked") 
          if(this.type=='one-shot'){
            this.NotationService.remove_like('bd', 'one-shot', this.style, this.bd_id,0).subscribe(r=>{
  
                    this.likesnumber=r[0].likesnumber;
                    if(this.authorid==this.visitor_id){
                      this.liked=false;
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
                        this.liked=false;
                        this.like_in_progress=false;
                        this.cd.detectChanges();
                      })
                    }
                   
                    
            });
          }
          else if(this.type=='serie'){      
            this.NotationService.remove_like('bd', 'serie', this.style, this.bd_id,this.current_chapter + 1).subscribe(r=>{      
  
                    this.likesnumber=r[0].likesnumber;
                    if(this.authorid==this.visitor_id){
                      this.liked=false;
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
                        this.liked=false;
                        this.like_in_progress=false;
                        this.cd.detectChanges();
                      })
                    }
                    
            
            });
          }
        }
        else {
          console.log("not liked") 
          if(this.type=='one-shot'){  
            this.NotationService.add_like('bd', 'one-shot', this.style, this.bd_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{        
  
                  this.likesnumber=r[0].likesnumber;
                  if(this.authorid==this.visitor_id){
                    this.liked=true;
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
                      this.liked=true;
                      this.like_in_progress=false;
                      this.cd.detectChanges();
                    })
                  }
                 
            });
          }
          else if(this.type=='serie'){
          
            this.NotationService.add_like('bd', 'serie', this.style, this.bd_id,this.current_chapter + 1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
  
                  this.likesnumber=r[0].likesnumber;
                  if(this.authorid==this.visitor_id){
                    this.liked=true;
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
                      this.liked=true;
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
      });
    }
  }

  click_love() {
    if(this.type_of_account=="account"){
      if(this.list_of_users_ids_loves_retrieved){
        this.love_in_progress=true;
        if(this.loved) {     
          if(this.type=='one-shot'){
            this.NotationService.remove_love('bd', 'one-shot', this.style, this.bd_id,0).subscribe(r=>{
               
                    this.lovesnumber=r[0].lovesnumber;
                    if(this.authorid==this.visitor_id){
                      this.loved=false;
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
                        this.loved=false;
                        this.love_in_progress=false;
                        this.cd.detectChanges();
                      })
                    }
                   
            });
          }
          else if(this.type=='serie'){      
            this.NotationService.remove_love('bd', 'serie', this.style, this.bd_id,this.current_chapter + 1).subscribe(r=>{      
                  
                    this.lovesnumber=r[0].lovesnumber;
                    
                    if(this.authorid==this.visitor_id){
                      this.loved=false;
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
                        this.loved=false;
                       this.love_in_progress=false;
                        this.cd.detectChanges();
                      })
                    }
                    
                
            
            });
          }
        }
        else {
          if(this.type=='one-shot'){  
            this.NotationService.add_love('bd', 'one-shot', this.style, this.bd_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{        
               
                  this.lovesnumber=r[0].lovesnumber;
                 
                  if(this.authorid==this.visitor_id){
                    this.loved=true;
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
                      this.loved=true;
                      this.love_in_progress=false;
                      this.cd.detectChanges();
                    })
                  }
              
            });
          }
          else if(this.type=='serie'){
          
            this.NotationService.add_love('bd', 'serie', this.style, this.bd_id,this.current_chapter + 1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
      
                  this.lovesnumber=r[0].lovesnumber;
                             
                  if(this.authorid==this.visitor_id){
                    this.loved=true;
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
                      this.loved=true;
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
      });
    }
    
  }

  show_likes(){
    console.log(this.current_chapter)
    console.log(this.list_of_users_ids_likes)
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"likes", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_likes[this.current_chapter]},
    });

  }

  show_loves(){
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"loves", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_loves[this.current_chapter]},
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
    this.Subscribing_service.archive("comics",this.type,this.bd_id).subscribe(r=>{
      this.content_archived=true;
    });
  }

  unarchive(){
    this.Subscribing_service.unarchive("comics",this.type,this.bd_id).subscribe(r=>{
      this.content_archived=false;
    });
  }

  report(){
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
        });
      }
    })
    
  }


  emphasize(){
    if(this.type=="serie"){
      this.Emphasize_service.emphasize_content("comics",this.type,this.bd_id,this.current_chapter + 1).subscribe(t=>{
        this.content_emphasized=true;
      });
    }
    else{
      this.Emphasize_service.emphasize_content("comics",this.type,this.bd_id,0).subscribe(r=>{
        this.content_emphasized=true;
      });
    }
  }

  remove_emphasizing(){
    if(this.type=="serie"){
      this.Emphasize_service.remove_emphasizing("comics",this.type,this.bd_id,this.current_chapter + 1).subscribe(t=>{
        this.content_emphasized=false;
      });
    }
    else{
      this.Emphasize_service.remove_emphasizing("comics",this.type,this.bd_id,0).subscribe(t=>{
        this.content_emphasized=false;
      });
    }
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
          this.swiper.slideTo(0,false,false);
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
          this.swiper.slideTo(0,false,false);
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
      thumbnail_color:this.thumbnail_color
      
    },
    });
  }
  edit_thumbnail() {
    const dialogRef = this.dialog.open(PopupEditCoverComicComponent, {
      data: {type:"edit_comic_thumbnail",
      format:this.type,
      bd_id: this.bd_id,
      title: this.title,
      style:this.style, 
      firsttag:this.firsttag,
      author_name: this.user_name,
      primary_description: this.primary_description, 
      profile_picture: this.profile_picture,
      chapterList: this.chapterList,
      thumbnail_color:this.thumbnail_color
    },
    });
  }

  edit_chapters(){
    this.router.navigateByUrl( `handle-comics-chapter/${this.bd_id}`);
    return
  }
  
  set_private() {

    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de passer cette œuvre en privé ? Elle ne sera visible que par vous dans les archives'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        if(this.type=="one-shot"){
          this.Subscribing_service.change_content_status("comics",this.type,this.bd_id,0,"private").subscribe(r=>{
            console.log(r)
            this.BdOneShotService.change_oneshot_comic_status(this.bd_id,"private").subscribe(r=>{
              this.status="private";
            });
          })
        }
        else{
          this.Subscribing_service.change_content_status("comics",this.type,this.bd_id,this.chapterList.length,"private").subscribe(r=>{
            this.BdSerieService.change_serie_comic_status(this.bd_id,"private").subscribe(r=>{
              this.status="private";
            });
          })
        }

      }
    });
  }
  set_public() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de passer cette œuvre en public ? Elle sera visible par tous les utilisateurs'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        if(this.type=="one-shot"){
          this.Subscribing_service.change_content_status("comics",this.type,this.bd_id,0,"ok").subscribe(r=>{
            this.BdOneShotService.change_oneshot_comic_status(this.bd_id,"public").subscribe(r=>{
              this.status="public";
            });
          })
          
        }
        else{
          this.Subscribing_service.change_content_status("comics",this.type,this.bd_id,this.chapterList.length,"ok").subscribe(r=>{
            this.BdSerieService.change_serie_comic_status(this.bd_id,"public").subscribe(r=>{
              this.status="public";
            });
          })
          
        }
          
      }
    });
  }
  remove_artwork() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer cette œuvre ? Toutes les données associées seront définitivement supprimées'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        if(this.type=="one-shot"){
          this.BdOneShotService.RemoveBdOneshot(this.bd_id).subscribe(r=>{
            this.navbar.delete_publication_from_research("Comic",this.type,this.bd_id).subscribe(r=>{
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
                this.chatService.messages.next(message_to_send);
                this.router.navigateByUrl( `/account/${this.pseudo}/${this.authorid}`);
                return;
              })
            })
            
          });
        }
        else{
          this.BdSerieService.RemoveBdSerie(this.bd_id).subscribe(r=>{
            this.navbar.delete_publication_from_research("Comic",this.type,this.bd_id).subscribe(r=>{
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
                this.chatService.messages.next(message_to_send);
                this.router.navigateByUrl( `/account/${this.pseudo}/${this.authorid}`);
                return;
              })
            })
          });
        }

      }
    });
  }


}


