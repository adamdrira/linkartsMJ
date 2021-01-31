import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
import { pattern } from '../helpers/patterns';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;
@Component({
  selector: 'app-login-invited-user',
  templateUrl: './login-invited-user.component.html',
  styleUrls: ['./login-invited-user.component.scss'],  
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
      
    navbar.visibility_observer_font.subscribe(font=>{
      console.log(font)
      if(font){
        this.show_icon=true;
      }
    })
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

  show_icon=false;



  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }
  get g(){ return this.ResetPasswordForm.controls; }

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
        //console.log(data.msg);

        
        if(data.token){
          this.router.navigate(['/'])
        }
        else{
          //console.log("error");
          this.display_wrong_data=true;
        }
        
    },
    error => {
        this.loading = false;
        this.display_wrong_data=true;
    });
  }


}