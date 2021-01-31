import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, HostListener, ViewChild, Input, Inject } from '@angular/core';


import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';

declare var $: any;

@Component({
  selector: 'app-popup-artwork-data',
  templateUrl: './popup-artwork-data.component.html',
  styleUrls: ['./popup-artwork-data.component.scss'],
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
export class PopupArtworkDataComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupArtworkDataComponent>,
    private cd:ChangeDetectorRef,
    private rd:Renderer2,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,


    private navbar: NavbarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })

  }

  title=this.data.title;
  category=this.data.category;
  highlight=this.data.highlight;
  style=this.data.style;
  type=this.data.type;
  firsttag=this.data.firsttag;
  secondtag=this.data.secondtag;
  thirdtag=this.data.thirdtag;
  
  
  get_french_style(s: string) {
    if(s=='Poetry') {
      return 'Poésie';
    }
    else if(s=='Illustrated novel') {
      return 'Roman illustré';
    }
    else if(s=='Scenario') {
      return 'Scénario';
    }
    else {
      return s;
    }
  }


  get_link() {
    if(this.category != 'Writing') {
      return "/main-research-style-and-tag/1/"+this.category+"/" + this.style + "/all";
    }
    else {
      return "/main-research-style-and-tag/1/"+this.category+"/" + this.get_french_style(this.style) + "/all";
    }
  };
  get_style_link(i: number) {

    let link_style:string;

    if(this.category != 'Writing') {
      link_style = this.style;
    }
    else {
      link_style = this.get_french_style(this.style);
    }

    if( i == 0 ) {
      return "/main-research-style-and-tag/1/"+this.category+"/" + link_style + "/" + this.firsttag;
    }
    if( i == 1 ) {
      return "/main-research-style-and-tag/1/"+this.category+"/" + link_style + "/" + this.secondtag;
    }
    if( i == 2 ) {
      return "/main-research-style-and-tag/1/"+this.category+"/" + link_style + "/" + this.thirdtag;
    }
  }


  show_icon=false;
  ngOnInit() {
    let THIS=this;
    
  }

}
