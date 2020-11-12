import { Component, OnInit, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NotificationsService } from '../services/notifications.service';
import { ChatService } from '../services/chat.service';
import { Trending_service } from '../services/trending.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Albums_service } from '../services/albums.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Favorites_service } from '../services/favorites.service';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { pattern } from '../helpers/patterns';
import { MustMatch } from '../helpers/must-match.validator';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { LoginComponent } from '../login/login.component';
declare var $: any;
@Component({
  selector: 'app-account-my-account',
  templateUrl: './account-my-account.component.html',
  styleUrls: ['./account-my-account.component.scss']
})
export class AccountMyAccountComponent implements OnInit {


  constructor(
    private rd: Renderer2, 
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    public route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
    private ChatService:ChatService,
    private Favorites_service:Favorites_service,
    private location: Location,
    private cd: ChangeDetectorRef,
    private Trending_service:Trending_service,
    private Profile_Edition_Service: Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private BdOneShotService: BdOneShotService,
    private BdSerieService:BdSerieService,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Subscribing_service:Subscribing_service,
    private NotificationsService:NotificationsService,
    private Ads_service:Ads_service,
    public dialog: MatDialog,
  ) { }



  visitor_mode:boolean;
  visitor_mode_retrieved=false;
  date_format=0;
  category='all';

  @Input('opened_category') opened_category:number;
  @Input('pseudo') pseudo:string;
  @Input('id_user') id_user:number;


  email='';
  data_retrieved=false;
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


  date_format_favorites=1;
  date_format_favorites_groups=1;
  concerned_by_favorites=false;
  ngOnInit(): void {
      this.Profile_Edition_Service.get_current_user().subscribe(r=>{
        console.log(r[0]);
        this.status=r[0].status;
        this.gender=r[0].gender;
        this.type_of_account=r[0].type_of_account;
        this.list_of_members=r[0].list_of_members;
        if(r[0].id==this.id_user){
          this.visitor_mode=false;
          this.visitor_mode_retrieved=true;
        }
        else{
          this.router.navigateByUrl('/page_not_found');
          return
        }
        if(this.type_of_account=="Artistes" || this.type_of_account=="Artistes professionnels"
        || this.type_of_account=="Artiste professionnelle" || this.type_of_account=="Artiste professionnel" || this.type_of_account=="Artiste"){
          this.concerned_by_favorites=true;
        }
        console.log( this.visitor_mode_retrieved)
        
        if(this.visitor_mode_retrieved){
          this.email=r[0].email;
          this.initialize_forms();

          this.get_my_list_of_groups_from_users();
          
          this.data_retrieved=true;
        }
       
      })
    
  }

  sumo_ready=false;
  open_catgory(i){
    if(i==this.opened_category){
      return;
    }
    if(i==0){
      if(this.type_of_account!="Passionné" && this.type_of_account!="Passionnée"){
        this.sumo_visitor_ready=false;
        this.opened_category=i;
        this.cd.detectChanges();
        this.initialize_selector_special_visitor()
      }
      else{
        this.opened_category=i;
        this.cd.detectChanges();
      }
     
    }
    if(i==1){
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
  display_error_validator=false;

  registerForm1: FormGroup;
  registerForm1_activated=false;
  display_error_validator1=false;

  registerForm2: FormGroup;
  registerForm2_activated=false;
  display_error_validator2=false;

  
  registerForm3: FormGroup;
  registerForm3_activated=false;
  display_error_validator3=false;

  /********************************  INITIALIZE VIEW AND FORM (mail, password) **************************************/

  password_retrieved=false;
  mailing_retrieved=false;

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
    this.Profile_Edition_Service.decrypt_password().subscribe(r=>{
      console.log(r)
      if(r[0].password){
        this.password=r[0].password
        this.registerForm1.controls['password'].setValue(r[0].password)
        this.registerForm1.controls['old_password_real_value'].setValue(r[0].password)
      }
      else{
        this.registerForm1.controls['password'].setValue("adamdrira")
        this.registerForm1.controls['old_password_real_value'].setValue("adamdrira")
      }
      console.log("password retrieved")
      this.password_retrieved=true;
    })

    if(this.type_of_account!="Passionné" && this.type_of_account!="Passionnée"){
      this.Profile_Edition_Service.get_mailing_managment().subscribe(r=>{
        console.log(r[0])
        console.log(r[0].trending_mail)
        this.registerForm3.controls['trending_mail'].setValue(r[0].trending_mail)
     
        this.registerForm3.controls['ads_answers'].setValue(r[0].ads_answers)
        this.registerForm3.controls['special_visitor'].setValue(r[0].special_visitor)
        this.registerForm3.controls['group_creation'].setValue(r[0].group_creation)
        this.registerForm3.controls['group_shares'].setValue(r[0].group_shares)
        console.log(   this.registerForm3.value)
        let index=this.list_of_real_visitors_type.indexOf(r[0].special_visitor_type)
        if(index>=0){
          this.special_visitor_type=this.list_of_visitors_type[index]
        }
        else{
          if(this.type_of_account=="Artistes" || this.type_of_account=="Artiste" || this.type_of_account=="Artistes professionnels" || this.type_of_account=="Artiste professionnel" 
          || this.type_of_account=="Artiste professionnelle" ){
            this.special_visitor_type=this.list_of_visitors_type[0]
          }
          else if(this.type_of_account=="Maison d'édition" || this.type_of_account=="Editrice" || this.type_of_account=="Editeur"  ){
            this.special_visitor_type=this.list_of_visitors_type[1]
          }
          else if(this.type_of_account=="Professionnels non artistes" || this.type_of_account=="Professionnelle non artiste" || this.type_of_account=="Professionnel non artiste"  ){
            this.special_visitor_type=this.list_of_visitors_type[1]
          }
        }
        this.mailing_retrieved=true;
        console.log("mail retrieved")
        this.initialize_selector_special_visitor()

        console.log(this.mailing_retrieved)
        console.log(this.sumo_visitor_ready)
        console.log(this.password_retrieved)
        console.log(this.groups_owned_found)
        
      })
    }
    else{
      this.mailing_retrieved=true;
      this.sumo_visitor_ready=true;
    }
    
  }

  sumo_visitor_ready=false;
  disable_sumo=false;
  initialize_selector_special_visitor(){
    console.log("initialize_selector_special_visitor")
    let THIS=this;
    this.cd.detectChanges()
    $(document).ready(function () {
      $(".Sumo_visitor").SumoSelect({});    
      THIS.sumo_visitor_ready=true;
      THIS.cd.detectChanges();
      console.log("sumo visitor ready")
    });

    $(".Sumo_visitor").change(function(){
      console.log("sumo change")
      console.log($(this).val());
      let old_special_visitor_type=THIS.special_visitor_type;
      THIS.special_visitor_type=$(this).val();
      THIS.cd.detectChanges();
      if(old_special_visitor_type!=THIS.special_visitor_type){
        THIS.disable_sumo=true;
        THIS.cd.detectChanges()
        THIS.update_special_visitor();
        console.log("ready to make changes")
      }
        
    });

  }
 
  update_special_visitor(){
    console.log(this.special_visitor_type)
    this.loading_changes[2]=true;
    this.registerForm3.get('special_visitor').disable();
    let index=this.list_of_visitors_type.indexOf(this.special_visitor_type)
    let special_visitor_type=this.list_of_real_visitors_type[index];
    this.Profile_Edition_Service.update_special_visitor(special_visitor_type).subscribe(r=>{
      this.disable_sumo=false;
      this.registerForm3.get('special_visitor').enable();
      this.loading_changes[2]=false;
      this.cd.detectChanges()
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

  display_old_password=false;
  display_current_password=false;
  validate_edit_password(){
    console.log(this.registerForm1)
    if(this.registerForm1.invalid){
      this.display_error_validator1=true;
    }
    else{
      this.Profile_Edition_Service.check_password(this.email, this.registerForm1.value.password).subscribe(data => {
        if(data.token){
          console.log("current password");
          this.display_current_password=true;
          this.display_old_password=false;
        }
        if(data.msg=="error"){
          // le mot de passe n'est ni ancien ni existant
          this.Profile_Edition_Service.edit_password(this.registerForm1.value.password).subscribe(r=>{
            console.log(r);
            this.password=this.registerForm1.value.password;
            this.registerForm1.controls['confirmPassword'].setValue('')
            this.registerForm1.controls['old_password'].setValue('')
            this.registerForm1.controls['old_password_real_value'].setValue(this.registerForm1.value.password)
            this.display_old_password=false;
            this.display_current_password=false;
            this.registerForm1_activated=false;
            this.cd.detectChanges();
          })
        }
        if(data.msg=="error_old_value"){
          this.display_current_password=false;
          this.display_old_password=true;
        }
        
      },
      error => {
      })
    }
    
      
      
  }

  validate_old_password(){
    if(this.registerForm1.invalid){
      this.display_error_validator1=true;
    }
    else{
      this.Profile_Edition_Service.edit_password(this.registerForm1.value.password).subscribe(r=>{
        console.log(r);
        this.password=this.registerForm1.value.password;
        this.registerForm1.controls['confirmPassword'].setValue('')
        this.registerForm1.controls['old_password'].setValue('')
        this.registerForm1.controls['old_password_real_value'].setValue(this.registerForm1.value.password)
        this.display_old_password=false;
        this.display_current_password=false;
        this.registerForm1_activated=false;
        this.cd.detectChanges();
      })
    }
    
  }
  cancel_edit_password(){
    this.registerForm1.controls['password'].setValue(this.password);
    this.display_error_validator1=false;
    this.display_old_password=false;
    this.display_current_password=false;
    this.registerForm1_activated=false;
    this.cd.detectChanges()
  }

  /********************************************** MAILING **************************************/
  /********************************************** MAILING **************************************/
  /********************************************** MAILING **************************************/
  /********************************************** MAILING **************************************/
 
  loading_changes=[];
  change_mailing_option(i,type){
    this.loading_changes[i]=true;
    let value=false;
    if(i==0){
      value=this.registerForm3.value.trending_mail;
      this.registerForm3.get('trending_mail').disable();
    }
    else if(i==1){
      value=this.registerForm3.value.ads_answers;
      this.registerForm3.get('ads_answers').disable();
    }
    else if(i==2){
      value=this.registerForm3.value.special_visitor
      this.registerForm3.get('special_visitor').disable();
    }
    else if(i==3){
      value=this.registerForm3.value.group_creation
      this.registerForm3.get('group_creation').disable();
    }
    else if(i==4){
      value=this.registerForm3.value.group_shares
      this.registerForm3.get('group_shares').disable();
    }
    console.log(this.registerForm3.value)
    this.Profile_Edition_Service.change_mailing_managment(type,value,this.special_visitor_type).subscribe(r=>{
      console.log(r[0]);
      this.loading_changes[i]=false;
      this.registerForm3.get('trending_mail').enable();
      this.registerForm3.get('ads_answers').enable();
      this.registerForm3.get('special_visitor').enable();
      this.registerForm3.get('group_creation').enable();
      this.registerForm3.get('group_shares').enable();
      this.cd.detectChanges()
      console.log( this.registerForm3.get('trending_mail'))
    })
  }

  edit_email(){
    this.registerForm_activated=true;
  }

  validate_edit_email(){
    console.log(this.registerForm)
    if(this.registerForm.invalid){
      this.display_error_validator=true;
    }
    else{
      this.Profile_Edition_Service.edit_email(this.registerForm.value.email).subscribe(r=>{
        console.log(r);
        this.registerForm_activated=false;
        this.cd.detectChanges();
      })
    }
  }

  cancel_edit_email(){
    this.display_error_validator=false;
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

    if(this.type_of_account=="Artistes" || this.type_of_account=="Artiste" || this.type_of_account=="Artistes professionnels" || this.type_of_account=="Artiste professionnel" 
    || this.type_of_account=="Artiste professionnelle"){
      
      this.get_trendings();
      this.get_favorites();

      if(this.gender!="Groupe"){
        this.Profile_Edition_Service.get_my_list_of_groups_from_users(this.id_user).subscribe(r=>{
          console.log(r[0])
         
          
          if(r[0].length>0){
            for(let i=0;i<r[0].length;i++){
              console.log(r[0][i])
              this.list_of_groups_names.push(r[0][i].nickname)
              this.list_of_groups_ids.push(r[0][i].id)
              this.list_of_groups_admins_ids.push(r[0][i].id_admin)
              this.list_of_members_ids_by_group[r[0][i].id]=r[0][i].list_of_members
              console.log(this.list_of_members_ids_by_group)
              if(!r[0][i].list_of_members_validations || (r[0][i].list_of_members_validations && r[0][i].list_of_members_validations.length!=r[0][i].list_of_members.length)){
                this.list_of_groups_status.push(false)
              }
              else{
                this.list_of_groups_status.push(true)
              }
              this.current_id_group=this.list_of_groups_ids[0];
              this.get_trendings_for_a_group( this.list_of_groups_ids[0])
              this.get_favorites_for_a_group(this.list_of_groups_ids[0])
            }
            console.log(this.list_of_groups_names)
            
            this.user_is_in_a_group=true;
          }
          this.show_group_managment=true;
          this.groups_owned_found=true;
        })
      }
      else{ 
        this.list_of_groups_names.push(this.pseudo)
        this.list_of_groups_ids.push(this.id_user)
        this.list_of_members_ids_by_group[this.id_user]=this.list_of_members
        console.log( this.list_of_groups_names)
        console.log( this.list_of_groups_ids)
        console.log(this.list_of_members_ids_by_group)
        this.current_id_group=this.list_of_groups_ids[0];
        this.manage_group(0);
        this.show_list_of_members=true;
        this.groups_owned_found=true;
        console.log("group ok")
      }

      
    }
    else{
      this.show_group_managment=false;
      this.groups_owned_found=true;
    }
    
  }

  manage_group(i){
    
    
    let id_group=  this.list_of_groups_ids[i];
    console.log(id_group)
    if(this.list_of_members_ids_by_group[id_group] && this.list_of_members_names_by_group[id_group] && this.list_of_members_ids_by_group[id_group].length== this.list_of_members_names_by_group[id_group].length){
      this.manage_group_loading[i]=false;
      this.manage_group_activated[i]=true;
      console.log("already load")
      this.cd.detectChanges();
    }
    else{
      this.manage_group_loading[i]=true;
      this.Profile_Edition_Service.get_group_information_by_id(id_group).subscribe(users=>{
        console.log(users[0])
        if(users[0].error){
          let compt=0;
          for(let k=0;k<this.list_of_members_ids_by_group[id_group].length;k++){
            this.list_of_members_pictures_by_group[id_group]=[];
            this.list_of_members_names_by_group[id_group]=[];
            this.list_of_members_pseudos_by_group[id_group]=[];
            this.list_of_members_shares_by_group[id_group]=[];
            this.list_of_members_status_by_group[id_group]=[];
            this.share_in_edition[id_group]=[];
            this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_members_ids_by_group[id_group][k] ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_members_pictures_by_group[id_group][k] = SafeURL;
              this.Profile_Edition_Service.retrieve_profile_data( this.list_of_members_ids_by_group[id_group][k]).subscribe( l => {  
                this.list_of_members_names_by_group[id_group][k]  = l[0].firstname + ' ' + l[0].lastname;
                this.list_of_members_pseudos_by_group[id_group][k] = l[0].nickname;
                this.list_of_members_status_by_group[id_group][k] = "En attente";
                this.list_of_members_shares_by_group[id_group][k]  = (100/this.list_of_members_ids_by_group[id_group].length).toFixed(2);
                compt++;
                console.log( compt + ' / ' +this.list_of_members_ids_by_group[id_group].length)
                if(compt==this.list_of_members_ids_by_group[id_group].length){
                  this.manage_group_loading[i]=false;
                  this.manage_group_activated[i]=true;
                  this.cd.detectChanges();
                }
                
              })
            });
  
          }
        
        }
        else{
          let compt=0;
          this.list_of_members_status_by_group[id_group]=[];
          this.list_of_members_shares_by_group[id_group]=[];
          for(let j=0;j<users[0].length;j++){
            let index = this.list_of_members_ids_by_group[id_group].indexOf(users[0][j].id_user)
            this.list_of_members_status_by_group[id_group][index] = users[0][j].status;
            this.list_of_members_shares_by_group[id_group][index]  = users[0][j].share;
          }
          for(let k=0;k<this.list_of_members_ids_by_group[id_group].length;k++){
            this.list_of_members_pictures_by_group[id_group]=[];
            this.list_of_members_names_by_group[id_group]=[];
            this.list_of_members_pseudos_by_group[id_group]=[];
            this.share_in_edition[id_group]=[];
            this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_members_ids_by_group[id_group][k] ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_members_pictures_by_group[id_group][k] = SafeURL;
              this.Profile_Edition_Service.retrieve_profile_data( this.list_of_members_ids_by_group[id_group][k]).subscribe( l => {
                this.list_of_members_names_by_group[id_group][k]  = l[0].firstname + ' ' + l[0].lastname;
                this.list_of_members_pseudos_by_group[id_group][k] = l[0].nickname;
                compt++;
                console.log( compt + ' / ' +this.list_of_members_ids_by_group[id_group].length)
                if(compt==this.list_of_members_ids_by_group[id_group].length){
                  this.manage_group_loading[i]=false;
                  this.manage_group_activated[i]=true;
                  this.cd.detectChanges();
                }
                
              })
            });
  
          }
        
        }
      })
    }
   
    
  }

  cancel_manage_group(i){
    this.manage_group_activated[i]=false;
    this.manage_group_loading[i]=false;
  }
    
  a_share_is_in_edition=false;
  edit_share(id_group,index){
    if( this.a_share_is_in_edition){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous avez déjà une édition en cours'},
      });
      return
    }
    this.registerForm2.controls['share'].setValue(this.list_of_members_shares_by_group[id_group][index]);
    this.a_share_is_in_edition=true;
    this.share_in_edition[id_group][index]=true;
    this.cd.detectChanges();
  }

  edit_share_equity(id_group){
    for(let i=0;i<this.list_of_members_ids_by_group[id_group].length;i++){
      this.list_of_members_shares_by_group[id_group][i]=(100/this.list_of_members_ids_by_group[id_group].length).toFixed(2);
    }
    this.cd.detectChanges();
  }
  cancel_share(id_group,index){
    this.a_share_is_in_edition=false;
    this.share_in_edition[id_group][index]=false;
  }

  validate_share(id_group,index){
    console.log(this.registerForm2.value.share)
    console.log(this.registerForm2.controls['share'])
    if(this.registerForm2.invalid){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Répartition invalide'},
      });
      return
    }
    this.list_of_members_shares_by_group[id_group][index]=this.registerForm2.value.share;
    this.a_share_is_in_edition=false;
    this.share_in_edition[id_group][index]=false;
  }



  validate_all(id_group){
    console.log(id_group)
    if(this.a_share_is_in_edition){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez terminer votre édition avant de valider'},
      });
      return
    }
    let compt=0;
    for(let i=0;i<this.list_of_members_ids_by_group[id_group].length;i++){
      
      compt+=(this.list_of_members_shares_by_group[id_group][i])?Number(this.list_of_members_shares_by_group[id_group][i]):0;
    }
    console.log(compt);
    if(compt!=100){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'La somme des gains doit être égale à 100'},
      });
    }
    else{
        this.Profile_Edition_Service.validate_group_creation_and_shares(id_group,this.list_of_members_ids_by_group[id_group],this.list_of_members_shares_by_group[id_group]).subscribe(r=>{
          if(r[0].error){
            if(r[0].error=="already_validated"){
              const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                data: {showChoice:false, text:'Vous avez déjà validé la création de ce groupe'},
              });
            }
            else{
              let index=this.list_of_groups_ids.indexOf(id_group);
              const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                data: {showChoice:false, text:"Ce groupe n'existe plus. Il a surement été refusé par un autre membre"},
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
            console.log(r[0])
            let index=this.list_of_groups_ids.indexOf(id_group);
            let user_index= (this.list_of_members_ids_by_group[id_group]).indexOf(this.id_user)
            this.list_of_members_status_by_group[id_group][user_index]="validated";
            if(r[0].user.list_of_members_validations.length==r[0].user.list_of_members.length){
              for(let j=0;j< this.list_of_members_status_by_group[id_group].length;j++){
                this.list_of_members_status_by_group[id_group][j]="validated";
              }
              this.list_of_groups_status[index]=true;
            }
            let list_of_receivers=this.list_of_members_ids_by_group[id_group].slice(0)
            list_of_receivers.splice(user_index,1)
            let user_name=this.list_of_members_names_by_group[id_group][user_index]
            let name=this.list_of_groups_names[index];
            console.log(this.list_of_members_ids_by_group[id_group])
            console.log(list_of_receivers)
            this.NotificationsService.add_notification_for_group_creation('group_validation',this.id_user,user_name, list_of_receivers,'group_validation',name,'unknown',id_group,0,(r[0].loop=="second")?"add_and_shares":"add",false,0).subscribe(l=>{
              console.log("notification added")
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
            console.log(  this.list_of_members_status_by_group[id_group])
            console.log( this.list_of_groups_status)
          }
        });

    }
    console.log(this.list_of_members_shares_by_group[id_group])
    console.log(id_group)
  }

  abort_group(id_group){
    let index=this.list_of_groups_ids.indexOf(id_group);
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Etes-vous sûr de vouloir refuser la création de ce groupe ? Ceci entrainera sa suppression'},
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
            if(!r[0].error){
              /*this.Profile_Edition_Service.delete_everything_from_user(r[0].id).subscribe(l=>{

              })*/
            }
          })
        }
        
        
      })
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:true, text:'Etes-vous sûr de vouloir quitter ce groupe ? Vous ne pourrez plus pouvoir le rejoindre ou bénéficier de gains supplémentaires reliés à ce groupe '},
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.Profile_Edition_Service.exit_group(id_group).subscribe(r=>{
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
            console.log(name)
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



  /******************************************** MAIL SETTINGS **********************************/
  save_setting(i){
    console.log(this.registerForm3.value.trending_mail)
  }


 /****************************************** ACCOUNT SETTINGS **********************************/
 deletion_loading=false;

 suspend_account(){

  const dialogRef = this.dialog.open(LoginComponent, {
    data: {usage:"suspend_account"}
  });

  /*const dialogRef = this.dialog.open(PopupConfirmationComponent, {
    data: {showChoice:true, text:'Etes-vous sûr de vouloir suspendre votre compte ?'},
  });

  dialogRef.afterClosed().subscribe(result => {
    if(result){
      this.deletion_loading=true;
      this.Profile_Edition_Service.suspend_account().subscribe(r=>{
        console.log(r[0])
        this.deletion_loading=false;
        this.authenticationService.logout();
        this.location.go('/')
        location.reload();
      })
    }
  })*/
 }

 get_back_suspended_account(){
   console.log("get_back_suspended_account")
    this.deletion_loading=true;
    this.Profile_Edition_Service.get_back_suspended_account().subscribe(r=>{
      console.log(r[0])
      this.deletion_loading=false;
      location.reload();
    })
 }

 
 delete_account(){

  const dialogRef = this.dialog.open(LoginComponent, {
    data: {usage:"delete_account"}
  });

  /*const dialogRef = this.dialog.open(PopupConfirmationComponent, {
    data: {showChoice:true, text:'Etes-vous sûr de vouloir supprimer votre compte ?'},
  });

  dialogRef.afterClosed().subscribe(result => {
    if(result){
      this.deletion_loading=true;
      this.Profile_Edition_Service.delete_account().subscribe(r=>{
        console.log(r[0])
        this.deletion_loading=false;
        this.authenticationService.logout();
        this.location.go('/')
        location.reload();
      })
    }
  })*/
   
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

      THIS.sumo_ready=true;
      THIS.cd.detectChanges();
      console.log("sumo ready")
    });

    $(".Sumo_trendings").change(function(){
      console.log("sumo change")
      console.log($(this).val());
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
      console.log("sumo change")
      console.log($(this).val());
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
      console.log("sumo change")
      console.log($(this).val());
      let index =THIS.list_of_groups_names.indexOf($(this).val() )
      THIS.get_trendings_for_a_group(THIS.list_of_groups_ids[index]);
        
    });
  

    $(".Sumo_favorites").change(function(){
      console.log("sumo change")
      console.log($(this).val());
      let old_date=THIS.date_format_favorites;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_favorites=0;
      }
      else{
        THIS.date_format_favorites=1;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_favorites){
        THIS.get_favorites();
      }
        
    });

    $(".Sumo_favorites_groups").change(function(){
      console.log("sumo change")
      console.log($(this).val());
      let old_date=THIS.date_format_favorites_groups;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_favorites_groups=0;
      }
      else{
        THIS.date_format_favorites_groups=0;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_favorites_groups){
        THIS.get_favorites_for_a_group(THIS.current_id_group);
      }
        
    });

    $(".Sumo_favorites_chose_group").change(function(){
      console.log("sumo change")
      console.log($(this).val());
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

  view_trendings_1: any[] = [800, 400];
  showLegend_trendings_1 = true;
  xAxis_trendings_1 = "Date";
  yAxis_trendings_1 = "Meilleur gain";
  multi_trendings_1=[];


  view_trendings_2: any[] = [800, 400];
  showLegend_trendings_2 = true;
  xAxis_trendings_2 = "Date";
  yAxis_trendings_2 = "Somme des gains";
  multi_trendings_2=[];
  compteur_trendings=0;

  total_gains=0
  number_of_comics_gains=0;
  number_of_drawings_gains=0;
  number_of_writings_gains=0;


  

  get_trendings(){
    //faire fonction pour vérifir s'il y a des trendings, sinon ne pas afficher la section
    console.log("getting trendings")
    this.compteur_trendings++;
    this.trendings_loaded=false;
    this.trendings_found=false;
    this.Trending_service.get_all_trendings_by_user(this.date_format_trendings,this.id_user,this.compteur_trendings).subscribe(r=>{
      console.log(r[0][0])

      if(r[1]== this.compteur_trendings){
        if(Object.keys(r[0][0].list_of_contents).length>0){
          this.total_gains=0;
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
              this.total_gains+=gain;
              let uploaded_date = timestamp.substring(0,timestamp.length - 5);
              uploaded_date = uploaded_date.replace("T",' ');
              uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
              let first_date = new Date(uploaded_date + ' GMT');
              let date= first_date.getDate()+'-'+(first_date.getMonth()+1)+'-'+first_date.getFullYear();
              let index = this.multi_trendings_1[0].series.findIndex(x => x.name === date)
  
  
              if(index>=0){
                if(r[0][0].list_of_contents[i].publication_category=="comics"){
                  
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
                if(r[0][0].list_of_contents[i].publication_category=="comics"){
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
          
          console.log(this.multi_trendings_1)
          console.log(this.multi_trendings_2)
          this.trendings_found=true;
        }
        else{
          this.trendings_found=false;
        }
        
        this.trendings_loaded=true;
      }
      
      console.log(this.trendings_found)
      console.log( this.trendings_loaded)
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
    //faire fonction pour vérifir s'il y a des trendings, sinon ne pas afficher la section
    console.log(id_group)
    console.log("getting trendings")
    this.compteur_trendings_groups++;
    this.trendings_loaded_groups=false;
    this.trendings_found_groups=false;
    this.Trending_service.get_all_trendings_by_user(this.date_format_trendings,id_group,this.compteur_trendings_groups).subscribe(r=>{
      console.log(r[0][0])

      if(r[1]== this.compteur_trendings_groups){
        if(Object.keys(r[0][0].list_of_contents).length>0){
          console.log("starting new multi")
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
              console.log(gain)
              let share=Number(r[0][0].list_of_contents[i].shares[0][this.id_user])/100;
              console.log(share)
              this.total_gains_groups+=gain*share;
              let uploaded_date = timestamp.substring(0,timestamp.length - 5);
              uploaded_date = uploaded_date.replace("T",' ');
              uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
              let first_date = new Date(uploaded_date + ' GMT');
              let date= first_date.getDate()+'-'+(first_date.getMonth()+1)+'-'+first_date.getFullYear();
              let index = this.multi_trendings_groups_1[0].series.findIndex(x => x.name === date)
  
  
              if(index>=0){
                if(r[0][0].list_of_contents[i].publication_category=="comics"){
                  
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
                if(r[0][0].list_of_contents[i].publication_category=="comics"){
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
          
          console.log(this.multi_trendings_groups_1)
          console.log(this.multi_trendings_groups_2)
          this.trendings_found_groups=true;
        }
        else{
          this.trendings_found_groups=false;
        }
        
        this.trendings_loaded_groups=true;
      }
      
      console.log(this.trendings_found_groups)
      console.log( this.trendings_loaded_groups)
      this.cd.detectChanges()
    })
  
  }


  /*********************************************** FAVORITES  ***************************************/
  /*********************************************** FAVORITES  ***************************************/
  /*********************************************** FAVORITES  ***************************************/
  /*********************************************** FAVORITES  ***************************************/
  /*********************************************** FAVORITES  ***************************************/


  
  view_favorites_1: any[] = [800, 400];
  showLegend_favorites_1 = true;
  xAxis_favorites_1 = "Date";
  yAxis_favorites_1 = "Coups de coeur";
  multi_favorites_1=[];



  total_gains_favorites=0
  compteur_favorites=0;
  favorites_loaded=false;
  favorites_found=false;
  

  get_favorites(){
    //faire fonction pour vérifir s'il y a des favorites, sinon ne pas afficher la section
    console.log("getting favorites")
    this.compteur_favorites++;
    this.favorites_loaded=false;
    this.favorites_found=false;
    this.Favorites_service.get_all_favorites_by_user(this.date_format_favorites,this.id_user,this.compteur_favorites).subscribe(r=>{
      console.log(r[0][0])

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
          
          console.log(this.multi_favorites_1)
          this.favorites_found=true;
        }
        else{
          this.favorites_found=false;
        }
        
        this.favorites_loaded=true;
      }
      
      console.log(this.favorites_found)
      console.log( this.favorites_loaded)
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
    //faire fonction pour vérifir s'il y a des favorites, sinon ne pas afficher la section
    console.log(id_group)
    console.log("getting favorites")
    this.compteur_favorites_groups++;
    this.favorites_loaded_groups=false;
    this.favorites_found_groups=false;
    this.Favorites_service.get_all_favorites_by_user(this.date_format_favorites,id_group,this.compteur_favorites_groups).subscribe(r=>{
      console.log(r[0][0])

      if(r[1]== this.compteur_favorites_groups){
        if(Object.keys(r[0][0].list_of_favorites).length>0){
          console.log("starting new multi")
          this.total_gains_groups_favorites=0;
          this.multi_favorites_groups_1=[{
            "name": "Classement",
            "series": []
          }]
      
  
          for( let i=0;i<Object.keys(r[0][0].list_of_favorites).length;i++){
  
              let timestamp= r[0][0].list_of_favorites[i].createdAt
              let rank=r[0][0].list_of_favorites[i].rank;
              let gain = Number(r[0][0].list_of_favorites[i].remuneration);
              console.log(gain)
              let share=Number(r[0][0].list_of_favorites[i].shares[0][this.id_user])/100;
              console.log(share)
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
          
          console.log(this.multi_favorites_groups_1)
          this.favorites_found_groups=true;
        }
        else{
          this.favorites_found_groups=false;
        }
        
        this.favorites_loaded_groups=true;
      }
      
      console.log(this.favorites_found_groups)
      console.log( this.favorites_loaded_groups)
      this.cd.detectChanges()
    })
  
  }

}
