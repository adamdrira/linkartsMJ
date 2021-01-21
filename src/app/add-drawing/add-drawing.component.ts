import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Drawings_CoverService } from '../services/drawings_cover.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service} from '../services/drawings_artbook.service';
import { Subscribing_service } from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl } from '@angular/platform-browser';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { pattern } from '../helpers/patterns';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { startWith, map } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { Writing_Upload_Service } from '../services/writing.service';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';

declare var $: any;

@Component({
  selector: 'app-add-drawing',
  templateUrl: './add-drawing.component.html',
  styleUrls: ['./add-drawing.component.scss'],
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
export class AddDrawingComponent implements OnInit {


  constructor(
    private Subscribing_service:Subscribing_service,
    private rd: Renderer2, 
    private Drawings_CoverService:Drawings_CoverService,
    private el: ElementRef,
    private Writing_Upload_Service:Writing_Upload_Service,
    private _constants: ConstantsService, 
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private viewref: ViewContainerRef,
    private Profile_Edition_Service:Profile_Edition_Service,
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

  
  @ViewChild('nextButton', { read: ElementRef }) nextButton:ElementRef;

  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('pseudo') pseudo:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  
  @Output() started = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<any>();
  
  @Output() stepChanged = new EventEmitter<number>();
  drawing_id:number;
  dropdowns = this._constants.filters.categories[0].dropdowns;
  REAL_step: number;
  CURRENT_step: number;
  modal_displayed: boolean;
  type_of_account:string;
  user_retrieved=false;
  conditions:any;

  ngOnInit() {

    this.Writing_Upload_Service.retrieve_writing_for_options(5).subscribe(r=>{
      this.conditions=r;
    })
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.type_of_account=r[0].type_of_account;
      this.user_retrieved=true;
    })
    this.createFormControlsDrawings();
    this.createFormDrawings();

    this.cd.detectChanges();

    this.stepChanged.emit(0);
  }

  show_icon=false;
  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
  }

  

  back_home() {
    let covername = this.Drawings_CoverService.get_covername()
    this.stepChanged.emit(0);
    this.cancelled.emit({drawing_cover:covername});
  }

  step_back() {

    this.stepChanged.emit(0);
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
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.conditions},
      panelClass: "popupDocumentClass",
    });
  }


  format_change_alert() {
    if( (this.REAL_step != this.CURRENT_step) && (!this.modal_displayed) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Attention, changer le format annulera toute la sélection de l\'étape 2'},
        panelClass: "popupConfirmationClass",
      });
      this.modal_displayed = true;
    }
  }

  onFormatChange(e:any) {

    if( (this.REAL_step != this.CURRENT_step) ) {
      this.REAL_step--;
      this.modal_displayed = true;
      this.cd.detectChanges();
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
    this.fdDescription = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2000), Validators.pattern( pattern("text_with_linebreaks") ) ]);
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


    this.nextButton.nativeElement.disabled = true;

    if ( this.fd.valid  && (this.fd.value.fdFormat == "Œuvre unique") ) {

      if( this.CURRENT_step < (this.REAL_step) ) {
        this.Drawings_Onepage_Service.ModifyDrawingOnePage(this.drawing_id,this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.fdTags, this.fd.value.fdDescription.replace(/\n\s*\n\s*\n/g, '\n\n'), false)
        .subscribe(inf=>{
          this.stepChanged.emit(1);
          this.CURRENT_step++;

          this.nextButton.nativeElement.disabled = false;

          this.cd.detectChanges();
          window.scroll(0,0);
        });
      }
      else {
        this.Drawings_Onepage_Service.CreateDrawingOnepage(this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.fdTags, this.fd.value.fdDescription.replace(/\n\s*\n\s*\n/g, '\n\n'), false).subscribe(val=> {
          this.Subscribing_service.add_content('drawing', 'one-shot', val[0].drawing_id,0).subscribe(r=>{
            this.drawing_id=val[0].drawing_id;
            this.stepChanged.emit(1);
            this.CURRENT_step++;
            this.REAL_step++;
  
            this.nextButton.nativeElement.disabled = false;

            this.cd.detectChanges();
            window.scroll(0,0);
          });
          });
      }

    }

    else if ( this.fd.valid  && (this.fd.value.fdFormat == "Artbook") ) {

        if( this.CURRENT_step < (this.REAL_step) ) {
          this.Drawings_Artbook_Service.ModifyArtbook(this.drawing_id,this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.fdTags, this.fd.value.fdDescription.replace(/\n\s*\n\s*\n/g, '\n\n'), this.monetised)
          .subscribe(inf=>{
            this.stepChanged.emit(1);
            this.CURRENT_step++;
           
            this.nextButton.nativeElement.disabled = false;
            
            this.cd.detectChanges();
            window.scroll(0,0);
          });
        }
        else {
          this.Drawings_Artbook_Service.CreateDrawingArtbook(this.fd.value.fdTitle, this.fd.value.fdCategory, this.fd.value.fdTags,this.fd.value.fdDescription.replace(/\n\s*\n\s*\n/g, '\n\n'), this.monetised)
          .subscribe((val)=> {
            this.Subscribing_service.add_content('drawing', 'artbook', val[0].drawing_id,0).subscribe(r=>{
              this.stepChanged.emit(1);
              this.CURRENT_step++;
              this.REAL_step++;
              this.drawing_id=val[0].drawing_id;
              this.nextButton.nativeElement.disabled = false;

              this.cd.detectChanges();
              window.scroll(0,0);
            });
            
            });
        }

       
    }

    else {
      this.nextButton.nativeElement.disabled = false;
      
      if(this.fd.controls.fdTags.status=='INVALID' && this.fd.controls.fdTitle.status=='VALID' && this.fd.controls.fdDescription.status=='VALID' && this.fd.controls.fdCategory.status=='VALID' &&  this.fd.controls.fdFormat.status=='VALID'){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le formulaire est incorrect. Veillez à saisir des genres valides'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires'},
          panelClass: "popupConfirmationClass",
        });
      }

      
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

  allGenres: string[] = ["Abstrait","Animaux","Caricatural","Culture","Enfants","Fanart","Fanfiction","Fantaisie","Femme","Fresque","Guerre","Guerrier","Graffiti","Héroïque","Histoire","Homme","Horreur","Humour","Monstre","Paysage","Portrait",
  "Réaliste","Religion","Romantique","SF","Sociologie","Sport"];
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