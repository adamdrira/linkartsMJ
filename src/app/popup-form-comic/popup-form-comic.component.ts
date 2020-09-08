import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';


import { Bd_CoverService } from '../services/comics_cover.service';
import { BdSerieService } from '../services/comics_serie.service';
import { BdOneShotService } from '../services/comics_one_shot.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


declare var $:any;

@Component({
  selector: 'app-popup-form-comic',
  templateUrl: './popup-form-comic.component.html',
  styleUrls: ['./popup-form-comic.component.scss']
})
export class PopupFormComicComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupFormComicComponent>,
    private cd:ChangeDetectorRef,

    private BdSerieService:BdSerieService,
    private BdOneShotService:BdOneShotService,
    private Bd_CoverService: Bd_CoverService,

    public dialog: MatDialog,



    @Inject(MAT_DIALOG_DATA) public data: any) {

  }


  ngOnInit(): void {


    this.createFormControls00();
    this.createForm00();



    for( let i = 0 ; i < this.data.chapterList.length; i ++ ) {
      this.addChapter();
      (<FormArray>this.f00.get('chapters')).controls[ i ].setValue( this.data.chapterList[i].title );
    }
    
    this.initialize_selectors_f00();
    this.initialize_taginputs_f00();


    this.f00.controls['f00Title'].setValue( this.data.title );
    this.f00.controls['f00Description'].setValue( this.data.highlight );
    this.f00.controls['f00Category'].setValue( this.data.style );

  }

  ngAfterViewInit() {
      

  }

  
  /********************************* */
  /********Comic information******** */
  /********************************* */

  f00DisplayErrors: boolean = false;
  f00: FormGroup;
  f00Title: FormControl;
  f00Description: FormControl;
  f00Category: FormControl;
  f00Tags: FormControl;
  tags: string[];
  tagsValidator:boolean = false;

  initialize_selectors_f00() {
    let THIS = this;

    $(document).ready(function () {
      $('.f00select0').SumoSelect({});
      $('.f00select0')[0].sumo.selectItem( THIS.data.style );
    });

    $(document).ready(function () {
      $('.f00select2').SumoSelect({});
    });

    this.cd.detectChanges();


    $(".f00select0").change(function(){
      THIS.f00.controls['f00Category'].setValue( $(this).val() );
      THIS.cd.detectChanges();
    });

  };

  initialize_taginputs_f00() {
    
    $(document).ready(function () {
      $('.multipleSelect').fastselect({
        maxItems: 3
      });
    });


  }
  createFormControls00() {
    this.f00Title = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
    this.f00Description = new FormControl('', [Validators.required, Validators.maxLength(500), Validators.pattern("^[^\\s]+.*") ]);
    this.f00Category = new FormControl('', Validators.required);
    this.f00Tags = new FormControl('');
  }
  createForm00() {
    this.f00 = new FormGroup({
        f00Title: this.f00Title,
        f00Description: this.f00Description,
        f00Category: this.f00Category,
        f00Tags: this.f00Tags,
        chapters: new FormArray([
        ]),
    });
  }
  

  get chapters(): FormArray { return this.f00.get('chapters') as FormArray; }
  addChapter() { this.chapters.push(new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ] )); }


  validateForm00() {
    
    this.tags = $(".multipleSelect").val();

    if( this.tags.length == 0 ) {
      this.f00DisplayErrors = true;
      this.tagsValidator = false;
    }
    else {
      this.tagsValidator = true;
    }
    
    
    if ( this.f00.valid && this.data.format == "one-shot"  && this.tagsValidator ) {
        this.f00DisplayErrors = false;
        this.tags = $(".multipleSelect").val();
        this.BdOneShotService.ModifyBdOneShot2(this.data.bd_id,this.f00.value.f00Title, this.f00.value.f00Category, this.tags, this.f00.value.f00Description)
        .subscribe(inf=>{
              location.reload();
        });
    }

    else if ( this.f00.valid && this.data.format == "serie"  && this.tagsValidator ) {
        this.f00DisplayErrors = false;
        this.tags = $(".multipleSelect").val();
        
        this.BdSerieService.ModifyBdSerie2(this.data.bd_id,this.f00.value.f00Title, this.f00.value.f00Category, this.tags, this.f00.value.f00Description)
        .subscribe(inf=>{
          for( let i = 0 ; i < this.data.chapterList.length; i ++ ) {
            this.BdSerieService.modify_chapter_bd_serie2(this.data.bd_id,i+1,this.chapters.value[i]).subscribe(r=>{
              if(i==this.data.chapterList.length-1){
                location.reload();
              }
            });
          }

        });
        

    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
      this.f00DisplayErrors = true;
    }

    

  }

  update_view() {
    this.cd.detectChanges();
  }


}
