import { Component, OnInit, } from '@angular/core';


import { MatDialogRef } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';
declare var $: any;
@Component({
  selector: 'app-popup-add-story',
  templateUrl: './popup-add-story.component.html',
  styleUrls: ['./popup-add-story.component.scss']
})
export class PopupAddStoryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupAddStoryComponent>,
    private navbar: NavbarService,
    ) { 
    dialogRef.disableClose = true;
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }

  show_icon=false;
  ngOnInit() {
  }



}
