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
    private rd: Renderer2,
    public navbar: NavbarService,
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
  type:string;
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
  createdAt_view:string;

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

  //variables à déterminer
  mode_visiteur = true;
  mode_visiteur_added = false;
  /******************************************************************** */
  /****VARIABLES ET FONCTIONS D'EDITION******************************** */
  /******************************************************************** */
  //visible : true ou privé : false
  visible:boolean = false;
  edit_information() {
    const dialogRef = this.dialog.open(PopupFormWritingComponent, {
      data: {
      format:this.type, 
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
      format:this.type,
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
        this.Writing_Upload_Service.change_writing_status(this.writing_id,"private").subscribe(r=>{
          location.reload();
        });
      }
    });
  }
  set_public() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de passer cette œuvre en public ? Elle sera visible par tous les utilisateurs'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        this.Writing_Upload_Service.change_writing_status(this.writing_id,"public").subscribe(r=>{
          location.reload();
        });
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
          this.router.navigate( [ `/account/${this.pseudo}/${this.authorid}` ] )
        });

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

    
    this.writing_id  = parseInt(this.activatedRoute.snapshot.paramMap.get('writing_id'));

    this.Writing_Upload_Service.retrieve_writing_information_by_id(this.writing_id).subscribe(r => {
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

      this.Subscribing_service.get_archives_writings().subscribe(r=>{
        if(r[0].format==this.type && r[0].publication_id==this.writing_id){
          this.content_archived=true;
        }
        this.archive_retrieved=true;
      })

      this.viewnumber = r[0].viewnumber;
      this.commentariesnumber = r[0].commentarynumbers;
      this.highlight=r[0].highlight;
      this.title=r[0].title;
      this.style=r[0].category;
      this.type=r[0].format;
      this.firsttag=r[0].firsttag;
      this.secondtag=r[0].secondtag;
      this.thirdtag=r[0].thirdtag;
      this.likesnumber =r[0].likesnumber ;
      this.lovesnumber =r[0].lovesnumber ;
      this.status=r[0].status;
      this.thumbnail_picture=r[0].name_coverpage ;
      this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds(r[0].createdAt) );

      this.Community_recommendation.get_comics_recommendations_by_author(r[0].authorid,0,"serie").subscribe(e=>{
        if(e[0].list_to_send.length>0){
          this.list_of_author_recommendations_comics=e[0].list_to_send;
          this.list_of_author_recommendations_comics_retrieved=true;
        }
        this.Community_recommendation.get_drawings_recommendations_by_author(this.authorid,0,"artbook").subscribe(e=>{
          if(e[0].list_to_send.length >0){
            console.log(e);
            this.list_of_author_recommendations_drawings=e[0].list_to_send;
            this.list_of_author_recommendations_drawings_retrieved=true;
          }
          this.Community_recommendation.get_writings_recommendations_by_author(this.authorid,this.writing_id,"writing").subscribe(e=>{
            if(e[0].list_to_send.length >0){
              this.list_of_author_recommendations_writings=e[0].list_to_send;
              this.list_of_author_recommendations_writings_retrieved=true;
            }
            this.list_of_author_recommendations_retrieved=true;
            this.cd.detectChanges();



          });
        });
      });

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
        if (this.authorid == l[0].id){
          this.mode_visiteur = false;
          this.mode_visiteur_added = true;
        }
        else{
          this.NotationService.add_view('writing',  this.type, r[0].category, this.writing_id,0,r[0].firsttag,r[0].secondtag,r[0].thirdtag,this.authorid).subscribe(r=>{
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
        }  
        
      });
      
      this.NotationService.get_loves('writing',  this.type, r[0].category, this.writing_id,0).subscribe(r=>{
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
      this.NotationService.get_likes('writing',  this.type, r[0].category, this.writing_id,0).subscribe(r=>{
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

    });


  }

  date_in_seconds(date){
    var uploaded_date = date.substring(0,date.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

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



  /*
  initialize_other_swipers() {
    
    
    this.swiperComics = new Swiper('.swiper-container.comics', {
      navigation: {
        nextEl: '.swiper-button-next.comics',
        prevEl: '.swiper-button-prev.comics',
      },
      breakpoints: {
        10: {
          slidesPerView: 1,
          spaceBetween:60,
        },
        1500: {
            slidesPerView: 2,
            spaceBetween:30,
        },
        1700: {
            slidesPerView: 3,
            spaceBetween:30,
        },
        2100: {
            slidesPerView: 4,
            spaceBetween:30,
        }
      }
    });


    this.swiperDrawings = new Swiper('.swiper-container.drawings', {
      navigation: {
        nextEl: '.swiper-button-next.drawings',
        prevEl: '.swiper-button-prev.drawings',
      },
      breakpoints: {
        10: {
          slidesPerView: 1,
          spaceBetween:60,
        },
        1500: {
            slidesPerView: 2,
            spaceBetween:60,
        },
        1700: {
            slidesPerView: 3,
            spaceBetween:60,
        },
        2100: {
            slidesPerView: 3,
            spaceBetween:60,
        }
      }
    });

    

    this.swiperWritings = new Swiper('.swiper-container.writings', {
      navigation: {
        nextEl: '.swiper-button-next.writings',
        prevEl: '.swiper-button-prev.writings',
      },
      breakpoints: {
        10: {
          slidesPerView: 1,
          spaceBetween:60,
        },
        1500: {
            slidesPerView: 2,
            spaceBetween:30,
        },
        1700: {
            slidesPerView: 3,
            spaceBetween:30,
        },
        2100: {
            slidesPerView: 4,
            spaceBetween:30,
        }
      }
    });

    this.cd.detectChanges();
    
  }*/


  

  

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
          this.NotationService.remove_like('writing', this.type, this.style, this.writing_id,0).subscribe(r=>{      
              
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
      else {
        
          this.NotationService.add_like('writing', this.type, this.style, this.writing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
              
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
          this.NotationService.remove_love('writing', this.type, this.style, this.writing_id,0).subscribe(r=>{      
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
      else {      
          this.NotationService.add_love('writing', this.type, this.style, this.writing_id,0,this.firsttag,this.secondtag,this.thirdtag,this.authorid).subscribe(r=>{
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
        this.NotationService.add_view_time('writing', this.type, this.style, this.writing_id,0,ending_time_of_view,this.createdAt_view).subscribe();
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
    this.Subscribing_service.archive("writings",this.type,this.writing_id).subscribe(r=>{
      this.content_archived=true;
    });
  }
  unarchive(){
    this.Subscribing_service.unarchive("writings",this.type,this.writing_id).subscribe(r=>{
      this.content_archived=false;
    });
  }

  emphasize(){
    this.Emphasize_service.emphasize_content("writing",this.type,this.writing_id,0).subscribe(r=>{
      location.reload();
    });
  }

  remove_emphasizing(){
      this.Emphasize_service.remove_emphasizing("writing",this.type,this.writing_id,0).subscribe(t=>{
        location.reload();
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
  
  /*let compt=0;
  if(this.type='artbook'){
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
  }*/
 
}


}


