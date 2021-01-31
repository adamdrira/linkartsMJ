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
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



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
    private NotationService:NotationService,
    private Emphasize_service:Emphasize_service,
    public dialogRef: MatDialogRef<PopupAdPicturesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
  }


  //Swiper
  swiper: any;
  swiper2: any;
  recommendation_index:number;
  category_index: number = 0;
  list_of_pictures:any[];

  @ViewChild( "swiperContainer" ) swiperContainer:ElementRef;

  @ViewChild( "swiperContainer2" ) swiperContainer2:ElementRef;


  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {
    console.log(this.data);
    this.list_of_pictures=this.data.list_of_pictures;

    this.cd.detectChanges();

    if( this.list_of_pictures.length > 1 ) {
      this.initialize_swiper();
      this.initialize_swiper2();
    }
  }



  /******************************************************* */
  /******************** AFTER VIEW INIT ****************** */
  /******************************************************* */

  

  ngAfterViewInit() {
  }


  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.close_dialog();
  }

  initialize_swiper() {

    if(!this.swiper) {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        speed: 500,
        spaceBetween: 100,
        grabCursor: false,

        initialSlide:this.data.index_of_picture,

        simulateTouch: true,
        allowTouchMove: true,

        pagination: {
          el: '.swiper-pagination',
        },
        navigation: {
          nextEl: '.swiper-button-next.s1',
          prevEl: '.swiper-button-prev.s1',
        },
        keyboard: {
          enabled: true,
        }
      });
    }

  }

  initialize_swiper2() {

    if(!this.swiper2) {
      this.swiper2 = new Swiper(this.swiperContainer2.nativeElement, {

        speed: 500,
        spaceBetween: 10,
        slidesPerView: 1,

        breakpoints: {
          0: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          310: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          360: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          410: {
            slidesPerView: 5,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          460: {
            slidesPerView: 6,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          510: {
            slidesPerView: 7,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          560: {
            slidesPerView: 8,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          610: {
            slidesPerView: 9,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          660: {
            slidesPerView: 10,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          710: {
            slidesPerView: 11,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          760: {
            slidesPerView: 12,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          810: {
            slidesPerView: 13,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          860: {
            slidesPerView: 14,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          },
          910: {
            slidesPerView: 15,
            slidesPerGroup: 5,
            simulateTouch: false,
            allowTouchMove: false,
            noSwiping: true,
          }
        },
        grabCursor: false,

        initialSlide:this.data.index_of_picture,

        pagination: {
          el: '.swiper-pagination',
        },
        navigation: {
          nextEl: '.swiper-button-next.s2',
          prevEl: '.swiper-button-prev.s2',
        },
        keyboard: {
          enabled: true,
        }
      });
    }

  }

  set_slide(i:number) {

    console.log( this.swiper );
    if( this.swiper ) {
      this.swiper.slideTo(i);
    }
  }

  close_dialog(){
    this.dialogRef.close();
  }



}


