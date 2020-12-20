import { Component, OnInit, ViewChild, ViewChildren, QueryList, ViewContainerRef, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { Bd_CoverService } from '../services/comics_cover.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Uploader_bd_oneshot } from '../uploader_bd_oneshot/uploader_bd_oneshot.component';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';


declare var Swiper: any;
declare var $: any;

@Component({
  selector: 'app-swiper-upload-oneshot',
  templateUrl: './swiper-upload-oneshot.component.html',
  styleUrls: ['./swiper-upload-oneshot.component.scss'],
  providers:[BdOneShotService],
  entryComponents: [Uploader_bd_oneshot]
})
export class SwiperUploadOneshotComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }


  constructor(private rd: Renderer2, 
    private el: ElementRef,
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private router:Router,
    private cd: ChangeDetectorRef,
    private viewref: ViewContainerRef,
    private bdOneShotService: BdOneShotService,
    private Bd_CoverService:Bd_CoverService,
    public dialog: MatDialog,
    private Subscribing_service:Subscribing_service

    ) {

  }

  @ViewChild('validateButton', { read: ElementRef }) validateButton:ElementRef;
  display_loading=false;

  @Input() bd_id: number;
  @Input() type: string;
  @Input() bdtitle: string;
  @ViewChild('swiperContainer', { static : false }) swiperContainer: ElementRef;
  @ViewChild('swiperController', { static : false }) swiperController: ElementRef;

  @ViewChild('targetUpload', { read: ViewContainerRef }) entry: ViewContainerRef;
  component_creation_in_progress: boolean = false;
  component_remove_in_progress: boolean = false;
  componentRef: any[] = [];
  swiper:any;
  swiperThumbnails:any;
  

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {

    this.cd.detectChanges;
    this.initialize_swiper();
    this.initialize_swiper_controller();
  }


  initialize_swiper_controller() {


    this.swiperThumbnails = new Swiper( this.swiperController.nativeElement , {
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween:100,
        },
        580: {
          slidesPerView: 1,
          spaceBetween:100,
        },
        700: {
            slidesPerView: 2,
            spaceBetween:100,
        },
        1000: {
            slidesPerView: 3,
            spaceBetween:100,
        },
        1300: {
            slidesPerView: 2,
            spaceBetween:100,
        },
        1550: {
            slidesPerView: 3,
            spaceBetween:100,
        },
        1875: {
            slidesPerView: 4,
            spaceBetween:100,
        }
      }
    });

    this.swiperThumbnails.update();
  }

  initialize_swiper() {

    var THIS = this;

    this.swiper = new Swiper( this.swiperContainer.nativeElement , {
      fadeEffect: {
        crossFade: true
      },
      keyboard: {
        enabled: true,
      },
      speed: 1000,
      allowTouchMove:false,
      on: {
        slideChange: function () {
          THIS.refresh_swiper_pagination();
        },
      }
    });


    this.swiper.update();

    this.refresh_swiper_pagination();
    $(".oneshot-upload-container .options-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSwiperSlide( $(".oneshot-upload-container .options-container .pages-controller-container input").val() );
        THIS.setSwiperThumbnailsSlide( $(".oneshot-upload-container .options-container .pages-controller-container input").val() );
      }
    });
    
    this.cd.detectChanges();
    this.add_page();
    this.cd.detectChanges();
  }

  
  setSwiperSlide(i : any) {
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
  

  setSwiperThumbnailsSlide(i : any) {
    if( isNaN(i) ) {
      this.refresh_swiper_pagination();
      return;
    }
    else if ( (Number(i)<1) || (Number(i)> this.swiperThumbnails.slides.length) ) {
      this.refresh_swiper_pagination();
      return;
    }
    else {
      this.swiperThumbnails.slideTo( Number(i) - 1 );
    }
  }
  

  empty_swiper() {
    const c = this.swiper.slides.length;
    for( let i = 0; i < c; i ++ ) {
      this.swiper.removeSlide(0);
    }
    this.componentRef.splice(0, this.componentRef.length);
    this.add_page();
  }


  refresh_swiper_pagination() {
    $(".oneshot-upload-container .options-container .pages-controller-container input").val( this.swiper.activeIndex + 1 );
    $(".oneshot-upload-container .options-container .pages-controller-container .total-pages").html( "/ " + this.swiper.slides.length );
  }

  
  remove_page(i: number) {

    const currentIndex = i;
    if( this.swiper.slides.length == 1 || this.component_remove_in_progress ) {
      return;
    }
    else {
      this.component_remove_in_progress=true;
      //Refresh data for other pages
      this.swiper.removeSlide( currentIndex );
      this.componentRef.splice( currentIndex, 1);
      this.refresh_swiper_pagination();
      this.swiper.update();
      this.cd.detectChanges();
    }

    if( this.swiperThumbnails ) {
      this.cd.detectChanges();
      this.swiperThumbnails.update();
    }

    this.cd.detectChanges();
    this.event_removed_page();
    this.cd.detectChanges();
    this.component_remove_in_progress=false;
  }


  add_page() {
    (async () => { 

      if( this.component_creation_in_progress ) {
          return;
      }
      else if(this.componentRef.length==100){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Vous ne pouvez pas ajouter plus de 100 pages"},
          panelClass: 'dialogRefClassText'
        });
      }
      else {
        this.component_creation_in_progress=true;

        this.createComponent( );

        this.refresh_swiper_pagination();
        this.swiper.update();

            
        if( this.swiperThumbnails ) {
          this.cd.detectChanges();
          this.swiperThumbnails.update();
          this.setSwiperThumbnailsSlide( this.swiperThumbnails.slides.length );
        }

        this.setSwiperSlide( this.swiper.slides.length );

      }
    
      await this.delay(750);
      this.component_creation_in_progress=false;
    })();


    if( this.swiperThumbnails ) {
      this.cd.detectChanges();
      this.swiperThumbnails.update();
    }

  }

  createComponent() {

    //Creating new component
    const factory = this.resolver.resolveComponentFactory(Uploader_bd_oneshot);
    this.componentRef.push( this.entry.createComponent(factory) );

    this.rd.addClass( this.componentRef[ this.componentRef.length - 1 ].location.nativeElement, "swiper-slide" );
    this.swiper.update();
    this.componentRef[ this.componentRef.length - 1 ].instance.bd_id = this.bd_id;
    this.componentRef[ this.componentRef.length - 1 ].instance.page = this.swiper.slides.length - 1;
    this.componentRef[ this.componentRef.length - 1 ].instance.bdtitle = this.bdtitle;
  }

  event_removed_page() {
    for( var k = 0; k< this.componentRef.length; k++) {
      this.componentRef[k].instance.page = k ;
    }
  }

  
  validateAll() {


    
    this.validateButton.nativeElement.disabled = true;


    let errorMsg : string = "La ou les pages suivantes n'ont pas été téléchargées : "
    let valid : boolean = true;

    for (let step = 0; step < this.componentRef.length; step++) {
      if( this.componentRef[step].instance.uploader.queue.length == 0 ) {
        errorMsg = errorMsg + (step+1) + ", ";
        valid = false;
      }
    }

    if(!valid) {
      
      this.validateButton.nativeElement.disabled = false;

      errorMsg = errorMsg + "merci de les télécharger ou de supprimer ces pages";
      
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg},
      });

    }
    else {
      
      this.display_loading=true;
      
      for (let step = 0; step < this.componentRef.length; step++) {
        this.componentRef[ step ].instance.upload = true;
        this.componentRef[ step ].instance.total_pages = this.componentRef.length;
        this.componentRef[ step ].instance.sendValidated.subscribe( v => {
          console.log("received validated")
          this.block_cancel=true;
          this.router.navigate([`/account/${v.pseudo}/${v.user_id}`]);
          //window.location.href = `/account/${v.pseudo}/${v.user_id}`;
        });
      }

      
    }

  }


  block_cancel=false;
  cancel_all() {
    if(!this.block_cancel){
      this.bdOneShotService.RemoveBdOneshot(this.bd_id).subscribe(res=>{
        this.Bd_CoverService.remove_cover_from_folder().subscribe(r=>{
          console.log(r)
        })
      });
    }
      
  }

  

}
