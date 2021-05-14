import { animate, style, transition, trigger } from '@angular/animations';
import { Component,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-chat-group-members',
  templateUrl: './popup-chat-group-members.component.html',
  styleUrls: ['./popup-chat-group-members.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class PopupChatGroupMembersComponent {

  constructor(
    public dialogRef: MatDialogRef<PopupChatGroupMembersComponent>,
    public dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: any) {
    

  }

  is_for_emojis=this.data.is_for_emojis;
  list_of_ids=this.data.list_of_ids;
  list_of_emojis=(this.data.is_for_emojis)?this.data.list_of_emojis:{};
  list_of_pseudos=this.data.list_of_pseudos;
  list_of_names=this.data.list_of_names;
  list_of_profile_pictures=this.data.list_of_pictures;
  pp_is_loaded=[];


  

  load_pp(i){
   
    this.pp_is_loaded[i]=true;
  }

  get_user_link(i:number) {
    return "/account/"+ this.list_of_pseudos[i];
  }
  close_dialog() {
    this.dialogRef.close();
  }
}
