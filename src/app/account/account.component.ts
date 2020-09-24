import { Component, OnInit, ChangeDetectorRef, HostListener, QueryList } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
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
import { PopupSubscribingsComponent } from '../popup-subscribings/popup-subscribings.component';
import { PopupSubscribersComponent } from '../popup-subscribers/popup-subscribers.component';
import { PopupAddStoryComponent } from '../popup-add-story/popup-add-story.component';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


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
    private Reports_service:Reports_service,
    private chatService:ChatService,
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
    this.update_number_of_comics_to_show();
    this.update_number_of_drawings_to_show();
    this.update_new_contents();
    this.cd.detectChanges();

  }

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
  }

  /*calculate_muuri_item_margins() {
    let bdContainerWidth = $(".bd-container").width();
    let itemsNumber:number = bdContainerWidth/290;
    console.log(itemsNumber)

    let remaningSpace = bdContainerWidth - Math.trunc(itemsNumber) * 290;

    let marginValue = Math.trunc((remaningSpace / (2*itemsNumber)) - 2);
    
    //this.rd.setStyle( this.resizableItem.nativeElement, "margin-left", marginValue+"px" );
    //this.rd.setStyle( this.resizableItem.nativeElement, "margin-right", marginValue+"px" );
    $('.resizableItem').css("margin-left",marginValue+"px");
    $('.resizableItem').css("margin-right",marginValue+"px");

  }*/


  @ViewChild('profileHovered', {static: false}) profileHovered:ElementRef;
  @ViewChild('profilePicHovered', {static: false}) profilePicHovered:ElementRef;
  //@ViewChild('drawing') drawing:ElementRef;
  
  showEditCoverPic:boolean = true;
  showEditBio:boolean = true;


  
  //NEW VARIABLES
  emphasized_artwork_added: boolean = false;
  emphasized_artwork:any;
  pp_is_loaded=false;
  cover_is_loaded=false;
  
  /************* sections ************/
  //0 : artworks, 1 : posters, etc.
  opened_section:number=0;
  //bd, dessins, écrits de l'auteur, etc.
  opened_category:number = -1;
  //-1 : no album add, 1 : add comic, 2 : add drawing, 3 : add writing
  add_album:number = -1;
  // gestion des abonnements
  already_subscribed:boolean=false;

  opened_album:number = -1;
  profile_picture:SafeUrl;
  cover_picture:SafeUrl;

  visitor_id:number;
  visitor_name:string;
  mode_visiteur:boolean=true;
  mode_visiteur_added:boolean=false;
  pseudo:string;
  user_id:number=0;
  author_name:string;
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

  //type of profile
  type_of_profile:string;
  type_of_profile_retrieved=false;

  //number of publications
  number_of_comics:number;
  number_of_drawings:number;
  number_of_writings:number;

  visible_number_of_comics:number=0;
  visible_number_of_drawings:number=0;
  visible_number_of_writings:number=0;


  number_of_artpieces_visitor=0;
  number_of_comics_visitor=0;
  number_of_drawings_visitor=0;
  number_of_writings_visitor=0;

  user_blocked=false;
  user_who_blocked:string;
  user_blocked_retrieved=false;

  update_new_contents() {

    let width = $(".bd-container").width();
    if( width <= 640 ) {
      $(".new-artwork:nth-of-type(1)").css("display","block");
      $(".new-artwork:nth-of-type(2), .new-artwork:nth-of-type(3), .new-artwork:nth-of-type(4), .new-artwork:nth-of-type(5)").css("display","none");
    }
    else if( width <= 960 ) {
      $(".new-artwork:nth-of-type(1), .new-artwork:nth-of-type(2)").css("display","block");
      $(".new-artwork:nth-of-type(3), .new-artwork:nth-of-type(4), .new-artwork:nth-of-type(5)").css("display","none");
    }
    else if( width <= 1290 ) {
      $(".new-artwork:nth-of-type(1), .new-artwork:nth-of-type(2), .new-artwork:nth-of-type(3)").css("display","block");
      $(".new-artwork:nth-of-type(4), .new-artwork:nth-of-type(5)").css("display","none");
    }
    else if( width <= 1510 ) {
      $(".new-artwork:nth-of-type(1), .new-artwork:nth-of-type(2), .new-artwork:nth-of-type(3), .new-artwork:nth-of-type(4)").css("display","block");
      $(".new-artwork:nth-of-type(5)").css("display","none");
    }
    else{
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
    this.authenticationService.currentUserType.subscribe(r=>{
      if(r!=''){
        this.type_of_profile=r;
        this.type_of_profile_retrieved=true;
      }
    })

   
    this.pseudo = this.activatedRoute.snapshot.paramMap.get('pseudo');
    this.user_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    if(!(this.user_id>0)){
      this.router.navigateByUrl('/page_not_found');
        return
    }
    
    this.Profile_Edition_Service.retrieve_profile_data( this.user_id ).subscribe( r => {
      if( !r[0] || r[0].status=="visitor") {
        this.router.navigateByUrl('/page_not_found');
        return
      }

      if( this.pseudo != r[0].nickname ) {
        this.router.navigateByUrl('/page_not_found');
        return
      }
      else{
        
        this.number_of_comics=r[0].number_of_comics;
        this.number_of_drawings=r[0].number_of_drawings;
        this.number_of_writings=r[0].number_of_writings;
        this.Emphasize_service.get_emphasized_content(this.user_id).subscribe(r=>{
          if (r[0]!=null){
            this.emphasized_artwork=r[0];
            this.emphasized_artwork_added=true;
          }
        });
    
        this.Subscribing_service.get_new_comic_contents(this.user_id).subscribe(r=>{
          if (r[0].length>0){
            let compteur=0;
            for (let i=0;i<r[0].length;i++){
              if(r[0][i].format=="one-shot"){
                this.BdOneShotService.retrieve_bd_by_id(r[0][i].publication_id).subscribe(s=>{
                  this.new_comic_contents[i]=s[0];
                  compteur++;
                  if(compteur==r[0].length){
                    this.new_comic_contents_added=true;
                  }
                })
              }
              else{
                this.BdSerieService.retrieve_bd_by_id(r[0][i].publication_id).subscribe(s=>{
                  this.new_comic_contents[i]=s[0];
                  compteur++;
                  if(compteur==r[0].length){
                    this.new_comic_contents_added=true;
                  }
                })
              }
            }
          }
        });
    
        this.Subscribing_service.get_new_drawing_contents(this.user_id).subscribe(r=>{
          if (r[0].length>0){
            let compteur=0;
            for (let i=0;i<r[0].length;i++){
              if(r[0][i].format=="one-shot"){
                this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(r[0][i].publication_id).subscribe(s=>{
                  this.new_drawing_contents[i]=s[0];
                  compteur++;
                  if(compteur==r[0].length){
                    this.new_drawing_contents_added=true;
                  }
                })
              }
              else{
                this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(r[0][i].publication_id).subscribe(s=>{
                  this.new_drawing_contents[i]=s[0];
                  compteur++;
                  if(compteur==r[0].length){
                    this.new_drawing_contents_added=true;
                  }
                })
              }
            }
          }
        });
    
        this.Subscribing_service.get_new_writing_contents(this.user_id).subscribe(r=>{
          if (r[0].length>0){
            let compteur=0;
            for (let i=0;i<r[0].length;i++){
                this.Writing_Upload_Service.retrieve_writing_information_by_id(r[0][i].publication_id).subscribe(s=>{
                  this.new_writing_contents[i]=s[0];
                  compteur++;
                  if(compteur==r[0].length){
                    this.new_writing_contents_added=true;
                  }
                })
            }
          }
        });
        
        this.Profile_Edition_Service.get_current_user().subscribe(l=>{
          this.visitor_id=l[0].id
          this.visitor_name=l[0].firstname + ' ' + l[0].lastname;
          if (this.pseudo == l[0].nickname){
            this.mode_visiteur = false;
            this.mode_visiteur_added = true;
            this.user_blocked=false;
            this.user_blocked_retrieved=true;
          }
          else{
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
            })
            this.Subscribing_service.check_if_visitor_susbcribed(this.user_id).subscribe(information=>{
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
            this.navbar.check_if_research_exists("Artist","unknown",this.user_id,this.pseudo,"clicked").subscribe(p=>{
              if(!p[0].value){
                this.navbar.add_main_research_to_history("Artist","unknown",this.user_id,this.pseudo,"clicked",this.number_of_comics,this.number_of_drawings,this.number_of_writings,"unknown","unknown","unknown","unknown").subscribe();
              }
            })
          }
          else{
            this.navbar.add_main_research_to_history("Artist","unknown",this.user_id,this.pseudo,"clicked",this.number_of_comics,this.number_of_drawings,this.number_of_writings,"unknown","unknown","unknown","unknown").subscribe();
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
    
        this.opened_section = this.route.snapshot.data['section'];
        
        this.open_section( this.opened_section );
    
        if( this.opened_section == 1 && this.route.snapshot.data['category'] != -1 ) {
          this.open_category( this.route.snapshot.data['category'] );
        }
        
  
          
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

        
        // comics contents
        this.Albums_service.get_standard_albums_comics(this.user_id).subscribe(info=>{
          this.list_bd_albums_status[0]=info[0].status;        
          this.list_bd_albums_status[1]=info[1].status;
          this.BdOneShotService.retrieve_bd_by_userid( this.user_id ).subscribe( r => {
            this.list_bd_oneshot = r[0];
            for(let i=0;i<this.list_bd_oneshot.length;i++){
              if(this.list_bd_oneshot[i].status=="public"){
                this.number_of_artpieces+=1;
                this.visible_number_of_comics+=1;
              }
            }
            if(this.list_bd_albums_status[0]!="hidden"){
              for(let i=0;i<this.list_bd_oneshot.length;i++){
                if(this.list_bd_oneshot[i].status=='public'){
                  this.number_of_artpieces_visitor+=1;
                  this.number_of_comics_visitor+=1;
                }
              }
            }
            
            this.list_bd_oneshot_added=true;
            this.BdSerieService.retrieve_bd_by_userid( this.user_id ).subscribe( r => {
              this.list_bd_series = r[0];
              for(let i=0;i<this.list_bd_series.length;i++){
                if(this.list_bd_series[i].status=="public"){
                  this.number_of_artpieces+=1;
                  this.visible_number_of_comics+=1;
                }
              }
              if(this.list_bd_albums_status[1]!="hidden"){
                for(let i=0;i<this.list_bd_series.length;i++){
                  if(this.list_bd_series[i].status=='public'){
                    this.number_of_artpieces_visitor+=1;
                    this.number_of_comics_visitor+=1;
                  }
                }
              }
              
              this.list_bd_series_added=true;   
              
              this.Albums_service.get_albums_comics(this.user_id).subscribe(information=>{
                if(Object.keys(information).length!=0){
                  for (let i=0; i <Object.keys(information).length;i++){
                    this.list_titles_albums_bd_added.push(information[i].album_name);
                    this.list_titles_albums_bd.push(information[i].album_name);
                    this.list_bd_albums_status.push(information[i].status);
                    let album=information[i].album_content
                    let length =Object.keys(information[i].album_content).length
                      for (let j=0;j<length;j++){   
                        if(information[i].album_content[length-1-j]){
                          if(!this.check_if_comic_public(information[i].album_content[length-1-j])){
                            album.splice(length-1-j,1);
                          }
                        } 
                        if(j==length-1){
                          this.list_albums_bd.push(album);
                          if(i==Object.keys(information).length -1){
                            this.list_albums_bd_added = true;
                            console.log( this.list_albums_bd)
                          }
                        }
                        
                      } 
                    
                  }
                }
                else{
                  this.list_albums_bd_added = true;
                }
              });

            });
            
          });
    
          
        })
    
        //drawings contents
        this.Albums_service.get_standard_albums_drawings(this.user_id ).subscribe(info=>{
          this.list_drawing_albums_status[0]=info[0].status;        
          this.list_drawing_albums_status[1]=info[1].status;
          this.Drawings_Onepage_Service.retrieve_drawings_information_by_userid( this.user_id ).subscribe( r => {
            this.list_drawings_onepage = r[0];
            for(let i=0;i<this.list_drawings_onepage.length;i++){
              if(this.list_drawings_onepage[i].status=="public"){
                this.number_of_artpieces+=1;
                this.visible_number_of_drawings+=1;
              }
            }
            if(this.list_drawing_albums_status[0]!="hidden"){
              for(let i=0;i<this.list_drawings_onepage.length;i++){
                if(this.list_drawings_onepage[i].status=='public'){
                  this.number_of_artpieces_visitor+=1;
                  this.number_of_drawings_visitor+=1;
                }
              }
            }
           
            this.list_drawings_onepage_added=true;
            
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_info_by_userid( this.user_id ).subscribe( r => {
              this.list_drawings_artbook = r[0];
              for(let i=0;i<this.list_drawings_artbook.length;i++){
                if(this.list_drawings_artbook[i].status=="public"){
                  this.number_of_artpieces+=1;
                  this.visible_number_of_drawings+=1;
                }
              }
              if(this.list_drawing_albums_status[1]!="hidden"){
                for(let i=0;i<this.list_drawings_artbook.length;i++){
                  if(this.list_drawings_artbook[i].status=='public'){
                    this.number_of_artpieces_visitor+=1;
                    this.number_of_drawings_visitor+=1;
                  }
                }
              }
              
              this.list_drawings_artbook_added=true;

              this.Albums_service.get_albums_drawings(this.user_id).subscribe(information=>{
                if(Object.keys(information).length!=0){   
                  for (let i=0; i <Object.keys(information).length;i++){
                      this.list_titles_albums_drawings_added.push(information[i].album_name);
                      this.list_titles_albums_drawings.push(information[i].album_name);
                      console.log(information[i].album_name)
                      let album=information[i].album_content;
                      this.list_drawing_albums_status.push(information[i].status);
                      let length =Object.keys(information[i].album_content).length
                      for (let j=0;j<length;j++){   
                        if(information[i].album_content[length-1-j]){
                          if(!this.check_if_drawing_public(information[i].album_content[length-1-j])){
                            album.splice(length-1-j,1);
                          }
                        } 
                        if(j==length-1){
                          console.log(album)
                          this.list_albums_drawings.push(album);
                          if(i==Object.keys(information).length-1){
                            this.list_albums_drawings_added = true;
                          }
                        }
                        
                      } 
                  }
                }
                else{
                  this.list_albums_drawings_added = true;
                }
              });
            });
          });
           
        })
    
        //writings contents
        this.Writing_Upload_Service.retrieve_writings_information_by_user_id( this.user_id ).subscribe( r => {
          this.list_writings = r[0];
          for(let i=0;i<this.list_writings.length;i++){
            if(this.list_writings[i].status=="public"){
              this.number_of_artpieces+=1;
              this.visible_number_of_writings+=1;
            }
          }
          if(this.list_writings_albums_status[0]!="hidden"){
            for(let i=0;i<this.list_writings.length;i++){
              if(this.list_writings[i].status=='public'){
                this.number_of_artpieces_visitor+=1;
                this.number_of_writings_visitor+=1;
              }
            }
          }
          
          this.list_writings_added=true;
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
                      console.log(this.list_titles_albums_writings_added)
                    }
                  }
                  
                } 
      
              }
            }
            else{
              this.list_albums_bd_added = true;
            }
          })
        });
    
      
        this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=>{
          this.author_name = r[0].firstname + ' ' + r[0].lastname;
          this.primary_description=r[0].primary_description;
          this.occupation=r[0].job;
          this.education=r[0].training;
          this.user_location=r[0].location;
        });
    
       
      }
    });


    
      
  }


  @ViewChildren('getwidth') getwidth: QueryList<any>;
  @ViewChildren('container_comics') container_comics: QueryList<any>;
  @ViewChildren('container_drawings') container_drawings: QueryList<any>;
  @ViewChildren('container_writings') container_writings: QueryList<any>;
  
  ngForRendred() {
    this.update_new_contents();
    //this.calculate_muuri_item_margins();
  }

  container_comics_rendred() {
    this.get_number_of_comics_to_show();
  }

  container_drawings_rendred() {
    this.get_number_of_drawings_to_show();
  }

  container_writings_rendred() {
    this.get_number_of_writings_to_show();
  }

  

  ngAfterViewInit() {

    
     this.getwidth.changes.subscribe(t => {
      this.ngForRendred();
    })

    this.container_comics.changes.subscribe(t => {
      this.container_comics_rendred();
    })
    
    this.container_drawings.changes.subscribe(t => {
      this.container_drawings_rendred();
    })
    
    this.container_writings.changes.subscribe(t => {
      this.container_writings_rendred();
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

    if(i==0){
      this.compteur_new_comic_contents=0;
      this.display_new_comic_contents=false;
      this.compteur_new_writing_contents=0;
      this.display_new_writing_contents=false;
      this.compteur_new_drawing_contents=0;
      this.display_new_drawing_contents=false;
    }
   
    this.opened_category = -1;
    this.opened_section=i;
    this.cd.detectChanges();
    if( (i == 0) ) { this.location.go(`/account/${this.pseudo}/${this.user_id}`); }
    else if( i == 1 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/artworks`); }
    else if( i == 2 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/ads`); }
    else if( i == 5 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/about`); }
    else if( i == 6 ) { this.location.go(`/account/${this.pseudo}/${this.user_id}/archives`); }
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
  open_category(i : number) {

    if( this.opened_category == i ) {
      return;
    }
    this.contents_loading=false;
    if(this.opened_section==1){
      if((this.mode_visiteur && this.number_of_comics_visitor==0 && i==0) || (!this.mode_visiteur && this.number_of_comics==0 && i==0)){
        this.opened_category=-1;
        return;
      }
      if((this.mode_visiteur && this.number_of_drawings_visitor==0 && i==1) || (!this.mode_visiteur && this.number_of_drawings==0 && i==1)){
        this.opened_category=-1;
        return;
      }
      if((this.mode_visiteur && this.number_of_writings_visitor==0 && i==2) || (!this.mode_visiteur && this.number_of_writings==0 && i==2)){
        this.opened_category=-1;
        return;
      }
    }
    
    this.opened_category=i;
    this.add_album=-1;
    this.opened_album=-1;
    this.open_album( 0 );

  }

      

 current_opened_album=-1;
  start_add_album(i : number) {
    
    if(this.opened_category==0 && this.list_titles_albums_bd_added.length==10){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous ne pouvez pas crééer plus de 10 sections'},
      });
      return;
    }
    else if(this.opened_category==1 && this.list_titles_albums_drawings_added.length==10){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous ne pouvez pas crééer plus de 10 sections'},
      });
      return;
    }
    else if(this.opened_category==2 && this.list_titles_albums_writings_added.length==10){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous ne pouvez pas crééer plus de 10 sections'},
      });
      return;
    }

    if( this.add_album != -1 ) {
      this.add_album = -1;
      this.cd.detectChanges();
      this.open_album( this.current_opened_album );
      return;
    }
    this.current_opened_album=this.opened_album;
    this.opened_album=-1;
    this.add_album = i;
  }

  // number of grid/number of albums
  reload_masonry(){
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
    
    $grid.on( 'layoutComplete', function() {
      console.log("layout complete")
      
      $grid.masonry('reloadItems');
      
      THIS.compteur_visibility_drawings+=1;
      let total=0;
      if(THIS.mode_visiteur){
        
        if(THIS.opened_album==0){
          if(THIS.list_drawing_albums_status[0]!='hidden'){
            total+=1;
          }
          if(THIS.list_drawing_albums_status[1]!='hidden'){
            total+=1;
          }
          for(let i=0;i<THIS.list_albums_drawings.length;i++){
            if(THIS.list_drawing_albums_status[i+2]!='private'){
              total+=1;
            }
          }
        }
        if(THIS.opened_album!=0){
          total+=1;
        }
        if(THIS.compteur_visibility_drawings==total){
          THIS.contents_loading=false;
          THIS.list_visibility_albums_drawings=true;
        }
      }
      else{
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
        }
      }
      
      THIS.cd.detectChanges();
      
      
    });

    $grid.masonry();

  }



  
 
  contents_loading=false;
  open_album(i : number) {
    
    if( this.opened_album == i ) {
      return;
    }
    if(this.opened_section==1){
      this.contents_loading=true;
    }
    $('.grid').masonry('destroy');
    this.compteur_visibility_drawings=0;
    this.compteur_drawings_thumbnails=0;    
    this.compteur_comics_thumbnails=0;
    this.compteur_writings_thumbnails=0;
    this.display_writings_thumbnails=false;
    this.display_comics_thumbnails=false;
    this.list_visibility_albums_drawings=false;
    this.opened_album=i;
    this.reset_number_of_comics_to_show();
    this.reset_number_of_drawings_to_show();
    this.reset_number_of_writings_to_show();
  }


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
    if(this.type_of_profile=='account'){
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
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir vous abonner'},
      });
    }
  
  }

  /************************************************ */
  /************************************************ */
  /**************ALBUMS FUNCTIONS****************** */
  /************************************************ */
  /************************************************ */
  
  


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
        });        
      }
      if(i==1){
        this.Albums_service.change_comic_album_status("serie","standard","hidden").subscribe(
          r=>{
            this.list_bd_albums_status[1]="hidden";
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
        });
      }
      if(i==1){
        this.Albums_service.change_comic_album_status("serie","hidden","standard").subscribe(
          r=>{ this.list_bd_albums_status[1]="stantard";
        } );
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
  compteur_writings_thumbnails=0;
  display_writings_thumbnails=false;
  compteur_comics_thumbnails=0;
  display_comics_thumbnails=false;

  number_of_comics_to_show_by_album=[];
  compteur_number_of_comics=0;
  number_of_comics_variable:number;
  got_number_of_comics_to_show=false;
  number_of_lines_comics:number;
  number_of_private_contents_comics:number[]=[0,0]
  get_number_of_comics_to_show(){

    let width =$('.container-comics').width();
  
    if(width>0 && !this.got_number_of_comics_to_show){
      console.log("get get_number_of_comics_to_show")
      this.number_of_comics_variable=Math.floor(width/320);
      this.got_number_of_comics_to_show=true;
      if(this.list_titles_albums_bd.length-1>=6){
        this.number_of_lines_comics=1;
      }
      else{
        this.number_of_lines_comics=2;
      }
      
      this.compteur_number_of_comics= this.number_of_comics_variable*this.number_of_lines_comics;
      /*for(let i=0;i<this.list_titles_albums_bd.length-1;i++){
        this.number_of_comics_to_show_by_album[i]=this.compteur_number_of_comics;
      }*/

      this.number_of_comics_to_show_by_album[0]=this.compteur_number_of_comics;
      this.number_of_comics_to_show_by_album[1]=this.compteur_number_of_comics;
      for(let i=0;i<this.list_titles_albums_bd_added.length;i++){
        this.number_of_comics_to_show_by_album[i+2]=this.compteur_number_of_comics;
      }
      console.log(this.number_of_comics_to_show_by_album)
      console.log(this.number_of_private_contents_comics)
    }
  }

  update_number_of_comics_to_show(){
    if(this.got_number_of_comics_to_show){
      let width =$('.container-comics').width();
      let variable =Math.floor(width/320);
      if(variable!=this.number_of_comics_variable && variable>0){
        for(let i=0;i<this.list_titles_albums_bd.length-1;i++){
          this.number_of_comics_to_show_by_album[i]/=this.number_of_comics_variable;
          this.number_of_comics_to_show_by_album[i]*=variable;
         
          if(i==this.list_titles_albums_bd.length-2){
            this.number_of_comics_variable=variable;
            console.log( this.number_of_comics_to_show_by_album)
            console.log( this.number_of_private_contents_comics)
            this.cd.detectChanges();
          }
        }
      }
    }
    
    
  }

  reset_number_of_comics_to_show(){
    console.log("rest number of comics")
    
    if(this.got_number_of_comics_to_show){
      if(this.opened_album>0){
        this.compteur_number_of_comics= this.number_of_comics_variable*2;
      }
      else{
        if(this.list_titles_albums_bd.length-1>=6){
          this.compteur_number_of_comics=this.number_of_comics_variable;
        }
        else{
          this.compteur_number_of_comics=this.number_of_comics_variable*2;
        }
      }

      this.number_of_comics_to_show_by_album[0]=this.compteur_number_of_comics;
      this.number_of_comics_to_show_by_album[1]=this.compteur_number_of_comics;
      for(let i=0;i<this.list_titles_albums_bd_added.length;i++){
        this.number_of_comics_to_show_by_album[i+2]=this.compteur_number_of_comics;
      }
      console.log(this.number_of_comics_to_show_by_album)
      console.log(this.number_of_private_contents_comics)
    }
    
  }

 
  display_albums_comics_thumbnails(){
    this.compteur_comics_thumbnails++;
    if(this.mode_visiteur){
      if(this.opened_album==0){
        let total=0;
        if(this.list_bd_albums_status[0]!='hidden'){
          total+=this.list_bd_oneshot.slice(0,this.number_of_comics_to_show_by_album[0]).length;
        }
        if(this.list_bd_albums_status[1]!='hidden'){
          total+=this.list_bd_series.slice(0,this.number_of_comics_to_show_by_album[1]).length;
        }
        for(let i=0;i<this.list_albums_bd.length;i++){
          if(this.list_bd_albums_status[i+2]!='private'){
            total+=this.list_albums_bd[i].slice(0,this.number_of_comics_to_show_by_album[i+2]).length;
          }
        }
        console.log(this.compteur_comics_thumbnails);
        console.log(total);
        if(this.compteur_comics_thumbnails==total){
          this.compteur_comics_thumbnails=0;
          this.contents_loading=false;
          this.display_comics_thumbnails=true;
        }
      }
      if(this.opened_album==1){
        let total=0;
        if(this.list_bd_albums_status[0]!='hidden'){
          total+=this.list_bd_oneshot.slice(0,this.number_of_comics_to_show_by_album[0]).length;
        }
        if(this.compteur_comics_thumbnails==total){
          this.contents_loading=false;
          this.compteur_comics_thumbnails=0;
          this.display_comics_thumbnails=true;
        }
      }
      if(this.opened_album==2){
        let total=0;
        if(this.list_bd_albums_status[1]!='hidden'){
          total+=this.list_bd_series.slice(0,this.number_of_comics_to_show_by_album[1]).length;
        }
        if(this.compteur_comics_thumbnails==total){
          this.contents_loading=false;
          this.compteur_comics_thumbnails=0;
          this.display_comics_thumbnails=true;
        }
      }
      if(this.opened_album>2){
        let total=0;
        if(this.list_bd_albums_status[this.opened_album]!='private'){
          total+=this.list_albums_bd[this.opened_album-3].slice(0,this.number_of_comics_to_show_by_album[this.opened_album-1]).length;
        }
        if(this.compteur_comics_thumbnails==total){
          this.compteur_comics_thumbnails=0;
          this.contents_loading=false;
          this.display_comics_thumbnails=true;
        }
      }
    }
    else{
      if(this.opened_album==0){
        let total=this.list_bd_oneshot.slice(0,this.number_of_comics_to_show_by_album[0]).length  
        +this.list_bd_series.slice(0,this.number_of_comics_to_show_by_album[1]).length;
        
        for(let i=0;i<this.list_albums_bd.length;i++){
          total+=this.list_albums_bd[i].slice(0,this.number_of_comics_to_show_by_album[i+2]).length;
        }
        if(this.compteur_comics_thumbnails==total){
          this.compteur_comics_thumbnails=0;
          this.display_comics_thumbnails=true;
          this.contents_loading=false;
        }
      }
      if(this.opened_album==1){
        let total=this.list_bd_oneshot.slice(0,this.number_of_comics_to_show_by_album[0]).length;
        if(this.compteur_comics_thumbnails==total){
          this.compteur_comics_thumbnails=0;
          this.display_comics_thumbnails=true;
          this.contents_loading=false;
        }
      }
      if(this.opened_album==2){
        let total=this.list_bd_series.slice(0,this.number_of_comics_to_show_by_album[1]).length;
        if(this.compteur_comics_thumbnails==total){
          this.compteur_comics_thumbnails=0;
          this.display_comics_thumbnails=true;
          this.contents_loading=false;
        }
      }
      if(this.opened_album>2){
        let total=this.list_albums_bd[this.opened_album-3].slice(0,this.number_of_comics_to_show_by_album[this.opened_album-1]).length;;
        if(this.compteur_comics_thumbnails==total){
          this.compteur_comics_thumbnails=0;
          this.display_comics_thumbnails=true;
          this.contents_loading=false;
        }
      }
    }
    
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
  number_of_private_contents_drawings:number[]=[0,0]
  get_number_of_drawings_to_show(){

    let width =$('.bd-container').width();
  
    if(width>0 && !this.got_number_of_drawings_to_show){
      console.log("get get_number_of_ drawings_to_show")
      this.number_of_drawings_variable=Math.floor(width/300);
      this.got_number_of_drawings_to_show=true;
      if(this.list_titles_albums_drawings.length-1>=6){
        this.number_of_lines_drawings=1;
      }
      else{
        this.number_of_lines_drawings=2;
      }
      
      this.compteur_number_of_drawings= this.number_of_drawings_variable*this.number_of_lines_drawings;
      this.number_of_drawings_to_show_by_album[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_album[1]=this.compteur_number_of_drawings;
      for(let i=0;i<this.list_titles_albums_drawings_added.length;i++){
        this.number_of_drawings_to_show_by_album[i+2]=this.compteur_number_of_drawings;
      }
      console.log(this.list_albums_drawings)
      console.log(this.number_of_drawings_to_show_by_album)
      console.log(this.number_of_private_contents_drawings)
    }
  }

  updating_drawings=false;
  update_number_of_drawings_to_show(){
    this.compteur_drawings_thumbnails=0;
    this.detect_new_compteur_drawings=false;
    this.total_for_new_compteur=0;
    this.updating_drawings=true;
    if(this.got_number_of_drawings_to_show){
      let width =$('.bd-container').width();
      let variable =Math.floor(width/300);
      console.log(variable)
      console.log(this.number_of_drawings_variable)
      if(variable!=this.number_of_drawings_variable && variable>0){
        console.log(this.number_of_drawings_variable)
        console.log(variable);
        console.log(this.number_of_private_contents_drawings);
        for(let i=0;i<this.list_titles_albums_drawings.length-1;i++){
         
          this.number_of_drawings_to_show_by_album[i]/=this.number_of_drawings_variable;
          this.number_of_drawings_to_show_by_album[i]*=variable;
          
         
          if(i==this.list_titles_albums_drawings.length-2){
            this.number_of_drawings_variable=variable;
            console.log( this.number_of_drawings_to_show_by_album)
            console.log( this.number_of_private_contents_drawings)
            this.cd.detectChanges();
            $('.grid').masonry('reloadItems');
            this.reload_masonry();
            this.cd.detectChanges();
          }
        }
      }
    }
    
    
  }

  reset_number_of_drawings_to_show(){
    console.log("rest number of drawings")
    this.detect_new_compteur_drawings=false;
    this.total_for_new_compteur=0;
    this.updating_drawings=false;
    if(this.got_number_of_drawings_to_show){
      if(this.opened_album>0){
        this.compteur_number_of_drawings= this.number_of_drawings_variable*2;
      }
      else{
        if(this.list_titles_albums_drawings.length-1>=6){
          this.compteur_number_of_drawings=this.number_of_drawings_variable;
        }
        else{
          this.compteur_number_of_drawings=this.number_of_drawings_variable*2;
        }
      }

      this.number_of_drawings_to_show_by_album[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_album[1]=this.compteur_number_of_drawings;
      for(let i=0;i<this.list_titles_albums_drawings_added.length;i++){
        this.number_of_drawings_to_show_by_album[i+2]=this.compteur_number_of_drawings;
        
       
        
      }
      console.log(this.number_of_drawings_to_show_by_album)
      console.log(this.number_of_private_contents_drawings)
    }
    
  }

  detect_new_compteur_drawings=false;
  total_for_new_compteur=0;
  sendLoaded(event){
    if(!this.updating_drawings){
      this.compteur_drawings_thumbnails++;
      if(this.detect_new_compteur_drawings){
        $('.grid').masonry('reloadItems');
        this.cd.detectChanges;
        if(this.compteur_drawings_thumbnails==this.total_for_new_compteur){
          this.detect_new_compteur_drawings=false;
          this.total_for_new_compteur=0;
          this.compteur_drawings_thumbnails=0;
          this.reload_masonry();
          this.cd.detectChanges();
        }
      }
      else{
        if(this.mode_visiteur){
          if(this.opened_album==0){
            let total=0;
            if(this.list_drawing_albums_status[0]!='hidden'){
              total+=this.list_drawings_onepage.slice(0,this.number_of_drawings_to_show_by_album[0]).length 
            }
            if(this.list_drawing_albums_status[1]!='hidden'){
              total+=this.list_drawings_artbook.slice(0,this.number_of_drawings_to_show_by_album[1]).length 
            }
            for(let i=0;i<this.list_albums_drawings.length;i++){
              if(this.list_drawing_albums_status[i+2]!='private'){
                total+=this.list_albums_drawings[i].slice(0,this.number_of_drawings_to_show_by_album[i+2]).length;
                
              }
            }
            if(this.compteur_drawings_thumbnails==total){
              this.compteur_drawings_thumbnails=0;
              this.ini_masonry();
            }
          }
          if(this.opened_album==1){
            let total=0;
            if(this.list_drawing_albums_status[0]!='hidden'){
              total+=this.list_drawings_onepage.slice(0,this.number_of_drawings_to_show_by_album[0]).length 
            }
            if(this.compteur_drawings_thumbnails==total){
              this.compteur_drawings_thumbnails=0;
              this.ini_masonry();
            }
          }
          if(this.opened_album==2){
            let total=0;
            if(this.list_drawing_albums_status[1]!='hidden'){
              total+=this.list_drawings_artbook.slice(0,this.number_of_drawings_to_show_by_album[1]).length 
            }
            if(this.compteur_drawings_thumbnails==total){
              console.log("on y est");
              this.compteur_drawings_thumbnails=0;
              this.ini_masonry();
            }
          }
          if(this.opened_album>2){
            let total=0;
            if(this.list_drawing_albums_status[this.opened_album]!='private'){
              total+=this.list_albums_drawings[this.opened_album-3].slice(0,this.number_of_drawings_to_show_by_album[this.opened_album-1]).length;
            }
            if(this.compteur_drawings_thumbnails==total){
              this.compteur_drawings_thumbnails=0;
              this.ini_masonry();
            }
          }
        }
        else{
          if(this.opened_album==0){
            let total = this.list_drawings_onepage.slice(0,this.number_of_drawings_to_show_by_album[0]).length 
            + this.list_drawings_artbook.slice(0,this.number_of_drawings_to_show_by_album[1]).length
            for(let i=0;i<this.list_albums_drawings.length;i++){
              total+=this.list_albums_drawings[i].slice(0,this.number_of_drawings_to_show_by_album[i+2]).length;
            }
            console.log(this.compteur_drawings_thumbnails)
            console.log(total);
            if(this.compteur_drawings_thumbnails==total){
              this.compteur_drawings_thumbnails=0;
              this.ini_masonry();
            }
          }
          if(this.opened_album==1){
            let total=this.list_drawings_onepage.slice(0,this.number_of_drawings_to_show_by_album[0]).length
            if(this.compteur_drawings_thumbnails==total){
              this.compteur_drawings_thumbnails=0;
              this.ini_masonry();
            }
          }
          if(this.opened_album==2){
            let total=this.list_drawings_artbook.slice(0,this.number_of_drawings_to_show_by_album[1]).length
            if(this.compteur_drawings_thumbnails==total){
              this.compteur_drawings_thumbnails=0;
              this.ini_masonry();
            }
          }
          if(this.opened_album>2){
            let total=this.list_albums_drawings[this.opened_album-3].slice(0,this.number_of_drawings_to_show_by_album[this.opened_album-1]).length;
            if(this.compteur_drawings_thumbnails==total){
              this.compteur_drawings_thumbnails=0;
              this.ini_masonry();
            }
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
  number_of_private_contents_writings:number[]=[0,0]
  get_number_of_writings_to_show(){

    let width =$('.bd-container').width();
  
    if(width>0 && !this.got_number_of_writings_to_show){
      console.log("get get_number_of_ writings_to_show")
      this.number_of_writings_variable=Math.floor(width/300);
      this.got_number_of_writings_to_show=true;
      if(this.list_titles_albums_writings.length-1>=6){
        this.number_of_lines_writings=1;
      }
      else{
        this.number_of_lines_writings=2;
      }
      
      this.compteur_number_of_writings= this.number_of_writings_variable*this.number_of_lines_writings;
      this.number_of_writings_to_show_by_album[0]=this.compteur_number_of_writings;
      console.log(this.list_titles_albums_writings_added.length)
      for(let i=0;i<this.list_titles_albums_writings_added.length;i++){
        this.number_of_writings_to_show_by_album[i+1]=this.compteur_number_of_writings;
      }
      console.log(this.list_albums_writings)
      console.log(this.list_writings)
      console.log(this.number_of_writings_to_show_by_album)
    }
  }

  update_number_of_writings_to_show(){
    if(this.got_number_of_writings_to_show){
      let width =$('.bd-container').width();
      let variable =Math.floor(width/300);
      console.log(variable)
      console.log(this.number_of_writings_variable)
      if(variable!=this.number_of_writings_variable && variable>0){
        console.log(this.number_of_writings_variable)
        console.log(variable);
        console.log(this.number_of_private_contents_writings);
        for(let i=0;i<this.list_titles_albums_writings.length;i++){
         
          this.number_of_writings_to_show_by_album[i]/=this.number_of_writings_variable;
          this.number_of_writings_to_show_by_album[i]*=variable;
          
         
          if(i==this.list_titles_albums_drawings.length-1){
            this.number_of_writings_variable=variable;
            console.log( this.number_of_writings_to_show_by_album)
            console.log( this.number_of_private_contents_writings)
            this.cd.detectChanges();
            $('.grid').masonry('reloadItems');
            this.reload_masonry();
            this.cd.detectChanges();
          }
        }
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
        if(this.list_titles_albums_writings.length>=6){
          this.compteur_number_of_writings=this.number_of_writings_variable;
        }
        else{
          this.compteur_number_of_writings=this.number_of_writings_variable*2;
        }
      }

      this.number_of_writings_to_show_by_album[0]=this.compteur_number_of_writings;
      for(let i=0;i<this.list_titles_albums_writings_added.length;i++){
        this.number_of_writings_to_show_by_album[i+1]=this.compteur_number_of_writings;
        
       
        
      }
      console.log(this.number_of_writings_to_show_by_album)
      console.log(this.number_of_private_contents_writings)
    }
    
  }


  display_albums_writing_thumbnails(event){
    this.compteur_writings_thumbnails++;
    if(this.mode_visiteur){
      if(this.opened_album==0){
        let total=this.list_writings.slice(0,this.number_of_writings_to_show_by_album[0]).length;
        for(let i=0;i<this.list_albums_writings.length;i++){
          if(this.list_writings_albums_status[i]!='private'){
            total+=this.list_albums_writings[i].slice(0,this.number_of_writings_to_show_by_album[i+1]).length;
          }
        }
        if(this.compteur_writings_thumbnails==total){
          this.compteur_writings_thumbnails=0;
          this.contents_loading=false;
          this.display_writings_thumbnails=true;
        }
      }
      if(this.opened_album>=1){
        let total=0;
        if(this.list_writings_albums_status[this.opened_album]!='private'){
          total+=this.list_albums_writings[this.opened_album-1].slice(0,this.number_of_writings_to_show_by_album[this.opened_album]).length;
        }
        if(this.compteur_writings_thumbnails==total){
          this.compteur_writings_thumbnails=0;
          this.contents_loading=false;
          this.display_writings_thumbnails=true;
        }
      }
    }
    else{
      if(this.opened_album==0){
        let total=this.list_writings.slice(0,this.number_of_writings_to_show_by_album[0]).length;
        for(let i=0;i<this.list_albums_writings.length;i++){
          total+=this.list_albums_writings[i].slice(0,this.number_of_writings_to_show_by_album[i+1]).length;
          
        }
        if(this.compteur_writings_thumbnails==total){
          this.compteur_writings_thumbnails=0;
          this.contents_loading=false;
          this.display_writings_thumbnails=true;
        }
      }
      if(this.opened_album>0){
        
        let total=this.list_albums_writings[this.opened_album-1].slice(0,this.number_of_writings_to_show_by_album[this.opened_album]).length;
        if(this.compteur_writings_thumbnails==total){
          this.compteur_writings_thumbnails=0;
          this.contents_loading=false;
          this.display_writings_thumbnails=true;
        }
      }
    }
    
  }


  /*****************************************Displey new contents ************************* */
  /*****************************************Displey new contents ************************* */
  /*****************************************Displey new contents ************************* */
  /*****************************************Displey new contents ************************* */
  compteur_new_comic_contents=0;
  display_new_comic_contents=false;
  compteur_new_writing_contents=0;
  display_new_writing_contents=false;
  compteur_new_drawing_contents=0;
  display_new_drawing_contents=false;
  new_contents_comics_thumbnails(event){
    this.compteur_new_comic_contents+=1;
    if(this.compteur_new_comic_contents==this.new_comic_contents.length){
      this.display_new_comic_contents=true;
    }
  }

  new_contents_drawings_thumbnails(event){
    this.compteur_new_drawing_contents+=1;
    if(this.compteur_new_drawing_contents==this.new_drawing_contents.length){
      this.display_new_drawing_contents=true;
    }
  }

  new_contents_writings_thumbnails(event){
    this.compteur_new_writing_contents+=1;
    if(this.compteur_new_writing_contents==this.new_writing_contents.length){
      this.display_new_writing_contents=true;
    }
  }
  

  /*************************************check if content public *****************************/
 /*************************************check if content public *****************************/
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
  
      /*if(album_number>1){
        console.log(this.list_albums_bd[album_number-2])
        let numb=this.number_of_comics_to_show_by_album[album_number]
        for(let j=0;j<this.list_albums_bd[album_number-2].slice(0,numb).length;j++){
          if(this.list_albums_bd[album_number-2][j].chaptersnumber>=0){
            if(!this.check_if_serie_public(this.list_albums_bd[album_number-2][j].bd_id )){
              console.log(this.list_albums_bd[album_number-2][j].title)
              this.number_of_comics_to_show_by_album[album_number]+=1;
              if( this.number_of_private_contents_comics[album_number]){
                this.number_of_private_contents_comics[album_number]+=1;
              }
              else{
                this.number_of_private_contents_comics[album_number]=1;
              }
            }
          }
          else if(this.list_albums_bd[album_number-2][j]){
            if(!this.check_if_oneshot_public(this.list_albums_bd[album_number-2][j].bd_id )){
              console.log(this.list_albums_bd[album_number-2][j].title)
              this.number_of_comics_to_show_by_album[album_number]+=1;
              this.number_of_private_contents_comics[album_number]+=1;
              if( this.number_of_private_contents_comics[album_number]){
                this.number_of_private_contents_comics[album_number]+=1;
              }
              else{
                this.number_of_private_contents_comics[album_number]=1;
              }
            }
          }
          if(j==numb-1 ){
            let search_more=true;
            let compteur=numb;
            while (search_more && this.list_albums_bd[album_number-2].length>compteur) {
              if(this.list_albums_bd[album_number-2][compteur].chaptersnumber>=0){
                if(!this.check_if_serie_public(this.list_albums_bd[album_number-2][compteur].bd_id )){
                  this.number_of_comics_to_show_by_album[album_number]+=1;
                  if( this.number_of_private_contents_comics[album_number]){
                    this.number_of_private_contents_comics[album_number]+=1;
                  }
                  else{
                    this.number_of_private_contents_comics[album_number]=1;
                  }
                }
                else{search_more=false}
              }
              else{
                if(!this.check_if_oneshot_public(this.list_albums_bd[album_number-2][compteur].bd_id )){
                  this.number_of_comics_to_show_by_album[album_number]+=1;
                  this.number_of_private_contents_comics[album_number]+=1;
                  if( this.number_of_private_contents_comics[album_number]){
                    this.number_of_private_contents_comics[album_number]+=1;
                  }
                  else{
                    this.number_of_private_contents_comics[album_number]=1;
                  }
                }
                else{search_more=false}
              }
              compteur++;
            }
          }
        }
        
      }*/
      console.log( this.number_of_comics_to_show_by_album);
      console.log(this.number_of_private_contents_comics)
      
      this.new_contents_loading=false;
      this.cd.detectChanges();
    }
    
  }

  /***********************************************see more ddrawings*************************** */
/***********************************************see more ddrawings*************************** */
/***********************************************see more ddrawings*************************** */

  see_more_drawings(album_number,album_section_number){
    console.log(album_section_number)
    console.log(album_number)
    this.updating_drawings=false;
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
      this.new_contents_loading=true;
      console.log("see_more_drawings");
      let num=this.number_of_drawings_to_show_by_album[album_number]
      if(album_section_number==0){
        this.number_of_drawings_to_show_by_album[album_number]+=this.number_of_drawings_variable*2;
      }
      else{
        this.number_of_drawings_to_show_by_album[album_number]+=this.number_of_drawings_variable*4;
      }
  
      console.log( this.number_of_drawings_to_show_by_album);
      console.log(this.number_of_private_contents_drawings)
      
      this.detect_new_compteur_drawings=true;
      if(album_number==0){
        console.log(this.list_drawings_onepage)
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_drawings_onepage.length){
          this.total_for_new_compteur=this.list_drawings_onepage.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
      }
      if(album_number==1){
        console.log(this.list_drawings_artbook)
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_drawings_artbook.length){
          this.total_for_new_compteur=this.list_drawings_artbook.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
      }
      else{
        console.log(this.list_albums_drawings[album_number-2])
        if(this.number_of_drawings_to_show_by_album[album_number]>this.list_albums_drawings[album_number-2].length){
          this.total_for_new_compteur=this.list_albums_drawings[album_number-2].length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_album[album_number]-num;
        }
      }
      console.log( this.total_for_new_compteur)
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
    console.log(this.number_of_private_contents_writings)
    this.cd.detectChanges();
  }
  
}


block_user(){
  console.log(this.user_id);
  if(this.user_id>1){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir bloquer cet utilisateur ?'},
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
              })
            })
          });

        
      }
    })
  }
 
}

unblock_user(){
  this.Profile_Edition_Service.unblock_user(this.user_id).subscribe(r=>{
    console.log(r[0]);
    if(r[0].date){
      console.log(r[0].date)
      this.chatService.add_chat_friend(this.user_id,r[0].date).subscribe(r=>{
        console.log(r[0])
        this.user_blocked=false;
      })
    }
    else{
      this.user_blocked=false;
    }
    
    
  })
}

report(){
  this.Reports_service.check_if_content_reported('account',this.user_id,"unknown",0).subscribe(r=>{
    console.log(r[0])
    if(r[0].nothing){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:true, text:'Vous ne pouvez pas signaler deux fois le même compte'},
      });
    }
    else{
      const dialogRef = this.dialog.open(PopupReportComponent, {
        data: {from_account:true,id_receiver:this.user_id,publication_category:'account',publication_id:this.user_id,format:"unknown",chapter_number:0},
      });
    }
  })
  
}

}



