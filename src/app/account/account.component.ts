import { Component, OnInit, ChangeDetectorRef, HostListener, QueryList } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UploadService } from '../services/upload.service';
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
import { PopupSubscribingsComponent } from '../popup-subscribings/popup-subscribings.component';
import { PopupSubscribersComponent } from '../popup-subscribers/popup-subscribers.component';
import { PopupAddStoryComponent } from '../popup-add-story/popup-add-story.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../popup-form/popup-form.component';

import { Ads_service } from '../../app/services/ads.service'

declare var Muuri:any;
declare var $: any;
declare var masonry:any;


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  
  constructor(private rd: Renderer2, 
    private authenticationService: AuthenticationService,
    private router: Router,
    public route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
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
    ) {
    //this.pseudo = this.activatedRoute.snapshot.paramMap.get('pseudo');

    this.navbar.setActiveSection(0);
    this.navbar.show();
  }

  
  @HostListener('window:resize', ['$event'])
  onResize(event) {

    
    this.cd.detectChanges();
    this.update_new_contents();
    this.calculate_muuri_item_margins();
   

  }

  calculate_muuri_item_margins() {
    let bdContainerWidth = $(".bd-container").width();
    let itemsNumber:number = bdContainerWidth/290;

    let remaningSpace = bdContainerWidth - Math.trunc(itemsNumber) * 290;

    let marginValue = Math.trunc((remaningSpace / (2*itemsNumber)) - 2);
    
    //this.rd.setStyle( this.resizableItem.nativeElement, "margin-left", marginValue+"px" );
    //this.rd.setStyle( this.resizableItem.nativeElement, "margin-right", marginValue+"px" );
    $('.resizableItem').css("margin-left",marginValue+"px");
    $('.resizableItem').css("margin-right",marginValue+"px");

  }


  @ViewChild('profileHovered', {static: false}) profileHovered:ElementRef;
  @ViewChild('profilePicHovered', {static: false}) profilePicHovered:ElementRef;
  showEditCoverPic:boolean = true;
  showEditBio:boolean = true;


  
  //NEW VARIABLES
  emphasized_artwork_added: boolean = false;
  emphasized_artwork:any;

  
  /************* sections ************/
  //0 : artworks, 1 : posters, etc.
  opened_section:number=0;
  //bd, dessins, écrits de l'auteur, etc.
  opened_category:number = -1;
  //-1 : no album add, 1 : add comic, 2 : add drawing, 3 : add writing
  add_album:number = -1;
  // gestion des abonnements
  already_subscribed:boolean=false;

  opened_album:number = 0;
  profile_picture:SafeUrl;
  cover_picture:SafeUrl;

  mode_visiteur:boolean=true;
  mode_visiteur_added:boolean=false;
  pseudo:string;
  user_id:number=0;
  author_name:string;
  primary_description: string;
  occupation: string;
  education: string;
  user_location:string;
  now_in_seconds:number;

  subscribed_users_list:any[]=[];
  users_subscribed_to_list:any[]=[];
  number_of_artpieces:number=0;
  artpieces_received=false;

  number_of_archives:number;
  archives_received=false;
  archives_comics:any;
  archives_drawings:any;
  archives_writings:any;



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
  list_bd_albums_status=["hidden","hidden"];




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
  list_drawing_albums_status=["hidden","hidden"];
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


  update_new_contents() {

    let width = $(".container-comics").width();
    
    if( width <= 600 ) {
      $(".new-artwork:nth-of-type(1)").css("display","block");
      $(".new-artwork:nth-of-type(2), .new-artwork:nth-of-type(3), .new-artwork:nth-of-type(4), .new-artwork:nth-of-type(5)").css("display","none");
    }
    else if( width <= 1000 ) {
      $(".new-artwork:nth-of-type(1), .new-artwork:nth-of-type(2)").css("display","block");
      $(".new-artwork:nth-of-type(3), .new-artwork:nth-of-type(4), .new-artwork:nth-of-type(5)").css("display","none");
    }
    else if( width <= 1300 ) {
      $(".new-artwork:nth-of-type(1), .new-artwork:nth-of-type(2), .new-artwork:nth-of-type(3)").css("display","block");
      $(".new-artwork:nth-of-type(4), .new-artwork:nth-of-type(5)").css("display","none");
    }
    else if( width <= 1700 ) {
      $(".new-artwork:nth-of-type(1), .new-artwork:nth-of-type(2), .new-artwork:nth-of-type(3), .new-artwork:nth-of-type(4)").css("display","block");
      $(".new-artwork:nth-of-type(5)").css("display","none");
    }
    else if( width <= 2000 ) {
      $(".new-artwork:nth-of-type(1), .new-artwork:nth-of-type(2), .new-artwork:nth-of-type(3), .new-artwork:nth-of-type(4), .new-artwork:nth-of-type(5)").css("display","block");
    }




  }



  see_subscribings() {
    this.dialog.open(PopupSubscribingsComponent, {
      data: {
        subscribings:this.users_subscribed_to_list, 
    },
    });
  }

  see_subscribers(){
    this.dialog.open(PopupSubscribersComponent, {
      data: {
        subscribers:this.subscribed_users_list, 
    },
    });
  }

  ngOnInit()  {

    

   
    this.pseudo = this.activatedRoute.snapshot.paramMap.get('pseudo');
    this.user_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    
    
    this.Profile_Edition_Service.get_pseudo_by_user_id( this.user_id ).subscribe( r => {

      if( !r[0] ) {
        this.router.navigateByUrl('/');
      }

      if( this.pseudo != r[0].nickname ) {
        this.router.navigateByUrl('/');
      }
    });


    this.Emphasize_service.get_emphasized_content(this.user_id).subscribe(r=>{
      if (r[0]!=null){
        this.emphasized_artwork=r[0];
        this.emphasized_artwork_added=true;
      }
    });

    this.Subscribing_service.get_new_comic_contents(this.user_id).subscribe(r=>{
      if (r[0]!=null){
        for (let i=0;i<r[0].length;i++){
          if(r[0][i].format=="one-shot"){
            this.BdOneShotService.retrieve_bd_by_id(r[0][i].publication_id).subscribe(s=>{
              this.new_comic_contents[i]=s[0];
              if(i==r[0].length-1){
                this.new_comic_contents_added=true;
              }
            })
          }
          else{
            this.BdSerieService.retrieve_bd_by_id(r[0][i].publication_id).subscribe(s=>{
              this.new_comic_contents[i]=s[0];
              if(i==r[0].length-1){
                this.new_comic_contents_added=true;
              }
            })
          }
        }
      }
    });

    this.Subscribing_service.get_new_drawing_contents(this.user_id).subscribe(r=>{
      if (r[0]!=null){
        for (let i=0;i<r[0].length;i++){
          if(r[0][i].format=="one-shot"){
            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][i].publication_id).subscribe(s=>{
              this.new_drawing_contents[i]=s[0];
              if(i==r[0].length-1){
                this.new_drawing_contents_added=true;
              }
            })
          }
          else{
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][i].publication_id).subscribe(s=>{
              this.new_drawing_contents[i]=(s[0]);
              if(i==r[0].length-1){
                this.new_drawing_contents_added=true;
              }
            })
          }
        }
      }
    });

    this.Subscribing_service.get_new_writing_contents(this.user_id).subscribe(r=>{
      if (r[0]!=null){
        for (let i=0;i<r[0].length;i++){
            this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][i].publication_id).subscribe(s=>{
              this.new_writing_contents[i]=(s[0]);
              if(i==r[0].length-1){
                this.new_writing_contents_added=true;
              }
            })
        }
      }
    });
    
    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
      if (this.pseudo == l[0].nickname){
        this.mode_visiteur = false;
        this.mode_visiteur_added = true;
      }
      else{
        this.Subscribing_service.check_if_visitor_susbcribed(this.user_id).subscribe(information=>{
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

    this.Subscribing_service.get_archives_comics().subscribe(r=>{
      this.archives_comics=r[0];
      this.Subscribing_service.get_archives_drawings().subscribe(l=>{
        this.archives_drawings=l[0];
        this.Subscribing_service.get_archives_writings().subscribe(p=>{
          this.archives_writings=p[0];
          this.Subscribing_service.get_archives_ads().subscribe(q=>{
              this.archives_ads=q[0];
              this.archives_received=true;  
          })  
        })
      })
    });
    this.Ads_service.get_ads_by_user_id(this.user_id).subscribe(r=>{
      if (r[0]!=null){
        for (let i=0;i<r[0].length;i++){
            this.list_of_ads[i]=(r[0][i]);
            if(i==r[0].length-1){
              this.list_of_ads_added=true;
            }
        }
      }
    })

    this.Subscribing_service.get_all_subscribed_users(this.user_id).subscribe(information=>{
      if(Object.keys(information).length>0){
        this.subscribed_users_list=information[0];
      }
    });

    this.Subscribing_service.get_all_users_subscribed_to_before_today(this.user_id).subscribe(information=>{
      if(Object.keys(information).length>0){
        let first_list=information[0];
        this.Subscribing_service.get_all_users_subscribed_to_today(this.user_id).subscribe(info=>{
          if(Object.keys(info).length>0){
            this.users_subscribed_to_list=first_list.concat(info[0]);
          }
          else{
            this.users_subscribed_to_list=first_list;
          }
        })
      }
    });

    this.Albums_service.get_albums_comics(this.user_id).subscribe(information=>{
      if(Object.keys(information).length!=0){
        for (let step=0; step <Object.keys(information).length;step++){
          this.list_titles_albums_bd_added.push(information[step].album_name);
          this.list_titles_albums_bd.push(information[step].album_name);
          this.list_bd_albums_status.push(information[step].status);
          this.list_albums_bd.push(information[step].album_content);
          if(step==Object.keys(information).length -1){
            this.list_albums_bd_added = true;
          }
        }
      }
      else{
        this.list_albums_bd_added = true;
      }
    });

      this.Albums_service.get_albums_drawings(this.user_id).subscribe(information=>{
        if(Object.keys(information).length!=0){     
          for (let step=0; step <Object.keys(information).length;step++){
              this.list_titles_albums_drawings_added.push(information[step].album_name);
              this.list_titles_albums_drawings.push(information[step].album_name);
              this.list_albums_drawings.push(information[step].album_content);
              this.list_drawing_albums_status.push(information[step].status);
              this.cover_album_numbers.push(information[step].thumbnail_cover_drawing);
              this.array_of_selected_safeurls[step]=[];
              //on récupère ls thumbnails ici
              let compteur=0;
              for (let j=0;j<Object.keys(information[step].album_content).length;j++){            
                this.Drawings_Onepage_Service.retrieve_thumbnail_picture( information[step].album_content[j].name_coverpage ).subscribe(r=> {
                  let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                  this.array_of_selected_safeurls[step][j]=SafeURL;
                  compteur=compteur+1;
                  if(step==(Object.keys(information).length -1) && compteur==Object.keys(information[step].album_content).length){
                    this.list_albums_drawings_added = true;
                  }
                });  
              }          
          }
        }
        else{
          this.list_albums_drawings_added = true;
        }
      });

      this.Albums_service.get_albums_writings(this.user_id).subscribe(information=>{
        if(Object.keys(information).length!=0){
          for (let step=0; step <Object.keys(information).length;step++){
            this.list_titles_albums_writings_added.push(information[step].album_name);
            this.list_titles_albums_writings.push(information[step].album_name);
            this.list_writings_albums_status.push(information[step].status);
            this.list_albums_writings.push(information[step].album_content);
            if(step==Object.keys(information).length -1){
              this.list_albums_writings_added = true;
            }

          }
        }
        else{
          this.list_albums_bd_added = true;
        }
      })
    


      this.opened_section = this.route.snapshot.data['section'];
      
      this.open_section( this.opened_section );

      if( this.opened_section == 1 && this.route.snapshot.data['category'] != -1 ) {
        this.open_category( this.route.snapshot.data['category'] );
      }




      this.now_in_seconds= Math.trunc( new Date().getTime()/1000);

      
      this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.Profile_Edition_Service.retrieve_cover_picture( this.user_id ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.cover_picture = SafeURL;
      });

      this.Albums_service.get_standard_albums_comics(this.user_id).subscribe(info=>{
        this.list_bd_albums_status[0]=info[0].status;        
        this.list_bd_albums_status[1]=info[1].status;
        this.BdOneShotService.retrieve_bd_by_userid( this.user_id ).subscribe( r => {
          this.list_bd_oneshot = r[0];
          this.list_bd_oneshot_added=true;
          this.number_of_artpieces = this.number_of_artpieces + this.list_bd_oneshot.length;
        });

        this.BdSerieService.retrieve_bd_by_userid( this.user_id ).subscribe( r => {
          this.list_bd_series = r[0];
          this.number_of_artpieces = this.number_of_artpieces + this.list_bd_series.length;
          this.list_bd_series_added=true;      
        });
      })

      this.Albums_service.get_standard_albums_drawings(this.user_id ).subscribe(info=>{
        this.list_drawing_albums_status[0]=info[0].status;        
        this.list_drawing_albums_status[1]=info[1].status;
        this.Drawings_Onepage_Service.retrieve_drawings_information_by_userid( this.user_id ).subscribe( r => {
          this.list_drawings_onepage = r[0];
          this.number_of_artpieces = this.number_of_artpieces + this.list_drawings_onepage.length;
          this.list_drawings_onepage_added=true;  
        });

        
        this.Drawings_Artbook_Service.retrieve_drawing_artbook_info_by_userid( this.user_id ).subscribe( r => {
          this.list_drawings_artbook = r[0];
          this.number_of_artpieces = this.number_of_artpieces + this.list_drawings_artbook.length;
          this.list_drawings_artbook_added=true;
        });
      })

      this.Writing_Upload_Service.retrieve_writings_information_by_user_id( this.user_id ).subscribe( r => {
        this.list_writings = r[0];
        this.number_of_artpieces = this.number_of_artpieces + this.list_writings.length;
        this.list_writings_added=true;
      });

    
      this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=>{
        this.author_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
        this.occupation=r[0].job;
        this.education=r[0].training;
        this.user_location=r[0].location;
      });

      this.cd.detectChanges();
      
  }


  @ViewChildren('getwidth') getwidth: QueryList<any>;
  ngForRendred() {
    this.update_new_contents();
    this.calculate_muuri_item_margins();
  }

  @ViewChildren('getmasonry') getmasonry: QueryList<any>;
  masonryrendered() {
    window.dispatchEvent(new Event('resize'));
  }


  ngAfterViewInit() {

    
     this.getwidth.changes.subscribe(t => {
      this.ngForRendred();
    })

    
    

    


    this.profileHovered.nativeElement.addEventListener('mouseenter', e => {
      this.showEditCoverPic = false;
    });
    this.profileHovered.nativeElement.addEventListener('mouseleave', e => {
      this.showEditCoverPic = true;
    });
    this.profilePicHovered.nativeElement.addEventListener('mouseenter', e => {
      this.showEditBio = false;
    });
    this.profilePicHovered.nativeElement.addEventListener('mouseleave', e => {
      this.showEditBio = true;
    });

  }


  open_section(i : number) {

    if( this.opened_section == i ) {
      return;
    }

    this.opened_category = -1;
    this.opened_section=i;
    
    if( (i == 0) ) { this.location.go(`/account/${this.pseudo}/${this.user_id}`); }
    else if( i == 1 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks`); }
    else if( i == 2 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/ads`); }
    else if( i == 5 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/about`); }
    else if( i == 6 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/archives`); }
  }


  scroll(el: HTMLElement) {

    var topOfElement = el.offsetTop - 150;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

  //For section 0 : Artworks
  open_category(i : number) {

    //scroll to artworks



    if( this.opened_category == i ) {
      return;
    }

    this.cd.detectChanges();
    
    this.opened_category=i;
    this.add_album=-1;

    this.open_album( 0 );

    
    if( (i == 0) ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks/comics`); }
    if( (i == 1) ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks/drawings`); }
    if( (i == 2) ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks/writings`); }

  }

      


  start_add_album(i : number) {
    if( this.add_album != -1 ) {
      this.add_album = -1;
      this.open_album( this.opened_album );
      return;
    }
    this.add_album = i;
  }

  k=0;

  ini_masonry( i:number ) {
    console.log("mansour")
    let THIS=this;
    
    
    //THIS.rd.setStyle( THIS.albumToShow.nativeElement, "opacity", "0");

    var $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      columnWidth: 200,
      gutter:10,
      //isInitLayout:true,
      initLayout:false,
      fitWidth: true,
    });

    $grid.on( 'layoutComplete', function() {
      console.log('layout is complete0');

      if( THIS.albumToShow ) {
        THIS.cd.detectChanges();
        console.log("changing opacity");
        //THIS.rd.setStyle( THIS.albumToShow.nativeElement, "transition", "all 2s");
        //THIS.rd.setStyle( THIS.albumToShow.nativeElement, "opacity", "1");
        THIS.list_visibility_albums_drawings=true;
        //THIS.rd.setStyle( THIS.customAlbumSelector.nativeElement, "opacity", "1");
      }

      $grid.masonry('reloadItems');
    });

    $grid.masonry();

  }


  @ViewChild('albumToShow', {static:false}) albumToShow:ElementRef;

  j=0;
  sendLoaded(event){
    
    if(this.mode_visiteur){
      if(event && this.opened_category==1 && this.opened_album==0){
        this.j++;
        let total=0;
        if(this.list_drawing_albums_status[0]!='hidden'){
          total+=this.list_drawings_onepage.length;
        }
        if(this.list_drawing_albums_status[1]!='hidden'){
          total+=this.list_drawings_artbook.length;
        }
        if(this.j===total){
          this.j=0;
          this.ini_masonry( this.opened_album );
          //this.rd.setStyle( this.albumToShow.nativeElement, "opacity", "1");
        }
      }
      console.log(this.list_drawing_albums_status);
  
      if(event && this.opened_category==1 && this.opened_album>0){
        this.j++;
        let total=0;
        console.log(this.opened_album);
        if(this.opened_album==1){
          console.log("this.opened_album==1");
          if(this.list_drawing_albums_status[0]!='hidden' || this.list_drawing_albums_status[1]!='hidden'){
            if(this.list_drawing_albums_status[0]=='hidden'){
              total=this.list_drawings_artbook.length;
              console.log("total=this.list_drawings_artbook.length");
            }
            else{
              total=this.list_drawings_onepage.length;
              console.log("this.list_drawings_onepage.length");
            }
          }
          else{
            total=this.list_albums_drawings[0].length;
            console.log("this.list_albums_drawings[0].length");
          }
        }
        else{
          if(this.list_drawing_albums_status[0]!='hidden' && this.list_drawing_albums_status[1]!='hidden'){
            total=this.list_albums_drawings[this.opened_album-3].length;
          }
          if(this.list_drawing_albums_status[0]=='hidden' && this.list_drawing_albums_status[1]!='hidden'){
            total=this.list_albums_drawings[this.opened_album-2].length;
          }
          if(this.list_drawing_albums_status[0]!='hidden' && this.list_drawing_albums_status[1]=='hidden'){
            total=this.list_albums_drawings[this.opened_album-2].length;
          }
          if(this.list_drawing_albums_status[0]=='hidden' && this.list_drawing_albums_status[1]=='hidden'){
            total=this.list_albums_drawings[this.opened_album-1].length;
          }
        }
        
        
        if(this.j===total){
          this.j=0;
          this.ini_masonry( this.opened_album );
          //this.rd.setStyle( this.albumToShow.nativeElement, "opacity", "1");
        }
      }
    }
    else{
      console.log("pas visiteur")
      if(event && this.opened_category==1 && this.opened_album==0){
        console.log("tout")
        this.j++;
        let total=this.list_drawings_onepage.length + this.list_drawings_artbook.length;
        if(this.j===total){
          console.log("fin opened 0")
          this.j=0;
          this.ini_masonry( this.opened_album );
          //this.rd.setStyle( this.albumToShow.nativeElement, "opacity", "1");
        }
      }
      if(event && this.opened_category==1 && this.opened_album==1){
        console.log("onepage");
        this.j++;
        let total=this.list_drawings_onepage.length;
        console.log(this.j);
        console.log(total);
        if(this.j===total){
          console.log("on y est");
          this.j=0;
          this.ini_masonry( this.opened_album );
          //this.rd.setStyle( this.albumToShow.nativeElement, "opacity", "1");
        }
      }
      if(event && this.opened_category==1 && this.opened_album==2){
        console.log("artbook");
        this.j++;
        let total=this.list_drawings_artbook.length;
        if(this.j===total){
          this.j=0;
          this.ini_masonry( this.opened_album );
          //this.rd.setStyle( this.albumToShow.nativeElement, "opacity", "1");
        }
      }
      if(event && this.opened_category==1 && this.opened_album>2){
        this.j++;
        let total=this.list_albums_drawings[this.opened_album-3].length;
        if(this.j===total){
          this.j=0;
          this.ini_masonry( this.opened_album);
          //this.rd.setStyle( this.albumToShow.nativeElement, "opacity", "1");
        }
      }
    }
  }
  
  
  open_album(i : number) {

    if( this.opened_album == i ) {
      return;
    }
    
    this.j=0;    
    
    this.list_visibility_albums_drawings=false;
    console.log(this.list_visibility_albums_drawings);
    this.cd.detectChanges();
    /*if(this.albumToShow){
      //this.rd.setStyle( this.albumToShow.nativeElement, "opacity", "0");
      if( i >= 3 ) {
        //this.rd.setStyle( this.albumToShow.nativeElement, "opacity", "0");
        this.opened_album=-100;

        if( this.customAlbumSelector ) {
          this.rd.setStyle( this.customAlbumSelector.nativeElement, "opacity", "0");
        }
        console.log("open album");
        this.cd.detectChanges();
      }
    }*/
    
    this.opened_album=i;
    
    //this.ini_masonry();
    this.cd.detectChanges();

    /*$('.grid').masonry({
      itemSelector: '.grid-item',
      columnWidth: 200
    });*/


    /*if( this.opened_category == 1 && i == 0 ) {

      this.cd.detectChanges();

      this.gridAlbum = new Muuri('.gridAlbumArtbook', {dragEnabled: false,layout: {fillGaps: true},});
      this.gridAlbum = new Muuri('.gridAlbumOneshot', {dragEnabled: false,layout: {fillGaps: true},});
      

      let k=0;
      this.gridAlbum.on('layoutEnd', function (items) {
        if(k==0){
          console.log("layoutend")
          window.dispatchEvent(new Event('resize'));
          k++;
        }
        else{
          return
        }
      });

      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));

    }
    else if( this.opened_category == 1 && i == 1 ) {

      this.cd.detectChanges();

      this.gridAlbum = new Muuri('.gridAlbumOneshot2', {dragEnabled: false,layout: {fillGaps: true},});
            
      let k=0;
      this.gridAlbum.on('layoutEnd', function (items) {
        if(k==0){
          console.log("layoutend")
          window.dispatchEvent(new Event('resize'));
          k++;
        }
        else{
          return
        }
      });

      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
      
    }
    else if( this.opened_category == 1 && i == 2 ) {

      this.cd.detectChanges();

      this.gridAlbum = new Muuri('.gridAlbumArtbook2', {dragEnabled: false,layout: {fillGaps: true},});
            
      let k=0;
      this.gridAlbum.on('layoutEnd', function (items) {
        if(k==0){
          console.log("layoutend")
          window.dispatchEvent(new Event('resize'));
          k++;
        }
        else{
          return
        }
      });

      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
      
    }
    else if( this.opened_category == 1 && i >= 3 ) {

      this.cd.detectChanges();

      this.gridAlbum = new Muuri('.gridAlbumCreated', {dragEnabled: false,layout: {fillGaps: true},});
            
      let k=0;
      this.gridAlbum.on('layoutEnd', function (items) {
        if(k==0){
          console.log("layoutend")
          window.dispatchEvent(new Event('resize'));
          k++;
        }
        else{
          return
        }
      });

      this.cd.detectChanges();
      window.dispatchEvent(new Event('resize'));
      
    }*/


  }


  
  /*@ViewChildren('resize') set resize(content: QueryList<any>) {

    this.cd.detectChanges();
    //this.ini_masonry();
    console.log("resize");
    //window.dispatchEvent(new Event('resize'));
    //window.dispatchEvent(new Event('resize'));
  }*/
 


  add_story(){
    const dialogRef = this.dialog.open(PopupAddStoryComponent, {
      data: {user_id:this.user_id},
    });
  }


  change_cover_picture() {
    const dialogRef = this.dialog.open(PopupFormComponent, {
      data: {type:"edit_cover_picture"},
    });
  }

  change_profile_picture() {
    const dialogRef = this.dialog.open(PopupFormComponent, {
      data: {type:"edit_profile_picture"},
    });
  }


  change_profile_bio() {
    const dialogRef = this.dialog.open(PopupFormComponent, {
      data: {type:"edit_bio"},
    });
  }

  subscribtion(){
    if(!this.already_subscribed){
      this.Subscribing_service.subscribe_to_a_user(this.user_id).subscribe(information=>{
        this.already_subscribed=true;
      });
    }
    else{
      this.Subscribing_service.remove_subscribtion(this.user_id).subscribe(information=>{
        this.already_subscribed=false;
      });
    }
  }

  /************************************************ */
  /************************************************ */
  /**************RESIZE FUNCTIONS****************** */
  /************************************************ */
  /************************************************ */
  /*
  resize_comics() {
    $('.bd-thumbnail').css({'width': ( this.get_comics_size() - 2 ) +'px'});
  }

  get_comics_size() {
    return $('.bd-thumbnails-container').width()/this.get_comics_per_line();
  }

  get_comics_per_line() {
    var width = window.innerWidth;

    if( width > 1600 ) {
      return 5;
    }
    else if( width > 1200) {
      return 4;
    }
    else if( width > 1000) {
      return 3;
    }
    else if( width > 700) {
      return 2;
    }
    else {
      return 1;
    }
  }
 
  resize_writings() {
    $('.writing-thumbnail').css({'width': ( this.get_writings_size() - 2 ) +'px'});
  }

  get_writings_size() {
    return $('.writing-thumbnails-container').width()/this.get_writings_per_line();
  }

  get_writings_per_line() {
    var width = window.innerWidth;

    if( width > 1600 ) {
      return 5;
    }
    else if( width > 1200) {
      return 4;
    }
    else if( width > 1000) {
      return 3;
    }
    else if( width > 700) {
      return 2;
    }
    else {
      return 1;
    }
  }*/



 change_drawing_album_status(i,value){
    if(value){
        if(i==0){
          this.Albums_service.change_drawing_album_status("one-shot","standard","hidden").subscribe(
            r=>{this.list_drawing_albums_status[0]="hidden";});        
        }
        if(i==1){
          this.Albums_service.change_drawing_album_status("artbook","standard","hidden").subscribe(
            r=>{this.list_drawing_albums_status[1]="hidden"; });
        }
        else if (i>1){
          this.Albums_service.change_drawing_album_status(this.list_titles_albums_drawings[i],"public","private").subscribe(
            r=>{ this.list_drawing_albums_status[i-1]="private"; });
        }
    }
    else{
      if(i==0){
        this.Albums_service.change_drawing_album_status("one-shot","hidden","standard").subscribe(
          r=>{ this.list_drawing_albums_status[0]="standard"; }
        );
      }
      if(i==1){
        this.Albums_service.change_drawing_album_status("artbook","hidden","standard").subscribe(
          r=>{ this.list_drawing_albums_status[1]="stantard";} );
      }
      else if (i>1){
        this.Albums_service.change_drawing_album_status(this.list_titles_albums_drawings[i],"private","public").subscribe(
          r=>{this.list_drawing_albums_status[i-1]="public";});
      }
    }
  }
    
  remove_drawing_album(i){
    this.Albums_service.remove_drawing_album(this.list_titles_albums_drawings[i],this.list_drawing_albums_status[i-1]).subscribe(r=>{
      location.reload();
    })
  }


  change_bd_album_status(i,value){
    if(value){
      if(i==0){
        this.Albums_service.change_comic_album_status("one-shot","standard","hidden").subscribe(
          r=>{this.list_bd_albums_status[0]="hidden";
          console.log(this.list_bd_albums_status);});        
      }
      if(i==1){
        this.Albums_service.change_comic_album_status("serie","standard","hidden").subscribe(
          r=>{
            this.list_bd_albums_status[1]="hidden";
            console.log(this.list_bd_albums_status);
           });
      }
      else if (i>1){
        this.Albums_service.change_comic_album_status(this.list_titles_albums_bd[i],"public","private").subscribe(
          r=>{ this.list_bd_albums_status[i-1]="private"; });
      }
    }
    else{
      if(i==0){
        this.Albums_service.change_comic_album_status("one-shot","hidden","standard").subscribe(
          r=>{ this.list_bd_albums_status[0]="standard";
        console.log(this.list_bd_albums_status) }
        );
      }
      if(i==1){
        this.Albums_service.change_comic_album_status("serie","hidden","standard").subscribe(
          r=>{ this.list_bd_albums_status[1]="stantard";
          console.log(this.list_bd_albums_status) } );
      }
      else if (i>1){
        this.Albums_service.change_comic_album_status(this.list_titles_albums_bd[i],"private","public").subscribe(
          r=>{this.list_bd_albums_status[i-1]="public";});
      }
    }

  this.cd.detectChanges();
  }

  remove_bd_album(i){
    this.Albums_service.remove_comic_album(this.list_titles_albums_bd[i],this.list_bd_albums_status[i-1]).subscribe(r=>{
      location.reload();
    })
  }

  change_writing_album_status(i,value){
    if(value){
        this.Albums_service.change_writing_album_status(this.list_titles_albums_writings_added[i],"public","private").subscribe(
          r=>{ this.list_writings_albums_status[i]="private"; });
    }
    else{
        this.Albums_service.change_writing_album_status(this.list_titles_albums_writings_added[i],"private","public").subscribe(
          r=>{this.list_writings_albums_status[i]="public";});
    }
  }

  remove_writing_album(i){
    this.Albums_service.remove_writing_album(this.list_titles_albums_writings_added[i],this.list_writings_albums_status[i]).subscribe(r=>{
      location.reload();
    })
  }


}



