import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service} from '../services/drawings_artbook.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl } from '@angular/platform-browser';

import { pattern } from '../helpers/patterns';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { startWith, map } from 'rxjs/operators';


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
  

  dropdowns = this._constants.filters.categories[0].dropdowns;
  REAL_step: number;
  CURRENT_step: number;
  modal_displayed: boolean;


  ngOnInit() {

    this.createFormControlsDrawings();
    this.createFormDrawings();

    this.cd.detectChanges();

  }

  ngAfterContentInit() {
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


  onFormatChange(e:any) {


    if( (this.REAL_step != this.CURRENT_step) && (!this.modal_displayed) ) {

      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:true, text:'Attention, la sélection actuelle sera supprimée'},
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if( result ) {
          this.REAL_step--;
          this.modal_displayed = true;
          this.cd.detectChanges();
        }
        else {
          if( this.fd.controls['fdFormat'].value == "Œuvre unique" ) {
            this.fd.controls['fdFormat'].setValue("Artbook");
          }
          else {
            this.fd.controls['fdFormat'].setValue("Œuvre unique");
          }
          this.cd.detectChanges();
        }
      });

    }

  }




  fd: FormGroup;
  fdTitle: FormControl;
  fdDescription: FormControl;
  fdCategory: FormControl;
  fdTags: FormControl;
  fdFormat: FormControl;
  monetised:boolean = false;
  
  createFormControlsDrawings() {
    this.fdTitle = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ]);
    this.fdDescription = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(500), Validators.pattern( pattern("text") ) ]);
    this.fdCategory = new FormControl('', [Validators.required]);
    this.fdTags = new FormControl( this.genres , [Validators.required]);
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


    if ( this.fd.valid  && (this.fd.value.fdFormat == "Œuvre unique") ) {

      if( this.CURRENT_step < (this.REAL_step) ) {
        this.Drawings_Onepage_Service.ModifyDrawingOnePage(this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.fdTags, this.fd.value.fdDescription, this.monetised)
        .subscribe(inf=>{
          this.CURRENT_step++;

          this.cd.detectChanges();
          window.scroll(0,0);
        });
      }
      else {
        this.Drawings_Onepage_Service.CreateDrawingOnepage(this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.fdTags, this.fd.value.fdDescription, this.monetised)
        .subscribe((val)=> {
          this.CURRENT_step++;
          this.REAL_step++;

          this.cd.detectChanges();
          window.scroll(0,0);
          });
      }

    }

    else if ( this.fd.valid  && (this.fd.value.fdFormat == "Artbook") ) {

        if( this.CURRENT_step < (this.REAL_step) ) {
          this.Drawings_Artbook_Service.ModifyArtbook(this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.fdTags, this.fd.value.fdDescription, this.monetised)
          .subscribe(inf=>{
            this.CURRENT_step++;

            this.cd.detectChanges();
            window.scroll(0,0);
          });
        }
        else {
          this.Drawings_Artbook_Service.CreateDrawingArtbook(this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.fdTags,this.fd.value.fdDescription, this.monetised)
          .subscribe((val)=> {
            this.CURRENT_step++;
            this.REAL_step++;

            this.cd.detectChanges();
            window.scroll(0,0);
            });
        }

       
    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
    }

  }



  //AJOUTÉ
  listOfFormats = ["Œuvre unique","Artbook"];
  listOfCategories = ["Traditionnel","Digital"];
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

  allGenres: string[] = ["Abstrait","Action","Aventure","Animaux","Enfants","Epique","Esotérisme","Fanart","Fantaisie","Femme","Fresque","Guerre","Graffiti","Héroïque","Histoire","Homme","Horreur","Humour","Journalisme","Monstre","Paysage","Portrait","Philosophie",
  "Policier","Réaliste","Religion","Romantique","Science-fiction","Sociologie","Sport","Western"];
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
  }
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allGenres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
  }

  

}