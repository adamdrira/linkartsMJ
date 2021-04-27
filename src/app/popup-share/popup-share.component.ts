import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { pattern } from '../helpers/patterns';
import { trigger, transition, style, animate } from '@angular/animations';

import { normalize_to_nfc } from '../helpers/patterns';

@Component({
  selector: 'app-popup-share',
  templateUrl: './popup-share.component.html',
  styleUrls: ['./popup-share.component.scss'],
  animations: [
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromLeftAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromRightAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromBottomAnimation', [
        transition(':enter', [
          style({transform: 'translateY(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ])
      ],
    ),
    //LEAVING ANIMATIONS
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({transform: 'translateX(0%)', opacity: 1}),
          animate('200ms ease-in-out', style({transform: 'translateX(-30px)', opacity: 0}))
        ])
      ],
    )
  ],
})
export class PopupShareComponent implements OnInit {

  constructor(
    private cd: ChangeDetectorRef,
    public navbar: NavbarService,
    public dialogRef: MatDialogRef<PopupShareComponent,any>,
    private Profile_Edition_Service:Profile_Edition_Service,
    private formBuilder: FormBuilder,
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

  type_of_profile=this.data.type_of_profile;
  show_icon=false;
  registerForm1: FormGroup;
  
  current_user:any;
  ngOnInit(): void {

    
    this.registerForm1 = this.formBuilder.group({
      email: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("mail")),
          Validators.maxLength(100),
        ]),
      ],
      name: ['', 
      Validators.compose([
        Validators.pattern(pattern("name")),
        Validators.maxLength(40),
      ]),
    ]
    });


  }

  close_dialog(){
    this.dialogRef.close();
  }
  

  show_name_error=false;
  show_mail_error:boolean = false;
  mail_scent:boolean = false;
  loading_email=false;
  validate() {
    if(this.loading_email){
      return 
    }
   

    if(!this.registerForm1.valid) {
      if(this.registerForm1.controls.email.status=='INVALID'){
        this.show_mail_error = true;
      }
      else{
        this.show_name_error=true;
      }
      
      return;
    }
    else if(this.registerForm1.value.name=='' && this.type_of_profile!='account'){
      console.log("no name")
      this.show_mail_error = false;
      this.show_name_error=true;
      this.cd.detectChanges()
      return
    }
    else {
      this.loading_email=true;
      this.show_mail_error = false;
      this.show_name_error=false;
      let name='';
      if(this.type_of_profile=="account"){
        this.Profile_Edition_Service.get_current_user().subscribe(r=>{
          if(r[0].lastname!=''){
            name=r[0].firstname + ' ' + r[0].lastname;
          }
          else{
            name=r[0].firstname;
          }
          console.log("retrieve current user")
          console.log(name);
          this.send_mail(name)
        })
      }
      else{
        name=this.registerForm1.value.name;
        this.send_mail(name)
      }

      
      
    
    }
  }

  send_mail(name){
    
    name=this.capitalizeFirstLetter(name);
    console.log("send mail")
    console.log(name)
    console.log(this.registerForm1.value.email)
    this.navbar.add_page_visited_to_history(`/share-maile/${this.type_of_profile}/${name}/${this.registerForm1.value.email}/`,'' ).subscribe();
    /*this.Profile_Edition_Service.send_share_email(this.registerForm1.value.email,name).subscribe(r=>{
      console.log(r[0]);
      if(r[0].error){
        this.show_mail_error = false;
      }
      else{
        
        this.mail_scent = true;
      }
      this.loading_email=false;
    
    })*/
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  back(){
    this.registerForm1.reset();
    this.mail_scent=false;
    this.cd.detectChanges()
  }
  
  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }
}
