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

import {get_date_to_show} from '../helpers/dates';

import { Router  } from '@angular/router';

import { interval, Subscription } from 'rxjs';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';

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

  @ViewChild('image') image:ElementRef;
  @ViewChild('image2') image2:ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( this.image ) {
      let width = this.image.nativeElement.width;

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


  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private router:Router,
    private rd:Renderer2,
    private cd:ChangeDetectorRef,

    ) { }

  @Input() item: any;
  @Input() page: any;
  @Input() rank: any;
  @Input() now_in_seconds: number;

  @Input() subscribing_category: any;
  @Input() subscribing_format: any;


  pdfSrc:SafeUrl;

  profile_picture:SafeUrl;
  author_name:string;
  primary_description:string;
  pseudo:string='';
  /*Inputs*/
  file_name: string;
  title: string;
  style: string;
  highlight: string;

  short_highlight:string;

  content_id:number;
  firsttag: string;
  secondtag: string;
  thirdtag: string;
  pagesnumber: string;
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


  ngOnInit(): void {

    if(!(typeof(this.subscribing_category)=='string')){
      this.category=this.item.publication_category;
      this.format=this.item.format;

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

      if(this.category=="comics"){
        if(this.format=="one-shot"){
          this.BdOneShotService.retrieve_bd_by_id(this.item.publication_id).subscribe(r=>{
            this.file_name = r[0].name_coverpage
            this.title = r[0].title
            this.style = r[0].category
            this.highlight = r[0].highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
            this.highlight = r[0].highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
            this.highlight = r[0].highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
            this.highlight = r[0].highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt
            

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
            this.file_name = r[0].name_coverpage
            this.title = r[0].title
            this.style = r[0].category
            this.highlight = r[0].highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
      this.category=this.subscribing_category;
      this.format=this.subscribing_format;
      this.Profile_Edition_Service.retrieve_profile_picture( this.item.authorid).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.Profile_Edition_Service.retrieve_profile_data(this.item.authorid).subscribe(r=> {
        this.author_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
        this.pseudo = r[0].nickname;
      });

      if(this.category=="comics"){
        if(this.format=="one-shot"){
          this.content_id=this.item.bd_id;
            this.file_name = this.item.name_coverpage
            this.title = this.item.title
            this.style = this.item.category
            this.highlight = this.item.highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
            this.highlight = this.item.highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
            this.highlight = this.item.highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
            this.highlight = this.item.highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = get_date_to_show( this.date_in_seconds() );

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
            this.highlight = this.item.highlight

            this.short_highlight = this.highlight.slice(0,70);

            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

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
  }

  load_thumbnail(){
    this.thumbnail_is_loaded=true;
  }

  load_pp(){
    this.pp_is_loaded=true;
  }

  get_artwork() {
    if(this.subscribing_category=='comics') {
      return "/artwork-comic/"+this.subscribing_format+"/"+this.title+"/"+this.content_id;
    }
    else if(this.subscribing_category=='drawing') {
      return "/artwork-drawing/"+this.subscribing_format+"/"+this.title+"/"+this.content_id;
    }
    else {
      return "/artwork-"+this.subscribing_category+"/"+this.title+"/"+this.content_id;
    }
  }
  open_account() {
    return "/account/"+this.pseudo+"/"+this.item.authorid;
    //this.router.navigate([`/account/${this.pseudo}/${this.item.id_user}`]);
  }
  get_link() {
    return "/main-research-style-and-tag/1/Comic/"+this.style+"/all";
  }
  get_link_tags(s) {
    return "/main-research-style-and-tag/1/Comic/"+this.style+"/" + s ;
  }

  see_more_clicked = false;
  see_more_description(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.see_more_clicked = true;
    this.short_highlight = this.highlight;
  }
  
  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }


  

  swiper:any;
  swiper2:any;
  @ViewChild("swiperArtworkPreview") swiperArtworkPreview:ElementRef;
  @ViewChild("swiperThumbnails") swiperThumbnails:ElementRef;

  initialize_swiper() {

    let THIS = this;
    
    this.cd.detectChanges();
    if( this.subscribing_category!='writing' && this.swiperArtworkPreview ) {
      this.swiper = new Swiper( this.swiperArtworkPreview.nativeElement, {
        speed: 500,
        initialSlide:0,
      })
    }

    if( this.subscribing_category!='writing' && this.swiperThumbnails ) {
      this.swiper2 = new Swiper( this.swiperThumbnails.nativeElement, {
        speed: 500,
        initialSlide:0,
        slidesPerView:1,
      })
    }

    if( this.subscribing_category=='writing' && this.swiperThumbnails ) {
      this.swiper2 = new Swiper( this.swiperThumbnails.nativeElement, {
        speed: 500,
        initialSlide:0,
        slidesPerView:1,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        on: {
          slideChange: function () {
            THIS.load_pdf();
          },
        },
      })
    }
  }


  timeout = interval(1500);
  subscription: Subscription;
  launch_swiper() {
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
  }
  stop_swiper() {
    this.subscription.unsubscribe();
    this.swiper.slideTo(0);
  }

  timeout2 = interval(1500);
  subscription2: Subscription;
  launch_swiper_2() {

    if( this.subscribing_category=='writing' ) {
      return;
    }
    this.swiper2.slideTo(0);
    let THIS = this;
    this.subscription2 = this.timeout2.subscribe( val => {
      if( this.swiper2.isEnd ) {
        this.swiper2.slideTo(0);
      }
      else {
        this.swiper2.slideNext();
      }
    });
  }
  stop_swiper_2() {
    if( this.subscribing_category=='writing' ) {
      return;
    }
    this.subscription2.unsubscribe();
    //this.swiper2.slideTo(0);
  }

  show_absolute_cover=true;
  load_pdf() {
    this.show_absolute_cover = false;
    if( !this.pdfSrc ) {
      this.Writing_Upload_Service.retrieve_writing_by_name(this.item.file_name).subscribe(r=>{
        let file = new Blob([r], {type: 'application/pdf'});
        this.pdfSrc = URL.createObjectURL(file);
      });
    }
  }
  close_pdf() {
    this.show_absolute_cover = true;
  }

}
