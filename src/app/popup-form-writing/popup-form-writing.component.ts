import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, HostListener, ViewChild, Input, Inject } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Writing_Upload_Service } from '../services/writing.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-popup-form-writing',
  templateUrl: './popup-form-writing.component.html',
  styleUrls: ['./popup-form-writing.component.scss']
})
export class PopupFormWritingComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupFormWritingComponent>,
    private cd:ChangeDetectorRef,
    private rd:Renderer2,
    private Writing_Upload_Service:Writing_Upload_Service,

    public dialog: MatDialog,



    @Inject(MAT_DIALOG_DATA) public data: any) {


  }


  ngOnInit(): void {

    this.createFormControlsWritings();
    this.createFormWritings();

    

    this.fw.controls['fwTitle'].setValue( this.data.title );
    this.fw.controls['fwDescription'].setValue( this.data.highlight );

    
    if( this.data.style == "Illustrated novel") {
      this.fw.controls['fwCategory'].setValue( "Roman illustré" );
    }
    else if( this.data.style == "Scenario") {
      this.fw.controls['fwCategory'].setValue( "Scénario" );
    }
    else {
      this.fw.controls['fwCategory'].setValue( this.data.style );
    }

  }

  
  ngAfterContentInit() {

    this.initialize_selectors();
    this.initialize_taginputs_fw();
    this.cd.detectChanges();
  }

  ngAfterViewInit() {

  }


  initialize_selectors() {

    let THIS = this;

    $(document).ready(function () {
      $('.fwselect1').SumoSelect({});
    });

    this.cd.detectChanges();
    
    $(".fwselect1").change(function(){
      THIS.fw.controls['fwCategory'].setValue( $(this).val() );
      THIS.cd.detectChanges();
    });

  }


  initialize_taginputs_fw() {

    $('.multipleSelectfw').fastselect({
      maxItems: 3
    });
    
    this.cd.detectChanges();

  }



  fwDisplayErrors: boolean = false;
  fw: FormGroup;
  fwTitle: FormControl;
  fwDescription: FormControl;
  fwCategory: FormControl;
  fwTags: FormControl;
  tags: string[];
  tagsValidator:boolean = false;
  
  createFormControlsWritings() {
    this.fwTitle = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
    this.fwDescription = new FormControl('', [Validators.required, Validators.maxLength(500), Validators.pattern("^[^\\s]+.*") ]);
    this.fwCategory = new FormControl('', Validators.required);
    this.fwTags = new FormControl('');
  }

  createFormWritings() {
    this.fw = new FormGroup({
      fwTitle: this.fwTitle,
      fwDescription: this.fwDescription,
      fwCategory: this.fwCategory,
      fwTags: this.fwTags,

    });
  }



  validate_form_writing() {
    
    this.tags = $(".multipleSelectfw").val();

    if( this.tags.length == 0 ) {
      this.fwDisplayErrors = true;
      this.tagsValidator = false;
    }
    else {
      this.tagsValidator = true;
    }


    if ( this.fw.valid && this.tagsValidator ) {

      this.fwDisplayErrors = false;
      this.tags = $(".multipleSelectfw").val();
      console.log("ok");
      this.Writing_Upload_Service.Modify_writing(this.data.writing_id,this.fw.value.fwTitle, this.fw.value.fwCategory, this.tags, this.fw.value.fwDescription).subscribe(r=>{
          location.reload();
        });

       this.fwDisplayErrors = false; 
    }


    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
      this.fwDisplayErrors = true;
    }


  }


}
