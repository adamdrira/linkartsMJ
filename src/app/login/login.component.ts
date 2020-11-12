import { Component, OnInit, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SignupComponent } from '../signup/signup.component';
import { Location } from '@angular/common';
import { pattern } from '../helpers/patterns';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  

  constructor(
      private formBuilder: FormBuilder,
      private location: Location,
      private route: ActivatedRoute,
      public navbar:NavbarService,
      private Profile_Edition_Service:Profile_Edition_Service,
      private router: Router,
      private authenticationService: AuthenticationService,
      public dialogRef: MatDialogRef<LoginComponent>,
      private cd:ChangeDetectorRef,
      public dialog: MatDialog,
  
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      dialogRef.disableClose = true;
      this.usage=this.data.usage;
      if(this.usage=="delete_account" || this.usage=="suspend_account"){
        this.delete_account=true;
      }
  }

  suspend_account=false;
  delete_account=false;
  step_deletion=0;
  usage:string;
  loginForm: FormGroup;
  ResetPasswordForm:FormGroup;
  loading = false;
  submitted = false;
  submitted_reset=false;
  returnUrl: string;
  display_wrong_data=false;
  display_old_password=false;
  display_error_group=false;
  wrong_email_reset_password=false;
  logo_is_loaded=false;
  hide=true;
  ngOnInit() {
      this.loginForm = this.formBuilder.group({
          username: ['', Validators.required],
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
  }

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

  onSubmitReset(){
      this.submitted_reset=true;
      if(this.ResetPasswordForm.invalid){
          return;
      }

      this.authenticationService.reset_password(this.g.mail_recuperation.value).subscribe(r=>{
        console.log(r[0])
        // crééer un mail pro pour gérer ça
      })
  }


  change_password_type(){
    this.hide=!this.hide;
  }

  signup() {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(SignupComponent, {});
  }

  logo_loaded(){
    this.logo_is_loaded=true;
  }

  
  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.login();
  }
  
  close_dialog(){
    this.dialogRef.close();
  }

  login() {

    if(this.loading) {
      return;
    }
    
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }

    this.loading = true;
    this.authenticationService.login(this.f.username.value, this.f.password.value).subscribe( data => {
          this.loading=false
          console.log(data.msg);
          if(data.token){
            location.reload();
          }
          if(data.msg=="error"){
              console.log("error");
              this.display_wrong_data=true;
          }
          if(data.msg=="error_old_value"){
            console.log("error_old_value");
            this.display_old_password=true;
          }
          if(data.msg=="error_group"){
            console.log("error_group");
            this.display_error_group=true;
          }

          
          
      },
      error => {
          this.loading = false;
      });
    }


  /************************************* FOR ACCOUNT DELETION AND SUSPENSION  ***************************/

  account_deletion(i){
    if(i==0){
      this.loading = true;
      this.authenticationService.login(this.f.username.value, this.f.password.value).subscribe( data => {
        this.loading=false
            console.log(data.msg);
            if(data.token){
              this.step_deletion=1;
            }
            if(data.msg=="error"){
                console.log("error");
                this.display_wrong_data=true;
            }
            if(data.msg=="error_old_value"){
              console.log("error_old_value");
              this.display_old_password=true;
            }
            if(data.msg=="error_group"){
              console.log("error_group");
              this.display_error_group=true;
            }
        },
        error => {
            this.loading = false;
        });
      
    }
    if(i==1 && this.usage!="suspend_account"){
      // ajouter choix de motifs à valider et à vérifier 
      this.loginForm.controls['username'].setValue(null);
      this.loginForm.controls['password'].setValue(null);
      this.step_deletion=2
    }
    if(i==1 && this.usage=="suspend_account"){
      this.authenticationService.login(this.f.username.value, this.f.password.value).subscribe( data => {
            
        console.log(data.msg);
        if(data.token){
            this.Profile_Edition_Service.suspend_account().subscribe(r=>{
              console.log(r[0])
              this.loading=false
              this.authenticationService.logout();
              this.location.go('/')
              location.reload();
            })
        }
        else if(data.msg=="error"){
            console.log("error");
            this.loading=false
            this.display_wrong_data=true;
        }
        else if(data.msg=="error_old_value"){
          this.loading=false
          console.log("error_old_value");
          this.display_old_password=true;
        }
        else if(data.msg=="error_group"){
          this.loading=false
          console.log("error_group");
          this.display_error_group=true;
        }
    },
    error => {
        this.loading = false;
    });
    }
    if(i==2){
      this.loading = true;
      this.authenticationService.login(this.f.username.value, this.f.password.value).subscribe( data => {
            
            console.log(data.msg);
            if(data.token){
                this.Profile_Edition_Service.delete_account().subscribe(r=>{
                  console.log(r[0])
                  this.loading=false
                  this.authenticationService.logout();
                  this.location.go('/')
                  location.reload();
                })
            }
            else if(data.msg=="error"){
                console.log("error");
                this.loading=false
                this.display_wrong_data=true;
            }
            else if(data.msg=="error_old_value"){
              this.loading=false
              console.log("error_old_value");
              this.display_old_password=true;
            }
            else if(data.msg=="error_group"){
              this.loading=false
              console.log("error_group");
              this.display_error_group=true;
            }
        },
        error => {
            this.loading = false;
        });
    }
  }

}