import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, Renderer2, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Drawings_CoverService} from '../services/drawings_cover.service';
import { Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { NavbarService } from '../services/navbar.service';

import { first } from 'rxjs/operators';

declare var Cropper;

@Component({
  selector: 'app-swiper-upload-dessin-unique',
  templateUrl: './swiper-upload-dessin-unique.component.html',
  styleUrls: ['./swiper-upload-dessin-unique.component.scss'],
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
export class SwiperUploadDessinUniqueComponent implements OnInit{

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }


  
  constructor(
    private Drawings_CoverService:Drawings_CoverService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    public dialog: MatDialog,
    private cd:ChangeDetectorRef,
    private router:Router,
    private navbar: NavbarService,
     ) { 
    this.image_uploaded = false;
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
  @Input('profile_picture') profile_picture:SafeUrl;
  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('pseudo') pseudo:string;
  @Input('user_id') user_id:string;
  @Input() name: string;
  @Input() description: string;
  @Input() format: string;
  @Input() category: string;
  @Input() tags: any;


  image_src: SafeUrl;
  image_uploaded: boolean = false;
  upload:boolean = false;


  @ViewChild("thumbnail", {static:false}) thumbnail: ElementRef;
  thumbnail_background:string;

  @ViewChild("image") set imageElement(content: ElementRef) {
    if( this.image_uploaded ) {
      this.initialize_cropper(content);
    }
  }

  showDrawingDetails:boolean = false;

  displayErrors: boolean = false;
  imageSource: SafeUrl = "";
  imageDestination: string = '';
  cropper: any;
  cropperInitialized: boolean = false;
  confirmation:boolean=false;

  
  show_icon=false;
  ngOnInit() {
   
  }

 


  showDetails() {
    this.showDrawingDetails=true;
  }

  hideDetails() {
    this.showDrawingDetails=false;
  }


  initialize_cropper(content: ElementRef) {
    
    if( !this.cropperInitialized ) {
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

    this.cd.detectChanges();
    this.scroll(document.getElementById("target2"));
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
          this.confirmation = true;
          this.loading_thumbnail=false;
          this.imageDestination = canvas.toDataURL("image/png");
          this.cd.detectChanges();
          let el = document.getElementById("target3");
          var topOfElement = el.offsetTop - 200;
          window.scroll({top: topOfElement, behavior:"smooth"});
          this.cd.detectChanges();
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



  uploaded_image( event1: boolean) {
    this.image_uploaded = event1;

    if(event1 == false) {
      this.cropperInitialized = false;
      this.imageSource="";
      this.imageDestination="";
    }
  }

  scroll(el:HTMLElement) {
    el.scrollIntoView({behavior:"smooth"});
  }

  get_image( event2: SafeUrl) {
    this.image_src = event2;
    this.imageSource = event2;
  }

  sendValidated(event){
      this.block_cancel=true;
      this.Drawings_CoverService.remove_covername();
      this.router.navigate([`/account/${this.pseudo}`]);
  }

  block_cancel=false;
  validateAll() {

    if(this.display_loading){
      return
    }
    this.display_loading=true;
    let errorMsg1 : string = "Le dessin n'a pas été téléchargé";
    let errorMsg2 : string = "La vignette n'a pas été éditée";

    if( !this.image_uploaded ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg1},
        panelClass: "popupConfirmationClass",
      });
      this.display_loading=false;
      this.displayErrors = true;
    }
    else if( !this.imageDestination ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg2},
        panelClass: "popupConfirmationClass",
      });
      this.display_loading=false;
      this.displayErrors = true;
    }
    else {
      this.displayErrors = false;
      this.Drawings_CoverService.add_covername_to_sql(this.format,this.drawing_id).pipe( first()).subscribe(res=>{
        this.Drawings_Onepage_Service.send_drawing_height_one_shot(this.thumbnail_height,this.drawing_id).pipe( first()).subscribe(r=>{
          this.display_loading=false;
          this.upload=true;
          this.cd.detectChanges();
        })
        
      });
    }

  }
  

  cancel_all() {
    if(!this.block_cancel){
      this.Drawings_Onepage_Service.remove_drawing_from_sql(this.drawing_id).pipe( first()).subscribe(res=>{
        this.Drawings_CoverService.remove_cover_from_folder().pipe( first()).subscribe()
      }); 
    }
     
  }



}
