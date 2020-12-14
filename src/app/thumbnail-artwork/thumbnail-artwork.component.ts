import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, ChangeDetectorRef, ViewChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Writing_Upload_Service } from '../services/writing.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {Subscribing_service} from '../services/subscribing.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import {get_date_to_show} from '../helpers/dates';
import {Reports_service} from '../services/reports.service';
import {NotationService} from '../services/notation.service';
import { Router  } from '@angular/router';

import { interval, Subscription } from 'rxjs';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { PopupEditCoverComicComponent } from '../popup-edit-cover-comic/popup-edit-cover-comic.component';
import { PopupEditCoverWritingComponent } from '../popup-edit-cover-writing/popup-edit-cover-writing.component';
import { PopupEditCoverDrawingComponent } from '../popup-edit-cover-drawing/popup-edit-cover-drawing.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { PopupReportComponent } from '../popup-report/popup-report.component';
import { PopupEditCoverComponent } from '../popup-edit-cover/popup-edit-cover.component';

import {number_in_k_or_m} from '../helpers/fonctions_calculs';

declare var Swiper:any;

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
    private Profile_Edition_Service:Profile_Edition_Service,
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private NotationService:NotationService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private router:Router,
    public dialog: MatDialog,
    private rd:Renderer2,
    private Reports_service:Reports_service,
    private cd:ChangeDetectorRef,

    ) { }


  @ViewChild('image') image:ElementRef;
  @ViewChild('image2') image2:ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( this.image ) {
      

      if(this.list_of_images_to_show_retrieved){
        let width2 = this.image2.nativeElement.width;
        let height2 = this.image2.nativeElement.height;
        if( window.innerWidth<=700 && this.category!="drawing" ) {
          this.rd.setStyle(this.swiperThumbnails.nativeElement, 'height', width2*(32/24)+'px');
          this.rd.setStyle(this.swiperThumbnails.nativeElement, 'width', '100%');
        }
        else if( window.innerWidth<=700 && this.category=="drawing" ) {
          this.rd.setStyle(this.swiperThumbnails.nativeElement, 'height', height2+'px');
          this.rd.setStyle(this.swiperThumbnails.nativeElement, 'width', '100%');
        }
      }
    
      

      
    }
  }

  @Input() item: any;
  @Input() page: any;
  @Input() rank: any;
  @Input() now_in_seconds: number;

  @Input() subscribing_category: any;
  @Input() subscribing_format: any;


  type_of_account:string;
  type_of_account_checked:boolean;
  certified_account:boolean;  

  display_evenif_reported=false;
  data_retrieved=false;
  pdfSrc:SafeUrl;
  total_pages_for_writing:number;
  profile_picture:SafeUrl;
  author_name:string;
  primary_description:string;
  pseudo:string='';
  type_of_profile:string;
  author_id:number;
  /*Inputs*/
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
  thumbnail_picture:SafeUrl;
  thumbnail_picture_received=false;

  thumbnail_is_loaded=false;
  pp_is_loaded=false;
  user_id:number;
  visitor_mode=false;
  user_name:string;
  visitor_mode_retrieved=false;
  type_of_thumbnail:number // 0 pour emphasized et 1 pour trendings et subscribtions
  report_done=false;
  ngOnInit(): void {

    if(!(typeof(this.subscribing_category)=='string')){
      this.type_of_thumbnail=0;
      this.category=this.item.publication_category;
      this.format=this.item.format;

      this.Profile_Edition_Service.get_current_user().subscribe(r=>{
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
        this.profile_picture = SafeURL;
      });

      this.Profile_Edition_Service.retrieve_profile_data(this.item.id_user).subscribe(r=> {
        this.author_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
        this.pseudo = r[0].nickname;
        this.author_id=r[0].id;
        
        this.type_of_account_checked=r[0].type_of_account_checked;
        this.certified_account=r[0].certified_account;
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
            this.NotationService.get_content_marks("comic", 'one-shot', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
            this.check_archive()
            this.get_images_to_show();
            
           

            this.BdOneShotService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;

              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
            
            });

          });
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
            this.NotationService.get_content_marks("comic", 'serie', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
            this.check_archive()
            this.get_images_to_show();
           

            this.BdSerieService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;

              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
            });

          });

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
            this.NotationService.get_content_marks("drawing", 'one-shot', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
            this.check_archive()
            this.get_images_to_show();
            

            this.Drawings_Onepage_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;

              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
            });

          });
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
            this.NotationService.get_content_marks("drawing", 'artbook', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
            this.check_archive()
            this.get_images_to_show();
           

            this.Drawings_Artbook_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
              
              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
            });

          });

        }
      }

      if(this.category=="writing"){

          this.Writing_Upload_Service.retrieve_writing_information_by_id(this.item.publication_id).subscribe(r=>{
            //console.log(r[0])
            this.file_name = r[0].name_coverpage
            this.title = r[0].title
            this.style = r[0].category
            this.highlight = r[0].highlight.slice(0,290)
            this.total_pages_for_writing=r[0].total_pages;
            //console.log(this.total_pages_for_writing)
            this.short_highlight = this.highlight.slice(0,70);
            this.list_of_reporters=r[0].list_of_reporters
            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt
            this.data_retrieved=true;
            this.NotationService.get_content_marks("writing", 'unknown', this.item.publication_id,0).subscribe(r=>{
              //marks
              this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
              this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
              this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
              this.marks_retrieved=true;
            })
            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );
            this.check_archive()

            

            this.Writing_Upload_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
              
              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
            });

          });
      }
    }
    else{
      this.type_of_thumbnail=1;
      this.category=this.subscribing_category;
      this.format=this.subscribing_format;
      this.Profile_Edition_Service.get_current_user().subscribe(r=>{
        this.user_id=r[0].id;
        this.user_name=r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
        this.pseudo = r[0].nickname;
        this.type_of_profile=r[0].status;
        if(r[0].id==this.item.authorid){
          
          //console.log(this.user_id)
          this.visitor_mode=false;
          
        }
        else{
          this.visitor_mode=true;
        }
        this.visitor_mode_retrieved=true;
      })
      this.Profile_Edition_Service.retrieve_profile_picture( this.item.authorid).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.Profile_Edition_Service.retrieve_profile_data(this.item.authorid).subscribe(r=> {
        this.author_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
        this.pseudo = r[0].nickname;
        this.author_id=r[0].id;
        
        this.type_of_account_checked=r[0].type_of_account_checked;
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
            
            this.BdOneShotService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
              
              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
              
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
            
            this.BdSerieService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
              
              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
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
            

            this.Drawings_Onepage_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
              
              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
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

            
            this.Drawings_Artbook_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
              
              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
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
            

            
            this.Writing_Upload_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
              
              this.initialize_swiper();
              window.dispatchEvent(new Event('resize'));
            });
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
  };

  load_pp(){
    this.pp_is_loaded=true;
  };

  get_artwork() {
    if(this.subscribing_category=='comic') {
      return "/artwork-comic/"+this.subscribing_format+"/"+this.title+"/"+this.content_id;
    }
    else if(this.subscribing_category=='drawing') {
      return "/artwork-drawing/"+this.subscribing_format+"/"+this.title+"/"+this.content_id;
    }
    else {
      return "/artwork-"+this.subscribing_category+"/"+this.title+"/"+this.content_id;
    }
  };
  open_account() {
    return "/account/"+this.pseudo+"/"+this.item.authorid;
    //this.router.navigate([`/account/${this.pseudo}/${this.item.id_user}`]);
  };
  get_link() {
    return "/main-research-style-and-tag/1/Comic/"+this.style+"/all";
  };
  get_link_tags(s) {
    return "/main-research-style-and-tag/1/Comic/"+this.style+"/" + s ;
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
  swiper2:any;
  @ViewChild("swiperArtworkPreview") swiperArtworkPreview:ElementRef;
  @ViewChild("swiperThumbnails") swiperThumbnails:ElementRef;
  swiper2_initialized=false;
  swiper_initialized=false;
  initialize_swiper() {
    //console.log("swiper initialized " + this.item.bd_id + ' ' + this.item.chaptersnumber )
    let THIS = this;


    this.cd.detectChanges();
    //console.log(this.swiperArtworkPreview )
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
      //console.log("swiper initialized for " + this.item.bd_id + ' ' + this.item.chaptersnumber)
    };

    if( this.subscribing_category!='writing' && this.swiperThumbnails && !this.swiper2_initialized ) {
      
      this.swiper2 = new Swiper( this.swiperThumbnails.nativeElement, {
        speed: 500,
        initialSlide:0,
        slidesPerView:1,
        navigation: {
          nextEl: '.swiper--button-next',
          prevEl: '.swiper--button-prev',
        },
        pagination: {
          el: '.thumbnail-artwork-pagination',
          type: 'bullets'
        },
        simulateTouch:true,
        observer:true,
        

      })
      this.swiper2_initialized=true;
    };

    if( this.subscribing_category=='writing' && this.swiperThumbnails && !this.swiper2_initialized ) {
      this.swiper2 = new Swiper( this.swiperThumbnails.nativeElement, {
        speed: 500,
        initialSlide:0,
        slidesPerView:1,
        navigation: {
          nextEl: '.swiper--button-next',
          prevEl: '.swiper--button-prev',
        },
        pagination: {
          el: '.thumbnail-artwork-pagination',
          type: 'bullets'
        },
        simulateTouch:true,
        observer:true,
        on: {
          slideChange: function () {
            THIS.load_pdf();
          },
        },
      })
      this.swiper2_initialized=true;
    }

    return;
  };


  timeout = interval(2000);
  subscription: Subscription;
  swiper_launched=false;
  launch_swiper() {
    //console.log("launch swipr " + this.item.bd_id + ' ' + this.item.chaptersnumber )
    if(!this.list_of_images_to_show_retrieved || !this.swiperArtworkPreview){
      return;
    }
    if(this.swiperArtworkPreview && !this.swiper_initialized){
      this.initialize_swiper();
    }
    //console.log(this.swiperArtworkPreview )
    this.swiper.slideTo(0);
    let THIS = this;
    this.subscription = this.timeout.subscribe( val => {
      if( this.swiper.isEnd ) {
        this.swiper.slideTo(0);
      }
      else {
        this.swiper.slideNext();
      }
    });
    this.swiper_launched=true;
    //console.log("swiper launched " + this.item.bd_id + ' ' + this.item.chaptersnumber )
  };
  stop_swiper() {
    //console.log("stop swiper " + this.item.bd_id + ' ' + this.item.chaptersnumber )
    if(this.list_of_images_to_show_retrieved && this.swiper_launched){
      this.subscription.unsubscribe();
      this.swiper.slideTo(0);
    }
  
  };

  

  show_absolute_cover=true;
  load_pdf() {
    this.show_absolute_cover = false;
    if( !this.pdfSrc ) {
      this.Writing_Upload_Service.retrieve_writing_by_name(this.item.file_name).subscribe(r=>{
        let file = new Blob([r], {type: 'application/pdf'});
        this.pdfSrc = URL.createObjectURL(file);
      });
    }
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

  /******************************************** SHOW IMAGES PREVIEW  *******************************************/
  /******************************************** SHOW IMAGES PREVIEW   *******************************************/
  /******************************************** SHOW IMAGES PREVIEW   *******************************************/

  loaded_images:any[]=[];
  list_of_images_to_show_mobile=[0]
  list_of_images_to_show=[];
  list_of_images_to_show_retrieved=false;
  recent_chapter=false;
  loaded_images_mobile=[]
  load_image(i){
    this.loaded_images[i]=true;
  }
  load_image_mobile(i){
    this.loaded_images_mobile[i]=true;
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
          //console.log(s[0])
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
            this.BdSerieService.retrieve_bd_page(bd_id,1,k).subscribe(r=>{
              let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
              let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_images_to_show[r[1]]=SafeURL;
              compteur++;
              if(compteur==total_pages){
                //this.list_of_images_to_show_mobile=[0].concat( this.list_of_images_to_show)
                this.list_of_images_to_show_retrieved=true;
                this.cd.detectChanges();
                //console.log(this.list_of_images_to_show)
                //console.log("list_of_images_to_show_retrieved" + bd_id + ' serie')
                this.initialize_swiper();
                window.dispatchEvent(new Event('resize'));
               
              }
            });
          };
        })
      }

      else{
        
        let compteur=0;
        let total_pages=(this.pagesnumber<=3)?this.pagesnumber:3;
        for( let k=0; k< total_pages; k++ ) {
          this.BdOneShotService.retrieve_bd_page(bd_id,k).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
            let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_images_to_show[r[1]]=SafeURL;
            compteur++;
            if(compteur==total_pages){
              //this.list_of_images_to_show_mobile=[0].concat( this.list_of_images_to_show)
              this.list_of_images_to_show_retrieved=true;
              this.cd.detectChanges();
              //console.log(this.list_of_images_to_show)
              //console.log("list_of_images_to_show_retrieved" + bd_id + ' one shot')
                this.initialize_swiper();
                window.dispatchEvent(new Event('resize'));
             
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
          this.Drawings_Artbook_Service.retrieve_drawing_page_ofartbook(drawing_id,i).subscribe(r=>{
            let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
            let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_images_to_show[r[1]]=SafeURL;
            compteur++;
            if(compteur==total_pages){
              this.list_of_images_to_show_mobile=[0].concat( this.list_of_images_to_show)
              this.list_of_images_to_show_retrieved=true;
              this.cd.detectChanges();
                this.initialize_swiper();
                window.dispatchEvent(new Event('resize'));
              //console.log("list_of_images_to_show_retrieved" + drawing_id)
              //console.log(this.list_of_images_to_show)
            }
          });
        };
      }
      else{
        this.Drawings_Onepage_Service.retrieve_drawing_page(this.drawing_name).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_images_to_show[0]=SafeURL;
          this.list_of_images_to_show_mobile=[0].concat( this.list_of_images_to_show)
          this.list_of_images_to_show_retrieved=true;
          this.cd.detectChanges();
                this.initialize_swiper();
                window.dispatchEvent(new Event('resize'));
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
      //console.log(r[0]);
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

  edit_thumbnail() {
    if(this.category=="comic"){

      const dialogRef = this.dialog.open(PopupEditCoverComicComponent, {
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


  report(){
    //console.log("reporting")
    //console.log(this.category)
    //console.log(this.user_id)
    if(this.category=="comic"){
      this.Reports_service.check_if_content_reported('comic',(this.type_of_thumbnail==0)?this.item.publication_id:this.item.bd_id,this.format,0).subscribe(r=>{
        //console.log(r[0])
        if(r[0]){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
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
        //console.log(r[0])
        if(r[0].nothing){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
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
        //console.log(r[0])
        if(r[0].nothing){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas signaler deux fois la même publication'},
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
      //console.log(r)
      if(this.list_of_reporters && this.list_of_reporters.indexOf(this.user_id)>=0){
        let i=this.list_of_reporters.indexOf(this.user_id)
        this.list_of_reporters.splice(i,1)
        this.cd.detectChanges()
      }
    })
  }

  see_reported_content(){
    //console.log("see reported content")
    this.display_evenif_reported=true;
    this.cd.detectChanges();
  }
}
