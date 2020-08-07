import { Component, OnInit, Renderer2, ElementRef, ComponentFactoryResolver, ChangeDetectorRef, ViewContainerRef, Output, EventEmitter, HostListener, ViewChild, Input, Inject } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-popup-likes-and-loves',
  templateUrl: './popup-likes-and-loves.component.html',
  styleUrls: ['./popup-likes-and-loves.component.scss']
})
export class PopupLikesAndLovesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupLikesAndLovesComponent>,
    private cd:ChangeDetectorRef,
    private rd:Renderer2,
    private sanitizer:DomSanitizer,
    private Subscribing_service:Subscribing_service,
    public dialog: MatDialog,
    private Profile_Edition_Service:Profile_Edition_Service,



    @Inject(MAT_DIALOG_DATA) public data: any) {
    

  }

  list_of_users_ids=this.data.list_of_users_ids;
  type_of_account=this.data.type_of_account;
  list_of_users_information:any[]=[];
  list_of_check_subscribtion:any[]=[];
  list_of_profile_pictures:SafeUrl[]=[];
  pp_is_laoded:any[]=[];
  subscribtion_info_added=false;
  visitor_id:number;
  title:string;

  ngOnInit(): void {

    if(this.data.title=="likes"){
      this.title="Liste des mentions j'aime"
    }
    else if(this.data.title=="loves"){
        this.title="Liste des mentions j'adore"
    }

    console.log(this.list_of_users_ids)

    let n=this.list_of_users_ids.length;
    for (let i=0;i<n;i++){
      this.Profile_Edition_Service.retrieve_profile_data(this.list_of_users_ids[i]).subscribe(r=>{
        this.list_of_users_information[i]=r[0];
        this.Subscribing_service.check_if_visitor_susbcribed(r[0].id).subscribe(information=>{
          if(information[0].value){
            this.list_of_check_subscribtion[i]=true;
          }
          else{
            this.list_of_check_subscribtion[i]=false;
          }
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
    if(this.type_of_account=="visitor"){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir vous abonner'},
      });
    }
    else{
      if(!this.list_of_check_subscribtion[i]){
        this.Subscribing_service.subscribe_to_a_user(this.list_of_users_ids[i]).subscribe(information=>{
          this.list_of_check_subscribtion[i]=true;
        });
      }
      if(this.list_of_check_subscribtion[i]){
        this.Subscribing_service.remove_subscribtion(this.list_of_users_ids[i]).subscribe(information=>{
          this.list_of_check_subscribtion[i]=false;
        });
      }
    }

    
  }


  pp_loaded(i){
    this.pp_is_laoded[i]=true;
  }

}