import { Component,Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-popup-artwork',
  templateUrl: './popup-artwork.component.html',
  styleUrls: ['./popup-artwork.component.scss'],
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
export class PopupArtworkComponent implements OnInit {

  constructor(
    private router:Router,
    public navbar: NavbarService,
    private location:Location,
    public dialogRef: MatDialogRef<PopupArtworkComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
     
  }

  format_input=this.data.format_input;
  id_input=this.data.id_input;
  title_input=this.data.title_input;
  category=this.data.category;
  current_url='';

  ngOnInit(){
    this.current_url=this.router.url;
  }
  
  remove_popup_artwork(event) {
    this.dialogRef.close();
    this.location.go(this.current_url);
    if(this.current_url.includes("home")){
      this.navbar.setActiveSection(0);
    }
    else if(this.current_url.includes("linkcollab")){
      this.navbar.setActiveSection(1);
    }
  }

  remove_popup_artwork_click(event){
    this.dialogRef.close();
    this.location.go(this.current_url);
    if(this.current_url.includes("home")){
      this.navbar.setActiveSection(0);
    }
    else if(this.current_url.includes("linkcollab")){
      this.navbar.setActiveSection(1);
    }
  }
}
