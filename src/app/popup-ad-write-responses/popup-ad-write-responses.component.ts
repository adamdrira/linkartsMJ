import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Ads_service} from '../services/ads.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popup-ad-write-responses',
  templateUrl: './popup-ad-write-responses.component.html',
  styleUrls: ['./popup-ad-write-responses.component.scss']
})
export class PopupAdWriteResponsesComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private Ads_service:Ads_service,
    private router:Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
 
    this.createFormControlsAds();
    this.createFormAd();
  };

  response_group: FormGroup;
  response: FormControl;
  pictures_uploaded=false;
  attachments_uploaded=false;
  id_ad_response:number=0;
  begin_download_attachments=false;

  show_error:boolean = false;
  
  createFormControlsAds() {
    this.response = new FormControl('')}

  createFormAd() {
    this.response_group = new FormGroup({
      response: this.response,
    });
  }

  /*all_pictures_uploaded( event: boolean) {
    this.pictures_uploaded = event;

    if(this.attachments_uploaded && this.pictures_uploaded){
      console.log("tous les téléchargments sont finis/ pictures");
      location.reload();
    }

    if(!event) {
      alert("problème lors du télechargement");
    }

  }*/

  all_attachments_uploaded( event: boolean) {
    this.attachments_uploaded = event;
    location.reload();

  }

  send_response(){

    if( !this.response_group.valid ) {
      this.show_error = true;
      return;
    }
    
    this.Ads_service.add_ad_response(this.data.item.id,this.response_group.value.response).subscribe(r=>{
      this.id_ad_response=r[0].id
      this.begin_download_attachments=true;
    })
  }

}
