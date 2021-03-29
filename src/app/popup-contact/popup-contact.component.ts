import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-popup-contact',
  templateUrl: './popup-contact.component.html',
  styleUrls: ['./popup-contact.component.scss']
})
export class PopupContactComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    public navbar:NavbarService,
    public dialogRef: MatDialogRef<PopupContactComponent>,
    private cd:ChangeDetectorRef,
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

  ngOnInit(): void {
    
    this.registerForm1 = this.formBuilder.group({
      email: ['', 
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ]),
      ],
      firstName: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("name")),
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
      ],
      lastName: ['', 
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
          Validators.maxLength(500),
          Validators.pattern(pattern("text")),
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

  validate_step() {
    this.loading = true;
  }

}
