import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, HostListener, ViewChild, Input } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {Writing_Upload_Service} from  '../services/writing.service';
import { Router } from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Writing_CoverService } from '../services/writing_cover.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl } from '@angular/platform-browser';
import { startWith, map } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';

import { pattern } from '../helpers/patterns';
import {NotificationsService} from '../services/notifications.service';
import { ChatService} from '../services/chat.service';

declare var $: any;

@Component({
  selector: 'app-add-writing',
  templateUrl: './add-writing.component.html',
  styleUrls: ['./add-writing.component.scss']
})
export class AddWritingComponent implements OnInit {

  
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }


  constructor(
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private _constants: ConstantsService, 
    private cd: ChangeDetectorRef,
    private Writing_Upload_Service:Writing_Upload_Service,
    private router: Router,
    public dialog: MatDialog,
    private Writing_CoverService:Writing_CoverService,
    private Profile_Edition_Service:Profile_Edition_Service
  ) { 

    this.filteredGenres = this.genreCtrl.valueChanges.pipe(
      startWith(null),
      map((genre: string | null) => genre ? this._filter(genre) : this.allGenres.slice()));

  }


  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;

  @Input('pseudo') pseudo:string;
  visitor_name:string;
  dropdowns = this._constants.filters.categories[0].dropdowns;
  user_id:number;


  @Output() cancelled = new EventEmitter<any>();

  
  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;
  @ViewChild("title", {static:false}) title: ElementRef;
  
  ngOnInit() {

    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      this.pseudo = r[0].nickname;
      this.visitor_name=r[0].firstname + ' ' + r[0].lastname;
    })

    this.createFormControlsWritings();
    this.createFormWritings();


  }

  ngAfterContentInit() {

    this.initialize_selectors();
    this.initialize_taginputs_fw();
    this.cd.detectChanges();
  }

  ngAfterViewInit() {



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

  
  initialize_selectors() {

    let THIS = this;

    $(document).ready(function () {
      $('.fwselect0').SumoSelect({});
    });
    $(document).ready(function () {
      $('.fwselect1').SumoSelect({});
    });
    $(document).ready(function () {
      $('.fwselect3').SumoSelect({});
    });

    this.cd.detectChanges();

    
    $(".fwselect0").change(function(){
      THIS.fw.controls['fwFormat'].setValue( $(this).val() );
      THIS.cd.detectChanges();
    });
    
    $(".fwselect1").change(function(){
      THIS.fw.controls['fwCategory'].setValue( $(this).val() );
      THIS.cd.detectChanges();
    });

  }


  initialize_taginputs_fw() {

    $('.multipleSelectfw').fastselect({
      maxItems: 3
    });
    
    this.cd.detectChanges();

  }

  
  fw: FormGroup;
  fwTitle: FormControl;
  fwDescription: FormControl;
  fwCategory: FormControl;
  fwTags: FormControl;
  fwFormat: FormControl;
  color:string;
  monetised:boolean = false;

  
  createFormControlsWritings() {
    this.fwTitle = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ]);
    this.fwDescription = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(500), Validators.pattern( pattern("text") ) ]);
    this.fwCategory = new FormControl('', [Validators.required]);
    this.fwTags = new FormControl( this.genres , [Validators.required]);
    //this.fwFormat = new FormControl('', Validators.required);
  }

  createFormWritings() {
    this.fw = new FormGroup({
      fwTitle: this.fwTitle,
      fwDescription: this.fwDescription,
      fwCategory: this.fwCategory,
      fwTags: this.fwTags,
      //fwFormat: this.fwFormat,
    });
  }



  validate_form_writing() {

    
    if ( this.fw.valid  && this.Writing_Upload_Service.get_confirmation() && this.Writing_CoverService.get_confirmation() ) {

      
       this.Writing_Upload_Service.CreateWriting(
          this.fw.value.fwTitle,
          this.fw.value.fwCategory, 
          this.fw.value.fwTags, 
          this.fw.value.fwDescription,  
          this.monetised )
        .subscribe( v => {
          this.Writing_CoverService.add_covername_to_sql(v[0].writing_id).subscribe(s=>{
            this.Writing_Upload_Service.validate_writing().subscribe(r=>{
              this.NotificationsService.add_notification('add_publication',this.user_id,this.visitor_name,null,'writing',this.title,'unknown',v[0].writing_id,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"add_publication",
                  id_user_name:this.visitor_name,
                  id_user:this.user_id, 
                  publication_category:'writing',
                  publication_name:this.title,
                  format:'unknown',
                  publication_id:v[0].writing_id,
                  chapter_number:0,
                  information:"add",
                  status:"unchecked",
                }
                this.chatService.messages.next(message_to_send);
                this.router.navigate( [ `/account/${this.pseudo}/${this.user_id}` ] );
              }) 
              
            })
          })
         
        });
      
    }


    else {
      if( !this.fw.valid ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
        });
      }
      else if ( !this.Writing_Upload_Service.get_confirmation() ){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez télécharger l\'écrit en PDF, puis le valider.'},
        });
      }
      else {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez saisir une miniature, puis la valider.'},
        });
      }
    }
  }    


  back_home() {
    this.cancelled.emit();
  }

  cancel_all(){
    this.Writing_Upload_Service.remove_writing_from_folder().subscribe();
  }

  
  //AJOUTÉ
  listOfCategories = ["Roman illustré","Roman","Scénario","Article","Poésie"];
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

  allGenres: string[] = ["Action","Aventure","Enfants","Epique","Esotérisme","Fanfiction","Fantaisie","Guerre","Héroïque","Histoire","Horreur","Humour","Journalisme","Philosophie",
  "Policier","Réaliste","Religion","Romantique","Science-fiction","Sociologie","Sport","Thriller","Western"];
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
  }
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allGenres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
  }


  
}
