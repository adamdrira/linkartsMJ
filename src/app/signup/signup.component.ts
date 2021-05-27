import { Component, OnInit, ChangeDetectorRef, HostListener, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { User } from '../services/user';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { ChatService } from '../services/chat.service';
import { pattern } from '../helpers/patterns';

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
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [
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
    ),
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
    trigger(
      'enterFromLeftAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ]),
      ],
    ),
    trigger(
      'enterFromRightAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ]),
      ],
    ),
  ]
})


export class SignupComponent implements OnInit {
  
  

  constructor(
      private ChatService:ChatService,
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

 
  show_icon=false;
  device_info='';
  show_text=false;
  profile_picture:any;
  ngOnInit() {
  
    this.Profile_Edition_Service.retrieve_profile_picture(2).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });
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
      nickname: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("nickname")),
          Validators.minLength(3),
          Validators.maxLength(30),
        ]),
      ],
      type_of_account: ['', 
        Validators.compose([
          Validators.required,
        ]),
      ],
      firstName: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("name")),
          Validators.minLength(2),
          Validators.maxLength(40),
        ]),
      ],
      password: ['',
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("password")),
          Validators.maxLength(50),
        ]),
      ]});
    
    this.registerForm2 = this.formBuilder.group({      
      siret: [null, 
        Validators.compose([
          Validators.pattern(pattern("siret")),
          Validators.minLength(9),
          Validators.maxLength(9),
        ]),
      ],
      SocietyName: ['', 
        Validators.compose([
          Validators.pattern(pattern("society")),
          Validators.minLength(2),
          Validators.maxLength(40),
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
      primary_description: ['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(pattern("text")),
        ]),
      ],
      
      birthday: ['', 
        Validators.compose([
        ]),
      ],
    });
      
  }



  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }

 
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /*************************************** FIRST and second  PAGE SIGNUP ****************************************/
  /*************************************** FIRST and second PAGE SIGNUP ****************************************/

  conditions:any;
  pp_is_loaded=false;

  load_pp(){
    this.pp_is_loaded=true;
  }

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

  

  listOfAccounts=["Artiste","Éditeur / Éditrice","Fan"];
  listOfAccountsDescriptions = [
    "Vous êtes un artiste du monde de la bande dessinée, de la littérature ou du dessin, et vous souhaitez collaborer avec des maisons d'édition ou d'autres artistes, mais aussi être rémunéré pour les œuvres que vous partagez dans votre quête de progression.",
    "Vous êtes un éditeur ou une éditrice, et vous souhaitez optimiser le tri de vos candidatures, et dénicher des artistes talentueux avec qui collaborer efficacement une fois que vous les avez trouvés.",
    "Vous souhaitez soutenir un ou plusieurs artistes de cœur à gagner en visibilité et en pertinence, afin qu'ils puissent dénicher la collaboration éditoriale qui changera leur vie."
  ];
  listOfAccountsImages=[
    "../../assets/img/tuto-logos/tuto-palette.svg",
    "../../assets/img/tuto-logos/tuto-books.svg",
    "../../assets/img/tuto-logos/win.svg",
  ];

  
  change_password_type(){
    this.hide=!this.hide;
  }

  change_password_type2(){
    this.hide2=!this.hide2;
  }

  
  display_pseudo_found_1=false;
  display_pseudo_found_2=false;
  index_check=0
  check_pseudo(){
    this.index_check++;
    this.Profile_Edition_Service.check_pseudo(this.registerForm1.value.nickname, this.index_check).subscribe(r=>{
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
  display_email_found_2=false;
  display_email_and_password_error=false;
  index_check_email=0;

  check_email(){
    this.index_check_email++;
    this.Profile_Edition_Service.check_email(this.registerForm1.value.email,this.index_check_email).subscribe(r=>{
      if(r[0][0].msg=="found" && r[1]== this.index_check_email){
        this.display_email_and_password_error=true;
        this.cd.detectChanges()
      }
      else{
        this.display_email_and_password_error=false;
        this.cd.detectChanges()
      }
    })
  }

  

  adding_city(){
    if( this.registerForm1.value.gender!='Groupe'){
      if(this.registerForm2.value.city.length>0){
        this.registerForm2.controls['country'].setValidators([
          Validators.required,
        ]);
        this.registerForm2.controls['country'].markAsTouched();
      }
      else if(!this.registerForm2.value.country || this.registerForm2.value.country.length==0){
          this.registerForm2.controls['country'].setValidators([
          ]);
          this.registerForm2.controls['city'].setValidators([
            Validators.pattern(pattern("name")),
            Validators.minLength(3),
            Validators.maxLength(30)
          ]);
      }
      this.registerForm2.controls['country'].updateValueAndValidity();
      this.registerForm2.controls['city'].updateValueAndValidity();
    }
  }

  adding_country(){
    
    if( this.registerForm1.value.gender!='Groupe'){
      
        if( this.registerForm2.value.country && this.registerForm2.value.country.length>0){
          if(this.registerForm2.value.country=="Aucun pays"){
            this.registerForm2.controls['country'].setValue(null);
            if(!this.registerForm2.value.city || this.registerForm2.value.city.length==0){
              this.registerForm2.controls['country'].setValidators([
              ]);
              this.registerForm2.controls['city'].setValidators([
                Validators.pattern(pattern("name")),
                Validators.minLength(3),
                Validators.maxLength(30)
              ]);
            }
            this.registerForm2.controls['country'].updateValueAndValidity();
            this.registerForm2.controls['city'].updateValueAndValidity();
            return;
          }
          this.registerForm2.controls['city'].setValidators(
            [ 
              Validators.required,
              Validators.pattern(pattern("name")),
              Validators.minLength(3),Validators.maxLength(30)
            ]);
          this.registerForm2.controls['city'].markAsTouched();
        }
        else if(!this.registerForm2.value.city || this.registerForm2.value.city.length==0){
            this.registerForm2.controls['country'].setValidators([
            ]);
            this.registerForm2.controls['city'].setValidators([
              Validators.pattern(pattern("name")),
              Validators.minLength(3),
              Validators.maxLength(30)
            ]);
        }
        this.registerForm2.controls['country'].updateValueAndValidity();
        this.registerForm2.controls['city'].updateValueAndValidity();
    }
    
  }


 




  validate_clicked=false;
  validate_step(i){
    if(!this.for_group_creation){
      this.validate_clicked=true;
      if(i==0 && !this.display_email_and_password_error && !this.display_pseudo_found_1){
        if(!this.registerForm1.valid){
          this.display_need_information=true;
          return
        }
        else {
          this.display_need_information=false;
          this.register()
        }
      }
      else if(i==1){
        if(!this.registerForm2.valid){
          this.display_need_information=true;
          return
        }

        if(this.loading_signup){
          return
        }
        //this.loading_signup=true;
        let location=null;
        let birthday=null;
        let siret=null;
        let society=null;

        if(this.registerForm1.value.type_of_account!="Artiste"){
          siret=this.registerForm2.value.siret;
          society=this.registerForm2.value.society;
        }

        if( this.registerForm2.value.city && !this.registerForm2.value.country){
          location =this.capitalizeFirstLetter( this.registerForm2.value.city.toLowerCase() )
        }
        else if(this.registerForm2.value.city && this.registerForm2.value.country){
          location=this.capitalizeFirstLetter( this.registerForm2.value.city.toLowerCase() ) + ", " + this.capitalizeFirstLetter( this.registerForm2.value.country.toLowerCase() );
        }
        else if(!this.registerForm2.value.city && this.registerForm2.value.country){
          location= this.capitalizeFirstLetter( this.registerForm2.value.country.toLowerCase() );
        }
        else if(!this.registerForm2.value.city && !this.registerForm2.value.country){
          location=null;
        }

        if(this.registerForm1.value.type_of_account=="Artiste" && this.registerForm2.controls['birthday'] && this.registerForm2.controls['birthday'].valid && this.registerForm2.value.birthday && this.registerForm2.value.birthday!=''){
         if(this.registerForm2.value.birthday._i.date){
            birthday = this.registerForm2.value.birthday._i.date  + '-' + this.registerForm2.value.birthday._i.month  + '-' + this.registerForm2.value.birthday._i.year ;
          }
          else if(typeof(this.registerForm2.value.birthday._i)=='string'){
            birthday = this.registerForm2.value.birthday._i;
            birthday = birthday.replace(/\//g, "-");
          }
          else{
            birthday =  this.registerForm2.value.birthday._i[2] + '-'+ this.registerForm2.value.birthday._i[1] +'-'+ this.registerForm2.value.birthday._i[0];
            
          }
          
        }
        else{
          birthday="Non renseigné";
        }

        let primary_description = this.registerForm2.value.primary_description.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,'');
        this.Profile_Edition_Service.edit_account_artist_signup(this.id_user,primary_description,location,birthday,siret,society).subscribe(r=>{
          if(r[0]){
            this.loading_signup=false;
            this.show_sent_mail=true;
          }
        })
      }
    }
   
  }

  /*********************************************** REGISTER FUNCTION  *********************************/
  /*********************************************** REGISTER FUNCTION  *********************************/
  /*********************************************** REGISTER FUNCTION  *********************************/
  loading_signup=false;
  id_user:number;
  register() {
    if( !this.cgu_accepted ) {
      this.display_cgu_error = true;
      return;
    }
  
    if(this.loading_signup){
      return
    }
    this.loading_signup=true;
    this.user.nickname = this.registerForm1.value.nickname;
    this.user.email = this.registerForm1.value.email.toLowerCase();
    this.user.password = this.registerForm1.value.password;
    this.user.gender = "user";
    this.user.type_of_account = this.registerForm1.value.type_of_account;
    this.user.firstname = this.capitalizeFirstLetter( this.registerForm1.value.firstName.toLowerCase() ).replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,'');

    this.Profile_Edition_Service.addUser( this.user ).subscribe(r=>{
      if(!r[0].error){
        this.display_email_and_password_error=false;
        this.id_user=r[0].id_user;
        this.Profile_Edition_Service.send_email_for_account_creation(this.id_user).subscribe(m=>{
          this.loading_signup=false;
          if(this.user.type_of_account=="Fan"){
            this.step=-1;
            this.show_sent_mail=true;
          }
          else{
            this.step = 1;
            let text_loading = setInterval(() => {
              this.show_text=true;
              clearInterval(text_loading)
            }, 2000);
            
          }
          this.cd.detectChanges();
        })
      }
      else{
        this.loading_signup=false;
        this.display_email_and_password_error=true;
      }
    });
    
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
    if(this.research_member_loading && this.research){
      if (!this.research.nativeElement || !this.research.nativeElement.contains(btn)){
        this.research_member_loading=false;
      }
    }
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



  


  finish() {
    const dialogRef = this.dialog.open(LoginComponent, {
      data: {usage:"login"},
      panelClass: "loginComponentClass",
    });
    this.dialogRef.close();
   
  }
  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }

}