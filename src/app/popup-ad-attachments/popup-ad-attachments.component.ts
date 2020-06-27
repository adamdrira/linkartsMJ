import { Component, OnInit, Inject, ChangeDetectorRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, Renderer2, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { Story_service } from '../services/story.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

declare var Swiper:any;
declare var $:any;


@Component({
  selector: 'app-popup-ad-attachments',
  templateUrl: './popup-ad-attachments.component.html',
  styleUrls: ['./popup-ad-attachments.component.scss']
})
export class PopupAdAttachmentsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupAdAttachmentsComponent>,
    private cd:ChangeDetectorRef,
    private resolver: ComponentFactoryResolver, 
    private viewref: ViewContainerRef,
    private rd:Renderer2,
    private location:Location,
    private Story_service:Story_service,
    
  @Inject(MAT_DIALOG_DATA) public data: any) {  }


  @ViewChildren('category') categories:QueryList<ElementRef>;
  @ViewChild('leftContainer') leftContainer:ElementRef;
  @ViewChild('swiperWrapper') swiperWrapperRef:ElementRef;
  @ViewChild('swiperContainer') swiperContainerRef:ElementRef;
  @ViewChildren('swiperSlide') swiperSlides:QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailsRef:QueryList<ElementRef>;

  //Swiper
  swiper: any;

  swiperComics: any;
  swiperDrawings: any;
  swiperWritings: any;

  total_pages:number;
  fullscreen_mode: boolean;

  category_index: number = 0;
  pdfSrc:SafeUrl;
  
  zoom: number = 1.0;
  arrayOne(n: number): any[] {
    return Array(n);
  }


  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {
    console.log(this.data.file);
    let file = new Blob([this.data.file], {type: 'application/pdf'});
    this.pdfSrc = URL.createObjectURL(file);
  }


  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */
  ngAfterViewInit() {
    let THIS = this;
    $(".top-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSlide( $(".top-container .pages-controller-container input").val() );
      }
    });

    
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

    
    this.swiper.update();
    
  }






  afterLoadComplete(pdf: PDFDocumentProxy, i: number) {
    this.total_pages = pdf.numPages;
    this.cd.detectChanges();
    
    if( (i+1) == this.total_pages ) {
      this.initialize_swiper();
      this.refresh_controls_pagination();
    };
    
  }

  

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

  

  

  left_container_category_index: number = 0;
  open_left_container_category(i : number) {
    this.left_container_category_index=i;
  }

  


 




}




