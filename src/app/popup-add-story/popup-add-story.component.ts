import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, HostListener, ViewChild, Input, Inject } from '@angular/core';


import { MatDialogRef } from '@angular/material/dialog';
declare var $: any;
@Component({
  selector: 'app-popup-add-story',
  templateUrl: './popup-add-story.component.html',
  styleUrls: ['./popup-add-story.component.scss']
})
export class PopupAddStoryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupAddStoryComponent>,
    ) { 
    dialogRef.disableClose = true;
  }


  ngOnInit(): void {
  }

  show_icon=false;
  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
  }



}
