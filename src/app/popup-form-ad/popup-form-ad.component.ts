import { trigger, transition, style, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { ConstantsService } from '../services/constants.service';
import { Ads_service } from '../services/ads.service';
import { NavbarService } from '../services/navbar.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-popup-form-ad',
  templateUrl: './popup-form-ad.component.html',
  styleUrls: ['./popup-form-ad.component.scss'],
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
export class PopupFormAdComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupFormAdComponent>,
    private navbar: NavbarService,
    private Ads_service:Ads_service,
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
  
  }

  show_icon=false;
  
  ngOnInit(): void {

    this.remuneration = this.data.item.remuneration;
    this.for_service = this.data.item.service;
    this.volunteer = !this.remuneration && !this.for_service;


    this.createFormControlsAds();
    this.createFormAd();


  }


  fd: FormGroup;
  fdTitle: FormControl;
  fdDescription: FormControl;
  fdPrice:FormControl;
  fdPrice_type: FormControl;
  fdPrice1:FormControl;
  fdPrice_type1: FormControl;
  fdOffer_demand: FormControl;
  price_value:string;
  price_value1:string;
  price_type:string='';
  price_type1:string='';
  offer_or_demand:string='';
  fdPreferential_location: FormControl;

  remuneration:boolean = false;
  volunteer:boolean = true;
  for_service:boolean = false;

  
  listOfTypes = this.constants.ads_types;
  listOffers=this.constants.offers_or_demands;
  listOfPriceTypes = this.constants.price_types_remunerated;
  listOfPriceTypes1 = this.constants.price_types_services;
  listOfDescriptions = this.constants.ads_descriptions;

  createFormControlsAds() {
    this.fdTitle = new FormControl(this.data.item.title, [Validators.required, Validators.minLength(2), Validators.maxLength(40), Validators.pattern( pattern("text") ) ]);
    this.fdDescription = new FormControl(this.data.item.description, [Validators.required, Validators.minLength(2), Validators.maxLength(2000), Validators.pattern( pattern("text") ) ]);
    this.fdPrice = new FormControl(this.data.item.price_value, [Validators.minLength(1), Validators.maxLength(15), Validators.pattern( pattern("classic") ) ]);
    this.fdPrice_type = new FormControl(this.data.item.price_type?this.data.item.price_type:'');
    this.fdPrice1 = new FormControl(this.data.item.price_value_service, [Validators.minLength(1), Validators.maxLength(15), Validators.pattern( pattern("classic") ) ]);
    this.fdPrice_type1 = new FormControl(this.data.item.price_type_service?this.data.item.price_type_service:'');
    this.fdOffer_demand= new FormControl(this.data.item.offer_or_demand);
    this.fdPreferential_location = new FormControl(this.data.item.location, [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("location") ) ]);
  }

  createFormAd() {
    this.fd = new FormGroup({
      fdTitle: this.fdTitle,
      fdPreferential_location:this.fdPreferential_location,
      fdPrice: this.fdPrice,
      fdPrice_type: this.fdPrice_type,
      fdPrice1: this.fdPrice1,
      fdPrice_type1: this.fdPrice_type1,
      fdOffer_demand:this.fdOffer_demand,
      fdDescription:  this.fdDescription,
    });
  }

  loading=false;

  
  
  validate_form_ads() {
    if(this.loading){
      return
    }

    this.loading=true;
    
    if(this.remuneration && !this.fd.valid){
      if(this.fd.value.fdPrice.length==0){
        this.price_value ="0";
      }
    }
    else if(this.remuneration && this.fd.valid){
      this.price_value =(this.fd.value.fdPrice!='')?this.fd.value.fdPrice:'0';
    }
    else if(!this.remuneration){
      this.price_value ="0";
    }
    

    if(this.for_service && !this.fd.valid){
      if(this.fd.value.fdPrice1.length==0){
        this.price_value1 ="0";
      }
    }
    else if(this.for_service && this.fd.valid){
      this.price_value1 =(this.fd.value.fdPrice1!='')?this.fd.value.fdPrice1:'0';
    }
    else if(!this.for_service){
      this.price_value1 ="0";
    }

   
    if ( this.fd.valid && !(this.remuneration && this.for_service)) {
      this.Ads_service.edit_primary_information_ad(this.data.item.id,this.fd.value.fdTitle,this.fd.value.fdDescription.replace(/\n\s*\n\s*\n/g, '\n\n'),this.fd.value.fdPreferential_location,this.remuneration,this.price_value,this.price_type,this.for_service,this.price_value1,this.price_type1,this.offer_or_demand).subscribe(r=> {
        let title=this.fd.value.fdTitle.replace(/\%/g, '%25').replace(/\;/g, '%3B').replace(/\#/g, '%23').replace(/\=/g, '%3D').replace(/\&/g, '%26').replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/\ /g, '%20').replace(/\?/g, '%3F').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\:/g, '%3A');
        this.location.go(`/ad-page/${title}/${this.data.item.id}`);
        location.reload();         
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


  setVolunteer(e){
    if(e.checked){
      this.volunteer = true;
      this.remuneration = false;
      this.for_service = false;
    }

  }

  setRemuneration(e){
    if(e.checked){
      
      if(this.for_service){
        this.for_service = false;
      }
      this.volunteer = false;
      this.remuneration = true;
    }
    else{
      this.volunteer = true;
      this.remuneration = false;
    }

  }

 
  setService(e){

    
    if(e.checked){
      
      if(this.remuneration){
        this.remuneration = false;
      }
      this.for_service = true;
      this.volunteer = false;
    }
    else{
      this.volunteer = true;
      this.for_service = false;
    }
  }
  
  change_price_type(event){
    if(this.fd.value.fdPrice_type=="Réinitialiser"){
      this.fd.controls['fdPrice_type'].setValue(null);
      this.fd.controls['fdPrice_type'].updateValueAndValidity();
      this.price_type='';
    }
    else{
      this.price_type=this.fd.value.fdPrice_type;
    }
  }

  change_price_type_service(event){
    if(this.fd.value.fdPrice_type1=="Réinitialiser"){
      this.fd.controls['fdPrice_type1'].setValue(null);
      this.fd.controls['fdPrice_type1'].updateValueAndValidity();
      this.price_type1='';
    }
    else{
      this.price_type1=this.fd.value.fdPrice_type1;
    }
  }



  change_offer_and_demand(event){
    if(this.fd.value.fdOffer_demand=="Réinitialiser"){
      this.fd.controls['fdOffer_demand'].setValue(null);
      this.fd.controls['fdOffer_demand'].updateValueAndValidity();
      this.offer_or_demand='';
    }
    else{
      this.offer_or_demand=this.fd.value.fdOffer_demand;
    }
  }


  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }


  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }
  
}
