import { trigger, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Edtior_Projects } from '../services/editor_projects.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
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
    private Edtior_Projects:Edtior_Projects,
    public navbar: NavbarService,
    public dialogRef: MatDialogRef<PopupApplyResponseComponent,any>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { 

    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }

  show_icon=false;
  read_response:boolean;
  response:any;
  project:any;
  
  ngOnInit(): void {

    this.read_response=this.data.read_response;
    if(this.read_response){
      this.response=this.data.response;
    }
    
    this.project=this.data.project;
    
    
    this.build_form();

    if( this.data.read_response ) {
      this.registerForm.controls['feedback'].setValue( this.data.response.jugement );
      this.registerForm.controls['note'].setValue( this.data.response.mark );
      this.registerForm.controls['comment'].setValue( this.data.response.response );
    }
  }





  list_of_categories=['Projet retenu','Projet non retenu'];
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
  loading_response=false;
  onSubmit() {
    if(this.loading_response){
      return
    }
    
    if(this.registerForm.valid) {
      this.loading_response=true

      let data={
        id_project:this.project.id,
        user_name:this.data.author_name,
        user_nickname:this.data.author.nickname,
        target_id:this.project.id_user,
        target_name:this.project.user_name,
        price:this.data.project.price,
        formula:this.project.formula,
        target_nickname:this.project.user_nickname,
        mark:this.registerForm.value.note,
        jugement:this.registerForm.value.feedback,
        response:this.registerForm.value.comment,
        
      }
      this.Edtior_Projects.submit_response_for_artist(data).subscribe(r=>{
        this.loading_response=false;
        this.dialogRef.close(data);
      })
      
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
  
  
  
  