import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, HostListener, ViewChild, Input, Inject } from '@angular/core';


import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-popup-comments',
  templateUrl: './popup-comments.component.html',
  styleUrls: ['./popup-comments.component.scss'],
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
export class PopupCommentsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupCommentsComponent>,
    private cd:ChangeDetectorRef,
    private rd:Renderer2,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,



    @Inject(MAT_DIALOG_DATA) public data: any) {
    
      dialogRef.disableClose = true;

  }

  type_of_account=this.data.type_of_account;
  title=this.data.title;
  category=this.data.category;
  format=this.data.format;
  style=this.data.style;
  publication_id=this.data.publication_id;
  chapter_number=this.data.chapter_number;
  authorid=this.data.authorid;
  number_of_comments_to_show=this.data.number_of_comments_to_show;

  commentariesnumber:number;

  new_comment() {
    this.commentariesnumber++;
    this.cd.detectChanges();
  }

  removed_comment() {
    this.commentariesnumber--;
  }

  ngOnInit() {
    
  }


}
