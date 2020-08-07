import { Component, OnInit, Input, HostListener, ChangeDetectorRef } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import {MatMenuModule} from '@angular/material/menu';
import { delay } from 'rxjs/operators';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Community_recommendation } from '../services/recommendations.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { NotationService } from '../services/notation.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Emphasize_service } from '../services/emphasize.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormDrawingComponent } from '../popup-form-drawing/popup-form-drawing.component';
import { PopupEditCoverDrawingComponent } from '../popup-edit-cover-drawing/popup-edit-cover-drawing.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupLikesAndLovesComponent } from '../popup-likes-and-loves/popup-likes-and-loves.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';



declare var Swiper: any;
declare var $: any;


@Component({
  selector: 'app-artwork-drawing',
  templateUrl: './artwork-drawing.component.html',
  styleUrls: ['./artwork-drawing.component.scss']
})
export class ArtworkDrawingComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.add_time_of_view();
  }



  constructor(
    private rd: Renderer2,
    public navbar: NavbarService,
    private activatedRoute: ActivatedRoute,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd: ChangeDetectorRef,
    private router:Router,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private AuthenticationService:AuthenticationService,
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
    this.thumbnails = false;
    this.zoom_mode = false;
    this.fullscreen_mode = false;
    this.navbar.setActiveSection(0);
    this.navbar.show();
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
  viewnumber:number;
  commentariesnumber:number;
  highlight:string;
  title:string;
  style:string;
  firsttag:string;
  secondtag:string;
  thirdtag:string;
  pagesnumber:number;

  list_drawing_pages:SafeUrl[]=[];
  drawing_one_shot:SafeUrl;
  pseudo:string='';
  authorid:number=0;
  user_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  lovesnumber:string;
  likesnumber:string;
  status:string;
  date_upload_to_show:string;
  date_upload:string;

  begining_time_of_view:number=Math.trunc( new Date().getTime()/1000);
  createdAt_view:string;

  already_subscribed:boolean=false;
  visitor_id:number;
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
  
  now_in_seconds= Math.trunc( new Date().getTime()/1000);

  content_emphasized=false;

  //for list of loves and likes
  list_of_users_ids_loves:any[]=[];
  list_of_users_ids_likes:any[]=[];
  
  /******************************************************************** */
  /****VARIABLES ET FONCTIONS D'EDITION******************************** */
  /******************************************************************** */
  //visible : true ou privé : false
  visible:boolean = false;
  edit_information() {
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
    });
  }
  edit_thumbnail() {
    const dialogRef = this.dialog.open(PopupEditCoverDrawingComponent, {
      data: {type:"edit_comic_thumbnail",
      format:this.type,
      drawing_id: this.drawing_id,
      title: this.title,
      style:this.style, 
      firsttag:this.firsttag,
      secondtag:this.secondtag, 
      thirdtag:this.thirdtag,
      author_name: this.user_name,
      primary_description: this.primary_description, 
      profile_picture: this.profile_picture,

    },
    });
  }


  set_private() {

    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de passer cette œuvre en privé ? Elle ne sera visible que par vous dans les archives'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        if( result ) {
          if(this.type=="one-shot"){
            this.Drawings_Onepage_Service.change_oneshot_drawing_status(this.drawing_id,"private").subscribe(r=>{
              this.status="private";
            });
          }
          else{
            this.Drawings_Artbook_Service.change_artbook_drawing_status(this.drawing_id,"private").subscribe(r=>{
              this.status="private";
            });
          }
            
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
          this.Drawings_Onepage_Service.change_oneshot_drawing_status(this.drawing_id,"public").subscribe(r=>{
            this.status="public";
          });
        }
        else{
          this.Drawings_Artbook_Service.change_artbook_drawing_status(this.drawing_id,"public").subscribe(r=>{
            this.status="public";
          });
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
          console.log("suppression en cours");
          this.Drawings_Onepage_Service.remove_drawing_from_sql(this.drawing_id).subscribe(r=>{
            this.navbar.delete_publication_from_research("Drawing",this.type,this.drawing_id).subscribe(r=>{
              this.router.navigateByUrl( `/account/${this.pseudo}/${this.authorid}`);
              return;
            })
          });
        }
        else{
          console.log("suppression en cours");
          this.Drawings_Artbook_Service.RemoveDrawingArtbook(this.drawing_id).subscribe(r=>{
            this.navbar.delete_publication_from_research("Drawing",this.type,this.drawing_id).subscribe(r=>{
              this.router.navigateByUrl( `/account/${this.pseudo}/${this.authorid}`);
              return;
            })
          });
        }

      }
    });
  }
  /******************************************************************** */
  /****FIN DES VARIABLES D'EDITION************************************* */
  /******************************************************************** */




  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {
    

    this.type = this.activatedRoute.snapshot.paramMap.get('format');
    if( this.type != "one-shot" && this.type != "artbook" ) {
      this.router.navigateByUrl("/");
      return;
    }

    console.log(this.type);
    let drawing_id = parseInt(this.activatedRoute.snapshot.paramMap.get('drawing_id'));
    this.drawing_id = drawing_id;

    
    

    if (this.type =="one-shot"){
      this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.drawing_id).subscribe(r => {
        if(!r[0]){
          this.router.navigateByUrl("/");
            return;
        }
        else{
          let title =this.activatedRoute.snapshot.paramMap.get('title');
          if(r[0].title !=title ){
            this.router.navigateByUrl("/");
            return;
          }
          else{
            
            this.check_archive();
            this.drawing_one_shot_calls();
          }
        }
      })
    }

    else if (this.type =="artbook"){
      this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.drawing_id).subscribe(r => {
        if(!r[0]){
          this.router.navigateByUrl("/");
            return
        }
        else{
          let title =this.activatedRoute.snapshot.paramMap.get('title');
          if(r[0].title !=title ){
            this.router.navigateByUrl("/");
            return
          }
          else{
            this.check_archive();
            this.drawing_artbook_calls();
          }
        }
      })
    }
    
  }

  check_archive(){
    this.Subscribing_service.check_if_publication_archived("drawings",this.type ,this.drawing_id).subscribe(r=>{
      if(r[0].value){
        this.content_archived=true;
      }
      this.archive_retrieved=true;
    })
  }

  drawing_one_shot_calls(){
   console.log("one shot call")
    this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.drawing_id).subscribe(r => {
      let drawing_name=r[0].drawing_name;
      this.authorid= r[0].authorid;
      this.Profile_Edition_Service.get_pseudo_by_user_id(r[0].authorid).subscribe(r=>{
        this.pseudo = r[0].nickname;
      });

      this.Emphasize_service.get_emphasized_content(r[0].authorid).subscribe(l=>{
        if (l[0]!=null && l[0]!=undefined){
          if (l[0].publication_id==this.drawing_id && l[0].publication_category=="drawing" && l[0].format==this.type){
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
      this.likesnumber =r[0].likesnumber ;
      this.lovesnumber =r[0].lovesnumber ;
      this.thirdtag=r[0].thirdtag;
      this.pagesnumber=r[0].pagesnumber;
      this.status=r[0].status;
      this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds(r[0].createdAt) );

      this.Community_recommendation.get_comics_recommendations_by_author(r[0].authorid,0).subscribe(e=>{
        if(e[0].list_to_send.length>0){
          this.list_of_author_recommendations_comics=e[0].list_to_send;
          this.list_of_author_recommendations_comics_retrieved=true;
        }
        this.Community_recommendation.get_drawings_recommendations_by_author(this.authorid,this.drawing_id).subscribe(e=>{
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

      this.Subscribing_service.check_if_visitor_susbcribed(r[0].authorid).subscribe(information=>{
        if(information[0].value){
          this.already_subscribed=true;
        }
      });

      this.Profile_Edition_Service.get_current_user().subscribe(l=>{
        if (this.authorid == l[0].id){
          this.mode_visiteur = false;
          this.mode_visiteur_added = true;
        }
        else{
          console.log("adding view")
          this.NotationService.add_view('drawing', 'one-shot', r[0].category, this.drawing_id,0,r[0].firsttag,r[0].secondtag,r[0].thirdtag,this.authorid).subscribe(r=>{
            this.createdAt_view = r[0].createdAt;
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
          this.navbar.check_if_research_exists("Drawing",this.type,this.drawing_id,this.title,"clicked").subscribe(p=>{
            if(!p[0].value){
              this.navbar.add_main_research_to_history("Drawing",this.type,this.drawing_id,this.title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe();
            }
          })
        }
        else{
          this.navbar.add_main_research_to_history("Drawing",this.type,this.drawing_id,this.title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe();
        } 
        
      });

      
      
      this.NotationService.get_loves('drawing', 'one-shot', r[0].category, this.drawing_id,0).subscribe(r=>{
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
      this.NotationService.get_likes('drawing', 'one-shot', r[0].category, this.drawing_id,0).subscribe(r=>{
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
      

      this.Drawings_Onepage_Service.retrieve_drawing_page(drawing_name).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.drawing_one_shot=SafeURL;
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

    });
  }


  drawing_artbook_calls(){
   console.log("drawing artbook call")
    this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.drawing_id).subscribe(r => {
      this.viewnumber = r[0].viewnumber;
      this.authorid= r[0].authorid;
      this.Profile_Edition_Service.get_pseudo_by_user_id(r[0].authorid).subscribe(r=>{
        this.pseudo = r[0].nickname;
      });
      this.Emphasize_service.get_emphasized_content(r[0].authorid).subscribe(l=>{
        if (l[0]!=null && l[0]!=undefined){
          if (l[0].publication_id==this.drawing_id && l[0].publication_category=="drawing" && l[0].format==this.type){
            this.content_emphasized=true;
          }
        }
      });
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
      this.status=r[0].status;
      this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds(r[0].createdAt) );

      this.Community_recommendation.get_comics_recommendations_by_author(r[0].authorid,0).subscribe(e=>{
        if(e[0].list_to_send.length>0){
          this.list_of_author_recommendations_comics=e[0].list_to_send;
          this.list_of_author_recommendations_comics_retrieved=true;
        }
        this.Community_recommendation.get_drawings_recommendations_by_author(this.authorid,this.drawing_id).subscribe(e=>{
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

      this.Subscribing_service.check_if_visitor_susbcribed(r[0].authorid).subscribe(information=>{
        if(information[0].value){
          this.already_subscribed=true;
        }
      });
      
      this.Profile_Edition_Service.get_current_user().subscribe(l=>{
        console.log("getting current user")
        if (this.authorid == l[0].id){
          this.mode_visiteur = false;
          this.mode_visiteur_added = true;
        }
        else{
          console.log("else and add view")
          this.NotationService.add_view('drawing', 'artbook', r[0].category, this.drawing_id,0,r[0].firsttag,r[0].secondtag,r[0].thirdtag,this.authorid).subscribe(r=>{
            this.createdAt_view = r[0].createdAt;
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
          this.navbar.check_if_research_exists("Drawing",this.type,this.drawing_id,this.title,"clicked").subscribe(p=>{
            if(!p[0].value){
              this.navbar.add_main_research_to_history("Drawing",this.type,this.drawing_id,this.title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe();
            }
          })
        }
        else{
          this.navbar.add_main_research_to_history("Drawing",this.type,this.drawing_id,this.title,"clicked",0,0,0,this.style,this.firsttag,this.secondtag,this.thirdtag).subscribe();
        } 
        
      });
      
      this.NotationService.get_loves('drawing', 'artbook', r[0].category, this.drawing_id,0).subscribe(r=>{
        let list_of_loves= r[0];
        console.log(r[0]);
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
      this.NotationService.get_likes('drawing', 'artbook', r[0].category, this.drawing_id,0).subscribe(r=>{
        let list_of_likes= r[0];
        console.log(r[0]);
        if (list_of_likes.length != 0){
        this.Profile_Edition_Service.get_current_user().subscribe(l=>{
          for (let i=0;i<list_of_likes.length;i++){
            console.log(list_of_likes[i].author_id_who_likes)
            this.list_of_users_ids_likes.push(list_of_likes[i].author_id_who_likes);
            if (list_of_likes[i].author_id_who_likes == l[0].id){
              this.liked = true;
            }
          }
        });
      }
      });
      

      this.get_drawing_artbook_pages(this.drawing_id,r[0].pagesnumber);

      this.Profile_Edition_Service.retrieve_profile_picture( r[0].authorid).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
        
      });

      this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).subscribe(r=> {
        this.user_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
      });

    });
  }


  get_recommendations_by_tag(){
    this.Community_recommendation.get_artwork_recommendations_by_tag('Drawing',this.type,this.drawing_id,this.style,this.firsttag,6).subscribe(u=>{
      if(u[0].length>0){
        console.log(u[0])
        let list_of_first_propositions=u[0];
        console.log(list_of_first_propositions)
        if(list_of_first_propositions.length<6 && this.secondtag){
          this.Community_recommendation.get_artwork_recommendations_by_tag('Drawing',this.type,this.drawing_id,this.style,this.secondtag,6-list_of_first_propositions.length).subscribe(r=>{
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
      if( list_of_first_propositions[k].format==this.type && list_of_first_propositions[k].target_id==this.drawing_id){
        indice=k;
      }
      if(k==len-1){
        list_of_first_propositions.splice(indice,1);
        console.log(list_of_first_propositions)
        let compteur_propositions=0;
        if(list_of_first_propositions.length>0){
          for(let i=0;i<list_of_first_propositions.length;i++){
            if(list_of_first_propositions[i].format=="artbook"){
              this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(list_of_first_propositions[i].target_id).subscribe(comic=>{
                this.list_of_recommendations_by_tag[i]=comic[0];
                compteur_propositions++;
                if(compteur_propositions==list_of_first_propositions.length){
                  console.log(this.list_of_recommendations_by_tag);
                  this.list_of_recommendations_by_tag_retrieved=true;
                }
              })
            }
            else{
              this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(list_of_first_propositions[i].target_id).subscribe(comic=>{
                this.list_of_recommendations_by_tag[i]=comic[0];
                compteur_propositions++;
                if(compteur_propositions==list_of_first_propositions.length){
                  console.log(this.list_of_recommendations_by_tag);
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

  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */

  

  ngAfterViewInit() {

    this.open_recommendations(0);
    this.open_category(0);
    this.initialize_swiper();

  }



  /******************************************************* */
  /******************** AFTER VIEW CHECKED *************** */
  /******************************************************* */
  ngAfterViewChecked() {
    this.initialize_heights();
  }


  
  date_in_seconds(date){
    var uploaded_date = date.substring(0,date.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

   // alert( now_in_seconds - uploaded_date_in_second );
    return ( this.now_in_seconds - uploaded_date_in_second );
  }

  get_date_to_show(s: number) {

   
    if( s < 3600 ) {
      if( Math.trunc(s/60)==1 ) {
        return "Publié il y a 1 minute";
      }
      else {
        return "Publié il y a " + Math.trunc(s/60) + " minutes";
      }
    }
    else if( s < 86400 ) {
      if( Math.trunc(s/3600)==1 ) {
        return "Publié il y a 1 heure";
      }
      else {
        return "Publié il y a " + Math.trunc(s/3600) + " heures";
      }
    }
    else if( s < 604800 ) {
      if( Math.trunc(s/86400)==1 ) {
        return "Publié il y a 1 jour";
      }
      else {
        return "Publié il y a " + Math.trunc(s/86400) + " jours";
      }
    }
    else if ( s < 2419200 ) {
      if( Math.trunc(s/604800)==1 ) {
        return "Publié il y a 1 semaine";
      }
      else {
        return "Publié il y a " + Math.trunc(s/604800) + " semaines";
      }
    }
    else if ( s < 9676800 ) {
      if( Math.trunc(s/2419200)==1 ) {
        return "Publié il y a 1 mois";
      }
      else {
        return "Publié il y a " + Math.trunc(s/2419200) + " mois";
      }
    }
    else {
      if( Math.trunc(s/9676800)==1 ) {
        return "Publié il y a 1 an";
      }
      else {
        return "Publié il y a " + Math.trunc(s/9676800) + " ans";
      }
    }

  }


  /******************************************************* */
  /******************** AJOUT ADAM : récupération des pages des drawing ****************** */
  /******************************************************* */
  get_drawing_artbook_pages(drawing_id,total_pages) {
    
      for( var i=0; i< total_pages; i++ ) {
        this.Drawings_Artbook_Service.retrieve_drawing_page_ofartbook(drawing_id,i).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
          let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_drawing_pages[r[1]]=(SafeURL);
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

    if(this.type=="artbook"){

      var THIS = this;
      
      this.swiper = new Swiper('.swiper-container', {
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

      this.initialize_thumbnails();
    }
  }


  refresh_swiper_pagination() {
    
      $(".top-container .pages-controller-container input").val( this.swiper.activeIndex + 1 );
      $(".top-container .pages-controller-container .total-pages span").html( "/ " + this.swiper.slides.length );
  }


  
  initialize_pages(){
      for( var i=0; i< this.swiperWrapperRef.nativeElement.children.length; i++ ) {
        $(".swiper-wrapper").html( "/ " );
      }
    
  }


  open_recommendations(i : number) {
    this.recommendation_index = i;
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
    if(this.type_of_account=="account"){
      this.like_in_progress=true;
      if(this.liked) {     
        if(this.type=='one-shot'){
          this.NotationService.remove_like('drawing', 'one-shot', this.style, this.drawing_id,0).subscribe(r=>{
            
                (async () => { 
                  const getCurrentCity = () => {
                  this.likesnumber=r[0].likesnumber;
                  return Promise.resolve('Lyon');
                };
                  await getCurrentCity();
                  this.liked=false;
                  this.like_in_progress=false;
              })();
          });
        }
        else if(this.type=='artbook'){      
          this.NotationService.remove_like('drawing', 'artbook', this.style, this.drawing_id,0).subscribe(r=>{      
              
            (async () => { 
                  const getCurrentCity = () => {
                  this.likesnumber=r[0].likesnumber;
                  return Promise.resolve('Lyon');
                };
                  await getCurrentCity();
                  this.liked=false;
                  this.like_in_progress=false;
              })();
          
          });
        }
      }
      else {
        if(this.type=='one-shot'){  
          this.NotationService.add_like('drawing', 'one-shot', this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{        
              (async () => { 
                const getCurrentCity = () => {
                this.likesnumber=r[0].likesnumber;
                return Promise.resolve('Lyon');
              };
                await getCurrentCity();
                this.liked=true;
                this.like_in_progress=false;
            })();
            
          });
        }
        else if(this.type=='artbook'){
        
          this.NotationService.add_like('drawing', 'artbook', this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
              
            (async () => { 
                const getCurrentCity = () => {
                this.likesnumber=r[0].likesnumber;
                return Promise.resolve('Lyon');
              };
                await getCurrentCity();
                this.liked=true;
                this.like_in_progress=false;            
            })();  
          });
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
      this.love_in_progress=true;
      if(this.loved) {     
        if(this.type=='one-shot'){
          this.NotationService.remove_love('drawing', 'one-shot', this.style, this.drawing_id,0).subscribe(r=>{
                (async () => { 
                  const getCurrentCity = () => {
                  this.lovesnumber=r[0].lovesnumber;
                  return Promise.resolve('Lyon');
                };
                  await getCurrentCity();
                  this.loved=false;
                  this.love_in_progress=false;
              })();
          });
        }
        else if(this.type=='artbook'){      
          this.NotationService.remove_love('drawing', 'artbook', this.style, this.drawing_id,0).subscribe(r=>{      
                (async () => { 
                  const getCurrentCity = () => {
                  this.lovesnumber=r[0].lovesnumber;
                  return Promise.resolve('Lyon');
                };
                  await getCurrentCity();
                  this.loved=false;
                  this.love_in_progress=false;
              })();
          
          });
        }
      }
      else {
        if(this.type=='one-shot'){  
          this.NotationService.add_love('drawing', 'one-shot', this.style, this.drawing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{        
              (async () => { 
                const getCurrentCity = () => {
                this.lovesnumber=r[0].lovesnumber;
                return Promise.resolve('Lyon');
              };
                await getCurrentCity();
                this.loved=true;
                this.love_in_progress=false;
            })();
            
          });
        }
        else if(this.type=='artbook'){
        
          this.NotationService.add_love('drawing', 'artbook', this.style, this.drawing_id,1,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
              (async () => { 
                const getCurrentCity = () => {
                this.lovesnumber=r[0].lovesnumber;
                return Promise.resolve('Lyon');
              };
                await getCurrentCity();
                this.loved=true;
                this.love_in_progress=false;            
            })();  
          });
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
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"likes", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_likes},
    });

  }

  show_loves(){
    const dialogRef = this.dialog.open(PopupLikesAndLovesComponent, {
      data: {title:"loves", type_of_account:this.type_of_account,list_of_users_ids:this.list_of_users_ids_loves},
    });

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
  
  add_time_of_view(){
    if(this.mode_visiteur){
      let ending_time_of_view = Math.trunc(new Date().getTime()/1000)  - this.begining_time_of_view;
      if(this.type=='one-shot' && ending_time_of_view>3){
        this.NotationService.add_view_time('drawing', 'one-shot', this.style, this.drawing_id,0,ending_time_of_view,this.createdAt_view).subscribe(r=>{
        });
      }
      if(this.type=='artbook' && ending_time_of_view>3){
        this.NotationService.add_view_time('drawing', 'artbook', this.style, this.drawing_id,0 ,ending_time_of_view,this.createdAt_view).subscribe(r=>{
        });
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
    this.Subscribing_service.archive("drawings",this.type,this.drawing_id).subscribe(r=>{
      this.content_archived=true;
    });
  }

  unarchive(){
    this.Subscribing_service.unarchive("drawings",this.type,this.drawing_id).subscribe(r=>{
      this.content_archived=false;
    });
  }

  emphasize(){
      this.Emphasize_service.emphasize_content("drawing",this.type,this.drawing_id,0).subscribe(r=>{
        location.reload();
      });
  }

  remove_emphasizing(){
      this.Emphasize_service.remove_emphasizing("drawing",this.type,this.drawing_id,0).subscribe(t=>{
        location.reload();
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
  compteur_recom_others_drawings=0
  sendLoadedDrawingOthers(event){
    this.compteur_recom_others_drawings+=1;
    if( this.compteur_recom_others_drawings==this.list_of_recommendations_by_tag.length){
      this.display_drawings_recommendations_others=true;
      this.compteur_recom_others_drawings=0;
      console.log("display recom draw others")
    }
  }

  a_drawing_is_loaded(i){
    this.display_drawings[i]=true;
    let compt=0;
    if(this.type=='artbook'){
      for(let j=0;j<this.list_drawing_pages.length;j++){
        if(this.display_drawings[i]){
          compt+=1;
        }
        if(compt==this.list_drawing_pages.length){
          this.display_pages=true;
        }
      }
    }
    else{
      this.display_pages=true;
    }
   
  }

}


