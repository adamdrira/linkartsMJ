import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-popup-confirmation',
  templateUrl: './popup-confirmation.component.html',
  styleUrls: ['./popup-confirmation.component.scss']
})
export class PopupConfirmationComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PopupConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private navbar: NavbarService,) {
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

  cancel() {
    this.dialogRef.close();
  }


}
