import { Component, OnInit, ViewChild,  ViewContainerRef, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, Output, EventEmitter, Input, HostListener } from '@angular/core';

import { BdSerieService } from '../services/comics_serie.service';
import { Bd_CoverService } from '../services/comics_cover.service';
import { UploaderBdSerieComponent } from '../uploader-bd-serie/uploader-bd-serie.component';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { NavbarService } from '../services/navbar.service';
import { takeUntil,first } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare var Swiper: any;
declare var $: any;

@Component({
  selector: 'app-swiper-upload-serie',
  templateUrl: './swiper-upload-serie.component.html',
  styleUrls: ['./swiper-upload-serie.component.scss'],
  providers:[BdSerieService],
  entryComponents: [UploaderBdSerieComponent]
})
export class SwiperUploadSerieComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }



  constructor(private rd: Renderer2, 
    

    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private BdSerieService:BdSerieService,
    private Bd_CoverService:Bd_CoverService,
    public dialog: MatDialog,
    private navbar: NavbarService,

    ) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }

  @Input() disabled: boolean;
  @Input() old_chapter:any;
  @Input() type: string;
  @Input() chapter: number;
  @Input() name: string;
  @Input() bdtitle: string;
  @Input() style:string;

  
  @Output() update_old_chapter_pages = new EventEmitter<number>();
  @Output() validated = new EventEmitter<any>();
  validated_chapter: boolean = false;
  @Input() bd_id:number;
  
  
  f00: FormGroup;
  f01ChapterName: FormControl;


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

  

  show_icon=false;
  ngOnInit() {
    
    this.createFormControls00();
    this.createForm00();

  }

  list_of_pages_by_chapter=[];
  ngAfterViewInit(){
    this.initialize_swiper();
    this.initialize_swiper_controller();
    this.cd.detectChanges;
    if(this.old_chapter){
      for( let k=0; k< this.old_chapter.pagesnumber; k++ ) {
        this.createComponentWithoutImage(k,"add");
        this.BdSerieService.retrieve_bd_page(this.old_chapter.bd_id,this.old_chapter.chapter_number,k,window.innerWidth).pipe(first() ).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
         
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_pages_by_chapter[k]=SafeURL;
          this.createComponentWithImage(k,SafeURL);
          this.refresh_swiper_pagination();
          this.cd.detectChanges();
        });
      };
    }

   

  }

  

  initialize_swiper_controller() {

    let THIS=this;
    this.swiperThumbnails = new Swiper( this.swiperController.nativeElement , {
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      speed: 500,
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
      },
      observer:true,
      on:{
        
        slideChange: function () {
          THIS.cd.detectChanges();
          THIS.swiper.slideTo(THIS.swiperThumbnails.activeIndex)
        },
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
      speed: 500,
      allowTouchMove:false,
      observer: true,
      on: {
        observerUpdate: function () {
          window.dispatchEvent(new Event("resize"));
        },
        slideChange: function () {
          THIS.refresh_swiper_pagination();
          THIS.cd.detectChanges();
          THIS.swiperThumbnails.slideTo(THIS.swiper.activeIndex)
        },
      }
    });


    this.swiper.update();

    this.refresh_swiper_pagination();
    $(".serie-upload-container .options-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSwiperSlide( $(".serie-upload-container .options-container .pages-controller-container input").val() );
        THIS.setSwiperThumbnailsSlide( $(".serie-upload-container .options-container .pages-controller-container input").val() );
      }
    });
    
    this.cd.detectChanges();

    if(!this.old_chapter) {
      this.add_page();
    }
    
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
  



  refresh_swiper_pagination() {
    $(".serie-upload-container .options-container .pages-controller-container input").val( this.swiper.activeIndex + 1 );
    $(".serie-upload-container .options-container .pages-controller-container .total-pages").html( "/ " + this.swiper.slides.length );
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
    this.old_page_in_edition=false;
    this.component_remove_in_progress=false;
  }


  add_page() {
    (async () => { 

      if(this.old_page_in_edition){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez finaliser ou annuler l'édition de la page ajoutée."},
          panelClass: "popupConfirmationClass",
        });
        return
      }
      if( this.component_creation_in_progress ) {
          return;
      }
      else if(this.componentRef.length==50){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Vous ne pouvez pas ajouter plus de 50 pages"},
          panelClass: "popupConfirmationClass",
        });
      }
      else {
        this.component_creation_in_progress=true;
        if(this.old_chapter){
          this.createComponentWithoutImage(this.swiper.slides.length,"edit")
        }
        else{
          this.createComponent( );
        }
       

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

  old_page_in_edition=false;
  list_of_pages_not_to_remove=[];
  createComponentWithoutImage(page,mode) {
    const factory = this.resolver.resolveComponentFactory(UploaderBdSerieComponent);
    this.componentRef[page]= this.entry.createComponent(factory) ;
    this.list_of_pages_not_to_remove[page]=true;
    this.rd.addClass( this.componentRef[page].location.nativeElement, "swiper-slide" );
    this.swiper.update();
  
    this.componentRef[ page ].instance.bd_id = this.bd_id;
    this.componentRef[ page ].instance.page = page;
    this.componentRef[ page ].instance.chapter = this.chapter;
    this.componentRef[ page ].instance.style = this.style;
    this.componentRef[ page ].instance.old_chapter = true;
    this.componentRef[ page ].instance.editImageOldChapter.pipe(takeUntil(this.ngUnsubscribe)).subscribe( v => {

      if(v.type=="edit"){
        this.BdSerieService.update_chapter_pages_number(this.bd_id,this.componentRef.length, this.chapter).pipe(first()).subscribe(r=>{
          this.update_old_chapter_pages.emit(this.componentRef.length);
          this.list_of_pages_by_chapter[page]=v.image;
          this.list_of_pages_not_to_remove[page]=true;
          this.old_page_in_edition=false;
        })
       
      }
    })

    if(mode=="edit"){
      this.old_page_in_edition=true;
      this.list_of_pages_not_to_remove[page]=false;
      this.componentRef[ page ].instance.edition_mode_from_swiper=true;

      this.swiper.slideTo(this.swiper.slides.length-1,false,false)
    }

    
    this.cd.detectChanges();
  }

  createComponentWithImage(page,image) {
    this.componentRef[ page].instance.set_image_to_show = image;
    this.cd.detectChanges();
    this.swiper.slideTo(0,false,false)
  }

  createComponent() {
    const factory = this.resolver.resolveComponentFactory(UploaderBdSerieComponent);
    this.componentRef.push( this.entry.createComponent(factory) );

    this.rd.addClass( this.componentRef[ this.componentRef.length - 1 ].location.nativeElement, "swiper-slide" );
    this.swiper.update();
    this.componentRef[ this.componentRef.length - 1 ].instance.bd_id = this.bd_id;
    this.componentRef[ this.componentRef.length - 1 ].instance.page = this.swiper.slides.length - 1;
    this.componentRef[ this.componentRef.length - 1 ].instance.chapter = this.chapter;
    this.componentRef[ this.componentRef.length - 1 ].instance.style = this.style;
    this.cd.detectChanges();
  }

  event_removed_page() {
    for( var k = 0; k< this.componentRef.length; k++) {
      this.componentRef[k].instance.page = k ;
    }
  }



  
  createFormControls00() {
    this.f01ChapterName = new FormControl('', Validators.required);
  }
  createForm00() {
    this.f00 = new FormGroup({
      f01ChapterName: this.f01ChapterName
    });
  }



  @ViewChild('validateButton', { read: ElementRef }) validateButton:ElementRef;
  display_loading=false;

  number_of_page_uploaded=0;
  number_of_reload=[0];
  popup_error_oppened=false;

  endOldChapter(){
    this.validated.emit();
  }

  validateAll() {

   
    this.number_of_reload=[0];
    this.validateButton.nativeElement.disabled = true;

    if( !this.validated_chapter ) {
      
      let errorMsg : string = "La ou les pages suivantes n'ont pas été téléchargées : "
      let valid : boolean = true;

      for (let step = 0; step < this.componentRef.length; step++) {
        if( this.componentRef[step].instance.uploader.queue.length == 0 ) {
          errorMsg = errorMsg + (step+1) + ", ";
          valid = false;
        }
      this.validateButton.nativeElement.disabled = false;
      }

      if(!valid) {
        errorMsg = errorMsg + "merci de les télécharger ou de supprimer ces pages";
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:errorMsg},
          panelClass: "popupConfirmationClass",
        });
        this.validateButton.nativeElement.disabled = false;
      }
      else {
        this.display_loading=true;
        for (let step = 0; step < this.componentRef.length; step++) {
          this.componentRef[ step ].instance.total_pages = this.componentRef.length;
          this.componentRef[ step ].instance.upload = true;
          this.number_of_reload[step+1]=0
          
          
          this.componentRef[ step ].instance.sendImageUploaded.pipe(takeUntil(this.ngUnsubscribe)).subscribe( v => {
            this.navbar.add_page_visited_to_history(`/onComplete_swiper_bd_serie`,(v.file._file.size/1024/1024).toString()).pipe( first() ).subscribe();
            if(v.file.isSuccess  && v.file._file && v.file._file.size/1024/1024!=0){
              this.number_of_reload[step+1]=0;
              this.number_of_page_uploaded+=1;
              this.cd.detectChanges();
            }
            else{
              let index = this.number_of_reload.findIndex(item=>item>10);
              if( index>=0){
                if( this.popup_error_oppened){
                  return
                }
                this.popup_error_oppened=true;
                const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                  data: {showChoice:false, text:"Erreur de connexion internet, veuillez réitérer le processus."},
                  panelClass: "popupConfirmationClass",
                });
                this.display_loading=false;
              }
              else{
                let reload_interval = setInterval(() => {
                  this.componentRef[ step ].instance.upload = true;
                  this.cd.detectChanges();
                  this.number_of_reload[v.page]+=1;
                  clearInterval(reload_interval)
                }, 500);
              }
             
              
            }
          
            if(this.number_of_page_uploaded==this.componentRef.length){
              this.display_loading=false;
              this.validated_chapter=true;
              this.BdSerieService.validate_bd_chapter(this.bd_id,this.componentRef.length, this.chapter).pipe(first()).subscribe(r=>{
                this.validated.emit();
              })
            }
  
          });
          
         
        }
        
       
      }

    }

  }
  

  cancel_all() {
    if (this.chapter==0 && !this.old_chapter) {
      this.BdSerieService.RemoveBdSerie(this.bd_id).pipe( first()).subscribe(res=>{
        this.Bd_CoverService.remove_cover_from_folder().pipe( first()).subscribe(r=>{
        })
      }); 
    }
  }


  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
