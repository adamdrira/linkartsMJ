import { Component, OnInit, ChangeDetectorRef, Renderer2, ElementRef, ComponentFactoryResolver, ViewContainerRef, Output, EventEmitter, ViewChild, HostListener, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { first } from 'rxjs/operators';
import { Bd_CoverService } from '../services/comics_cover.service';


import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl } from '@angular/platform-browser';
import { ThemePalette } from '@angular/material/core';


declare var Swiper: any;
declare var $ : any;

@Component({
  selector: 'app-add-comic',
  templateUrl: './add-comic.component.html',
  styleUrls: ['./add-comic.component.scss']
})

export class AddComicComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }

  constructor(
    private rd: Renderer2, 
    private el: ElementRef,
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private viewref: ViewContainerRef,
    private bdOneShotService: BdOneShotService,
    private bdSerieService: BdSerieService,
    private Bd_CoverService: Bd_CoverService,
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

  REAL_step: number;
  CURRENT_step: number;
  modal_displayed: boolean;
  tags: string[];
  tagsValidator:boolean = false;
  comics_tags=["Action","Aventure","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Josei","Journalisme","Kodomo","Nekketsu","Pantso shoto","Philosophie",
  "Policier","Religion","Romantique","Science-fiction","Seinen","Shojo","Shonen","Sociologie","Sport","Thriller","Western","Yaoi","Yuri"];

  
  ngOnInit() {

    
    this.createFormControls00();
    this.createForm00();

    this.initialize_selectors_f00();
    this.initialize_taginputs_f00();

    this.cd.detectChanges();
    
  }


  


  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //Form : cartoon strip, TYPE 0 STEP 0 ********************************************************************* */
  //********************************************************************************************************* */
  //********************************************************************************************************* */


  f00DisplayErrors: boolean = false;
  f00: FormGroup;
  f00Title: FormControl;
  f00Description: FormControl;
  f00Category: FormControl;
  f00Tags: FormControl;
  f00Format: FormControl;
  f00SerieFirstChapter: FormControl;
  color:string;
  monetised:boolean = false;

  initialize_selectors_f00() {
    let THIS = this;


    $(document).ready(function () {
      $('.f00select0').SumoSelect({});
    });
    $(document).ready(function () {
      $('.f00select1').SumoSelect({});
    });

    this.cd.detectChanges();

    $(".f00select0").change(function(){
      THIS.f00.controls['f00Category'].setValue( $(this).val() );

      if($(".f00select0").val() == "BD") {
        THIS.color = "linear-gradient(-220deg,#044fa9,#25bfe6)";
      }
      else if($(".f00select0").val() == "Comics") {
        THIS.color = "linear-gradient(-220deg,#1a844e,#77d05a)";
      }
      else if($(".f00select0").val() == "Manga") {
        THIS.color = "linear-gradient(-220deg,#ee5842,#ed973c)";
      }
      else if($(".f00select0").val() == "Webtoon") {
        THIS.color = "linear-gradient(-220deg,#8051a7,#d262a5)";
      }

      THIS.cd.detectChanges();
    });



    $('.f00select1').change(function(){
      if( (THIS.REAL_step != THIS.CURRENT_step) && (THIS.f00.controls['f00Format'].value != $(this).val()) && (!THIS.modal_displayed) ) {
        
        //show modal
        //Attention, changer le format annulera toute la sélection de l'étape 2.
        const dialogRef = THIS.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:true, text:'Attention, changer le format annulera toute la sélection de l\'étape 2'},
        });

        dialogRef.afterClosed().subscribe(result => {
          if( result ) {
            if( $(".f00select1").val() == "Série" ) {
              THIS.AddValidator();
            }
            else {
              THIS.RemoveValidator();
            }
            THIS.f00.controls['f00Format'].setValue( $(".f00select1").val() );
            THIS.REAL_step--;
            THIS.modal_displayed = true;
            THIS.cd.detectChanges();
          }
          else {
            $('.f00select1')[0].sumo.selectItem( THIS.f00.controls['f00Format'].value );
            THIS.cd.detectChanges();
          }
        });

      }

      else {
        if( $(".f00select1").val() == "Série" ) {
          THIS.AddValidator();
        }
        else {
          THIS.RemoveValidator();
        }
        THIS.f00.controls['f00Format'].setValue( $(this).val() );
      }

      THIS.cd.detectChanges();
    });


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



  initialize_taginputs_f00() {
    let THIS = this;

    $('.multipleSelect').fastselect({
      maxItems: 3
    });
  }

  createFormControls00() {
    this.f00Title = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
    this.f00Description = new FormControl('', [Validators.required, Validators.maxLength(500), Validators.pattern("^[^\\s]+.*") ]);
    this.f00Category = new FormControl('', Validators.required);
    this.f00Tags = new FormControl('');
    this.f00Format = new FormControl('', Validators.required);
    this.f00SerieFirstChapter = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
  }

  createForm00() {
    this.f00 = new FormGroup({
        f00Title: this.f00Title,
        f00Description: this.f00Description,
        f00Category: this.f00Category,
        f00Tags: this.f00Tags,
        f00Format: this.f00Format,
        f00SerieFirstChapter: this.f00SerieFirstChapter
    });
  }
  
  //*************** là */
  RemoveValidator(){
    this.f00SerieFirstChapter.clearValidators();
    this.f00SerieFirstChapter.updateValueAndValidity();
  }
  AddValidator(){
    this.f00SerieFirstChapter.setValidators( [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ] );
    this.f00SerieFirstChapter.updateValueAndValidity();
  }

  update_view() {
    this.cd.detectChanges();
  }

  validateForm00() {

    this.tags = $(".multipleSelect").val();

    if( this.tags.length == 0 ) {
      this.f00DisplayErrors = true;
      this.tagsValidator = false;
    }
    else {
      this.tagsValidator = true;
    }
    

    if ( this.f00.valid && (this.f00.value.f00Format == "One-shot") && this.Bd_CoverService.get_confirmation() && this.tagsValidator ) {
        this.started.emit();
        this.f00DisplayErrors = false;
        this.tags = $(".multipleSelect").val();
        //If MODIFICATION

        /********************** A CHANGER (ENLEVER COULEUR) ************************/
        
        if( this.CURRENT_step < (this.REAL_step) ) {
          this.bdOneShotService.ModifyBdOneShot(this.f00.value.f00Title, this.f00.value.f00Category, this.tags, this.f00.value.f00Description, this.monetised )
          .subscribe(inf=>{
            this.Bd_CoverService.add_covername_to_sql(this.f00.value.f00Format).subscribe();
            this.CURRENT_step++;
          });
        }
        //Else if NEW Step1
        else {
          this.bdOneShotService.CreateBdOneShot(this.f00.value.f00Title, this.f00.value.f00Category, this.tags, this.f00.value.f00Description, this.monetised )
          .subscribe((val)=> {
            this._upload.f00_validation();
            this.Bd_CoverService.add_covername_to_sql(this.f00.value.f00Format).subscribe();
            this.CURRENT_step++;
            this.REAL_step++;
            });
        }
    }

    else if ( this.f00.valid && (this.f00.value.f00Format == "Série") && this.Bd_CoverService.get_confirmation() && this.tagsValidator ) {
        this.started.emit();
        this.f00DisplayErrors = false;
        this.tags = $(".multipleSelect").val();
        //If MODIFICATION

        /********************** A CHANGER (ENLEVER COULEUR) ************************/
        
        if( this.CURRENT_step < (this.REAL_step) ) {
          this.bdSerieService.ModifyBdSerie(this.f00.value.f00Title, this.f00.value.f00Category, this.tags, this.f00.value.f00Description, this.monetised )
          .subscribe(inf=>{
            this.Bd_CoverService.add_covername_to_sql(this.f00.value.f00Format).subscribe();
            this.bdSerieService.modify_chapter_bd_serie(1,this.f00SerieFirstChapter.value).subscribe();
            this.CURRENT_step++;
          });
        }
        //Else if NEW Step1
        else {
          this.bdSerieService.CreateBdSerie(this.f00.value.f00Title, this.f00.value.f00Category, this.tags, this.f00.value.f00Description, this.monetised )
          .subscribe((val)=> {
            this._upload.f00_validation();
            this.Bd_CoverService.add_covername_to_sql(this.f00.value.f00Format).subscribe();
            this.bdSerieService.add_chapter_bd_serie(1,this.f00SerieFirstChapter.value).subscribe();
            this.CURRENT_step++;
            this.REAL_step++;
            });
        }
        
    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
      this.f00DisplayErrors = true;
    }
    
  }
  
  cancel_all() {
      this.Bd_CoverService.remove_cover_from_folder().pipe(first()).subscribe();
  }




}
