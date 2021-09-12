import { trigger, transition, style, animate } from '@angular/animations';

import { Component, Inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Edtior_Projects } from '../services/editor_projects.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { normalize_to_nfc, pattern } from '../helpers/patterns';

import { NotificationsService } from '../services/notifications.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { NavbarService } from '../services/navbar.service';
import { ChatService } from '../services/chat.service';
import {  first } from 'rxjs/operators';

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
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private cd:ChangeDetectorRef,
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
      this.Edtior_Projects.submit_response_for_artist(data).pipe(first() ).subscribe(r=>{
        this.NotificationsService.add_notification('apply-response',this.data.author.id,this.data.author_name,this.project.id_user,this.project.formula,'none','none',this.project.id,0,"add",false,0).pipe(first() ).subscribe(l=>{
          let message_to_send ={
            for_notifications:true,
            type:"apply-response",
            id_user_name:this.data.author_name,
            id_user:this.data.author.id, 
            id_receiver:this.project.id_user,
            publication_category:this.project.formula,
            publication_name:'none',
            format:'none',
            publication_id:this.project.id,
            chapter_number:0,
            information:"add",
            status:"unchecked",
            is_comment_answer:false,
            comment_id:0,
          }
         
          this.loading_response=false;
          this.chatService.messages.next(message_to_send);
          this.dialogRef.close(data);
          this.cd.detectChanges();
        })
      
       
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
  
  
  
  