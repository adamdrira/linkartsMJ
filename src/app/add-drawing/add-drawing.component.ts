import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, Input } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service} from '../services/drawings_artbook.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl } from '@angular/platform-browser';


declare var $: any;

@Component({
  selector: 'app-add-drawing',
  templateUrl: './add-drawing.component.html',
  styleUrls: ['./add-drawing.component.scss']
})
export class AddDrawingComponent implements OnInit {


  constructor(
    private rd: Renderer2, 
    private el: ElementRef,
    private _constants: ConstantsService, 
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private viewref: ViewContainerRef,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    public dialog: MatDialog,
  ) { 
    
    this.REAL_step = 0;
    this.CURRENT_step = 0;
    this.modal_displayed = false;
  }

  
  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  
  @Output() started = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<any>();
  

  dropdowns = this._constants.filters.categories[0].dropdowns;
  REAL_step: number;
  CURRENT_step: number;
  modal_displayed: boolean;
  tags: string[];
  tagsValidator:boolean = false;



  ngOnInit() {

    this.createFormControlsDrawings();
    this.createFormDrawings();

    this.initialize_selectors();
    this.initialize_taginputs_fd();

    this.cd.detectChanges();

  }

  ngAfterContentInit() {
      this.initialize_taginputs_fd();
  }

  

  back_home() {
    this.cancelled.emit();
  }

  step_back() {

    this.CURRENT_step = this.REAL_step - 1;
    this.cd.detectChanges();
    this.modal_displayed=false;
    this.cd.detectChanges();
  }



  setMonetisation(e){
    if(e.checked){
      this.monetised = true;
   }else{
    this.monetised = false;
   }
  }
  read_conditions() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:'Le plagiat ainsi que les fanarts sont rigoureusement interdits.'},
    });
  }



  initialize_selectors() {

    let THIS = this;

    $(document).ready(function () {
      $('.fdselect0').SumoSelect({});
    });
    $(document).ready(function () {
      $('.fdselect1').SumoSelect({});
    });

    this.cd.detectChanges();

    
    $(".fdselect0").change(function(){

      THIS.cd.detectChanges();
      if( (THIS.REAL_step != THIS.CURRENT_step) && (THIS.fd.controls['fdFormat'].value != $(this).val()) && (!THIS.modal_displayed) ) {

        const dialogRef = THIS.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:true, text:'Attention, la sélection actuelle sera supprimée'},
        });
      
        dialogRef.afterClosed().subscribe(result => {
          if( result ) {
            THIS.fd.controls['fdFormat'].setValue( $(".fdselect0").val() );
            THIS.REAL_step--;
            THIS.modal_displayed = true;
            THIS.cd.detectChanges();
          }
          else {
            $('.fdselect0')[0].sumo.selectItem( THIS.fd.controls['fdFormat'].value );
            THIS.cd.detectChanges();
          }
        });

      }

      else {
        THIS.fd.controls['fdFormat'].setValue( $(this).val() );
      }

      THIS.cd.detectChanges();

    });
    


    $(".fdselect1").change(function(){
      THIS.fd.controls['fdCategory'].setValue( $(this).val() );
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
  fdFormat: FormControl;
  monetised:boolean = false;
  
  createFormControlsDrawings() {
    this.fdTitle = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
    this.fdDescription = new FormControl('', [Validators.required, Validators.maxLength(500), Validators.pattern("^[^\\s]+.*") ]);
    this.fdCategory = new FormControl('', Validators.required);
    this.fdTags = new FormControl('');
    this.fdFormat = new FormControl('', Validators.required);
  }

  createFormDrawings() {
    this.fd = new FormGroup({
      fdTitle: this.fdTitle,
      fdDescription: this.fdDescription,
      fdCategory: this.fdCategory,
      fdTags: this.fdTags,
      fdFormat: this.fdFormat
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

    if ( this.fd.valid  && (this.fd.value.fdFormat == "Œuvre unique") && this.tagsValidator ) {
       this.tags = $(".multipleSelectfd").val();
        console.log('ok1')

              if( this.CURRENT_step < (this.REAL_step) ) {
                this.Drawings_Onepage_Service.ModifyDrawingOnePage(this.fd.value.fdTitle, this.fd.value.fdCategory, this.tags, this.fd.value.fdDescription, this.monetised)
                .subscribe(inf=>{
                  this.CURRENT_step++;
                  
                });
              }
              else {
                this.Drawings_Onepage_Service.CreateDrawingOnepage(this.fd.value.fdTitle, this.fd.value.fdCategory, this.tags, this.fd.value.fdDescription, this.monetised)
                .subscribe((val)=> {
                  this.CURRENT_step++;
                  this.REAL_step++;
                  });
              }

            this.fdDisplayErrors = false;
    }

    else if ( this.fd.valid  && (this.fd.value.fdFormat == "Artbook") && this.tagsValidator ) {
      this.tags = $(".multipleSelectfd").val();
       console.log('ok1')

             if( this.CURRENT_step < (this.REAL_step) ) {
               this.Drawings_Artbook_Service.ModifyArtbook(this.fd.value.fdTitle, this.fd.value.fdCategory, this.tags, this.fd.value.fdDescription, this.monetised)
               .subscribe(inf=>{
                 this.CURRENT_step++;
                 
               });
             }
             else {
               this.Drawings_Artbook_Service.CreateDrawingArtbook(this.fd.value.fdTitle, this.fd.value.fdCategory, this.tags,this.fd.value.fdDescription, this.monetised)
               .subscribe((val)=> {
                 this.CURRENT_step++;
                 this.REAL_step++;
                 });
             }

           this.fdDisplayErrors = false;
       
    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
      this.fdDisplayErrors = true;
    }

  }



}