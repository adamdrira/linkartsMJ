import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Ads_service} from '../services/ads.service';
import {NotificationsService} from '../services/notifications.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {ChatService} from '../services/chat.service';
import { Router } from '@angular/router';

import { pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-popup-ad-write-responses',
  templateUrl: './popup-ad-write-responses.component.html',
  styleUrls: ['./popup-ad-write-responses.component.scss']
})
export class PopupAdWriteResponsesComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    private NotificationsService:NotificationsService,
    private chatService:ChatService,
    public dialog: MatDialog,
    private Ads_service:Ads_service,
    private router:Router,
    private navbar: NavbarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }

  show_icon=false;
  ngOnInit() {
    let THIS=this;
 
    this.createFormControlsAds();
    this.createFormAd();
  };

  response_group: FormGroup;
  response: FormControl;
  pictures_uploaded=false;
  attachments_uploaded=false;
  id_ad_response:number=0;
  begin_download_attachments=false;
  display_loading=false;
  
  createFormControlsAds() {
    this.response = new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2000), Validators.pattern( pattern("text_with_linebreaks") ) ]);
  }

  createFormAd() {
    this.response_group = new FormGroup({
      response: this.response,
    });
  }


  all_attachments_uploaded( event: boolean) {
    this.attachments_uploaded = event;
    this.Profile_Edition_Service.get_current_user().subscribe(s=>{
      console.log(this.data.item.id_user);
      console.log(this.data.item)
      let visitor_name=s[0].firstname + ' ' + s[0].lastname;
      this.NotificationsService.add_notification('ad_response',s[0].id,visitor_name,this.data.item.id_user,'ad',this.data.item.title,this.data.item.type_of_project,this.data.item.id,0,null,false,null).subscribe(l=>{
        let message_to_send ={
          for_notifications:true,
          type:"ad_response",
          id_user_name:visitor_name,
          id_user:s[0].id, 
          id_receiver:this.data.item.id_user,
          publication_category:'ad',
          publication_name:this.data.item.title,
          format:this.data.item.type_of_project,
          publication_id:this.data.item.id,
          chapter_number:0,
          information:null,
          status:"unchecked",
          is_comment_answer:false,
          comment_id:null,
        }
        this.chatService.messages.next(message_to_send);
        console.log("response sent");
        console.log(message_to_send)
        this.Ads_service.send_email_for_ad_answer(visitor_name,this.data.item.id,this.data.item.id_user,this.data.item.title).subscribe(l=>{
          console.log(l);
          this.display_loading=false;
          location.reload();
        })
        
      })
    })
    

  }

  send_response(){

    if( !this.response_group.valid ) {
      return;
    }
    
    this.Ads_service.add_ad_response(this.data.item.id,this.response_group.value.response.replace(/\n\s*\n\s*\n/g, '\n\n')).subscribe(r=>{
      this.id_ad_response=r[0].id
      this.begin_download_attachments=true;
      this.display_loading=true;
    })
  }

}
