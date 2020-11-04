import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Ads_service } from '../services/ads.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import {MatMenuModule} from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import { PopupAdPicturesComponent } from '../popup-ad-pictures/popup-ad-pictures.component';
import { PopupAdWriteResponsesComponent } from '../popup-ad-write-responses/popup-ad-write-responses.component';


import {get_date_to_show} from '../helpers/dates';
import {get_date_to_show_for_ad} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any
declare var Swiper: any

@Component({
  selector: 'app-thumbnail-ad',
  templateUrl: './thumbnail-ad.component.html',
  styleUrls: ['./thumbnail-ad.component.scss'],
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
    )
  ],
})
export class ThumbnailAdComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    public navbar: NavbarService,
    public dialog: MatDialog,
    private sanitizer:DomSanitizer,
    private Subscribing_service:Subscribing_service,
    private Ads_service:Ads_service,
    private Profile_Edition_Service:Profile_Edition_Service,

    private cd:ChangeDetectorRef,
    ) { 
    
    this.navbar.setActiveSection(1);
    this.navbar.show();
  }

  @ViewChildren('category') categories:QueryList<ElementRef>;
  @ViewChild('image') image:ElementRef;
  

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( this.image ) {
      let width = this.image.nativeElement.width;
      if( window.innerWidth<=700 ) {
        this.rd.setStyle(this.image.nativeElement, 'height', width*(32/24)+'px');
      }
      else if( window.innerWidth>700 ) {
        this.rd.setStyle(this.image.nativeElement, 'height', '266.66px');
      }
    }
  }

  
  status1:String;
  status2:String;
  status3:String;
  category_index: number = 0;//0 pour description, 1 pour pieces-jointes.

  author_name: string;
  pseudo: string;
  primary_description: string;
  profile_picture: SafeUrl;
  @Input() item: any;
  @Input() now_in_seconds: number;

  date_to_show: string;
  thumbnail_picture:SafeUrl;
  list_of_attachments_name:any[]=[];
  list_of_pictures:any[]=[];
  list_of_attachments:any[]=[];
  attachments_retrieved=false;
  visitor_mode=true;


  //responses
  list_of_responses:any[]=[];
  list_of_dates:any[]=[];
  list_of_profile_pictures:any[]=[];
  list_of_authors_name:any[]=[];
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
  response_list_of_attachments_type=[];
  response_attachments_retrieved=false;
  list_of_pictures_name=[];

  thumbnail_picture_received=false;
  thumbnail_is_loaded=false;
  pp_is_loaded=false;

  ngOnInit() {

    console.log(this.item);

    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      if(r[0].id==this.item.id_user){
        this.visitor_mode=false;
      }
    });

    this.Profile_Edition_Service.retrieve_profile_picture( this.item.id_user).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });

    this.Profile_Edition_Service.retrieve_profile_data(this.item.id_user).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.primary_description=r[0].primary_description;
      this.pseudo = r[0].nickname;
    });


    this.date_to_show = get_date_to_show( date_in_seconds(this.now_in_seconds,this.item.createdAt) );

    this.Ads_service.retrieve_ad_thumbnail_picture( this.item.thumbnail_name ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.thumbnail_picture_received=true;
      this.thumbnail_picture = SafeURL;
    });

    this.get_ad_contents(this.item);
    
  }


  open_category(i : number) {
    this.category_index=i;
    this.cd.detectChanges();
  }
  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }


  
  ngAfterViewInit() {


    this.open_category(0);

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

  

 

  read_pictures(i:number){
      const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
        data: {list_of_pictures:this.list_of_pictures,index_of_picture:i},
      });
  }

  read_attachment(i:number){
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.list_of_attachments[i]},
    });
  }

  read_pictures_response(i:number){
    const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
      data: {list_of_pictures:this.response_list_of_pictures,index_of_picture:i},
    });
  }

  read_attachment_response(i:number){
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.response_list_of_attachments[i]},
    });
  }

  update(){
    //fonction pour mettre à jour une annonce, possible que chaque semaine, gratuit au début
  }


  archive(){
    this.Subscribing_service.archive("ad",this.item.type_of_project,this.item.id).subscribe(r=>{
      console.log(r[0]);
    });
  }

 

  
  get_ad_contents(item){
    let u=0;
    var re = /(?:\.([^.]+))?$/;
    if(item.number_of_attachments>0){
      for(let i=0;i<item.number_of_attachments;i++){
        console.log(i)
        if(i==0){
          if(re.exec(item.attachment_name_one)[1]!="pdf"){
            this.list_of_pictures_name[i] = item.attachment_real_name_one;
            this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
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
                this.cd.detectChanges();
                this.initialize_swiper();
              }
            });
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_one;
            this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
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
                this.cd.detectChanges();
                this.initialize_swiper();
              }
            });
          }
          
        }
        if(i==1){
          console.log(re.exec(item.attachment_name_two)[1]);
          if(re.exec(item.attachment_name_two)[1]!="pdf"){
            this.list_of_pictures_name[i] = item.attachment_real_name_two;
            this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
              let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_pictures[l[1]] = SafeURL;
              u++
              if(u==item.number_of_attachments){
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
                this.cd.detectChanges();
                this.initialize_swiper();
              }
            });
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_two;
            this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
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
                this.cd.detectChanges();
                this.initialize_swiper();
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
                this.cd.detectChanges();
                this.initialize_swiper();
              }
            });
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_three;
            this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
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
                this.cd.detectChanges();
                this.initialize_swiper();
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
                this.cd.detectChanges();
                this.initialize_swiper();
              }
            })
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_four;
            this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
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
                this.cd.detectChanges();
                this.initialize_swiper();
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
                this.cd.detectChanges();
                this.initialize_swiper();
              }
            })
          }
          else{
            this.list_of_attachments_name[i] = item.attachment_real_name_five;
            this.Ads_service.retrieve_attachment(item.attachment_name_five,i).subscribe(l=>{
              this.list_of_attachments[l[1]] = l[0];
              u++
              if(u==item.number_of_attachments){
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
                this.cd.detectChanges();
                this.initialize_swiper();
              }
            })
          }
          
        }
      }
    }
    else{
      this.attachments_retrieved=true;
      this.cd.detectChanges();
      this.initialize_swiper();
    }
  }


  
  load_thumbnail(){
    this.thumbnail_is_loaded=true;
  }

  load_pp(){
    this.pp_is_loaded=true;
  }


  get_artwork() {
    return "/ad-page/" + this.item.title + "/" + this.item.id;
  }
  open_account() {
    return "/account/"+this.pseudo+"/"+this.item.id_user;
  }

  @ViewChild("swiperAttachments") swiperAttachments:ElementRef;
  swiper:any;
  initialize_swiper() {
    this.swiper = new Swiper( this.swiperAttachments.nativeElement, {
      speed: 300,
      initialSlide:0,
      spaceBetween:100,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 50
        },
        300: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 50
        },
        500: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          spaceBetween: 30
        },
        600: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          spaceBetween: 30
        },
        700: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          spaceBetween: 30
        },
        750: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          spaceBetween: 30
        },
      }
    })
  }


}
