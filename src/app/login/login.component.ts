import { Component, OnInit, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { pattern } from '../helpers/patterns';
import { Community_recommendation } from '../services/recommendations.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { normalize_to_nfc } from '../helpers/patterns';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DeviceDetectorService } from 'ngx-device-detector';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],  
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
export class LoginComponent implements OnInit {
  

  constructor(
      private formBuilder: FormBuilder,
      private location: Location,
      private deviceService: DeviceDetectorService,
      public navbar:NavbarService,
      private Profile_Edition_Service:Profile_Edition_Service,
      private Community_recommendation:Community_recommendation,
      private authenticationService: AuthenticationService,
      public dialogRef: MatDialogRef<LoginComponent>,
      private cd:ChangeDetectorRef,
      public dialog: MatDialog,
  
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      dialogRef.disableClose = true;
      
      if(this.usage=="delete_account" || this.usage=="suspend_account"){
        this.delete_account=true;
      }
     
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }
  usage=this.data.usage;
  for_chat_connexion=this.data.for_chat_connexion;
  temp_pass=this.data.temp_pass;
  email=this.data.email;
  suspend_account=false;
  delete_account=false;
  show_welcome=false;
  step_deletion=0;
  loginForm: FormGroup;
  ResetPasswordForm:FormGroup;
  loading = false;
  submitted = false;
  submitted_reset=false;
  returnUrl: string;
  display_wrong_data=false;
  display_email_not_checked=false;
  display_old_password=false;
  display_error_group=false;
  wrong_email_reset_password=false;
  
  number_of_connexions_tried=0;
  motifs:string[] = ["J'ai créé un second compte","Problème d'utilisation","Trop de publicités","Prend trop de temps","J'ai seulement besoin d'une pause","Je ne trouve aucun compte à suivre","Autre chose"];
  selected_motif = -1;
  select_motif(i:number) {
    this.selected_motif=i;
    this.display_select_motif = false;
  }
  display_select_motif:boolean = false;
  deletionForm: FormGroup;

  hide=true;
  display_error_reset=false;
  device_info='';
  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    this.navbar.add_page_visited_to_history(`/login`, this.device_info).subscribe();
    window.scroll(0,0);
    if(this.usage=="rest_pass" || this.usage=="registration"){
      this.loading=true;
      this.authenticationService.login(this.data.email, this.data.temp_pass).subscribe( data => {
        if(data.token){
          this.Community_recommendation.delete_recommendations_cookies();
          this.Community_recommendation.generate_recommendations().subscribe(r=>{
              location.reload();
          })
        }
        else{
          this.display_error_reset=true;
          this.loading=false;
        }
        
      },
      error => {
        this.display_error_reset=true;
        this.loading=false;
      });
    }
      this.loginForm = this.formBuilder.group({
          username: ['', 
            Validators.compose([
              Validators.required,
              Validators.pattern(pattern("mail")),
              Validators.maxLength(100),
            ]),
          ],
          password: ['', Validators.required]
      });

      this.ResetPasswordForm=this.formBuilder.group({
        mail_recuperation: ['', 
          Validators.compose([
            Validators.required,
            Validators.pattern(pattern("mail")),
            Validators.maxLength(100),
          ]),
        ],
      });

      this.deletionForm=this.formBuilder.group({
        description:['', 
          Validators.compose([
            Validators.required,
            Validators.minLength(20),
            Validators.maxLength(1000),
            Validators.pattern(pattern("text_with_linebreaks")),
          ]),
        ],
      });
  }

  reset_loading(){
    this.usage='';
  }

  show_icon=false;
 

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }
  get g(){ return this.ResetPasswordForm.controls; }

  reset_password_menu=false;
  open_reset_password(){
      this.reset_password_menu=true;
  }

  open_connexion_menu(){
    this.reset_password_menu=false;
  }

  password_reset_sent=false;
  password_reset_problem=false;
  onSubmitReset(){
      this.submitted_reset=true;
      if(this.ResetPasswordForm.invalid || this.loading){
          return;
      }
      this.loading=true;

      this.authenticationService.reset_password(this.g.mail_recuperation.value).subscribe(r=>{
        if(r[0].sent){
          this.password_reset_sent=true;
          this.password_reset_problem=false;
        }
        else{
          this.password_reset_sent=false;
          this.password_reset_problem=true;
        }
        this.loading=false;
        this.submitted_reset=false;
        // crééer un mail pro pour gérer ça
      })
  }


  change_password_type(){
    this.hide=!this.hide;
  }

  close_dialog(){
    this.dialogRef.close();
  }

  signup() {
    this.dialog.closeAll();
  }

  
  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if( !this.reset_password_menu && !this.delete_account && this.usage!="for_chat" && this.usage!="rest_pass" && this.usage!="registration") {
      this.login();
    }
    else if(this.usage=="for_chat"){
      this.authentication_for_chat()
    }
  }
  

  time_between_connexions:any;
  display_connexion_not_allowed=false;
  recommendation_done=false;
  time_first_connexion_not_allowed:any;
  login() {
    if(this.loading) {
      return;
    }

    if(this.display_connexion_not_allowed){
      let time = 5 - (Math.trunc(new Date().getTime()/1000)  - this.time_first_connexion_not_allowed)
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:`3 tentatives échouées. Veuillez patienter ${time} secondes`},
        panelClass: "popupConfirmationClass",
      });
      return
    }

    if(this.number_of_connexions_tried==3){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'3 tentatives échouées. Veuillez patienter 5 secondes'},
        panelClass: "popupConfirmationClass",
      });
      this.display_connexion_not_allowed=true;
      this.time_first_connexion_not_allowed= Math.trunc(new Date().getTime()/1000);
      this.time_between_connexions= setInterval(() => {
        this.number_of_connexions_tried=0;
        this.display_connexion_not_allowed=false;
        clearInterval(this.time_between_connexions)
      }, 5000);

      return
    }

   
    this.number_of_connexions_tried++;
    
    this.submitted = true;

    this.loading = true;

      
    // check email_checked
    
    this.authenticationService.check_email_checked(this.f.username.value, this.f.password.value).subscribe( data => {
        if(data.user  && (data.user.email_checked || data.pass )){
            this.authenticationService.login(this.f.username.value, this.f.password.value).subscribe( data => {
              if(data.token){
                this.display_email_not_checked=false;
                this.Community_recommendation.delete_recommendations_cookies();
                this.Community_recommendation.generate_recommendations().subscribe(r=>{
                    this.recommendation_done=true;
                    location.reload();
                })
                
                
                
              }
              else{
                this.display_email_not_checked=false;
                this.loading=false;
                if(data.msg=="error"){
                  this.display_wrong_data=true;
                }
                if(data.msg=="error_old_value"){
                  this.display_old_password=true;
                }
                if(data.msg=="error_group"){
                  this.display_error_group=true;
                }
              }
              
            },
            error => {
                this.loading = false;
            });
          
        }
        else if(data.error){
          this.loading=false;
          this.display_email_not_checked=true;
          this.cd.detectChanges()
        }
        else{
          this.loading=false;
          this.display_email_not_checked=false;
          this.display_wrong_data=true;
          this.cd.detectChanges()
        }
      })

    
  }


  /************************************* FOR ACCOUNT DELETION AND SUSPENSION  ***************************/
  /************************************* FOR ACCOUNT DELETION AND SUSPENSION  ***************************/
  /************************************* FOR ACCOUNT DELETION AND SUSPENSION  ***************************/

  account_deletion(i) {
    if(i==0){
      this.loading = true;
      this.Profile_Edition_Service.check_email_and_password(this.f.username.value, this.f.password.value,0).subscribe( data => {
        this.loading=false
        if(data[0].found && data[0].user.id==this.data.id_user){
          this.step_deletion=1;
        
        }
        else {
          this.loading=false
          this.display_wrong_data=true;
        }
      });
    }
    else if(i==1 && this.usage!="suspend_account"){

      if(this.selected_motif == -1) {
        this.display_select_motif = true;
        return;
      }

      // ajouter choix de motifs à valider et à vérifier 
      this.loginForm.controls['username'].setValue(null);
      this.loginForm.controls['password'].setValue(null);
      this.step_deletion=2
    }
    else if(i==1 && this.usage=="suspend_account"){
      
      if(this.selected_motif == -1) {
        this.display_select_motif = true;
        return;
      }

      this.Profile_Edition_Service.check_email_and_password(this.f.username.value, this.f.password.value,0).subscribe( data => {

        if(data[0].found && data[0].user.id==this.data.id_user){
            this.Profile_Edition_Service.suspend_account(this.selected_motif).subscribe(r=>{
              this.loading=false
              this.authenticationService.logout().subscribe(r=>{
                this.location.go('/')
                location.reload();
              });
              
            })
        }
        else {
            this.loading=false
            this.display_wrong_data=true;
        }
      });
    }
    else if(i==2){
      if(this.deletionForm.valid) {
        this.step_deletion=3;
      }
    }
    else if(i==3){
      this.loading = true;
      this.Profile_Edition_Service.check_email_and_password(this.f.username.value, this.f.password.value,0).subscribe( data => {
            if(data[0].found && data[0].user.id==this.data.id_user){
                this.Profile_Edition_Service.delete_account(this.selected_motif).subscribe(r=>{
                  this.loading=false
                  this.authenticationService.logout().subscribe(r=>{
                    this.location.go('/')
                    location.reload();
                  });;
                })
            }
            else{
                this.loading=false
                this.display_wrong_data=true;
            }
        })
      }
    }
    
    normalize_input(fg: FormGroup, fc: string) {
      if(!fg || !fc) {
        return;
      }
      normalize_to_nfc(fg,fc);
    }



    authentication_for_chat(){
      if(this.loading){
        return
      }
      this.loading=true;
      this.authenticationService.login(this.f.username.value, this.f.password.value).subscribe( data => {
        if(data.token){
          this.Community_recommendation.delete_recommendations_cookies();
          this.Community_recommendation.generate_recommendations().subscribe(r=>{
            this.dialogRef.close(true);
          })
        }
        else{
          this.display_wrong_data=true;
          this.loading=false;
        }
        
      },
      error => {
        this.display_wrong_data=true;
        this.loading=false;
      });
    }
  }