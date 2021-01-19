import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { pattern } from '../helpers/patterns';

@Component({
  selector: 'app-popup-chat-search',
  templateUrl: './popup-chat-search.component.html',
  styleUrls: ['./popup-chat-search.component.scss']
})
export class PopupChatSearchComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PopupChatSearchComponent,any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // redirect to home if already logged in
      dialogRef.disableClose = false;
    
    
  }

  searchForm: FormGroup;
  
  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.validate_all();
  }

  ngOnInit() {

    this.searchForm = this.formBuilder.group({
      search: ['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("text")),
        ]),
      ]
    });
    
  }

  validate_all() {
    if( this.searchForm.valid ) {
      this.dialogRef.close( this.searchForm.controls['search'].value );
    }
  }
  close_dialog(){
    this.dialogRef.close();
  }

}
