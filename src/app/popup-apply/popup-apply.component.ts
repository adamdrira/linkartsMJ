import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
import { ConstantsService } from '../services/constants.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';

import { FileUploader, FileItem } from 'ng2-file-upload';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

//ajouter une url pour upload de dossier
const url = '';

@Component({
  selector: 'app-popup-apply',
  templateUrl: './popup-apply.component.html',
  styleUrls: ['./popup-apply.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('150ms', style({opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
  ]
})
export class PopupApplyComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    public navbar: NavbarService,
    public dialogRef: MatDialogRef<PopupApplyComponent,any>,
    private ConstantsService:ConstantsService,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    dialogRef.disableClose = true;
    
    this.uploader = new FileUploader({
      itemAlias: 'cover', 
      url:url,
    });

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
    this.filteredGenres = this.genresCtrl.valueChanges.pipe(
      startWith(null),
      map((genre: string | null) => genre ? this._filter_genre(genre) : this.list_of_genres.slice()));
  }

  show_icon=false;
  ngOnInit() {
    this.build_form();

    
        
    this.uploader.onAfterAddingFile = async (file) => {
        

      var re = /(?:\.([^.]+))?$/;
      let index = this.uploader.queue.indexOf(file);
      let size = file._file.size/1024/1024;
      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="pdf"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        if(Math.trunc(size)>=10){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          
          this.uploaded_file=this.uploader.queue[0]._file.name;
          file.withCredentials = true;

          
        }
        
      }
    };
    
  }

  close_dialog(){
    this.dialogRef.close();
  }
  step=0;
  step_back() {
    if(this.step > 0) {
      this.step--;
      this.cd.detectChanges();
    }
    else {
      return;
    }
  }

  validate_step(i:number) {

    if(i==0) {
      if(this.registerForm.valid && this.uploaded_file) {
        this.step++;
        this.cd.detectChanges();
      }
      else if( !this.uploaded_file ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Veuillez télécharger votre dossier PDF"},
          panelClass: "popupConfirmationClass",
        });
      }
    }
    else if(i==1) {

    }
  }


  list_of_categories=this.ConstantsService.list_of_categories;
  registerForm: FormGroup;
  build_form() {
    this.registerForm = this.formBuilder.group({
      category: new FormControl( [], [Validators.required]),
      genres: new FormControl( this.genres, [Validators.required]),
      title:['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(pattern("text")),
        ]),
      ],
    });
  }

  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  
  @ViewChild('genresInput') genresInput: ElementRef<HTMLInputElement>;
  genresCtrl = new FormControl();
  genres: string[] = [];
  filteredGenres: Observable<string[]>;
  list_of_genres=this.ConstantsService.list_of_genres;

  genre_clicked(){
    this.genresInput.nativeElement.blur()
  }
  add_genre(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if( this.genres.length >= 15 ) {
      return;
    }

    let do_not_add:boolean = true;
    let index:number;

    // Add our genre
    if ((value || '').trim()) {

      for( let i=0; i<this.list_of_genres.length; i++ ) {
        if( this.list_of_genres[i].toLowerCase() == value.toLowerCase() ) {
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
        this.genres.push(this.list_of_genres[index].trim());
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.genresCtrl.setValue(null);
    this.registerForm.controls['genres'].updateValueAndValidity();
  }
  remove_genre(genre: string): void {
    const index = this.genres.indexOf(genre);
    if (index >= 0) {
      this.genres.splice(index, 1);
    }
    this.registerForm.controls['genres'].updateValueAndValidity();
  }
  selected_genre(event: MatAutocompleteSelectedEvent): void {
    
    

    if( this.genres.length >= 15 ) {
      this.genresInput.nativeElement.value = '';
      this.genresCtrl.setValue(null);  
      return;
    }      
    for( let i=0; i<this.genres.length; i++ ) {
      if( this.genres[i].toLowerCase() == event.option.viewValue.toLowerCase() ) {
        this.genresInput.nativeElement.value = '';
        this.genresCtrl.setValue(null);    
        return;
      }
    }
    this.genres.push(event.option.viewValue);
    this.genresInput.nativeElement.value = '';
    this.genresCtrl.setValue(null);
    this.registerForm.controls['genres'].updateValueAndValidity();
    
  }
  _filter_genre(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.list_of_genres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
  }





  uploaded_file:String;
  uploader:FileUploader;
  onFileClick(event) {
    event.target.value = '';
  }
  delete_file() {
    this.uploaded_file=undefined;
    if( this.uploader.queue[0] ) {
      this.uploader.queue[0].remove();
    }
  }




  list_of_real_delays={"1s":"1 semaine","2s":"2 semaines","3s":"3 semaines",
  "1m":"1 mois","6s":"6 semaines","7s":"7 semaines","2m":"2 mois",
  "3m":"3 mois","4m":"4 mois","5m":"5 mois","6m":"6 mois"}
  list_of_editors=[
    {
      "picture": 'pp safeurl',
      "name": 'editeur 1',
      'standard_price':0,
      'standard_delay':"4m",
      'express_price':6,
      'express_delay':"1m",
      'selected_option':'standard',//'standard' ou 'express'
    },
    {
      "picture": 'pp safeurl',
      "name": 'editeur 2',
      'standard_price':2,
      'standard_delay':"4m",
      'express_price':6,
      'express_delay':"1m",
      'selected_option':'standard',//'standard' ou 'express'
    },
    {
      "picture": 'pp safeurl',
      "name": 'editeur 3',
      'standard_price':4,
      'standard_delay':"4m",
      'express_price':6,
      'express_delay':"1m",
      'selected_option':'standard',//'standard' ou 'express'
    }
  ]
  
  total_price:number;
  update_total_price() {
    this.total_price=0;
    for(let i=0;i<this.list_of_editors.length;i++) {
      if(this.list_of_editors[i].selected_option=='standard') {
        this.total_price+=this.list_of_editors[i].standard_price;
      }
      else {
        this.total_price+=this.list_of_editors[i].express_price;
      }
    }
    this.cd.detectChanges();
  }

  set_formula(i:number, s:string) {
    this.list_of_editors[i].selected_option=s;
    this.update_total_price();
  }
  delete(i:number) {
    if(this.list_of_editors.length==1) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Vous devez conserver au moins un éditeur"},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    this.list_of_editors.splice(i,1);
    this.update_total_price();
  }




  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }


}
