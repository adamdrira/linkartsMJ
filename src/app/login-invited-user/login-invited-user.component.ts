import { Component, OnInit, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';

import { pattern } from '../helpers/patterns';


@Component({
  selector: 'app-login-invited-user',
  templateUrl: './login-invited-user.component.html',
  styleUrls: ['./login-invited-user.component.scss']
})
export class LoginInvitedUserComponent implements OnInit {

  loginForm: FormGroup;
  ResetPasswordForm:FormGroup;
  loading = false;
  submitted = false;
  submitted_reset=false;
  returnUrl: string;
  display_wrong_data=false;
  wrong_email_reset_password=false;

  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      public navbar:NavbarService,
      private router: Router,
      private authenticationService: AuthenticationService,
      private cd:ChangeDetectorRef,
  
  ) {
      
  }

  hide=true;
  ngOnInit() {
      this.loginForm = this.formBuilder.group({
          mail: ['', Validators.required],
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
        // crééer un mail pro pour gérer ça
      })
  }




  
  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.login();
  }
  

  change_password_type(){
    this.hide=!this.hide;
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
    this.authenticationService.login_invited_user(this.f.mail.value, this.f.password.value).subscribe( data => {
          this.loading=false;
          console.log(data.msg);
          if(data.token){
            this.router.navigate(['/'])
          }
          else{
              console.log("error");
              this.display_wrong_data=true;
          }
          
      },
      error => {
          this.loading = false;
      });
    }


}