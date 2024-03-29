import { Component, Input, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';


import { UploaderArtbookComponent } from '../uploader-artbook/uploader-artbook.component';
import { Drawings_CoverService } from '../services/drawings_cover.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NavbarService } from '../services/navbar.service';
import { takeUntil,first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';


declare var $:any;
declare var Swiper:any;
declare var Cropper;

@Component({
  selector: 'app-swiper-upload-artbook',
  templateUrl: './swiper-upload-artbook.component.html',
  styleUrls: ['./swiper-upload-artbook.component.scss'],
  entryComponents: [UploaderArtbookComponent],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class SwiperUploadArtbookComponent  {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }


  constructor(private rd: Renderer2, 
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private router:Router,
    private sanitizer:DomSanitizer,
    private Drawings_CoverService:Drawings_CoverService,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    public dialog: MatDialog,
    private navbar: NavbarService,
    ) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }

  @ViewChild('validateButton', { read: ElementRef }) validateButton:ElementRef;
  display_loading=false;

  
  thumbnail_height:string;

  @Input('drawing_id') drawing_id:number;
  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('pseudo') pseudo:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  @Input('user_id') user_id:number;
  @Input() name: string;
  @Input() description: string;
  @Input() category: string;
  @Input() format: string;
  @Input() tags: string[];

  errorMsg : string = "Une erreur s'est produite, veuilliez réitérer le processus.";
  errorMsgCo : string = "Erreur de connexion internet, veuilliez réitérer le processus.";
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

  
  displayErrors: boolean = false;
  popup_error_oppened:boolean = false;
  image_uploaded: boolean = false;
  imageSource: SafeUrl = "";
  imageDestination: string = '';
  cropper: any;
  cropperInitialized: boolean = false;
  confirmation:boolean=false;
  
  
  show_icon=false;

  @Input() user: any;
  @Input() drawing: any;
 
  list_of_pages_artbook=[];

  ngOnInit(){
    if(this.drawing){
      this.drawing_id=this.drawing.drawing_id;
     
    }
  }

  ngAfterViewInit(){
   
    this.cd.detectChanges;
    this.initialize_swiper();
    this.initialize_swiper_controller();

    if(this.drawing){
      for( let k=0; k< this.drawing.pagesnumber; k++ ) {
        this.createComponentWithoutImage(k,"add");
        this.Drawings_Artbook_Service.retrieve_drawing_page_ofartbook(this.drawing.drawing_id,k,window.innerWidth).pipe(first() ).subscribe(r=>{
          let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
         
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.list_of_pages_artbook[k]=SafeURL;
       
          this.createComponentWithImage(k,SafeURL);
          this.refresh_swiper_pagination();
          this.cd.detectChanges();
        });
      };

    }
  }
  

  showDetails() {
    this.showDrawingDetails=true;
  }

  hideDetails() {
    this.showDrawingDetails=false;
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
    $(".artbook-upload-container .options-container .pages-controller-container input").keydown(function (e){
      if(e.keyCode == 13){
        THIS.setSwiperSlide( $(".artbook-upload-container .options-container .pages-controller-container input").val() );
        THIS.setSwiperThumbnailsSlide( $(".artbook-upload-container .options-container .pages-controller-container input").val() );
      }
    });
    
    this.cd.detectChanges();

    if(!this.drawing) {
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

    
        if(this.drawing){
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
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  old_page_in_edition=false;
  list_of_pages_not_to_remove=[];
  createComponentWithoutImage(page,mode) {
    const factory = this.resolver.resolveComponentFactory(UploaderArtbookComponent);
    this.componentRef[page]= this.entry.createComponent(factory) ;
    this.list_of_pages_not_to_remove[page]=true;
    this.rd.addClass( this.componentRef[page].location.nativeElement, "swiper-slide" );
    this.swiper.update();
    this.componentRef[ this.componentRef.length - 1 ].instance.drawing_id = this.drawing_id;
    this.componentRef[ this.componentRef.length - 1 ].instance.title = this.name;

    
    this.componentRef[ page ].instance.drawing_id = this.drawing_id;
    this.componentRef[ page ].instance.page = page;
    this.componentRef[ page ].instance.old_artbook= true;

    

    this.componentRef[ page ].instance.editImageOldArtbook.pipe(takeUntil(this.ngUnsubscribe)).subscribe( v => {
      if(v.type=="edit"){
        this.Drawings_Artbook_Service.update_pages_drawing_artbook(this.drawing_id,this.componentRef.length).pipe(first()).subscribe(r=>{
          this.list_of_pages_artbook[page]=v.image;
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
    this.image_uploaded = true;
    
    this.cd.detectChanges();
    this.swiper.slideTo(0,false,false)
  
  }

  createComponent() {

    let THIS = this;

    //Creating new component
    const factory = this.resolver.resolveComponentFactory(UploaderArtbookComponent);
    this.componentRef.push( this.entry.createComponent(factory) );

    this.rd.addClass( this.componentRef[ this.componentRef.length - 1 ].location.nativeElement, "swiper-slide" );
    this.swiper.update();
    this.componentRef[ this.componentRef.length - 1 ].instance.drawing_id = this.drawing_id;
    this.componentRef[ this.componentRef.length - 1 ].instance.page = this.swiper.slides.length - 1;
    this.componentRef[ this.componentRef.length - 1 ].instance.title = this.name;

    this.componentRef[ this.componentRef.length - 1 ].instance.author_name = this.author_name;
    this.componentRef[ this.componentRef.length - 1 ].instance.profile_picture = this.profile_picture;
    this.componentRef[ this.componentRef.length - 1 ].instance.primary_description = this.primary_description;
    this.componentRef[ this.componentRef.length - 1 ].instance.pseudo = this.pseudo;
    this.componentRef[ this.componentRef.length - 1 ].instance.user_id = this.user_id;
  
  
    this.componentRef[ this.componentRef.length - 1 ].instance.sendPicture.pipe( first()).subscribe( v => {
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



  initialize_cropper(content: ElementRef) {
    
    if( !this.cropperInitialized && !this.drawing) {
      this.cropper = new Cropper(content.nativeElement, {
        guides: true,
        viewMode:2,
        center:true,
        restore:false,
        zoomOnWheel:false,
        fillColor: '#FFFFFF'
      });
      this.cropperInitialized = true;
    }
  }

  loading_thumbnail=false;
  set_crop() {

    const canvas = this.cropper.getCroppedCanvas();

    if( ((canvas.height / canvas.width) < (180/300)) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, higher_crop:true, text:"Veuillez augmenter la hauteur, ou réduire la largeur du rognage"},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    else if( ((canvas.height / canvas.width) > (600/300)) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, larger_crop:true, text:"Veuillez augmenter la largeur, ou réduire la hauteur du rognage"},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    
    this.thumbnail_height = ( 200 * (canvas.height / canvas.width) ).toFixed(2);

    
    canvas.toBlob(blob => {
      if(this.imageDestination=='' && !this.loading_thumbnail){
        this.loading_thumbnail=true;
        this.Drawings_CoverService.send_cover_todata(blob).pipe( first()).subscribe(res=>{
          if(res && res[0].filename && res[0].filename!=''){
            this.confirmation = true;
            this.imageDestination = canvas.toDataURL("image/png");
            this.loading_thumbnail=false;
            this.cd.detectChanges();
            let el = document.getElementById("target3");
            var topOfElement = el.offsetTop - 200;
            window.scroll({top: topOfElement, behavior:"smooth"});
            this.cd.detectChanges();
          }
          else{
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:this.errorMsg},
              panelClass: "popupConfirmationClass",
            });
            this.loading_thumbnail=false;
          }

            
         
        })
      }
      
    }, "image/png");
    
  }

  cancel_crop(){

    if( !this.imageDestination ) {
      return;
    }
    this.Drawings_CoverService.remove_cover_from_folder().pipe( first()).subscribe(r=>{
      this.imageDestination='';
      this.confirmation = false;
    });
    
  }



  number_of_page_uploaded=0;
  number_of_reload=[0];
  validateAll() {
    if(this.display_loading){
      return
    }
    
    if(this.componentRef.length<2){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Un artbook doit contenir au moins 2 pages.'},
        panelClass: "popupConfirmationClass",
      });
      return
    }
    this.number_of_reload=[0];
    this.display_loading=true;
    this.popup_error_oppened=false;
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
        panelClass: "popupConfirmationClass",
      });
      this.display_loading=false;
    }
    else if( !this.confirmation ) {
      errorMsg = "Merci d'éditer la miniature";
      this.displayErrors = true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg},
        panelClass: "popupConfirmationClass",
      });
      this.display_loading=false;
    }
    else {
      this.displayErrors = false;
      this.Drawings_CoverService.add_covername_to_sql(this.format,this.drawing_id).pipe( first()).subscribe(r=>{
        if(!r[0].error){
          this.Drawings_Artbook_Service.send_drawing_height_artbook(this.thumbnail_height,this.drawing_id).pipe( first()).subscribe(sr=>{
            for (let step = 0; step < this.componentRef.length; step++) {
              this.componentRef[ step ].instance.upload = true;
              this.componentRef[ step ].instance.total_pages = this.componentRef.length;
              this.number_of_reload[step+1]=0
              this.componentRef[ step ].instance.sendImageUploaded.pipe(takeUntil(this.ngUnsubscribe)).subscribe( v => {
                this.navbar.add_page_visited_to_history(`/onComplete_swiper_artbook`,(v.file._file.size/1024/1024).toString() + " et " + v.sizeResponse.toString()).pipe( first() ).subscribe();
                if(v.file.isSuccess && v.file._file && v.file._file.size/1024/1024!=0 && v.sizeResponse>0){
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
                      data: {showChoice:false, text:this.errorMsgCo},
                      panelClass: "popupConfirmationClass",
                    });
                    this.display_loading=false;
                    this.displayErrors = true;
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
                  this.block_cancel=true;
                  this.Drawings_CoverService.remove_covername();
                  this.componentRef[this.componentRef.length-1].instance.validate_all=true;
                }

              });

             
            }
          })
        }
        else{
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:this.errorMsg},
            panelClass: "popupConfirmationClass",
          });
          this.display_loading=false;
          this.displayErrors = true;
        }
        
      });
     
    }


  }

  block_cancel=false;
  cancel_all() {
    if(!this.block_cancel && !this.drawing){
      this.Drawings_Artbook_Service.RemoveDrawingArtbook(this.drawing_id).pipe( first()).subscribe(res=>{
        this.Drawings_CoverService.remove_cover_from_folder().pipe( first()).subscribe()
      });
    }
      
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

  endOldArtbook(){
    this.router.navigate([`/account/${this.user.nickname}`]);
  }

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
