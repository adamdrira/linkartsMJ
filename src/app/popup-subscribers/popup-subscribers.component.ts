import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, HostListener, ViewChild, Input, Inject } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-popup-subscribers',
  templateUrl: './popup-subscribers.component.html',
  styleUrls: ['./popup-subscribers.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class PopupSubscribersComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupSubscribersComponent>,
    private cd:ChangeDetectorRef,
    private rd:Renderer2,
    private sanitizer:DomSanitizer,
    private Subscribing_service:Subscribing_service,
    public dialog: MatDialog,
    private Profile_Edition_Service:Profile_Edition_Service,



    @Inject(MAT_DIALOG_DATA) public data: any) {
    

  }

  list_of_subscribers=this.data.subscribers;
  
  list_of_subscribers_information:any[]=[];
  list_of_check_subscribtion:any[]=[];
  list_of_profile_pictures:SafeUrl[]=[];
  subscribtion_info_added=false;
  visitor_id:number;

  ngOnInit(): void {
    console.log(this.list_of_subscribers);
    let n=this.list_of_subscribers.length;

    for (let i=0;i<n;i++){
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_subscribers[i].id_user).subscribe(r=>{
        this.list_of_subscribers_information[i]=r[0];
        this.Subscribing_service.check_if_visitor_susbcribed(r[0].id).subscribe(information=>{
          if(information[0].value){
            this.list_of_check_subscribtion[i]=true;
          }
          else{
            this.list_of_check_subscribtion[i]=false;
          }
          console.log(this.list_of_subscribers_information[i])
          this.Profile_Edition_Service.retrieve_profile_picture( r[0].id).subscribe(r=> {
            let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_profile_pictures[i] = SafeURL;
            if(i==n-1){
              this.subscribtion_info_added=true;
            }
          });
          
        });
      })
      
    }
    
  }

  subscribtion(i){
    if(!this.list_of_check_subscribtion[i]){
      this.Subscribing_service.subscribe_to_a_user(this.list_of_subscribers_information[i].id).subscribe(information=>{
        this.list_of_check_subscribtion[i]=true;
      });
    }
    if(this.list_of_check_subscribtion[i]){
      this.Subscribing_service.remove_subscribtion(this.list_of_subscribers_information[i].id).subscribe(information=>{
        console.log(information);
        this.list_of_check_subscribtion[i]=false;
      });
    }
  }

  get_user_link(i:number) {
    return "/account/"+ this.list_of_subscribers_information[i].nickname +"/"+ this.list_of_subscribers_information[i].id;
  }


}
