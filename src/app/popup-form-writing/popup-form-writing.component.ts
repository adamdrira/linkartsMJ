import { Component, OnInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Writing_Upload_Service } from '../services/writing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
import { ConstantsService } from '../services/constants.service';
import { Location } from '@angular/common';

import { normalize_to_nfc } from '../helpers/patterns';

@Component({
  selector: 'app-popup-form-writing',
  templateUrl: './popup-form-writing.component.html',
  styleUrls: ['./popup-form-writing.component.scss']
})
export class PopupFormWritingComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupFormWritingComponent>,
    private constants:ConstantsService,
    private Writing_Upload_Service:Writing_Upload_Service,
    private navbar: NavbarService,
    public dialog: MatDialog,
    private location: Location,

    @Inject(MAT_DIALOG_DATA) public data: any) {
      
      dialogRef.disableClose = true;
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      this.filteredGenres = this.genreCtrl.valueChanges.pipe(
        startWith(null),
        map((genre: string | null) => genre ? this._filter(genre) : this.allGenres.slice()));


  }


  onScroll(e: Event) {
    window.dispatchEvent(new Event('resize'));
 }



 show_icon=false;
 ngOnInit() {
   if(this.data.firsttag){
    this.genres[0]=this.data.firsttag
    }
    if(this.data.secondtag){
    this.genres[1]=this.data.secondtag
    }
    if(this.data.thirdtag){
      this.genres[2]=this.data.thirdtag
    }
    this.createFormControlsWritings();
    this.createFormWritings();
  }


  fw: FormGroup;
  fwTitle: FormControl;
  fwDescription: FormControl;
  fwCategory: FormControl;
  fwTags: FormControl;
  

  createFormControlsWritings() {
    this.fwTitle = new FormControl(this.data.title, [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ]);
    this.fwDescription = new FormControl(this.data.highlight, [Validators.required, Validators.minLength(2), Validators.maxLength(2000), Validators.pattern( pattern("text_with_linebreaks") ) ]);
    this.fwCategory = new FormControl(this.data.style, Validators.required);
    this.fwTags = new FormControl( this.genres, [Validators.required]);
  }

  createFormWritings() {
    this.fw = new FormGroup({
      fwTitle: this.fwTitle,
      fwDescription: this.fwDescription,
      fwCategory: this.fwCategory,
      fwTags: this.fwTags,

    });
  }



  


  listOfStyles = ["Roman illustré","Roman","Scénario","Article","Poésie"];
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
  allGenres=this.constants.writings_filters;
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
    this.fwTags.updateValueAndValidity();
  }
  remove(genre: string): void {
    const index = this.genres.indexOf(genre);
    if (index >= 0) {
      this.genres.splice(index, 1);
    }
    this.fwTags.updateValueAndValidity();
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
    this.fwTags.updateValueAndValidity();

    if( this.genres.length < 3) {
      
    }
  }
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allGenres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
  }


  loading =false;
  validateForm00() {
    

    if(this.loading){
      return
    }
    
    this.loading=true;

    if ( this.fw.valid ) {
      this.Writing_Upload_Service.Modify_writing(this.data.writing_id,this.fw.value.fwTitle, this.fw.value.fwCategory, this.fw.value.fwTags, this.fw.value.fwDescription.replace(/\n\s*\n\s*\n/g, '\n\n')).subscribe(r=>{
        this.location.go(`/artwork-writing/${this.fw.value.fwTitle}/${this.data.writing_id}`);  
        location.reload();
        });
    }


    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
        panelClass: "popupConfirmationClass",
      });
    }

  }

  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }

}