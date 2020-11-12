import { Component, OnInit, ChangeDetectorRef, HostListener, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { User } from '../services/user';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { Reports_service } from '../services/reports.service';

import { pattern } from '../helpers/patterns';



import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';



@Component({
  selector: 'app-popup-report',
  templateUrl: './popup-report.component.html',
  styleUrls: ['./popup-report.component.scss'],
})
export class PopupReportComponent implements OnInit {
  


  //LinksGroup:FormGroup;
  logo_is_loaded=false;
  loading = false;
  submitted = false;
  links_submitted=false;
  user = new User();
  links_titles:any[]=[];
  links:any[]=[];
  hide=true; // password

  constructor(
      private formBuilder: FormBuilder,
      public navbar: NavbarService,
      private cd: ChangeDetectorRef,
      private Reports_service: Reports_service,
      public dialogRef: MatDialogRef<PopupReportComponent,any>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // redirect to home if already logged in
    
    
  }

  from_account=false;
  step : number = 0;
  open_plagiarism=false;
  begin_download_attachments=false;
  id_report:number=0;
  display_loading=false;
  registerForm1: FormGroup;
  registerForm: FormGroup;
  message:string;
  type_of_report:string;
  
  ngOnInit() {
    console.log(this.data)
    this.step = 0;
    this.from_account=this.data.from_account;

    this.registerForm = this.formBuilder.group({
     
      message_for_content: ['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(2000),
          Validators.pattern(pattern("text")),
        ]),
      ]
    });

    this.registerForm1 = this.formBuilder.group({
     
      message_for_plagiarism:['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(2000),
          Validators.pattern(pattern("text")),
        ]),
      ],
    });

      
  }

  
  validate_step(i) {
      if(i==0){
        this.open_plagiarism=false;
      }
      else{
        this.open_plagiarism=true;
      }
      this.logo_is_loaded=false;
      this.step ++;
      this.cd.detectChanges();
  }



  validate_all(){
    if(this.from_account){
      if(this.open_plagiarism){
        this.type_of_report="plagiarism_from_content";
        this.message=this.registerForm1.value.message_for_plagiarism;
       
      }
      else{
        this.type_of_report="inappropriate_from_content";
        this.message=this.registerForm.value.message_for_content;
      }
    }
    else{
      if(this.open_plagiarism){
        this.type_of_report="plagiarism";
        this.message=this.registerForm1.value.message_for_plagiarism;
      }
      else{
        this.type_of_report="inappropriate";
        this.message=this.registerForm.value.message_for_content;
      }
    }
    
    this.Reports_service.add_primary_information_report(this.type_of_report,this.data.id_receiver,this.data.publication_category,this.data.publication_id,this.data.format,this.data.chapter_number,this.message).subscribe(r=>{
      console.log(r[0])
      this.id_report=r[0].id
      if(this.open_plagiarism){
        this.begin_download_attachments=true;
        this.display_loading=true;
      }
      else{
        location.reload();
      }
     
    })
  }

  all_attachments_uploaded( event: boolean) {
    console.log("all_attachments_uploaded")
    this.display_loading=false;
    location.reload();
      

  }

  step_back() {
    if(this.step > 0) {
      this.step--;
      this.cd.detectChanges();
    }
    else {
      return;
    }
  }

 
  logo_loaded(){
    this.logo_is_loaded=true;
  }

}
