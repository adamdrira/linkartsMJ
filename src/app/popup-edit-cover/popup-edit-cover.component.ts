import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_CoverService } from '../services/drawings_cover.service';

import { Writing_CoverService } from '../services/writing_cover.service';
import { Bd_CoverService } from '../services/comics_cover.service';
import { BdSerieService } from '../services/comics_serie.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

declare var $:any;
declare var Cropper;
const url_drawing = 'http://localhost:4600/routes/upload_cover_drawing_oneshot';

@Component({
  selector: 'app-popup-edit-cover',
  templateUrl: './popup-edit-cover.component.html',
  styleUrls: ['./popup-edit-cover.component.scss']
})
export class PopupEditCoverComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupEditCoverComponent>,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private BdSerieService:BdSerieService,
    private BdOneShotService:BdOneShotService,
    private Writing_CoverService:Writing_CoverService,
    private Bd_CoverService: Bd_CoverService,
    private Drawings_CoverService:Drawings_CoverService,
    public dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: any) {

      dialogRef.disableClose = true;
      
  }

  for_edition=true;
  ngOnInit(): void {

    console.log(this.data)
  
  }

 



}
