import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, Input, HostListener, ViewChild } from '@angular/core';
import { ConstantsService } from '../services/constants.service';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Ads_service} from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import {Subscribing_service}from '../services/subscribing.service';
import { SafeUrl } from '@angular/platform-browser';

import {NotificationsService}from '../services/notifications.service';
import {ChatService}from '../services/chat.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { pattern } from '../helpers/patterns';
import { trigger, transition, style, animate } from '@angular/animations';


declare var $: any;

@Component({
  selector: 'app-add-ad',
  templateUrl: './add-ad.component.html',
  styleUrls: ['./add-ad.component.scss'],
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
export class AddAdComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event) { 
    this.cancel_all();
  }



  constructor(
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private _constants: ConstantsService, 
    private cd: ChangeDetectorRef,
    private Ads_service:Ads_service,
    private router:Router,
    public dialog: MatDialog,
    private Subscribing_service:Subscribing_service,
  ) { 
    
    this.CURRENT_step = 0;
    this.stepChanged.emit(0);
    
    this.filteredGenres = this.genreCtrl.valueChanges.pipe(
      startWith(null),
      map((genre: string | null) => genre ? this._filter(genre) : this.allGenres.slice()));

  }

  
  @ViewChild('validateButton', { read: ElementRef }) validateButton:ElementRef;
  display_loading=false;
  for_edition=false;

  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  @Input('pseudo') pseudo:string;
  @Input('id') id:number;
  ad_id:number;
  @Output() started = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<any>();
  
  @Output() stepChanged = new EventEmitter<number>();

  dropdowns = this._constants.filters.categories[0].dropdowns;
  CURRENT_step: number;

  status_pictures:boolean=false;
  pictures_uploaded:boolean=false;
  attachments_uploaded:boolean=false;
  id_ad=0;

  ngOnInit() {

    this.createFormControlsAds();
    this.createFormAd();

    this.cd.detectChanges();
    this.stepChanged.emit(0);

  }

  ngAfterContentInit() {
  }


  back_home() {
    let name = this.Ads_service.get_thumbnail_name2()
    console.log(name)
    this.stepChanged.emit(0);
    this.cancelled.emit({ad_cover:name});
    
  }



  fd: FormGroup;
  fdTitle: FormControl;
  fdDescription: FormControl;
  fdPrice:FormControl;
  price_value:string;
  price_type:string='';
  fdMydescription: FormControl;
  fdTargets: FormControl;
  fdProject_type: FormControl;
  fdPrice_type: FormControl;
  fdPreferential_location: FormControl;
  remuneration:boolean = false;
  
  createFormControlsAds() {
    this.fdTitle = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("text") ) ]);
    this.fdMydescription = new FormControl('', Validators.required);
    this.fdDescription = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2000), Validators.pattern( pattern("text") ) ]);
    this.fdPrice = new FormControl('', [Validators.minLength(1), Validators.maxLength(9), Validators.pattern( pattern("share") ) ]);
    this.fdPrice_type = new FormControl('');
    this.fdTargets = new FormControl( this.genres, [Validators.required]);
    this.fdProject_type = new FormControl('', [Validators.required]);
    this.fdPreferential_location = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( pattern("location") ) ]);
  }

  createFormAd() {
    this.fd = new FormGroup({
      fdTitle: this.fdTitle,
      fdMydescription: this.fdMydescription,
      fdTargets: this.fdTargets,
      fdProject_type: this.fdProject_type,
      fdPreferential_location:this.fdPreferential_location,
      fdPrice: this.fdPrice,
      fdPrice_type: this.fdPrice_type,
      fdDescription:  this.fdDescription,
    });
  }



  all_attachments_uploaded( event: boolean) {
    this.attachments_uploaded = event;
    console.log("done")
    this.NotificationsService.add_notification("add_publication",this.id,this.author_name,null,'ad',this.fd.value.fdTitle,this.fd.value.fdProject_type,this.ad_id,0,"add",false,0).subscribe(l=>{
      let message_to_send ={
        for_notifications:true,
        type:"add_publication",
        id_user_name:this.author_name,
        id_user:this.id, 
        publication_category:'ad',
        publication_name:this.fd.value.fdTitle,
        format:this.fd.value.fdProject_type,
        publication_id:this.ad_id,
        chapter_number:0,
        information:"add",
        status:"unchecked",
        is_comment_answer:false,
        comment_id:0,
      }
      this.chatService.messages.next(message_to_send);
      //this.display_loading=false;
      this.can_delete = false;
      this.router.navigate([`/account/${this.pseudo}/${this.id}`]);
      //window.location.href = `/account/${this.pseudo}/${this.id}`;
      
    }) 
    
  }

  setRemuneration(e){
    if(e.checked){
      this.remuneration = true;
   }
   else{
    this.remuneration = false;
   }
  }




 


  //Ajouté par Mokhtar
  listOfTypes = ["Bandes dessinées en tout genre","BD européennes","Comics","Manga","Webtoon","Dessin en tout genre","Dessin digital",
  "Dessin traditionnel","Ecrit en tout genre","Article","Poésie","Roman","Roman illustré","Scénario"];

  listOfPriceTypes = ["Annuel","CDD","CDI","Journalier","Mensuel","Par mission","Réinitialiser"];

  listOfDescriptions = ["Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste"];
  
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
  allGenres: string[] = ["Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste"];
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if( this.genres.length >= 2 ) {
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
    this.fdTargets.updateValueAndValidity();
  }
  remove(genre: string): void {
    const index = this.genres.indexOf(genre);
    if (index >= 0) {
      this.genres.splice(index, 1);
    }
    this.fdTargets.updateValueAndValidity();
  }
  selected(event: MatAutocompleteSelectedEvent): void {

    
    if( this.genres.length >= 2 ) {
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
    this.fdTargets.updateValueAndValidity();
  }
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allGenres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
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
    console.log(this.price_type)
  }


  validate_form_ads() {

    
    this.validateButton.nativeElement.disabled = true;

    if(this.remuneration && !this.fd.valid){
      if(this.fd.value.fdPrice.length==0){
        this.price_value ="0";
        console.log(this.price_value);
      }
    }
    else if(this.remuneration && this.fd.valid){
      this.price_value =this.fd.value.fdPrice;
    }
    else if(!this.remuneration){
      this.price_value ="0";
    }
    

    if ( this.fd.valid && this.Ads_service.get_thumbnail_confirmation() ) {
        console.log(this.price_value);
        console.log(this.price_type);
        console.log("ok");
        console.log(this.fd.value.fdDescription);

        this.display_loading=true;
        this.Ads_service.check_if_ad_is_ok(this.fd.value.fdProject_type,this.fd.value.fdMydescription,this.fd.value.fdTargets).subscribe(r=>{
          if(r[0].result=="ok"){
            this.Ads_service.add_primary_information_ad(this.fd.value.fdTitle, this.fd.value.fdProject_type,this.fd.value.fdDescription,this.fd.value.fdPreferential_location, this.fd.value.fdMydescription,this.fd.value.fdTargets,this.remuneration,this.price_value,this.price_type)
            .subscribe((val)=> {
              this.ad_id=val[0].id;
              this.Ads_service.add_thumbnail_ad_to_database(val[0].id).subscribe(l=>{
                this.id_ad=l[0].id;
                this.Subscribing_service.add_content("ad",this.fd.value.fdProject_type,this.id_ad,0).subscribe(m=>{
                  this.Subscribing_service.validate_content("ad",this.fd.value.fdProject_type,this.id_ad,0).subscribe(n=>{
                    this.status_pictures=true;
                    console.log(n);
                  })
                })
              })           
            });
          }
          else{
            this.display_loading=false;
            this.validateButton.nativeElement.disabled = false;
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Une annonce similaire publiée il y a moins d'une semaine est déjà disponible, veuillez la supprimer afin de pouvoir publier une annonce similaire"},
              panelClass: 'dialogRefClassText'
            });
          }
        })

       
    }


    else if(!this.fd.valid){
      console.log(this.fd.value.fdTargets)
      console.log(this.fd)
      if(this.fd.controls.fdTargets.status=='INVALID' && this.fd.controls.fdTitle.status=='VALID' && this.fd.controls.fdMydescription.status=='VALID' && this.fd.controls.fdPreferential_location.status=='VALID' &&  this.fd.controls.fdProject_type.status=='VALID'){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le formulaire est incorrect. Veillez à saisir des cibles valides.'},
          panelClass: 'dialogRefClassText'
        });
      }
      else{
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le formulaire est incomplet. Veillez à saisir toutes les informations nécessaires.'},
          panelClass: 'dialogRefClassText'
        });
      }

      this.validateButton.nativeElement.disabled = false;
    }
    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez saisir une miniature, puis la valider.'},
        panelClass: 'dialogRefClassText'
      });
      this.validateButton.nativeElement.disabled = false;
    }

  }

  can_delete=true;
  cancel_all(){ 
    if(this.can_delete){
      this.Ads_service.remove_thumbnail_ad_from_folder().subscribe();
    }
  }

}