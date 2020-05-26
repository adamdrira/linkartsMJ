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
    private _constants: ConstantsService, 
    private cd: ChangeDetectorRef,
    private Writing_Upload_Service:Writing_Upload_Service,
    private router: Router,
    private rd:Renderer2,
    public dialog: MatDialog,
    private Writing_CoverService:Writing_CoverService,
    private Profile_Edition_Service:Profile_Edition_Service
  ) { }


  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;


  dropdowns = this._constants.filters.categories[0].dropdowns;
  tags: string[];
  tagsValidator:boolean = false;
  user_id:number;
  pseudo:string;
  

  @Output() cancelled = new EventEmitter<any>();

  
  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;
  @ViewChild("title", {static:false}) title: ElementRef;
  
  ngOnInit() {

    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      this.pseudo = r[0].nickname;
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

  

  fwDisplayErrors: boolean = false;
  fw: FormGroup;
  fwTitle: FormControl;
  fwDescription: FormControl;
  fwCategory: FormControl;
  fwTags: FormControl;
  fwFormat: FormControl;
  color:string;
  monetised:boolean = false;

  
  createFormControlsWritings() {
    this.fwTitle = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
    this.fwDescription = new FormControl('', [Validators.required, Validators.maxLength(500), Validators.pattern("^[^\\s]+.*") ]);
    this.fwCategory = new FormControl('', Validators.required);
    this.fwTags = new FormControl('');
    this.fwFormat = new FormControl('', Validators.required);
  }

  createFormWritings() {
    this.fw = new FormGroup({
      fwTitle: this.fwTitle,
      fwDescription: this.fwDescription,
      fwCategory: this.fwCategory,
      fwTags: this.fwTags,
      fwFormat: this.fwFormat,
    });
  }



  validate_form_writing() {

    this.tags = $(".multipleSelectfw").val();

    if( this.tags.length == 0 ) {
      this.fwDisplayErrors = true;
      this.tagsValidator = false;
    }
    else {
      this.tagsValidator = true;
    }


    if ( this.fw.valid  && this.Writing_Upload_Service.get_confirmation() && this.Writing_CoverService.get_confirmation() && this.tagsValidator ) {

      this.fwDisplayErrors = false;
      this.tags = $(".multipleSelectfw").val();

      
       this.Writing_Upload_Service.CreateWriting(
          this.fw.value.fwTitle,
          this.fw.value.fwCategory, this.tags, 
          this.fw.value.fwDescription,  
          this.fw.value.fwFormat,
          this.monetised )
        .subscribe( v => {
          this.Writing_CoverService.add_covername_to_sql(v[0].writing_id).subscribe(s=>{
            this.Writing_Upload_Service.validate_writing().subscribe(r=>{this.router.navigate( [ `/account/${this.pseudo}/${this.user_id}` ] );})
          })
         
        });
      
       this.fwDisplayErrors = false; 
    }


    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
      this.fwDisplayErrors = true;
    }
  }    


  back_home() {
    this.cancelled.emit();
  }

  cancel_all(){

    this.Writing_Upload_Service.remove_writing_from_folder().subscribe();
    
  }
  
}
