import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_CoverService } from '../services/drawings_cover.service';

import { Writing_CoverService } from '../services/writing_cover.service';
import { Bd_CoverService } from '../services/comics_cover.service';
import { BdSerieService } from '../services/comics_serie.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NavbarService } from '../services/navbar.service';



@Component({
  selector: 'app-popup-edit-cover',
  templateUrl: './popup-edit-cover.component.html',
  styleUrls: ['./popup-edit-cover.component.scss']
})
export class PopupEditCoverComponent {

  constructor(
    public dialogRef: MatDialogRef<PopupEditCoverComponent>,
    public dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: any,
    private navbar: NavbarService,) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      dialogRef.disableClose = true;
      
  }

  for_edition=true;
  show_icon=false;





}
