import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
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
      public dialogRef: MatDialogRef<LoginComponent>,
      private cd:ChangeDetectorRef,
  
  
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      
  }

  ngOnInit() {
      this.loginForm = this.formBuilder.group({
          username: ['', Validators.required],
          password: ['', Validators.required]
      });

      this.ResetPasswordForm=this.formBuilder.group({
        mail_recuperation: ['', Validators.required],
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

  
  onSubmit() {

      this.submitted = true;

      // stop here if form is invalid
      if (this.loginForm.invalid) {
          return;
      }

      this.loading = true;
      this.authenticationService.login(this.f.username.value, this.f.password.value)
          .subscribe(
              data => {
                  this.loading=false
                  console.log(data.msg);
                  if(data.token){
                    location.reload();
                  }
                  if(data.msg=="error"){
                      console.log("error");
                      this.display_wrong_data=true;
                  }
                  
              },
              error => {
                  this.loading = false;
              });
  }
}