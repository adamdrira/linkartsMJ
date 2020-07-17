import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';



declare var $:any;

@Component({
  selector: 'app-popup-form',
  templateUrl: './popup-form.component.html',
  styleUrls: ['./popup-form.component.scss']
})
export class PopupFormComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupFormComponent>,
    private cd:ChangeDetectorRef,


    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  display_errors:boolean = false;

  ngOnInit(): void {

    this.createFormControls();
    this.createForm();

    this.cd.detectChanges();
    

  }

  ngAfterViewInit() {


  }




  /********************************* */
  /**********Profile Bio************ */
  /********************************* */
  profile_bio: FormGroup;
  principal_description: FormControl;
  occupation: FormControl;
  education: FormControl;
  location: FormControl;
  createFormControls() {
    this.principal_description = new FormControl(this.data.primary_description, [Validators.required, Validators.maxLength(30)]);
    this.occupation = new FormControl(this.data.occupation, Validators.maxLength(30));
    this.education = new FormControl(this.data.education, Validators.maxLength(30));
    this.location = new FormControl(this.data.user_location, Validators.maxLength(30));
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
