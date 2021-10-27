import { Component, OnInit, ChangeDetectorRef,ElementRef, Output, EventEmitter, ViewChild, HostListener, Input, Inject, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Bd_CoverService } from '../services/comics_cover.service';
import { ConstantsService } from '../services/constants.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl } from '@angular/platform-browser';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { pattern } from '../helpers/patterns';
import { Writing_Upload_Service } from '../services/writing.service';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import { NavbarService } from '../services/navbar.service';
import { DOCUMENT } from '@angular/common';
import { normalize_to_nfc } from '../helpers/patterns';
import { trigger, transition, style, animate } from '@angular/animations';
import { DeviceDetectorService } from 'ngx-device-detector';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-add-comic',
  templateUrl: './add-comic.component.html',
  styleUrls: ['./add-comic.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ])
      ],
    )
  ],
})

export class AddComicComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }


  constructor(
    private cd: ChangeDetectorRef,
    private renderer: Renderer2,
    private Writing_Upload_Service:Writing_Upload_Service,
    private bdOneShotService: BdOneShotService,
    private bdSerieService: BdSerieService,
    private Bd_CoverService: Bd_CoverService,
    private deviceService: DeviceDetectorService,
    public dialog: MatDialog,
    private constants:ConstantsService,
    private navbar: NavbarService,
    @Inject(DOCUMENT) private document: Document,
  ) { 
    this.REAL_step = 0;
    this.CURRENT_step = 0;
    this.modal_displayed = false;

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
    navbar.hide_help();
    this.filteredGenres = this.genreCtrl.valueChanges.pipe(
      startWith(null),
      map((genre: string | null) => genre ? this._filter(genre) : this.allGenres));

  }

  
  @ViewChild('nextButton', { read: ElementRef }) nextButton:ElementRef;

  @Input('user_id') user_id:number;
  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('pseudo') pseudo:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  @Input('type_of_account') type_of_account:string;
  @Output() started = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<any>();
  
  @Output() stepChanged = new EventEmitter<number>();

  bd_id:number;
  REAL_step: number;
  CURRENT_step: number;
  modal_displayed: boolean;
  listOfStyles_descriptions=[
    "Vous êtes un amateur de BD de genres européennes ou de BD jeunesses, et vous désirez orienter votre potentielle carrière vers ce genre ? Alors cette catégorie est faites pour vous !",
    "Vous êtes plutôt Comics et amateur de super héros de cet univers, et vous désirez orienter votre potentielle carrière vers ce genre ? Alors cette catégorie est faites pour vous !",
    "Vous êtes passionné de Mangas et de la culture japonaise en général, et vous désirez orienter votre potentielle carrière vers ce genre ? Alors cette catégorie est faites pour vous !",
    "Vous êtes passionné de bandes dessinées en tout genre mais vous ne souhaitez pas vous restreindre dans un genre en particulier ? Alors cette catégorie est faites pour vous !"
  ]
  conditions:any;
  device_info='';
  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    this.navbar.add_page_visited_to_history(`/add-comic`,this.device_info).pipe(first() ).subscribe();
   
    this.Writing_Upload_Service.retrieve_writing_for_options(5).pipe(first() ).subscribe(r=>{
      this.conditions=r;
    })
    
    this.createFormControls00();
    this.createForm00();

    this.cd.detectChanges();
    
    this.stepChanged.emit(0);
  }
  load_emoji=false;

  show_icon=false;
  

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
        panelClass: "popupConfirmationClass",
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
    let name= this.Bd_CoverService.get_cover_name2();
    this.stepChanged.emit(0);
    this.cancelled.emit({bd_cover:name});
    
  }


  step_back() {

    this.CURRENT_step = this.REAL_step - 1;
    this.stepChanged.emit(0);

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

  
  @Output() hideNavbar = new EventEmitter<any>();
  @Output() showNavbar = new EventEmitter<any>();

  read_conditions() {


    this.hideNavbar.emit();

    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.conditions},
      panelClass: "popupDocumentClass",
    }).afterClosed().pipe(first() ).subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
      this.showNavbar.emit();
    });
  }



  
  createFormControls00() {
    this.f00Title = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(40), Validators.pattern( pattern("text_title") ) ]);
    this.f00Description = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2000) ]);
    this.f00Category = new FormControl('', Validators.required);
    this.f00Tags = new FormControl( this.genres, [Validators.required]);
    this.f00Format = new FormControl('', [Validators.required]);
    this.f00SerieFirstChapter = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text_title") ) ]);
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
    this.f00SerieFirstChapter.setValidators( [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text_title") ) ] );
    this.f00SerieFirstChapter.updateValueAndValidity();
  }

  update_view() {
    this.cd.detectChanges();
  }

  validateForm00() {
    

    this.nextButton.nativeElement.disabled = true;

    if( this.f00.value.f00Format == "One-shot" ) {
      this.RemoveValidator();
    }
    else {
      this.AddValidator();
    }

    if( ! (this.f00.value.f00Description.replace(/\s/g, '').length>0) ) {
      this.f00.controls['f00Description'].setValue("");
    }


    if(this.type_of_account.includes('Artist')){
      this.monetised=true;
    }


    if ( this.f00.valid && (this.f00.value.f00Format == "One-shot") && this.Bd_CoverService.get_confirmation() ) {
        this.started.emit();
        //If MODIFICATION

        /********************** A CHANGER (ENLEVER COULEUR) ************************/
        
        if( this.CURRENT_step < (this.REAL_step) ) {
          this.bdOneShotService.ModifyBdOneShot(this.bd_id,this.f00.value.f00Title.replace(/\n\s*\n\s*\n/g, '\n\n').trim(), this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description.replace(/\n\s*\n\s*\n/g, '\n\n').trim(), this.monetised )
          .pipe(first() ).subscribe(inf=>{
            this.Bd_CoverService.add_covername_to_sql(this.bd_id,this.f00.value.f00Format).pipe(first() ).subscribe(r=>{
              this.CURRENT_step++;
              this.stepChanged.emit(1);
              
              this.nextButton.nativeElement.disabled = false;
  
              this.cd.detectChanges();
              window.scroll(0,0);
            });
           
          });
        }
        //Else if NEW Step1
        else {
          this.bdOneShotService.CreateBdOneShot(this.f00.value.f00Title.replace(/\n\s*\n\s*\n/g, '\n\n').trim(), this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description.replace(/\n\s*\n\s*\n/g, '\n\n').trim(), this.monetised )
          .pipe(first() ).subscribe((val)=> {
            this.bd_id=val[0].bd_id;
              this.Bd_CoverService.add_covername_to_sql(this.bd_id,this.f00.value.f00Format).pipe(first() ).subscribe(r=>{
                this.CURRENT_step++;
                this.stepChanged.emit(1);
                this.REAL_step++;
    
                this.nextButton.nativeElement.disabled = false;
  
                this.cd.detectChanges();
                window.scroll(0,0);
              });
             
            });
        }
    }

    else if ( this.f00.valid && (this.f00.value.f00Format == "Série") && this.Bd_CoverService.get_confirmation() ) {
        this.started.emit();
        //If MODIFICATION

        /********************** A CHANGER (ENLEVER COULEUR) ************************/
        
        if( this.CURRENT_step < (this.REAL_step) ) {
          this.bdSerieService.ModifyBdSerie(this.bd_id,this.f00.value.f00Title.replace(/\n\s*\n\s*\n/g, '\n\n').trim(), this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description.replace(/\n\s*\n\s*\n/g, '\n\n').trim(), this.monetised )
          .pipe(first() ).subscribe(inf=>{
            this.Bd_CoverService.add_covername_to_sql(this.bd_id,this.f00.value.f00Format).pipe(first() ).subscribe(m=>{
              this.bdSerieService.modify_chapter_bd_serie(this.bd_id,1,this.f00SerieFirstChapter.value).pipe(first() ).subscribe(m=>{
                this.CURRENT_step++;
                this.stepChanged.emit(1);
                this.nextButton.nativeElement.disabled = false;
                this.cd.detectChanges();
                window.scroll(0,0);
              });
              
            });
            
          });
        }
        //Else if NEW Step1
        else {
          this.bdSerieService.CreateBdSerie(this.f00.value.f00Title.replace(/\n\s*\n\s*\n/g, '\n\n').trim(), this.f00.value.f00Category, this.f00.value.f00Tags, this.f00.value.f00Description.replace(/\n\s*\n\s*\n/g, '\n\n').trim(), this.monetised )
          .pipe(first() ).subscribe((val)=> {
            this.bd_id=val[0].bd_id;
            this.Bd_CoverService.add_covername_to_sql(this.bd_id,this.f00.value.f00Format).pipe(first() ).subscribe(r=>{
              this.bdSerieService.add_chapter_bd_serie(this.bd_id,1,this.f00SerieFirstChapter.value).pipe(first() ).subscribe( r=>{
                this.CURRENT_step++;
                this.stepChanged.emit(1);
                this.REAL_step++;
    
                this.nextButton.nativeElement.disabled = false;
    
                this.cd.detectChanges();
                window.scroll(0,0);
                }
              );
              
            });
           
            });
        }
        
    }

    else {
      this.nextButton.nativeElement.disabled = false;
      if( !this.f00.valid ) {
   
        if(this.f00.value.f00Format == "Série" &&  this.f00.controls.f00Tags.status=='INVALID' && this.f00.controls.f00Title.status=='VALID' && this.f00.controls.f00Description.status=='VALID' && this.f00.controls.f00Category.status=='VALID' &&  this.f00.controls.f00SerieFirstChapter.status=='VALID'){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Le formulaire est incorrect. Veillez à saisir des genres valides'},
            panelClass: "popupConfirmationClass",
          });
        }
        else if(this.f00.value.f00Format == "One-shot" &&  this.f00.controls.f00Tags.status=='INVALID' && this.f00.controls.f00Title.status=='VALID' && this.f00.controls.f00Description.status=='VALID' && this.f00.controls.f00Category.status=='VALID' &&  this.f00.controls.f00SerieFirstChapter.status=='VALID'){
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
      else {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez saisir une miniature, puis la valider'},
          panelClass: "popupConfirmationClass",
        });
      }
    }
    
  }
  
  cancel_all() {
    this.Bd_CoverService.remove_cover_from_folder().pipe(first() ).subscribe(r=>{
    });
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

  @ViewChild('input') input:ElementRef;
  index_of_selected_input=-1;
  blur(event) {
    this.index_of_selected_input=this.input.nativeElement.selectionStart;
  }
  handleClick($event) {
    //this.selectedEmoji = $event.emoji;
    let data = this.f00.controls['f00Description'].value;

   
    if(data){
      this.f00.controls['f00Description'].setValue( data.substring(0,this.index_of_selected_input) + $event.emoji.native + data.substring(this.index_of_selected_input,data.length) );
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
