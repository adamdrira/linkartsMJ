import { Component, OnInit, Input, HostListener, ChangeDetectorRef, Inject } from '@angular/core';
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
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PopupFormDrawingComponent } from '../popup-form-drawing/popup-form-drawing.component';
import { PopupEditCoverDrawingComponent } from '../popup-edit-cover-drawing/popup-edit-cover-drawing.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';



declare var Swiper: any;
declare var $: any;


@Component({
  selector: 'app-popup-ad-pictures',
  templateUrl: './popup-ad-pictures.component.html',
  styleUrls: ['./popup-ad-pictures.component.scss']
})
export class PopupAdPicturesComponent implements OnInit {



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
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
    
    this.zoom_mode = false;
    this.fullscreen_mode = false;

  }


  @ViewChildren('category') categories:QueryList<ElementRef>;
  @ViewChild('leftContainer') leftContainer:ElementRef;
  @ViewChild('swiperWrapper') swiperWrapperRef:ElementRef;
  @ViewChild('swiperContainer') swiperContainerRef:ElementRef;
  @ViewChildren('swiperSlide') swiperSlides:QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailsRef:QueryList<ElementRef>;

  //Swiper
  swiper: any;
  //Zoom mode
  zoom_mode: boolean;
  //Fullscreen mode
  fullscreen_mode: boolean;
  recommendation_index:number;
  category_index: number = 0;
  list_of_pictures:any[];








  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {
    console.log(this.data);
    this.list_of_pictures=this.data.list_of_pictures;
    /*for(let i=0; i<this.list_of_pictures.length; i++){
      let url = (window.URL) ? window.URL.createObjectURL(this.list_of_pictures[i]) : (window as any).webkitURL.createObjectURL(this.list_of_pictures[i]);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.list_of_pictures[i] = SafeURL;
    }*/
    console.log(this.list_of_pictures);


  }



  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */

  

  ngAfterViewInit() {
    this.initialize_swiper();

  }


  initialize_swiper() {

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
      this.swiper.slideTo(this.data.index_of_picture,false,false)
      this.refresh_swiper_pagination();
      $(".top-container .pages-controller-container input").keydown(function (e){
        if(e.keyCode == 13){
          THIS.setSlide( $(".top-container .pages-controller-container input").val() );
        }
      });

    
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





}


