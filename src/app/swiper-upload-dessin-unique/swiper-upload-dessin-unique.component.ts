import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, HostListener, Renderer2, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Drawings_CoverService} from '../services/drawings_cover.service';
import { Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import { first } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


declare var $: any;
declare var Cropper;

@Component({
  selector: 'app-swiper-upload-dessin-unique',
  templateUrl: './swiper-upload-dessin-unique.component.html',
  styleUrls: ['./swiper-upload-dessin-unique.component.scss']
})
export class SwiperUploadDessinUniqueComponent implements OnInit{

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }


  
  constructor(
    private Drawings_CoverService:Drawings_CoverService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private rd:Renderer2,
    public dialog: MatDialog,
    private cd:ChangeDetectorRef

     ) { 
    this.image_uploaded = false;
    this.tagsSplit = '';
  }


  
  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  
  @Input() name: string;
  @Input() description: string;
  @Input() format: string;
  @Input() category: string;
  @Input() tags: string[];

  ngOnChanges(changes: SimpleChanges) {
    if(changes.tags) {
      this.update_tags();
    }
  }

  tagsSplit: string;
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

  color:string;
  displayErrors: boolean = false;
  imageSource: SafeUrl = "";
  imageDestination: string = '';
  cropper: any;
  cropperInitialized: boolean = false;
  confirmation:boolean=false;

  
  ngOnInit(): void {

    this.initialize_selectors();
  }

  ngAfterViewInit() {

    this.update_tags();
  }



  update_tags() {

    if( this.tags.length >= 1 ) {
      this.tagsSplit = this.tags[0].split("'",2)[1]
    }
    if( this.tags.length >= 2 ) {
      this.tagsSplit = this.tagsSplit + ", " + this.tags[1].split("'",2)[1]
    }
    if( this.tags.length >= 3 ) {
      this.tagsSplit = this.tagsSplit + ", " + this.tags[2].split("'",2)[1]
    }

  }


  showDetails() {
    this.showDrawingDetails=true;
  }

  hideDetails() {
    this.showDrawingDetails=false;
  }

  initialize_selectors() {
    
    let THIS = this;

    $(document).ready(function () {
      $('.drawingSelectColor').SumoSelect({});
    });

    $(".drawingSelectColor").change(function(){
      THIS.color = $(this).val();
      THIS.Drawings_Onepage_Service.update_filter(THIS.color).subscribe();
      THIS.set_color();

    });
  }

  set_color() {
    if( this.color == "Bleu" ) {
      this.thumbnail_background = "rgba(47, 87, 151, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(47, 87, 151, 0.7)" );
      }
    }
    else if( this.color == "Noir" ) {
      this.thumbnail_background = "rgba(59, 56, 56, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(59, 56, 56, 0.7)" );
      }
    }
    else if( this.color == "Vert" ) {
      this.thumbnail_background = "rgba(84, 130, 53, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(84, 130, 53, 0.7)" );
      }
    }
    else if( this.color == "Jaune" ) {
      this.thumbnail_background = "rgba(191, 144, 0, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(191, 144, 0, 0.7)" );
      }
    }
    else if( this.color == "Rouge" ) {
      this.thumbnail_background = "rgba(160, 0, 0, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(160, 0, 0, 0.7)" );
      }
    }
    else if( this.color == "Violet" ) {
      this.thumbnail_background = "rgba(148, 0, 148, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(148, 0, 148, 0.7)" );
      }
    }
    else if( this.color == "Rose" ) {
      this.thumbnail_background = "rgba(255, 153, 255, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(255, 153, 255, 0.7)" );
      }
    }
    else if( this.color == "Marron" ) {
      this.thumbnail_background = "rgba(102, 51, 0, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(102, 51, 0, 0.7)" );
      }
    }
    else if( this.color == "Orange" ) {
      this.thumbnail_background = "rgba(197, 90, 17, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(197, 90, 17, 0.7)" );
      }
    }
    else if( this.color == "Gris" ) {
      this.thumbnail_background = "rgba(166, 166, 166, 0.7)";
      if( this.thumbnail ) {
        this.rd.setStyle( this.thumbnail.nativeElement, "background", "rgba(166, 166, 166, 0.7)" );
      }
    }
  }

  initialize_cropper(content: ElementRef) {
    
    if( !this.cropperInitialized ) {
      this.cropper = new Cropper(content.nativeElement, {
        zoomable: false,
        scalable: false,
        checkCrossOrigin: true,
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
      console.log(blob);
      this.Drawings_CoverService.send_cover_todata(blob).subscribe(res=>{
        console.log(res);
        this.confirmation = true;
      })
    }, "image/png");
    
    this.imageDestination = canvas.toDataURL("image/png");

    this.cd.detectChanges();
    this.set_color();
  }

  cancel_crop(){

    if( !this.imageDestination ) {
      return;
    }

    this.Drawings_CoverService.remove_cover_from_folder().subscribe();
    this.imageDestination='';
    this.confirmation = false;
  }



  uploaded_image( event1: boolean) {
    this.image_uploaded = event1;

    this.set_color();

    if(event1 == false) {
      this.cropperInitialized = false;
      this.imageSource="";
      this.imageDestination="";
    }

  }

  get_image( event2: SafeUrl) {
    this.image_src = event2;
    this.imageSource = event2;
  }


  validateAll() {

    let errorMsg1 : string = "Le dessin n'a pas été téléchargé";
    let errorMsg2 : string = "La vignette n'a pas été éditée";
    let errorMsg3 : string = "La couleur de fond n'a pas été sélectionnée";

    if( !this.image_uploaded ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg1},
      });
      this.displayErrors = true;
    }
    else if( !this.imageDestination ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg2},
      });
      this.displayErrors = true;
    }
    else if( !this.color ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg3},
      });
      this.displayErrors = true;
    }
    else {
      this.upload=true;
      this.Drawings_CoverService.add_covername_to_sql(this.format).subscribe(res=>{
      });
    }

  }
  

  cancel_all() {
    this.Drawings_Onepage_Service.remove_drawing_from_sql(0).pipe(first()).subscribe(res=>{
      this.Drawings_CoverService.remove_cover_from_folder().pipe(first()).subscribe()
      console.log(res)
    });  
  }


}
