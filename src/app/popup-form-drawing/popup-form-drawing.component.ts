import { Component, OnInit, Inject, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';


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

      this.filteredGenres = this.genreCtrl.valueChanges.pipe(
        startWith(null),
        map((genre: string | null) => genre ? this._filter(genre) : this.allGenres.slice()));

  }


  onScroll(e: Event) {
    window.dispatchEvent(new Event('resize'));
 }



  ngOnInit() {

    this.createFormControlsDrawings();
    this.createFormDrawings();

  }

  fd: FormGroup;
  fdTitle: FormControl;
  fdDescription: FormControl;
  fdCategory: FormControl;
  fdTags: FormControl;


  createFormControlsDrawings() {
    this.fdTitle = new FormControl(this.data.title, [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ]);
    this.fdDescription = new FormControl(this.data.highlight, [Validators.required, Validators.minLength(2), Validators.maxLength(2000), Validators.pattern( pattern("text_with_linebreaks") ) ]);
    this.fdCategory = new FormControl(this.data.style, Validators.required);
    this.fdTags = new FormControl( this.genres, [Validators.required]);
  }

  createFormDrawings() {
    this.fd = new FormGroup({
      fdTitle: this.fdTitle,
      fdDescription: this.fdDescription,
      fdCategory: this.fdCategory,
      fdTags: this.fdTags,

    });
  }



  validateForm00() {

    
    if ( this.fd.valid && this.data.format == "one-shot" ) {
        this.Drawings_Onepage_Service.ModifyDrawingOnePage2(this.data.drawing_id,this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.tags, this.fd.value.fdDescription.replace(/\n\s*\n\s*\n/g, '\n\n'))
        .subscribe(inf=>{
              location.reload();
        });
    }

    else if ( this.fd.valid && this.data.format == "artbook" ) {
        this.Drawings_Artbook_Service.ModifyArtbook2(this.data.drawing_id,this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.tags, this.fd.value.fdDescription.replace(/\n\s*\n\s*\n/g, '\n\n'))
        .subscribe(inf=>{
              location.reload();
        })
    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
    }
  }



  listOfStyles = ["Traditionnel","Digital"];
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
  allGenres: string[] = ["Abstrait","Animaux","Caricatural","Culture","Enfants","Fanart","Fanfiction","Fantaisie","Femme","Fresque","Guerre","Guerrier","Graffiti","Héroïque","Histoire","Homme","Horreur","Humour","Monstre","Paysage","Portrait",
  "Réaliste","Religion","Romantique","Science-fiction","Sociologie","Sport"];
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
    this.fdTags.updateValueAndValidity();
  }
  remove(genre: string): void {
    const index = this.genres.indexOf(genre);
    if (index >= 0) {
      this.genres.splice(index, 1);
    }
    this.fdTags.updateValueAndValidity();
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
    this.fdTags.updateValueAndValidity();

    if( this.genres.length < 3) {
      
    }
  }
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allGenres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
  }

}
