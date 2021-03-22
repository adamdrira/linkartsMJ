import { Component, OnInit, ChangeDetectorRef, HostListener, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { User } from '../services/user';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { NotificationsService } from '../services/notifications.service';
import { ChatService } from '../services/chat.service';
import { pattern } from '../helpers/patterns';
import { MustMatch } from '../helpers/must-match.validator';


import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as moment from 'moment'; 
import { trigger, transition, style, animate } from '@angular/animations';
import {Writing_Upload_Service} from '../services/writing.service';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import { DOCUMENT } from '@angular/common';

import { normalize_to_nfc } from '../helpers/patterns';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'fr'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('150ms', style({opacity: 1}))
        ])
      ],
    )
  ]
})


export class SignupComponent implements OnInit {
  
  

  constructor(
      private ChatService:ChatService,
      private NotificationsService:NotificationsService,
      private sanitizer:DomSanitizer,
      private deviceService: DeviceDetectorService,
      private Profile_Edition_Service:Profile_Edition_Service,
      private Writing_Upload_Service:Writing_Upload_Service,
      private formBuilder: FormBuilder,
      public navbar: NavbarService,
      private cd: ChangeDetectorRef,
      public dialogRef: MatDialogRef<SignupComponent,any>,
      private _adapter: DateAdapter<any>,
      public dialog: MatDialog,
      @Inject(DOCUMENT) private document: Document,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      dialogRef.disableClose = true;
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }

  registerForm1: FormGroup;
  registerForm2: FormGroup;
  registerForm3: FormGroup;
  registerForm4: FormGroup;
  registerForm5: FormGroup;
  registerForm6: FormGroup;
  registerForm7: FormGroup;
  
  for_group_creation=this.data.for_group_creation
  //LinksGroup:FormGroup;
  links_submitted=false;
  user = new User();
  links_titles:any[]=[];
  links:any[]=[];
  hide=true; // password
  hide2=true;

  logo_is_loaded=false;

  display_no_pseudos_found=false;
  research_member_loading=false;
  list_of_ids=[];
  list_of_birthdays=[];
  birthday_found:string;
  list_of_pseudos=[];
  list_of_profile_pictures=[];
  list_of_pp_found=[];

  pseudo_found='';
  id_found:number;
  profile_picture_found:SafeUrl;
  compteur_research=0;
  pp_found_loaded=false;
  display_max_length_members=false;
  display_need_members=false;
  display_need_information=false;

  step=0;
  show_sent_mail:boolean = false;
  maxDate: moment.Moment;

  
  cgu_accepted:boolean = false;
  display_cgu_error:boolean = false;

  setCgu(e){
    if(e.checked){
      this.cgu_accepted = true;
    }else{
    this.cgu_accepted = false;
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

  conditions:any;
  show_icon=false;
  device_info='';
  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    this.navbar.add_page_visited_to_history(`/signup`,this.device_info).subscribe();
    this.Writing_Upload_Service.retrieve_writing_for_options(0).subscribe(r=>{
      this.conditions=r
    })
    const currentYear = moment().year();
      this.maxDate = moment([currentYear - 7, 11, 31]);

    this._adapter.setLocale('fr');
    
    this.registerForm1 = this.formBuilder.group({
      email: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("mail")),
          Validators.maxLength(100),
        ]),
      ],
      gender: [(this.for_group_creation)?"Groupe":"", 
        Validators.compose([
          Validators.required,
        ]),
      ],
      password: ['',
        Validators.compose([
          Validators.required,
          //Au moins 1 majuscule, 1 minuscule, 1 caractère spécial et un nombre.
          Validators.pattern(pattern("password")),
          Validators.maxLength(50),
        ]),
      ],
      confirmPassword: ['', Validators.required],

      }, {
        validator: MustMatch('password', 'confirmPassword')
    });

    this.registerForm7=  this.formBuilder.group({
      email: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("mail")),
          Validators.maxLength(100),
        ]),
      ],
      password: ['',
        Validators.compose([
          Validators.required,
          //Au moins 1 majuscule, 1 minuscule, 1 caractère spécial et un nombre.
          Validators.pattern(pattern("password")),
          Validators.maxLength(50),
        ]),
      ]
      });
    
    this.registerForm2 = this.formBuilder.group({      
      
      type_of_account: ['', 
        Validators.compose([
          Validators.required,
        ]),
      ],
      siret: [null, 
        Validators.compose([
          Validators.pattern(pattern("siret")),
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      firstName: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("name")),
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
      ],
      lastName: ['', 
        Validators.compose([
          Validators.pattern(pattern("name")),
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
      ],
      birthday: ['', 
        Validators.compose([
          
          Validators.required
        ]),
      ],
    });



    
    this.registerForm3 = this.formBuilder.group({
      nickname: ['', 
        Validators.compose([
          Validators.required,
          //Au moins une lettre
          //ne commence pas par "- ou _", ne terme pas par "- ou _", ne contient pas plus de deux "- ou _" à la suite
          //peut contenir des lettres et des chiffres
          Validators.pattern(pattern("nickname")),
          Validators.minLength(3),
          Validators.maxLength(20),
        ]),
      ],
      primary_description: ['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(pattern("text")),
        ]),
      ],
      primary_description_extended:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(1000),
          Validators.pattern(pattern("text_with_linebreaks")),
        ]),
      ],
    });


    this.registerForm4 = this.formBuilder.group({
      job:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(pattern("text")),
        ]),
      ],
      training:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(250),
          Validators.pattern(pattern("text_with_linebreaks")),
        ]),
      ],

      city:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("name")),
        ]),
      ],
      country:['', 
        Validators.compose([
        ]),
      ],

      link_title:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("text")),
        ]),
      ],
      link:['', 
        Validators.compose([
          Validators.minLength(5),
          Validators.maxLength(60),
          Validators.pattern(pattern("text_without_spaces")),
        ]),
      ],

    });

    this.registerForm5 = this.formBuilder.group({

      
      fdSearchbar:['', 
        Validators.compose([
          Validators.maxLength(20),
          Validators.pattern(pattern("name")),
        ]),
      ]

    });

    this.registerForm6 = this.formBuilder.group({
      city:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("name")),
        ]),
      ],
      country:['', 
        Validators.compose([
        ]),
      ],

      link_title:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(15),
          Validators.pattern(pattern("text")),
        ]),
      ],
      link:['', 
        Validators.compose([
          Validators.minLength(5),
          Validators.maxLength(60),
          Validators.pattern(pattern("text_without_spaces")),
        ]),
      ],

    });
      
  }

 

  listOfGenders = ["Femme","Homme","Groupe"];
  listOfAccounts_group = ["Artistes","Artistes professionnels","Maison d'édition","Professionnels non artistes"];
  listOfAccounts_male = ["Artiste","Artiste professionnel","Editeur","Professionnel non artiste","Passionné"];
  listOfAccounts_female = ["Artiste","Artiste professionnelle","Editrice","Professionnelle non artiste","Passionnée"];
  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }


  adding_city(){
    if( this.registerForm1.value.gender!='Groupe'){
      if(this.registerForm4.value.city.length>0){
        this.registerForm4.controls['country'].setValidators([
          Validators.required,
        ]);
        this.registerForm4.controls['country'].markAsTouched();
      }
      else if(!this.registerForm4.value.country || this.registerForm4.value.country.length==0){
          this.registerForm4.controls['country'].setValidators([
          ]);
          this.registerForm4.controls['city'].setValidators([
            Validators.pattern(pattern("name")),
            Validators.minLength(3),
            Validators.maxLength(30)
          ]);
      }
      this.registerForm4.controls['country'].updateValueAndValidity();
      this.registerForm4.controls['city'].updateValueAndValidity();
    }
    else{
      if(this.registerForm6.value.city && this.registerForm6.value.city.length>0){
        this.registerForm6.controls['country'].setValidators([
          Validators.required,
        ]);
        this.registerForm6.controls['country'].markAsTouched();
      }
      else if(!this.registerForm6.value.country || this.registerForm6.value.country.length==0){
          this.registerForm6.controls['country'].setValidators([
          ]);
          this.registerForm6.controls['city'].setValidators([
            Validators.pattern(pattern("name")),
            Validators.minLength(3),
            Validators.maxLength(30)
          ]);
      }
      this.registerForm6.controls['country'].updateValueAndValidity();
      this.registerForm6.controls['city'].updateValueAndValidity();
    }
  }

  adding_country(){
    
    if( this.registerForm1.value.gender!='Groupe'){
      
        if( this.registerForm4.value.country && this.registerForm4.value.country.length>0){
          if(this.registerForm4.value.country=="Aucun pays"){
            this.registerForm4.controls['country'].setValue(null);
            if(!this.registerForm4.value.city || this.registerForm4.value.city.length==0){
              this.registerForm4.controls['country'].setValidators([
              ]);
              this.registerForm4.controls['city'].setValidators([
                Validators.pattern(pattern("name")),
                Validators.minLength(3),
                Validators.maxLength(30)
              ]);
            }
            this.registerForm4.controls['country'].updateValueAndValidity();
            this.registerForm4.controls['city'].updateValueAndValidity();
            return;
          }
          this.registerForm4.controls['city'].setValidators(
            [ 
              Validators.required,
              Validators.pattern(pattern("name")),
              Validators.minLength(3),Validators.maxLength(30)
            ]);
          this.registerForm4.controls['city'].markAsTouched();
        }
        else if(!this.registerForm4.value.city || this.registerForm4.value.city.length==0){
            this.registerForm4.controls['country'].setValidators([
            ]);
            this.registerForm4.controls['city'].setValidators([
              Validators.pattern(pattern("name")),
              Validators.minLength(3),
              Validators.maxLength(30)
            ]);
        }
        this.registerForm4.controls['country'].updateValueAndValidity();
        this.registerForm4.controls['city'].updateValueAndValidity();
    }
    else{
      if(this.registerForm6.value.country && this.registerForm6.value.country.length>0){
        if(this.registerForm6.value.country=="Aucun pays"){
          this.registerForm6.controls['country'].setValue(null);
          if(!this.registerForm6.value.city || this.registerForm6.value.city.length==0){
            this.registerForm6.controls['country'].setValidators([
            ]);
            this.registerForm6.controls['city'].setValidators([
              Validators.pattern(pattern("name")),
              Validators.minLength(3),
              Validators.maxLength(30)
            ]);
          }
          this.registerForm6.controls['country'].updateValueAndValidity();
          this.registerForm6.controls['city'].updateValueAndValidity();
          return;
        }
        this.registerForm6.controls['city'].setValidators([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.required,
          Validators.pattern(pattern("name")),
        ]);
        this.registerForm6.controls['city'].markAsTouched();
      }
      else if(!this.registerForm6.value.city || this.registerForm6.value.city.length==0){
          this.registerForm6.controls['country'].setValidators([
          ]);
          this.registerForm6.controls['city'].setValidators([
            Validators.pattern(pattern("name")),
            Validators.minLength(3),
            Validators.maxLength(30)
          ]);
      }
      this.registerForm6.controls['country'].updateValueAndValidity();
      this.registerForm6.controls['city'].updateValueAndValidity();
    }
  
    
  }

  //links managment
  add_link(){
    if(this.links_titles.length>=3){
      return
    }
    if(this.registerForm1.value.gender=='Groupe'){
      if( this.registerForm6.controls['link_title'].invalid || this.registerForm6.controls['link'].invalid ) {
        return;
      }
      if ( this.registerForm6.controls['link_title'].value == "" || this.registerForm6.controls['link'].value == "" ) {
        return;
      }
      this.links_titles.push(this.registerForm6.value.link_title);
      this.links.push(this.registerForm6.value.link);
      this.registerForm6.controls['link'].setValue("");
      this.registerForm6.controls['link_title'].setValue("");
    }
    else{

      if( this.registerForm4.controls['link_title'].invalid || this.registerForm4.controls['link'].invalid ) {
        return;
      }
      if ( !this.registerForm4.controls['link_title'].value  || !this.registerForm4.controls['link'].value ) {
        return;
      }
      this.links_titles.push(this.registerForm4.value.link_title);
      this.links.push(this.registerForm4.value.link);
      this.registerForm4.controls['link'].setValue("");
      this.registerForm4.controls['link_title'].setValue("");
    }
    this.links_submitted=true;
  }

  remove_link(i){
    this.links.splice(i,1);
    this.links_titles.splice(i,1);
  }



  display_pseudo_found_1=false;
  display_pseudo_found_2=false;
  index_check=0
  check_pseudo(){
    this.index_check++;
    this.Profile_Edition_Service.check_pseudo(this.registerForm3.value.nickname, this.index_check).subscribe(r=>{
      if(r[0][0].msg=="found"){
        this.display_pseudo_found_1=true;
        this.cd.detectChanges()
      }
      else{
        this.display_pseudo_found_1=false;
        this.display_pseudo_found_2=false;
        this.cd.detectChanges()
      }
    })
  }

  display_email_or_pseudo_found=false;
  display_email_and_password_found_1=false;
  display_email_found_2=false;
  display_email_found_1=false;
  display_email_and_password_error=false;
  index_check_email=0
  check_email_and_password(){
    this.index_check_email++;
    if(this.registerForm1.value.email && this.registerForm1.value.password){
      this.Profile_Edition_Service.check_email_and_password(this.registerForm1.value.email,this.registerForm1.value.password, this.index_check_email).subscribe(r=>{
        if(r[1]== this.index_check_email){
          if(r[0].found){
            this.display_email_and_password_error=true;
            if(r[0].email && this.registerForm1.value.gender && this.registerForm1.value.gender!='Groupe'){
              this.display_email_found_1=true;
            }
            else{
              this.display_email_found_1=false;
            }
            this.cd.detectChanges()
          }
          else{
            if(r[0].email && this.registerForm1.value.gender && this.registerForm1.value.gender!='Groupe'){
              this.display_email_found_1=true;
              this.display_email_and_password_error=true;
            }
            else{
              this.display_email_found_1=false;
              this.display_email_and_password_error=false;
            }
            this.display_email_and_password_found_1=false;
            this.cd.detectChanges()
          }
        }
      
      })
    }
    
  }


  current_profile='';
  change_profile(event){
    
    if(event.value!=this.current_profile){
      this.registerForm2.reset();
      this.registerForm4.reset();
      this.registerForm5.reset();
      this.registerForm6.reset();
    }
    this.current_profile=event.value;
  }

  
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


  error_authentication=false; 
  error_authentication_2=false; // form invalid
  need_authentication=false; // need authentication if a group is created by an admin
  cancel_authentication(){ 
    this.loading=false;
    this.error_authentication=false;
    this.need_authentication=false;
    this.step=3;
    this.cd.detectChanges();
  }

  loading=false;
  validate_authentication(){
    this.loading=true;
    if(this.registerForm7.valid){
      this.Profile_Edition_Service.check_email_and_password(this.registerForm7.value.email,this.registerForm7.value.password,0).subscribe(r=>{
          if(r[0].found && r[0].user.id==this.list_of_ids[0]){
            this.loading=false;
            this.display_email_and_password_found_1=false;
            this.error_authentication=false;
            this.need_authentication=false;
            this.error_authentication_2=false;
          }
          else{
            this.loading=false;
            this.error_authentication=true;
            
          }
          this.cd.detectChanges()
      });
    }
    else{
      this.loading=false;
      this.error_authentication_2=true;
    }
    
   
  }

  validate_step() {
    if(this.step==1 && this.registerForm2.value.type_of_account && ( this.registerForm2.value.type_of_account=="Artiste professionnel" ||  this.registerForm2.value.type_of_account=="Artiste professionnelle"  || this.registerForm2.value.type_of_account.includes('Maison'))){
        if(!this.registerForm2.value.siret || (this.registerForm2.value.siret && this.registerForm2.value.siret.length<9)){
          this.display_need_information=true;
          this.display_email_and_password_found_1=false;
          return;
        }
        else if((this.registerForm2.valid && this.registerForm1.value.gender!='Groupe') || (this.registerForm1.value.gender=='Groupe' && this.registerForm2.controls.birthday.status=='INVALID' && this.registerForm2.controls.firstName.status=='VALID')){
          this.display_need_members=false;
          this.display_need_information=false;
          this.display_email_and_password_found_1=false;
          this.step ++;
          this.cd.detectChanges();
        }
    }
    else if( (this.step == 0 && this.registerForm1.valid && !this.display_email_and_password_error) || (this.step == 1 && this.registerForm2.valid)
    || (this.step == 2 && this.registerForm3.valid && !this.display_pseudo_found_1 && ( (this.registerForm1.value.gender=='Groupe' && (this.registerForm2.value.type_of_account=='Artistes' || this.registerForm2.value.type_of_account=='Artistes professionels') ) || (this.registerForm1.value.gender!='Groupe') ))
    || (this.step==3 && this.registerForm1.value.gender=='Groupe' && this.list_of_pseudos.length>1 ) ) {
      if(this.step==3 && this.registerForm1.value.gender=="Groupe"){
        if( this.registerForm2.value.type_of_account.includes('Artiste')){
        this.need_authentication=true;
        }
        else{
        this.input.nativeElement.value='';
        this.registerForm5.value.fdSearchbar='';
        this.display_email_and_password_found_1=false;
        this.need_authentication=false;
        }
        
      }
      this.display_email_and_password_found_1=false;
      this.display_need_members=false;
      this.display_need_information=false;
      this.step ++;
      this.cd.detectChanges();
    }
    else if (this.step == 2 && this.registerForm3.valid && !this.display_pseudo_found_1 && this.registerForm1.value.gender=='Groupe' 
    &&  (this.registerForm2.value.type_of_account!='Artistes' 
    && this.registerForm2.value.type_of_account!='Artistes professionels')){
      this.display_need_members=false;
      this.display_need_information=false;
      this.step+=2; 
      this.display_email_and_password_found_1=false;
      this.cd.detectChanges();
    }
    else if(this.step==3 && this.list_of_pseudos.length<2 ){
      this.display_need_members=true;
    }
    else if(this.step==1 &&  this.registerForm1.value.gender=='Groupe' && this.registerForm2.controls.birthday.status=='INVALID' && this.registerForm2.controls.firstName.status=='VALID'){
      this.display_need_members=false;
      this.display_need_information=false;
      this.display_email_and_password_found_1=false;
      this.step ++;
      this.cd.detectChanges();
    }
    else{
      if(this.display_email_and_password_error){
        this.display_email_and_password_found_1=true;
        if(this.registerForm1.value.gender && this.registerForm1.value.gender!="Groupe"){
          this.display_email_found_1=true;
        }
        else{
          this.display_email_found_1=false;
        }
      }
      else if(!this.display_pseudo_found_1){
        this.display_email_and_password_found_1=false;
        this.display_need_information=true;
        this.display_email_found_1=false;
      }
     
      this.cd.detectChanges()
    }


  }


  step_back() {
    if(this.step > 0) {
      if(this.step==3 && this.registerForm1.value.gender=="Groupe"){
        this.input.nativeElement.value='';
         this.registerForm5.value.fdSearchbar='';
         this.step--;
      }
      if (this.step == 4 && this.registerForm1.value.gender=='Groupe' 
        &&  (this.registerForm2.value.type_of_account!='Artistes' 
        && this.registerForm2.value.type_of_account!='Artistes professionels')){
          this.step=2; 
      }
      else{
        this.step--;
      }
      
      this.cd.detectChanges();
    }
    else {
      return;
    }
  }

  change_password_type(){
    this.hide=!this.hide;
  }

  change_password_type2(){
    this.hide2=!this.hide2;
  }
  

  logo_loaded(){
    this.logo_is_loaded=true;
  }
  close_dialog(){
    this.dialogRef.close();
  }


  @ViewChild('research') research:ElementRef;
  @ViewChild('input') input:ElementRef;
  
  
  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.research_member_loading){
      if (!this.research.nativeElement || !this.research.nativeElement.contains(btn)){
        this.research_member_loading=false;
      }
    }
  }

  activateFocus_add(){
    this.pseudo_found='';
    this.profile_picture_found=null;
    this.id_found=null;
    this.research_member_loading=true;
    this.pp_found_loaded=false;
  }
  
  
  research_member(){
    
    this.pp_found_loaded=false;
    if(this.list_of_pseudos.length>=10){
      this.display_no_pseudos_found=true;
      this.pseudo_found='';
      this.profile_picture_found=null;
      this.display_max_length_members=true;
      return
    }
    this.compteur_research++;
    if(this.registerForm5.value.fdSearchbar && this.registerForm5.value.fdSearchbar.replace(/\s/g, '').length>0){
      this.Profile_Edition_Service.get_pseudos_who_match_for_signup(this.registerForm5.value.fdSearchbar,this.compteur_research).subscribe(r=>{
        let compt=r[1];
        if(r[0][0].nothing){
          if(r[1]==this.compteur_research){
            this.display_no_pseudos_found=true;
            this.pseudo_found='';
            this.profile_picture_found=null;
          }
        }
        else if(r[1]==this.compteur_research){
          this.birthday_found=r[0][0].birthday
          this.pseudo_found=r[0][0].nickname;
          this.id_found=r[0][0].id;
          this.Profile_Edition_Service.retrieve_profile_picture(r[0][0].id).subscribe(p=>{
            if(compt==this.compteur_research){
              let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
              this.profile_picture_found= this.sanitizer.bypassSecurityTrustUrl(url);
              this.display_no_pseudos_found=false;
            }
            
          })
        }
      })
    }
    else{
      this.pp_found_loaded=false;
    }
  }


  add_member(){
    this.list_of_birthdays.push(this.birthday_found)
    this.research_member_loading=false;
    this.list_of_ids.push(this.id_found)
    this.list_of_pseudos.push(this.pseudo_found);
    this.list_of_profile_pictures.push(this.profile_picture_found);
    this.input.nativeElement.value='';
    this.registerForm5.value.fdSearchbar='';
  }

  check_if_pseudos_added(){
    if(this.pseudo_found!=''){
      let value = true;
      for(let i=0;i<this.list_of_pseudos.length;i++){
        if(this.list_of_pseudos[i]==this.pseudo_found){
          value=false;
        }
      }
      return value;
    }
    else{
      return false
    }
    
  }

  pp_found_load(){
    this.pp_found_loaded=true;
  }

  list_of_pp_found_load(i){
    this.list_of_pp_found[i]=true;
  }

  remove_member(i){
    this.list_of_pseudos.splice(i,1);
    this.list_of_ids.splice(i,1);
    this.list_of_profile_pictures.splice(i,1);
    this.list_of_pp_found.splice(i,1);
  }


  selected_country='Aucun pays';
  list_of_countries=[
    'Aucun pays',
    "France",
    "Afghanistan", 
    "Afrique Centrale", 
    "Afrique du sud", 
    "Albanie", 
    "Algerie", 
    "Allemagne", 
    "Andorre", 
    "Angola", 
    "Anguilla", 
    "Arabie Saoudite", 
    "Argentine", 
    "Armenie", 
    "Australie", 
    "Autriche", 
    "Azerbaidjan", 
    "Bahamas", 
    "Bangladesh", 
    "Barbade", 
    "Bahrein", 
    "Belgique", 
    "Belize", 
    "Benin", 
    "Bermudes", 
    "Bielorussie", 
    "Bolivie", 
    "Botswana", 
    "Bhoutan", 
    "Boznie Herzegovine", 
    "Bresil", 
    "Brunei", 
    "Bulgarie", 
    "Burkina Faso", 
    "Burundi", 
    "Caiman", 
    "Cambodge", 
    "Cameroun", 
    "Canada", 
    "Canaries", 
    "Cap vert", 
    "Chili", 
    "Chine", 
    "Chypre", 
    "Colombie", 
    "Comores", 
    "Congo", 
    "Congo democratique", 
    "Cook", 
    "Coree du Nord", 
    "Coree du Sud", 
    "Costa Rica", 
    "Cote d'Ivoire", 
    "Croatie", 
    "Cuba", 
    "Danemark", 
    "Djibouti", 
    "Dominique", 
    "Egypte", 
    "Emirats Arabes Unis", 
    "Equateur", 
    "Erythree", 
    "Espagne", 
    "Estonie", 
    "Etats-Unis", 
    "Ethiopie", 
    "Falkland", 
    "Feroe", 
    "Fidji", 
    "Finlande", 
    "France", 
    "Gabon", 
    "Gambie", 
    "Georgie", 
    "Ghana", 
    "Gibraltar", 
    "Grece", 
    "Grenade", 
    "Groenland", 
    "Guadeloupe", 
    "Guam", 
    "Guatemala",
    "Guernesey", 
    "Guinee", 
    "Guinee Bissau", 
    "Guinee equatoriale", 
    "Guyana", 
    "Guyane Francaise ", 

    "Haiti", 
    "Hawaii", 
    "Honduras", 
    "Hong Kong", 
    "Hongrie", 

    "Inde", 
    "Indonesie", 
    "Iran", 
    "Iraq", 
    "Irlande", 
    "Islande", 
    "Israel", 
    "Italie", 

    "Jamaique", 
    "Jan Mayen", 
    "Japon", 
    "Jersey", 
    "Jordanie", 

    "Kazakhstan", 
    "Kenya", 
    "Kirghizstan", 
    "Kiribati", 
    "Koweit", 

    "Laos", 
    "Lesotho", 
    "Lettonie", 
    "Liban", 
    "Liberia", 
    "Liechtenstein", 
    "Lituanie", 
    "Luxembourg", 
    "Lybie", 

    "Macao", 
    "Macedoine", 
    "Madagascar", 
    "Madère", 
    "Malaisie", 
    "Malawi", 
    "Maldives", 
    "Mali", 
    "Malte", 
    "Man", 
    "Mariannes du Nord", 
    "Maroc", 
    "Marshall", 
    "Martinique", 
    "Maurice", 
    "Mauritanie", 
    "Mayotte", 
    "Mexique", 
    "Micronesie", 
    "Midway", 
    "Moldavie", 
    "Monaco", 
    "Mongolie", 
    "Montserrat", 
    "Mozambique", 
    "Namibie", 
    "Nauru", 
    "Nepal", 
    "Nicaragua", 
    "Niger", 
    "Nigeria", 
    "Niue", 
    "Norfolk", 
    "Norvege", 
    "Nouvelle Caledonie", 
    "Nouvelle Zelande", 
    "Oman", 
    "Ouganda", 
    "Ouzbekistan", 
    "Pakistan", 
    "Palau", 
    "Palestine", 
    "Panama", 
    "Papouasie Nouvelle Guinee", 
    "Paraguay", 
    "Pays Bas", 
    "Perou", 
    "Philippines", 
    "Pologne", 
    "Polynesie", 
    "Porto Rico", 
    "Portugal", 
    "Qatar", 
    "Republique Dominicaine", 
    "Republique Tcheque", 
    "Reunion", 
    "Roumanie", 
    "Royaume Uni", 
    "Russie", 
    "Rwanda", 
    "Sahara Occidental",
    "Sainte Lucie", 
    "Saint Marin", 
    "Salomon", 
    "Salvador", 
    "Samoa Occidentales",
    "Samoa Americaine", 
    "Sao Tome et Principe", 
    "Senegal", 
    "Seychelles", 
    "Sierra Leone",
    "Singapour", 
    "Slovaquie", 
    "Slovenie",
    "Somalie", 
    "Soudan", 
    "Sri Lanka", 
    "Suede", 
    "Suisse", 
    "Surinam", 
    "Swaziland", 
    "Syrie", 
    "Tadjikistan", 
    "Taiwan", 
    "Tonga", 
    "Tanzanie", 
    "Tchad", 
    "Thailande", 
    "Tibet", 
    "Timor Oriental", 
    "Togo", 
    "Trinite et Tobago", 
    "Tristan da cunha",
    "Tunisie", 
    "Turkmenistan", 
    "Turquie", 
    "Ukraine", 
    "Uruguay", 
    "Vanuatu", 
    "Vatican", 
    "Venezuela", 
    "Vierges Americaines", 
    "Vierges Britanniques", 
    "Vietnam", 
    "Wake", 
    "Wallis et Futuma", 
    "Yemen", 
    "Yougoslavie", 
    "Zambie", 
    "Zimbabwe",
  ]



  /*********************************************** REGISTER FUNCTION  *********************************/
  /*********************************************** REGISTER FUNCTION  *********************************/
  /*********************************************** REGISTER FUNCTION  *********************************/
  loading_signup=false;
  register() {
    if( !this.cgu_accepted ) {
      this.display_cgu_error = true;
      return;
    }
  
    if(this.loading_signup){
      return
    }
    if ( this.registerForm1.invalid || this.registerForm3.invalid || (this.registerForm4.invalid && this.registerForm1.value.gender!='Groupe') ||  (this.registerForm1.value.gender=='Groupe' && this.registerForm6.invalid)  ) {
        return;
    }
    if(this.registerForm1.value.gender=='Groupe' && this.registerForm2.controls.firstName.status=='INVALID'){
        return;
    }
    if(this.registerForm1.value.gender!='Groupe' && this.registerForm2.invalid){
      return;
    }

    //form1
    this.user.email = this.registerForm1.value.email.toLowerCase();
    this.user.password = this.registerForm1.value.password;
    this.user.gender = this.registerForm1.value.gender;

    //form2
    this.user.type_of_account = this.registerForm2.value.type_of_account;
    if(this.registerForm2.controls['siret'] && this.registerForm2.controls['siret'].valid){
      this.user.siret= this.registerForm2.value.siret
    }
    else{
      this.user.siret=null;
    }
    this.user.firstname = this.capitalizeFirstLetter( this.registerForm2.value.firstName.toLowerCase() );
    if(this.registerForm2.controls['lastName'] && this.registerForm2.value.lastName){
      this.user.lastname = this.capitalizeFirstLetter( this.registerForm2.value.lastName.toLowerCase() );
    }
    else{
      this.user.lastname = '';
    }
    if(this.registerForm2.controls['birthday'] && this.registerForm2.controls['birthday'].valid){
      if(this.registerForm2.value.birthday._i.date){
        this.user.birthday = this.registerForm2.value.birthday._i.date  + '-' + this.registerForm2.value.birthday._i.month  + '-' + this.registerForm2.value.birthday._i.year ;
      }
      else if(typeof(this.registerForm2.value.birthday._i)=='string'){
        this.user.birthday = this.registerForm2.value.birthday._i;
        this.user.birthday = this.user.birthday.replace(/\//g, "-");
      }
      else{
        this.user.birthday =  this.registerForm2.value.birthday._i[2] + '-'+ this.registerForm2.value.birthday._i[1] +'-'+ this.registerForm2.value.birthday._i[0];
        
      }
     
    }
    else{
      if( (this.registerForm2.value.type_of_account=='Artistes' 
      || this.registerForm2.value.type_of_account=='Artistes professionels')){
        this.user.birthday =this.list_of_birthdays[0]
      }
      else{
        this.user.birthday ="Non renseigné"
      }
      
    }
    this.user.nickname = this.registerForm3.value.nickname;
    this.user.primary_description = this.registerForm3.value.primary_description.replace(/\n\s*\n\s*\n/g, '\n\n');
    this.user.primary_description_extended = this.registerForm3.value.primary_description_extended.replace(/\n\s*\n\s*\n/g, '\n\n');
    this.loading_signup=true;
    if(this.registerForm1.value.gender=='Groupe'){
      if( (this.registerForm2.value.type_of_account=='Artistes' 
      || this.registerForm2.value.type_of_account=='Artistes professionels')){
        this.user.list_of_members=this.list_of_ids;
        this.user.id_admin=this.list_of_ids[0];
      }
      
      if( this.registerForm6.value.city && !this.registerForm6.value.country){
        this.user.location =this.capitalizeFirstLetter( this.registerForm6.value.city.toLowerCase() )
      }
      else if(this.registerForm6.value.city && this.registerForm6.value.country){
        this.user.location=this.capitalizeFirstLetter( this.registerForm6.value.city.toLowerCase() ) + ", " + this.capitalizeFirstLetter( this.registerForm6.value.country.toLowerCase() );
      }
      else if(!this.registerForm6.value.city && this.registerForm6.value.country){
        this.user.location= this.capitalizeFirstLetter( this.registerForm6.value.country.toLowerCase() );
      }
      else if(!this.registerForm6.value.city && !this.registerForm6.value.country){
        this.user.location=null;
      }
    }
    else{
      this.user.job = this.registerForm4.value.job;
      this.user.training = this.registerForm4.value.training;
      if( this.registerForm4.value.city && !this.registerForm4.value.country){
        this.user.location =this.capitalizeFirstLetter( this.registerForm4.value.city.toLowerCase() )
      }
      else if(this.registerForm4.value.city && this.registerForm4.value.country){
        this.user.location=this.capitalizeFirstLetter( this.registerForm4.value.city.toLowerCase() ) + ", " + this.capitalizeFirstLetter( this.registerForm4.value.country.toLowerCase() );
      }
      else if(!this.registerForm4.value.city && this.registerForm4.value.country){
        this.user.location= this.capitalizeFirstLetter( this.registerForm4.value.country.toLowerCase() );
      }
      else if(!this.registerForm4.value.city && !this.registerForm4.value.country){
        this.user.location=null;
      }
    }

   

    this.Profile_Edition_Service.check_pseudo(this.user.nickname,0).subscribe(r=>{
      if(r[0][0].msg=="found"){
        this.display_pseudo_found_2=true;
        this.loading_signup=false;
        this.cd.detectChanges()
      }
      else{
        this.Profile_Edition_Service.check_email(this.user,0).subscribe(r=>{
          if(r[0][0].msg=="found" && r[0][0].type=="user"){
            this.display_email_found_2=true;
            this.loading_signup=false;
            this.cd.detectChanges()
          }
          else{
            this.user.list_of_members;
            this.user.id_admin;
            this.Profile_Edition_Service.addUser( this.user ).subscribe(r=>{
              if(!r[0].error){
                this.display_email_or_pseudo_found=false;
                let id=r[0].id_user;
                if( this.links.length > 0 ) {
                  let compt=0;
                  for(let i=0;i<this.links.length;i++){
                    this.Profile_Edition_Service.add_link(r[0].id_user,this.links_titles[i],this.links[i]).subscribe(l=>{
                      compt+=1;
                      if(this.links.length==compt){
                        if(this.registerForm1.value.gender=="Groupe" && this.user.type_of_account.includes("Artiste")){
                            this.NotificationsService.add_notification_for_group_creation('group_creation',this.list_of_ids[0],this.list_of_pseudos[0],this.list_of_ids,'group_creation',this.registerForm2.value.firstName,'unknown',id,0,"add",false,0).subscribe(l=>{
                              let message_to_send ={
                                for_notifications:true,
                                type:"group_creation",
                                id_user_name:this.list_of_pseudos[0],
                                id_user:this.list_of_ids[0], 
                                list_of_receivers:this.list_of_ids, 
                                publication_category:'group_creation',
                                publication_name:this.registerForm2.value.firstName,
                                format:'unknown',
                                publication_id:id,
                                chapter_number:0,
                                information:"add",
                                status:"unchecked",
                                is_comment_answer:false,
                                comment_id:0,
                              }
                              this.ChatService.messages.next(message_to_send);
                              
                              this.Profile_Edition_Service.send_email_for_group_creation(id).subscribe(m=>{
                                this.step = -1;
                                this.show_sent_mail = true;
                                this.cd.detectChanges();
                              })
                            }) 
                        }
                        else{
                          this.Profile_Edition_Service.send_email_for_account_creation(id).subscribe(m=>{
                            this.loading_signup=false;
                            this.step = -1;
                            this.show_sent_mail = true;
                            this.cd.detectChanges();
                          })
                        } 
                      }
                    })
                  }
                }
                else {
                  if(this.registerForm1.value.gender=="Groupe" && this.user.type_of_account.includes("Artiste")){
                    this.NotificationsService.add_notification_for_group_creation('group_creation',this.list_of_ids[0],this.list_of_pseudos[0],this.list_of_ids,'group_creation',this.registerForm2.value.firstName,'unknown',id,0,"add",false,0).subscribe(l=>{
                      let message_to_send ={
                        for_notifications:true,
                        type:"group_creation",
                        id_user_name:this.list_of_pseudos[0],
                        id_user:this.list_of_ids[0], 
                        list_of_receivers:this.list_of_ids, 
                        publication_category:'group_creation',
                        publication_name:this.registerForm2.value.firstName,
                        format:'unknown',
                        publication_id:id,
                        chapter_number:0,
                        information:"add",
                        status:"unchecked",
                        is_comment_answer:false,
                        comment_id:0,
                      }
                      this.ChatService.messages.next(message_to_send);
                        this.Profile_Edition_Service.send_email_for_group_creation(id).subscribe(m=>{
                          this.step = -1;
                          this.show_sent_mail = true;
                          this.cd.detectChanges();
                        })
                    }) 
                  }
                  else{
                    this.Profile_Edition_Service.send_email_for_account_creation(id).subscribe(m=>{
                      this.step = -1;
                      this.show_sent_mail = true;
                      this.cd.detectChanges();
                    })
                  }
                 
                }
              }
              else{
                this.loading_signup=false;
                this.display_email_or_pseudo_found=true;
              }
             
              
            });
          }
        })


        
      }
    })
  }


  finish() {
    location.reload();
  }
  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }

}