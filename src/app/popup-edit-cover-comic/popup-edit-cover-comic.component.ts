import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';


import { Bd_CoverService } from '../services/comics_cover.service';
import { BdSerieService } from '../services/comics_serie.service';
import { BdOneShotService } from '../services/comics_one_shot.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


declare var $:any;

@Component({
  selector: 'app-popup-edit-cover-comic',
  templateUrl: './popup-edit-cover-comic.component.html',
  styleUrls: ['./popup-edit-cover-comic.component.scss']
})
export class PopupEditCoverComicComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupEditCoverComicComponent>,
    private cd:ChangeDetectorRef,

    private BdSerieService:BdSerieService,
    private BdOneShotService:BdOneShotService,
    private Bd_CoverService: Bd_CoverService,
    public dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;
  }


  ngOnInit(): void {


    //ajouter la couleur en entrée dans data
    //this.f00.controls['f00Color'].setValue( this.data.color );
  }

  
 
  for_edition=true;
  close_dialog(){
      this.dialogRef.close();
    
  }




}
