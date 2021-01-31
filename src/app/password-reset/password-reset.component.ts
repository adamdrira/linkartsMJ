import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { PasswordResetService } from '../services/password-reset.service';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  passwordRecoveryForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private PasswordResetService: PasswordResetService) { 

        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
          this.router.navigate(['/']);
        }

    }

  ngOnInit() {
      this.passwordRecoveryForm = this.formBuilder.group({
          mail: ['', Validators.required]
      });
    }
      

  // convenience getter for easy access to form fields
  get f() { return this.passwordRecoveryForm.controls; }

  onSubmit() {

      this.submitted = true;

      // stop here if form is invalid
      if (this.passwordRecoveryForm.invalid) {
          return;
      }

      
      this.PasswordResetService.checkMail( this.f.mail.value ).subscribe();
      


  }


}