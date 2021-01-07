import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';


import { Bd_CoverService } from '../services/comics_cover.service';
import { BdSerieService } from '../services/comics_serie.service';
import { BdOneShotService } from '../services/comics_one_shot.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { pattern } from '../helpers/patterns';

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

      dialogRef.disableClose = true;
      
      this.filteredGenres = this.genreCtrl.valueChanges.pipe(
        startWith(null),
        map((genre: string | null) => genre ? this._filter(genre) : this.allGenres.slice()));
  
  }


  onScroll(e: Event) {
    window.dispatchEvent(new Event('resize'));
 }

  ngOnInit(): void {

    
    this.createFormControls00();
    this.createForm00();

    for( let i = 0 ; i < this.data.chapterList.length; i ++ ) {
      this.addChapter();
      (<FormArray>this.f00.get('chapters')).controls[ i ].setValue( this.data.chapterList[i].title );
    }
  }

  
  /********************************* */
  /********Comic information******** */
  /********************************* */
  f00: FormGroup;
  f00Title: FormControl;
  f00Description: FormControl;
  f00Category: FormControl;
  f00Tags: FormControl;

  /*initialize_selectors_f00() {
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

  }*/

  createFormControls00() {
    this.f00Title = new FormControl(this.data.title, [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ]);
    this.f00Description = new FormControl(this.data.highlight, [Validators.required, Validators.minLength(2), Validators.maxLength(2000), Validators.pattern( pattern("text_with_linebreaks") ) ]);
    this.f00Category = new FormControl(this.data.style, Validators.required);
    this.f00Tags = new FormControl( this.genres, [Validators.required]);
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
  addChapter() { this.chapters.push(new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ])); }


  validateForm00() {

    if ( this.f00.valid && this.data.format == "one-shot" ) {
        this.BdOneShotService.ModifyBdOneShot2(this.data.bd_id,this.f00.value.f00Title, this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description.replace(/\n\s*\n\s*\n/g, '\n\n'))
        .subscribe(inf=>{
              location.reload();
        });
    }

    else if ( this.f00.valid && this.data.format == "serie" ) {
        this.BdSerieService.ModifyBdSerie2(this.data.bd_id,this.f00.value.f00Title, this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description.replace(/\n\s*\n\s*\n/g, '\n\n'))
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
    }

  }


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
  allGenres: string[] = ["Action","Aventure","Caricatural","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Fantastique","Guerre","Héroïque","Histoire","Horreur","Humour","Josei","Journalisme","Kodomo","Nekketsu","Pantso shoto","Philosophie",
  "Policier","Religion","Romantique","Satirique","Science-fiction","Seinen","Shojo","Shonen","Sociologie","Sport","Thriller","Western","Yaoi","Yuri"];
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
