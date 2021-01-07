import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-add-story',
  templateUrl: './popup-add-story.component.html',
  styleUrls: ['./popup-add-story.component.scss']
})
export class PopupAddStoryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupAddStoryComponent>,
    ) { 
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

}
