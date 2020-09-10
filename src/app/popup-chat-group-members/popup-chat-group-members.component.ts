import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, HostListener, ViewChild, Input, Inject } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

declare var $: any;


@Component({
  selector: 'app-popup-chat-group-members',
  templateUrl: './popup-chat-group-members.component.html',
  styleUrls: ['./popup-chat-group-members.component.scss']
})
export class PopupChatGroupMembersComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupChatGroupMembersComponent>,
    private cd:ChangeDetectorRef,
    private rd:Renderer2,
    private sanitizer:DomSanitizer,
    private Subscribing_service:Subscribing_service,
    public dialog: MatDialog,
    private Profile_Edition_Service:Profile_Edition_Service,



    @Inject(MAT_DIALOG_DATA) public data: any) {
    

  }

  is_for_emojis=this.data.is_for_emojis;
  list_of_ids=this.data.list_of_ids;
  list_of_emojis=(this.data.is_for_emojis)?this.data.list_of_emojis:{};
  list_of_pseudos=this.data.list_of_pseudos;
  list_of_names=this.data.list_of_names;
  list_of_pictures=this.data.list_of_pictures;
  list_of_pp_laoded=[];

  ngOnInit(): void {
    
    console.log(this.list_of_pseudos)
  }

  load_pp(i){
   
    this.list_of_pp_laoded[i]=true;
  }

}