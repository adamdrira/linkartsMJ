import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { User } from '../services/user';
import { Reports_service } from '../services/reports.service';

import { pattern } from '../helpers/patterns';



import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-popup-report',
  templateUrl: './popup-report.component.html',
  styleUrls: ['./popup-report.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(0)', opacity: 0 }),
        animate('400ms', style({ transform: 'translateX(0px)', opacity: 1 }))
      ])
    ]
    ),
  ],
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
      dialogRef.disableClose = true;
    
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
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
  
  show_icon=false;
  ngOnInit() {
    let THIS=this;
    console.log(this.data)
    this.step = 0;
    this.from_account=this.data.from_account;

    this.registerForm = this.formBuilder.group({
     
      message_for_content: ['', 
        Validators.compose([
          Validators.maxLength(500),
          Validators.pattern(pattern("text_with_linebreaks")),
        ]),
      ]
    });

    this.registerForm1 = this.formBuilder.group({
     
      message_for_plagiarism:['', 
        Validators.compose([
          Validators.maxLength(500),
          Validators.pattern(pattern("text_with_linebreaks")),
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

  
  close_dialog(){
    this.dialogRef.close();
  }

}
