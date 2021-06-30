import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-popup-contact',
  templateUrl: './popup-contact.component.html',
  styleUrls: ['./popup-contact.component.scss'],
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
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
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
]
})
export class PopupContactComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    public navbar:NavbarService,
    public dialogRef: MatDialogRef<PopupContactComponent>,
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }

  show_icon=false;
  firstname='';
  email='';
  ngOnInit(): void {
    
    if(this.data.current_user){
      if((this.data.current_user[0].status=='account' || this.data.current_user[0].status=='suspended') && this.data.current_user[0].gender!="Groupe"){
        this.firstname=this.data.current_user[0].firstname;
        this.email=this.data.current_user[0].email;
      }
    }
     
    this.registerForm1 = this.formBuilder.group({
      email: [this.email, 
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(pattern("mail")),
        ]),
      ],
      firstName: [this.firstname, 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("name")),
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
      ],
      message: ['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(1000),
          Validators.pattern(pattern("text_with_linebreaks")),
        ]),
      ],
    });
    
  }


  registerForm1: FormGroup;

  

  close_dialog(){
    this.dialogRef.close();
  }

  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }

  
  loading=false;
  show_done=false;
  display_need_information=false;
  validate_step() {
    if(this.loading){
      return
    }
    if(this.registerForm1.valid){
      this.loading = true;
      this.display_need_information=false;
      this.Profile_Edition_Service.send_message_contact_us(this.registerForm1.value.firstName,this.registerForm1.value.email,this.registerForm1.value.message.replace(/\n\s*\n\s*\n/g, '\n\n').trim()).subscribe(r=>{
        this.loading=false;
        this.show_done=true;
      })
    }
    else{
      this.display_need_information=true;
    }
    
  }

}
