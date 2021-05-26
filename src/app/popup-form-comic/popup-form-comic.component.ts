import { Component, OnInit, Inject,ViewChild, ElementRef, Renderer2, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { BdSerieService } from '../services/comics_serie.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
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
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-popup-form-comic',
  templateUrl: './popup-form-comic.component.html',
  styleUrls: ['./popup-form-comic.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class PopupFormComicComponent implements OnInit {

  constructor(
    private renderer: Renderer2,
    private cd:ChangeDetectorRef,
    public dialogRef: MatDialogRef<PopupFormComicComponent>,
    private BdSerieService:BdSerieService,
    private BdOneShotService:BdOneShotService,
    private navbar: NavbarService,
    private location: Location,
    private constants:ConstantsService,
    public dialog: MatDialog,



    @Inject(MAT_DIALOG_DATA) public data: any) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      dialogRef.disableClose = true;
      
      this.filteredGenres = this.genreCtrl.valueChanges.pipe(
        startWith(null),
        map((genre: string | null) => genre ? this._filter(genre) : this.allGenres.slice()));
  
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
    this.createFormControls00();
    this.createForm00();

    for( let i = 0 ; i < this.data.chapterList.length; i ++ ) {
      this.addChapter();
      (<FormArray>this.f00.get('chapters')).controls[ i ].setValue( this.data.chapterList[i].title );
    }
  }
  load_emoji=false;

  
  /********************************* */
  /********Comic information******** */
  /********************************* */
  f00: FormGroup;
  f00Title: FormControl;
  f00Description: FormControl;
  f00Category: FormControl;
  f00Tags: FormControl;

 

  createFormControls00() {
    this.f00Title = new FormControl(this.data.title, [Validators.required, Validators.minLength(2), Validators.maxLength(40), Validators.pattern( pattern("text_title") ) ]);
    this.f00Description = new FormControl(this.data.highlight, [Validators.required, Validators.minLength(2), Validators.maxLength(2000) ]);
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
  addChapter() { this.chapters.push(new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text_title") ) ])); }


  loading=false;

  validateForm00() {

    if(this.loading){
      return
    }
    this.loading=true;

    
    if( ! (this.f00.value.f00Description.replace(/\s/g, '').length>0) ) {
      this.f00.controls['f00Description'].setValue("");
    }

    if ( this.f00.valid && this.data.format == "one-shot" ) {
        this.BdOneShotService.ModifyBdOneShot2(this.data.bd_id,this.f00.value.f00Title.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,''), this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,''))
        .subscribe(inf=>{
          let title=this.f00.value.f00Title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
          this.location.go(`/artwork-comic/one-shot/${title}/${this.data.bd_id}`);
          location.reload();
        });
    }

    else if ( this.f00.valid && this.data.format == "serie" ) {
        this.BdSerieService.ModifyBdSerie2(this.data.bd_id,this.f00.value.f00Title.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,''), this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,''))
        .subscribe(inf=>{
          for( let i = 0 ; i < this.data.chapterList.length; i ++ ) {
            this.BdSerieService.modify_chapter_bd_serie2(this.data.bd_id,i+1,this.chapters.value[i]).subscribe(r=>{
              if(i==this.data.chapterList.length-1){
                let title=this.f00.value.f00Title.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
                this.location.go(`/artwork-comic/serie/${title}/${this.data.bd_id}/${this.data.current_chapter}`);
                location.reload();
              }
            });
          }
        });
    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires'},
        panelClass: "popupConfirmationClass",
      });
      this.loading=false;
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
  allGenres=this.constants.comics_filters;
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


  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }

  show_emojis=false;
  emojis_already_loaded=false;
  emojis_button_clicked=false;
  set = 'native';
  native = true;
  @ViewChild('emojis') emojis:ElementRef;
  @ViewChild('emojisSpinner') emojisSpinner:ElementRef;
  @ViewChild('emoji_button') emoji_button:ElementRef;
  
  

  open_emojis(){

    if( this.emojis_button_clicked == true ) {
      return;
    }

    this.emojis_button_clicked = true;
    if( !this.show_emojis ) {
      this.renderer.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'visible');
    }
    else {
      this.renderer.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'hidden');
    }

    this.load_emoji=true;
    
    if( !this.emojis_already_loaded ) {
      let THIS = this;
      setTimeout(function () {
        if( !THIS.show_emojis ) {
          THIS.show_emojis=true;
          THIS.cd.detectChanges();
          THIS.renderer.setStyle(THIS.emojis.nativeElement, 'visibility', 'visible');
        }
        else {
          THIS.renderer.setStyle(THIS.emojis.nativeElement, 'visibility', 'hidden');
          THIS.show_emojis=false;
          THIS.cd.detectChanges();
        }
        THIS.emojis_already_loaded = true;
        THIS.emojis_button_clicked = false;
      }, 2000);
    }
    else {
      if( !this.show_emojis ) {
        this.show_emojis=true;
        this.cd.detectChanges();
        this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'visible');
      }
      else {
        this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
        this.show_emojis=false;
        this.cd.detectChanges();
      }
      this.emojis_button_clicked = false;
    }
  }

  handleClick($event) {
    //this.selectedEmoji = $event.emoji;
    let data = this.f00.controls['f00Description'].value;
    if(data){
      this.f00.controls['f00Description'].setValue( this.f00.controls['f00Description'].value + $event.emoji.native );
    }
    else{
      this.f00.controls['f00Description'].setValue( $event.emoji.native )
    }
    this.cd.detectChanges();
  }
  
  //click lisner for emojis, and research chat
  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.show_emojis){
      if (!(this.emojis.nativeElement.contains(btn) || this.emoji_button.nativeElement.contains(btn))){
        this.renderer.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'hidden');
        this.renderer.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
        this.show_emojis=false;
      }
    }
  }

}
