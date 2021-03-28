import { Component, OnInit, ChangeDetectorRef, HostListener, Inject, Input, EventEmitter, Output } from '@angular/core';
import {ElementRef, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Ads_service } from '../services/ads.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Reports_service } from '../services/reports.service';
import { Subscribing_service } from '../services/subscribing.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import { PopupAdPicturesComponent } from '../popup-ad-pictures/popup-ad-pictures.component';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import { PopupAdWriteResponsesComponent } from '../popup-ad-write-responses/popup-ad-write-responses.component';
import { ActivatedRoute,Router } from '@angular/router';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { NotificationsService } from '../services/notifications.service';
import { ChatService } from '../services/chat.service';
import {get_date_to_show} from '../helpers/dates';
import {get_date_to_show_for_ad} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { Location } from '@angular/common';
import { PopupEditCoverComponent } from '../popup-edit-cover/popup-edit-cover.component';
import { PopupCommentsComponent } from '../popup-comments/popup-comments.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoginComponent } from '../login/login.component';
import { DOCUMENT } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PopupFormAdComponent } from '../popup-form-ad/popup-form-ad.component';

declare var $: any
declare var Swiper: any

@Component({
  selector: 'app-ad-page',
  templateUrl: './ad-page.component.html',
  styleUrls: ['./ad-page.component.scss'],
  animations: [
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
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
    trigger(
      'enterFromBottomAnimation', [
        transition(':enter', [
          style({transform: 'translateY(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ])
      ],
    ),
    //LEAVING ANIMATIONS
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({transform: 'translateX(0%)', opacity: 1}),
          animate('200ms ease-in-out', style({transform: 'translateX(-30px)', opacity: 0}))
        ])
      ],
    )
  ],
})

export class AdPageComponent implements OnInit {
  constructor(
    private Reports_service:Reports_service,
    private chatService:ChatService,
    private router:Router,
    private location:Location,
    private NotificationsService:NotificationsService,
    public route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
    public navbar: NavbarService,
    private deviceService: DeviceDetectorService,
    public dialog: MatDialog,
    private sanitizer:DomSanitizer,
    private Subscribing_service:Subscribing_service,
    private Ads_service:Ads_service,
    private Profile_Edition_Service:Profile_Edition_Service,
    @Inject(DOCUMENT) private document: Document,
    private cd:ChangeDetectorRef,
    ) { 
      
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      };
  

    this.navbar.setActiveSection(-1);
    this.navbar.show();
  }

  @ViewChildren('category') categories:QueryList<ElementRef>;
  
  for_ad_page=true;
  already_subscribed:boolean;
  type_of_account:string;
  type_of_account_retrieved=false;
  status1:String;
  status2:String;
  status3:String;

  author_name: string;
  pseudo: string;
  primary_description: string;
  profile_picture: SafeUrl;
  profile_picture_is_loaded=false;
  ad_id:number;
  item: any;
  now_in_seconds:number=Math.trunc( new Date().getTime()/1000);

  date_to_show: string;
  thumbnail_picture:SafeUrl;
  list_of_attachments_name:any[]=[];
  list_of_pictures_name=[];
  list_of_pictures:any[]=[];
  pictures_retrieved=false;
  list_of_attachments:any[]=[];
  attachments_retrieved=false;
  display=false;

  visitor_id:number;
  visitor_name:string;
  visitor_mode=true;
  visitor_mode_added=false;

  //responses
  
  list_of_responses:any[]=[];
  list_of_dates:any[]=[];
  list_of_profile_pictures:any[]=[];
  list_of_authors_name:any[]=[];
  list_of_certified_account:any[]=[];
  list_of_ids:any[]=[];
  list_of_pseudos:any[]=[];
  list_of_primary_descriptions:any[]=[];
  list_of_subscribers_number:any[]=[];
  answers_retrieved=false;
  see_responses=0;
  response_to_read:any;
  response_list_of_pictures=[];
  response_list_of_attachments=[];
  response_list_of_attachments_name=[];
  response_list_of_pictures_names=[];
  response_list_of_attachments_type=[];
  response_pictures_retrieved=false;
  response_attachments_retrieved=false;
  b:number;
  first_comment='';
  first_comment_retrieved=false;
  pp_first_comment:any;
  display_author_ads=false;
  display_other_ads=false;
  list_of_author_ads_retrieved=false;
  list_of_other_ads_retrieved=false;
  left_container_category_index=0;
  list_of_author_ads:any[]=[];
  list_of_other_ads:any[]=[];
  number_of_views:number;
  commentariesnumber:number;
  ad_archived=false;
  archive_retrieved=false;
  list_of_reporters=[];
  type_of_profile='';
  type_of_profile_retrieved=false;
  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  number_of_comments_to_show=10;
  page_not_found=false;
  profile_data_retrieved=false;
  emphasized_contend_retrieved=false;
  subscribtion_retrieved=false;
  likes_retrieved_but_not_checked=false;
  ready_to_check_view=false;
  loves_retrieved_but_not_checked=false;
  current_user_retrieved=false;
  url='https://www.linkarts.fr';
  can_check_clickout=false;
  @Input() ad_id_input: number;
  @Input() ad_title_input: string;
  @Output() emit_close = new EventEmitter<boolean>();
  @Output() emit_close_click = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
      if( window.innerWidth<=1000 ) {
        this.for_ad_page=false;
      }
      else{
        this.for_ad_page=true;
      }
  }

  @ViewChild('artwork') artwork:ElementRef;
  @ViewChild('close') close:ElementRef;

  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.ad_id_input && !this.in_other_popup){
      if (!(this.artwork.nativeElement.contains(btn)) && this.can_check_clickout && !(this.close.nativeElement.contains(btn))){
        if(this.ad_id_input && !btn.className.baseVal && btn.className.includes("cdk-overlay-dark-backdrop")){
          this.emit_close_click.emit(true);
        }
         
      }
      this.can_check_clickout=true;
    }
      
  }


  close_popup(){
    if(this.ad_id_input){
      this.emit_close.emit(true);
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.emit_close.emit(true);
  }

  ngAfterViewChecked() {
    this.initialize_heights();
  }
  initialize_heights() {
    //if( !this.fullscreen_mode ) {
      $('#left-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
      $('#right-container').css("height", ( window.innerHeight - this.navbar.getHeight() ) + "px");
    //}
  }



  /**********************************************   ON INIT  **************************************/
  /**********************************************   ON INIT  **************************************/
  /**********************************************   ON INIT  **************************************/
  number_of_pictures=0;
  location_done=false;
  device_info='';
  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
  
    window.scroll(0,0);
    setInterval(() => {

      if( this.commentariesnumber && this.myScrollContainer && this.myScrollContainer.nativeElement.scrollTop + this.myScrollContainer.nativeElement.offsetHeight >= this.myScrollContainer.nativeElement.scrollHeight*0.7){
        if(this.number_of_comments_to_show<this.commentariesnumber){
          this.number_of_comments_to_show+=10;
        }
      }
    },3000)

    this.ad_id = this.ad_id_input?this.ad_id_input:parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    let title = this.ad_title_input?this.ad_title_input:this.activatedRoute.snapshot.paramMap.get('title');

    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
      this.visitor_id = l[0].id;
      this.visitor_name=l[0].nickname;
      this.type_of_account=l[0].status;
      this.type_of_account_retrieved=true;
      this.current_user_retrieved=true;
      this.check_view_after_current();
    })


    this.Ads_service.retrieve_ad_by_id(this.ad_id).subscribe(m=>{
      var re = /(?:\.([^.]+))?$/;
      if(m[0].number_of_attachments>0){
        for(let i=0;i<m[0].number_of_attachments;i++){
          if(i==0 && m[0].attachment_name_one && re.exec(m[0].attachment_name_one)[1]!="pdf"){
            this.number_of_pictures++;
          }
          if(i==1 && m[0].attachment_name_one && re.exec(m[0].attachment_name_one)[1]!="pdf"){
            this.number_of_pictures++;
          }
          if(i==2 && m[0].attachment_name_two && re.exec(m[0].attachment_name_two)[1]!="pdf"){
            this.number_of_pictures++;
          }
          if(i==3 && m[0].attachment_name_three && re.exec(m[0].attachment_name_three)[1]!="pdf"){
            this.number_of_pictures++;
          }
          if(i==4 && m[0].attachment_name_four && re.exec(m[0].attachment_name_four)[1]!="pdf"){
            this.number_of_pictures++;
          }
          if(i==5 && m[0].attachment_name_five && re.exec(m[0].attachment_name_five)[1]!="pdf"){
            this.number_of_pictures++;
          }
        }
      }
      this.item=m[0];
      let title_url=this.item.title.replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29');
      this.navbar.add_page_visited_to_history(`/ad-page/${this.item.title}/${this.ad_id}`,this.device_info).subscribe();
      this.location.go(`/ad-page/${title_url}/${this.ad_id}`);
      this.url=`https://www.linkarts.fr/ad-page/${title_url}/${this.ad_id}`;
      this.location_done=true;
      this.list_of_reporters=this.item.list_of_reporters
      if(!m[0] || title!=m[0].title || m[0].status=="deleted" || m[0].status=="suspended"){
        if(m[0] && m[0].status=="deleted"){
          this.navbar.delete_research_from_navbar("Ad",m[0].type_of_project,this.ad_id).subscribe(r=>{
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
        this.commentariesnumber=m[0].commentariesnumber;
      
        this.navbar.get_number_of_clicked("Ad",this.item.type_of_project,this.item.id).subscribe(r=>{
          this.number_of_views=r[0].number
        })
        this.ready_to_check_view=true;
        this.check_view_after_current();
        this.check_archive();
  
    
        this.Profile_Edition_Service.retrieve_profile_picture( this.item.id_user).subscribe(r=> {
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.profile_picture = SafeURL;
        });
    
        this.Profile_Edition_Service.retrieve_profile_data(this.item.id_user).subscribe(r=> {
          this.author_name = r[0].firstname + ' ' + r[0].lastname;
          this.primary_description=r[0].primary_description;
          this.pseudo = r[0].nickname;
          
          this.certified_account=r[0].certified_account;
          this.profile_data_retrieved=true;
        });
  
        this.Subscribing_service.check_if_visitor_susbcribed(this.item.id_user).subscribe(information=>{
          if(information[0].value){
            this.already_subscribed=true;
          }
          this.subscribtion_retrieved=true;
          
        }); 
  
        this.Ads_service.retrieve_ad_thumbnail_picture( this.item.thumbnail_name ).subscribe(r=> {
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.thumbnail_picture = SafeURL;
        });
  
        this.date_to_show = get_date_to_show(date_in_seconds(this.now_in_seconds,this.item.createdAt) );
        this.get_ad_contents(this.item);
  
       
    
        this.get_recommendations()
      }
      
     



      
    })

    
    
  }


  check_view_after_current(){
  
    if(this.current_user_retrieved && this.ready_to_check_view){
      if(this.visitor_id==this.item.id_user){
        this.visitor_mode=false;
        this.navbar.check_if_research_exists("Ad",null,this.item.id,this.item.title,"clicked").subscribe(p=>{
          if(!p[0].value){
            this.navbar.add_main_research_to_history("Ad",null ,this.item.id,this.item.title,null,"clicked",0,0,0,0,this.item.type_of_project,this.item.my_description,this.item.target_one,this.item.target_two,"account").subscribe(l=>{
            });
          }
        })
      }
      else{
        this.navbar.add_main_research_to_history("Ad",null ,this.item.id,this.item.title,null,"clicked",0,0,0,0,this.item.type_of_project,this.item.my_description,this.item.target_one,this.item.target_two,this.type_of_account).subscribe();
      }
      this.visitor_mode_added=true;
    }

   
    
  }


  get_recommendations(){
    this.Ads_service.get_ads_by_user_id(this.item.id_user).subscribe(l=>{
       for(let i=0;i<((l[0].length>5)?5:l[0].length);i++){
         if(l[0][i].id!=this.item.id){
           this.list_of_author_ads.push(l[0][i])
         }
       }

       if(this.list_of_author_ads.length==0){
         this.display_author_ads=false;
       }
       else{
         this.display_author_ads=true;
       }
       this.list_of_author_ads_retrieved=true;

     })

     let offer_or_demand=(this.item.offer_or_demand!='')?this.item.offer_or_demand:"none";
     let type_of_remuneration=(this.item.price_type!='')?this.item.price_type:"none";
     let type_of_service=(this.item.price_type_service!='')?this.item.price_type_service:"none";
     if(this.item.target_two){
       let firt_retrieved=false;
       let second_retrieved=false;

       this.Ads_service.get_sorted_ads_linkcollab(this.item.type_of_project,this.item.my_description,this.item.target_one,this.item.remuneration,this.item.service,type_of_remuneration,type_of_service,offer_or_demand,"pertinence",0,0).subscribe(r=>{
         let number_of_results=r[0][0].number_of_ads;
         let results=r[0][0].results;
         if (number_of_results>0){
           for (let i=0;i<results.length;i++){
             if(results[i].id!=this.item.id){
               this.list_of_other_ads.push(results[i]);
             }
           }
         }
         firt_retrieved=true;
         check_all(this);
         
       })
       this.Ads_service.get_sorted_ads_linkcollab(this.item.type_of_project,this.item.my_description,this.item.target_two,this.item.remuneration,this.item.service,type_of_remuneration,type_of_service,offer_or_demand,"pertinence",5,0).subscribe(r=>{
         let number_of_results=r[0][0].number_of_ads;
         let results=r[0][0].results;
         if (number_of_results>0){
           for (let i=0;i<results.length;i++){
             if(results[i].id!=this.item.id){
               this.list_of_other_ads.push(results[i]);
             }
           }
         }
         second_retrieved=true;
         check_all(this);
       
       })

       function check_all(THIS){
         if(firt_retrieved && second_retrieved){
           if(THIS.list_of_other_ads.length>0){
             THIS.display_other_ads=true;
           }
           else{
             THIS.display_other_ads=false;
           }
           THIS.list_of_other_ads_retrieved=true;
         }
       }
     }
     else{
       this.Ads_service.get_sorted_ads_linkcollab(this.item.type_of_project,this.item.my_description,this.item.target_one,this.item.remuneration,this.item.service,type_of_remuneration,type_of_service,offer_or_demand,"pertinence",0,0).subscribe(r=>{
         let number_of_results=r[0][0].number_of_ads;
         let results=r[0][0].results;
         if (number_of_results>0){
           for (let i=0;i<results.length;i++){
             if(results[i].id!=this.item.id){
               this.list_of_other_ads.push(results[i]);
             }
           }
         }

         if(this.list_of_other_ads.length>0){
           this.display_other_ads=true;
         }
         else{
           this.display_other_ads=false;
         }
         this.list_of_other_ads_retrieved=true;
       })
     }
  }
 
  /****************************************** LOADING  *******************************************/
  /****************************************** LOADING  *******************************************/
  /****************************************** LOADING  *******************************************/


  profile_picture_loaded(){
    this.profile_picture_is_loaded=true;
  }



  show_icon=false;
  ngAfterViewInit() {
    if( window.innerWidth<=1000 ) {
      this.for_ad_page=false;
    }
    else{
      this.for_ad_page=true;
    }

    var swiper = new Swiper('.swiper-container', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + (index + 1) + '</span>';
        },
      },
    });
    

  }

  


  /******************************************** OPTIONS **************************************/
 
  in_other_popup=false;
  read_pictures(i:number){
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
      data: {list_of_pictures:this.list_of_pictures,index_of_picture:i},
      panelClass: "popupDocumentClass",
    });
    dialogRef.afterClosed().subscribe(result => {
      this.in_other_popup=false;
    })
  }

  read_attachment(i:number){
    this.in_other_popup=true;
    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.list_of_attachments[i]},
      panelClass: "popupDocumentClass",
    }).afterClosed().subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
        this.in_other_popup=false;
    });
  }

  read_pictures_response(i:number){
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
      data: {list_of_pictures:this.response_list_of_pictures,index_of_picture:i},
      panelClass: "popupDocumentClass",
    });
    dialogRef.afterClosed().subscribe(result => {
      this.in_other_popup=false;
    })
  }

  read_attachment_response(i:number){
    this.in_other_popup=true;
    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.response_list_of_attachments[i]},
      panelClass: "popupDocumentClass",
    }).afterClosed().subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
      this.in_other_popup=false;
    });
  }

  update(){
    //fonction pour mettre à jour une annonce, possible que chaque semaine, gratuit au début
  }

  delete(){
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer cette annonce ?'},
      panelClass: "popupConfirmationClass",
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.Ads_service.delete_ad(this.item.id).subscribe(l=>{
          this.navbar.delete_publication_from_research("Ad",this.item.type_of_project,this.item.id).subscribe(r=>{
            this.close_popup();
            this.router.navigateByUrl( `/account/${this.pseudo}`);
            return;
          })
        })
      }
      this.in_other_popup=false;
    })
   
  };


  /*****************************************ARCHIVE *********************************** */
  /*****************************************ARCHIVE *********************************** */
  /*****************************************ARCHIVE *********************************** */
  /*****************************************ARCHIVE *********************************** */

  
  check_archive(){
    this.Subscribing_service.check_if_publication_archived("ad",this.item.type_of_project,this.item.id).subscribe(r=>{
      if(r[0].value){
        this.ad_archived=true;
      }
      this.archive_retrieved=true;
    })
  }

  archive(){
    this.Subscribing_service.archive("ad",this.item.type_of_project,this.item.id).subscribe(r=>{
      this.ad_archived=true;
    });
  }

  unarchive(){
    this.Subscribing_service.unarchive("ad",this.item.type_of_project,this.item.id).subscribe(r=>{
      this.ad_archived=false;
    });
  }

  

  /*****************************************GET CONTENTS *********************************** */
  /*****************************************GET CONTENTS  *********************************** */
  /*****************************************GET CONTENTS  *********************************** */
  /*****************************************GET CONTENTS  *********************************** */


  get_ad_contents(item){
    let u=0;
    var re = /(?:\.([^.]+))?$/;
    if(item.number_of_attachments>0){
      for(let i=0;i<item.number_of_attachments;i++){
        if(i==0){
          if(re.exec(item.attachment_name_one)[1]!="pdf"){
            this.list_of_pictures_name[i] = item.attachment_real_name_one;
            this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            });
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_one;
            this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            });
          }
          
        }
        if(i==1){
          if(re.exec(item.attachment_name_two)[1]!="pdf"){
            this.list_of_pictures_name[i] = item.attachment_real_name_two;
            this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[l[1]] = SafeURL;
              u++;
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            });
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_two;
            this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            });
          }
          
        }
        if(i==2){
          if(re.exec(item.attachment_name_three)[1]!="pdf"){
            this.list_of_pictures_name[i] = item.attachment_real_name_three;
            this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            });
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_three;
            this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            });
          }
          
        };
        if(i==3){
          if(re.exec(item.attachment_name_four)[1]!="pdf"){
            this.list_of_pictures_name[i] = item.attachment_real_name_four;
            this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            })
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_four;
            this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            })
          }
          
        };
        if(i==4){
          if(re.exec(item.attachment_name_five)[1]!="pdf"){
            this.list_of_pictures_name[i] = item.attachment_real_name_five;
            this.Ads_service.retrieve_attachment(item.attachment_name_five,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            })
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_five;
            this.Ads_service.retrieve_attachment(item.attachment_name_five,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_attachments();
              }
            })
          }
          
        }
      }
    }
    else{
      this.attachments_retrieved=true;
    }
  }

  sort_attachments(){
    let length1=this.list_of_pictures.length;
    for(let j=0;j<length1;j++){
      if(!this.list_of_pictures[length1-1-j]){
        this.list_of_pictures.splice(length1-1-j,1);
        this.list_of_pictures_name.splice(length1-1-j,1);
      }
    }
    let length2=this.list_of_attachments.length;
    for(let j=0;j<length2;j++){
      if(!this.list_of_attachments[length2-j-1]){
        this.list_of_attachments.splice(length2-j-1,1);
        this.list_of_attachments_name.splice(length2-j-1,1);
      }
    }
    this.attachments_retrieved=true;
    this.cd.detectChanges()
  }

  return_to_ad(i){
    this.see_responses=i;
  }



  open_left_container_category(i : number) {
    if(this.left_container_category_index==i){
      return
    }
    this.left_container_category_index=i;
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
        this.Subscribing_service.subscribe_to_a_user(this.item.id_user).subscribe(information=>{
          if(information[0].subscribtion){
        
            this.loading_subscribtion=false;
            this.cd.detectChanges();
          }
          else{
            this.NotificationsService.add_notification('subscribtion',this.visitor_id,this.visitor_name,this.item.id_user,this.item.id_user.toString(),'none','none',this.visitor_id,0,"add",false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"subscribtion",
                id_user_name:this.visitor_name,
                id_user:this.visitor_id, 
                id_receiver:this.item.id_user,
                publication_category:this.item.id_user.toString(),
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
        this.Subscribing_service.remove_subscribtion(this.item.id_user).subscribe(information=>{
          this.NotificationsService.remove_notification('subscribtion',this.item.id_user.toString(),'none',this.visitor_id,0,false,0).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"subscribtion",
              id_user_name:this.visitor_name,
              id_user:this.visitor_id, 
              id_receiver:this.item.id_user,
              publication_category:this.item.id_user.toString(),
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
      dialogRef.afterClosed().subscribe(result => {
        this.in_other_popup=false;
      })
    }
  
  }

  new_comment() {
    this.commentariesnumber++;
    this.cd.detectChanges();
  }

  first_comment_received(e){
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

  removed_comment() {
    this.commentariesnumber--;
  }



  /********************************************RESPONSE MANAGMENT ************************* */
  /********************************************RESPONSE MANAGMENT ************************* */
  /********************************************RESPONSE MANAGMENT ************************* */
  /********************************************RESPONSE MANAGMENT ************************* */


  checking_response=false;
  respond(){
    if(this.type_of_account=='account') {
      if(this.checking_response){
        return
      }
      this.checking_response=true;
      this.Ads_service.check_if_response_sent(this.item.id).subscribe(r=>{
        
        if(r[0].response){
          this.in_other_popup=true;
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous avez déjà répondu à cette annonce'},
            panelClass: "popupConfirmationClass",
          });
          dialogRef.afterClosed().subscribe(result => {
            this.in_other_popup=false;
          })
          
        }
        else{
          this.in_other_popup=true;
          const dialogRef = this.dialog.open(PopupAdWriteResponsesComponent, {
            data: {item:this.item},
            panelClass: 'popupAdWriteReponsesClass',
          });
          dialogRef.afterClosed().subscribe(result => {
            this.in_other_popup=false;
          })
        }
        this.checking_response=false;
      })
      
    }
    else {
      this.in_other_popup=true;
      const dialogRef = this.dialog.open(LoginComponent, {
        data: {usage:"login"},
        panelClass:"loginComponentClass"
      });
      dialogRef.afterClosed().subscribe(result => {
        this.in_other_popup=false;
      })
    }
  }

  get_response_author_link(i: number) {
    return "/account/"+ this.list_of_pseudos[i] ;
  }

  responses(){
    
    this.see_responses=1;
    this.Ads_service.get_all_responses(this.item.id).subscribe(r=>{
      this.list_of_responses=r[0];
      if (r[0]!=null){
        let compt=0
        for (let i=0;i<r[0].length;i++){
          this.list_of_dates[i]= get_date_to_show_for_ad(date_in_seconds(this.now_in_seconds,r[0][i].createdAt) );
          this.Profile_Edition_Service.retrieve_profile_picture( r[0][i].id_user).subscribe(p=> {
            let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_profile_pictures[i] = SafeURL;
          });
          this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_user).subscribe(q=> {
            this.list_of_authors_name[i] = q[0].firstname + ' ' + q[0].lastname;
            this.list_of_certified_account[i] = q[0].certified_account;
            this.list_of_ids[i]=q[0].id; 
            this.list_of_pseudos[i]=q[0].nickname; 
            this.list_of_primary_descriptions[i]=q[0].primary_description;
            compt++;
            if(compt==r[0].length){
              this.answers_retrieved=true;
            }
          });
        }
      }
      if(!r[0].length) {
        this.answers_retrieved=true;
      }
    })
  }

  see_response(i){
    this.b=i;
    this.response_to_read=this.list_of_responses[i];
    this.get_response_contents(this.response_to_read);
    this.see_responses=2;
  }

  get_response_contents(item){
    let u=0;
    var re = /(?:\.([^.]+))?$/;
    this.response_list_of_pictures=[];
    this.response_list_of_attachments_name=[];
    this.response_list_of_pictures_names=[]
    this.response_list_of_attachments=[];
    this.response_list_of_attachments_type=[];
    if(item.number_of_attachments>0){
      for(let i=0;i<item.number_of_attachments;i++){
        if(i==0){
          if(re.exec(item.attachment_name_one)[1]!="pdf"){
            this.response_list_of_pictures_names[i] = item.attachment_real_name_one;
            this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.response_list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            });
          }
          else{
            this.response_list_of_attachments_name[i] = item.attachment_real_name_one;
            this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
              this.response_list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            });
          }
          
        }
        if(i==1){
          if(re.exec(item.attachment_name_two)[1]!="pdf"){
            this.response_list_of_pictures_names[i] = item.attachment_real_name_two;
            this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.response_list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            });
          }
          else{
            this.response_list_of_attachments_name[i] = item.attachment_real_name_two;
            this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
              this.response_list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            });
          }
          
        }
        if(i==2){
          if(re.exec(item.attachment_name_three)[1]!="pdf"){
            this.response_list_of_pictures_names[i] = item.attachment_real_name_three;
            this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.response_list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            });
          }
          else{
            this.response_list_of_attachments_name[i] = item.attachment_real_name_three;
            this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
              this.response_list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            });
          }
          
        };
        if(i==3){
          if(re.exec(item.attachment_real_name_four)[1]!="pdf"){
            this.response_list_of_pictures_names[i] = item.attachment_real_name_four;
            this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.response_list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            })
          }
          else{
            this.response_list_of_attachments_name[i] = item.attachment_real_name_four;
            this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
              this.response_list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            })
          }
          
        };
        if(i==4){
          if(re.exec(item.attachment_real_name_five)[1]!="pdf"){
            this.response_list_of_pictures_names[i] = item.attachment_real_name_five;
            this.Ads_service.retrieve_attachment(item.attachment_name_five,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.response_list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
                this.sort_response_attachments()
              }
            })
          }
          
        };
      }
    }
    else{
      this.response_attachments_retrieved=true;
    }
    
  }

  sort_response_attachments(){
    let length1=this.response_list_of_pictures.length;
    for(let j=0;j<length1;j++){
      if(!this.response_list_of_pictures[length1-1-j]){
        this.response_list_of_pictures.splice(length1-1-j,1);
        this.response_list_of_pictures_names.splice(length1-1-j,1)
      }
    }
    let length2=this.response_list_of_attachments.length
    for(let j=0;j<length2;j++){
      if(!this.response_list_of_attachments[length2-1-j]){
        this.response_list_of_attachments.splice(length2-1-j,1);
        this.response_list_of_attachments_name.splice(length2-1-j,1);
      }
    }
    this.response_attachments_retrieved=true;
    this.cd.detectChanges();
  }


  edit_thumbnail(){
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupEditCoverComponent, {
      data: {item:this.item,category:"ad"},
      panelClass: 'popupEditCoverClass',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.in_other_popup=false;
    })
  }


  checking_report=false
  report(){

    if(this.checking_report){
      return
    }
    this.checking_report=true;
    this.Reports_service.check_if_content_reported('ad',this.item.id,this.item.type_of_project,0).subscribe(r=>{
      if(r[0].nothing){
        this.in_other_popup=true;
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
          panelClass: "popupConfirmationClass",
        });
        dialogRef.afterClosed().subscribe(result => {
          this.in_other_popup=false;
        })
        
      }
      else{
        this.in_other_popup=true;
        const dialogRef = this.dialog.open(PopupReportComponent, {
          data: {from_account:false,id_receiver:this.item.id_user,publication_category:'ad',publication_id:this.item.id,format:this.item.type_of_project,chapter_number:0},
          panelClass:"popupReportClass"
        });
        dialogRef.afterClosed().subscribe(result => {
          this.in_other_popup=false;
        })
      }
      this.checking_report=false;
    })
  }

  cancel_report() {


    this.Reports_service.cancel_report("ad", this.item.id, this.item.type_of_project).subscribe(r => {
      if (this.list_of_reporters && this.list_of_reporters.indexOf(this.visitor_id) >= 0) {
        let i = this.list_of_reporters.indexOf(this.visitor_id)
        this.list_of_reporters.splice(i, 1)
        this.cd.detectChanges()
      }
    })
  }


  see_comments() {
    this.in_other_popup=true;
    let dialogRef=this.dialog.open(PopupCommentsComponent, {
      data: {
        visitor_id:this.visitor_id,
        visitor_name:this.visitor_name,
        visitor_mode:this.visitor_mode,
        type_of_account:this.type_of_account,
        title:this.item.title,
        category:'ad',
        format:this.item.type_of_project,
        style:this.item.remuneration,
        publication_id:this.item.id,
        chapter_number:0,
        authorid:this.item.id_user,
        number_of_comments_to_show:this.number_of_comments_to_show
      }, 
      panelClass: 'popupCommentsClass',
    });
    dialogRef.afterClosed().subscribe(result => {
      if(!result){
        this.emit_close_click.emit(true);
      }
      this.in_other_popup=false;
    })
  }

  open_account() {
    return "/account/" + this.pseudo ;
  };
  
  certified_account:boolean;  
  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };

  picture_loaded=[];
  load_picture(i){
    this.picture_loaded[i]=true;
  }

  after_click_comment(event){
    this.close_popup();
  }

  edit_information() {
    this.in_other_popup=true;
    const dialogRef = this.dialog.open(PopupFormAdComponent, {
      data: {
        item:this.item,
      },
      panelClass: 'popupFormAdClass',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.in_other_popup=false;
    })
  }
}