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
    private NotationService:NotationService,
    private Emphasize_service:Emphasize_service,
    public dialogRef: MatDialogRef<PopupAdPicturesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
  }


  //Swiper
  swiper: any;
  recommendation_index:number;
  category_index: number = 0;
  list_of_pictures:any[];

  @ViewChild( "swiperContainer" ) swiperContainer:ElementRef;


  /******************************************************* */
  /******************** ON INIT ****************** */
  /******************************************************* */
  ngOnInit() {
    console.log(this.data);
    this.list_of_pictures=this.data.list_of_pictures;

    this.cd.detectChanges();

    if( this.list_of_pictures.length > 1 ) {
      this.initialize_swiper();
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
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
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


