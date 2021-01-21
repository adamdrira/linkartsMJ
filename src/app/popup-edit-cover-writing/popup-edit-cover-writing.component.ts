import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';


import { Writing_Upload_Service } from '../services/writing.service';
import { Writing_CoverService } from '../services/writing_cover.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';


declare var $:any;

@Component({
  selector: 'app-popup-edit-cover-writing',
  templateUrl: './popup-edit-cover-writing.component.html',
  styleUrls: ['./popup-edit-cover-writing.component.scss']
})
export class PopupEditCoverWritingComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupEditCoverWritingComponent>,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    private rd:Renderer2,
    private Writing_CoverService:Writing_CoverService,
    private Writing_Upload_Service:Writing_Upload_Service,

    
    public dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;
  }



  ngOnInit(): void {

  }


  ngAfterContentInit() {

    this.cd.detectChanges();
  }

  close_dialog(){
    if(!this.Writing_CoverService.get_confirmation()){
      this.Writing_CoverService.remove_cover_from_folder().subscribe(r=>{
        this.dialogRef.close();
      })
    }
    else{
      this.dialogRef.close();
    }
    
  }



  validateForm00() {
    
  if (this.Writing_CoverService.get_confirmation())  {
      this.Writing_CoverService.add_covername_to_sql(this.data.writing_id).subscribe(r=>{
        this.Writing_CoverService.remove_last_cover_from_folder(this.data.thumbnail_picture).subscribe(info=>{
          location.reload();
        });
      });
  }
  else {
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:false, text:'Veuillez télécharger et valider une photo pour la miniature'},
      panelClass: "popupConfirmationClass",
    });
  }

  }


}
