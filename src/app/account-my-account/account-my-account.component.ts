import { Component, OnInit, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import {ElementRef,  ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationsService } from '../services/notifications.service';
import { ChatService } from '../services/chat.service';
import { Trending_service } from '../services/trending.service';
import { Edtior_Projects } from '../services/editor_projects.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Favorites_service } from '../services/favorites.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { pattern } from '../helpers/patterns';
import { MustMatch } from '../helpers/must-match.validator';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { LoginComponent } from '../login/login.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
import { Location } from '@angular/common';
import { Community_recommendation } from '../services/recommendations.service';
import { AuthenticationService } from '../services/authentication.service';
import { DeviceDetectorService } from 'ngx-device-detector';
declare var $: any;

@Component({
  selector: 'app-account-my-account',
  templateUrl: './account-my-account.component.html',
  styleUrls: ['./account-my-account.component.scss'],
  animations: [
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
      
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0%)', opacity: 0}),
          animate('400ms', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
  ],
})
export class AccountMyAccountComponent implements OnInit {


  constructor(
    private formBuilder: FormBuilder,
    public route: ActivatedRoute, 
    private ChatService:ChatService,
    private Favorites_service:Favorites_service,
    private cd: ChangeDetectorRef,
    private location: Location,
    private Edtior_Projects:Edtior_Projects,
    private AuthenticationService:AuthenticationService,
    private Trending_service:Trending_service,
    private Profile_Edition_Service: Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private Community_recommendation:Community_recommendation,
    private NotificationsService:NotificationsService,
    private deviceService: DeviceDetectorService,
    public dialog: MatDialog,
    private navbar: NavbarService, 
  ) {
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
   }




  date_format=0;
  category='all';

  opened_category:number = 0;
  @Input('pseudo') pseudo:string;
  @Input('id_user') id_user:number;
  @Input('visitor_mode') visitor_mode:boolean;
  @Input('author') author:any;
  @Input('for_reset_password') for_reset_password:any;

  email='';
  gender:string;
  status:string;
  type_of_account:string;
  list_of_members=[];
  trendings_loaded=false;
  trendings_found=false;
  trendings_loaded_groups=false;
  trendings_found_groups=false;
  date_format_trendings=3;
  date_format_trendings_groups=3;
  date_format_editors=3;

  date_format_favorites=3;
  date_format_favorites_groups=3;
  concerned_by_favorites=false;

  @ViewChild("chartContainer") chartContainer:ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(this.opened_category==1 && this.chartContainer){
      this.view_size=[ this.chartContainer.nativeElement.offsetWidth, this.chartContainer.nativeElement.offsetHeight - 15 ];
      this.cd.detectChanges();
    }
  }



  device_info='';
  ngOnInit(): void {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    
    this.status=this.author.status;
    this.gender=this.author.gender;
    this.type_of_account=this.author.type_of_account;
    this.list_of_members=this.author.list_of_members;
    this.email=this.author.email;
    if(this.author.email_authorization=="false"){
      this.email_agreement=false
    }
    this.mailing_retrieved=true;

    if(this.type_of_account.includes('Artiste') ){
      this.concerned_by_favorites=true;
    }

    if(this.for_reset_password){
      this.registerForm1 = this.formBuilder.group({
        old_password_real_value: ['',
          Validators.compose([
            Validators.pattern(pattern("password")),
            Validators.maxLength(50),
          ]),
        ],
        old_password: ['',
          Validators.compose([
            Validators.required,
            Validators.pattern(pattern("password")),
            Validators.maxLength(50),
          ]),
        ],
        password: ['',
          Validators.compose([
            Validators.required,
            Validators.pattern(pattern("password")),
            Validators.maxLength(50),
          ]),
        ],
        confirmPassword: ['', Validators.required],
        }, {
          validators: [MustMatch('password', 'confirmPassword'),MustMatch('old_password_real_value', 'old_password')],
       });
  
  
      this.Profile_Edition_Service.decrypt_password(this.id_user).subscribe(r=>{
        if(r[0].password){
          this.password=r[0].password
          this.registerForm1.controls['old_password_real_value'].setValue(r[0].password)
        }
        else{
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Une erreur est survenue. Veuillez réinitialiser votre mot de passe.'},
            panelClass: "popupConfirmationClass",
          });
        }
        this.password_retrieved=true;
        this.registerForm1_activated=true;
      })
    }
    else{
      this.initialize_forms();
      this.get_my_list_of_groups_from_users();
    }
   
        
  }

  show_icon=false;
  

  sumo_ready=false;
  open_category(i){
    if(i==this.opened_category){
      return;
    }
    if(i==0){
      this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.id_user}/account-my-account/account`, this.device_info).subscribe();
      this.opened_category=i;
      this.cd.detectChanges();
    }
    if(i==1){
      this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.id_user}/account-about/remuneration`, this.device_info).subscribe();
      this.sumo_ready=false;
      this.opened_category=i;
      this.cd.detectChanges();
      this.initialize_selectors_remuneration();
    }
  }

  /********************************************** PARAMETERS **************************************/
  /********************************************** PARAMETERS **************************************/
  /********************************************** PARAMETERS **************************************/
  /********************************************** PARAMETERS **************************************/
  /********************************************** PARAMETERS **************************************/
  /********************************************** PARAMETERS **************************************/


  user_is_in_a_group=false;
  groups_owned_found=false;
  hide_password=true;
  password='';
  registerForm: FormGroup;
  registerForm_activated=false;

  registerForm1: FormGroup;
  registerForm1_activated=false;

  registerForm2: FormGroup;
  registerForm2_activated=false;
  display_error_validator2=false;

  
  registerForm3: FormGroup;
  registerForm3_activated=false;
  display_error_validator3=false;

  /********************************  INITIALIZE VIEW AND FORM (mail, password) **************************************/

  password_retrieved=false;
  mailing_retrieved=false;
  email_agreement=true;
  list_of_real_visitors_type=["Maison d'édition","Artiste","Professionnel"];
  list_of_visitors_type=["Maison d'édition/Editeur/Editrice","Artiste vérifié(e)","Professionnel(le) vérifié(e)"];
  special_visitor_type:string;
  initialize_forms(){

    
    this.registerForm = this.formBuilder.group({
      email: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("mail")),
          Validators.maxLength(100),
        ]),
      ]
    });

    this.registerForm1 = this.formBuilder.group({
      old_password_real_value: ['',
        Validators.compose([
          Validators.pattern(pattern("password")),
          Validators.maxLength(50),
        ]),
      ],
      old_password: ['',
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("password")),
          Validators.maxLength(50),
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
        validators: [MustMatch('password', 'confirmPassword'),MustMatch('old_password_real_value', 'old_password')],
     });

     this.registerForm2 = this.formBuilder.group({
      share: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("share")),
          Validators.maxLength(5),
        ]),
      ]
    });

    this.registerForm3 = this.formBuilder.group({
      trending_mail: true,
      ads_answers:true,
      special_visitor:true,
      group_creation:true,
      group_shares:true,
    });

    this.registerForm.controls['email'].setValue(this.email);
    this.Profile_Edition_Service.decrypt_password(this.id_user).subscribe(r=>{
      if(r[0].password){
        this.password=r[0].password
        this.registerForm1.controls['old_password_real_value'].setValue(r[0].password)
      }
      else if(this.id_user>3){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Une erreur est survenue. Veuillez réinitialiser votre mot de passe.'},
          panelClass: "popupConfirmationClass",
        });
      }
      this.password_retrieved=true;
    })

  
    
  }


  /********************************************** PASSWORDS **************************************/
  /********************************************** PASSWORDS **************************************/
  /********************************************** PASSWORDS **************************************/
  /********************************************** PASSWORDS **************************************/



  change_password_type(){
    this.hide_password=!this.hide_password;
  }

  edit_password(){
    this.registerForm1.controls['password'].setValue('');
    this.registerForm1.controls['confirmPassword'].setValue('')
    this.registerForm1.controls['old_password'].setValue('')
    this.registerForm1_activated=true;
  }

  checking_password=false;
  loading_new_pass=false;
  validate_edit_password(){
    if(this.checking_password){
      return
    }

    this.checking_password=true;
    if(this.registerForm1.invalid){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Mot de passe invalide.'},
        panelClass: "popupConfirmationClass",
      });
      this.checking_password=false;
      return
    }
    else if(this.registerForm1.value.password==this.registerForm1.value.old_password){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Votre mot de passe doit être différent du mot de passe actuel'},
        panelClass: "popupConfirmationClass",
      });
      this.checking_password=false;
      return
    }
    else{
      this.checking_password=true;
      this.Profile_Edition_Service.check_password(this.email, this.registerForm1.value.password).subscribe(data => {
        if(data.token){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Mot de passe invalide.'},
            panelClass: "popupConfirmationClass",
          });
          this.checking_password=false;
        }
        if(data.msg=="error"){
          this.Profile_Edition_Service.edit_password(this.registerForm1.value.password,this.id_user).subscribe(r=>{
           
            if(this.for_reset_password){
              location.reload();
            }
            else{
              this.password=this.registerForm1.value.password;
              this.registerForm1.reset();
              this.registerForm1.controls['confirmPassword'].setValue('')
              this.registerForm1.controls['old_password'].setValue('')
              this.registerForm1.controls['old_password_real_value'].setValue(this.password)
              this.registerForm1_activated=false;
              this.checking_password=false;
            }
            this.cd.detectChanges();
          })
        }
        if(data.msg=="error_old_value"){

          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:true, text:'Ce mot de passe a déjà été utilisé par le passé. Continuer ?'},
            panelClass: "popupConfirmationClass",
          });
          dialogRef.afterClosed().subscribe(result => {
            if( result ) {
              this.validate_old_password();
            }
            else {
              this.checking_password=false;
              
            }
          });

          this.checking_password=false;
        }
        
      },
      error => {
      })
    }
    
      
      
  }

  validate_old_password(){
    if(this.registerForm1.invalid){
      return
    }
    else{
      this.Profile_Edition_Service.edit_password(this.registerForm1.value.password,this.id_user).subscribe(r=>{
        this.password=this.registerForm1.value.password;
        this.registerForm1.reset();
        this.registerForm1.controls['confirmPassword'].setValue('')
        this.registerForm1.controls['old_password'].setValue('')
        this.registerForm1.controls['old_password_real_value'].setValue(this.password)
        this.registerForm1_activated=false;
        this.cd.detectChanges();
      })
    }
    
  }
  cancel_edit_password(){
    this.registerForm1.reset();
    this.registerForm1_activated=false;
    this.cd.detectChanges()
  }

  /********************************************** MAILING **************************************/
  /********************************************** MAILING **************************************/
  /********************************************** MAILING **************************************/
  /********************************************** MAILING **************************************/
 
  loading_email_changes=false;
  show_infos_email=false;
  change_show_email_infos(){
    this.show_infos_email=!this.show_infos_email;
  }
  change_mailing_agreement(){
    this.loading_email_changes=true;
    this.Profile_Edition_Service.change_mailing_managment(!this.email_agreement).subscribe(r=>{
      this.email_agreement=!this.email_agreement;
      this.loading_email_changes=false;
    })
  }

  edit_email(){
    this.registerForm_activated=true;
  }

  loading_email=false;
  validate_edit_email(){
    if(this.loading_email){
      return
    }
    this.loading_email=true;

    if(this.registerForm.invalid){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez saisir un e-mail valide.'},
        panelClass: "popupConfirmationClass",
      });
      this.loading_email=false;
    }
    else if(this.email==this.registerForm.value.email){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Adresse e-mail identique.'},
        panelClass: "popupConfirmationClass",
      });
      this.loading_email=false;
      this.cd.detectChanges()
    }
    else{
      this.Profile_Edition_Service.check_email({email:this.registerForm.value.email},0).subscribe(r=>{
        if(r[0][0].msg=="found" ){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Cette adresse e-mail est déjà utilisée par un autre utilisateur.'},
            panelClass: "popupConfirmationClass",
          });
          this.loading_email=false;
          this.cd.detectChanges()
        }
        else{
          this.Profile_Edition_Service.edit_email(this.registerForm.value.email).subscribe(r=>{
            this.registerForm_activated=false;
            this.email=this.registerForm.value.email
            this.loading_email=false;
            this.cd.detectChanges();
          })
        }

        
      })
     
    }
  }

  cancel_edit_email(){
    this.registerForm_activated=false;
  }


  

  /********************************************** GROUPS **************************************/
  /********************************************** GROUPS **************************************/
  /********************************************** GROUPS **************************************/
  /********************************************** GROUPS **************************************/

  current_id_group=-1;
  list_of_groups_names=[];
  list_of_groups_ids=[];
  list_of_groups_admins_ids=[];
  list_of_groups_status=[];
  manage_group_activated=[];
  manage_group_loading=[];
  list_of_members_ids_by_group={};
  list_of_members_pictures_by_group={};
  list_of_members_names_by_group={};
  list_of_members_pseudos_by_group={};
  list_of_members_shares_by_group={};
  list_of_members_status_by_group={};
  share_in_edition={}
  show_group_managment=false;
  show_list_of_members=false;
  get_my_list_of_groups_from_users(){

    if(this.type_of_account.includes("Artiste")){
      this.get_trendings();
      this.get_favorites();
      this.get_total_gains();

      if(this.gender!="Groupe"){
        this.Profile_Edition_Service.get_my_list_of_groups_from_users(this.id_user).subscribe(r=>{
          if(r[0].length>0){
            for(let i=0;i<r[0].length;i++){
              this.list_of_groups_names.push(r[0][i].nickname)
              this.list_of_groups_ids.push(r[0][i].id)
              this.list_of_groups_admins_ids.push(r[0][i].id_admin);
              this.list_of_members_ids_by_group[r[0][i].id]=r[0][i].list_of_members;
              if(!r[0][i].list_of_members_validations || (r[0][i].list_of_members_validations && r[0][i].list_of_members_validations.length!=r[0][i].list_of_members.length)){
                this.list_of_groups_status.push(false)
              }
              else{
                this.list_of_groups_status.push(true)
              }
              
            }
            this.current_id_group=this.list_of_groups_ids[0];
            this.get_trendings_for_a_group( this.list_of_groups_ids[0])
            this.get_favorites_for_a_group(this.list_of_groups_ids[0])
            this.get_total_group_gains();
            this.user_is_in_a_group=true;
          }
          this.show_group_managment=true;
          this.groups_owned_found=true;
        })
      }
      else{ 
        this.list_of_groups_names.push(this.pseudo)
        this.list_of_groups_ids.push(this.id_user)
        this.list_of_members_ids_by_group[this.id_user]=this.list_of_members;
        this.current_id_group=this.list_of_groups_ids[0];
        this.manage_group(0);
        this.show_list_of_members=true;
        this.groups_owned_found=true;
      }

      
    }
    else if(this.type_of_account.includes("dit")){
      this.get_editors_remuneration();
      this.get_total_gains();
      this.show_group_managment=false;
      this.groups_owned_found=true;
    }
    
  }

  manage_group(i){
    let id_group=  this.list_of_groups_ids[i];
    if(this.list_of_members_ids_by_group[id_group] && this.list_of_members_names_by_group[id_group] && this.list_of_members_ids_by_group[id_group].length== this.list_of_members_names_by_group[id_group].length){
      this.manage_group_loading[i]=false;
      this.manage_group_activated[i]=true;
      this.cd.detectChanges();
    }
    else{
      this.manage_group_loading[i]=true;
      this.Profile_Edition_Service.get_group_information_by_id(id_group).subscribe(users=>{
        if(users[0].error){
          let compt=0;
          this.list_of_members_pictures_by_group[id_group]=[];
          this.list_of_members_pictures_by_group_loaded[id_group]=[];
          this.list_of_members_names_by_group[id_group]=[];
          this.list_of_members_pseudos_by_group[id_group]=[];
          this.list_of_members_shares_by_group[id_group]=[];
          this.list_of_members_status_by_group[id_group]=[];
          this.share_in_edition[id_group]=[];
          for(let k=0;k<this.list_of_members_ids_by_group[id_group].length;k++){
            this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_members_ids_by_group[id_group][k] ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_members_pictures_by_group[id_group][k] = SafeURL;
            });
            this.Profile_Edition_Service.retrieve_profile_data( this.list_of_members_ids_by_group[id_group][k]).subscribe( l => {  
              this.list_of_members_names_by_group[id_group][k]  = l[0].firstname;
              this.list_of_members_pseudos_by_group[id_group][k] = l[0].nickname;
              this.list_of_members_status_by_group[id_group][k] = "En attente";
              this.list_of_members_shares_by_group[id_group][k]  = (100/this.list_of_members_ids_by_group[id_group].length).toFixed(2);
              compt++;
              if(compt==this.list_of_members_ids_by_group[id_group].length){
                this.manage_group_loading[i]=false;
                this.manage_group_activated[i]=true;
                this.cd.detectChanges();
              }
              
            })
          }
        
        }
        else{
          let compt=0;
          this.list_of_members_status_by_group[id_group]=[];
          this.list_of_members_shares_by_group[id_group]=[];
          this.list_of_members_pictures_by_group[id_group]=[];
          this.list_of_members_pictures_by_group_loaded[id_group]=[];
          this.list_of_members_names_by_group[id_group]=[];
          this.list_of_members_pseudos_by_group[id_group]=[];
          this.share_in_edition[id_group]=[];
          for(let j=0;j<users[0].length;j++){
            let index = this.list_of_members_ids_by_group[id_group].indexOf(users[0][j].id_user)
            this.list_of_members_status_by_group[id_group][index] = users[0][j].status;
            this.list_of_members_shares_by_group[id_group][index]  = users[0][j].share;
          }
          for(let k=0;k<this.list_of_members_ids_by_group[id_group].length;k++){
            
            
            this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_members_ids_by_group[id_group][k] ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_members_pictures_by_group[id_group][k] = SafeURL;
            });
            this.Profile_Edition_Service.retrieve_profile_data( this.list_of_members_ids_by_group[id_group][k]).subscribe( l => {
              this.list_of_members_names_by_group[id_group][k]  = l[0].firstname ;
              this.list_of_members_pseudos_by_group[id_group][k] = l[0].nickname;
              compt++;
              if(compt==this.list_of_members_ids_by_group[id_group].length){
                this.manage_group_loading[i]=false;
                this.manage_group_activated[i]=true;
                this.cd.detectChanges();
              }
              
            })
  
          }
        
        }
        
      })
    }
   
    
  }


  list_of_members_pictures_by_group_loaded=[]
  load_list_of_members_pictures_by_group(i,k){
    this.list_of_members_pictures_by_group_loaded[this.list_of_groups_ids[i]][k]=true;
  }

  cancel_manage_group(i){
    this.manage_group_activated[i]=false;
    this.manage_group_loading[i]=false;
  }
    
  a_share_is_in_edition=false;
  group_in_edition=[];
  edit_share(id_group,index){
    if( this.a_share_is_in_edition){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous avez déjà une édition en cours'},
        panelClass: "popupConfirmationClass",
      });
      return
    }
    this.registerForm2.controls['share'].setValue(this.list_of_members_shares_by_group[id_group][index]);
    this.a_share_is_in_edition=true;
    this.share_in_edition[id_group][index]=true;
    
    this.cd.detectChanges();
  }

  edit_share_equity(id_group){
    let edited=false;
    for(let i=0;i<this.list_of_members_ids_by_group[id_group].length;i++){
      if(this.list_of_members_shares_by_group[id_group][i]!=(100/this.list_of_members_ids_by_group[id_group].length).toFixed(2)){
        edited=true;
      }
      this.list_of_members_shares_by_group[id_group][i]=(100/this.list_of_members_ids_by_group[id_group].length).toFixed(2);
    }
    if(edited){
      this.group_in_edition[id_group]=true;
    }
    this.cd.detectChanges();
  }
  cancel_share(id_group,index){
    this.group_in_edition[id_group]=false;
    this.a_share_is_in_edition=false;
    this.share_in_edition[id_group][index]=false;
  }

  validate_share(id_group,index){
    if(this.registerForm2.invalid){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez saisir une répartition valide (au moins 2 chiffres)'},
        panelClass: "popupConfirmationClass",
      });
      return
    }
    if( this.list_of_members_shares_by_group[id_group][index]!=this.registerForm2.value.share){
      this.group_in_edition[id_group]=true;
    }
    this.list_of_members_shares_by_group[id_group][index]=this.registerForm2.value.share;
    this.a_share_is_in_edition=false;
    this.share_in_edition[id_group][index]=false;
  }



  validation_all=false;
  validate_all(id_group){
    if(this.validation_all){
      return
    }

    this.validation_all=true;
    if(this.a_share_is_in_edition){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez terminer votre édition avant de valider'},
        panelClass: "popupConfirmationClass",
      });
      
      this.validation_all=false;
      return
    }
    let compt=0;
    for(let i=0;i<this.list_of_members_ids_by_group[id_group].length;i++){
      
      compt+=(this.list_of_members_shares_by_group[id_group][i])?Number(this.list_of_members_shares_by_group[id_group][i]):0;
    }
    if(compt<99 || compt>100){
      this.validation_all=false;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'La somme des gains doit être compris entre 99 et 100. Elle est actuellement égale à : ' + compt},
        panelClass: "popupConfirmationClass",
      });
    }
    else{
        this.Profile_Edition_Service.validate_group_creation_and_shares(id_group,this.list_of_members_ids_by_group[id_group],this.list_of_members_shares_by_group[id_group]).subscribe(r=>{
          if(r[0].error){
            
            if(r[0].error=="already_validated"){
              const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                data: {showChoice:false, text:'Vous avez déjà validé la création de ce groupe'},
                panelClass: "popupConfirmationClass",
              });
            }
            else{
              let index=this.list_of_groups_ids.indexOf(id_group);
              const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                data: {showChoice:false, text:"Ce groupe n'existe plus. Il a surement été refusé par un autre membre"},
                panelClass: "popupConfirmationClass",
              });
              this.list_of_groups_names.splice(index,1);
              this.list_of_groups_ids.splice(index,1);
              this.list_of_groups_admins_ids.splice(index,1);
              this.list_of_groups_status.splice(index,1);
              this.manage_group_activated.splice(index,1);
              this.manage_group_loading.splice(index,1);
            }
            
          }
          else{
            let index=this.list_of_groups_ids.indexOf(id_group);
            let user_index= (this.list_of_members_ids_by_group[id_group]).indexOf(this.id_user)
            this.list_of_members_status_by_group[id_group][user_index]="validated";
            if(r[0].user.list_of_members_validations && r[0].user.list_of_members_validations.length==r[0].user.list_of_members.length){
              for(let j=0;j< this.list_of_members_status_by_group[id_group].length;j++){
                this.list_of_members_status_by_group[id_group][j]="validated";
              }
              this.list_of_groups_status[index]=true;
            }
            let list_of_receivers=this.list_of_members_ids_by_group[id_group].slice(0)
            list_of_receivers.splice(user_index,1)
            let user_name=this.list_of_members_names_by_group[id_group][user_index]
            let name=this.list_of_groups_names[index];
            this.NotificationsService.add_notification_for_group_creation('group_validation',this.id_user,user_name, list_of_receivers,'group_validation',name,'unknown',id_group,0,(r[0].loop=="second")?"add_and_shares":"add",false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"group_validation",
                id_user_name:user_name,
                id_user:this.id_user, 
                list_of_receivers: list_of_receivers, 
                publication_category:'group_validation',
                publication_name:name,
                format:'unknown',
                publication_id:id_group,
                chapter_number:0,
                information:(r[0].loop=="second")?"add_and_shares":"add",
                status:"unchecked",
                is_comment_answer:false,
                comment_id:0,
              }
              this.ChatService.messages.next(message_to_send);
              this.cd.detectChanges()
            })
          }
          this.validation_all=false;
          this.group_in_edition[id_group]=false;
        });
        
    }
  }


  abort_group(id_group){


    let index=this.list_of_groups_ids.indexOf(id_group);
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir refuser la création de ce groupe ? Ceci entrainera sa suppression'},
      panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.Profile_Edition_Service.abort_group_creation(id_group).subscribe(r=>{
          let name=this.list_of_groups_names[index];
          this.list_of_groups_names.splice(index,1);
          this.list_of_groups_ids.splice(index,1);
          this.list_of_groups_admins_ids.splice(index,1);
          this.list_of_groups_status.splice(index,1);
          this.manage_group_activated.splice(index,1);
          this.manage_group_loading.splice(index,1);
          let index_user=this.list_of_members_ids_by_group[id_group].indexOf(this.id_user);
          let user_name=this.list_of_members_pseudos_by_group[id_group][index_user];
          this.list_of_members_ids_by_group[id_group].splice(index_user,1)
          this.NotificationsService.add_notification_for_group_creation('group_abort',this.id_user,user_name, this.list_of_members_ids_by_group[id_group],'group_abort',name,'unknown',id_group,0,"add",false,0).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"group_abort",
              id_user_name:user_name,
              id_user:this.id_user, 
              list_of_receivers: this.list_of_members_ids_by_group[id_group], 
              publication_category:'group_abort',
              publication_name:name,
              format:'unknown',
              publication_id:id_group,
              chapter_number:0,
              information:"add",
              status:"unchecked",
              is_comment_answer:false,
              comment_id:0,
            }
            this.ChatService.messages.next(message_to_send);
            if(this.list_of_groups_names.length==0){
              this.user_is_in_a_group=false;
              this.cd.detectChanges()
            }
          }) 
          
        })
      }
     
      
    })
  }


  exit_group(id_group){
    let index=this.list_of_groups_ids.indexOf(id_group);
    if(this.list_of_groups_admins_ids[index]==this.id_user){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:true, text:'Etes-vous sûr de vouloir quitter ce groupe ? Votre départ mettra fin au groupe'},
        panelClass: "popupConfirmationClass",
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.Profile_Edition_Service.abort_group_creation(id_group).subscribe(r=>{
            let name=this.list_of_groups_names[index];
            this.list_of_groups_names.splice(index,1);
            this.list_of_groups_ids.splice(index,1);
            this.list_of_groups_admins_ids.splice(index,1);
            this.list_of_groups_status.splice(index,1);
            this.manage_group_activated.splice(index,1);
            this.manage_group_loading.splice(index,1);
            let index_user=this.list_of_members_ids_by_group[id_group].indexOf(this.id_user);
            let user_name=this.list_of_members_pseudos_by_group[id_group][index_user];
            this.list_of_members_ids_by_group[id_group].splice(index_user,1)
            this.NotificationsService.add_notification_for_group_creation('group_abort',this.id_user,user_name, this.list_of_members_ids_by_group[id_group],'group_abort',name,'unknown',id_group,0,"abort_and_admin",false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"group_abort",
                id_user_name:user_name,
                id_user:this.id_user, 
                list_of_receivers: this.list_of_members_ids_by_group[id_group], 
                publication_category:'group_abort',
                publication_name:name,
                format:'unknown',
                publication_id:id_group,
                chapter_number:0,
                information:"abort_and_admin",
                status:"unchecked",
                is_comment_answer:false,
                comment_id:0,
              }
              this.ChatService.messages.next(message_to_send);
              if(this.list_of_groups_names.length==0){
                this.user_is_in_a_group=false;
                this.cd.detectChanges()
              }
            }) 
           
          })
        }
        
        
      })
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:true, text:'Etes-vous sûr de vouloir quitter ce groupe ? Vous ne pourrez plus le rejoindre ni bénéficier de gains supplémentaires reliés à ce groupe '},
        panelClass: "popupConfirmationClass",
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.Profile_Edition_Service.exit_group(id_group,this.id_user).subscribe(r=>{
            let name=this.list_of_groups_names[index];
            this.list_of_groups_names.splice(index,1);
            this.list_of_groups_ids.splice(index,1);
            this.list_of_groups_admins_ids.splice(index,1);
            this.list_of_groups_status.splice(index,1);
            this.manage_group_activated.splice(index,1);
            this.manage_group_loading.splice(index,1);
            let index_user=this.list_of_members_ids_by_group[id_group].indexOf(this.id_user);
            let user_name=this.list_of_members_pseudos_by_group[id_group][index_user];
            this.list_of_members_ids_by_group[id_group].splice(index_user,1);
            this.NotificationsService.add_notification_for_group_creation('group_exit',this.id_user,user_name, this.list_of_members_ids_by_group[id_group],'group_exit',name,'unknown',id_group,0,"add",false,0).subscribe(l=>{
              let message_to_send ={
                for_notifications:true,
                type:"group_exit",
                id_user_name:user_name,
                id_user:this.id_user, 
                list_of_receivers: this.list_of_members_ids_by_group[id_group], 
                publication_category:'group_exit',
                publication_name:name,
                format:'unknown',
                publication_id:id_group,
                chapter_number:0,
                information:"add",
                status:"unchecked",
                is_comment_answer:false,
                comment_id:0,
              }
              this.ChatService.messages.next(message_to_send);
              if(this.list_of_groups_names.length==0){
                this.user_is_in_a_group=false;
                this.cd.detectChanges()
              }
            }) 
          })
        }
        
        
      })
    }
    
  }

  exit_user_from_the_group(id_group,index_user){
    let exit_user = this.list_of_members_ids_by_group[id_group][index_user];
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir supprimer ce membre du groupe ?'},
      panelClass: "popupConfirmationClass",
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.loading_add_artist=true;
        this.Profile_Edition_Service.exit_group(id_group,exit_user).subscribe(r=>{
          this.loading_add_artist=true;
          let index = this.list_of_groups_ids.indexOf(id_group);
          this.list_of_groups_status[index]=false;
          this.manage_group_activated[index]=false;
          this.reset_groups();
        })
      }
    })
    
  }


  loading_add_artist=false;

  add_artist(i,index){
    if(10>this.list_of_members_ids_by_group[i].length){
      const dialogRef = this.dialog.open(PopupFormComponent, {
        data: {type:"add_artist",id_group:i,members:this.list_of_members_ids_by_group[i],id_admin:this.id_user,pseudo:this.pseudo,group_name:this.list_of_groups_names[index]},
        panelClass: 'popupAddArtist',
      });
     
    }
    

  }

  reset_groups(){
    this.list_of_groups_names=[];
    this.list_of_groups_ids=[];
    this.list_of_groups_admins_ids=[];
    this.list_of_members_ids_by_group={};
    this.list_of_groups_status=[];
    this.Profile_Edition_Service.get_my_list_of_groups_from_users(this.id_user).subscribe(r=>{
      if(r[0].length>0){
        for(let i=0;i<r[0].length;i++){
          this.list_of_groups_names.push(r[0][i].nickname)
          this.list_of_groups_ids.push(r[0][i].id)
          this.list_of_groups_admins_ids.push(r[0][i].id_admin)
          this.list_of_members_ids_by_group[r[0][i].id]=r[0][i].list_of_members;
          if(!r[0][i].list_of_members_validations || (r[0][i].list_of_members_validations && r[0][i].list_of_members_validations.length!=r[0][i].list_of_members.length)){
            this.list_of_groups_status.push(false)
          }
          else{
            this.list_of_groups_status.push(true)
          }
        }
        
        this.loading_add_artist=false;
      }
    })
  }
  /*create_a_group(){
    const dialogRef = this.dialog.open(SignupComponent, {
      data: {for_group_creation:true},
      panelClass:"signupComponentClass"
    });
  }*/



 /****************************************** ACCOUNT SETTINGS **********************************/
 deletion_loading=false;

 suspend_account(){

  if(this.user_is_in_a_group){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:"Veillez à quitter tous les groupes auxquels vous appartenez avant la suspension de votre compte"},
      panelClass: "popupConfirmationClass",
    });
  }
  else{
     
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:"Etes-vous sûr de vouloir suspendre votre compte ? La suspension du compte entrainera l'invisibilité de vos oeuvres, annonces, commentaires, mentions j'aime et j'adore. Vous pourrez néanmoins le récupérer en tout temps"},
      panelClass: "popupConfirmationClass",
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        const dialogRef = this.dialog.open(LoginComponent, {
          data: {usage:"suspend_account",id_user:this.id_user},
          panelClass:"loginComponentClass"
        });
      }
    })
  }
 



 }

 get_back_suspended_account(){
    this.deletion_loading=true;
    this.Profile_Edition_Service.get_back_suspended_account().subscribe(r=>{
      this.deletion_loading=false;
      location.reload();
    })
 }

 
 delete_account(){

  if(this.user_is_in_a_group){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:"Veillez à quitter tous les groupes auxquels vous appartenez avant la suppression de votre compte"},
      panelClass: "popupConfirmationClass",
    });
  }
  else{
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir supprimer votre compte ?'},
      panelClass: "popupConfirmationClass",
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        const dialogRef = this.dialog.open(LoginComponent, {
          data: {usage:"delete_account",id_user:this.id_user},
          panelClass:"loginComponentClass"
        });
      }
    })

    
  }
 

   
 }


 loading_connexion=[];
 loading_connexion_unit=false;
 open_group(i){
  if(this.loading_connexion_unit){
    return
  }
  if(!this.list_of_groups_status[i]){
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:"Connexion impossible. La création de ce groupe n'a pas encore été validée par tous ses membres."},
      panelClass: "popupConfirmationClass",
    });
    return
  }
  this.loading_connexion_unit=true;
  this.loading_connexion[i]=true;
  this.navbar.add_page_visited_to_history(`/account/${this.pseudo}/${this.id_user}/switch_to_group/${this.list_of_groups_names[i]}/${this.list_of_groups_ids[i]}`, this.device_info).subscribe();
  this.AuthenticationService.login_group_as_member(this.list_of_groups_ids[i],this.id_user).subscribe( data => {
    if(data.token){
      this.Community_recommendation.delete_recommendations_cookies();
      this.Community_recommendation.generate_recommendations().subscribe(r=>{
        this.loading_connexion_unit=false;
        this.loading_connexion[i]=false;
        this.location.go("/account/" + this.list_of_groups_names[i])
        location.reload();
      })
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Une erreur est survenue. Veuillez réessayer ultérieurement."},
        panelClass: "popupConfirmationClass",
      });
      this.loading_connexion_unit=false;
      this.loading_connexion[i]=false;
    }
  })
 }


  /************************************* TRENDINGS GAINS  **************************************/
  /************************************* TRENDINGS GAINS  **************************************/
  /************************************* TRENDINGS GAINS  **************************************/
  /************************************* TRENDINGS GAINS  **************************************/

  

  initialize_selectors_remuneration() {

    let THIS=this;
  
    $(document).ready(function () {   
      $(".Sumo_trendings").SumoSelect({});    
      $(".Sumo_trendings_groups").SumoSelect({});  
      $(".Sumo_trendings_chose_group").SumoSelect({});  

      $(".Sumo_favorites").SumoSelect({});    
      $(".Sumo_favorites_groups").SumoSelect({});  
      $(".Sumo_favorites_chose_group").SumoSelect({});  

      $(".Sumo_editors").SumoSelect({}); 

      THIS.sumo_ready=true;
      THIS.cd.detectChanges();
    });

    
    $(".Sumo_editors").change(function(){
      let old_date=THIS.date_format_editors;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_editors=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_editors=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_editors=2;
      }
      else{
        THIS.date_format_editors=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_editors){
        THIS.get_editors_remuneration();
      }
    });

    $(".Sumo_trendings").change(function(){
      let old_date=THIS.date_format_trendings;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_trendings=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_trendings=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_trendings=2;
      }
      else{
        THIS.date_format_trendings=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_trendings){
        THIS.get_trendings();
      }
        
    });

  

    $(".Sumo_trendings_groups").change(function(){
      let old_date=THIS.date_format_trendings_groups;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_trendings_groups=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_trendings_groups=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_trendings_groups=2;
      }
      else{
        THIS.date_format_trendings_groups=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_trendings_groups){
        THIS.get_trendings_for_a_group(THIS.current_id_group);
      }
        
    });

    $(".Sumo_trendings_chose_group").change(function(){
      let index =THIS.list_of_groups_names.indexOf($(this).val() )
      THIS.get_trendings_for_a_group(THIS.list_of_groups_ids[index]);
        
    });
  

    $(".Sumo_favorites").change(function(){
      let old_date=THIS.date_format_favorites;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_favorites=0;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_favorites=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_favorites=2;
      }
      else{
        THIS.date_format_favorites=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_favorites){
        THIS.get_favorites();
      }
        
    });

    $(".Sumo_favorites_groups").change(function(){
      let old_date=THIS.date_format_favorites_groups;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_favorites_groups=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_favorites_groups=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_favorites_groups=2;
      }
      else{
        THIS.date_format_favorites_groups=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_favorites_groups){
        THIS.get_favorites_for_a_group(THIS.current_id_group);
      }
        
    });

    $(".Sumo_favorites_chose_group").change(function(){
      let index =THIS.list_of_groups_names.indexOf($(this).val() )
      THIS.get_favorites_for_a_group(THIS.list_of_groups_ids[index]);
        
    });
  

  }
 
  // options for the chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  timeline = true;
  colorScheme = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };
  showLabels = true;

  view_size: any[] = [800, 400];
  show_legends=false;
  xAxis_trendings_1 = "Date";
  yAxis_trendings_1 = "Meilleur gain";
  multi_trendings_1=[];


  xAxis_trendings_2 = "Date";
  yAxis_trendings_2 = "Somme des gains";
  multi_trendings_2=[];
  compteur_trendings=0;

  total_gains_trendings=0
  number_of_comics_gains=0;
  number_of_drawings_gains=0;
  number_of_writings_gains=0;


  
  get_trendings(){
    this.compteur_trendings++;
    this.trendings_loaded=false;
    this.trendings_found=false;
    this.Trending_service.get_all_trendings_by_user(this.date_format_trendings,this.id_user,this.compteur_trendings).subscribe(r=>{

      if(r[1]== this.compteur_trendings){
        if(Object.keys(r[0][0].list_of_contents).length>0){
          this.total_gains_trendings=0;
          this.number_of_comics_gains=0;
          this.number_of_drawings_gains=0;
          this.number_of_writings_gains=0;
          this.multi_trendings_1=[{
            "name": "Tendances B.D.",
            "series": []
          },
          {
            "name": "Tendances Dessins",
            "series": []
          },
          {
            "name": "Tendances Ecrits",
            "series": []
          }]
          this.multi_trendings_2=[{
            "name": "Tendances B.D.",
            "series": []
          },
          {
            "name": "Tendances Dessins",
            "series": []
          },
          {
            "name": "Tendances Ecrits",
            "series": []
          }]
  
          for( let i=0;i<Object.keys(r[0][0].list_of_contents).length;i++){
  
              let timestamp= r[0][0].list_of_contents[i].createdAt
              let rank=r[0][0].list_of_contents[i].rank;
              let gain = Number(r[0][0].list_of_contents[i].remuneration);
              this.total_gains_trendings+=gain;
              let uploaded_date = timestamp.substring(0,timestamp.length - 5);
              uploaded_date = uploaded_date.replace("T",' ');
              uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
              let first_date = new Date(uploaded_date + ' GMT');
              let date= first_date.getDate()+'-'+(first_date.getMonth()+1)+'-'+first_date.getFullYear();
              let index = this.multi_trendings_1[0].series.findIndex(x => x.name === date)
  
  
              if(index>=0){
                if(r[0][0].list_of_contents[i].publication_category=="comic"){
                  
                  this.number_of_comics_gains+=gain;
                  if(this.multi_trendings_1[0].series[index].value>gain || this.multi_trendings_1[0].series[index].value==0){
                    this.multi_trendings_1[0].series[index].value=gain;
                  }
                  this.multi_trendings_2[0].series[index].value+=gain;
                }
                else if(r[0][0].list_of_contents[i].publication_category=="drawing"){
                  this.number_of_drawings_gains+=gain;
                  if(this.multi_trendings_1[1].series[index].value>gain || this.multi_trendings_1[1].series[index].value==0){
                    this.multi_trendings_1[1].series[index].value=gain;
                  }
                  this.multi_trendings_2[1].series[index].value+=gain;
                }
                else{
                  this.number_of_writings_gains+=gain;
                  if(this.multi_trendings_1[2].series[index].value>gain || this.multi_trendings_1[2].series[index].value==0){
                    this.multi_trendings_1[2].series[index].value=gain;
                  }
                  this.multi_trendings_2[2].series[index].value+=gain;
                }
                
              }
              else{
                if(r[0][0].list_of_contents[i].publication_category=="comic"){
                  this.number_of_comics_gains+=gain;
                  this.multi_trendings_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_trendings_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
  
                  this.multi_trendings_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_trendings_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                }
                else if(r[0][0].list_of_contents[i].publication_category=="drawing"){
                  this.number_of_drawings_gains+=gain;
                  this.multi_trendings_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_trendings_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
  
                  this.multi_trendings_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_trendings_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                }
                else{
                  this.number_of_writings_gains+=gain;
                  this.multi_trendings_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
  
                  this.multi_trendings_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                }
              }
          }
          this.trendings_found=true;
        }
        else{
          this.trendings_found=false;
        }
        
        this.trendings_loaded=true;
      }
      
      this.cd.detectChanges()
    })
  
  }

  /************************************** TRENDINGS GROUP GAINS *********************************/
  /************************************** TRENDINGS GROUP GAINS *********************************/
  /************************************** TRENDINGS GROUP GAINS *********************************/
  /************************************** TRENDINGS GROUP GAINS *********************************/
  /************************************** TRENDINGS GROUP GAINS *********************************/


  xAxis_trendings_groups_1 = "Date";
  yAxis_trendings_groups_1 = "Meilleur gain";
  multi_trendings_groups_1=[];


  xAxis_trendings_groups_2 = "Date";
  yAxis_trendings_groups_2 = "Somme des gains";
  multi_trendings_groups_2=[];
  compteur_trendings_groups=0;

  total_gains_groups=0
  number_of_comics_gains_groups=0;
  number_of_drawings_gains_groups=0;
  number_of_writings_gains_groups=0;


  get_trendings_for_a_group(id_group){
    this.compteur_trendings_groups++;
    this.trendings_loaded_groups=false;
    this.trendings_found_groups=false;
    this.Trending_service.get_all_trendings_by_user(this.date_format_trendings_groups,id_group,this.compteur_trendings_groups).subscribe(r=>{
      if(r[1]== this.compteur_trendings_groups){
        if(Object.keys(r[0][0].list_of_contents).length>0){
          this.total_gains_groups=0;
          this.number_of_comics_gains_groups=0;
          this.number_of_drawings_gains_groups=0;
          this.number_of_writings_gains_groups=0;
          this.multi_trendings_groups_1=[{
            "name": "Tendances B.D.",
            "series": []
          },
          {
            "name": "Tendances Dessins",
            "series": []
          },
          {
            "name": "Tendances Ecrits",
            "series": []
          }]
          this.multi_trendings_groups_2=[{
            "name": "Tendances B.D.",
            "series": []
          },
          {
            "name": "Tendances Dessins",
            "series": []
          },
          {
            "name": "Tendances Ecrits",
            "series": []
          }]
  
          for( let i=0;i<Object.keys(r[0][0].list_of_contents).length;i++){
  
              let timestamp= r[0][0].list_of_contents[i].createdAt
              let rank=r[0][0].list_of_contents[i].rank;
              let gain = Number(r[0][0].list_of_contents[i].remuneration);
              let share=Number(r[0][0].list_of_contents[i].shares[0][this.id_user])/100;
              this.total_gains_groups+=gain*share;
              let uploaded_date = timestamp.substring(0,timestamp.length - 5);
              uploaded_date = uploaded_date.replace("T",' ');
              uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
              let first_date = new Date(uploaded_date + ' GMT');
              let date= first_date.getDate()+'-'+(first_date.getMonth()+1)+'-'+first_date.getFullYear();
              let index = this.multi_trendings_groups_1[0].series.findIndex(x => x.name === date)
  
  
              if(index>=0){
                if(r[0][0].list_of_contents[i].publication_category=="comic"){
                  
                  this.number_of_comics_gains_groups+=gain*share;
                  if(this.multi_trendings_groups_1[0].series[index].value>gain*share || this.multi_trendings_groups_1[0].series[index].value==0){
                    this.multi_trendings_groups_1[0].series[index].value=gain*share;
                  }
                  this.multi_trendings_groups_2[0].series[index].value+=gain*share;
                }
                else if(r[0][0].list_of_contents[i].publication_category=="drawing"){
                  this.number_of_drawings_gains_groups+=gain*share;
                  if(this.multi_trendings_groups_1[1].series[index].value>gain*share || this.multi_trendings_groups_1[1].series[index].value==0){
                    this.multi_trendings_groups_1[1].series[index].value=gain*share;
                  }
                  this.multi_trendings_groups_2[1].series[index].value+=gain*share;
                }
                else{
                  this.number_of_writings_gains_groups+=gain*share;
                  if(this.multi_trendings_groups_1[2].series[index].value>gain*share || this.multi_trendings_groups_1[2].series[index].value==0){
                    this.multi_trendings_groups_1[2].series[index].value=gain*share;
                  }
                  this.multi_trendings_groups_2[2].series[index].value+=gain*share;
                }
                
              }
              else{
                if(r[0][0].list_of_contents[i].publication_category=="comic"){
                  this.number_of_comics_gains_groups+=gain*share;
                  this.multi_trendings_groups_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_trendings_groups_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_groups_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
  
                  this.multi_trendings_groups_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_trendings_groups_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_groups_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                }
                else if(r[0][0].list_of_contents[i].publication_category=="drawing"){
                  this.number_of_drawings_gains_groups+=gain*share;
                  this.multi_trendings_groups_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_groups_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_trendings_groups_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
  
                  this.multi_trendings_groups_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_groups_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_trendings_groups_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                }
                else{
                  this.number_of_writings_gains_groups+=gain*share;
                  this.multi_trendings_groups_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_groups_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_groups_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
  
                  this.multi_trendings_groups_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_groups_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_groups_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                }
                
              }
            
          }
          this.trendings_found_groups=true;
        }
        else{
          this.trendings_found_groups=false;
        }
        
        this.trendings_loaded_groups=true;
      }
      this.cd.detectChanges()
    })
  
  }


  /*********************************************** FAVORITES  ***************************************/
  /*********************************************** FAVORITES  ***************************************/
  /*********************************************** FAVORITES  ***************************************/
  /*********************************************** FAVORITES  ***************************************/
  /*********************************************** FAVORITES  ***************************************/


  
  xAxis_favorites_1 = "Date";
  yAxis_favorites_1 = "Coups de coeur";
  multi_favorites_1=[];



  total_gains_favorites=0
  compteur_favorites=0;
  favorites_loaded=false;
  favorites_found=false;
  

  get_favorites(){
    this.compteur_favorites++;
    this.favorites_loaded=false;
    this.favorites_found=false;
    this.Favorites_service.get_all_favorites_by_user(this.date_format_favorites,this.id_user,this.compteur_favorites).subscribe(r=>{
      if(r[1]== this.compteur_favorites){
        if(Object.keys(r[0][0].list_of_favorites).length>0){
          this.total_gains_favorites=0;
          this.multi_favorites_1=[{
            "name": "Classement",
            "series": []
          }]
         
  
          for( let i=0;i<Object.keys(r[0][0].list_of_favorites).length;i++){
  
              let timestamp= r[0][0].list_of_favorites[i].createdAt
              let rank=r[0][0].list_of_favorites[i].rank;
              let gain = Number(r[0][0].list_of_favorites[i].remuneration);
              this.total_gains_favorites+=gain;
              let uploaded_date = timestamp.substring(0,timestamp.length - 5);
              uploaded_date = uploaded_date.replace("T",' ');
              uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
              let first_date = new Date(uploaded_date + ' GMT');
              let date= first_date.getDate()+'-'+(first_date.getMonth()+1)+'-'+first_date.getFullYear();
              let index = this.multi_favorites_1[0].series.findIndex(x => x.name === date)
  
  
              if(index>=0){
                  if(this.multi_favorites_1[0].series[index].value>rank || this.multi_favorites_1[0].series[index].value==0){
                    this.multi_favorites_1[0].series[index].value=rank;
                  }
                
                
              }
              else{
    
                  this.multi_favorites_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": rank
                    }
                  )
             
                
              }
            
          }
          this.favorites_found=true;
        }
        else{
          this.favorites_found=false;
        }
        
        this.favorites_loaded=true;
      }
      this.cd.detectChanges()
    })
  
  }


  /************************************** FAVORITES GROUP GAINS *********************************/
  /************************************** FAVORITES GROUP GAINS *********************************/
  /************************************** FAVORITES GROUP GAINS *********************************/
  /************************************** FAVORITES GROUP GAINS *********************************/
  /************************************** FAVORITES GROUP GAINS *********************************/


  xAxis_favorites_groups_1 = "Date";
  yAxis_favorites_groups_1 = "Coups de coeurs";
  multi_favorites_groups_1=[];
  compteur_favorites_groups=0;

  total_gains_groups_favorites=0
  favorites_loaded_groups=false;
  favorites_found_groups=false;

  get_favorites_for_a_group(id_group){
    this.compteur_favorites_groups++;
    this.favorites_loaded_groups=false;
    this.favorites_found_groups=false;
    this.Favorites_service.get_all_favorites_by_user(this.date_format_favorites_groups,id_group,this.compteur_favorites_groups).subscribe(r=>{
      if(r[1]== this.compteur_favorites_groups){
        if(Object.keys(r[0][0].list_of_favorites).length>0){
          this.total_gains_groups_favorites=0;
          this.multi_favorites_groups_1=[{
            "name": "Classement",
            "series": []
          }]
      
  
          for( let i=0;i<Object.keys(r[0][0].list_of_favorites).length;i++){
  
              let timestamp= r[0][0].list_of_favorites[i].createdAt
              let rank=r[0][0].list_of_favorites[i].rank;
              let gain = Number(r[0][0].list_of_favorites[i].remuneration);
              let share=Number(r[0][0].list_of_favorites[i].shares[0][this.id_user])/100;
              this.total_gains_groups_favorites+=gain*share;
              let uploaded_date = timestamp.substring(0,timestamp.length - 5);
              uploaded_date = uploaded_date.replace("T",' ');
              uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
              let first_date = new Date(uploaded_date + ' GMT');
              let date= first_date.getDate()+'-'+(first_date.getMonth()+1)+'-'+first_date.getFullYear();
              let index = this.multi_favorites_groups_1[0].series.findIndex(x => x.name === date)
  
  
              if(index>=0){
                  if(this.multi_favorites_groups_1[0].series[index].value>gain*share || this.multi_favorites_groups_1[0].series[index].value==0){
                    this.multi_favorites_groups_1[0].series[index].value=gain*share;
                  }
                
              }
              else{
                  this.multi_favorites_groups_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
              }
            
          }
          this.favorites_found_groups=true;
        }
        else{
          this.favorites_found_groups=false;
        }
        
        this.favorites_loaded_groups=true;
      }
      this.cd.detectChanges()
    })
  
  }

  
  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop + 600;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

  scrollDown() {
    window.scrollBy({
      top: 200,
      behavior : "smooth"
    })
  }


  /************************************* EDITORS GAINS  **************************************/
  /************************************* EDITORS GAINS  **************************************/
  /************************************* EDITORS GAINS  **************************************/
  /************************************* EDITORS GAINS  **************************************/

  

 
  // options for the chart
  
  xAxis_editors = "Date";
  yAxis_editors = "Somme des gains";
  multi_editors=[];


  editors_loaded=false;
  editors_found=false;

  compteur_editors=0;

  total_gains_editors=0
  number_of_standard_gains=0;
  number_of_express_gains=0;


  
  get_editors_remuneration(){
    this.compteur_editors++;
    this.editors_loaded=false;
    this.editors_found=false;
    this.Edtior_Projects.get_all_editors_gains(this.date_format_editors,this.compteur_editors).subscribe(r=>{
      if(r[1]== this.compteur_editors){
        if(r[0][0].list_of_contents.length>0){
          this.total_gains_editors=0;
          this.number_of_standard_gains=0;
          this.number_of_express_gains=0;
          this.multi_editors=[{
            "name": "Formules Standard",
            "series": []
          },
          {
            "name": "Formules Express",
            "series": []
          }]
  
          for( let i=0;i<r[0][0].list_of_contents.length;i++){
              let gain = r[0][0].list_of_contents[i].price;
              this.total_gains_editors+=gain;
              let timestamp= r[0][0].list_of_contents[i].createdAt;
              let uploaded_date = timestamp.substring(0,timestamp.length - 5);
              uploaded_date = uploaded_date.replace("T",' ');
              uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
              let first_date = new Date(uploaded_date + ' GMT');
              let date= first_date.getDate()+'-'+(first_date.getMonth()+1)+'-'+first_date.getFullYear();

              let index = this.multi_editors[0].series.findIndex(x => x.name === date)

  
              if(index>=0){
                if(r[0][0].list_of_contents[i].formula=="standard"){
                  this.multi_editors[0].series[index].value+=gain;
                }
                else if(r[0][0].list_of_contents[i].formula=="express"){
                  this.multi_editors[1].series[index].value+=gain;
                }
                
              }
              else{
                if(r[0][0].list_of_contents[i].formula=="standard"){
                  this.number_of_standard_gains+=gain;
  
                  this.multi_editors[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                  this.multi_editors[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                }
                else if(r[0][0].list_of_contents[i].formula=="express"){
                  this.number_of_express_gains+=gain;
                  this.multi_editors[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_editors[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": gain
                    }
                  )
                }
              }
          }
          this.editors_found=true;
        }
        else{
          this.editors_found=false;
        }
        
        this.editors_loaded=true;
      }
      
      this.cd.detectChanges()
    })
  
  }

  /************************************** TOTAL GAINS *********************************/
  /************************************** TOTAL GAINS *********************************/
  /************************************** TOTAL GAINS *********************************/
  /************************************** TOTAL GAINS *********************************/
  /************************************** TOTAL GAINS *********************************/

  trendings_gains_retrieved=false;
  trendings_group_gains_retrieved=false;
  favorites_gains_retrieved=false;
  favorites_group_gains_retrieved=false;
  editors_gains_retrieved=false;
  total_gains=0;
  display_all_gains=false;
  get_total_gains(){
    if(this.type_of_account.includes('Artiste')){
      this.Favorites_service.get_total_favorites_gains_by_user().subscribe(r=>{
        this.total_gains+=r[0].total;
        this.favorites_gains_retrieved=true;
        this.display_total_gains()
      })
  
      this.Trending_service.get_total_trendings_gains_by_user().subscribe(r=>{
        this.total_gains+=r[0].total;
        this.trendings_gains_retrieved=true;
        this.display_total_gains()
      })
    }
    else{
      this.Edtior_Projects.get_total_editors_gains().subscribe(r=>{
        this.total_gains+=r[0].total;
        this.editors_gains_retrieved=true;
        this.display_total_gains()
      })
    }
    
  }

  get_total_group_gains(){
    if(this.type_of_account.includes('Artiste')){
      this.Favorites_service.get_total_favorites_gains_by_users_group(this.list_of_groups_ids).subscribe(r=>{
        this.total_gains+=r[0].total;
        this.favorites_group_gains_retrieved=true;
        this.display_total_gains()
      })
  
      this.Trending_service.get_total_trendings_gains_by_users_group(this.list_of_groups_ids).subscribe(r=>{
        this.total_gains+=r[0].total;
        this.trendings_group_gains_retrieved=true;
        this.display_total_gains()
      })
    }
    
  }


  display_total_gains(){

    if(this.type_of_account.includes("Artiste")){
      if(this.user_is_in_a_group){
      
        if( this.trendings_group_gains_retrieved &&  this.favorites_group_gains_retrieved &&  this.trendings_gains_retrieved &&  this.favorites_gains_retrieved){
          this.display_all_gains=true;
          this.cd.detectChanges();
        }
      }
      else{
        if(  this.trendings_gains_retrieved &&  this.favorites_gains_retrieved){
          this.display_all_gains=true;
          this.cd.detectChanges();
        }
      }
    }
    else{
      if(this.editors_gains_retrieved){
        this.display_all_gains=true;
        this.cd.detectChanges();
      }
    }

    
  }
  

  loading_remuneration=false;
  get_my_gains(){
    if(this.loading_remuneration){
      return
    }
    this.loading_remuneration=true;
    this.Profile_Edition_Service.get_my_remuneration(this.total_gains).subscribe(r=>{
      if(r[0].is_ok){

      }
      else{
        if(this.type_of_account.includes('dit')){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Vous n'avez aucune rémunération à percevoir pour le moment."},
            panelClass: "popupConfirmationClass",
          });
        }
        else if(r[0].reason=="money"){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Vous n'avez aucune rémunération à percevoir pour le moment."},
            panelClass: "popupConfirmationClass",
          });
        }
        else if(r[0].reason=="time"){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Cette option n'est pas disponible pour le moment. Votre compte doit avoir généré plus de 70.00 euros"},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Cette option n'est pas disponible pour le moment. "},
            panelClass: "popupConfirmationClass",
          });
        }
        
        this.loading_remuneration=false;
      }
      
    })
    
  }


  total_gains_standard:number=12;
  total_gains_express:number=14;
  number_of_applications_articles_gains:number=14;
  number_of_applications_bd_gains:number=14;
  number_of_applications_comics_gains:number=14;
  number_of_applications_mangas_gains:number=14;
  number_of_applications_livres_gains:number=14;
  number_of_applications_livres_jeunesses_gains:number=14;

  
  popup_message() {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:"Nous réalisons régulièrement des concours d'une semaine. Durant chacun des jours de cette semaine, une rémunération est attribuée à chaque artiste, pour chacune de ses œuvres classées dans le top 15 des tendances, en fonction de sa position dans le classement."},
      panelClass: "popupConfirmationClass",
    });
  }
}
