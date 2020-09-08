import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';


import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


declare var $:any;

@Component({
  selector: 'app-popup-form-drawing',
  templateUrl: './popup-form-drawing.component.html',
  styleUrls: ['./popup-form-drawing.component.scss']
})
export class PopupFormDrawingComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupFormDrawingComponent>,
    private cd:ChangeDetectorRef,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    public dialog: MatDialog,



    @Inject(MAT_DIALOG_DATA) public data: any) {


  }




  ngOnInit() {

    this.createFormControlsDrawings();
    this.createFormDrawings();

    this.initialize_selectors();
    this.initialize_taginputs_fd();


    this.fd.controls['fdTitle'].setValue( this.data.title );
    this.fd.controls['fdDescription'].setValue( this.data.highlight );
    this.fd.controls['fdCategory'].setValue( this.data.style );


  }

  ngAfterContentInit() {
      this.initialize_taginputs_fd();
  }


  

  initialize_selectors() {

    let THIS = this;

    $(document).ready(function () {
      $('.fdselect1').SumoSelect({});
    });

    this.cd.detectChanges();


    $(".fdselect1").change(function(){
      THIS.fd.controls['fdCategory'].setValue( $(this).val() );
    });


    $(document).ready(function () {
      $('.drawingSelectColor').SumoSelect({});
    });


    $(".drawingSelectColor").change(function(){
      THIS.color = $(this).val();
      
      //à ajouter
      //THIS.Drawings_Artbook_Service.update_filter(THIS.color).subscribe();

      if( THIS.color == "Bleu" ) {
        //THIS.rd.setStyle( THIS.thumbnailDrawing.nativeElement, "background-color", "rgb(0,0,255)" );
        //THIS.rd.setStyle( THIS.thumbnailDrawing.nativeElement, "color", "white" );

      }

      else if( THIS.color == "Vert" ) {
        //THIS.rd.setStyle( THIS.thumbnailDrawing.nativeElement, "background-color", "rgb(0,255,0)" );
        //THIS.rd.setStyle( THIS.thumbnailDrawing.nativeElement, "color", "black" );
      }

      else if( THIS.color == "Rouge" ) {
        //THIS.rd.setStyle( THIS.thumbnailDrawing.nativeElement, "background-color", "rgb(255,0,0)" );
        //THIS.rd.setStyle( THIS.thumbnailDrawing.nativeElement, "color", "black" );
      }

      else {
        //THIS.rd.setStyle( THIS.thumbnailDrawing.nativeElement, "background-color", "white" );
        //THIS.rd.setStyle( THIS.thumbnailDrawing.nativeElement, "color", "black" );
      }

    });


  }


  initialize_taginputs_fd() {

    $('.multipleSelectfd').fastselect({
      maxItems: 3
    });
    
    this.cd.detectChanges();

  }



  fdDisplayErrors: boolean = false;
  fd: FormGroup;
  fdTitle: FormControl;
  fdDescription: FormControl;
  fdCategory: FormControl;
  fdTags: FormControl;
  tags: string[];
  tagsValidator:boolean = false;
  color:string;

  createFormControlsDrawings() {
    this.fdTitle = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
    this.fdDescription = new FormControl('', [Validators.required, Validators.maxLength(500), Validators.pattern("^[^\\s]+.*") ]);
    this.fdCategory = new FormControl('', Validators.required);
    this.fdTags = new FormControl('');
  }

  createFormDrawings() {
    this.fd = new FormGroup({
      fdTitle: this.fdTitle,
      fdDescription: this.fdDescription,
      fdCategory: this.fdCategory,
      fdTags: this.fdTags,

    });
  }



  validate_form_drawings() {

    this.tags = $(".multipleSelectfd").val();

    if( this.tags.length == 0 ) {
      this.fdDisplayErrors = true;
      this.tagsValidator = false;
    }
    else {
      this.tagsValidator = true;
    }
    
    
    if ( this.fd.valid && this.data.format == "one-shot"  && this.tagsValidator ) {
        this.fdDisplayErrors = false;
        this.tags = $(".multipleSelectfd").val();
        this.Drawings_Onepage_Service.ModifyDrawingOnePage2(this.data.drawing_id,this.fd.value.fdTitle, this.fd.value.fdCategory, this.tags, this.fd.value.fdDescription)
        .subscribe(inf=>{
              location.reload();
        });
    }

    else if ( this.fd.valid && this.data.format == "artbook"  && this.tagsValidator ) {
        this.fdDisplayErrors = false;
        this.tags = $(".multipleSelect").val();
        this.Drawings_Artbook_Service.ModifyArtbook2(this.data.drawing_id,this.fd.value.fdTitle, this.fd.value.fdCategory, this.tags, this.fd.value.fdDescription)
        .subscribe(inf=>{
              location.reload();
        })
    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
      this.fdDisplayErrors = true;
    }


  }



}
