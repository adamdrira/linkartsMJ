import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
import { ConstantsService } from '../services/constants.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

@Component({
  selector: 'app-popup-apply-response',
  templateUrl: './popup-apply-response.component.html',
  styleUrls: ['./popup-apply-response.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('150ms', style({opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
  ]
})
export class PopupApplyResponseComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    public navbar: NavbarService,
    public dialogRef: MatDialogRef<PopupApplyResponseComponent,any>,
    private ConstantsService:ConstantsService,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    dialogRef.disableClose = true;

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }

  show_icon=false;
  
  
  ngOnInit(): void {
    this.build_form();
  }


  list_of_categories=['Positif','Négatif'];
  registerForm: FormGroup;
  build_form() {
    this.registerForm = this.formBuilder.group({

      feedback: new FormControl( [], [Validators.required]),
      note: new FormControl( 10, [Validators.required]),
      comment: new FormControl( '', [
        Validators.minLength(3),
        Validators.maxLength(1500),
        Validators.required,
        Validators.pattern(pattern("text_with_linebreaks")),]),
    });
  }



  close_dialog(){
    this.dialogRef.close();
  }
  onSubmit() {
    if(this.registerForm.valid) {

      
    }
    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:"Veuillez remplir tout le formulaire"},
        panelClass: "popupConfirmationClass",
      });
    }
  }

  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }

}
  
  
  
  