import { Component, OnInit, Inject,AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare var $:any;

@Component({
  selector: 'app-popup-confirmation',
  templateUrl: './popup-confirmation.component.html',
  styleUrls: ['./popup-confirmation.component.scss']
})
export class PopupConfirmationComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PopupConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;
     }


  show_icon=false;
  ngOnInit(){

  }

  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
  }

  cancel() {
    this.dialogRef.close();
  }


}
