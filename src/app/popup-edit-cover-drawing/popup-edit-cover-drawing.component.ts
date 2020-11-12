import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_CoverService } from '../services/drawings_cover.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';



import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';


//à vérifier
const url = 'http://localhost:4600/routes/upload_cover_drawing_oneshot';

declare var $:any;
declare var Cropper;



@Component({
  selector: 'app-popup-edit-cover-drawing',
  templateUrl: './popup-edit-cover-drawing.component.html',
  styleUrls: ['./popup-edit-cover-drawing.component.scss']
})
export class PopupEditCoverDrawingComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupEditCoverDrawingComponent>,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_CoverService:Drawings_CoverService,
    public dialog: MatDialog,
    private rd:Renderer2,

    @Inject(MAT_DIALOG_DATA) public data: any) {


  }


  
  tagsSplit: string;
  image_src: SafeUrl;
  upload:boolean = false;


  @ViewChild("image") set imageElement(content: ElementRef) {
    this.initialize_cropper(content);
  }

  @ViewChild("displayOnHover") displayOnHover: ElementRef;
  thumbnail_background:string;


  showDrawingDetails:boolean = false;

  color:string;
  displayErrors: boolean = false;
  imageSource: SafeUrl = "";
  imageDestination: string = '';
  cropper: any;
  cropperInitialized: boolean = false;
  confirmation:boolean=false;

  
  ngOnInit(): void {

    this.createFormControlsDrawings();
    this.createFormDrawings();

    this.initialize_selectors();

  }

  

  initialize_selectors() {

    let THIS = this;

    $(document).ready(function () {
      $('.drawingSelectColor').SumoSelect({});
    });


    $(".drawingSelectColor").change(function(){
      THIS.color = $(this).val();
      
      //à ajouter
      //THIS.Drawings_Artbook_Service.update_filter(THIS.color).subscribe();
      THIS.set_color();

    });


  }



  fdDisplayErrors: boolean = false;
  fd: FormGroup;
  fdColor: FormControl;

  createFormControlsDrawings() {
    this.fdColor = new FormControl('', Validators.required);
  }

  createFormDrawings() {
    this.fd = new FormGroup({
      fdColor: this.fdColor,
    });
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



    this.imageDestination = canvas.toDataURL("image/png");
    

  }
  
  
  set_color() {
    if( this.color == "Bleu" ) {
      this.thumbnail_background = "rgba(47, 87, 151, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(47, 87, 151, 0.7)" );
      }
    }
    else if( this.color == "Noir" ) {
      this.thumbnail_background = "rgba(59, 56, 56, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(59, 56, 56, 0.7)" );
      }
    }
    else if( this.color == "Vert" ) {
      this.thumbnail_background = "rgba(84, 130, 53, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(84, 130, 53, 0.7)" );
      }
    }
    else if( this.color == "Jaune" ) {
      this.thumbnail_background = "rgba(191, 144, 0, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(191, 144, 0, 0.7)" );
      }
    }
    else if( this.color == "Rouge" ) {
      this.thumbnail_background = "rgba(160, 0, 0, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(160, 0, 0, 0.7)" );
      }
    }
    else if( this.color == "Violet" ) {
      this.thumbnail_background = "rgba(148, 0, 148, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(148, 0, 148, 0.7)" );
      }
    }
    else if( this.color == "Rose" ) {
      this.thumbnail_background = "rgba(255, 153, 255, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(255, 153, 255, 0.7)" );
      }
    }
    else if( this.color == "Marron" ) {
      this.thumbnail_background = "rgba(102, 51, 0, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(102, 51, 0, 0.7)" );
      }
    }
    else if( this.color == "Orange" ) {
      this.thumbnail_background = "rgba(197, 90, 17, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(197, 90, 17, 0.7)" );
      }
    }
    else if( this.color == "Gris" ) {
      this.thumbnail_background = "rgba(166, 166, 166, 0.7)";
      if( this.displayOnHover ) {
        this.rd.setStyle( this.displayOnHover.nativeElement, "background", "rgba(166, 166, 166, 0.7)" );
      }
    }
  }


  
  validate_all() {
    if ( this.Drawings_CoverService.get_confirmation() &&this.data.format == "one-shot" ) {
        this.Drawings_CoverService.add_covername_to_sql2("Œuvre unique",this.data.bd_id).subscribe(r=>{
          location.reload();
        });
    }

    else if ( this.Drawings_CoverService.get_confirmation() &&this.data.format == "artbook" ) {
      this.Drawings_CoverService.add_covername_to_sql2("Série",this.data.bd_id).subscribe(r=>{
        location.reload();
      });
    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez télécharger et valider une photo pour la miniature'},
      });
    }
  }


}


