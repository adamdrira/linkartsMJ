import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Ads_service} from '../services/ads.service';
import { Drawings_Artbook_Service} from '../services/drawings_artbook.service';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { UploaderPicturesAdComponent } from '../uploader-pictures-ad/uploader-pictures-ad.component';
import { SafeUrl } from '@angular/platform-browser';


declare var $: any;

@Component({
  selector: 'app-add-ad',
  templateUrl: './add-ad.component.html',
  styleUrls: ['./add-ad.component.scss'],
})
export class AddAdComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }



  constructor(
    private rd: Renderer2, 
    private el: ElementRef,
    private _constants: ConstantsService, 
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private viewref: ViewContainerRef,
    private Ads_service:Ads_service,
    private CookieService: CookieService,
    private router:Router,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    public dialog: MatDialog,
  ) { 
    
    this.CURRENT_step = 0;
  }

  
  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  @Input('pseudo') pseudo:string;
  @Input('id') id:number;

  @Output() started = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<any>();
  

  dropdowns = this._constants.filters.categories[0].dropdowns;
  CURRENT_step: number;
  targets: string[];
  tagsValidator:boolean = false;

  status_pictures:boolean=false;
  pictures_uploaded:boolean=false;
  attachments_uploaded:boolean=false;
  id_ad=0;

  ngOnInit() {

    this.createFormControlsDrawings();
    this.createFormAd();

    this.initialize_selectors();
    this.initialize_tagtargets_fd();

    this.cd.detectChanges();

  }

  ngAfterContentInit() {
      this.initialize_tagtargets_fd();
  }

  

  back_home() {
    this.cancelled.emit();
  }



  initialize_selectors() {

    let THIS = this;

    $(document).ready(function () {
      $('.fdselect0').SumoSelect({});
    });
    $(document).ready(function () {
      $('.fdselect1').SumoSelect({});
    });

    this.cd.detectChanges();

    
    $(".fdselect0").change(function(){

      THIS.fd.controls['fdMydescription'].setValue( $(this).val() );

    });
    


    $(".fdselect1").change(function(){
      THIS.fd.controls['fdProject_type'].setValue( $(this).val() );
    });


  }


  initialize_tagtargets_fd() {

    $('.multipleSelectfd').fastselect({
      maxItems: 2
    });
    
    this.cd.detectChanges();

  }



  fdDisplayErrors: boolean = false;
  fd: FormGroup;
  fdTitle: FormControl;
  fdDescription: FormControl;
  fdMydescription: FormControl;
  fdTargets: FormControl;
  fdProject_type: FormControl;
  fdPreferential_location: FormControl;
  monetised:boolean = false;
  
  createFormControlsDrawings() {
    this.fdTitle = new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
    this.fdDescription = new FormControl('', [Validators.required, Validators.maxLength(1000), Validators.pattern("^[^\\s]+.*") ]);
    this.fdMydescription= new FormControl('', Validators.required);
    this.fdTargets = new FormControl('');
    this.fdProject_type = new FormControl('', Validators.required);
    this.fdPreferential_location=new FormControl('', [Validators.maxLength(30), Validators.pattern("^[^\\s]+.*") ]);
  }

  createFormAd() {
    this.fd = new FormGroup({
      fdTitle: this.fdTitle,
      fdDescription: this.fdDescription,
      fdMydescription: this.fdMydescription,
      fdTargets: this.fdTargets,
      fdProject_type: this.fdProject_type,
      fdPreferential_location:this.fdPreferential_location
    });
  }


  all_pictures_uploaded( event: boolean) {
    this.pictures_uploaded = event;

    if(this.attachments_uploaded && this.pictures_uploaded){
      console.log("tous les téléchargments sont finis/ pictures");
      this.router.navigate( [ `/account/${this.pseudo}/${this.id}` ] );
    }

    if(!event) {
      alert("problème lors du télechargement");
    }

  }

  all_pictures_uploaded1( event: boolean) {
    this.attachments_uploaded = event;

    if(this.attachments_uploaded && this.pictures_uploaded){
      console.log("tous les téléchargments sont finis/ attachments");
      this.router.navigate( [ `/account/${this.pseudo}/${this.id}` ] );
    }

    if(!event) {
      alert("problème lors du télechargement");
    }

  }


  validate_form_ads() {


    this.targets = $(".multipleSelectfd").val();
    if( this.targets.length == 0 ) {
      this.fdDisplayErrors = true;
      this.tagsValidator = false;
    }
    else {
      this.tagsValidator = true;
    }

    if ( this.fd.valid  && this.tagsValidator && this.Ads_service.get_thumbnail_confirmation() ) {
       this.targets = $(".multipleSelectfd").val();
        console.log('ok1')
        this.Ads_service.add_primary_information_ad(this.fd.value.fdTitle, this.fd.value.fdProject_type,this.fd.value.fdDescription, this.fd.value.fdMydescription,this.targets)
          .subscribe((val)=> {
            this.Ads_service.add_thumbnail_ad_to_database(val[0].id).subscribe(l=>{
              this.status_pictures=true;
              this.id_ad=l[0].id
              console.log(l);
            })           
          });

        this.fdDisplayErrors = false;
    }


    else if(this.fd.valid  && this.tagsValidator && !this.Ads_service.get_thumbnail_confirmation()){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'La photo de présentation doit être uplaodée'},
      });

    }
    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
      });
      this.fdDisplayErrors = true;
    }

  }

  cancel_all(){ 

      this.Ads_service.remove_thumbnail_ad_from_folder().subscribe();
    
  }



}