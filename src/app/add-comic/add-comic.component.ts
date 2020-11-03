import { Component, OnInit, ChangeDetectorRef, Renderer2, ElementRef, ComponentFactoryResolver, ViewContainerRef, Output, EventEmitter, ViewChild, HostListener, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { first } from 'rxjs/operators';
import { Bd_CoverService } from '../services/comics_cover.service';
import { Subscribing_service } from '../services/subscribing.service';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl } from '@angular/platform-browser';
import { ThemePalette } from '@angular/material/core';


import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { pattern } from '../helpers/patterns';


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
    private Subscribing_service:Subscribing_service,
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

    
    this.filteredGenres = this.genreCtrl.valueChanges.pipe(
      startWith(null),
      map((genre: string | null) => genre ? this._filter(genre) : this.allGenres.slice()));

  }

  
  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('pseudo') pseudo:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  
  @Output() started = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<any>();

  REAL_step: number;
  CURRENT_step: number;
  modal_displayed: boolean;
  
  ngOnInit() {

    
    this.createFormControls00();
    this.createForm00();

    this.cd.detectChanges();
    
  }


  


  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //Form : cartoon strip, TYPE 0 STEP 0 ********************************************************************* */
  //********************************************************************************************************* */
  //********************************************************************************************************* */


  f00: FormGroup;
  f00Title: FormControl;
  f00Description: FormControl;
  f00Category: FormControl;
  f00Tags: FormControl;
  f00Format: FormControl;
  f00SerieFirstChapter: FormControl;
  monetised:boolean = false;


  format_change_alert() {
    if( (this.REAL_step != this.CURRENT_step) && (!this.modal_displayed) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Attention, changer le format annulera toute la sélection de l\'étape 2'},
      });
      this.modal_displayed = true;
    }
  }
  
  onFormatChange(e:any) {
    if( (this.REAL_step != this.CURRENT_step) ) {
      if( this.f00.controls['f00Format'].value == "Série" ) {
        this.AddValidator();
      }
      else {
        this.RemoveValidator();
      }
      this.REAL_step--;
      this.modal_displayed = true;
      this.cd.detectChanges();
    }
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
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Attention ! Nous vous rappelons que les œuvres plagiées, les fanarts et les œuvres aux contenus inapproriés sont interdits. Toute monétisation faisant suite à ce genre de publication pourra donner suite à une procédure judiciaire et à des frais de remboursement.'},
      });
   }else{
    this.monetised = false;
   }
  }

  read_conditions() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:"Conditions en cours d'écriture"},
    });
  }



  
  createFormControls00() {
    this.f00Title = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ]);
    this.f00Description = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(290), Validators.pattern( pattern("text") ) ]);
    this.f00Category = new FormControl('', Validators.required);
    this.f00Tags = new FormControl( this.genres, [Validators.required]);
    this.f00Format = new FormControl('', [Validators.required]);
    this.f00SerieFirstChapter = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ]);
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
    this.f00SerieFirstChapter.setValidators( [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ] );
    this.f00SerieFirstChapter.updateValueAndValidity();
  }

  update_view() {
    this.cd.detectChanges();
  }

  validateForm00() {
    

    if( this.f00.value.f00Format == "One-shot" ) {
      this.RemoveValidator();
    }
    else {
      this.AddValidator();
    }


    if ( this.f00.valid && (this.f00.value.f00Format == "One-shot") && this.Bd_CoverService.get_confirmation() ) {
        this.started.emit();
        //If MODIFICATION

        /********************** A CHANGER (ENLEVER COULEUR) ************************/
        
        if( this.CURRENT_step < (this.REAL_step) ) {
          this.bdOneShotService.ModifyBdOneShot(this.f00.value.f00Title, this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description, this.monetised )
          .subscribe(inf=>{
            this.Bd_CoverService.add_covername_to_sql(this.f00.value.f00Format).subscribe();
            this.CURRENT_step++;
            
            this.cd.detectChanges();
            window.scroll(0,0);
          });
        }
        //Else if NEW Step1
        else {
          this.bdOneShotService.CreateBdOneShot(this.f00.value.f00Title, this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description, this.monetised )
          .subscribe((val)=> {
            this.Subscribing_service.validate_content('comics', 'one-shot', val[0].bd_id,0).subscribe(r=>{
              this.Bd_CoverService.add_covername_to_sql(this.f00.value.f00Format).subscribe();
              this.CURRENT_step++;
              this.REAL_step++;
  
              this.cd.detectChanges();
              window.scroll(0,0);
            })
           
            });
        }
    }

    else if ( this.f00.valid && (this.f00.value.f00Format == "Série") && this.Bd_CoverService.get_confirmation() ) {
        this.started.emit();
        //If MODIFICATION

        /********************** A CHANGER (ENLEVER COULEUR) ************************/
        
        if( this.CURRENT_step < (this.REAL_step) ) {
          this.bdSerieService.ModifyBdSerie(this.f00.value.f00Title, this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description, this.monetised )
          .subscribe(inf=>{
            this.Bd_CoverService.add_covername_to_sql(this.f00.value.f00Format).subscribe();
            this.bdSerieService.modify_chapter_bd_serie(1,this.f00SerieFirstChapter.value).subscribe();
            this.CURRENT_step++;

            this.cd.detectChanges();
            window.scroll(0,0);
          });
        }
        //Else if NEW Step1
        else {
          this.bdSerieService.CreateBdSerie(this.f00.value.f00Title, this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description, this.monetised )
          .subscribe((val)=> {
            this.Bd_CoverService.add_covername_to_sql(this.f00.value.f00Format).subscribe();
            this.bdSerieService.add_chapter_bd_serie(1,this.f00SerieFirstChapter.value).subscribe();
            this.CURRENT_step++;
            this.REAL_step++;

            this.cd.detectChanges();
            window.scroll(0,0);
            });
        }
        
    }

    else {
      if( !this.f00.valid ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
        });
      }
      else {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez saisir une miniature, puis la valider.'},
        });
      }
    }
    
  }
  
  cancel_all() {
      this.Bd_CoverService.remove_cover_from_folder().pipe(first()).subscribe();
  }


  
  //AJOUTÉ
  listOfFormats = ["One-shot","Série"];
  listOfStyles = ["BD","Comics","Manga","Webtoon"];
  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  //GENRES
  @ViewChild('genreInput') genreInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  genreCtrl = new FormControl();
  filteredGenres: Observable<string[]>;
  genres: string[] = [];
  allGenres: string[] = ["Action","Aventure","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Josei","Journalisme","Kodomo","Nekketsu","Pantso shoto","Philosophie",
  "Policier","Religion","Romantique","Science-fiction","Seinen","Shojo","Shonen","Sociologie","Sport","Thriller","Western","Yaoi","Yuri"];
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if( this.genres.length >= 3 ) {
      return;
    }

    let do_not_add:boolean = true;
    let index:number;

    // Add our genre
    if ((value || '').trim()) {

      for( let i=0; i<this.allGenres.length; i++ ) {
        if( this.allGenres[i].toLowerCase() == value.toLowerCase() ) {
          do_not_add=false;
          index = i;
        }
      }
      for( let i=0; i<this.genres.length; i++ ) {
        if( this.genres[i].toLowerCase() == value.toLowerCase() ) {
          do_not_add=true;
        }
      }

      if( !do_not_add ) {
        this.genres.push(this.allGenres[index].trim());
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.genreCtrl.setValue(null);
    this.f00Tags.updateValueAndValidity();
  }
  remove(genre: string): void {
    const index = this.genres.indexOf(genre);
    if (index >= 0) {
      this.genres.splice(index, 1);
    }
    this.f00Tags.updateValueAndValidity();
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    
    

    if( this.genres.length >= 3 ) {
      this.genreInput.nativeElement.value = '';
      this.genreCtrl.setValue(null);  
      return;
    }      
    for( let i=0; i<this.genres.length; i++ ) {
      if( this.genres[i].toLowerCase() == event.option.viewValue.toLowerCase() ) {
        this.genreInput.nativeElement.value = '';
        this.genreCtrl.setValue(null);    
        return;
      }
    }
    this.genres.push(event.option.viewValue);
    this.genreInput.nativeElement.value = '';
    this.genreCtrl.setValue(null);
    this.f00Tags.updateValueAndValidity();

    if( this.genres.length < 3) {
      
    }
  }
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allGenres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
  }




}
