import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Writing_Upload_Service } from '../services/writing.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {Subscribing_service} from '../services/subscribing.service';
import {ChatService} from '../services/chat.service';
import {Emphasize_service} from '../services/emphasize.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import {get_date_to_show} from '../helpers/dates';
import {Reports_service} from '../services/reports.service';
import {NotationService} from '../services/notation.service';
import {NotificationsService} from '../services/notifications.service';
import { merge, fromEvent } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import { PopupEditCoverComponent } from '../popup-edit-cover/popup-edit-cover.component';
import {number_in_k_or_m} from '../helpers/fonctions_calculs';
import { NavbarService } from '../services/navbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupArtworkComponent } from '../popup-artwork/popup-artwork.component';

declare var Swiper:any;
declare var $:any;

@Component({
  selector: 'app-thumbnail-artwork',
  templateUrl: './thumbnail-artwork.component.html',
  styleUrls: ['./thumbnail-artwork.component.scss'],
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
export class ThumbnailArtworkComponent implements OnInit {

 


  constructor(
    private route: ActivatedRoute, 
    private Profile_Edition_Service:Profile_Edition_Service,
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private NotationService:NotationService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    public dialog: MatDialog,
    private NotificationsService:NotificationsService,
    private rd:Renderer2,
    private router:Router,
    private Reports_service:Reports_service,
    private cd:ChangeDetectorRef,
    private Emphasize_service:Emphasize_service,
    private navbar: NavbarService,
    private chatService:ChatService,
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })

    }

    put_new=false;
  @ViewChild('image') image:ElementRef;
  @ViewChild('image2') image2:ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.update_image_size();
    if( window.innerWidth<500 ) {
      this.put_new=true;
    }
    else{
      this.put_new=false;
    }
  }

  update_image_size() {
    this.cd.detectChanges();
    if( this.image ) {

      let width = this.image.nativeElement.width;
      let height = this.image.nativeElement.height;
      if( window.innerWidth<=600 && this.category!="drawing" ) {
        this.rd.setStyle(this.image.nativeElement, 'height', width*(32/24)+'px');
        this.rd.setStyle(this.image.nativeElement, 'width', '100%');
      }
      else if( window.innerWidth<=600 && this.category=="drawing" ) {
        this.rd.setStyle(this.image.nativeElement, 'height', 'unset');
        this.rd.setStyle(this.image.nativeElement, 'width', '100%');
      }
      else {
        this.rd.setStyle(this.image.nativeElement, 'height', '266.66px');
      }
      
    }
  }

  @Input() in_artwork: any;

  @Input() item: any;
  @Input() skeleton: boolean;
  @Input() page: any;
  @Input() rank: any;
  @Input() now_in_seconds: number;

  @Input() subscribing_category: any;
  @Input() subscribing_format: any;
  @Input() emphasized: boolean;
  @Input() artwork_container: any;
  scroll:any;

  type_of_account:string;
  certified_account:boolean;  

  display_evenif_reported=false;
  data_retrieved=false;
  pdfSrc:SafeUrl;
  total_pages_for_writing:number;
  profile_picture:any;
  profile_picture_safe:any;
  author_name:string='';
  author_pseudo:string='';
  primary_description:string;
  pseudo:string='';
  type_of_profile:string;
  author_id:number;
  drawing_name:string//drawing one shot
  file_name: string;
  title: string;
  style: string;
  highlight: string;
  list_of_reporters:any;
  short_highlight:string;

  content_id:number;
  firsttag: string;
  secondtag: string;
  thirdtag: string;
  pagesnumber: number;
  marks_retrieved=false;
  viewnumber: string;
  likesnumber: string;
  lovesnumber: string;
  chaptersnumber: number;
  date_upload: string;
  date_upload_to_show: string;
  category:string;
  format:string;
  thumbnail_picture:any;
  thumbnail_picture_safe:any;
  thumbnail_picture_received=false;

  thumbnail_is_loaded=false;
  pp_is_loaded=false;
  user_id:number;
  visitor_mode=false;
  user_name:string;
  visitor_mode_retrieved=false;
  type_of_thumbnail:number // 0 pour emphasized et 1 pour trendings et subscribtions
  report_done=false;

  show_icon=false;

  ngOnChanges(changes: SimpleChanges) {
    if(changes.artwork_container ){
      if(this.artwork_container){
        this.scroll = merge(
          fromEvent(window, 'scroll'),
          fromEvent(this.artwork_container, 'scroll'),
          fromEvent($('.popupArtworkClass mat-dialog-container'), 'scroll')
        );
      }
    }
  }

  ngOnInit() {

    if( !this.skeleton ) {
      
      if(this.emphasized){
        this.type_of_thumbnail=0;
        this.category=this.item.publication_category;
        this.subscribing_category=this.item.publication_category;
        this.format=this.item.format;
        this.subscribing_format=this.format;
        this.content_id=this.item.publication_id;
        this.route.data.subscribe(res => {
         
          let r= res.user
          this.user_id=r[0].id;
          this.user_name=r[0].firstname + ' ' + r[0].lastname;
          this.primary_description=r[0].primary_description;
          this.pseudo = r[0].nickname;
          this.type_of_profile=r[0].status;
          if(r[0].id==this.item.id_user){
            
            this.visitor_mode=false;
          
          }
          else{
            this.visitor_mode=true;
          }
          this.visitor_mode_retrieved=true;
        })

        this.Profile_Edition_Service.retrieve_profile_picture( this.item.id_user).subscribe(r=> {
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.profile_picture = url;
          this.profile_picture_safe=SafeURL;
        });

        this.Profile_Edition_Service.retrieve_profile_data(this.item.id_user).subscribe(r=> {
          this.author_name = r[0].firstname + ' ' + r[0].lastname;
          this.primary_description=r[0].primary_description;
          this.author_pseudo = r[0].nickname;
          this.author_id=r[0].id;
          
          
          this.certified_account=r[0].certified_account;
        });

        this.Emphasize_service.get_emphasized_content(this.item.id_user).subscribe(l=>{
          if (l[0]!=null && l[0]!=undefined){
            if(this.category=="comic"){
              if (l[0].publication_id==this.item.publication_id && l[0].publication_category== "comic" && l[0].format==this.format){
                this.content_emphasized=true;
              }
            }
            else if(this.category=="drawing"){
              if (l[0].publication_id==this.item.publication_id && l[0].publication_category== "drawing" && l[0].format==this.format){
                this.content_emphasized=true;
              }
            }
            else{
              if (l[0].publication_id==this.item.publication_id && l[0].publication_category== "writing" ){
                this.content_emphasized=true;
              }
            }
          }
          this.emphasized_contend_retrieved=true;
        });

        if(this.category=="comic"){
          if(this.format=="one-shot"){
          
            this.BdOneShotService.retrieve_bd_by_id(this.item.publication_id).subscribe(r=>{
              this.file_name = r[0].name_coverpage
              
              this.title = r[0].title
              this.style = r[0].category
              this.highlight = r[0].highlight.slice(0,290)
              this.list_of_reporters=r[0].list_of_reporters
              this.short_highlight = this.highlight.slice(0,70);

              this.firsttag = r[0].firsttag
              this.secondtag = r[0].secondtag
              this.thirdtag = r[0].thirdtag
              this.pagesnumber = r[0].pagesnumber
              
              this.chaptersnumber = r[0].chaptersnumber
              this.date_upload = r[0].createdAt
              this.data_retrieved=true;
              
              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
              this.get_images_to_show();

              this.BdOneShotService.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;

                this.initialize_swiper();
              
              });

            });
            this.NotationService.get_content_marks("comic", 'one-shot', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
          
            this.check_archive();
            
          }
          else{
            this.BdSerieService.retrieve_bd_by_id(this.item.publication_id).subscribe(r=>{
              this.file_name = r[0].name_coverpage
              this.title = r[0].title
              this.style = r[0].category
              this.highlight = r[0].highlight.slice(0,290)
              this.list_of_reporters=r[0].list_of_reporters
              this.short_highlight = this.highlight.slice(0,70);

              this.firsttag = r[0].firsttag
              this.secondtag = r[0].secondtag
              this.thirdtag = r[0].thirdtag
              this.pagesnumber = r[0].pagesnumber
              this.chaptersnumber = r[0].chaptersnumber
              this.date_upload = r[0].createdAt
              this.data_retrieved=true;
              
              this.get_images_to_show();
              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
              this.BdOneShotService.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;

                this.initialize_swiper();
              });

            });
            this.NotationService.get_content_marks("comic", 'serie', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
            
            this.check_archive()
          }
        }

        if(this.category=="drawing"){
          if(this.format=="one-shot"){
            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.item.publication_id).subscribe(r=>{
              this.file_name = r[0].name_coverpage
              this.title = r[0].title
              this.style = r[0].category
              this.drawing_name=r[0].drawing_name;
              this.highlight = r[0].highlight.slice(0,290)
              this.list_of_reporters=r[0].list_of_reporters
              this.short_highlight = this.highlight.slice(0,70);

              this.firsttag = r[0].firsttag
              this.secondtag = r[0].secondtag
              this.thirdtag = r[0].thirdtag
              this.pagesnumber = r[0].pagesnumber
              this.chaptersnumber = r[0].chaptersnumber
              this.date_upload = r[0].createdAt
              this.data_retrieved=true;
              this.get_images_to_show();
              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

              this.Drawings_Onepage_Service.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;

                this.initialize_swiper();
              });

            });
            this.NotationService.get_content_marks("drawing", 'one-shot', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
          
            this.check_archive()
          }
          else{
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.item.publication_id).subscribe(r=>{
              this.file_name = r[0].name_coverpage
              this.title = r[0].title
              this.style = r[0].category
              this.highlight = r[0].highlight.slice(0,290)
              this.list_of_reporters=r[0].list_of_reporters
              this.short_highlight = this.highlight.slice(0,70);
              this.firsttag = r[0].firsttag
              this.secondtag = r[0].secondtag
              this.thirdtag = r[0].thirdtag
              this.pagesnumber = r[0].pagesnumber
              this.chaptersnumber = r[0].chaptersnumber
              this.date_upload = r[0].createdAt
              
              this.data_retrieved=true;
              this.get_images_to_show();
            
              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
              this.Drawings_Onepage_Service.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;
                
                this.initialize_swiper();
              });

            });
            this.NotationService.get_content_marks("drawing", 'artbook', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
          
            this.check_archive()
          }
        }

        if(this.category=="writing"){
          
            this.Writing_Upload_Service.retrieve_writing_information_by_id(this.item.publication_id).subscribe(r=>{
              this.file_name = r[0].name_coverpage
              this.title = r[0].title
              this.style = r[0].category
              this.highlight = r[0].highlight.slice(0,290)
              this.total_pages_for_writing=r[0].total_pages;
              this.short_highlight = this.highlight.slice(0,70);
              this.list_of_reporters=r[0].list_of_reporters
              this.firsttag = r[0].firsttag
              this.secondtag = r[0].secondtag
              this.thirdtag = r[0].thirdtag
              this.pagesnumber = r[0].pagesnumber
              this.chaptersnumber = r[0].chaptersnumber
              this.date_upload = r[0].createdAt
              this.data_retrieved=true;

              
              
              this.Writing_Upload_Service.retrieve_writing_by_name_artwork(r[0].file_name).subscribe(r=>{
                let file = new Blob([r], {type: 'application/pdf'});
                this.pdfSrc = URL.createObjectURL(file);
              });

              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
              this.Writing_Upload_Service.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;
                
                this.initialize_swiper();
              });

            });
            this.NotationService.get_content_marks("writing", 'unknown', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
            this.check_archive()
        }
      }
      else{
        this.type_of_thumbnail=1;
        this.category=this.subscribing_category;
        this.format=this.subscribing_format;

        

        if(this.in_artwork){
          this.Profile_Edition_Service.get_current_user().subscribe(r=>{
            this.user_id=r[0].id;
            this.user_name=r[0].firstname + ' ' + r[0].lastname;
            this.primary_description=r[0].primary_description;
            this.pseudo = r[0].nickname;
            this.type_of_profile=r[0].status;
            if(r[0].id==this.item.authorid){
              this.visitor_mode=false;
              
            }
            else{
              this.visitor_mode=true;
            }
            this.visitor_mode_retrieved=true;
          })
        }
        else{
          this.route.data.subscribe(resp => {
            let r= resp.user;
            this.user_id=r[0].id;
            this.user_name=r[0].firstname + ' ' + r[0].lastname;
            this.primary_description=r[0].primary_description;
            this.pseudo = r[0].nickname;
            this.type_of_profile=r[0].status;
            if(r[0].id==this.item.authorid){
              this.visitor_mode=false;
              
            }
            else{
              this.visitor_mode=true;
            }
            this.visitor_mode_retrieved=true;
          })
        }
       
        this.Profile_Edition_Service.retrieve_profile_picture( this.item.authorid).subscribe(r=> {
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.profile_picture = url;
          this.profile_picture_safe=SafeURL;
        });

        this.Emphasize_service.get_emphasized_content(this.item.authorid).subscribe(l=>{
          if (l[0]!=null && l[0]!=undefined){
            if(this.category=="comic"){
              if (l[0].publication_id==this.item.bd_id && l[0].publication_category== "comic" && l[0].format==this.format){
                this.content_emphasized=true;
              }
            }
            else if(this.category=="drawing"){
              if (l[0].publication_id==this.item.drawing_id && l[0].publication_category== "drawing" && l[0].format==this.format){
                this.content_emphasized=true;
              }
            }
            else{
              if (l[0].publication_id==this.item.writing_id && l[0].publication_category== "writing" ){
                this.content_emphasized=true;
              }
            }
          }
          this.emphasized_contend_retrieved=true;
        });

        this.Profile_Edition_Service.retrieve_profile_data(this.item.authorid).subscribe(r=> {
          this.author_name = r[0].firstname + ' ' + r[0].lastname;
          this.primary_description=r[0].primary_description;
          this.author_pseudo = r[0].nickname;
          this.author_id=r[0].id;
          
          this.certified_account=r[0].certified_account;
        });

        if(this.category=="comic"){
          if(this.format=="one-shot"){
            this.content_id=this.item.bd_id;
              this.file_name = this.item.name_coverpage
              this.title = this.item.title
              this.style = this.item.category
              this.highlight = this.item.highlight.slice(0,290)
              this.list_of_reporters=this.item.list_of_reporters
              this.short_highlight = this.highlight.slice(0,70);

              this.firsttag = this.item.firsttag
              this.secondtag = this.item.secondtag
              this.thirdtag = this.item.thirdtag
              this.pagesnumber = this.item.pagesnumber
              this.chaptersnumber = this.item.chaptersnumber
              this.date_upload = this.item.createdAt
              this.data_retrieved=true;
              this.NotationService.get_content_marks("comic", 'one-shot', this.item.bd_id,0).subscribe(r=>{
                //marks
                this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
                this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
                this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
                this.marks_retrieved=true;
              })
              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
              this.check_archive()
              this.get_images_to_show();
              
              this.BdOneShotService.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;
                
                this.initialize_swiper();
                
              });
          }
          else{
            this.content_id=this.item.bd_id;
              this.file_name = this.item.name_coverpage
              this.title = this.item.title
              this.style = this.item.category
              this.highlight = this.item.highlight.slice(0,290)
              this.list_of_reporters=this.item.list_of_reporters
              this.short_highlight = this.highlight.slice(0,70);

              this.firsttag = this.item.firsttag
              this.secondtag = this.item.secondtag
              this.thirdtag = this.item.thirdtag
              this.pagesnumber = this.item.pagesnumber
              this.chaptersnumber = this.item.chaptersnumber
              this.date_upload = this.item.createdAt
              this.data_retrieved=true;
              this.NotationService.get_content_marks("comic", 'serie', this.item.bd_id,0).subscribe(r=>{
                //marks
                this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
                this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
                this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
                this.marks_retrieved=true;
              })
              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
              this.check_archive()
              this.get_images_to_show();
              
              this.BdOneShotService.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;
                
                this.initialize_swiper();
              });


          }
        }

        if(this.category=="drawing"){
          if(this.format=="one-shot"){
              this.content_id=this.item.drawing_id;
              this.file_name = this.item.name_coverpage
              this.title = this.item.title
              this.style = this.item.category
              this.highlight = this.item.highlight.slice(0,290)
              this.list_of_reporters=this.item.list_of_reporters
              this.short_highlight = this.highlight.slice(0,70);
              this.drawing_name=this.item.drawing_name;
              this.firsttag = this.item.firsttag
              this.secondtag = this.item.secondtag
              this.thirdtag = this.item.thirdtag
              this.pagesnumber = this.item.pagesnumber
              this.chaptersnumber = this.item.chaptersnumber
              this.date_upload = this.item.createdAt;
              this.data_retrieved=true;
              this.NotationService.get_content_marks("drawing", 'one-shot', this.item.drawing_id,0).subscribe(r=>{
                //marks
                this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
                this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
                this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
                this.marks_retrieved=true;
              })
              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
              this.check_archive()
              this.get_images_to_show();
              

              this.Drawings_Onepage_Service.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;
                
                this.initialize_swiper();
              });
          }
          else{
            this.content_id=this.item.drawing_id;
              this.file_name = this.item.name_coverpage
              this.title = this.item.title
              this.style = this.item.category
              this.highlight = this.item.highlight.slice(0,290)
              this.list_of_reporters=this.item.list_of_reporters
              this.short_highlight = this.highlight.slice(0,70);

              this.firsttag = this.item.firsttag
              this.secondtag = this.item.secondtag
              this.thirdtag = this.item.thirdtag
              this.pagesnumber = this.item.pagesnumber
              this.chaptersnumber = this.item.chaptersnumber
              this.date_upload = this.item.createdAt
              this.data_retrieved=true;
              this.NotationService.get_content_marks("drawing", 'artbook', this.item.drawing_id,0).subscribe(r=>{
                //marks
                this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
                this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
                this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
                this.marks_retrieved=true;
              })
              this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
              this.check_archive()
              this.get_images_to_show();

              
              this.Drawings_Onepage_Service.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.thumbnail_picture = url;
                this.thumbnail_picture_safe=SafeURL;
                this.thumbnail_picture_received=true;
                
                this.initialize_swiper();
              });


          }
        }

        if(this.category=="writing"){
          
          this.content_id=this.item.writing_id;
          this.file_name = this.item.name_coverpage
          this.title = this.item.title
          this.style = this.item.category
          this.highlight = this.item.highlight.slice(0,290)
          this.total_pages_for_writing=this.item.total_pages;
          this.short_highlight = this.highlight.slice(0,70);
          this.list_of_reporters=this.item.list_of_reporters
          this.firsttag = this.item.firsttag
          this.secondtag = this.item.secondtag
          this.thirdtag = this.item.thirdtag
          this.pagesnumber = this.item.pagesnumber
          this.chaptersnumber = this.item.chaptersnumber
          this.date_upload = this.item.createdAt;
          this.data_retrieved=true;
          this.NotationService.get_content_marks("writing", 'unknown', this.item.writing_id,0).subscribe(r=>{
            //marks
            this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
            this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
            this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
            this.marks_retrieved=true;
          })
          this.check_archive()
          this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
          

          this.Writing_Upload_Service.retrieve_writing_by_name_artwork(this.item.file_name).subscribe(r=>{
            let file = new Blob([r], {type: 'application/pdf'});
            this.pdfSrc = URL.createObjectURL(file);
          });
          
          this.Writing_Upload_Service.retrieve_thumbnail_picture_artwork( this.file_name ).subscribe(r=> {
            let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.thumbnail_picture = url;
            this.thumbnail_picture_safe=SafeURL;
            this.thumbnail_picture_received=true;
            
            this.initialize_swiper();
          });
        }

      }
    }
    
    

    
    
  }


  date_in_seconds(){

    var uploaded_date = this.date_upload.substring(0,this.date_upload.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

   // alert( now_in_seconds - uploaded_date_in_second );
    return ( this.now_in_seconds - uploaded_date_in_second );
  };

  load_thumbnail(){
    this.thumbnail_is_loaded=true;
    this.cd.detectChanges();
    this.update_image_size();
  };

  load_pp(){
    this.pp_is_loaded=true;
  };

  get_artwork() {
    if(this.title){
      if(this.subscribing_category=='comic') {
        return "/artwork-comic/"+this.subscribing_format+"/"+this.title.replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F')+"/"+this.content_id;
      }
      else if(this.subscribing_category=='drawing') {
        return "/artwork-drawing/"+this.subscribing_format+"/"+this.title.replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F')+"/"+this.content_id;
      }
      else {
        return "/artwork-writing"+"/"+this.title.replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F')+"/"+this.content_id;
      }
    }
   
  };

  
  open_account() {
    return "/account/"+this.author_pseudo;
  };
  get_link() {
    return "/main-research/styles/tags/1/Comic/"+this.style+"/all";
  };
  get_link_tags(s) {
    return "/main-research/styles/tags/1/Comic/"+this.style+"/" + s ;
  };

  see_more_clicked = false;
  see_more_description(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.see_more_clicked = true;
    this.short_highlight = this.highlight;
  };
  
  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  };


  

  swiper:any;
  @ViewChild("swiperArtworkPreview") swiperArtworkPreview:ElementRef;
  @ViewChild("swiperThumbnails") swiperThumbnails:ElementRef;
  swiper_initialized=false;
  initialize_swiper() {
      this.cd.detectChanges();
      if( this.subscribing_category!='writing' && this.swiperArtworkPreview && !this.swiper_initialized ) {
        this.swiper = new Swiper( this.swiperArtworkPreview.nativeElement, {
          effect: 'fade',
          fadeEffect: { crossFade: true },
          speed: 800,
          initialSlide:0,
          pagination: {
            el: '.thumbnail-artwork-pagination',
            type: 'bullets'
          },
          observer:true,
        })
        this.swiper_initialized=true;
        this.cd.detectChanges()
      };
      

      return;
  };


  timeout = interval(2000);
  subscription: Subscription;
  swiper_launched=false;
  launch_swiper() {
    if(!this.list_of_images_to_show_retrieved || !this.swiperArtworkPreview){
      return;
    }
    if(this.swiperArtworkPreview && !this.swiper_initialized){
      this.initialize_swiper();
    }
    this.swiper.slideTo(0);
    this.subscription = this.timeout.subscribe( val => {
      if( this.swiper.isEnd ) {
        this.swiper.slideTo(0);
      }
      else {
        this.swiper.slideNext();
      }
    });
    this.swiper_launched=true;
  };
  stop_swiper() {
    if(this.list_of_images_to_show_retrieved && this.swiper_launched){
      this.subscription.unsubscribe();
      this.swiper.slideTo(0);
    }
  
  };

  

  show_absolute_cover=true;
  load_pdf() {
    this.show_absolute_cover = false;
  };
  close_pdf() {
    this.show_absolute_cover = true;
  };


  
  afterLoadComplete(pdf: PDFDocumentProxy){
    let total_pages=pdf.numPages;
    if(!this.total_pages_for_writing){
      this.Writing_Upload_Service.add_total_pages_for_writing(this.content_id,total_pages).subscribe(r=>{
        this.total_pages_for_writing=total_pages;
        this.cd.detectChanges();
      })
    }
  }

   ngAfterViewInit() {
    this.update_image_size();
    if( window.innerWidth<500 ) {
      this.put_new=true;
    }
    else{
      this.put_new=false;
    }
   }

  /******************************************** SHOW IMAGES PREVIEW  *******************************************/
  /******************************************** SHOW IMAGES PREVIEW   *******************************************/
  /******************************************** SHOW IMAGES PREVIEW   *******************************************/

  loaded_images:any[]=[];
  list_of_images_to_show_mobile=[0]
  list_of_images_to_show=[];
  list_of_images_to_show_retrieved=false;
  recent_chapter=false;
  load_image(i){
    this.loaded_images[i]=true;
  }

  convert_timestamp_to_number(timestamp){
    
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number
  }

  get_images_to_show(){
    if(this.category=="comic"){
      let bd_id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id;
      if(this.format=="serie"){
        this.BdSerieService.retrieve_chapters_by_id(bd_id).subscribe(s => {
          let last_week=new Date();
          last_week.setDate(last_week.getDate() - 7);
          let num_last_week= Math.trunc( last_week.getTime()/1000);
          let timestamp=s[0][s[0].length-1].createdAt;
          let num_chapter= this.convert_timestamp_to_number(timestamp);
          if(num_chapter-num_last_week>0){
            this.recent_chapter=true;
          }
          
          let total_pages=(s[0][0].pagesnumber<=3)?s[0][0].pagesnumber:3;
          let compteur=0;
          for( let k=0; k< total_pages; k++ ) {
            this.BdSerieService.retrieve_bd_page_artwork(bd_id,1,k).subscribe(r=>{
              let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
              let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_images_to_show[r[1]]= SafeURL;
              compteur++;
              if(compteur==total_pages){
                this.list_of_images_to_show_retrieved=true;
                this.cd.detectChanges();
                this.initialize_swiper();
               
              }
            });
          };
        })
      }

      else{
        
        let compteur=0;
        let total_pages=(this.pagesnumber<=3)?this.pagesnumber:3;
        for( let k=0; k< total_pages; k++ ) {
          this.BdOneShotService.retrieve_bd_page_artwork(bd_id,k).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
            let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_images_to_show[r[1]]= SafeURL;
            compteur++;
            if(compteur==total_pages){
              this.list_of_images_to_show_retrieved=true;
              this.cd.detectChanges();
              this.initialize_swiper();
            }
          });
        };
      }
    }
    else if(this.category=="drawing"){
      let drawing_id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id;
      if(this.format=="artbook"){
        let compteur=0;
        let total_pages=(this.pagesnumber<=3)?this.pagesnumber:3;
        for( var i=0; i< total_pages; i++ ) {
          this.Drawings_Artbook_Service.retrieve_drawing_page_ofartbook_artwork(drawing_id,i).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
            let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_images_to_show[r[1]]= SafeURL;
            compteur++;
            if(compteur==total_pages){
              this.list_of_images_to_show_mobile=[0].concat( this.list_of_images_to_show)
              this.list_of_images_to_show_retrieved=true;
              this.cd.detectChanges();
              this.initialize_swiper();
            }
          });
        };
      }
      else{
        this.Drawings_Onepage_Service.retrieve_drawing_page_artwork(this.drawing_name).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_images_to_show[0]= SafeURL;
          this.list_of_images_to_show_mobile=[0].concat( this.list_of_images_to_show)
          this.list_of_images_to_show_retrieved=true;
          this.cd.detectChanges();
          this.initialize_swiper();
        });
      }
    }
  }











  /******************************************** OPTIONS  *******************************************/
  /******************************************** OPTIONS  *******************************************/
  /******************************************** OPTIONS  *******************************************/

  content_archived=false;
  archive_retrieved=false;

  check_archive(){
    let id=0;
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id
    }
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id
    }
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id
    }
    this.Subscribing_service.check_if_publication_archived(this.category,this.format ,id).subscribe(r=>{
      if(r[0].value){
        this.content_archived=true;
      }
      this.archive_retrieved=true;
    })
  }

  archive(){
    let id=0;
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id
    }
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id
    }
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id
    }
    this.Subscribing_service.archive(this.category,this.format,id).subscribe(r=>{
      this.content_archived=true;
    });
  }

  unarchive(){
    let id=0;
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id
    }
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id
    }
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id
    }
    this.Subscribing_service.unarchive( this.category,this.format,id).subscribe(r=>{
      this.content_archived=false;
    });
  }

  archive_loading=false;
  content_emphasized=false;
  emphasized_contend_retrieved=false;
  emphasize(){
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    let id=0;
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id;
      this.Emphasize_service.emphasize_content( "comic",this.format,id).subscribe(r=>{
        this.content_emphasized=true;
        this.archive_loading=false;
      });
    }
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id;
      this.Emphasize_service.emphasize_content( "drawing",this.format,id).subscribe(r=>{
        this.content_emphasized=true;
        this.archive_loading=false;
      });
    }
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id;
      this.Emphasize_service.emphasize_content( "writing",this.format,id).subscribe(r=>{
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
    let id=0;
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id;
      this.Emphasize_service.remove_emphasizing( "comic",this.format,id).subscribe(r=>{
        this.content_emphasized=false;
        this.archive_loading=false;
      });
    }
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id;
      this.Emphasize_service.remove_emphasizing( "drawing",this.format,id).subscribe(r=>{
        this.content_emphasized=false;
        this.archive_loading=false;
      });
    }
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id;
      this.Emphasize_service.remove_emphasizing( "writing",this.format,id).subscribe(r=>{
        this.content_emphasized=false;
        this.archive_loading=false;
      });
    }
    
  }

  remove_artwork(){

    let id=0;
    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer cette œuvre ? Toutes les données associées seront définitivement supprimées'},
      panelClass: "popupConfirmationClass",
    });
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id;
      dialogRef.afterClosed().subscribe(result => {
        if( result ) {
          if(this.format=="one-shot"){
            this.navbar.delete_publication_from_research("Comic",this.format,id).subscribe(r=>{
             
              this.BdOneShotService.RemoveBdOneshot(id).subscribe(r=>{
                this.NotificationsService.remove_notification('add_publication','comic','one-shot',id,0,false,0).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"add_publication",
                    id_user_name:this.author_pseudo,
                    id_user:this.author_id, 
                    publication_category:'comic',
                    format:'one-shot',
                    publication_id:id,
                    chapter_number:0,
                    information:"remove",
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.archive_loading=false;
                  this.chatService.messages.next(message_to_send);
                  location.reload();
                  return;
                })
              
              });
            })
           
          }
          else{
            this.navbar.delete_publication_from_research("Comic",this.format,id).subscribe(r=>{
              this.BdSerieService.RemoveBdSerie(id).subscribe(r=>{
                this.NotificationsService.remove_notification('add_publication','comic','serie',id,0,false,0).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"add_publication",
                    id_user_name:this.author_pseudo,
                    id_user:this.author_id, 
                    publication_category:'comic',
                    format:'serie',
                    publication_id:id,
                    chapter_number:0,
                    information:"remove",
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.archive_loading=false;
                  this.chatService.messages.next(message_to_send);
                  location.reload();
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
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id;
      dialogRef.afterClosed().subscribe(result => {
        if( result ) {
          if(this.format=="one-shot"){
            this.navbar.delete_publication_from_research("Drawing",this.format,id).subscribe(r=>{
              this.Drawings_Onepage_Service.remove_drawing_from_sql(id).subscribe(r=>{
                this.NotificationsService.remove_notification('add_publication','drawing',this.format,id,0,false,0).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"add_publication",
                    id_user_name:this.author_pseudo,
                    id_user:this.author_id, 
                    publication_category:'drawing',
                    format:this.format,
                    publication_id:id,
                    chapter_number:0,
                    information:"remove",
                    status:"unchecked",
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.archive_loading=false;
                  this.chatService.messages.next(message_to_send);
                  location.reload()
                  return;
                })
              });
              
            })
            
          }
          else{
            this.navbar.delete_publication_from_research("Drawing",this.format,id).subscribe(r=>{
              this.Drawings_Artbook_Service.RemoveDrawingArtbook(id).subscribe(r=>{
                this.NotificationsService.remove_notification('add_publication','drawing',this.format,id,0,false,0).subscribe(l=>{
                  let message_to_send ={
                    for_notifications:true,
                    type:"add_publication",
                    id_user_name:this.author_pseudo,
                    id_user:this.author_id, 
                    publication_category:'drawing',
                    format:this.format,
                    publication_id:id,
                    chapter_number:0,
                    information:"remove",
                    status:"unchecked",
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.archive_loading=false;
                  this.chatService.messages.next(message_to_send);
                  location.reload()
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
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id;
      dialogRef.afterClosed().subscribe(result => {
        if( result ) {
          this.navbar.delete_publication_from_research("Writing","unknown",id).subscribe(r=>{
            this.Writing_Upload_Service.Remove_writing(id).subscribe(r=>{
              this.NotificationsService.remove_notification('add_publication','writing','unknown',id,0,false,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"add_publication",
                  id_user_name:this.author_pseudo,
                  id_user:this.author_id, 
                  publication_category:'writing',
                  format:'unknown',
                  publication_id:id,
                  chapter_number:0,
                  information:"remove",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.archive_loading=false;
                this.chatService.messages.next(message_to_send);
                location.reload();
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
  }

  set_private(){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir archiver cette œuvre ? Elle ne sera visible que par vous dans les archives.'},
      panelClass: "popupConfirmationClass",
    });

    if(this.archive_loading){
      return
    }
    this.archive_loading=true;
    let id;
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id;
      dialogRef.afterClosed().subscribe(result => {
        if( result ) {
          if(this.format=="one-shot"){
            this.Subscribing_service.change_content_status( "comic",this.format,id,"private").subscribe(r=>{
              this.BdOneShotService.change_oneshot_comic_status(id,"private").subscribe(r=>{
                this.archive_loading=false;
                location.reload()
              });
            })
          }
          else{
            this.Subscribing_service.change_content_status( "comic",this.format,id,"private").subscribe(r=>{
              this.BdSerieService.change_serie_comic_status(id,"private").subscribe(r=>{
                this.archive_loading=false;
                location.reload()
              });
            })
          }
  
        }
        else{
          this.archive_loading=false;
        }
      });
    }
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id;
      dialogRef.afterClosed().subscribe(result => {
        if( result ) {
          if(this.format=="one-shot"){
            this.Subscribing_service.change_content_status( "drawing",this.format,id,"private").subscribe(r=>{
              this.BdOneShotService.change_oneshot_comic_status(id,"private").subscribe(r=>{
                this.archive_loading=false;
                location.reload()
              });
            })
          }
          else{
            this.Subscribing_service.change_content_status( "drawing",this.format,id,"private").subscribe(r=>{
              this.BdSerieService.change_serie_comic_status(id,"private").subscribe(r=>{
                this.archive_loading=false;
                location.reload()
              });
            })
          }
  
        }
        else{
          this.archive_loading=false;
        }
      });
    }
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id;
      dialogRef.afterClosed().subscribe(result => {
        if( result ) {
          this.Subscribing_service.change_content_status("writing","unknown",id,"private").subscribe(r=>{
            this.Writing_Upload_Service.change_writing_status(id,"private").subscribe(r=>{
              this.archive_loading=false;
              location.reload()
            });
          })
  
        }
        else{
          this.archive_loading=false;
        }
      });
    }

    
   
  }

  edit_thumbnail() {
    if(this.category=="comic"){

     

      const dialogRef = this.dialog.open(PopupEditCoverComponent, {
        data: {type:"edit_comic_thumbnail",
        format:this.format,
        bd_id: (this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id,
        title: this.title,
        style:this.style, 
        firsttag:this.firsttag,
        author_name: this.user_name,
        primary_description: this.primary_description, 
        profile_picture: this.profile_picture,
        thumbnail_picture:this.file_name,
        category:"comic",
      },
      });
    }
    else if(this.category=="writing"){
      const dialogRef = this.dialog.open(PopupEditCoverComponent, {
        data: {
        writing_id:  (this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id,
        title: this.title,
        style:this.style, 
        firsttag:this.firsttag,
        author_name: this.user_name,
        primary_description: this.primary_description, 
        profile_picture: this.profile_picture,
        thumbnail_picture:this.thumbnail_picture,
        category:"writing"
      },
      }); 
    }
    
  }


  loading_report=false;
  report(){
    if(this.loading_report){
      return
    }
    this.loading_report=true;
    if(this.category=="comic"){
      this.Reports_service.check_if_content_reported('comic',(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id,this.format,0).subscribe(r=>{
        if(r[0].nothing){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          const dialogRef = this.dialog.open(PopupReportComponent, {
            data: {from_account:false,id_receiver:this.author_id,publication_category:'comic',publication_id:(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id,format:this.format,chapter_number:0},
          });
        }
      })
    }
    else if(this.category=="drawing"){
      this.Reports_service.check_if_content_reported('drawing',(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id,this.format,0).subscribe(r=>{
        if(r[0].nothing){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          const dialogRef = this.dialog.open(PopupReportComponent, {
            data: {from_account:false,id_receiver:this.author_id,publication_category:'drawing',publication_id:(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id,format:this.format,chapter_number:0},
          });
        }
      })
    }
    else{
      this.Reports_service.check_if_content_reported('writing',(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id,"unknown",0).subscribe(r=>{
        if(r[0].nothing){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          const dialogRef = this.dialog.open(PopupReportComponent, {
            data: {from_account:false,id_receiver:this.author_id,publication_category:'writing',publication_id:(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id,format:"unknown",chapter_number:0},
          });
        }
      })
    }
    
    
  }

  cancel_report(){

    let id=0;
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id
    }
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id
    }
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id
    }
    this.Reports_service.cancel_report(this.category,id,this.format).subscribe(r=>{
      if(this.list_of_reporters && this.list_of_reporters.indexOf(this.user_id)>=0){
        let i=this.list_of_reporters.indexOf(this.user_id)
        this.list_of_reporters.splice(i,1)
        this.cd.detectChanges()
      }
    })
  }

  see_reported_content(){
    this.display_evenif_reported=true;
    this.cd.detectChanges();
  }

  open_popup(event){
    
    let id=0;
    event.preventDefault();
    if(this.category=="comic"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id
    }
    else if(this.category=="drawing"){
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.drawing_id
    }
    else{
      id=(this.type_of_thumbnail==0)?this.item.publication_id:this.item.writing_id
    }

    if(this.in_artwork){
      this.router.navigate([this.get_artwork()]);
    }
    else{
       
      if (event.ctrlKey) {
        return this.router.navigate([this.get_artwork()]);
      }
      this.dialog.open(PopupArtworkComponent, {
        data: {
          format_input:this.format,
          id_input:id,
          title_input:this.title,
          category:this.category,
        }, 
        panelClass:"popupArtworkClass",
      });
     
    }
  }
}
