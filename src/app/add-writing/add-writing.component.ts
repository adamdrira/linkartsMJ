import { Component, OnInit, ElementRef, ChangeDetectorRef, Output, EventEmitter, HostListener, ViewChild, Input, Inject, Renderer2 } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {Writing_Upload_Service} from  '../services/writing.service';
import { Router } from '@angular/router';
import { Subscribing_service } from '../services/subscribing.service';
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
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import { NavbarService } from '../services/navbar.service';
import { DOCUMENT } from '@angular/common';

import { normalize_to_nfc } from '../helpers/patterns';
import { animate, style, transition, trigger } from '@angular/animations';
import { DeviceDetectorService } from 'ngx-device-detector';


@Component({
  selector: 'app-add-writing',
  templateUrl: './add-writing.component.html',
  styleUrls: ['./add-writing.component.scss'],
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
export class AddWritingComponent implements OnInit {

  
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }


  constructor(
    private renderer: Renderer2,
    private Subscribing_service:Subscribing_service,
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private constants: ConstantsService, 
    private cd: ChangeDetectorRef,
    private Writing_Upload_Service:Writing_Upload_Service,
    private router: Router,
    public dialog: MatDialog,
    private deviceService: DeviceDetectorService,
    private Writing_CoverService:Writing_CoverService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private navbar: NavbarService,
    @Inject(DOCUMENT) private document: Document,
  ) { 

    this.REAL_step = 0;
    this.CURRENT_step = 0;
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
    this.filteredGenres = this.genreCtrl.valueChanges.pipe(
      startWith(null),
      map((genre: string | null) => genre ? this._filter(genre) : this.allGenres.slice()));

  }


  
  @ViewChild('nextButton', { read: ElementRef }) nextButton:ElementRef;
  @ViewChild('validateButton', { read: ElementRef }) validateButton:ElementRef;
  display_loading=false;


  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;

  @Input('pseudo') pseudo:string;
  visitor_name:string;
  user_id:number;
  writing_id:number;

  @Output() cancelled = new EventEmitter<any>();

  @Output() stepChanged = new EventEmitter<number>();

  REAL_step: number;
  CURRENT_step: number;
  pdfSrc:SafeUrl;
  type_of_account:string;
  user_retrieved=false;
  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;
  @ViewChild("title", {static:false}) title: ElementRef;
  
  conditions:any;
  device_info='';
  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    this.navbar.add_page_visited_to_history(`/add-writing`,this.device_info).subscribe();
    window.scroll(0,0);
    this.Writing_Upload_Service.retrieve_writing_for_options(5).subscribe(r=>{
      this.conditions=r;
    })
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      this.pseudo = r[0].nickname;
      this.visitor_name=r[0].firstname + ' ' + r[0].lastname;
      this.type_of_account=r[0].type_of_account;
      this.user_retrieved=true;
    })

    this.createFormControlsWritings();
    this.createFormWritings();

    this.stepChanged.emit(0);
  }
  load_emoji=false;

  

  show_icon=false;
 

  setMonetisation(e){
    if(e.checked){
      this.monetised = true;
   }else{
    this.monetised = false;
   }
  }

  read_conditions() {
    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.conditions},
      panelClass: "popupDocumentClass",
    }).afterClosed().subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
    });
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
    this.fwTitle = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(40), Validators.pattern( pattern("text") ) ]);
    this.fwDescription = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2000) ]);
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

  

  step_back() {

    this.stepChanged.emit(0);
    this.CURRENT_step = this.REAL_step - 1;
    this.cd.detectChanges();
  }

  validateForm00() {

    this.nextButton.nativeElement.disabled = true;
    if( ! (this.fw.value.fwDescription.replace(/\s/g, '').length>0) ) {
      this.fw.controls['fwDescription'].setValue("");
    }

    if ( this.fw.valid  && /*this.Writing_Upload_Service.get_confirmation() &&*/ this.Writing_CoverService.get_confirmation() ) {
      if( this.CURRENT_step < (this.REAL_step) ) {
        this.stepChanged.emit(1);
        this.CURRENT_step++;
        this.nextButton.nativeElement.disabled = false;
        this.cd.detectChanges();
        window.scroll(0, 0);
      }
      else {
        this.stepChanged.emit(1);
        this.CURRENT_step++;
        this.REAL_step++;

        this.nextButton.nativeElement.disabled = false;
        this.cd.detectChanges();
        window.scroll(0, 0);
      }
    }
    else {
      this.nextButton.nativeElement.disabled = false;
      if(this.fw.controls.fwTags.status=='INVALID' && this.fw.controls.fwTitle.status=='VALID' && this.fw.controls.fwDescription.status=='VALID' && this.fw.controls.fwCategory.status=='VALID'){
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

  confirmation_writing_uploaded=false;
  validate_form_writing() {
    this.validateButton.nativeElement.disabled = true;
    let list =this.Writing_Upload_Service.get_confirmation()
    this.confirmation_writing_uploaded =list[0];
    let total_pages=list[1];
    if(total_pages>=50){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Votre écrit ne peut faire plus de 50 pages'},
        panelClass: 'dialogRefClassText'
      });
      this.validateButton.nativeElement.disabled = false;
    }
    else if ( this.fw.valid  && [0] && this.confirmation_writing_uploaded ) {
       this.display_loading=true;
       this.Writing_Upload_Service.CreateWriting(
          this.fw.value.fwTitle,
          this.fw.value.fwCategory, 
          this.fw.value.fwTags, 
          this.fw.value.fwDescription.replace(/\n\s*\n\s*\n/g, '\n\n'),  
          this.monetised,
          total_pages)
        .subscribe( v => {
          this.writing_id=v[0].writing_id;
          this.Writing_CoverService.add_covername_to_sql(v[0].writing_id).subscribe(s=>{
            this.Writing_Upload_Service.validate_writing(this.writing_id).subscribe(r=>{
              this.Subscribing_service.validate_content("writing","unknown",r[0].writing_id,0).subscribe(l=>{
                this.NotificationsService.add_notification('add_publication',this.user_id,this.visitor_name,null,'writing',this.title,'unknown',v[0].writing_id,0,"add",false,0).subscribe(l=>{
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
                    is_comment_answer:false,
                    comment_id:0,
                  }
                  this.chatService.messages.next(message_to_send);
                  this.block_cancel=true;
                  this.router.navigate([`/account/${this.pseudo}/${this.user_id}`]);
                  //window.location.href = `/account/${this.pseudo}/${this.user_id}`;
                }) 
              }); 
            })
          })
         
        });
      
    }
    else {
      if( !this.fw.valid ) {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires'},
          panelClass: "popupConfirmationClass",
        });
        this.validateButton.nativeElement.disabled = false;
      }
      else if ( !this.confirmation_writing_uploaded ){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez attendre la fin du téléchargement du PDF et le valider après l\'avoir téléchargé'},
          panelClass: "popupConfirmationClass",
        });
        this.validateButton.nativeElement.disabled = false;
      }
      else {
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez télécharger une miniature, puis la valider'},
          panelClass: "popupConfirmationClass",
        });
        this.validateButton.nativeElement.disabled = false;
      }
    }
  }    


  back_home() {
    let name = this.Writing_CoverService.get_cover_name2();
    this.stepChanged.emit(0);
    this.cancelled.emit({writing_cover:name,name_writing:name});
  }

  block_cancel=false;
  cancel_all(){
    if(!this.block_cancel){
      this.Writing_Upload_Service.remove_writing_from_folder().subscribe(r=>{
        this.Writing_CoverService.remove_cover_from_folder().subscribe(m=>{
        })
      });
    }
   
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
    let data = this.fw.controls['fwDescription'].value;
    if(data){
      this.fw.controls['fwDescription'].setValue( this.fw.controls['fwDescription'].value + $event.emoji.native );
    }
    else{
      this.fw.controls['fwDescription'].setValue( $event.emoji.native )
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
