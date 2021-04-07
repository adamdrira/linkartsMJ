import { Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
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
