import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { format } from 'path';
import { Profile_Edition_Service } from '../services/profile_edition.service';

@Component({
  selector: 'app-form-profile-bio',
  templateUrl: './form-profile-bio.component.html',
  styleUrls: ['./form-profile-bio.component.scss']
})
export class FormProfileBioComponent implements OnInit {

  constructor(private Profile_Edition_Service:Profile_Edition_Service) { }
  display_errors:boolean = false;

  ngOnInit(): void {

    this.createFormControls();
    this.createForm();

  }

  profile_bio: FormGroup;
  principal_description: FormControl;
  occupation: FormControl;
  education: FormControl;
  location: FormControl;
  
  createFormControls() {
    this.principal_description = new FormControl('', [Validators.required, Validators.maxLength(30)]);
    this.occupation = new FormControl('', Validators.maxLength(30));
    this.education = new FormControl('', Validators.maxLength(30));
    this.location = new FormControl('', Validators.maxLength(30));
  }

  
  createForm() {
    this.profile_bio = new FormGroup({
      principal_description: this.principal_description,
      occupation: this.occupation,
      education: this.education,
      location: this.location
    });
  }

  validate_form() {
    if( this.profile_bio.valid ) {
      this.Profile_Edition_Service.edit_bio(this.principal_description.value, this.occupation.value, this.education.value,this.location.value).subscribe(r=>{
        location.reload();
      });
    }
    else {
      this.display_errors = true;
    }
  }


}
