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

  }


  ngOnInit(): void {


    //ajouter la couleur en entrée dans data
    //this.f00.controls['f00Color'].setValue( this.data.color );
  }

  
 


  validateForm00() {

    if ( this.Bd_CoverService.get_confirmation() && this.data.format == "one-shot" ) {
        this.Bd_CoverService.add_covername_to_sql2("One-shot",this.data.bd_id).subscribe(r=>{
          location.reload();
        });
    }

    else if ( this.Bd_CoverService.get_confirmation() && this.data.format == "serie" ) {
      this.Bd_CoverService.add_covername_to_sql2("Série",this.data.bd_id).subscribe(r=>{
        location.reload();
      });
    }

    else {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez télécharger et valider une photo pour la miniature'},
      });
    }

  }


}
