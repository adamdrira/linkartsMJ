import { Component, OnInit, Input, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';

import { SafeUrl } from '@angular/platform-browser';
import { UploadService } from '../services/upload.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { UploaderArtbookComponent } from '../uploader-artbook/uploader-artbook.component';
import { Drawings_CoverService } from '../services/drawings_cover.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { first } from 'rxjs/operators';


import { get_color_code } from '../helpers/drawings-colors';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


declare var $:any;
declare var Swiper:any;
declare var Cropper;

@Component({
  selector: 'app-swiper-upload-artbook',
  templateUrl: './swiper-upload-artbook.component.html',
  styleUrls: ['./swiper-upload-artbook.component.scss'],
  entryComponents: [UploaderArtbookComponent]
})
export class SwiperUploadArtbookComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }


  constructor(private rd: Renderer2, 
    private el: ElementRef,
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private viewref: ViewContainerRef,
    private bdOneShotService: BdOneShotService,
    private Drawings_CoverService:Drawings_CoverService,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    public dialog: MatDialog,

    ) {

  }

  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('pseudo') pseudo:string;
  @Input('profile_picture') profile_picture:SafeUrl;

  @Input() name: string;
  @Input() description: string;
  @Input() category: string;
  @Input() format: string;
  @Input() tags: string[];


  listOfColors = ["Bleu","Noir","Vert","Jaune","Rouge","Violet","Marron","Orange","Gris"];


  @ViewChild('swiperContainer', { static : false }) swiperContainer: ElementRef;
  @ViewChild('swiperController', { static : false }) swiperController: ElementRef;

  @ViewChild('targetUpload', { read: ViewContainerRef }) entry: ViewContainerRef;
  component_creation_in_progress: boolean = false;
  component_remove_in_progress: boolean = false;
  componentRef: any[] = [];
  swiper:any;
  swiperThumbnails:any;
  

  @ViewChild('thumbnailDrawing', {static: false }) thumbnailDrawing:ElementRef;

  @ViewChild("thumbnail", {static:false}) thumbnail: ElementRef;

  @ViewChild("image") set imageElement(content: ElementRef) {
    if( this.image_uploaded ) {
      this.imageElementref = content;
      this.initialize_cropper(content);
    }
  }
  imageElementref:ElementRef;

  showDrawingDetails:boolean = false;

  color:string;
  displayErrors: boolean = false;
  image_uploaded: boolean = false;
  imageSource: SafeUrl = "";
  imageDestination: string = '';
  cropper: any;
  cropperInitialized: boolean = false;
  confirmation:boolean=false;
  
  
  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.cd.detectChanges;
    this.initialize_swiper();
    this.initialize_swiper_controller();
  }
  

  showDetails() {
    this.showDrawingDetails=true;
  }

  hideDetails() {
    this.showDrawingDetails=false;
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
        580: {
          slidesPerView: 1,
        },
        700: {
            slidesPerView: 2,
        },
        900: {
            slidesPerView: 3,
        },
        1400: {
            slidesPerView: 4,
        },
        1700: {
            slidesPerView: 5,
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
    $(".artbook-upload-container .options-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSwiperSlide( $(".artbook-upload-container .options-container .pages-controller-container input").val() );
        THIS.setSwiperThumbnailsSlide( $(".artbook-upload-container .options-container .pages-controller-container input").val() );
      }
    });
    
    this.cd.detectChanges();
    this.add_page();
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
    $(".artbook-upload-container .options-container .pages-controller-container input").val( this.swiper.activeIndex + 1 );
    $(".artbook-upload-container .options-container .pages-controller-container .total-pages").html( "/ " + this.swiper.slides.length );
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
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


  createComponent() {

    let THIS = this;

    //Creating new component
    const factory = this.resolver.resolveComponentFactory(UploaderArtbookComponent);
    this.componentRef.push( this.entry.createComponent(factory) );

    this.rd.addClass( this.componentRef[ this.componentRef.length - 1 ].location.nativeElement, "swiper-slide" );
    this.swiper.update();
    this.componentRef[ this.componentRef.length - 1 ].instance.page = this.swiper.slides.length - 1;
    this.componentRef[ this.componentRef.length - 1 ].instance.title = this.name;

    this.componentRef[ this.componentRef.length - 1 ].instance.sendPicture.subscribe( v => {
      if( v.page == 0 && !v.removing && !v.changePage ) {

        THIS.image_uploaded = true;
        THIS.imageSource = v.image;
        THIS.imageDestination = '';
      }
      else if( v.page == 0 && !v.removing && v.changePage ) {
        
        if( v.image ) {
          THIS.image_uploaded = true;
          THIS.imageSource = v.image;
          THIS.imageDestination = '';
          THIS.cropper.destroy();
          THIS.cd.detectChanges();

          this.cropperInitialized = false;
          THIS.initialize_cropper( THIS.imageElementref );
          
        }
        else {
          this.cropperInitialized = false;
          THIS.image_uploaded = false;
          THIS.imageDestination = '';
        }
        
      }
      else if( v.page == 0 && v.removing ) {
        this.cropperInitialized = false;
        THIS.image_uploaded = false;
      }
    });

  }

  event_removed_page() {
    for( var k = 0; k< this.componentRef.length; k++) {
      this.componentRef[k].instance.page = k ;
    }
  }



  onColorChange(e:any) {
    
    this.color = e.value;
    this.Drawings_Artbook_Service.update_filter(this.color).subscribe();
    this.set_color();
  }
  
  
  set_color() {
    if( this.thumbnail ) {
      this.rd.setStyle( this.thumbnail.nativeElement, "background", get_color_code( this.color ));
    }
  }




  initialize_cropper(content: ElementRef) {
    
    if( !this.cropperInitialized ) {
      this.cropper = new Cropper(content.nativeElement, {
        zoomable: false,
        scalable: false,
        guides: false,
        viewMode: 1,
        responsive: true,
        movable: false,
        cropmove:'mousemove',
      });
      this.cropperInitialized = true;
    }
  }


  set_crop() {

    const canvas = this.cropper.getCroppedCanvas();

    if( ((canvas.height / canvas.width) < (180/300)) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"La miniature n'est pas assez haute. Veuillez augmenter la hauteur, ou réduire la largeur"},
      });
      return;
    }
    else if( ((canvas.height / canvas.width) > (600/300)) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"La miniature n'est pas assez large. Veuillez augmenter la largeur, ou réduire la hauteur"},
      });
      return;
    }
    
    canvas.toBlob(blob => {
      this.Drawings_CoverService.send_cover_todata(blob).subscribe(res=>{
        console.log(res);
        this.confirmation = true;
      })
    }, "image/png");
    this.imageDestination = canvas.toDataURL("image/png");


    this.cd.detectChanges();
    this.set_color();
    this.cd.detectChanges();
    
    let el = document.getElementById("target3");
    var topOfElement = el.offsetTop - 200;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

  cancel_crop(){

    if( !this.imageDestination ) {
      return;
    }
    this.Drawings_CoverService.remove_cover_from_folder().pipe(first()).subscribe();
    this.imageDestination='';
    this.confirmation = false;
  }




  validateAll() {
    


    let errorMsg : string = "La ou les pages suivantes n'ont pas été téléchargées : "
    let valid : boolean = true;

    for (let step = 0; step < this.componentRef.length; step++) {
      if( this.componentRef[step].instance.uploader.queue.length == 0 ) {
        errorMsg = errorMsg + (step+1) + ", ";
        valid = false;
      }
    }

    if(!valid) {
      errorMsg = errorMsg + "merci de les télécharger ou de supprimer ces pages";
      this.displayErrors = true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg},
      });

    }
    else if( !this.confirmation ) {
      errorMsg = "Merci d'éditer la vignette";
      this.displayErrors = true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg},
      });
    }
    else if( !this.color ) {
      this.displayErrors = true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"La couleur du filtre n'a pas été sélectionnée"},
      });
    }
    
    else {
      this.Drawings_CoverService.add_covername_to_sql(this.format).subscribe();
      for (let step = 0; step < this.componentRef.length; step++) {
        this.componentRef[ step ].instance.upload = true;
        this.componentRef[ step ].instance.total_pages = this.componentRef.length;
      }
    }


  }

  cancel_all() {
    this.Drawings_Artbook_Service.RemoveDrawingArtbook(0).pipe(first()).subscribe(res=>{
      this.Drawings_CoverService.remove_cover_from_folder().pipe(first()).subscribe()
      console.log(res)
    });  
  }

  uploaded_image( event1: boolean) {
    this.image_uploaded = event1;

    if(event1 == false) {
      this.imageSource="";
      this.imageDestination="";
    }
  }

  get_image( event2: SafeUrl) {
    this.imageSource = event2;
  }




  

}
